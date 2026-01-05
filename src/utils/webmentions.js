import fs from "fs";
import unionBy from "lodash/unionBy.js";
import dotenv from "dotenv";
import { SITE_DOMAIN } from "@consts";
import { OWN_SOCIAL_ACCOUNT_PATTERNS } from "@data/ownSocialAccounts";

// Load .env variables with dotenv
dotenv.config();

// Config parameters
const CACHE_FILE_PATH = "_cache/webmentions.json";
const API = "https://webmention.io/api/";
const TOKEN = process.env.WEBMENTION_IO_TOKEN;
const OWN_ORIGIN = `https://${SITE_DOMAIN}`;

/* Helper functions */
function normalize(text = "") {
  return String(text).trim().toLowerCase();
}

function normalizeUrl(input = "") {
  const raw = String(input).trim();
  if (!raw) return "";

  try {
    const u = new URL(raw);

    u.hostname = u.hostname.replace(/^www\./i, "").toLowerCase();

    // drop hash + common noise
    u.hash = "";
    u.search = "";

    u.pathname = u.pathname.replace(/\/{2,}/g, "/");

    if (u.pathname !== "/") {
      u.pathname = u.pathname.replace(/\/+$/, "") + "/";
    }

    return u.toString();
  } catch {
    // fallback for non-URL strings like "did:plc:..."
    return raw.toLowerCase().replace(/\/{2,}/g, "/");
  }
}

function normalizeWebmention(post) {
  const source = normalizeUrl(post?.["wm-source"]);
  const target = normalizeUrl(post?.["wm-target"]);

  const normalized = {
    ...post,
    "wm-source": source,
    "wm-target": target,

    url: post.url ? normalizeUrl(post.url) : post?.url,

    author: post.author
      ? {
          ...post.author,
          url: post.author.url
            ? normalizeUrl(post.author.url)
            : post.author.url,
        }
      : post?.author,

    syndication: Array.isArray(post?.syndication)
      ? post.syndication.map((u) => normalizeUrl(u))
      : post?.syndication,
  };

  for (const k of ["like-of", "repost-of", "mention-of", "in-reply-to"]) {
    if (normalized[k]) normalized[k] = normalizeUrl(normalized[k]);
  }

  return normalized;
}

/* Filtering helpers */

// Filter out self-mentions where both source and target are on my site
function isSelfWebmention(post) {
  const source = normalizeUrl(post?.["wm-source"]);
  const target = normalizeUrl(post?.["wm-target"]);

  return (
    source.startsWith(normalizeUrl(OWN_ORIGIN)) &&
    target.startsWith(normalizeUrl(OWN_ORIGIN))
  );
}

function matchesOwnSocialAccounts(post, ownAccountPatterns = []) {
  const authorUrl = normalize(post?.author?.url);
  const source = normalize(post?.["wm-source"]);

  if (authorUrl) {
    return ownAccountPatterns.some((pattern) =>
      authorUrl.includes(normalize(pattern)),
    );
  }

  const isBridgy = source.includes("brid.gy/");
  if (!isBridgy) return false;

  return ownAccountPatterns.some((pattern) =>
    source.includes(normalize(pattern)),
  );
}

function filterSelfWebmentions(children = [], ownAccountPatterns = []) {
  return children.filter((post) => {
    if (isSelfWebmention(post)) return false;
    if (matchesOwnSocialAccounts(post, ownAccountPatterns)) return false;
    return true;
  });
}

// Function to fetch the Webmentions
async function fetchWebmentions(since, perPage = 10000) {
  // If we don't have a domain name or token, abort
  if (!SITE_DOMAIN || !TOKEN) {
    console.warn(">>> Unable to fetch webmentions: missing domain or token");
    return null;
  }

  let url = `${API}mentions.jf2?domain=${SITE_DOMAIN}&token=${TOKEN}&per-page=${perPage}`;
  if (since) url += `&since=${since}`; // only fetch new mentions

  const response = await fetch(url);
  if (!response.ok) return null;

  const feed = await response.json();

  feed.children = Array.isArray(feed.children)
    ? feed.children.map(normalizeWebmention)
    : [];

  console.log(
    `>>> ${feed.children.length} new webmentions fetched from ${API}`,
  );

  return feed;
}

// Merge fresh webmentions with cached entries, unique per ID
function mergeWebmentions(cache, fresh) {
  const merged = unionBy(cache.children, fresh.children, "wm-id").map(
    normalizeWebmention,
  );

  return filterSelfWebmentions(merged, OWN_SOCIAL_ACCOUNT_PATTERNS);
}

// save combined Webmentions in cache file
function writeToCache(data) {
  try {
    if (!data || !Array.isArray(data.children)) {
      console.warn(">>> Skipping cache write: invalid webmentions payload");
      return;
    }

    const dir = "_cache";
    const fileContent = JSON.stringify(data, null, 2);

    // create cache folder if it doesn't exist already
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // write data to cache JSON file
    fs.writeFileSync(CACHE_FILE_PATH, fileContent, "utf8");
    console.log(`>>> Webmentions cached to ${CACHE_FILE_PATH}`);
  } catch (error) {
    console.error(">>> Failed to write webmentions cache:", error);
  }
}

// get cache contents from JSON file
function readFromCache() {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const cacheFile = fs.readFileSync(CACHE_FILE_PATH, "utf8");
      const parsed = JSON.parse(cacheFile);

      parsed.children = Array.isArray(parsed.children)
        ? parsed.children.map(normalizeWebmention)
        : [];

      // IMPORTANT: apply BOTH filters on cached data, too
      parsed.children = filterSelfWebmentions(
        parsed.children,
        OWN_SOCIAL_ACCOUNT_PATTERNS,
      );

      return parsed;
    }
  } catch (error) {
    console.warn(">>> Failed to reade/parse webmentions cache:", error);
  }

  // if no cache found
  return {
    lastFetched: null,
    children: [],
  };
}

export default async function () {
  console.log(">>> Reading webmentions from cache...");
  const cache = readFromCache();

  if (cache.children.length) {
    console.log(`>>> ${cache.children.length} webmentions loaded from cache`);
  }

  const SHOULD_FETCH =
    process.env.NODE_ENV === "production" ||
    process.env.FETCH_WEBMENTIONS === "true";

  if (!SHOULD_FETCH) return cache;

  console.log(">>> Checking for new webmentions...");
  const since = cache.children.length ? cache.lastFetched : null;
  const feed = await fetchWebmentions(since);

  if (!feed) return cache;

  const webmentions = {
    lastFetched: new Date().toISOString(),
    children: mergeWebmentions(cache, feed),
  };

  writeToCache(webmentions);
  return webmentions;
}
