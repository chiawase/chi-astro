type WebmentionEntry = {
  ["wm-target"]: string;
  published?: string;
  ["wm-received"]?: string;
  [key: string]: any;
};

function normalizePath(url: string) {
  const path = new URL(url).pathname;
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

// getWebmentionsForUrl
export function getWebmentionsForUrl(children: WebmentionEntry[], url: string) {
  const targetPath = normalizePath(url);

  return (children ?? [])
    .filter((entry) => normalizePath(entry["wm-target"]) === targetPath)
    .sort((a, b) => {
      const bDate = new Date(b.published ?? b["wm-received"] ?? 0).getTime();
      const aDate = new Date(a.published ?? a["wm-received"] ?? 0).getTime();
      return bDate - aDate;
    });
}

// webmentionsSize
export function webmentionsSize(mentions?: any[]) {
  return mentions?.length ?? 0;
}

// webmentionsByType
export function webmentionsByType(mentions: any[], mentionType: string) {
  return mentions.filter((entry) => !!entry[mentionType]);
}
