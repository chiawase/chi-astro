/* For listing all my accounts */
export type AccountLinks = {
  username?: string;
  platform: string;
  socialUrl: string;
  note?: string;
  customLabel?: string;
};

export const ACCOUNT_LINKS: AccountLinks[] = [
  {
    username: "@chiawase",
    platform: "Matrix.org",
    socialUrl: "https://matrix.to/#/@chiawase:matrix.org",
    note: "Recently set this up, it would be cool to get chats here to test it out",
  },
  {
    username: "@_chiawase",
    platform: "Threads",
    socialUrl: "https://threads.com/@_chiawase",
    note: "my new slop online",
  },
  {
    username: "@_chiawase",
    platform: "Instagram",
    socialUrl: "https://instagram.com/@_chiawase",
    note: "my public photo album of memories",
  },
  {
    username: "@chi@social.lol",
    platform: "Mastodon",
    socialUrl: "https://social.lol/@chi",
    note: "I usually go here if I want to interact with fediverse peeps or if I miss seeing things in chronological order",
  },
  {
    username: "@chisenires.design",
    platform: "BlueSky",
    socialUrl: "https://bsky.app/profile/chisenires.design",
    note: "I sometimes go here to chronologically go through topics",
  },
  {
    username: "chisenires",
    platform: "LinkedIn",
    socialUrl: "https://linkedin.com/in/chisenires",
    note: "mostly a lurker and reactor to things but occasionally posts random stuff I'm intereested in",
    customLabel: "Connect with me on LinkedIn",
  },
  {
    username: "@chiawase",
    platform: "DEV.to",
    socialUrl: "https://dev.to/chiawase",
    note: "I don’t really browse here much but it helps to have an account when I occasionally get links to DEV.to articles and I get to show support to the actual post",
  },
  {
    username: "@chiawase",
    platform: "Digg",
    socialUrl: "https://digg.com/@chiawase",
    note: "I got access to the beta version of Digg, and I’m just trying it out now!",
  },
  {
    username: "@chisenires",
    platform: "Figma Community",
    socialUrl: "https://figma.com/@chisenires",
  },
  {
    platform: "Designlab",
    socialUrl: "https://app.designlab.com/chisenires/",
    customLabel: "Designlab Mentor Profile",
  },
  {
    platform: "Strava",
    socialUrl: "https://www.strava.com/athletes/40002012",
    note: "rides occasionally now that I'm fully remote",
    customLabel: "Chi’s Strava profile",
  },
  {
    username: "ChiAwase",
    platform: "Twitch",
    socialUrl: "https://twitch.tv/ChiAwase",
    note: "on indefinite hiatus",
  },
  {
    username: "Arya Tsukino",
    platform: "FFXIV",
    socialUrl: "https://na.finalfantasyxiv.com/lodestone/character/36591732/",
    note: "on indefinite hiatus",
    customLabel: "Arya Tsukino @ Meteor - Ramuh #FFXIV",
  },
  {
    username: "@ChiSenires",
    platform: "Twitter",
    socialUrl: "https://twitter.com/ChiSenires",
    note: "last used July 2023, inactive and I’ve removed my posts there but keeping this up so my handle is still mine",
  },
  {
    username: "@_ChiAwase",
    platform: "Twitter",
    socialUrl: "https://twitter.com/_ChiAwase",
    note: "This was my first Twitter account which was my personal, but I also don’t use it anymore since 2023. Keeping it here so no one else can get the username",
  },
  // {
  //   username: "",
  //   platform: "",
  //   socialUrl: "",
  //   note: "",
  //   customLabel: "",
  // },
];
