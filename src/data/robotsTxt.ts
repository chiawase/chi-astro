/* Housing all robots.txt stuff */

import { SITE_DOMAIN } from "../consts";

export const robotsTxtOptions = {
  host: SITE_DOMAIN,
  policy: [
    {
      userAgent: "*",
      allow: "/",
    },
    {
      userAgent: "GPTBot",
      disallow: "/",
    },
    {
      userAgent: "ChatGPT-User",
      disallow: "/",
    },
    {
      userAgent: "Google-Extended",
      disallow: "/",
    },
    {
      userAgent: "PerplexityBot",
      disallow: "/",
    },
    {
      userAgent: "Amazonbot",
      disallow: "/",
    },
    {
      userAgent: "ClaudeBot",
      disallow: "/",
    },
    {
      userAgent: "Omgilibot",
      disallow: "/",
    },
    {
      userAgent: "FacebookBot",
      disallow: "/",
    },
    {
      userAgent: "Applebot",
      disallow: "/",
    },
    {
      userAgent: "anthropic-ai",
      disallow: "/",
    },
    {
      userAgent: "Bytespider",
      disallow: "/",
    },
    {
      userAgent: "Claude-Web",
      disallow: "/",
    },
    {
      userAgent: "Diffbot",
      disallow: "/",
    },
    {
      userAgent: "ImagesiftBot",
      disallow: "/",
    },
    {
      userAgent: "Omgili",
      disallow: "/",
    },
    {
      userAgent: "YouBot",
      disallow: "/",
    },
  ],
};
