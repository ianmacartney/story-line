// OPTIONAL: Rename this file to `schema.ts` to declare the shape
// of the data in your database.
// See https://docs.convex.dev/database/schemas.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    stories: defineTable({
      code: v.string(),
      over: v.boolean(),
      lines: v.array(v.string()),
    }).index("code", ["code"]),
    players: defineTable({
      phone: v.string(),
      storyId: v.id("stories"),
      turn: v.boolean(),
    })
      .index("phone", ["phone"])
      .index("storyId", ["storyId"]),
  },
  { schemaValidation: false }
);
