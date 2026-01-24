import fs from "node:fs/promises";
import path from "node:path";

import { getCollection } from "astro:content";

import { extractFirstSection } from "@utils/extractFirstSection";

const MANGA_DIR = "./src/content/manga";
async function getFileMtime(id: string): Promise<Date> {
  const fullPath = path.join(MANGA_DIR, id);

  try {
    await fs.access(fullPath);
    const stats = await fs.stat(fullPath);
    return stats.mtime;
  } catch {
    const files = await fs.readdir(MANGA_DIR);
    const matchingFile = files.find(
      (f) =>
        f.replace(/\.mdx?$/, "").toLowerCase() ===
        id.replace(/\.mdx?$/, "").toLowerCase(),
    );
    if (matchingFile) {
      const stats = await fs.stat(path.join(MANGA_DIR, matchingFile));
      return stats.mtime;
    }
    return new Date(0);
  }
}

export async function getRecentManga() {
  const mangaEntries = await getCollection("manga");
  const mangaProcessed = await Promise.all(
    mangaEntries.map(async (entry) => {
      const mtime = await getFileMtime(entry.id);

      let section = "";
      try {
        const fullPath = path.join(MANGA_DIR, entry.data.title + ".md");
        const content = await fs.readFile(fullPath, "utf-8");
        section = extractFirstSection(content);
      } catch {
        section = "";
      }

      return {
        id: entry.id,
        url: entry.data.url,
        title: entry.data.title,
        latestChapter: entry.data.latestChapter,
        status: entry.data.status,
        mtime,
        section,
      };
    }),
  );
  mangaProcessed.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  return {
    recentReading: mangaProcessed
      .filter((m) => m.status === "reading")
      .slice(0, 5),
    recentFinished: mangaProcessed
      .filter((m) => m.status === "finished")
      .slice(0, 5),
  };
}
