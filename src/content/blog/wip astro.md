---
title: "Work in Progress: rebuilding this website on Astro"
description: I intended to share this when I was done with it, but reasons got me to push it to my public repo and I wanted to write something about it anyways lol
pubDate: 2025-12-24T06:03:02+00:00
updatedDate: 2025-12-24T06:33:15+00:00
tags: 
- writing
- coding
- astro
- 11ty
post_language: 
---

I initially intended to share this once I finished doing it, but I am *not* yet finished and I need to go to my parent’s house this Christmas, so here. 😆

I’ve pushed the repo I have so far on my personal Github account; if you are curious, you can view it here: [chi-astro](https://github.com/chiawase/chi-astro/tree/main)

Generally aiming for a 1:1 copy of how my current setup right now in 11ty works, and I’m doing my best to limit doing any drastic changes to styles and functionality for now as I’m doing this since I do want to keep the stuff I still have up. So far so good with the styles, it’s now really just the Astro components and figuring out how certain things get set up in Astro versus in 11ty that’s taking a while for me to figure out.

Like for example, right now I’m in the middle of fixing how backlinks and wikilinks work in Astro. In eleventy, all it took was installing some npm plugins and just adding it to the config, but seems like that’s a bit of a challenge (?) in Astro as I tried doing that now (following [this tutorial from the Astro Digital Garden](https://astro-digital-garden.stereobooster.com/recipes/backlinks/) on backlinks) but it seems like there’s something wrong with how… stuff?? is set up? I initially tried [remark-wiki-link](https://github.com/landakram/remark-wiki-link?tab=readme-ov-file) too, and it *kinda* worked, but it wasn’t giving the right link when it was rendered and the thing I tried to fix or update that wasn’t working.

So far though, I do like how I am understanding where things are and how they’re set up. It’s also helping me become more familiar with the syntax as the other place I see Astro is with our internal design system docs at work, so I like that working on this is also helping me appreciate how our components are set up in our internal DS and how they’re being called into the docs themselves.

For now, what I can share is just the repo of where the code lives, and a screenshot or side-by-side comparison with what I have here in my 11ty setup and how it fares with my Astro rendition.

![Screenshot of Chi’s personal website, the left being the render in Eleventy, while the right is built with Astro.](../img/uploads/2025/Pasted%20image%2020251224143132.png "I don’t have the archives/ folder in the Astro build yet as I focused on my blog posts for now, but it’s slowly getting there")

Also if you check the commits, you’ll find that the first ever commit is *one big commit* because I initially just wanted to do the “first” ever commit to my Astro setup as… “set up current personal website in Astro”. But I’m learning now that it’s not as simple as just importing my `.md` files and pages 😆 (I mean, it could be, but I also wanted to keep the current styles, so… yeah haha)

My goal for this is to finish some MVP of it—really just making sure my site still functions like how it does now with Eleventy + maybe figuring out redirects—before the Christmas break ends. So that includes until January 2. 😛

As for the reason why I’m doing this? Well, aside from wanting to familiarize myself with Astro, I just want to see if the redirects would work better and make more sense when setting it up in Astro versus how I was trying to do it in 11ty initially. I’m also not deploying my website on something known like Netlify, so that adds to the difficulty (since I can’t simply follow the numerous tutorials on it online) but hopefully this works out with our setup in Coolify. 😆

Wish me luck! And happy holidays to those who celebrate 🎅🎄
