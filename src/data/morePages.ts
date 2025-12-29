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

  // Optional: groups
  // {
  //   title: "Site",
  //   url: "/more/site/",
  //   children: [
  //     { title: "Colophon", url: "/colophon/" },
  //   ],
  // },
];
