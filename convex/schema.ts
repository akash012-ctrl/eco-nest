import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        displayName: v.string(),
        ecoPoints: v.number(),
        isAnonymous: v.boolean(),
        lastActive: v.number(),
        passwordHash: v.string(),
    })
        .index("by_email", ["email"])
        .index("by_ecoPoints", ["ecoPoints"])
        .index("by_lastActive", ["lastActive"]),

    habit_logs: defineTable({
        userId: v.id("users"),
        habitType: v.string(),
        pointsAwarded: v.number(),
        clientId: v.string(), // for deduplication
        loggedAt: v.number(),
        validated: v.boolean(),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_and_loggedAt", ["userId", "loggedAt"])
        .index("by_clientId", ["clientId"]),

    sync_batches: defineTable({
        userId: v.id("users"),
        itemCount: v.number(),
        status: v.union(
            v.literal("processing"),
            v.literal("completed"),
            v.literal("failed")
        ),
    })
        .index("by_userId", ["userId"])
        .index("by_status", ["status"]),
});
