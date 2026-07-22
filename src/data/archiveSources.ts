export type ArchiveSourceEntry = {
  title: string;
  url: string;
  source: "wordpress" | "microblog" | "tumblr";
  description?: string;
  enabled?: boolean;
};

export const ARCHIVE_SOURCES: ArchiveSourceEntry[] = [
  {
    title: "All archives",
    url: "/archive/",
    source: "microblog",
    description: "Every post from every source, newest first.",
  },
  {
    title: "Micro.blog",
    url: "/archive/microblog/",
    source: "microblog",
    description:
      "Posts from when my site was hosted on Micro.blog (~2021-2025).",
    enabled: true,
  },
  {
    title: "WordPress",
    url: "/archive/wordpress/",
    source: "wordpress",
    description:
      'Posts from my older blog, "A Collection of Thoughts from Yesterday\'s Tomorrow" (~2010-2018?).',
    enabled: true,
  },
  // {
  //   title: "",
  //   url: "/archive/",
  // source: "tumblr",
  //   description: "",
  //   enabled: false,
  // },
];
