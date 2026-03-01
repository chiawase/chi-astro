/* One file to house all the redirects */

export default {
  "/feed/feed.xml": { destination: "/feed.xml", status: 301 }, // to capture those times when I had that as the link to my RSS feed
  "sitemap.xml": { destination: "sitemap-index.xml", status: 301 }, // updating how the 11ty sitemap link was to the Astro one
  "/archive/2024/04/03/say-card-mbapr/": { destination: "/archive/2024/04/03/day-card-mbapr/", status: 301 }, // Archive - mbApr day 3 entry
  "/2023/07/07/thinking-of-writing.html": { destination: "/archive/2023/07/07/thinking-of-writing/", status: 301 },
  "/2021/09/25/getting-to-know.html": { destination: "/archive/2021/09/25/getting-to-know/", status: 301 },
  "/writing/25-things-i-learned-after-25-years-of-existing/": { destination: "/archive/2021/09/04/figuring-out-where/", status: 301 },
  "/2021/09/04/figuring-out-where.html": { destination: "/archive/2021/09/04/figuring-out-where/", status: 301 },
  "/2021/09/04/things-i-learned.html": { destination: "/archive/2021/09/04/things-i-learned/", status: 301 },
  "/2023/12/27/things-i-want.html": { destination: "/archive/2023/12/27/things-i-want/", status: 301 },
  "/2023/07/07/things-i-wanna.html": { destination: "/archive/2023/07/07/things-i-wanna/", status: 301 },
  "/tags/link/": { destination: "/tags/links/", status: 301 },
  // "": { destination: "", status: 301 },
} as const;
