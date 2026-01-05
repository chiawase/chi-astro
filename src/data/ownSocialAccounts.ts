type Nested = Record<string, unknown>;

/**
 * Centralized source of truth for your own accounts + Bridgy routes.
 * Keep these as full URLs so you can reuse them anywhere in Astro pages.
 */
export const OWN_SOCIAL_ACCOUNTS = {
  Mastodon: {
    profileUrl: "https://social.lol/@chi",
    bridgy: {
      like: "https://brid.gy/like/mastodon/@chi@social.lol",
      repost: "https://brid.gy/repost/mastodon/@chi@social.lol",
      comment: "https://brid.gy/comment/mastodon/@chi@social.lol",
    },
  },

  Bluesky: {
    profileUrl: "https://bsky.app/profile/chisenires.design",
    // Used in brid.gy URLs (as seen in webmentions.json)
    did: "did:plc:f4mmql45u3lfj6iltwjvtcdk",
    bridgy: {
      comment:
        "https://brid.gy/comment/bluesky/did:plc:f4mmql45u3lfj6iltwjvtcdk",
      convertWeb:
        "https://bsky.brid.gy/convert/web/at://did:plc:f4mmql45u3lfj6iltwjvtcdk",
    },
  },

  Threads: {
    profileUrl: "https://www.threads.com/@_chiawase",
  },
} as const;

/**
 * --- Webmentions filtering helper ---
 * Webmention payloads often contain URLs in slightly different shapes (with/without protocol,
 * trailing slashes, etc.). To keep filtering resilient, we export a *derived* list of patterns
 * that are easy to `.includes()` match against normalized strings.
 */
function stripScheme(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/g, "");
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value as Nested).flatMap(collectStrings);
  }
  return [];
}

/**
 * Patterns used by webmentions.js to filter your own accounts (including Bridgy routes).
 * This is automatically kept in sync with OWN_SOCIAL_ACCOUNTS.
 */
export const OWN_SOCIAL_ACCOUNT_PATTERNS = Array.from(
  new Set(
    collectStrings(OWN_SOCIAL_ACCOUNTS)
      // Keep both the raw string and a scheme-less version for matching.
      .flatMap((s) => [s, stripScheme(s)])
      .filter(Boolean),
  ),
);
