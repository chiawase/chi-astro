<!-- markdownlint-disable MD013 -->
# Chi's personal website built with Astro

> As of 24 Dec 2025: Still a work in progress.

This website was built on top of the Astro Starter Kit: Blog template.

## 🚀 Project Structure

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
│   └── styles/
│   └── utils/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

## Chi's TODOs

- [ ] fix webmention reply formatting
- [x] attempt to fix wikilinks and backlinks ~~using the `@braindb/astro` thing~~
  - note: did not use `@braindb/astro` since the implementation for it on my end seemed broken, made use of [@flowershow/remark-wiki-link](https://github.com/flowershow/remark-wiki-link) instead since it’s the one that worked for me
- [ ] implement preview images and see if cloudinary still works for this setup
- [x] fix heading anchors (they exist but are not rendered with styles)
- [ ] youtube embeds?
- [x] better Image handling? --- using [rehype-figure-title](https://github.com/futuraprime/rehype-figure-title) for this!
- [ ] also investigate the timestamps rendered... might not be showing the local time as I wanted it to go 🤔
