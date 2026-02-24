import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  courierLocations: defineTable({
    courierId: v.string(),
    lat: v.number(),
    lng: v.number(),
    updatedAt: v.number(),
  }),
});