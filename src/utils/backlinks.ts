import { getCollection } from "astro:content";

interface BacklinkEntry {
  id: string;
  title: string | null;
  url: string;
}

type BacklinkMap = Record<string, BacklinkEntry[]>;

/**
 * Scan all blog posts, get the internal links, and
 * return map of target post ID -> posts that link to it
 */
export async function buildBacklinkMap(): Promise<BacklinkMap> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const backlinkMap: BacklinkMap = {};

  // initialize all posts with empty arrays
  for (const post of posts) {
    backlinkMap[post.id] = [];
  }

  // For each post, extract the links and add to others' backlink arrays
  for (const post of posts) {
    if (!post.body) continue;

    // match internal links like /blog/some-post/ or /blog/some-post
    const internalLinkRegex = /\/blog\/([^/]+)\/?/g;
    let match;

    while ((match = internalLinkRegex.exec(post.body)) !== null) {
      const linkedId = match[1];

      if (backlinkMap[linkedId] && linkedId !== post.id) {
        backlinkMap[linkedId].push({
          id: post.id,
          title: post.data.title ?? null,
          url: `/blog/${post.id}/`,
        });
      }
    }
  }

  return backlinkMap;
}
