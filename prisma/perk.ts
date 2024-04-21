import { Prisma } from "@prisma/client";

export const perkSeedList: Prisma.PerkCreateInput[] = [
  {
    name: "Show Answer",
    description: "Reveals the correct answer",
    duration: 30000,
    type: "SHOW_ANSWER",
    icon: "👁️",
    price: 950,
  },
  {
    name: "Remove Two Wrong Answer",
    description: "Removes two incorrect options from the current problem",
    type: "REMOVE_TWO_WRONG_ANSWER",
    icon: "❌",
    price: 150,
  },
  {
    name: "New Problem",
    description: "Replaces the current problem with a new one",
    type: "NEW_PROBLEM",
    icon: "🔄",
    price: 50,
  },
  {
    name: "Shield",
    description: "Protects the user from a wrong answer",
    type: "SHIELD",
    icon: "🛡️",
    price: 400,
  },
  {
    name: "Extra Time",
    description: "Adds extra 1 minute time to the timer",
    type: "EXTRA_TIME",
    icon: "⏱️",
    price: 500,
  },
  {
    name: "Add Max Time",
    description: "Adds 1 minute to max time of the timer",
    type: "ADD_MAX_TIME",
    icon: "⏳",
    price: 600,
  },
  {
    name: "Double Score",
    description: "Doubles the score earned for a minute",
    type: "DOUBLE_SCORE",
    icon: "💯",
    price: 700,
  },
  {
    name: "Double Coin",
    description: "Doubles coins earned for a minute",
    type: "DOUBLE_COIN",
    icon: "💰",
    price: 800,
  },
  {
    name: "Lucky Strike",
    description: "The next answer will be correct regardless",
    type: "LUCKY_STRIKE",
    icon: "🍀",
    price: 900,
  },
];
