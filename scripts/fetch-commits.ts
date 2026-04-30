// Fetches the latest 10 public commits authored by the user across all
// repos via GitHub's commit-search API. Writes to src/data/commits.json.
// Run via `pnpm run prebuild`. Falls back to existing JSON on failure.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const USER = "codeptor";
const LIMIT = 10;
const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(ROOT, "..", "src", "data", "commits.json");

interface CommitItem {
  sha?: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: { date?: string };
  };
  repository?: { name?: string; full_name?: string };
}

interface SearchResponse {
  items?: CommitItem[];
}

const fetchPage = async (): Promise<CommitItem[]> => {
  const q = encodeURIComponent(`author:${USER}`);
  const url = `https://api.github.com/search/commits?q=${q}&sort=author-date&order=desc&per_page=${LIMIT}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.cloak-preview+json",
    "User-Agent": `${USER}-dossier`,
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub search ${res.status}: ${await res.text().catch(() => "")}`);
  const json = (await res.json()) as SearchResponse;
  return json.items ?? [];
};

const main = async () => {
  try {
    const items = await fetchPage();
    const summary = items
      .filter((i) => i.commit?.message && i.repository?.name)
      .map((i) => {
        const message = (i.commit!.message as string).split("\n")[0].trim().slice(0, 80);
        return {
          repo: i.repository!.name as string,
          sha: (i.sha as string).slice(0, 7),
          message,
          date: i.commit!.author?.date ?? "",
        };
      });
    writeFileSync(OUT, `${JSON.stringify(summary, null, 2)}\n`);
    console.log(`commits.json updated: ${summary.length} entries`);
  } catch (err) {
    const previous = existsSync(OUT) ? readFileSync(OUT, "utf8") : null;
    console.warn(`commit fetch failed: ${(err as Error).message}`);
    if (previous) console.warn("keeping previous commits.json");
    else writeFileSync(OUT, "[]\n");
  }
};

main();
