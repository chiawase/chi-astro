---
title: Updated how my webmentions work (again XD)
description: "I noticed this while I was showing off the recent changes to my website to a friend—my webmentions weren’t showing properly >__< So I took the time to fix it, and now I think (?) it’s better now than it was before."
pubDate: 2025-12-08T07:31:34+00:00
updatedDate: 2025-12-08T09:58:58+00:00
tags: 
- writing
- coding
- webmentions
postLanguage: english
---
<!-- markdownlint-disable MD013 -->
It’s funny how I initially found out about this issue: I was showing off the recent changes to my website to a close friend of mine who’s hanging out with me to co-work, when I noticed that my posts didn’t have any webmentions at all. Like… *huh? I know this was working before…* [This blog post of mine](/blog/my-personal-website-should-have-support-for-webmentions-now/) was my best way to test out webmentions because another user, Kristof, mentioned my post on [his blog post](https://kiko.io/notes/2025/Run-Webmentions-Run/) (thank you for noticing my humble website! 🙏)

So then starts the rabbit hole again of figuring out how to set things up, reading the code, understanding what’s happening, and all that jazz… I understand the underlying concept of how webmentions work, I just get a bit lost on how to go about it when it comes to the API related items that could be written in TypeScript or JavaScript. I’m personally more familiar with the latter than the former as I haven’t really updated myself yet, though I’m at the stage where I just make edits to already existing code I copied elsewhere because I understand what the code is trying to say. Kind of like when I was still learning HTML and CSS when I was in grade school, editing existing themes so it would show my favorite color and certain images instead of whatever it came with when I initially copy-pasted it.

Through my search to fix how my webmentions were loading, I also stumbled upon [this blog post by Tracy Durnell](https://tracydurnell.com/2025/06/29/self-webmention-versus-self-pingback/) where she was trying to reconcile how to deal with self-pingbacks or self-webmentions—something I noticed myself as I kept linking back to previous posts of mine (in an effort to have some continuity in some of the things I post here). Her blog is on WordPress though, so I knew I needed to figure out something else for my own setup.

I *did* intend before for webmentions to function like Backlinks, as I thought it was the same, but… I decided against that, as now I have a section for Backlinks if a post is linked to another post[^1], and webmentions can just be its own section for external interactions.

I kept staring at my `webmentions.js` file since I figured the answer to fixing the self-mentions could be managed there, trying out a bunch of things before resigning to just ask a bit of help from AI on how to filter out mentions that both had my domain in the `wm-source` and `wm-target`. At least, judging from how the JSON file was generated in my `webmentions.json` was, I figured this could be a way for me to automatically filter out those links that get sent out when I post a new update on my website.

What the AI came up with was this function to be added in my `webmentions.js`:

```js
// webmentions.js
// ...

const OWN_ORIGIN = `https://${domain}`;

// A webmention is a self-mention if both source and target are on your own site
function isSelfWebmention(entry) {
  const source = entry["wm-source"] || "";
  const target = entry["wm-target"] || "";
  
  return source.startsWith(OWN_ORIGIN) && target.startsWith(OWN_ORIGIN);
}

function filterSelfWebmentions(children = []) {
  return children.filter((entry) => !isSelfWebmention(entry));
}

// ...
```

Then I just had to call those new functions later down the file:

```diff
// webmentions.js
// ...

// Merge fresh webmentions with cached entries, unique per ID
function mergeWebmentions(a, b) {
+  const merged = unionBy(a.children, b.children, "wm-id");
+  return filterSelfWebmentions(merged);
}

// ... more code ...

export default async function () {
  console.log(">>> Reading webmentions from cache...");
  const cache = readFromCache();

+ // Clean existing cache so self-mentions disappear right away
+ cache.children = filterSelfWebmentions(cache.children);

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
+     children: mergeWebmentions(cache, feed) // already filtered inside merge
  };
  
  writeToCache(webmentions);
  return webmentions;
  }
}

+  // Even if we didn’t fetch, this is now self-mention-free
  return cache;
}
```

And after initially testing this locally then pushing the changes up, seems like it’s cleaned up showing the linkbacks (?? web… mentions? 😆) that I set up for my own posts to other posts. Hooray!

I also checked out [brid.gy](https://brid.gy/) and after initially connecting my Mastodon account and BlueSky account, I now get the likes and reposts of my blog posts showing on my website as neat counters 😁[^2]

I intended to work on something else today, but oh well, that will just be for another day. At least I fixed my webmentions (again) 😆 In hindsight the setup shouldn’t have been *too* complicated, but it still was a bit confusing at the start since I was trying to do many things at once. Maybe in the future I’ll try to collate how I understand things so if someone encounters my post in the wild, they may be a bit more guided than how I was initially 😆

I shall stop writing now as it’s almost 6pm my time, and I want to play some games. *weeeeeeeee~*

[^1]: I wanted this to go two-way (so if I linked to another post in this current one, then the links should show up at the bottom too), but I’m still trying to figure that out as of this writing. For now I’m fine with the current setup, since… I don’t really have much of a choice HAHA I’ll just update it when I can 😆

[^2]: Though now if I do reply to my own post where I shared a link to my website, I do still show up in the replies… I will just let this be for now and just fix it in the future if I want to do that. 😛
