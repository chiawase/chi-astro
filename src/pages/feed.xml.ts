import { getCollection } from "astro:content";

import { SITE_TITLE, SITE_DESCRIPTION, SITE_AUTHOR } from "@consts";
import { prepareOgText } from "@utils/prepareOgText";

/**
 * Utility to clean up text
 */
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
  const feedUrl = new URL("/feed.xml", site).toString(); // always outputs to live feed URL

  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const numberOfLatestPostsToShow = 10;

  // Sort newest first (by publish date)
  const sorted = [...posts].sort((a, b) => {
    return b.data.pubDate.getTime() - a.data.pubDate.getTime();
  });

  const latest = sorted.slice(0, numberOfLatestPostsToShow);

  const entriesXml = latest
    .map((post) => {
      const postUrl = new URL(`/blog/${post.id}/`, site).toString();
      const title = post.data.title
        ? escapeXml(String(post.data.title))
        : "Chi's blog post";

      const summary = post.data.summary
        ? escapeXml(String(post.data.summary))
        : escapeXml(prepareOgText(post.body ?? "", { maxLength: 180 }));

      const published = post.data.pubDate.toISOString();
      const updated = (
        post.data.updatedDate ?? post.data.pubDate
      ).toISOString();

      return `<entry>
      <title>${title}</title>
      <link href="${postUrl}" />
      <published>${published}</published>
      <updated>${updated}</updated>
      <id>${postUrl}</id>
      <summary>${summary}</summary>
    </entry>`;
    })
    .join("");

  const newestDate =
    sorted.length > 0
      ? sorted[0].data.pubDate.toISOString()
      : new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
      <title>${escapeXml(SITE_TITLE)}</title>
      <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
      <link href="${feedUrl}" rel="self" />
      <link href="${site.toString()}" />
      <updated>${newestDate}</updated>
      <id>${site.toString()}</id>
      <author>
        <name>${escapeXml(SITE_AUTHOR.name)}</name>
      </author>${entriesXml}
    </feed>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
