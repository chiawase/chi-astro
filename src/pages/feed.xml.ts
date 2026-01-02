import { getCollection } from "astro:content";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";

import { SITE_TITLE, SITE_DESCRIPTION } from "@consts";

/** Match Eleventy template’s title fallback behavior */
function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, "");
}

function truncate(input: string, max = 60) {
  const s = input.trim().replace(/\s+/g, " ");
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "...";
}

/** Escape only where Atom requires text nodes to be safe */
function escapeXml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function markdownToHtml(markdown: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeRemoveComments)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
}

function toRfc3339(date: Date) {
  return date.toISOString();
}

export async function GET(context: { site: URL }) {
  const site = context.site;
  const feedUrl = new URL("/feed.xml", site).toString();

  // Adjust the filter to match your own draft/publish rules
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const numberOfLatestPostsToShow = 10;

  // Sort newest first
  const sorted = [...posts].sort((a, b) => {
    const da = new Date((a.data.pubDate ?? a.data.date) as any).getTime();
    const db = new Date((b.data.pubDate ?? b.data.date) as any).getTime();
    return db - da;
  });

  const latest = sorted.slice(0, numberOfLatestPostsToShow);

  const newestDate =
    latest.length > 0
      ? new Date((latest[0].data.pubDate ?? latest[0].data.date) as any)
      : new Date();

  const entriesXml = await Promise.all(
    latest.map(async (post) => {
      const postUrl = new URL(`/blog/${post.id}/`, site).toString();

      const html = await markdownToHtml(post.body);

      const fallbackTitle = truncate(stripHtml(html), 60);
      const title = post.data.title ? String(post.data.title) : fallbackTitle;

      const updated = new Date((post.data.pubDate ?? post.data.date) as any);

      return `
  <entry>
    <title>${escapeXml(title)}</title>
    <link href="${escapeXml(postUrl)}" />
    <updated>${escapeXml(toRfc3339(updated))}</updated>
    <id>${escapeXml(postUrl)}</id>
    <content type="html"><![CDATA[${html}]]></content>
  </entry>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>${escapeXml(SITE_TITLE)}</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${escapeXml(feedUrl)}" rel="self" />
  <link href="${escapeXml(site.toString())}" />
  <updated>${escapeXml(toRfc3339(newestDate))}</updated>
  <id>${escapeXml(site.toString())}</id>
  <author>
    <name>${escapeXml(SITE_TITLE)}</name>
  </author>${entriesXml.join("")}
</feed>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": "inline; filename=feed.xml",
    },
  });
}
