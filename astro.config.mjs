import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const gitSha = (() => {
  try {
    return execFileSync("git", ["rev-parse", "--short=7", "HEAD"], {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "DEV";
  }
})();

export default defineConfig({
  output: "static",
  site: "https://bhanueso.dev",
  adapter: vercel(),
  integrations: [mdx(), react()],
  devToolbar: { enabled: false },
  // Disable Shiki — it emits inline `style="background-color: ..."` that
  // overrides our themed --code-bg. Plain mono code blocks look right on
  // every theme and match the dossier aesthetic.
  markdown: {
    syntaxHighlight: false,
  },
  vite: {
    define: {
      __GIT_SHA__: JSON.stringify(gitSha),
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
