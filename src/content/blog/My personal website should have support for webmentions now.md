---
title: My personal website should have support for webmentions now
summary: Sort of a play-by-play timestamped collection of notes of me figuring out setting up Webmentions with my blog.
tags: 
- writing
- coding
- webmentions
pubDate: 2025-07-27T12:05:06+00:00
updatedDate: 2025-12-08T07:33:13+00:00
---

### 20:05 PM update

Just writing this post to note per timestamp what I've done so far. I feel a bit optimistic I'll finish this [Github issue](https://github.com/chiawase/chi-11ty/issues/8) by this evening since I've already gotten the most basic Webmention pass-data to work (with the data of my test [shown here](https://webmention.io/chisenires.design/webmention/wdlPhQ9nM6WgqEoVIibL), but I'm not really sure if this would be visible to all, but linking it just for the sake of referring to it)

I've been going back and forth with the following articles and posts to figure out how to make this setup work with my own website of 11ty + Coolify (since that's where my site is deployed, and not the conventional Netlify):

- [An In-Depth Tutorial of Webmentions + Eleventy](https://sia.codes/posts/webmentions-eleventy-in-depth/) by Sia Karamalegos
- [this Github repository](https://github.com/maxboeck/eleventy-webmentions) of an 11ty base blog that has support for webmentions built in (which I also saw linked in the first article)
  - added note: man... this repo was last updated 7 years ago 🤯

Initially, I got a bit intimidated with the `webmentions.js` code that was referenced in both Sia's article and I eventually saw was also similar to the code in the same file name [in the Github repository](https://github.com/maxboeck/eleventy-webmentions/blob/master/_data/webmentions.js). But here's hoping I get to figure this out on my own 😅

### 20:23 PM update

I also saw [this article by Max Böck entitled "Using Webmentions in Eleventy"](https://mxb.dev/blog/using-webmentions-on-static-sites/) referenced in the other articles and I figured I should link to it here too.

I just want to declare, I have no idea if what I'm doing is correct 🙈

So many references in IndieWeb still refer to Twitter, or point to dead links. It's kinda sad. So I feel like I'm just going through scraps of knowledge still kept up by the other people who've written about this in the past. Thank you to those who have still kept their data up after so long, I hope I do it justice by being able to follow the instructions you've all indicated (and hopefully it still holds up to 2025 technology??) 🙈

### 22:00 PM update

OMG it worked. It fetched the one webmention I set up initially via [webmentions.io](https://webmentions.io)!!!

But now I'm not sure how to show the thing... I need to figure out how to connect it to the article itself 🤔

I'm currently testing the webmention setup I made in [[/blog/constantly-updating-this-website|this post I made]] plus [[/blog/setting-up-my-website-again-for-the-nth-time|this other older article]] too.

## 22:42 PM update

Okay, I think it technically works already. I've initially published this article so I could also set up another webmention for this post in particular. Initially, I got no results because the one webmention I set up was a `mention-of` kinda thing, none yet of the other types, like `repost-of`, `like-of`, `in-reply-to`... since I don't have those yet, my posts will just have a list of all the webmentions in general shown below. But there's still gonna be a counter that shows the total number of webmentions per type. XD Maybe eventually that number will grow hehe.

One thing I've yet to figure out is if is already done automatically by nature of me mentioning some of the articles here. If that doesn't really work, then I guess I'll just have to update this again. XD

### Update after posting this article

> Technically it's 2 days since I have this article up, I just want to add anecdotes after this.

Seems like I've only really implemented half of the whole setup. I can _receive_ webmentions, but I'm not really sure how I can _send_ them. Plus if there's also a way to specify the webmention type, like if I want to reply to someone or if I'm reposting a particular article, vs just making them all `mention-of`s.

I'm still figuring that part out, hopefully I eventually get it to the point that I can write about it better. Honestly, the process of implementing this was all very confusing with all the information being... everywhere, or I guess... with some of the info not being clear cut from the get go?

I hope I do get it eventually that I can write my own guide, so that in the future, whoever's in the same boat as I am can be better guided, even with the other articles I've already linked initially.
