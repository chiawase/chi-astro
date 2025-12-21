---
title: I am so close to just setting up a Linux distro on my PC.
description: "Long story short: my Windows setup is a doozy for code and it seems simpler to just have to deal with Linux shenanigans than... whatever I have now lol"
pubDate: 2025-11-28T16:29:26+00:00
updatedDate: 2025-12-11T08:08:32+00:00
tags: 
- writing
- coding
- linux
postLanguage: 
---

I spent the last hour doing the following for my website:
- trying to install [punycode](https://www.npmjs.com/package/punycode) via `npm install` on my repo that´s on my Windows drive only to be faced with `EACCESS` errors in the terminal
- moved my website setup from my Windows mounted drive into WSL for the “proper” experience lolol
- ended up installing Obsidian on my WSL Ubuntu setup just so I could keep my current workflow of writing my blog posts with auto Markdown and all the plugins I have set up
- installed emoji fonts on the WSL Ubuntu setup because when I loaded my current personal (and private) Obisidan vault, a lot of the emojis I rely on via my emoji autocomplete plugin were just… tofu boxes lmao

I felt ridiculous after doing all of this. But I’m happy it didn’t take me the whole day to do so, only just a few hours.

Since I still would like to be able to work on my website on my work Macbook _and_ my personal PC (regardless of what OS is on my PC), I guess the most logical next step is to try out a dual boot of some Linux distro and Windows. I can’t fully let go of Windows yet, I think, because I still would like to play some games on my PC, like Cyberpunk 2077 (I have yet to continue this one story quest because I keep dying at inopportune times and I wanna do the mission perfectly… grrr hahaha).

I might try out [NixOS](https://nixos.org/) just because my boyfriend currently has that setup on his machine, though in the past I have also tried out [Lubuntu](https://lubuntu.me/) because I used to have a less-powerful PC and that distro worked for my use case at the time.

I am busy this weekend though, so this is most likely going to be a project done during the holidays. Next week is when I plan to start on it, hopefully I don’t lose the desire to just… have a “simple” setup for when I want to code, and also still have access to Windows for mouse-and-keyboard type games.

Funny how this came about because I wanted to at least start working on a fix for [my current issue with metadata images not rendering properly when there’s an emoji in the title](https://github.com/chiawase/chi-11ty/issues/12). I already [learned about punycode at the start of this month](https://www.threads.com/@_chiawase/post/DQthA3SEm_H?xmt=AQF0-EiLau2rSTmxEpYFofg241hVxmNWQ0XOUJOQxLdCZQ), when I was mulling over a quick website idea for (government) websites to allow special characters in forms so I can spell my name properly. (I wish to keep my `ñ` intact when I type out my name pls :<)

It also took me this long to properly set up my VS Code to connect to my WSL instance in my Windows PC properly. I know I tried it before and failed, for some reason, but I don’t remember why it wasn’t working for me before. At least now, when I run `npm start`, there’s a neat pop-up notification that leads me to the port where my website was built, and not me just typing that in my browser’s URL bar or by `Ctrl`+clicking the link in the terminal.

Also, right now my PC has two Obsidian apps installed—one on Windows and one in WSL. 🤣

So if I want to write in my blog, I open the Obsidian (Ubuntu) app… then if I want to access my private Obsidian Vault, I open the Windows app.

*Why not just open both in the Ubuntu version*, you may be thinking as you read this. Well, I did try initially, but that got me to discover that I needed to install more fonts if I wanted my Obsidian note setup to render properly in the Ubuntu app, plus emoji fonts weren’t included yet. And the Ubuntu app doesn’t keep my zoom preference, surprisingly enough. Though I know that’s something configurable in the settings, I figured it was time for me to get on the Linux hype train since I have been hearing about it for the past few months now haha

I’d also feel more comfy working on my website in an OS that understands that I just want to work on my personal website, no other fancy bells and whistles, just lets me install (and uninstall) things whenever I trigger them.

Alright, I’ll end it here for now. I just wanted an excuse to write a blog in the Obsidian (Ubuntu) app lol

> **Update 11 Dec 2025**: I’ve set up a dual-boot with my PC into Linux. I talk about it more here: [Dual-booted into Linux for my PC!](dual%20boot%20linux%20pc.md)
