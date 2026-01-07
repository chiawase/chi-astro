import fs from "node:fs/promises";
import path from "node:path";

/**
 * A way to output the updatedDate based on the file.
 *
 * @param input should be the full path to the file for this to work (eg. "./src/data/blogroll.ts")
 */
export async function getUpdatedDateFor(input: string) {
  const filePath = path.resolve(input);
  const stats = await fs.stat(filePath);

  return stats.mtime;
}
