export type MorePagesEntry = {
  title: string;
  url: string;
  children?: MorePagesEntry[];
};

// Keep this small + explicit.
// Add/remove pages here without having to fight glob edge-cases.
export const MORE_PAGES: MorePagesEntry[] = [
  { title: "Blogroll", url: "/blogroll/" },
  { title: "Colophon", url: "/colophon/" },
  { title: "Stuff I Use", url: "/stuff-i-use/" },
  { title: "Tags", url: "/tags/" },
  { title: "Archive", url: "/archive/" },
  { title: "Changelog", url: "/changelog/" },
  {
    title: "Media Log",
    url: "/media/",
    children: [
      { title: "Games", url: "/games/" },
      { title: "Manga", url: "/manga/" },
    ],
  },
  // { title: "replace", url: "/replace/" },

  // Optional: groups
  // {
  //   title: "Site",
  //   url: "/more/site/",
  //   children: [
  //     { title: "Colophon", url: "/colophon/" },
  //   ],
  // },
];
