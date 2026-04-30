// Fetches the user's Letterboxd RSS feed and writes the latest 10 reviews
// to src/data/letterboxd.json. Falls back to existing JSON on failure.
//
// RSS schema: https://letterboxd.com/<user>/rss/
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const USER = "esoterikunt";
const LIMIT = 10;
const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(ROOT, "..", "src", "data", "letterboxd.json");

interface Film {
  title: string;
  year: string;
  rating: number | null;
  watchedDate: string;
  rewatch: boolean;
  link: string;
}

const tag = (xml: string, name: string): string | null => {
  const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return match ? match[1].trim() : null;
};

const cdata = (s: string | null): string =>
  s ? s.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim() : "";

const parseItems = (xml: string): Film[] => {
  const items: Film[] = [];
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  for (const match of blocks) {
    const block = match[1];
    if (items.length >= LIMIT) break;

    const title = cdata(tag(block, "title")) || "";
    const link = cdata(tag(block, "link")) || "";
    const watchedDate = cdata(tag(block, "letterboxd:watchedDate")) || "";
    const rewatchRaw = cdata(tag(block, "letterboxd:rewatch")) || "No";
    const ratingRaw = cdata(tag(block, "letterboxd:memberRating"));
    const filmYear = cdata(tag(block, "letterboxd:filmYear")) || "";

    if (!title) continue;

    const cleanTitle = title.replace(/\s+-\s+★+½?$/, "").replace(/\s+-\s+½$/, "");
    const titleNoYear = cleanTitle.replace(/,\s*\d{4}$/, "").trim();

    items.push({
      title: titleNoYear,
      year: filmYear,
      rating: ratingRaw ? parseFloat(ratingRaw) : null,
      watchedDate,
      rewatch: rewatchRaw === "Yes",
      link,
    });
  }
  return items;
};

const main = async () => {
  const url = `https://letterboxd.com/${USER}/rss/`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": `${USER}-dossier-build` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Letterboxd RSS ${res.status}`);
    const xml = await res.text();
    const films = parseItems(xml);
    writeFileSync(OUT, `${JSON.stringify(films, null, 2)}\n`);
    console.log(`letterboxd.json updated: ${films.length} entries`);
  } catch (err) {
    const previous = existsSync(OUT) ? readFileSync(OUT, "utf8") : null;
    console.warn(`letterboxd fetch failed: ${(err as Error).message}`);
    if (previous) console.warn("keeping previous letterboxd.json");
    else writeFileSync(OUT, "[]\n");
  }
};

main();
