import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

interface RankingEntry {
    userId: Id<"users">;
    displayName: string;
    ecoPoints: number;
    rank: number;
    isAnonymous: boolean;
}

/**
 * Get global leaderboard rankings
 * Returns top users sorted by ecoPoints
 */
export const getGlobalRankings = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<RankingEntry[]> => {
        const limit = args.limit ?? 100;

        // Get all users sorted by ecoPoints (descending)
        const users = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .order("desc")
            .take(limit);

        // Map to ranking entries with rank numbers
        const rankings: RankingEntry[] = users.map((user, index) => ({
            userId: user._id,
            displayName: user.isAnonymous ? "Anonymous" : user.displayName,
            ecoPoints: user.ecoPoints,
            rank: index + 1,
            isAnonymous: user.isAnonymous,
        }));

        return rankings;
    },
});

/**
 * Get user's current rank and position
 */
export const getUserRank = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user) {
            return null;
        }

        // Count how many users have more points
        const usersAbove = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .filter((q) => q.gt(q.field("ecoPoints"), user.ecoPoints))
            .collect();

        const rank = usersAbove.length + 1;

        return {
            rank,
            ecoPoints: user.ecoPoints,
            displayName: user.isAnonymous ? "Anonymous" : user.displayName,
        };
    },
});

/**
 * Get the 3 closest competitors to a user
 * Returns users ranked just above and below the target user
 */
export const getClosestCompetitors = query({
    args: {
        userId: v.id("users"),
        count: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<RankingEntry[]> => {
        const count = args.count ?? 3;
        const user = await ctx.db.get(args.userId);

        if (!user) {
            return [];
        }

        // Get users with similar points (above and below)
        const usersAbove = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .filter((q) => q.gt(q.field("ecoPoints"), user.ecoPoints))
            .order("asc")
            .take(Math.ceil(count / 2));

        const usersBelow = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .filter((q) => q.lt(q.field("ecoPoints"), user.ecoPoints))
            .order("desc")
            .take(Math.floor(count / 2));

        // Combine and sort by points descending
        const competitors = [...usersAbove, ...usersBelow].sort(
            (a, b) => b.ecoPoints - a.ecoPoints
        );

        // Calculate ranks
        const allUsers = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .order("desc")
            .collect();

        const rankings: RankingEntry[] = competitors.map((competitor) => {
            const rank = allUsers.findIndex((u) => u._id === competitor._id) + 1;
            return {
                userId: competitor._id,
                displayName: competitor.isAnonymous ? "Anonymous" : competitor.displayName,
                ecoPoints: competitor.ecoPoints,
                rank,
                isAnonymous: competitor.isAnonymous,
            };
        });

        return rankings;
    },
});

/**
 * Get leaderboard with user's position highlighted
 * Includes global rankings and user's specific position
 */
export const getLeaderboardWithUserPosition = query({
    args: {
        userId: v.id("users"),
        topLimit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const topLimit = args.topLimit ?? 50;
        const user = await ctx.db.get(args.userId);

        if (!user) {
            return null;
        }

        // Get top rankings
        const topUsers = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .order("desc")
            .take(topLimit);

        const topRankings: RankingEntry[] = topUsers.map((u, index) => ({
            userId: u._id,
            displayName: u.isAnonymous ? "Anonymous" : u.displayName,
            ecoPoints: u.ecoPoints,
            rank: index + 1,
            isAnonymous: u.isAnonymous,
        }));

        // Get user's rank
        const usersAboveUser = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .filter((q) => q.gt(q.field("ecoPoints"), user.ecoPoints))
            .collect();

        const userRank = {
            rank: usersAboveUser.length + 1,
            ecoPoints: user.ecoPoints,
            displayName: user.isAnonymous ? "Anonymous" : user.displayName,
        };

        // Get closest competitors
        const usersAbove = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .filter((q) => q.gt(q.field("ecoPoints"), user.ecoPoints))
            .order("asc")
            .take(2);

        const usersBelow = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .filter((q) => q.lt(q.field("ecoPoints"), user.ecoPoints))
            .order("desc")
            .take(1);

        const competitors = [...usersAbove, ...usersBelow].sort(
            (a, b) => b.ecoPoints - a.ecoPoints
        );

        const allUsers = await ctx.db
            .query("users")
            .withIndex("by_ecoPoints")
            .order("desc")
            .collect();

        const closestCompetitors: RankingEntry[] = competitors.map((competitor) => {
            const rank = allUsers.findIndex((u) => u._id === competitor._id) + 1;
            return {
                userId: competitor._id,
                displayName: competitor.isAnonymous ? "Anonymous" : competitor.displayName,
                ecoPoints: competitor.ecoPoints,
                rank,
                isAnonymous: competitor.isAnonymous,
            };
        });

        return {
            topRankings,
            userRank,
            closestCompetitors,
        };
    },
});

/**
 * Get user statistics including total logs and streaks
 */
export const getUserStats = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user) {
            return null;
        }

        // Get total habit logs
        const allLogs = await ctx.db
            .query("habit_logs")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        // Get logs from last 7 days
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentLogs = allLogs.filter((log) => log.loggedAt >= sevenDaysAgo);

        // Calculate points by day for sparkline
        const pointsByDay: { [key: string]: number } = {};
        recentLogs.forEach((log) => {
            const date = new Date(log.loggedAt).toISOString().split("T")[0];
            pointsByDay[date] = (pointsByDay[date] || 0) + log.pointsAwarded;
        });

        return {
            totalLogs: allLogs.length,
            totalPoints: user.ecoPoints,
            recentLogs: recentLogs.length,
            pointsByDay,
        };
    },
});
