// Real-time commits feed for the manifest's "Recent Transmissions" ticker.
// Fetches the user's most recently pushed repos and grabs the latest commits
// from each, then returns the merged list. Edge-cached 60s so a push lands
// in the manifest within a minute, no rebuild needed.
import type { APIRoute } from "astro";

export const prerender = false;

const USER = "codeptor";
const LIMIT = 10;
const REPOS_TO_SCAN = 6;
const COMMITS_PER_REPO = 3;

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
    "User-Agent": `${USER}-dossier-runtime`,
  };
  const token = import.meta.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const fetchRepos = async (): Promise<RepoSummary[]> => {
  const url = `https://api.github.com/users/${USER}/repos?sort=pushed&per_page=20`;
  const res = await fetch(url, { headers: baseHeaders(), signal: AbortSignal.timeout(3500) });
  if (!res.ok) throw new Error(`repos ${res.status}`);
  const repos = (await res.json()) as RepoSummary[];
  return repos.filter((r) => !r.fork && !r.private).slice(0, REPOS_TO_SCAN);
};

const fetchRepoCommits = async (repo: string): Promise<OutCommit[]> => {
  const url = `https://api.github.com/repos/${USER}/${repo}/commits?per_page=${COMMITS_PER_REPO}`;
  try {
    const res = await fetch(url, { headers: baseHeaders(), signal: AbortSignal.timeout(3000) });
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
  } catch {
    return [];
  }
};

export const GET: APIRoute = async () => {
  try {
    const repos = await fetchRepos();
    const all = (await Promise.all(repos.map((r) => fetchRepoCommits(r.name)))).flat();
    all.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const out = all.slice(0, LIMIT);
    return new Response(JSON.stringify(out), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        // 60s fresh, 10min stale-while-revalidate. Fresh within 60s of any push.
        "cache-control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 502,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
};
