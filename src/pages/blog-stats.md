---
title: "Blog Stats"
eleventyNavigation:
  key: "Blog Stats"
  parent: "More"
date: 2025-11-10T15:12:16+00:00
date_updated: 2025-11-10T15:27:35+00:00
canonical: "blog-stats"
---

## Blog Stats

> I like looking at random charts of things. This is using [PostGraph](https://postgraph.rknight.me/) by Robb Knight. Also inspired by [Flamed Fury’s own blogstats page](https://flamedfury.com/blogstats/). Last updated {{ date_updated | readableDate }}.

### Posts on my Blog

Noting down all the posts made since I [re-launched my website in this manner](/blog/setting-up-my-website-again-for-the-nth-time/).

{% postGraph collections.blog %}

### Archived Posts

This contains all the posts I migrated from my previous setup while I was still running my blog on [Micro.blog](https://micro.blog).

{% postGraph collections.archive %}
