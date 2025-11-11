import { v4 as uuidv4 } from 'uuid';
import {
    deleteHabitLog,
    getDatabase,
    getStreakData,
    getUserStats,
    insertHabitLog,
    updateStreakData,
    updateUserStats,
    type HabitQueueItem,
} from './database';

// ============================================================================
// Types and Interfaces
// ============================================================================

export type HabitType =
    | 'recycle'
    | 'bike'
    | 'meatless'
    | 'reusable'
    | 'compost'
    | 'water'
    | 'custom';

export interface LogResult {
    logId: string;
    pointsAwarded: number;
    newTotal: number;
    streakBonus?: number;
    cappedOut: boolean;
}

export interface HabitLog {
    id: string;
    habitType: HabitType;
    pointsAwarded: number;
    loggedAt: number;
    status: 'pending' | 'synced' | 'failed';
}

// ============================================================================
// HabitService Class
// ============================================================================

class HabitService {
    private lastLogTimestamp: Map<HabitType, number> = new Map();
    private readonly DEBOUNCE_DELAY_MS = 300;
    private readonly DAILY_CAP_PER_CATEGORY = 50;
    private readonly BASE_POINTS_MIN = 5;
    private readonly BASE_POINTS_MAX = 20;

    // Streak bonus thresholds
    private readonly STREAK_BONUSES = [
        { days: 3, bonus: 5 },
        { days: 7, bonus: 10 },
        { days: 14, bonus: 20 },
    ];

    /**
     * Log a habit action
     * @param habitType The type of habit being logged
     * @returns LogResult with points awarded and status
     */
    async logHabit(habitType: HabitType): Promise<LogResult> {
        // Check debouncing
        const now = Date.now();
        const lastLog = this.lastLogTimestamp.get(habitType);

        if (lastLog && now - lastLog < this.DEBOUNCE_DELAY_MS) {
            throw new Error('Please wait before logging this habit again');
        }

        // Check if daily cap is reached
        const canLog = await this.canLogHabit(habitType);
        if (!canLog) {
            throw new Error('Today max reached');
        }

        // Calculate base points (random between 5-20)
        const basePoints = this.calculateBasePoints();

        // Get and update streak
        const streakData = await this.updateStreak(habitType);
        const streakBonus = this.calculateStreakBonus(streakData.current_streak);

        // Total points for this log
        const pointsAwarded = basePoints + streakBonus;

        // Generate unique ID
        const logId = uuidv4();

        // Create payload
        const payload = {
            habitType,
            pointsAwarded,
            loggedAt: now,
            basePoints,
            streakBonus,
            currentStreak: streakData.current_streak,
        };

        // Write to SQLite
        await insertHabitLog(logId, 'habit', payload);

        // Update user stats
        const userStats = await getUserStats();
        const newTotal = userStats.total_eco_points + pointsAwarded;
        await updateUserStats({ total_eco_points: newTotal });

        // Update debounce timestamp
        this.lastLogTimestamp.set(habitType, now);

        // Check if capped out after this log
        const cappedOut = !(await this.canLogHabit(habitType));

        return {
            logId,
            pointsAwarded,
            newTotal,
            streakBonus: streakBonus > 0 ? streakBonus : undefined,
            cappedOut,
        };
    }

    /**
     * Undo the last logged habit
     * @param logId The ID of the log to undo
     */
    async undoLastLog(logId: string): Promise<void> {
        const database = getDatabase();

        // Get the log details
        const log = await database.getFirstAsync<HabitQueueItem>(
            'SELECT * FROM habits_queue WHERE id = ?',
            [logId]
        );

        if (!log) {
            throw new Error('Log not found');
        }

        // Parse payload to get points
        const payload = JSON.parse(log.payload_json);
        const pointsAwarded = payload.pointsAwarded || 0;

        // Delete the log
        await deleteHabitLog(logId);

        // Update user stats (subtract points)
        const userStats = await getUserStats();
        const newTotal = Math.max(0, userStats.total_eco_points - pointsAwarded);
        await updateUserStats({ total_eco_points: newTotal });

        // Note: We don't revert streak data as it's complex and streaks should
        // generally move forward. The streak will be recalculated on next log.
    }

    /**
     * Get all habit logs for today
     * @returns Array of today's habit logs
     */
    async getTodayLogs(): Promise<HabitLog[]> {
        const database = getDatabase();

        // Get start of today (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();

        const logs = await database.getAllAsync<HabitQueueItem>(
            `SELECT * FROM habits_queue 
       WHERE created_at >= ? 
       ORDER BY created_at DESC`,
            [todayStart]
        );

        return logs.map((log) => {
            const payload = JSON.parse(log.payload_json);
            return {
                id: log.id,
                habitType: payload.habitType,
                pointsAwarded: payload.pointsAwarded,
                loggedAt: log.created_at,
                status: log.status,
            };
        });
    }

    /**
     * Get the current streak for a specific habit
     * @param habitType The habit type to check
     * @returns Current streak count
     */
    async getStreakForHabit(habitType: HabitType): Promise<number> {
        const streakData = await getStreakData(habitType);
        return streakData?.current_streak || 0;
    }

    /**
     * Check if a habit can be logged (not at daily cap)
     * @param habitType The habit type to check
     * @returns True if the habit can be logged
     */
    async canLogHabit(habitType: HabitType): Promise<boolean> {
        const todayLogs = await this.getTodayLogs();

        // Filter logs for this habit type
        const habitLogs = todayLogs.filter((log) => log.habitType === habitType);

        // Calculate total points for this habit today
        const totalPoints = habitLogs.reduce((sum, log) => sum + log.pointsAwarded, 0);

        return totalPoints < this.DAILY_CAP_PER_CATEGORY;
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    /**
     * Calculate base points (random between 5-20)
     */
    private calculateBasePoints(): number {
        return (
            Math.floor(
                Math.random() * (this.BASE_POINTS_MAX - this.BASE_POINTS_MIN + 1)
            ) + this.BASE_POINTS_MIN
        );
    }

    /**
     * Calculate streak bonus based on current streak
     */
    private calculateStreakBonus(currentStreak: number): number {
        // Find the highest applicable bonus
        let bonus = 0;
        for (const { days, bonus: bonusPoints } of this.STREAK_BONUSES) {
            if (currentStreak >= days) {
                bonus = bonusPoints;
            }
        }
        return bonus;
    }

    /**
     * Update streak data for a habit
     */
    private async updateStreak(habitType: HabitType): Promise<{
        current_streak: number;
        last_logged_date: string;
    }> {
        const today = this.getTodayDateString();
        const streakData = await getStreakData(habitType);

        if (!streakData) {
            // First time logging this habit
            await updateStreakData(habitType, 1, today);
            return { current_streak: 1, last_logged_date: today };
        }

        const lastLoggedDate = streakData.last_logged_date;

        // Check if already logged today
        if (lastLoggedDate === today) {
            // Already logged today, keep current streak
            return {
                current_streak: streakData.current_streak,
                last_logged_date: today,
            };
        }

        // Check if logged yesterday (streak continues)
        const yesterday = this.getYesterdayDateString();
        if (lastLoggedDate === yesterday) {
            // Streak continues
            const newStreak = streakData.current_streak + 1;
            await updateStreakData(habitType, newStreak, today);
            return { current_streak: newStreak, last_logged_date: today };
        }

        // Streak broken, reset to 1
        await updateStreakData(habitType, 1, today);
        return { current_streak: 1, last_logged_date: today };
    }

    /**
     * Get today's date as YYYY-MM-DD string
     */
    private getTodayDateString(): string {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    /**
     * Get yesterday's date as YYYY-MM-DD string
     */
    private getYesterdayDateString(): string {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const habitService = new HabitService();
