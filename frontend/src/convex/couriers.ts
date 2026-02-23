import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const updateLocation = mutation({
  args: {
    courierId: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("courierLocations")
      .filter(q => q.eq(q.field("courierId"), args.courierId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lat: args.lat,
        lng: args.lng,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("courierLocations", {
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});

export const removeCourier = mutation({
  args: { courierId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("courierLocations")
      .filter(q => q.eq(q.field("courierId"), args.courierId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getLocations = query({
  handler: async (ctx) => {
    return await ctx.db.query("courierLocations").collect();
  },
});