/**
 * Cross-posts new blog posts from the live Atom feed to Mastodon, Bluesky,
 * and Threads. Runs from .github/workflows/crosspost.yml after a push.
 *
 * Default (watch) mode:
 *   1. Snapshot the live feed right after the push, while Coolify is still
 *      building, so it still has the old entries.
 *   2. Poll the live feed until it changes (the deploy finished).
 *   3. Post every entry that wasn't in the snapshot and was published
 *      within the last CROSSPOST_MAX_AGE_DAYS days.
 * Nothing needs to be stored between runs. If the deploy never lands,
 * nothing gets posted.
 *
 * Usage:
 *   node src/scripts/crosspost.mjs                  # watch mode
 *   node src/scripts/crosspost.mjs --url <post-url> # post one entry now
 *   add --dry-run to print what would be posted without posting
 *
 * A platform is enabled when its env vars are set (see .env.sample).
 * To add another platform, add an entry to TARGETS.
 */

const FEED_URL = process.env.CROSSPOST_FEED_URL || "https://chisenires.design/feed.xml";
const MAX_AGE_DAYS = Number(process.env.CROSSPOST_MAX_AGE_DAYS || 7);
const WAIT_MINUTES = Number(process.env.CROSSPOST_WAIT_MINUTES || 30);
const POLL_SECONDS = 30;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || process.env.CROSSPOST_DRY_RUN === "true";
const urlArg = (args.includes("--url") ? args[args.indexOf("--url") + 1] : process.env.CROSSPOST_URL) || undefined;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Feed + page helpers
// ---------------------------------------------------------------------------

function unescapeXml(s) {
  return s
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

async function fetchText(url) {
  const bust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
  const res = await fetch(bust, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

/** Parses the Atom feed produced by src/pages/feed.xml.ts. */
function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, body]) => {
    const tag = (name) => body.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1].trim() ?? "";
    return {
      id: tag("id"),
      url: body.match(/<link href="([^"]+)"/)?.[1] ?? tag("id"),
      title: unescapeXml(tag("title")),
      summary: unescapeXml(tag("summary")),
      published: new Date(tag("published")),
    };
  });
}

/** Reads og:* metadata from the live post page (used for Bluesky's link card). */
async function fetchOg(url) {
  const html = await fetchText(url);
  const meta = (prop) =>
    html.match(new RegExp(`<meta property="og:${prop}" content="([^"]*)"`))?.[1];
  const image = meta("image");
  return { image: image && unescapeXml(image) };
}

const graphemes = (s) => [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)].length;

/**
 * Builds "title\n\nsummary\n\nurl", shortening the summary (and dropping it
 * if needed) so the whole post stays within `limit` (counted with `count`).
 */
function composeText(post, limit, count = graphemes) {
  const build = (summary) => [post.title, summary, post.url].filter(Boolean).join("\n\n");
  if (count(build(post.summary)) <= limit) return build(post.summary);
  const words = post.summary.split(/\s+/);
  while (words.length) {
    words.pop();
    const text = build(`${words.join(" ")}…`);
    if (words.length && count(text) <= limit) return text;
  }
  return build("");
}

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

const env = process.env;

const TARGETS = [
  {
    name: "Mastodon",
    enabled: () => Boolean(env.MASTODON_ACCESS_TOKEN),
    text: (post) => composeText(post, Number(env.MASTODON_CHAR_LIMIT || 500), (s) => [...s].length),
    async post(post, text) {
      const instance = env.MASTODON_INSTANCE || "https://social.lol";
      const res = await fetch(`${instance}/api/v1/statuses`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.MASTODON_ACCESS_TOKEN}`,
          "content-type": "application/json",
          "idempotency-key": post.id,
        },
        body: JSON.stringify({ status: text, visibility: "public" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`);
      return json.url;
    },
  },

  {
    name: "Bluesky",
    enabled: () => Boolean(env.BLUESKY_IDENTIFIER && env.BLUESKY_APP_PASSWORD),
    text: (post) => composeText(post, 300),
    async post(post, text) {
      const service = env.BLUESKY_SERVICE || "https://bsky.social";
      const xrpc = async (method, body, headers = {}) => {
        const res = await fetch(`${service}/xrpc/${method}`, {
          method: "POST",
          headers: { "content-type": "application/json", ...headers },
          body: body instanceof Uint8Array ? body : JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(`${method} ${res.status} ${JSON.stringify(json)}`);
        return json;
      };

      const session = await xrpc("com.atproto.server.createSession", {
        identifier: env.BLUESKY_IDENTIFIER,
        password: env.BLUESKY_APP_PASSWORD,
      });
      const auth = { authorization: `Bearer ${session.accessJwt}` };

      // Link card, with the post's OG image as its thumbnail when it fits (≤ ~1 MB).
      const external = { uri: post.url, title: post.title, description: post.summary };
      try {
        const { image } = await fetchOg(post.url);
        if (image) {
          const img = await fetch(image);
          const bytes = new Uint8Array(await img.arrayBuffer());
          if (img.ok && bytes.length <= 976_560) {
            const { blob } = await xrpc("com.atproto.repo.uploadBlob", bytes, {
              ...auth,
              "content-type": img.headers.get("content-type") ?? "image/png",
            });
            external.thumb = blob;
          }
        }
      } catch (error) {
        console.warn(`  Bluesky: posting without a thumbnail (${error.message})`);
      }

      // Make the URL in the text clickable: facets use UTF-8 byte offsets.
      const encoder = new TextEncoder();
      const urlStart = text.lastIndexOf(post.url);
      const byteStart = encoder.encode(text.slice(0, urlStart)).length;
      const facets = [
        {
          index: { byteStart, byteEnd: byteStart + encoder.encode(post.url).length },
          features: [{ $type: "app.bsky.richtext.facet#link", uri: post.url }],
        },
      ];

      const { uri } = await xrpc(
        "com.atproto.repo.createRecord",
        {
          repo: session.did,
          collection: "app.bsky.feed.post",
          record: {
            $type: "app.bsky.feed.post",
            text,
            facets,
            embed: { $type: "app.bsky.embed.external", external },
            createdAt: new Date().toISOString(),
            langs: ["en"],
          },
        },
        auth,
      );
      return `https://bsky.app/profile/${session.handle}/post/${uri.split("/").pop()}`;
    },
  },

  {
    name: "Threads",
    enabled: () => Boolean(env.THREADS_ACCESS_TOKEN),
    // Threads counts emoji as their UTF-8 byte length.
    text: (post) => composeText(post, 500, (s) => new TextEncoder().encode(s).length),
    async post(post, text) {
      const token = env.THREADS_ACCESS_TOKEN;
      const call = async (method, path, params = {}) => {
        const qs = new URLSearchParams({ ...params, access_token: token });
        const res = await fetch(`https://graph.threads.net/${path}?${qs}`, { method });
        const json = await res.json();
        if (!res.ok) throw new Error(`${path} ${res.status} ${JSON.stringify(json)}`);
        return json;
      };

      const container = await call("POST", "v1.0/me/threads", {
        media_type: "TEXT",
        text,
        link_attachment: post.url,
      });
      // Meta recommends waiting for the container to finish processing before publishing.
      for (let i = 0; i < 12; i++) {
        const { status } = await call("GET", `v1.0/${container.id}`, { fields: "status" });
        if (status === "FINISHED") break;
        if (status === "ERROR" || status === "EXPIRED") throw new Error(`container ${status}`);
        await sleep(5000);
      }
      const published = await call("POST", "v1.0/me/threads_publish", { creation_id: container.id });
      const { permalink } = await call("GET", `v1.0/${published.id}`, { fields: "permalink" });

      // Long-lived tokens expire 60 days after they were last refreshed, so refresh on every post.
      try {
        const refreshed = await call("GET", "refresh_access_token", { grant_type: "th_refresh_token" });
        if (refreshed.access_token !== token) {
          console.warn("  Threads: refresh returned a new token; update the THREADS_ACCESS_TOKEN secret.");
        }
      } catch (error) {
        console.warn(`  Threads: token refresh failed (${error.message})`);
      }
      return permalink;
    },
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function findNewPosts() {
  const before = await fetchText(FEED_URL);
  const seen = new Set(parseFeed(before).map((e) => e.id));
  console.log(`Snapshot of ${FEED_URL} has ${seen.size} entries. Waiting for the deploy…`);

  const deadline = Date.now() + WAIT_MINUTES * 60_000;
  while (Date.now() < deadline) {
    await sleep(POLL_SECONDS * 1000);
    let after;
    try {
      after = await fetchText(FEED_URL);
    } catch (error) {
      console.warn(`  ${error.message}; retrying`);
      continue;
    }
    if (after === before) continue;

    const cutoff = Date.now() - MAX_AGE_DAYS * 86_400_000;
    const fresh = parseFeed(after).filter((e) => !seen.has(e.id));
    const recent = fresh.filter((e) => e.published.getTime() >= cutoff);
    for (const e of fresh.filter((e) => !recent.includes(e))) {
      console.log(`Skipping ${e.url}: published more than ${MAX_AGE_DAYS} days ago.`);
    }
    return recent;
  }
  console.log(`Feed didn't change within ${WAIT_MINUTES} minutes; nothing to post.`);
  return [];
}

async function main() {
  const targets = TARGETS.filter((t) => t.enabled());
  if (!targets.length) {
    console.log("No cross-post targets configured; see .env.sample.");
    return;
  }
  console.log(`Targets: ${targets.map((t) => t.name).join(", ")}${dryRun ? " (dry run)" : ""}`);

  let posts;
  if (urlArg) {
    const entry = parseFeed(await fetchText(FEED_URL)).find((e) => e.url === urlArg || e.id === urlArg);
    if (!entry) throw new Error(`${urlArg} isn't in ${FEED_URL}`);
    posts = [entry];
  } else {
    posts = await findNewPosts();
  }
  if (!posts.length) {
    console.log("No new posts to cross-post.");
    return;
  }

  let failed = false;
  // Oldest first, so the newest post ends up on top of each timeline.
  for (const post of [...posts].reverse()) {
    console.log(`\n${post.title} — ${post.url}`);
    for (const target of targets) {
      const text = target.text(post);
      if (dryRun) {
        console.log(`  [${target.name}] would post:\n${text.replace(/^/gm, "    ")}`);
        continue;
      }
      try {
        console.log(`  ${target.name}: ${await target.post(post, text)}`);
      } catch (error) {
        failed = true;
        console.error(`  ${target.name} failed: ${error.message}`);
      }
    }
  }
  if (failed) process.exitCode = 1;
}

await main();
