---
eleventyNavigation:
  key: "Colophon"
  parent: "More"
title: "Colophon"
date: 2025-09-26T09:08:31+00:00
date_updated: 2025-11-10T14:46:59+00:00
canonical: "colophon"
---

> Following the guide from [IndieWeb](https://indieweb.org/colophon) for what a Colophon page includes, I’ll do my best to lay down how I’ve set up my side of the internet. Last updated {{ date_updated | readableDate }}.

## Website repository

The code for this website can be found [on Github](https://github.com/chiawase/chi-11ty/).

## Website Icon

![Favicon for chisenires.design](img/favicon.png)

The favicon is a red (`#681310`) squircle with my nickname on it using the font [Anybody](https://etceteratype.co/anybody) for the letter `C` and [Victor Mono](https://rubjo.github.io/victor-mono/) for the letters `hi`. The letter spacing for this is also adjusted so all letters are neatly put together in the middle.

## Website Fonts

The heading font used is [Anybody](https://etceteratype.co/anybody) and the body font is [Victor Mono](https://rubjo.github.io/victor-mono/). Both fonts are loaded into my website using [Fontsource](https://fontsource.org/).

## Website domain

`chisenires.design` is a domain bought on [Porkbun](https://porkbun.com/) back in 2021.

## Tools

This current website is built with [11ty](https://eleventy.dev) and was initially forked from the [Eleventy Base Blog](https://github.com/11ty/eleventy-base-blog).

My old website used to be hosted on [Micro.blog](https://micro.blog) but I’ve since moved away from it since I wanted to save up on subscription costs, and paying with USD does hurt after paying enough times 😅

This website is also hosted on a self-hosted instance of [Coolify](https://coolify.io/). Please do not ask me anything about this, my boyfriend was the one that set it up for me 😅 (and yes, this _does_ have a subscription cost to it too but it feels less negligible since it’s paid yearly and I share the costs too :)) )

For the **auto generated thumbnails**—which I [[Finally fixed the metadata generation and the auto social images!|wrote about in this post]]—it’s set up using [Cloudinary](https://cloudinary.com/invites/lpov9zyyucivvxsnalc5/yks8gwi2hltjef4vokiu?t=default) (this is a referral link!).

For the **dark-light-switch**, I followed the instructions laid out in [dark-mode-toggle npm package](https://www.npmjs.com/package/dark-mode-toggle) and also reference [this StackOverflow answer](https://stackoverflow.com/a/56550819) for some more code that made it work.

For **webmentions**, I wrote about my experience in setting them up in [[My personal website should have support for webmentions now|this blog post]]. As for the setup, based on how I understand it, I piggyback on the [webmention npm package](https://www.npmjs.com/package/@remy/webmention) and also followed the instructions laid out in [webmention.app docs](https://webmention.app/docs). I also set up a [webmentions.js](https://github.com/chiawase/chi-11ty/blob/e703d949fd01a823ef94ab6296c11518fa09765a/_data/webmentions.js) file that _should_ facilitate the fetching and sending of (new) webmentions, but honestly I’m not sure if it does what I think it’s supposed to do 😅 For now I’ll leave this as is though since I only have so much time to figure out things and it _kinda_ works whenever I do tinker with my website 😆

For **website analytics**, I also share track page views and sessions using [Umami](https://umami.is/) (mostly for my personal consumption). You can view this website’s analytics here (since I made it public, and [[Testing sharing my personal website analytics publicly|wrote about it here]]): [chisenires.design website analytics via Umami](https://umami.chisenires.design/share/368agdyWC4Nl6Bat/chisenires.design)

## Writing posts

To write posts, I open my `content/` folder in [Obsidian](https://obsidian.md/) and use the following plugins to help me in crafting my posts:
> All of these can be seen in my [Obsidian plugins folder](https://github.com/chiawase/chi-11ty/tree/e703d949fd01a823ef94ab6296c11518fa09765a/content/.obsidian/plugins).

- [Templater](https://github.com/SilentVoid13/Templater): To make use of a `post_template.md` [(view on Github)](https://github.com/chiawase/chi-11ty/blob/e703d949fd01a823ef94ab6296c11518fa09765a/content/_templates/post_template.md) for easier formatting of the YAML front matter.
- [Linter](https://github.com/platers/obsidian-linter): To help populate the `date` (if it’s a new post, to get the date when the file was created) and `date_updated` (when the file was last edited/updated) YAML properties.
- [Better Word Count](https://github.com/lukeleppan/better-word-count): I just have this installed but I haven’t really had use for it yet. I guess it’s mostly for my benefit, to see how many words I’ve written so far…
- [Smart Typography](https://github.com/mgmeyers/obsidian-smart-typography): I wanted my quotes to be actual quotes `“”` and not like `""` these, and everything else followed.
- [Reading Time](https://github.com/avr/obsidian-reading-time): Another plugin that’s more for my eyes rather than for anything shown on my website, though initially I did install it so I could try and “get” the value and place it somewhere. Haven’t gotten to that yet.
- [Code Editor Shortcuts](https://github.com/timhor/obsidian-editor-shortcuts): Since I’m more used to the keyboard shortcuts for Code Editors like Sublime Text, VS Code, and the like, I wanted to mimic that experience in Obsidian as I typed.
- [Unicode Search](https://github.com/BambusControl/obsidian-unicode-search): This is just here in case I wanted to get a specific special character and I figured I’d get it while not leaving Obsidian. Normally I’d just search the internet for it and copy and paste, but then I do have this plugin. 😁
- [Emoji Autocomplete](https://github.com/KraXen72/obsidian-emoji-autocomplete): A very important Obsidian plugin for me as someone very expressive in typing and using a lot of emojis. Saves me 2-3 keypresses at the same time 😆
- [Permalink Opener](https://github.com/kepano/obsidian-permalink-opener): I’ve never really used this yet, but I keep it around once I get around to using it, once I figure out how to set up the actual permalink for the blog posts I put out and save it in the YAML front matter.

## Workflow for publishing

Usually when I want to write something and share as a post, I open my website’s Obsidian setup and create a post using the `post_template.md` so it automatically makes a draft post and I can fill in the `title` and `description` if I wanted to.

After writing and formatting whatever it is I wanted to share, I’ll add the new post file in a `commit` and `push` to my `main` branch. Once Coolify detects a new commit was added to my website’s Github repo, it auto triggers a new deployment and after a few minutes, I’d get notified if the build was pushed to production successfully. That’s when I know my blog post (and any other changes I made to my website) is now out in the open! 😄

## Tracking things I want to update on my website

I make use of the [Issues Tab](https://github.com/chiawase/chi-11ty/issues) of my website’s Github repo to track the things I wanna work on. The reason I used this was simply because I found it really cool that Github (or is it just git?) automatically closes issues so long as you remember to mention them in the commit messages pushed to the repo. I learned this while contributing to the code of our current Design System at work, while working with my teammate who’s a UX engineer. Amaze ✨
