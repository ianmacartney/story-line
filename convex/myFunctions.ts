import { ConvexError, v } from "convex/values";
import { query, mutation, action, QueryCtx } from "./_generated/server";
import { api } from "./_generated/api";

export const start = mutation({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    const { story } = await getPlayerStory(ctx, phone);
    if (story && !story.over) {
      throw new ConvexError("already playing");
    }
    const code = randomSlug();
    const storyId = await ctx.db.insert("stories", {
      code,
      over: false,
      lines: [],
    });
    const playerId = await ctx.db.insert("players", {
      phone,
      storyId,
      turn: true,
    });

    return code;
  },
});

export const join = mutation({
  args: { phone: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const story = await getStoryByCode(ctx, args.code);
    if (story.over) {
      throw new ConvexError("story is over");
    }
    const playerId = await ctx.db.insert("players", {
      phone: args.phone,
      storyId: story._id,
      turn: false,
    });
    return "Joined";
  },
});

export const addLine = mutation({
  args: { phone: v.string(), line: v.string() },
  handler: async (ctx, args) => {
    const { player, story } = await getPlayerStory(ctx, args.phone);
    if (!player) {
      throw new ConvexError("no player found");
    }
    if (!player.turn) {
      throw new ConvexError("not your turn");
    }
    if (!story) {
      throw new ConvexError("no story found");
    }
    if (story.over) {
      throw new ConvexError("story is over");
    }
    story.lines.push(args.line);
    await ctx.db.replace(story._id, story);
    await ctx.db.patch(player._id, { turn: false });
    const players = await ctx.db
      .query("players")
      .withIndex("storyId", (q) => q.eq("storyId", story._id))
      .collect();
    const playerIndex = players.findIndex((p) => p._id === player._id);
    const nextPlayer = players[(playerIndex + 1) % players.length];
    await ctx.db.patch(nextPlayer._id, { turn: true });
    return { phone: nextPlayer.phone, line: args.line };
  },
});

export const end = mutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const { player, story } = await getPlayerStory(ctx, args.phone);
    if (!player) {
      throw new ConvexError("no player found");
    }
    if (!player.turn) {
      throw new ConvexError("not your turn");
    }
    if (!story) {
      throw new ConvexError("no story found");
    }
    if (story.over) {
      throw new ConvexError("story is over");
    }
    await ctx.db.patch(story._id, { over: true });
    const players = await ctx.db
      .query("players")
      .withIndex("storyId", (q) => q.eq("storyId", story._id))
      .collect();
    return {
      phones: players.map((p) => p.phone),
      url: process.env.CONVEX_SITE_URL + "/view?code=" + story.code,
    };
  },
});

export const getStory = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const story = await getStoryByCode(ctx, args.code);
    return story.lines;
  },
});

async function getStoryByCode(ctx: QueryCtx, code: string) {
  const story = await ctx.db
    .query("stories")
    .withIndex("code", (q) => q.eq("code", code))
    .order("desc")
    .first();
  if (!story) {
    throw new ConvexError("no story found");
  }
  return story;
}

async function getPlayerStory(ctx: QueryCtx, phone: string) {
  const player = await ctx.db
    .query("players")
    .withIndex("phone", (q) => q.eq("phone", phone))
    .order("desc")
    .first();
  const story = player && (await ctx.db.get(player.storyId));
  return { player, story };
}

const LETTERS = [
  "B",
  "C",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "V",
  "W",
  "X",
  "Z",
  "2",
  "5",
  "6",
  "9",
];
export const randomSlug = (): string => {
  const acc = [];
  for (let i = 0; i < 4; i++) {
    acc.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  }
  return acc.join("");
};
