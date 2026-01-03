---
title: "Finally fixed the metadata generation and the auto social images!"
summary: I finally got Cloudinary to work with my 11ty blog and processed my images with the auto adding of text and rendering it as an image!
tags: 
- writing
- coding
pubDate: 2025-04-28T17:24:41+00:00
updatedDate: 2025-09-24T14:42:23+00:00
---

This is just a quick post for now because it's 1:25 AM where I'm at and I still have work and other things to finish tomorrow. But hooray! I finally got Cloudinary to work with my 11ty blog and processed my images with the auto adding of text and rendering it as an image! I got inspired by [Sia's blog post on social share images using Cloudinary](https://sia.codes/posts/social-share-images-using-cloudinary/), but admittedly there were some things that were going over my head when I first started working on this. (Which was... maybe around 5 or 6PM my time? ... Figuring that out took way too long 🙈)

Now I have a workflow in mind though. I might just continue using Cloudinary while I don't have any alternative for now. I was initially trying to look for an alternative, possibly even open sourced version, but I wasn't at all familiar with how image CDNs worked and how transformations can be carried through URLs and such, so I think this is good for now!

> If you'd like to try out Cloudinary for your site's CDN, you can sign up using [my referral link](https://cloudinary.com/invites/lpov9zyyucivvxsnalc5/yks8gwi2hltjef4vokiu?t=default). (I'll get 3 free credits!)

I can finally mark this off my TODO list in my [README.md](https://github.com/chiawase/chi-11ty/blob/main/README.md) 🙏🏻 but I might try to refine this a bit more. I didn't get to use the font of my choice for this... I still don't get why me calling the `InconsolataSemibold.woff2` file that I already uploaded based on the instructions I saw didn't work the way it should. Or maybe... it should work again soon? The syntax of the URLs changed from how it was initially showcased in Sia's blog. I did it something like this:

```js
// Create socialImageUrl shortcode
// Applying the code from https://sia.codes/posts/social-share-images-using-cloudinary/
eleventyConfig.addShortcode("socialImageUrl", (title, description) => {
  // Thumbnail Image particulars
  const width = "1280";
  const height = "640";
  const imageConfig = `c_fill,h_${height},w_${width}/f_png/q_auto:best`;
  
  // encoding title (instead of passing in a function for now)
  const encodedTitle = encodeURIComponent(title)
    .replace(/(%2C)/g, '%252C')
    .replace(/(%2F)/g, '%252F');

  // URL on thumbnail particulars
  const urlConfig = `co_rgb:${TEXT_COLOR},l_text:${URL_FONT}_${URL_FONT_SIZE}_bold_normal_left:${URL_VALUE}/fl_layer_apply,g_south_west,x_${TEXT_LEFT_OFFSET},y_${URL_BOTTOM_OFFSET}`;
    
  // Title on thumbnail particulars
  const titleConfig = `co_rgb:${TEXT_COLOR},c_fit,w_${TEXT_AREA_WIDTH},l_text:${TITLE_FONT}_${TITLE_FONT_SIZE}_bold_normal_left:${encodedTitle}/fl_layer_apply,g_south_west,x_${TEXT_LEFT_OFFSET},y_${TITLE_BOTTOM_OFFSET}`;

  // encoding description (instead of passing in a function for now)
  const encodedDescription = encodeURIComponent(description)
      .replace(/(%2C)/g, '%252C')
      .replace(/(%2F)/g, '%252F');
  
  // Subtitle particulars
  const taglineConfig = `co_rgb:${TEXT_COLOR},c_fit,w_${TEXT_AREA_WIDTH},l_text:${TAGLINE_FONT}_${TAGLINE_FONT_SIZE}_normal_left:${encodedDescription}/fl_layer_apply,g_north_west,x_${TEXT_LEFT_OFFSET},y_${TAGLINE_TOP_OFFSET}`;

  return `${BASE_URL}${imageConfig}/${titleConfig}/${taglineConfig}/${urlConfig}/${FOLDER}${SHARE_IMAGE_FILE_NAME}`;
  });
```

I had to constantly alt-tab to the online Transformation tool Cloudinary had just to get the formatting right 😩 I'm happy I eventually got to figure it out.

But OK! Hard stop here! It's 1:34AM! I need to sleep 😴 Webmentions next, maybe!
