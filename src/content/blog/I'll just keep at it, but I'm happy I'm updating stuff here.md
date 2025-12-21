---
title: "I'll just keep at it, but I'm happy I'm updating stuff here"
description: "I wanted to type on my keyboard. Mulling over the things I've been working on the past few days on my website now, like webmentions and the date format fix I did!"
tags: 
- writing
- coding
pubDate: 2025-07-30T14:47:15+00:00
updatedDate: 2025-09-24T14:43:32+00:00
---

As of writing this, I'm still not sure if my Webmentions setup actually works. I've added an additional `NODE_ENV` declaration in my web server, hoping that would ... maybe fix things? hahaha

Me running `npm start build:local` works fine on my machine. _inb4 "it works fine on MY machine"_ 🤪

I also do not know why the Mastodon link preview "link back to my account" doesn't work, when I've already followed all the instructions I've seen online. [Shared about it on Mastodon](https://social.lol/@chi/114942667132035344), and as of writing this too, seems like the issue might be tied to my thumbnail images (???) don't know how that works, but maybe in the next few days, future me will figure it out 😆

There's so many more things I wanna fix, and part of that also involves me understanding what the _things_ I'm fixing are supposed to be. Like... right now, I understand that the general webmention created is of a `mention-of` type, but now I wonder how you do those replies, and what reposts are (and how are they different from just mentions)?

I'm gonna give myself a hard stop for tonight on this because I still have some laundry to fold and I want to do not-code for the rest of my evening.

Just as a last aside before I wrap up this post: I'm super happy I figured out how to fix the date issue I had with a filter I added to show dates in a particular format 😆 There was a good 1 hour earlier of me just getting confused why I kept getting `Invalid DateTime` whenever I tried to render the string of text that, to me, looked like a valid input to the filter to get it to output it in a different format, but I'm assuming JavaScript was just being JavaScript-y and was being finicky with me feeding it a String when I wanted to turn it into a Date. I don't know. What I know is, making the code like this:

```js
import { DateTime } from "luxon";

export default function(eleventyConfig) {
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    let d = new Date(dateObj); // this was the only addition I made
    return DateTime.fromJSDate(d).toFormat("fff"); // also changed the variable called here
  });

  ... // more filters
```

Instead of keeping it just to the `return` line helped fix the long standing DateTime issue I had. Hooray!

Alright, I have chores to get back to. I'm also happy whenever people online reply to my ramblings or musings on the fediverse or elsewhere. I hope I can immerse myself a bit more and more intentional in the IndieWeb soon. For the longest time, I've just been lurking and reading things from time to time, but now since I have more motivation to get things done, I'll do just that. 😁

**Update 09:26AM:** Hooray the linking back to my fediverse account when sharing links in Mastodon works now 😄 I think I just needed to wait for it to propagate haha

(i would share an image here but I'm still figuring that part out with auto-uploading to CDN for images and such or whatever, still need to rethink my media organization here XD soon™️)
