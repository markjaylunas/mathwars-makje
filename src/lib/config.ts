import { MainNavItem, SidebarNavItem, UserNavItem } from "@lib/types";
import { Icons } from "../components/ui/icons";

export const siteConfig = {
  name: "mathwars",
  url: "https://mathwars.makje.com",
  description: "Mathwars created by Makje",
  links: {
    github: "https://github.com/markjaylunas",
  },
};

export type SiteConfig = typeof siteConfig;

interface RoutesConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
  userNav: UserNavItem[];
}

export const routesConfig: RoutesConfig = {
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ],
  sidebarNav: [
    {
      title: "Main",
      items: [
        {
          title: "Home",
          href: "/home",
          items: [],
        },
        {
          title: "Leaderboard",
          href: "/leaderboard",
          items: [],
        },
        {
          title: "Friends",
          href: "/friends",
          items: [],
        },
      ],
    },
  ],
  userNav: [
    {
      title: "My Account",
      items: [
        {
          title: "Profile",
          href: "/user",
          items: [],
          icon: "user",
        },
        {
          title: "Setting",
          href: "/setting",
          items: [],
          icon: "setting",
        },
      ],
    },
    {
      title: "",
      items: [
        {
          title: "GitHub",
          href: siteConfig.links.github,
          items: [],
          icon: "gitHub",
        },
      ],
    },
  ],
};
