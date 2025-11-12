import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

// Point calculation constants
const BASE_POINTS_MIN = 5;
const BASE_POINTS_MAX = 20;
const DAILY_CAP_PER_CATEGORY = 50;
const STREAK_BONUS_3_DAYS = 5;
const STREAK_BONUS_7_DAYS = 10;
const STREAK_BONUS_14_DAYS = 20;

// Habit types
const VALID_HABIT_TYPES = [
    "recycle",
    "bike",
    "meatless",
    "reusable",
    "compost",
    "water",
    "custom",
];

interface SyncItem {
    id: string;
    type: "habit";
    payload: {
        habitType: string;
        pointsAwarded: number;
        loggedAt: number;
    };
    createdAt: number;
}

interface SyncItemResult {
    id: string;
    status: "accepted" | "conflict" | "error";
    serverId?: Id<"habit_logs">;
    message?: string;
    retryAfter?: number;
    serverData?: any;
}

/**
 * Calculate streak bonus based on consecutive days
 */
function calculateStreakBonus(streakDays: number): number {
    if (streakDays >= 14) return STREAK_BONUS_14_DAYS;
    if (streakDays >= 7) return STREAK_BONUS_7_DAYS;
    if (streakDays >= 3) return STREAK_BONUS_3_DAYS;
    return 0;
}

/**
 * Get today's logs for a specific habit type and user
 */
async function getTodayLogsForHabit(
    ctx: any,
    userId: Id<"users">,
    habitType: string
): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTimestamp = todayStart.getTime();

    const logs = await ctx.db
        .query("habit_logs")
        .withIndex("by_userId_and_loggedAt", (q: any) =>
            q.eq("userId", userId).gte("loggedAt", todayStartTimestamp)
        )
        .filter((q: any) => q.eq(q.field("habitType"), habitType))
        .collect();

    return logs.reduce((sum: number, log: any) => sum + log.pointsAwarded, 0);
}

/**
 * Validate and process a single habit log
 */
async function processHabitLog(
    ctx: any,
    userId: Id<"users">,
    item: SyncItem
): Promise<SyncItemResult> {
    const { habitType, pointsAwarded, loggedAt } = item.payload;

    // Validate habit type
    if (!VALID_HABIT_TYPES.includes(habitType)) {
        return {
            id: item.id,
            status: "error",
            message: `Invalid habit type: ${habitType}`,
        };
    }

    // Check for duplicate (by clientId)
    const existingLog = await ctx.db
        .query("habit_logs")
        .withIndex("by_clientId", (q: any) => q.eq("clientId", item.id))
        .first();

    if (existingLog) {
        // Already synced - return conflict with server data
        return {
            id: item.id,
            status: "conflict",
            serverId: existingLog._id,
            message: "Log already exists on server",
            serverData: {
                habitType: existingLog.habitType,
                pointsAwarded: existingLog.pointsAwarded,
                loggedAt: existingLog.loggedAt,
            },
        };
    }

    // Validate points are within range
    if (pointsAwarded < BASE_POINTS_MIN || pointsAwarded > BASE_POINTS_MAX + STREAK_BONUS_14_DAYS) {
        return {
            id: item.id,
            status: "error",
            message: `Invalid points awarded: ${pointsAwarded}`,
        };
    }

    // Check daily cap for this habit category
    const todayPoints = await getTodayLogsForHabit(ctx, userId, habitType);

    if (todayPoints >= DAILY_CAP_PER_CATEGORY) {
        return {
            id: item.id,
            status: "error",
            message: `Daily cap reached for ${habitType} (${DAILY_CAP_PER_CATEGORY} points)`,
        };
    }

    // Calculate validated points (may differ from client)
    let validatedPoints = pointsAwarded;

    // If adding this would exceed cap, adjust points
    if (todayPoints + pointsAwarded > DAILY_CAP_PER_CATEGORY) {
        validatedPoints = DAILY_CAP_PER_CATEGORY - todayPoints;
    }

    // Insert the habit log
    const logId = await ctx.db.insert("habit_logs", {
        userId,
        habitType,
        pointsAwarded: validatedPoints,
        clientId: item.id,
        loggedAt,
        validated: true,
    });

    // Update user's total ecoPoints
    const user = await ctx.db.get(userId);
    if (user) {
        await ctx.db.patch(userId, {
            ecoPoints: user.ecoPoints + validatedPoints,
            lastActive: Date.now(),
        });
    }

    return {
        id: item.id,
        status: "accepted",
        serverId: logId,
    };
}

/**
 * Sync batch of items from client
 * Processes up to 50 items per batch
 */
export const syncBatch = mutation({
    args: {
        userId: v.id("users"),
        items: v.array(
            v.object({
                id: v.string(),
                type: v.literal("habit"),
                payload: v.object({
                    habitType: v.string(),
                    pointsAwarded: v.number(),
                    loggedAt: v.number(),
                }),
                createdAt: v.number(),
            })
        ),
    },
    handler: async (ctx, args): Promise<{ results: SyncItemResult[] }> => {
        // Validate user exists
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Limit batch size to 50 items
        const itemsToProcess = args.items.slice(0, 50);

        // Create sync batch record
        const batchId = await ctx.db.insert("sync_batches", {
            userId: args.userId,
            itemCount: itemsToProcess.length,
            status: "processing",
        });

        const results: SyncItemResult[] = [];

        // Process each item
        for (const item of itemsToProcess) {
            try {
                if (item.type === "habit") {
                    const result = await processHabitLog(ctx, args.userId, item);
                    results.push(result);
                } else {
                    results.push({
                        id: item.id,
                        status: "error",
                        message: `Unknown item type: ${item.type}`,
                    });
                }
            } catch (error) {
                results.push({
                    id: item.id,
                    status: "error",
                    message: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        // Update batch status
        const hasErrors = results.some((r) => r.status === "error");
        await ctx.db.patch(batchId, {
            status: hasErrors ? "failed" : "completed",
        });

        return { results };
    },
});
