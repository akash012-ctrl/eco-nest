import {
    getUnsyncedCount as dbGetUnsyncedCount,
    getDatabase,
    getPendingHabitLogs,
    getUserStats,
    updateHabitLogStatus,
    updateLastSyncTimestamp,
    type HabitQueueItem,
} from './database';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface SyncItem {
    id: string; // client-generated UUID
    type: 'habit';
    payload: {
        habitType: string;
        pointsAwarded: number;
        loggedAt: number;
        basePoints?: number;
        streakBonus?: number;
        currentStreak?: number;
    };
    createdAt: number;
}

export interface SyncItemResult {
    id: string; // matches client id
    status: 'accepted' | 'conflict' | 'error';
    serverId?: string; // Convex document ID
    message?: string;
    retryAfter?: number; // seconds
    serverData?: any; // for conflicts
}

export interface SyncRequest {
    items: SyncItem[];
}

export interface SyncResponse {
    results: SyncItemResult[];
}

export interface SyncResult {
    uploaded: number;
    conflicts: ConflictItem[];
    errors: ErrorItem[];
}

export interface ConflictItem {
    id: string;
    localData: any;
    serverData: any;
}

export interface ErrorItem {
    id: string;
    message: string;
}

// ============================================================================
// SyncService Class
// ============================================================================

class SyncService {
    private lastSyncTimestamp: number = 0;
    private readonly SYNC_COOLDOWN_MS = 5000; // 5 seconds
    private readonly MAX_BATCH_SIZE = 50;
    private convexClient: any = null; // Will be set via setConvexClient

    /**
     * Set the Convex client instance
     * This should be called during app initialization
     */
    setConvexClient(client: any): void {
        this.convexClient = client;
    }

    /**
     * Sync pending items to the Convex backend
     * @returns SyncResult with upload statistics
     */
    async syncPendingItems(): Promise<SyncResult> {
        // Check cooldown
        const now = Date.now();
        const timeSinceLastSync = now - this.lastSyncTimestamp;

        if (timeSinceLastSync < this.SYNC_COOLDOWN_MS) {
            const remainingTime = Math.ceil((this.SYNC_COOLDOWN_MS - timeSinceLastSync) / 1000);
            throw new Error(`Please wait ${remainingTime} seconds before syncing again`);
        }

        // Check if Convex client is configured
        if (!this.convexClient) {
            throw new Error('Convex client not configured. Call setConvexClient() first.');
        }

        // Get pending items (limited to batch size)
        const pendingLogs = await getPendingHabitLogs(this.MAX_BATCH_SIZE);

        if (pendingLogs.length === 0) {
            return {
                uploaded: 0,
                conflicts: [],
                errors: [],
            };
        }

        // Convert to sync items
        const syncItems: SyncItem[] = pendingLogs.map((log) => ({
            id: log.id,
            type: 'habit' as const,
            payload: JSON.parse(log.payload_json),
            createdAt: log.created_at,
        }));

        // Prepare request
        const request: SyncRequest = {
            items: syncItems,
        };

        try {
            // Call Convex sync mutation
            const response: SyncResponse = await this.convexClient.mutation(
                'sync:syncBatch',
                request
            );

            // Process results
            const result = await this.processResults(response.results);

            // Update last sync timestamp
            this.lastSyncTimestamp = now;
            await updateLastSyncTimestamp();

            return result;
        } catch (error) {
            // Network or server error
            console.error('Sync failed:', error);

            // Mark all items as failed with error message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            for (const log of pendingLogs) {
                await updateHabitLogStatus(log.id, 'failed', undefined, errorMessage);
            }

            throw new Error('No connection — saved locally');
        }
    }

    /**
     * Get count of unsynced items
     * @returns Number of pending items
     */
    async getUnsyncedCount(): Promise<number> {
        return await dbGetUnsyncedCount();
    }

    /**
     * Get timestamp of last successful sync
     * @returns Date of last sync or null if never synced
     */
    async getLastSyncTimestamp(): Promise<Date | null> {
        const userStats = await getUserStats();

        if (!userStats.last_sync_at) {
            return null;
        }

        return new Date(userStats.last_sync_at);
    }

    /**
     * Handle conflict resolution for a specific item
     * @param itemId The ID of the conflicting item
     * @param resolution Whether to keep local or use server data
     */
    async handleConflict(
        itemId: string,
        resolution: 'local' | 'server'
    ): Promise<void> {
        const database = getDatabase();

        // Get the item
        const item = await database.getFirstAsync<HabitQueueItem>(
            'SELECT * FROM habits_queue WHERE id = ?',
            [itemId]
        );

        if (!item) {
            throw new Error('Conflict item not found');
        }

        if (resolution === 'local') {
            // Keep local: mark as pending to retry sync
            await database.runAsync(
                'UPDATE habits_queue SET status = ?, error_message = NULL WHERE id = ?',
                ['pending', itemId]
            );
        } else {
            // Use server: mark as synced (server wins)
            // Note: In a real implementation, we might need to fetch and apply server data
            await updateHabitLogStatus(itemId, 'synced', undefined, 'Resolved: used server data');
        }
    }

    /**
     * Get remaining cooldown time in seconds
     * @returns Seconds remaining, or 0 if no cooldown
     */
    getRemainingCooldown(): number {
        const now = Date.now();
        const timeSinceLastSync = now - this.lastSyncTimestamp;

        if (timeSinceLastSync >= this.SYNC_COOLDOWN_MS) {
            return 0;
        }

        return Math.ceil((this.SYNC_COOLDOWN_MS - timeSinceLastSync) / 1000);
    }

    /**
     * Check if sync is currently on cooldown
     * @returns True if on cooldown
     */
    isOnCooldown(): boolean {
        return this.getRemainingCooldown() > 0;
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    /**
     * Process sync results and update database
     */
    private async processResults(results: SyncItemResult[]): Promise<SyncResult> {
        const conflicts: ConflictItem[] = [];
        const errors: ErrorItem[] = [];
        let uploaded = 0;

        for (const result of results) {
            switch (result.status) {
                case 'accepted':
                    // Mark as synced
                    await updateHabitLogStatus(result.id, 'synced', result.serverId);
                    uploaded++;
                    break;

                case 'conflict':
                    // Get local data
                    const database = getDatabase();
                    const localItem = await database.getFirstAsync<HabitQueueItem>(
                        'SELECT * FROM habits_queue WHERE id = ?',
                        [result.id]
                    );

                    if (localItem) {
                        conflicts.push({
                            id: result.id,
                            localData: JSON.parse(localItem.payload_json),
                            serverData: result.serverData,
                        });

                        // Mark as failed with conflict message
                        await updateHabitLogStatus(
                            result.id,
                            'failed',
                            undefined,
                            result.message || 'Conflict detected'
                        );
                    }
                    break;

                case 'error':
                    // Mark as failed
                    await updateHabitLogStatus(
                        result.id,
                        'failed',
                        undefined,
                        result.message || 'Server error'
                    );

                    errors.push({
                        id: result.id,
                        message: result.message || 'Unknown error',
                    });
                    break;
            }
        }

        return {
            uploaded,
            conflicts,
            errors,
        };
    }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const syncService = new SyncService();
