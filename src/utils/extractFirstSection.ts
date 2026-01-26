import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export async function extractFirstSection(markdown: string): Promise<string> {
  // Remove frontmatter
  const yamlEnd = markdown.indexOf("---", 3);
  const bodyStart = yamlEnd !== -1 ? yamlEnd + 3 : markdown.indexOf("---") + 3;
  const body = markdown.slice(bodyStart).trim();
  const lines = body.split("\n");
  // Find first H2 or direct list
  let h2Line = "";
  let listStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("## ")) {
      h2Line = line;
      listStartIndex = i + 1;
      break;
    }
    if (line.match(/^[-*]\s/)) {
      listStartIndex = i;
      break;
    }
  }
  if (listStartIndex === -1) return "";
  // Collect list items until next H2 or end
  const listItems: string[] = [];
  for (let i = listStartIndex; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("## ")) break;
    if (trimmed.match(/^[-*]\s/)) {
      listItems.push(trimmed.replace(/^[-*]\s+/, ""));
    }
  }
  if (listItems.length === 0) return "";
  // Instead of manual HTML creation, create markdown content
  const markdownContent = listItems.map((item) => `- ${item}`).join("\n");
  // Process markdown through unified pipeline
  const processedHTML = await unified()
    .use(remarkParse)
    .use(remarkGfm) // For GitHub-flavored markdown (links, emphasis, etc.)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdownContent);
  return processedHTML.toString();
}
