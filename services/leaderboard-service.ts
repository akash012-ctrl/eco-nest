import { classifyError, logError } from '@/utils/error-handler';
import { ConvexReactClient } from 'convex/react';
import {
    cacheLeaderboardData,
    getCachedLeaderboard,
    getUserStats,
    updateUserStats
} from './database';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface RankingEntry {
    userId: string;
    displayName: string;
    ecoPoints: number;
    rank: number;
    isAnonymous: boolean;
}

export interface UserRankInfo {
    rank: number;
    delta: number; // change since last check
    ecoPoints: number;
}

// ============================================================================
// Network Status Detection
// ============================================================================

/**
 * Check if the device is online
 * Uses the browser's navigator.onLine API
 */
export function isOnline(): boolean {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
        return navigator.onLine;
    }
    // Default to true if we can't determine (native environment)
    return true;
}

/**
 * Add listener for network status changes
 * @param callback Function to call when network status changes
 * @returns Cleanup function to remove listener
 */
export function addNetworkListener(callback: (online: boolean) => void): () => void {
    if (typeof window === 'undefined') {
        // Not in a browser environment, return no-op cleanup
        return () => { };
    }

    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}

/**
 * Retry a function when connection is restored
 * @param fn Function to retry
 * @param onSuccess Callback when retry succeeds
 * @returns Cleanup function
 */
export function retryOnReconnect(
    fn: () => Promise<void>,
    onSuccess?: () => void
): () => void {
    let cleanup: (() => void) | null = null;

    const handleOnline = async () => {
        try {
            await fn();
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Retry failed:', error);
        }
    };

    cleanup = addNetworkListener((online) => {
        if (online) {
            handleOnline();
        }
    });

    return () => {
        if (cleanup) {
            cleanup();
        }
    };
}

// ============================================================================
// Demo Friends Data
// ============================================================================

const DEMO_FRIENDS: RankingEntry[] = [
    {
        userId: 'demo_1',
        displayName: 'Alex Green',
        ecoPoints: 450,
        rank: 1,
        isAnonymous: false,
    },
    {
        userId: 'demo_2',
        displayName: 'Sam Rivers',
        ecoPoints: 380,
        rank: 2,
        isAnonymous: false,
    },
    {
        userId: 'demo_3',
        displayName: 'Jordan Leaf',
        ecoPoints: 320,
        rank: 3,
        isAnonymous: false,
    },
    {
        userId: 'demo_4',
        displayName: 'Taylor Woods',
        ecoPoints: 285,
        rank: 4,
        isAnonymous: false,
    },
    {
        userId: 'demo_5',
        displayName: 'Casey Stone',
        ecoPoints: 240,
        rank: 5,
        isAnonymous: false,
    },
    {
        userId: 'demo_6',
        displayName: 'Morgan Sky',
        ecoPoints: 195,
        rank: 6,
        isAnonymous: false,
    },
    {
        userId: 'demo_7',
        displayName: 'Riley Ocean',
        ecoPoints: 150,
        rank: 7,
        isAnonymous: false,
    },
    {
        userId: 'demo_8',
        displayName: 'Avery Pine',
        ecoPoints: 120,
        rank: 8,
        isAnonymous: false,
    },
];

// ============================================================================
// LeaderboardService Class
// ============================================================================

class LeaderboardService {
    private convexClient: ConvexReactClient | null = null;
    private previousRank: number | null = null;
    private unsubscribe: (() => void) | null = null;

    /**
     * Initialize the Convex client for real-time subscriptions
     * @param convexUrl The Convex deployment URL
     */
    initialize(convexUrl: string): void {
        this.convexClient = new ConvexReactClient(convexUrl);
    }

    /**
     * Subscribe to global leaderboard rankings with real-time updates
     * @param limit Maximum number of rankings to fetch
     * @param onUpdate Callback function called when rankings update
     * @returns Unsubscribe function
     */
    subscribeToGlobalRankings(
        limit: number,
        onUpdate: (rankings: RankingEntry[]) => void
    ): () => void {
        if (!this.convexClient) {
            throw new Error('Convex client not initialized. Call initialize() first.');
        }

        // Check if online
        if (!isOnline()) {
            // Load cached data immediately
            this.getCachedSnapshot().then(onUpdate).catch(console.error);
            return () => { }; // Return no-op unsubscribe
        }

        // TODO: Replace with actual Convex query subscription once backend is implemented
        // For now, we'll create a placeholder that simulates real-time updates
        // In production, this would be:
        // const unsubscribe = this.convexClient.watchQuery(
        //   api.leaderboard.getGlobalRankings,
        //   { limit },
        //   (result) => {
        //     if (result) {
        //       onUpdate(result);
        //       this.cacheSnapshot(result);
        //     }
        //   }
        // );

        // Placeholder: Load cached data for now
        this.getCachedSnapshot()
            .then(onUpdate)
            .catch((error) => {
                console.error('Failed to load cached leaderboard:', error);
                onUpdate([]);
            });

        return () => {
            // Cleanup subscription
        };
    }

    /**
     * Get global rankings (one-time fetch, not subscription)
     * @param limit Maximum number of rankings to fetch
     * @returns Array of ranking entries
     */
    async getGlobalRankings(limit: number): Promise<RankingEntry[]> {
        try {
            // Check if online
            if (!isOnline()) {
                return await this.getCachedSnapshot();
            }

            if (!this.convexClient) {
                throw new Error('Convex client not initialized. Call initialize() first.');
            }

            // TODO: Replace with actual Convex query once backend is implemented
            // For now, return cached data
            // In production, this would be:
            // const rankings = await this.convexClient.query(api.leaderboard.getGlobalRankings, { limit });
            // await this.cacheSnapshot(rankings);
            // return rankings;

            return await this.getCachedSnapshot();
        } catch (error) {
            const appError = classifyError(error);
            logError(appError, 'LeaderboardService.getGlobalRankings');
            // Return cached data as fallback
            return await this.getCachedSnapshot();
        }
    }

    /**
     * Get demo friends rankings with predefined list
     * @returns Array of demo friend ranking entries
     */
    async getDemoFriendsRankings(): Promise<RankingEntry[]> {
        try {
            // Get user's current points to insert them into the rankings
            const userStats = await getUserStats();
            const userPoints = userStats.total_eco_points;

            // Check privacy setting
            const isAnonymous = await getPrivacySetting();

            // Create user entry
            const userEntry: RankingEntry = {
                userId: 'current_user',
                displayName: isAnonymous ? 'Anonymous' : 'You',
                ecoPoints: userPoints,
                rank: 0, // Will be calculated
                isAnonymous,
            };

            // Combine user with demo friends and sort by points
            const allEntries = [...DEMO_FRIENDS, userEntry].sort(
                (a, b) => b.ecoPoints - a.ecoPoints
            );

            // Assign ranks
            return allEntries.map((entry, index) => ({
                ...entry,
                rank: index + 1,
            }));
        } catch (error) {
            const appError = classifyError(error);
            logError(appError, 'LeaderboardService.getDemoFriendsRankings');
            // Return demo friends only as fallback
            return DEMO_FRIENDS;
        }
    }

    /**
     * Get the current user's rank with delta calculation
     * @returns User rank information with delta
     */
    async getUserRank(): Promise<UserRankInfo> {
        try {
            const userStats = await getUserStats();
            const currentRank = userStats.current_rank || 0;

            // Calculate delta (change since last check)
            const delta = this.previousRank !== null ? this.previousRank - currentRank : 0;

            // Update previous rank for next delta calculation
            this.previousRank = currentRank;

            return {
                rank: currentRank,
                delta,
                ecoPoints: userStats.total_eco_points,
            };
        } catch (error) {
            const appError = classifyError(error);
            logError(appError, 'LeaderboardService.getUserRank');
            // Return default values on error
            return {
                rank: 0,
                delta: 0,
                ecoPoints: 0,
            };
        }
    }

    /**
     * Get the closest competitors (3 users closest in rank)
     * @param count Number of competitors to return (default 3)
     * @returns Array of closest competitor ranking entries
     */
    async getClosestCompetitors(count: number = 3): Promise<RankingEntry[]> {
        try {
            const userStats = await getUserStats();
            const userRank = userStats.current_rank || 0;

            // Get all rankings
            const allRankings = await this.getCachedSnapshot();

            if (allRankings.length === 0) {
                return [];
            }

            // Find user's position in the rankings
            const userIndex = allRankings.findIndex((entry) => entry.rank === userRank);

            if (userIndex === -1) {
                // User not found, return top competitors
                return allRankings.slice(0, count);
            }

            // Get competitors around the user
            // Strategy: Get 1-2 above and 1-2 below
            const competitors: RankingEntry[] = [];

            // Get users above (better rank = lower number)
            const aboveCount = Math.floor(count / 2);
            const startIndex = Math.max(0, userIndex - aboveCount);

            // Get users below
            const belowCount = count - aboveCount;

            for (let i = startIndex; i < allRankings.length && competitors.length < count; i++) {
                // Skip the user themselves
                if (i !== userIndex) {
                    competitors.push(allRankings[i]);
                }
            }

            // If we don't have enough competitors, fill from the other direction
            if (competitors.length < count) {
                for (let i = startIndex - 1; i >= 0 && competitors.length < count; i--) {
                    competitors.unshift(allRankings[i]);
                }
            }

            return competitors.slice(0, count);
        } catch (error) {
            const appError = classifyError(error);
            logError(appError, 'LeaderboardService.getClosestCompetitors');
            return []; // Return empty array on error
        }
    }

    /**
     * Cache leaderboard snapshot to SQLite
     * @param rankings Array of ranking entries to cache
     */
    async cacheSnapshot(rankings: RankingEntry[]): Promise<void> {
        try {
            // Convert to cache entries
            const cacheEntries = rankings.map((entry) => ({
                user_id: entry.userId,
                display_name: entry.displayName,
                eco_points: entry.ecoPoints,
                rank: entry.rank,
                is_anonymous: entry.isAnonymous ? 1 : 0,
            }));

            await cacheLeaderboardData(cacheEntries);

            // Update user's current rank if they're in the rankings
            const userEntry = rankings.find((entry) => entry.userId === 'current_user');
            if (userEntry) {
                await updateUserStats({ current_rank: userEntry.rank });
            }
        } catch (error) {
            const appError = classifyError(error);
            logError(appError, 'LeaderboardService.cacheSnapshot');
            // Don't throw - caching failure shouldn't break the app
        }
    }

    /**
     * Get cached leaderboard snapshot from SQLite
     * @returns Array of cached ranking entries
     */
    async getCachedSnapshot(): Promise<RankingEntry[]> {
        try {
            const cachedEntries = await getCachedLeaderboard();

            return cachedEntries.map((entry) => ({
                userId: entry.user_id,
                displayName: entry.display_name,
                ecoPoints: entry.eco_points,
                rank: entry.rank,
                isAnonymous: entry.is_anonymous === 1,
            }));
        } catch (error) {
            const appError = classifyError(error);
            logError(appError, 'LeaderboardService.getCachedSnapshot');
            return []; // Return empty array on error
        }
    }

    /**
     * Cleanup subscriptions
     */
    cleanup(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
}

// ============================================================================
// Privacy Settings Helper
// ============================================================================

/**
 * Get privacy setting from AsyncStorage
 * @returns True if user wants anonymous mode
 */
async function getPrivacySetting(): Promise<boolean> {
    // TODO: Implement AsyncStorage for privacy settings
    // For now, default to public (not anonymous)
    return false;
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const leaderboardService = new LeaderboardService();
