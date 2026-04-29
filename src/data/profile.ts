// "esoteric" → International Morse Code
// e=. s=... o=--- t=- e=. r=.-. i=.. c=-.-.
const ESOTERIC_MORSE = ". ... --- - . .-. .. -.-.";

// Injected at build time (see scripts/build.sh / vite define). Falls back to "DEV" locally.
const GIT_SHA = (typeof __GIT_SHA__ !== "undefined" ? __GIT_SHA__ : "DEV") as string;

export const profile = {
  handle: "bhanueso",
  name: "Bhanu",
  id: ESOTERIC_MORSE,
  // Static fallback — replaced at runtime by the visitor's IP-geolocated city
  // via /api/location.json (Vercel edge headers).
  location: "EARTH",
  status: "ACTIVE_BUILD",
  year: "2026",
  revision: "REV_2026.04",
  checksum: `BHN.${GIT_SHA}`,
  summary:
    "Creative frontend engineer at the intersection of brutalist design, generative physics, and scalable architecture.",
  dossierHref: "/bhanu-dossier.pdf",
  email: "bhanu9112002@gmail.com",
  socials: [
    { label: "github.com/codeptor", href: "https://github.com/codeptor", primary: true },
    { label: "x.com/esotericfrr", href: "https://x.com/esotericfrr", primary: true },
    { label: "linkedin.com/in/bhanu911", href: "https://www.linkedin.com/in/bhanu911", primary: true },
    { label: "instagram.com/esot3rikunt", href: "https://instagram.com/esot3rikunt" },
    { label: "letterboxd/esoterikunt", href: "https://letterboxd.com/esoterikunt/" },
    { label: "last.fm/esoterikunt", href: "https://www.last.fm/user/esoterikunt" },
    { label: "spotify.bhanueso.dev", href: "https://spotify.bhanueso.dev" },
  ],
};

export const history = [
  {
    role: "INDEPENDENT ENGINEER",
    org: "client work — landing pages, scraping pipelines, web apps",
    year: "2026",
  },
  {
    role: "SOFTWARE ENGINEER",
    org: "Neolytics — RAG analytics, FastAPI, Redis caching",
    year: "2025",
  },
  {
    role: "RESEARCH INTERN",
    org: "SRMIST — genomic ETL pipelines, LoRA fine-tuning",
    year: "2024",
  },
  {
    role: "APPLICATION DEVELOPER",
    org: "CamaSleep — edge ML on Jetson, TensorRT",
    year: "2024",
  },
];

export const assets = [
  {
    name: "ASTROLABE",
    description: "Pioneer-plaque-style pulsar map generator from any star.",
    href: "https://astrolabe.bhanueso.dev",
  },
  {
    name: "KHARCHA",
    description: "Public AI usage dashboard for Claude Code, Codex, OpenCode, Kimi.",
    href: "https://kharcha.bhanueso.dev",
  },
  {
    name: "DITHERED",
    description: "Creative studio for ASCII, dithering, and shader pipelines.",
    href: "https://dithered.bhanueso.dev",
  },
];

export const capabilities: [string, string][] = [
  ["TYPESCRIPT", "LVL_5"],
  ["NEXT.JS", "LVL_5"],
  ["DESIGN", "LVL_5"],
  ["MOTION", "LVL_4"],
  ["SHADERS", "LVL_4"],
  ["THREE.JS", "LVL_4"],
  ["TAILWIND", "LVL_4"],
  ["PYTHON", "LVL_4"],
];

// Field-log entries live as MDX in src/content/thoughts/*.mdx.
// Loaded via getCollection("thoughts") wherever needed (ThoughtsSheet,
// rss.xml, the manifest stat tile).

export const artifacts = [
  {
    name: "SIGNUM",
    year: "2026",
    description: "Personal sigil and motion identity experiments.",
    href: "https://github.com/Codeptor/signum",
  },
  {
    name: "ASTROLABE",
    year: "2026",
    description: "Pioneer-plaque-style pulsar map generator — pick any star in the galaxy and get a triangulation map.",
    href: "https://astrolabe.bhanueso.dev",
  },
  {
    name: "KHARCHA",
    year: "2026",
    description: "Public AI usage dashboard aggregating Claude Code, Codex, OpenCode, and Kimi.",
    href: "https://kharcha.bhanueso.dev",
  },
  {
    name: "DITHERED",
    year: "2026",
    description: "Photo and video studio for ASCII, dithered visuals, and shader effects with PNG / MP4 / GIF export.",
    href: "https://dithered.bhanueso.dev",
  },
  {
    name: "GLYPH",
    year: "2026",
    description: "WebGL and canvas experiments for character-based rendering.",
    href: "https://glyph.bhanueso.dev",
  },
  {
    name: "MAUSAM",
    year: "2026",
    description: "Beautiful weather in your terminal — Rust CLI tuned for fast daily checks.",
    href: "https://github.com/codeptor/mausam",
  },
  {
    name: "WEZTERM PRESENCE",
    year: "2026",
    description: "Discord Rich Presence for WezTerm — shows what you are doing in your terminal on your profile.",
    href: "https://github.com/Codeptor/wezterm-presence",
  },
  {
    name: "HYDROGEN",
    year: "2026",
    description: "Showcase site for the design language — the ruleset that emerged from astrolabe and kharcha.",
    href: "https://github.com/codeptor/hydrogen",
  },
];

// Stats are computed at render-time in ManifestSheet.astro since the THOUGHTS
// count comes from the content collection (only readable from .astro files).

// Filled at build time by scripts/fetch-activity.ts → src/data/activity.json.
// Falls back to zeros if the fetch fails or hasn't run yet.
export { default as activity } from "./activity.json";
