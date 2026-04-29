// Fetches the last 6 months of GitHub commit activity for the user
// and writes the bucketed counts to src/data/activity.json.
//
// Run via `pnpm run prebuild` (and locally any time you want to refresh).
// Falls back gracefully if rate-limited or offline — the existing JSON is kept.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const USER = "codeptor";
const MONTHS = 6;
const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(ROOT, "..", "src", "data", "activity.json");

const month = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

const monthKeys = (): string[] => {
  const now = new Date();
  const keys: string[] = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(month(d));
  }
  return keys;
};

interface CommitItem {
  commit?: { author?: { date?: string } };
}

interface SearchResponse {
  items?: CommitItem[];
}

const fetchSearchPage = async (page: number): Promise<CommitItem[]> => {
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - MONTHS);
  const q = encodeURIComponent(`author:${USER} author-date:>=${since.toISOString().slice(0, 10)}`);
  const url = `https://api.github.com/search/commits?q=${q}&sort=author-date&order=desc&per_page=100&page=${page}`;
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
  const keys = monthKeys();
  const counts: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));

  try {
    for (let page = 1; page <= 10; page++) {
      const items = await fetchSearchPage(page);
      if (items.length === 0) break;
      for (const item of items) {
        const date = item.commit?.author?.date;
        if (!date) continue;
        const key = month(new Date(date));
        if (key in counts) counts[key] += 1;
      }
      if (items.length < 100) break;
    }

    const buckets = keys.map((k) => counts[k]);
    writeFileSync(OUT, `${JSON.stringify(buckets)}\n`);
    console.log(`activity.json updated: [${buckets.join(", ")}]`);
  } catch (err) {
    const previous = existsSync(OUT) ? readFileSync(OUT, "utf8") : null;
    console.warn(`activity fetch failed: ${(err as Error).message}`);
    if (previous) console.warn("keeping previous activity.json");
    else writeFileSync(OUT, `${JSON.stringify(keys.map(() => 0))}\n`);
  }
};

main();
