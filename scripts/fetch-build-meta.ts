// Writes build-time metadata (timestamp, sha, last commit summary) to
// src/data/build.json so /pulse and /colophon can render real numbers.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(ROOT, "..", "src", "data", "build.json");
const COMMITS_PATH = resolve(ROOT, "..", "src", "data", "commits.json");

const safe = (cmd: string, args: string[]): string => {
  try {
    return execFileSync(cmd, args, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
};

const main = () => {
  const now = new Date();
  const sha =
    safe("git", ["rev-parse", "--short=7", "HEAD"]) ||
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
    "DEV";
  const branch =
    safe("git", ["rev-parse", "--abbrev-ref", "HEAD"]) ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "master";

  let lastCommit: { sha: string; message: string; date: string } | null = null;
  if (existsSync(COMMITS_PATH)) {
    try {
      const commits = JSON.parse(readFileSync(COMMITS_PATH, "utf8"));
      if (Array.isArray(commits) && commits.length > 0) {
        const c = commits[0];
        lastCommit = { sha: c.sha, message: c.message, date: c.date };
      }
    } catch {
      /* ignore */
    }
  }

  const meta = {
    sha,
    branch,
    builtAt: now.toISOString(),
    builtAtHuman: now.toUTCString(),
    lastCommit,
  };

  writeFileSync(OUT, `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`build.json updated: sha=${sha} built=${meta.builtAt}`);
};

main();
