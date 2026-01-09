import { getCollection, render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";

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

function makeFeedSafeHtml(html: string) {
  let out = html;

  // 1) Remove any scripts (feed readers often strip them, and some stop rendering after them)
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<script\b[^>]*\/>/gi, ""); // self-closing

  // 2) Replace <lite-youtube videoid="...">...</lite-youtube> with a simple link
  out = out.replace(
    /<lite-youtube\b[^>]*\bvideoid=["']([^"']+)["'][^>]*>[\s\S]*?<\/lite-youtube>/gi,
    (_m, id) =>
      `<p><a href="https://www.youtube.com/watch?v=${id}">Watch on YouTube</a></p>`,
  );

  // If it's self-closing (rare, but safe)
  out = out.replace(
    /<lite-youtube\b[^>]*\bvideoid=["']([^"']+)["'][^>]*\/>/gi,
    (_m, id) =>
      `<p><a href="https://www.youtube.com/watch?v=${id}">Watch on YouTube</a></p>`,
  );

  // 3) As a final safety net, remove any remaining iframes
  out = out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "");
  out = out.replace(/<iframe\b[^>]*\/>/gi, "");

  return out;
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

export async function GET(context: { site: URL }) {
  const { site } = context;
  const feedUrl = new URL("/feed.xml", site).toString();

  // Container needed to render MDX <Content /> to an HTML string
  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const numberOfLatestPostsToShow = 10;

  // Sort newest first (by publish date)
  const sorted = [...posts].sort((a, b) => {
    return b.data.pubDate.getTime() - a.data.pubDate.getTime();
  });

  const latest = sorted.slice(0, numberOfLatestPostsToShow);

  // Feed-level updated: latest updatedDate in the set
  const newestDate =
    latest.length > 0
      ? new Date(Math.max(...latest.map((p) => p.data.updatedDate.getTime())))
      : new Date();

  const entriesXml = await Promise.all(
    latest.map(async (post) => {
      const postUrl = new URL(`/blog/${post.id}/`, site).toString();

      // Compile MD/MDX via content collections…
      const { Content } = await render(post);

      // …then render to HTML string (so MDX imports/components don’t leak)
      const rawHtml = await container.renderToString(Content);
      const html = makeFeedSafeHtml(rawHtml);

      const fallbackTitle = truncate(stripHtml(html), 60);
      const title = post.data.title ? String(post.data.title) : fallbackTitle;

      const published = post.data.pubDate.toISOString();
      const updated = post.data.updatedDate.toISOString();

      return `
  <entry>
    <title>${escapeXml(title)}</title>
    <link href="${escapeXml(postUrl)}" />
    <published>${published}</published>
    <updated>${updated}</updated>
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
  <updated>${newestDate.toISOString()}</updated>
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
