---
title: "Finally, a website update"
description: My favicon's back to normal, the test text data I had is gone from view, and my site is building again!
tags: 
- writing
- coding
pubDate: 2025-06-08T12:24:06+00:00
updatedDate: 2025-09-24T14:42:19+00:00
---

My favicon's back to normal, the test text data I had is gone from view, and my site is building again!

<!-- more -->

It took me too long to fix the bugs that kept being thrown while I deploying my website again. Turns out, I just missed some (breaking) changes with Eleventy because it's now in [version 3.1.1](https://github.com/11ty/eleventy/releases/tag/v3.1.1) while I was still using... 3.0.x I think?

(Also using this blog post to test my excerpt functionality if it works. Happy to know it does work hehe)

When I took a peek at [one of the commits in the 11ty/eleventy-base-blog](https://github.com/chiawase/chi-11ty/commit/3b870d5914b39d906df17ca43930cd57685d0b5b) that I forked from, that's when I saw that apparently the shortcodes {% raw %}`{% css %}` and `{% js %}`{% endraw %} weren't being used anymore. (And a bunch of other smaller style changes in the `postslist.njk` file.)

After setting that up... all the changes I made plus the update was deployed successfully on my server! Yayy!

BUT! My day was not yet done. When I wrote this blog post, suddenly I encountered ANOTHER error. 🤦🏻‍♀️

It didn't make sense too that I started getting a different error just for writing a new blog post when I've... done this already. Please just work.

Turns out, the error was with the declarations I made above with the `css` and `js` tags. I just needed to use the `raw` tags as defined in the [Nunjucks docs](https://mozilla.github.io/nunjucks/templating.html#raw).

NOW I to get back to gaming. And maybe adding Webmentions, as I mentioned in [[/blog/finally-fixed-the-metadata-generation-and-the-auto-social-images|my previous post]]. 😆
