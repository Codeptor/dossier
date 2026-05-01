// Real-time monthly commit-count buckets for the manifest sparkline.
// Uses the GitHub commit-search API (which has minutes-to-hours of indexing
// latency, but that's fine here — the bars represent monthly totals so a
// few hours of lag on the freshest commits is invisible at this resolution).
// Edge-cached 5 minutes.
import type { APIRoute } from "astro";

export const prerender = false;

const USER = "codeptor";
const MONTHS = 6;

interface CommitItem {
  commit?: { author?: { date?: string } };
}
interface SearchResponse {
  items?: CommitItem[];
}

const ymKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

const monthKeys = (): string[] => {
  const now = new Date();
  const keys: string[] = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(ymKey(d));
  }
  return keys;
};

const fetchPage = async (page: number): Promise<CommitItem[]> => {
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - MONTHS);
  const q = encodeURIComponent(
    `author:${USER} author-date:>=${since.toISOString().slice(0, 10)}`,
  );
  const url = `https://api.github.com/search/commits?q=${q}&sort=author-date&order=desc&per_page=100&page=${page}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.cloak-preview+json",
    "User-Agent": `${USER}-dossier-runtime`,
  };
  const token = import.meta.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error(`search/commits ${res.status}`);
  const json = (await res.json()) as SearchResponse;
  return json.items ?? [];
};

export const GET: APIRoute = async () => {
  const keys = monthKeys();
  const counts: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
  try {
    for (let page = 1; page <= 5; page++) {
      const items = await fetchPage(page);
      if (items.length === 0) break;
      for (const item of items) {
        const date = item.commit?.author?.date;
        if (!date) continue;
        const key = ymKey(new Date(date));
        if (key in counts) counts[key] += 1;
      }
      if (items.length < 100) break;
    }
    const buckets = keys.map((k) => counts[k]);
    return new Response(JSON.stringify({ buckets, months: keys }), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        // 5 min fresh, 1 hour stale-while-revalidate. Monthly buckets shift
        // slowly so this cache window is comfortable.
        "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
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
