import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { profile } from "@/data/profile";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? "";
  const entries = (await getCollection("thoughts")).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const items = entries
    .map((entry) => {
      const link = `${origin}/thoughts/${entry.id}`;
      const pubDate = entry.data.date.toUTCString();
      return `    <item>
      <title>${escape(entry.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escape(entry.data.summary)}</description>
      <category>${escape(entry.data.tag)}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(profile.name)} // Field Log</title>
    <link>${origin}/thoughts</link>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escape(profile.summary)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
