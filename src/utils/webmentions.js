import fs from "fs";
import fetch from "node-fetch";
import unionBy from "lodash/unionBy.js";
import dotenv from "dotenv";
import { SITE_DOMAIN } from "@consts";

const OWN_ORIGIN = `https://${SITE_DOMAIN}`;

// A webmention is a self-mention if both source and target are on your own site
function isSelfWebmention(post) {
  const source = post["wm-source"] || "";
  const target = post["wm-target"] || "";

  return source.startsWith(OWN_ORIGIN) && target.startsWith(OWN_ORIGIN);
}

function filterSelfWebmentions(children = []) {
  return children.filter((post) => !isSelfWebmention(post));
}

// Load .env variables with dotenv
dotenv.config();

// Gotten from https://sia.codes/posts/webmentions-eleventy-in-depth/ and https://github.com/maxboeck/eleventy-webmentions/blob/master/_data/webmentions.js

// Config parameters
const CACHE_FILE_PATH = "_cache/webmentions.json";
const API = "https://webmention.io/api/";
const TOKEN = process.env.WEBMENTION_IO_TOKEN;

// Function to fetch the Webmentions
async function fetchWebmentions(since, perPage = 10000) {
  // If we don't have a domain name or token, abort
  if (!SITE_DOMAIN || !TOKEN) {
    console.warn(">>> Unable to fetch webmentions: missing domain or token");
    return false;
  }

  let url = `${API}/mentions.jf2?domain=${SITE_DOMAIN}&token=${TOKEN}&per-page=${perPage}`;
  if (since) url += `&since=${since}`; // only fetch new mentions

  const response = await fetch(url);
  if (response.ok) {
    const feed = await response.json();
    console.log(
      `>>> ${feed.children.length} new webmentions fetched from ${API}`,
    );
    return feed;
  }
  return null;
}

// Merge fresh webmentions with cached entries, unique per ID
function mergeWebmentions(a, b) {
  const merged = unionBy(a.children, b.children, "wm-id");
  return filterSelfWebmentions(merged);
}

// save combined Webmentions in cache file
function writeToCache(data) {
  const dir = "_cache";
  const fileContent = JSON.stringify(data, null, 2);

  // create cache folder if it doesn't exist already
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // write data to cache JSON file
  fs.writeFile(CACHE_FILE_PATH, fileContent, (err) => {
    if (err) throw err;
    console.log(`>>> Webmentions cached to ${CACHE_FILE_PATH}`);
  });
}

// get cache contents from JSON file
function readFromCache() {
  if (fs.existsSync(CACHE_FILE_PATH)) {
    const cacheFile = fs.readFileSync(CACHE_FILE_PATH);
    return JSON.parse(cacheFile);
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

  // Clean existing cache so self-mentions disappear right away
  cache.children = filterSelfWebmentions(cache.children);

  if (cache.children.length) {
    console.log(`>>> ${cache.children.length} webmentions loaded from cache`);
  }

  // Only fetch new mentions in production
  if (process.env.NODE_ENV === "production") {
    console.log(">>> Checking for new webmentions...");
    const feed = await fetchWebmentions(cache.lastFetched);

    if (feed) {
      const webmentions = {
        lastFetched: new Date().toISOString(),
        children: mergeWebmentions(cache, feed), // already filtered inside merge
      };

      writeToCache(webmentions);
      return webmentions;
    }
  }

  // Even if we didn’t fetch, this is now self-mention-free
  return cache;
}
