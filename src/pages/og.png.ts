import { ImageResponse } from "@vercel/og";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { profile } from "@/data/profile";

export const prerender = false;

interface OgContent {
  title: string;
  subtitle: string;
  meta: string;
}

const buildContent = async (slug: string | null): Promise<OgContent> => {
  if (slug) {
    try {
      const entries = await getCollection("thoughts");
      const entry = entries.find((e) => e.id === slug);
      if (entry) {
        const date = entry.data.date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        return {
          title: entry.data.title,
          subtitle: entry.data.summary,
          meta: `Field Log // ${entry.data.tag.toUpperCase()} // ${date.toUpperCase()}`,
        };
      }
    } catch {
      /* fall through */
    }
  }
  return {
    title: "Operational\nManifest",
    subtitle: profile.summary,
    meta: `Subject: ${profile.name.toUpperCase()}`,
  };
};

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get("slug");
  const content = await buildContent(slug);
  const titleLines = content.title.split("\n");

  const html = {
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at 20% -10%, rgba(241,243,220,0.10), transparent 40%), linear-gradient(180deg, #263f2b, #1d3324)",
        color: "#f1f3dc",
        padding: "64px 72px",
        fontFamily: "monospace",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column", maxWidth: "76%" },
                  children: [
                    ...titleLines.map((line) => ({
                      type: "div",
                      props: {
                        style: {
                          fontSize: titleLines.length <= 2 ? 80 : 56,
                          lineHeight: 0.95,
                          letterSpacing: "-0.04em",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        },
                        children: line,
                      },
                    })),
                    {
                      type: "div",
                      props: {
                        style: {
                          marginTop: 18,
                          color: "rgba(241,243,220,0.55)",
                          fontSize: 18,
                          letterSpacing: "0.28em",
                          textTransform: "uppercase",
                        },
                        children: content.meta,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    padding: "10px 14px",
                    border: "1px solid rgba(241,243,220,0.55)",
                    color: "rgba(241,243,220,0.85)",
                    fontSize: 16,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  },
                  children: "SPEC_ARCHIVE",
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              borderTop: "2px solid rgba(241,243,220,0.4)",
              paddingTop: 28,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 28,
                    lineHeight: 1.3,
                    color: "rgba(241,243,220,0.92)",
                  },
                  children: content.subtitle,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    color: "rgba(241,243,220,0.55)",
                    fontSize: 16,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                  },
                  children: [
                    { type: "div", props: { children: `// ${profile.checksum}` } },
                    { type: "div", props: { children: `${profile.handle} // ${profile.year}` } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  } as any;

  return new ImageResponse(html, { width: 1200, height: 630 });
};
