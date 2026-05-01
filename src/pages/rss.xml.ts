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

interface Item {
  link: string;
  title: string;
  summary: string;
  tag: string;
  stream: "BLIP" | "BROADCAST";
  date: Date;
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? "";

  const blips = await getCollection("blips");
  const broadcasts = (await getCollection("broadcasts")).filter((e) => !e.data.draft);

  const items: Item[] = [
    ...blips.map((entry) => ({
      link: `${origin}/blips/${entry.id}`,
      title: entry.data.title,
      summary: entry.data.summary,
      tag: entry.data.tag,
      stream: "BLIP" as const,
      date: entry.data.date,
    })),
    ...broadcasts.map((entry) => ({
      link: `${origin}/broadcasts/${entry.id}`,
      title: entry.data.title,
      summary: entry.data.summary,
      tag: entry.data.tag,
      stream: "BROADCAST" as const,
      date: entry.data.date,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(profile.name)} // Station</title>
    <link>${origin}/station</link>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escape(profile.summary)}</description>
    <language>en-us</language>
${items
  .map(
    (item) => `    <item>
      <title>[${item.stream}] ${escape(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description>${escape(item.summary)}</description>
      <category>${escape(item.tag)}</category>
      <category>${item.stream}</category>
      <pubDate>${item.date.toUTCString()}</pubDate>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
