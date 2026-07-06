<!-- markdownlint-disable MD013 -->

# Chi’s personal website built with Astro

<!-- badges for the lulz -->
<p>
	<img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues-raw/chiawase/chi-astro">
	<img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/chiawase/chi-astro">
</p>

This website was built on top of the [Astro Starter Kit: Blog template](https://github.com/withastro/astro/tree/latest/examples/blog?on=github) and then modified to make it look as closely as how my previous website looked like.

Migrated from 11ty. Talked more about it here: [Migrated from 11ty to Astro!](https://chisenires.design/blog/11ty-to-astro/)

Access the website at: [chisenires.design](https://chisenires.design)

## 🚀 Project Structure

```text
├── public/
├── src/
│   ├── _templates/        for Obsidian related templates only
│   ├── assets/
│   ├── components/
│   ├── content/
│   ├────── archive/       Archived posts by Chi from different platforms
│   ├────── blog/          Chi's blog posts
│   ├────── games/         Listing all of Chi's played games
│   ├────── manga/         Listing all of Chi's read manga
│   ├── data/              Site config data (blogroll, redirects, socials, etc.)
│   ├── layouts/
│   ├── pages/
│   ├── scripts/           Scripts used in package.json
│   ├── styles/
│   └── utils/             Housing all the JS/TS stuff to help get things done
├── uploads/               Media uploads organized by year and category
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

## Chi’s TODOs

> The rest of the TODOs are listed in my [Issues](https://github.com/chiawase/chi-astro/issues) tab, but the ones I have listed here are just for my additional reference.

- [ ] add some image gallery handling / viewing images closer (since some screenshots are small)
- [ ] also add WordPress archived posts here
