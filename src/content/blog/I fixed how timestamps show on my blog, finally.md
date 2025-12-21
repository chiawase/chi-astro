---
title: "I fixed how timestamps show on my blog, finally"
description: "This took way longer than I thought it would to figure out, but better late than never!"
pubDate: 2025-09-24T14:43:25+00:00
updatedDate: 2025-09-24T14:47:26+00:00
tags: 
- writing
- coding
---

After much alt-tabbing between the [MomentJS](https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/) docs and testing out the `filters.js` setup I have… I finally figured out why timestamps on my website weren’t showing up correctly before.

… I was using the wrong token for **hour**. I used `hh:mm` in my Linter instead of `HH:mm`. Man, what a big difference capitalization gives you 🙈

Well now at least I’m sure that all the blog posts I have within my [blog](/blog) are timestamped correctly, and will be moving forward. It only took… around 5 months for me to see the bug 😆 hooray(?)!
