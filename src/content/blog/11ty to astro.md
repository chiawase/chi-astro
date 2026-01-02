---
title: Migrated from 11ty to Astro!
description:
pubDate: 2025-12-29T17:34:13+00:00
updatedDate: 2025-12-29T19:27:45+00:00
tags: 
- writing
- coding
- 11ty
- astro
postLanguage: english
---

I’ve done it, this site is now built using [Astro](https://astro.build/)!

I’ve just done an almost 1:1 port—with some creative liberties here and there for some parts—from my previous [11ty](https://www.11ty.dev/) setup. I think I’ll still keep the old implementation in my Github, until I figure out something else to do with this: [chi-11ty](https://github.com/chiawase/chi-11ty) (I might even archive it so it would be frozen in this moment in time)

I even learned that I could transfer issues from one repo to another, so now I’ve moved all the active issues I listed in my 11ty repo to Astro 😆

Now, this migration is a far cry from how my site was before; in my 11ty setup, I used to have my micro.blog posts just _merged_ into the whole collection, albeit haphazardly, but now… I’ve momentarily chosen to delay dealing with that on another day.

I have sooooo many things I want to do with my website. Not to mention it’s almost the end of the year 2025! I wanted to make a wrap up post initially! But instead, it was spent putting together this update with my website setup so I could feel a bit more empowered in using it.

## Why switch?

A few things:

- We use Astro at work for our internal design system (initially I thought it was just solely for the documentation, but the more I play around with Astro stuff in my personal website, the more I realize it might also just be how our components are set up… well, they are Web Components, so I guess that’s also a major factor? 😅 I’m personally still making sense of it as I go)
- I know Astro is relatively new, so while that could be considered undesirable considering 11ty has been around longer—therefore there’d be more documentation around it—I figured I’d just try to keep up with this one, mostly because also of my desire to improve in my first point.
- My boyfriend suggested it to me every time I complained to him about an issue I would have with figuring out how to do something in 11ty before 😅 so I figured I’d try it.

So, now I’m here. Now, what?

## The creative liberties exercised

Let me get this out of the way first: it was not easy at all to port my 11ty setup into Astro 🙈 There were a lot of times when I scratched my head with what to do, initially because I was not that familiar yet with TypeScript syntax and had to get familiar with it, and the more I kept familiarizing myself, the problems I had evolved with my understanding.

Before, I just had to figure out how to make something appear. After that, as I kept doing things… I would then want to make the thing that appear be handled in a more efficient manner.

(This is mostly in relation to managing my webmentions lol that was a doozy to set up)

I’ll admit as well: I asked help from ChatGPT for crafting some of the components and pages that make up my website. And it helped a ton with the initial setup, and with helping make sense of how to make something I would initially write based on my own understanding into a more robust solution.

### An example: reimplementing webmentions

> TL;DR for this section is just me sharing my initial experience with learning about Astro components. You can skip to [the next section](#missing-parts) if you just want to read the overarching stuff 😆

I initially just got my Webmentions implementation from 11ty and plopped it in the `BlogPost.astro` page, and I had a lot of redundant code at the start. I would be calling the same functions to pull the `webmentions.json` content into the `index.astro` page (which points to my Home page) and the `blog/index.astro` page too (which points to the Blog page, listing all the blog posts in my site) and it even extended to `BlogPost.astro` and all the other components relating to getting the Webmentions to display.

As I kept adjusting it to make sure it shows the same thing I’d see in my then-deployed-site-with-11ty, eventually I’d get this urge to standardize the way webmentions get passed around the different components that get called in a page.

So before, I’d just have:

- `WebmentionsLoader.astro` as the big component that shows the big Webmentions section in a Blog Post
- `Webmentions.astro` which… technically is also about showing the Webmentions section in a Blog Post
- `Webmention.astro` which is the component for showing the individual webmention reply
- `@utils/webmentions.js` was also generally ported from 11ty to Astro with little to no changes then

But for showing the summary, I would be going into `index.astro` and `blog/index.astro` and I’d be making my site reload the webmentions for each post loaded in these pages, as I placed the function call within the for-loop for fetching each post.

Eventually, I managed to fix this with a bit of help (and a _lot_ of back and forth)/with the ChatGPT LLM just so I had another place to do a sanity check in case I missed anything else in the various files I was dealing with.

Having ChatGPT also output the code exactly in how it should be laid out also helped me understand how the different components and pages worked in Astro, as well as the differences between how to lay out `.astro` files versus `.mdx` and such. I would also occasionally feign just copy pasting the output and typing it myself, like copying someone’s homework or implementation, while taking note of what each line of code does. I used to do this back in college, when I was still studying CompSci 😆

Every now and then I’d change a variable name to something else, for a whole slew of reasons. It may be because it’s been already declared differently in my other files, or I just feel like changing it, or if I just want the variable to make more sense to future me (who may forget how to do these things) so at least my code would be a bit more human readable, or Chi-readable. 😛

So now, my webmentions setup is like this (I laid it out in my [Colophon](/colophon/) page too):

- `@utils/webmentions.js` as the main script for fetching the data from the Webmentions API
- `@utils/webmentionFilters.js` contain helpers for processing the webmentions data
- `@components/WebmentionsLoader.astro` is a component used in for fetching and showing the webmentions in the `BlogPost.astro` page (so, when viewing a blog post)
- `@components/Webmentions.astro` is the component that _actually_ shows the Webmentions section, where it’d pull the summary and the individual mentions / replies for the specific post it’s in
- `@components/Webmention.astro` is the component to render the webmention card itself
	- if you want to see an example, you can view [[/blog/my-personal-website-should-have-support-for-webmentions-now/#webmentions|this post’s webmentions]]
- `@components/WebmentionsSummary.astro` is the component to show the _summary_ of the total webmentions for a post, so the number of likes, reposts, etc. plus showing the avatars of the people who did those mentions
- `@components/WebmentionAvatars.astro` is the component to show the webmention author’s picture

From 4 files to 7 😆 I didn’t mind the many files and instead just wanted to make sure that things were in specific places where, if something were to happen, it’d be easier to check where it went wrong. :))

I’m happy with how it turned out, though there are still some things to be ironed out, like the number of replies doesn’t show, probably because of some logic done in the script itself.

I also would remove all the webmentions that I myself would make, which usually gets fetched because of brid.gy stuff (like if I share my website’s post on Mastodon or BlueSky and then reply to that post) or because I’d be mentioning posts from my website, too. Before, I intended webmentions to also function like Backlinks for me, but… I decided otherwise, for now. 😆

## Missing parts

The migration from 11ty to Astro is not without its losses. This section will be mostly dedicated to the things I couldn’t figure out how to port into Astro yet, either because there’s no existing plugin that would make that easier for me, or I just couldn’t figure it out myself yet.

### Blog Stats page

I definitely will miss the Blog Stats page I used to have set up. I’m just gonna share the version of the page in my 11ty port while I still have it up—[you can view it here](https://11ty.chisenires.design/blog-stats/)—as a way to remember this existing for a few months. (maybe it was even just … a month ago lol I haven’t checked 😆)

I did try to check if anyone else has done something similar, and I didn’t find anything existing. Part of me wants to maybe figure out how to do it in Astro too, considering it is… technically just a bit of JavaScript/TypeScript and making a visual graph out of it? But… it has to get in line with the rest of the things I want to do 😆🙈

### Backlinks

This is more of a skill issue on my part than anything else, I think. It supposedly can be implemented with ease with the use of [BrainDB](https://github.com/stereobooster/braindb), but no matter what I did, it wouldn’t work as intended. The docs of the site do say that it’s still a work in progress, so I guess that’s also the reason why it’s not working out of the box just yet.

## Added or improved things

I also want to set up a section dedicated to all the things I added or made better as I was migrating things to Astro!

### Cloudinary social media images are easier now

Or I guess because of my exposure, I’ve come to understand it more and more as I use it 😆

Either way, I was happy to find out that Astro [has docs related to Cloudinary](https://docs.astro.build/en/guides/media/cloudinary/) and studied how to make the integration work so my posts still have the generated social media link based on the post details. Because of this, I have newfound appreciation for how this thing works. Just… everything in the URL! Cool!

### A “back to top” link… at the bottom

When I made longer blog posts before and get to the end (mostly for checking what I wrote), I’ve always been wanting to add a “back to top” button in my footer. I just never got around to doing it in 11ty before. Well now, I remembered it in Astro. You can see it at the bottom 😁

### Also fixed the color scheme changing

In the [11ty version of my site](https://11ty.chisenires.design), I initially had a similar implementation of the dark-mode-switch that I also have in my header now. The icons were switched, though, and the site would have a split second flash happen because the light color scheme would load first before the browser realizes if there’s a different setting preferred. That annoyed me before, so I made sure to fix it in Astro.

I made sure to make the choice more persistent, and also make sure the styles load _first_ before everything else so the data gets preserved. And this was all done using minimal JavaScript and just also using CSS. (Or at least, I’d like to think it’s minimal?)

The actual switch trigger is set up in the `@components/ThemeIcon.astro` component, while the persistent state is managed in the `@components/ColorSchemePreference.astro` component.

### Image captions now show at the bottom of the image

Thanks to [rehype-figure-title](https://github.com/futuraprime/rehype-figure-title), all images in my blog posts will show a caption if I decide to add a title attribute to it. Hooray! And there’s the added bonus that some image transformation is also done by Astro to make the processing more efficient when someone goes through the pages of my site. It does render as `.webp` files for now, I’ve yet to figure out if I could just set those to `.png` or if I should even bother (since I wanna see what the benefit of having it as `.webp` really is).

### A bonus from rehype plugins: emojis on my posts are a bit more accessible

This is thanks to [rehype-accessible-emojis](https://www.npmjs.com/package/rehype-accessible-emojis?activeTab=readme)! I initially just copied the example from the Astro docs, but after seeing the effect, I figured I’d just keep it.

I’m personally not sure what non-sighted users see when the screen readers encounter emojis on a page—or more than one emoji, for that matter—but based on the initial implementation, I do hope this makes it a bit better? If I do get feedback that this is more detrimental than it is benificial, though, I’ll just remove it.

## Listing things I want to work on next

These are all just gonna be top of mind, what I want to continue working on as the new year comes (since I am writing this on 30 December 2025—2 days until New Years! haha) since I like writing lists.

And while I do have the Issues tab in my website’s repo linked in the footer here as a means for me to remember the things I _do_ want to eventually fix (and log a commit for it), here is a list of things I want to eventually work on here, in no particular order:

1. add a way for images to be viewed in its full view / in a new tab? if I have any images on my posts
	- as I figured out how to add images to my blog posts, I realized more and more that I needed a way to show the image in its full view ESPECIALLY if the image is of a screenshot of something. I do write alt text and captions for the images whenever and wherever I can, but sometimes one just wants to zoom in or see the image in its full view for a bit.
2. In relation to images: maybe also style how source attributions would be styled in the caption (if included)
3. another in relation to images: eventually I’d like to figure out how to show the first image of a post in the generated social media image as a preview instead of my current one that just shows an arbitrary backdrop with text 😆
4. Finally set up the archives for my old posts, and properly set up the redirects too
	- I was finding it really had to figure out how to set this up back when I still had my site in 11ty, as most of the docs or posts I’d find relayed the redirects to their hosting service (e.g. Netlify), which I couldn’t necessarily copy 1:1 because I was on a different service (i.e. Coolify). I did attempt to do this through a `redirects.njk` file, but I’m not sure if it ever managed to work. I think I was missing some steps to make it happen… 🙈
	- I initially saw from Astro’s docs that redirects seem to be more straightforward to setup, so I have hope that I’ll figure this out soon. Hopefully, I do actually figure it out haha so I could at least save some of the old shared links in the past and redirect it to the updated version of my site’s post 😁
5. Speaking of archives… I also am curious if it’s easy to just set up a “backup” of sorts for my website’s current “state” into the Internet Archive or somewhere else similar. It used to be a setting in my Micro.blog site, that I lost when I moved to 11ty, so now I’m thinking of getting it back.
6. I also want to set up a `media/` section in my site where I can make posts for the different **games** and **manga** I consume and finally have a _space_ to talk about it without having to worry about accidentally spoiling people online 😆
	- the main inspiration for this is from anhvn’s own implementation of her game posts (e.g. her page for [her thoughts on playing Hades 2](https://anhvn.com/games/hades-ii/)) with matching spoiler tags that, initially, seem easy enough to implement with just CSS and maybe some JavaScript? Maybe? Or another rehype/remark plugin?
	- The main motivation of this is so I could dump the thoughts of all the [manga I’m reading](/now/#manga) and so I could also write down my thoughts on playing Expedition 33. I’ve already finished the game once, I’ve yet to finish it in my current playthrough, so I’d like to be able to log that somewhere in my site hehe
7. I also need to figure out how to get the `updatedDate` frontmatter in my `.mdx` files to update while I write stuff thru Obsidian. Right now it seems like no matter what community plugin I use, Obsidian just wouldn’t touch any of my `.mdx` files, which may pose a problem in the future…
	- For now I’ll just have to resort to manually updating it myself until I figure out a better solution. Whether that’s on the Obsidian side or maybe as a component in Astro, I’ll just see in the future.

Okay, before this goes any longer, I’ll stop there for now. It’s already past 3AM where I’m at, and while I don’t feel too sleepy as of the moment, I figure I should give my body time to rest as it’s been a long—but productive!—day.

Aside from my website, there’s also a shitton of _other things_ I have to tend to, which have all been delayed or pushed aside because I kinda hyperfixated on getting my website done for the past… month? or so… so with me now on Astro, maybe things can start to cool down a bit and I can allocate some of my focus to some of those other important things that I said to myself I’d get to during the break.

With all that said, if ever you see any bug on my site or if something doesn’t work, I’d definitely appreciate the ping! Just [reach out to me online](/contact/) so I could flag it 😅

One more thing before I forget: I also want to eventually write a “how to use my site” docs thing for myself for… future me 😆 as I add more things here, the more moving parts there are, and I’d like to make sure I still understand the very thing I set up before it all just goes very crazy :))

Alright, really stopping it here now, happy last 2 days until end of 2025! 💨
