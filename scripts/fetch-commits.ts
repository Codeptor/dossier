// Fetches the user's most recent public commits without GitHub's commit-search
// indexing latency. Strategy: list the user's repos sorted by `pushed`, then
// for the top few recently-pushed repos pull the latest 2 commits each. Merge,
// sort by author/committer date, take the newest LIMIT.
//
// Run via `pnpm run prebuild`. Falls back to existing JSON on failure.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const USER = "codeptor";
const LIMIT = 10;
const REPOS_TO_SCAN = 6;
const COMMITS_PER_REPO = 3;
const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(ROOT, "..", "src", "data", "commits.json");

interface RepoSummary {
  name: string;
  pushed_at: string;
  fork?: boolean;
  private?: boolean;
}

interface CommitItem {
  sha: string;
  commit?: {
    message?: string;
    author?: { date?: string };
    committer?: { date?: string };
  };
}

interface OutCommit {
  repo: string;
  sha: string;
  message: string;
  date: string;
}

const baseHeaders = (): Record<string, string> => {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": `${USER}-dossier`,
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
};

const fetchRepos = async (): Promise<RepoSummary[]> => {
  const url = `https://api.github.com/users/${USER}/repos?sort=pushed&per_page=20`;
  const res = await fetch(url, { headers: baseHeaders() });
  if (!res.ok) throw new Error(`repos ${res.status}`);
  const repos = (await res.json()) as RepoSummary[];
  return repos.filter((r) => !r.fork && !r.private).slice(0, REPOS_TO_SCAN);
};

const fetchRepoCommits = async (repo: string): Promise<OutCommit[]> => {
  const url = `https://api.github.com/repos/${USER}/${repo}/commits?per_page=${COMMITS_PER_REPO}`;
  const res = await fetch(url, { headers: baseHeaders() });
  if (!res.ok) return [];
  const commits = (await res.json()) as CommitItem[];
  return commits
    .filter((c) => c.sha && c.commit?.message)
    .map((c) => ({
      repo,
      sha: c.sha.slice(0, 7),
      message: (c.commit!.message as string).split("\n")[0].trim().slice(0, 80),
      date: c.commit?.author?.date ?? c.commit?.committer?.date ?? "",
    }));
};

const main = async () => {
  try {
    const repos = await fetchRepos();
    const all = (await Promise.all(repos.map((r) => fetchRepoCommits(r.name)))).flat();
    all.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const out = all.slice(0, LIMIT);
    writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
    console.log(`commits.json updated: ${out.length} entries (across ${repos.length} repos)`);
  } catch (err) {
    const previous = existsSync(OUT) ? readFileSync(OUT, "utf8") : null;
    console.warn(`commit fetch failed: ${(err as Error).message}`);
    if (previous) console.warn("keeping previous commits.json");
    else writeFileSync(OUT, "[]\n");
  }
};

main();
