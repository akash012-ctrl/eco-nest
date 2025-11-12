import {
    cacheLeaderboardData,
    getDatabase,
    updateStreakData,
    updateUserStats
} from '@/services/database';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Constants
// ============================================================================

const HABIT_TYPES = [
    'recycle',
    'bike',
    'meatless',
    'reusable',
    'compost',
    'water',
] as const;

const DEMO_USER = {
    userId: 'demo-user',
    displayName: 'Demo User',
    ecoPoints: 245,
    rank: 42,
};

// ============================================================================
// Demo User Data Generator
// ============================================================================

/**
 * Generate demo user data with realistic statistics
 */
export function generateDemoUser() {
    return {
        userId: DEMO_USER.userId,
        displayName: DEMO_USER.displayName,
        ecoPoints: DEMO_USER.ecoPoints,
        rank: DEMO_USER.rank,
        totalLogs: 47,
        longestStreak: 7,
        currentStreak: 5,
    };
}

// ============================================================================
// Demo Habit Logs Generator
// ============================================================================

/**
 * Populate habits_queue with realistic demo habit logs
 * Creates logs for the past 7 days with varying patterns
 */
export async function populateDemoHabitLogs(): Promise<void> {
    const database = getDatabase();
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Clear existing habit logs
    await database.runAsync('DELETE FROM habits_queue');

    const logsToCreate: {
        id: string;
        type: string;
        payload: any;
        status: 'pending' | 'synced';
        createdAt: number;
    }[] = [];

    // Generate logs for the past 7 days
    for (let day = 0; day < 7; day++) {
        const dayTimestamp = now - day * oneDayMs;

        // Vary the number of logs per day (2-5 logs)
        const logsPerDay = Math.floor(Math.random() * 4) + 2;

        for (let i = 0; i < logsPerDay; i++) {
            // Random habit type
            const habitType =
                HABIT_TYPES[Math.floor(Math.random() * HABIT_TYPES.length)];

            // Random base points (5-20)
            const basePoints = Math.floor(Math.random() * 16) + 5;

            // Calculate streak bonus (simulate realistic streaks)
            let streakBonus = 0;
            if (day <= 2) {
                // Recent days have active streaks
                streakBonus = day === 0 ? 10 : day === 1 ? 5 : 0;
            }

            const pointsAwarded = basePoints + streakBonus;

            // Spread logs throughout the day
            const logTimestamp = dayTimestamp - i * 3 * 60 * 60 * 1000;

            const logId = uuidv4();
            const payload = {
                habitType,
                pointsAwarded,
                loggedAt: logTimestamp,
                basePoints,
                streakBonus,
                currentStreak: day <= 2 ? 7 - day : 1,
            };

            // Most recent 3 logs are pending (for demo sync)
            const status = day === 0 && i < 3 ? 'pending' : 'synced';

            logsToCreate.push({
                id: logId,
                type: 'habit',
                payload,
                status,
                createdAt: logTimestamp,
            });
        }
    }

    // Insert all logs
    for (const log of logsToCreate) {
        await database.runAsync(
            `INSERT INTO habits_queue (id, type, payload_json, status, created_at, attempts, synced_at, server_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                log.id,
                log.type,
                JSON.stringify(log.payload),
                log.status,
                log.createdAt,
                0,
                log.status === 'synced' ? log.createdAt : null,
                log.status === 'synced' ? `server_${log.id.substring(0, 8)}` : null,
            ]
        );
    }

    // Update user stats with total points and unsynced count
    const unsyncedCount = logsToCreate.filter((log) => log.status === 'pending').length;
    await updateUserStats({
        total_eco_points: DEMO_USER.ecoPoints,
        current_rank: DEMO_USER.rank,
        unsynced_count: unsyncedCount,
    });

    console.log(`Created ${logsToCreate.length} demo habit logs (${unsyncedCount} pending)`);
}

// ============================================================================
// Demo Leaderboard Generator
// ============================================================================

/**
 * Generate realistic leaderboard data with varied rankings
 */
export function generateDemoLeaderboard() {
    const leaderboard = [
        // Top 10 users
        { userId: 'user_1', displayName: 'EcoWarrior', ecoPoints: 892, rank: 1 },
        { userId: 'user_2', displayName: 'GreenThumb', ecoPoints: 756, rank: 2 },
        { userId: 'user_3', displayName: 'TreeHugger', ecoPoints: 623, rank: 3 },
        { userId: 'user_4', displayName: 'EcoChamp', ecoPoints: 534, rank: 4 },
        { userId: 'user_5', displayName: 'NatureLover', ecoPoints: 478, rank: 5 },
        { userId: 'user_6', displayName: 'PlanetSaver', ecoPoints: 423, rank: 6 },
        { userId: 'user_7', displayName: 'GreenGuru', ecoPoints: 389, rank: 7 },
        { userId: 'user_8', displayName: 'EcoHero', ecoPoints: 356, rank: 8 },
        { userId: 'user_9', displayName: 'ClimateChamp', ecoPoints: 334, rank: 9 },
        { userId: 'user_10', displayName: 'SustainStar', ecoPoints: 312, rank: 10 },

        // Users around rank 20
        { userId: 'user_18', displayName: 'GreenBean', ecoPoints: 289, rank: 18 },
        { userId: 'user_19', displayName: 'EcoFriend', ecoPoints: 285, rank: 19 },
        { userId: 'user_20', displayName: 'NatureNinja', ecoPoints: 281, rank: 20 },
        { userId: 'user_21', displayName: 'GreenMachine', ecoPoints: 277, rank: 21 },
        { userId: 'user_22', displayName: 'EcoExplorer', ecoPoints: 273, rank: 22 },

        // Users around rank 30
        { userId: 'user_28', displayName: 'TreeFriend', ecoPoints: 265, rank: 28 },
        { userId: 'user_29', displayName: 'GreenVibes', ecoPoints: 262, rank: 29 },
        { userId: 'user_30', displayName: 'EcoSpirit', ecoPoints: 259, rank: 30 },
        { userId: 'user_31', displayName: 'NaturePal', ecoPoints: 256, rank: 31 },
        { userId: 'user_32', displayName: 'GreenHeart', ecoPoints: 253, rank: 32 },

        // Users around demo user's rank (40-45)
        { userId: 'user_40', displayName: 'EcoAdvocate', ecoPoints: 252, rank: 40 },
        { userId: 'user_41', displayName: 'GreenSoul', ecoPoints: 248, rank: 41 },
        {
            userId: DEMO_USER.userId,
            displayName: DEMO_USER.displayName,
            ecoPoints: DEMO_USER.ecoPoints,
            rank: DEMO_USER.rank,
        },
        { userId: 'user_43', displayName: 'NatureGuard', ecoPoints: 242, rank: 43 },
        { userId: 'user_44', displayName: 'GreenWave', ecoPoints: 238, rank: 44 },
        { userId: 'user_45', displayName: 'EcoKnight', ecoPoints: 234, rank: 45 },

        // Additional users for scrolling
        { userId: 'user_50', displayName: 'TreeKeeper', ecoPoints: 210, rank: 50 },
        { userId: 'user_60', displayName: 'GreenPath', ecoPoints: 189, rank: 60 },
        { userId: 'user_70', displayName: 'EcoJourney', ecoPoints: 167, rank: 70 },
        { userId: 'user_80', displayName: 'NatureWay', ecoPoints: 145, rank: 80 },
        { userId: 'user_90', displayName: 'GreenLife', ecoPoints: 123, rank: 90 },
        { userId: 'user_100', displayName: 'EcoPath', ecoPoints: 101, rank: 100 },
    ];

    return leaderboard;
}

/**
 * Populate leaderboard_cache with demo data
 */
export async function populateDemoLeaderboard(): Promise<void> {
    const leaderboard = generateDemoLeaderboard();

    const cacheEntries = leaderboard.map((entry) => ({
        user_id: entry.userId,
        display_name: entry.displayName,
        eco_points: entry.ecoPoints,
        rank: entry.rank,
        is_anonymous: 0,
    }));

    await cacheLeaderboardData(cacheEntries);

    console.log(`Cached ${cacheEntries.length} demo leaderboard entries`);
}

// ============================================================================
// Demo Friends Leaderboard
// ============================================================================

/**
 * Generate demo friends leaderboard (predefined list)
 */
export function generateDemoFriendsLeaderboard() {
    return [
        {
            userId: 'friend_1',
            displayName: 'Sarah Green',
            ecoPoints: 312,
            rank: 1,
            isAnonymous: false,
        },
        {
            userId: 'friend_2',
            displayName: 'Mike Eco',
            ecoPoints: 289,
            rank: 2,
            isAnonymous: false,
        },
        {
            userId: DEMO_USER.userId,
            displayName: DEMO_USER.displayName,
            ecoPoints: DEMO_USER.ecoPoints,
            rank: 3,
            isAnonymous: false,
        },
        {
            userId: 'friend_3',
            displayName: 'Lisa Nature',
            ecoPoints: 234,
            rank: 4,
            isAnonymous: false,
        },
        {
            userId: 'friend_4',
            displayName: 'Tom Planet',
            ecoPoints: 198,
            rank: 5,
            isAnonymous: false,
        },
        {
            userId: 'friend_5',
            displayName: 'Emma Earth',
            ecoPoints: 176,
            rank: 6,
            isAnonymous: false,
        },
        {
            userId: 'friend_6',
            displayName: 'Alex Climate',
            ecoPoints: 154,
            rank: 7,
            isAnonymous: false,
        },
        {
            userId: 'friend_7',
            displayName: 'Jordan Sustain',
            ecoPoints: 132,
            rank: 8,
            isAnonymous: false,
        },
    ];
}

// ============================================================================
// Demo Streaks Generator
// ============================================================================

/**
 * Populate demo streaks for habit types
 */
export async function populateDemoStreaks(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Create realistic streaks for different habits
    const streaks = [
        { habitType: 'recycle', currentStreak: 7, lastLoggedDate: today },
        { habitType: 'bike', currentStreak: 5, lastLoggedDate: today },
        { habitType: 'meatless', currentStreak: 3, lastLoggedDate: today },
        { habitType: 'reusable', currentStreak: 4, lastLoggedDate: today },
        { habitType: 'compost', currentStreak: 2, lastLoggedDate: today },
        { habitType: 'water', currentStreak: 1, lastLoggedDate: today },
    ];

    for (const streak of streaks) {
        await updateStreakData(
            streak.habitType,
            streak.currentStreak,
            streak.lastLoggedDate
        );
    }

    console.log(`Created ${streaks.length} demo streaks`);
}

// ============================================================================
// Complete Demo Data Population
// ============================================================================

/**
 * Populate all demo data (habits, leaderboard, streaks)
 * This is the main function to call when activating demo mode
 */
export async function populateAllDemoData(): Promise<void> {
    console.log('Populating demo data...');

    await populateDemoHabitLogs();
    await populateDemoLeaderboard();
    await populateDemoStreaks();

    console.log('Demo data population complete!');
}

// ============================================================================
// Export Demo User for Reference
// ============================================================================

export { DEMO_USER };

