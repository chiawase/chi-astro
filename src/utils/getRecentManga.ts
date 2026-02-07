import fs from "node:fs/promises";
import path from "node:path";

import { getCollection } from "astro:content";
import { extractFirstSection } from "@utils/extractFirstSection";

const MANGA_DIR = "./src/content/manga";

function toDate(value: unknown): Date {
  // If your schema uses z.coerce.date(), this will already be a Date.
  // This helper just makes the script resilient.
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date(0);
}

export async function getRecentManga() {
  const mangaEntries = await getCollection("manga");

  const mangaProcessed = await Promise.all(
    mangaEntries.map(async (entry) => {
      const fullPath = path.join(MANGA_DIR, entry.data.title + ".md");

      let section = "";
      try {
        const content = await fs.readFile(fullPath, "utf-8");
        section = await extractFirstSection(content);
      } catch {
        section = "";
      }

      const lastReadDate = toDate(entry.data.lastReadDate);

      return {
        id: entry.id,
        url: entry.data.url,
        title: entry.data.title,
        latestChapter: entry.data.latestChapter,
        status: entry.data.status,
        lastReadDate,
        section,
      };
    }),
  );

  const sortByLatestRead = (
    a: (typeof mangaProcessed)[number],
    b: (typeof mangaProcessed)[number],
  ) => {
    const diff = b.lastReadDate.getTime() - a.lastReadDate.getTime();
    if (diff !== 0) return diff;

    // stable tie-breaker so ordering is deterministic
    return a.title.localeCompare(b.title);
  };

  const recentReading = mangaProcessed
    .filter((m) => m.status === "reading")
    .sort(sortByLatestRead)
    .slice(0, 10);

  const recentFinished = mangaProcessed
    .filter((m) => m.status === "finished")
    .sort(sortByLatestRead)
    .slice(0, 3);

  return { recentReading, recentFinished };
}
