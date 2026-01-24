export function extractFirstSection(markdown: string): string {
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
  // Convert to HTML
  const ulHtml = `<ul>\n${listItems.map((item) => `  <li>${item}</li>`).join("\n")}\n</ul>`;
  return ulHtml;
}
