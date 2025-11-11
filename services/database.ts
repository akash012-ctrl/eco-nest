import * as SQLite from 'expo-sqlite';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Database version for migrations
const DATABASE_VERSION = 1;

/**
 * Initialize the SQLite database and create tables if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
    try {
        db = await SQLite.openDatabaseAsync('econest.db');

        // Enable foreign keys
        await db.execAsync('PRAGMA foreign_keys = ON;');

        // Create tables
        await createTables();

        // Initialize user_stats if empty
        await initializeUserStats();

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}

/**
 * Create all database tables with indexes
 */
async function createTables(): Promise<void> {
    if (!db) throw new Error('Database not initialized');

    // habits_queue table - stores pending and synced habit logs
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits_queue (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'synced', 'failed')),
      created_at INTEGER NOT NULL,
      synced_at INTEGER,
      server_id TEXT,
      attempts INTEGER DEFAULT 0,
      error_message TEXT
    );
  `);

    // Create indexes for habits_queue
    await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habits_status ON habits_queue(status);
  `);

    await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits_queue(created_at);
  `);

    // leaderboard_cache table - stores cached leaderboard data
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS leaderboard_cache (
      user_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      eco_points INTEGER NOT NULL,
      rank INTEGER NOT NULL,
      is_anonymous INTEGER NOT NULL,
      cached_at INTEGER NOT NULL
    );
  `);

    // Create index for leaderboard_cache
    await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_cache(rank);
  `);

    // user_stats table - single row storing user statistics
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      total_eco_points INTEGER DEFAULT 0,
      current_rank INTEGER,
      last_sync_at INTEGER,
      unsynced_count INTEGER DEFAULT 0
    );
  `);

    // streaks table - tracks habit streaks
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS streaks (
      habit_type TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 0,
      last_logged_date TEXT,
      longest_streak INTEGER DEFAULT 0
    );
  `);
}

/**
 * Initialize user_stats table with default values if empty
 */
async function initializeUserStats(): Promise<void> {
    if (!db) throw new Error('Database not initialized');

    const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM user_stats WHERE id = 1'
    );

    if (result && result.count === 0) {
        await db.runAsync(
            'INSERT INTO user_stats (id, total_eco_points, unsynced_count) VALUES (1, 0, 0)'
        );
    }
}

/**
 * Get the database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.closeAsync();
        db = null;
    }
}

// ============================================================================
// Helper Functions for habits_queue
// ============================================================================

export interface HabitQueueItem {
    id: string;
    type: string;
    payload_json: string;
    status: 'pending' | 'synced' | 'failed';
    created_at: number;
    synced_at?: number;
    server_id?: string;
    attempts: number;
    error_message?: string;
}

/**
 * Insert a new habit log into the queue
 */
export async function insertHabitLog(
    id: string,
    type: string,
    payload: any
): Promise<void> {
    const database = getDatabase();

    await database.runAsync(
        `INSERT INTO habits_queue (id, type, payload_json, status, created_at, attempts)
     VALUES (?, ?, ?, 'pending', ?, 0)`,
        [id, type, JSON.stringify(payload), Date.now()]
    );

    // Increment unsynced count
    await database.runAsync(
        'UPDATE user_stats SET unsynced_count = unsynced_count + 1 WHERE id = 1'
    );
}

/**
 * Get all pending habit logs
 */
export async function getPendingHabitLogs(limit?: number): Promise<HabitQueueItem[]> {
    const database = getDatabase();

    const query = limit
        ? `SELECT * FROM habits_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT ?`
        : `SELECT * FROM habits_queue WHERE status = 'pending' ORDER BY created_at ASC`;

    const params = limit ? [limit] : [];

    return await database.getAllAsync<HabitQueueItem>(query, params);
}

/**
 * Update habit log status after sync
 */
export async function updateHabitLogStatus(
    id: string,
    status: 'synced' | 'failed',
    serverId?: string,
    errorMessage?: string
): Promise<void> {
    const database = getDatabase();

    await database.runAsync(
        `UPDATE habits_queue 
     SET status = ?, synced_at = ?, server_id = ?, error_message = ?, attempts = attempts + 1
     WHERE id = ?`,
        [status, Date.now(), serverId || null, errorMessage || null, id]
    );

    // Decrement unsynced count if synced
    if (status === 'synced') {
        await database.runAsync(
            'UPDATE user_stats SET unsynced_count = MAX(0, unsynced_count - 1) WHERE id = 1'
        );
    }
}

/**
 * Delete a habit log by ID
 */
export async function deleteHabitLog(id: string): Promise<void> {
    const database = getDatabase();

    // Check if it was pending
    const item = await database.getFirstAsync<{ status: string }>(
        'SELECT status FROM habits_queue WHERE id = ?',
        [id]
    );

    await database.runAsync('DELETE FROM habits_queue WHERE id = ?', [id]);

    // Decrement unsynced count if it was pending
    if (item && item.status === 'pending') {
        await database.runAsync(
            'UPDATE user_stats SET unsynced_count = MAX(0, unsynced_count - 1) WHERE id = 1'
        );
    }
}

/**
 * Get count of unsynced items
 */
export async function getUnsyncedCount(): Promise<number> {
    const database = getDatabase();

    const result = await database.getFirstAsync<{ unsynced_count: number }>(
        'SELECT unsynced_count FROM user_stats WHERE id = 1'
    );

    return result?.unsynced_count || 0;
}

// ============================================================================
// Helper Functions for leaderboard_cache
// ============================================================================

export interface LeaderboardCacheEntry {
    user_id: string;
    display_name: string;
    eco_points: number;
    rank: number;
    is_anonymous: number;
    cached_at: number;
}

/**
 * Cache leaderboard data
 */
export async function cacheLeaderboardData(entries: Omit<LeaderboardCacheEntry, 'cached_at'>[]): Promise<void> {
    const database = getDatabase();

    // Clear existing cache
    await database.runAsync('DELETE FROM leaderboard_cache');

    // Insert new entries
    const cachedAt = Date.now();
    for (const entry of entries) {
        await database.runAsync(
            `INSERT INTO leaderboard_cache (user_id, display_name, eco_points, rank, is_anonymous, cached_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [entry.user_id, entry.display_name, entry.eco_points, entry.rank, entry.is_anonymous, cachedAt]
        );
    }
}

/**
 * Get cached leaderboard data
 */
export async function getCachedLeaderboard(): Promise<LeaderboardCacheEntry[]> {
    const database = getDatabase();

    return await database.getAllAsync<LeaderboardCacheEntry>(
        'SELECT * FROM leaderboard_cache ORDER BY rank ASC'
    );
}

/**
 * Clear leaderboard cache
 */
export async function clearLeaderboardCache(): Promise<void> {
    const database = getDatabase();
    await database.runAsync('DELETE FROM leaderboard_cache');
}

// ============================================================================
// Helper Functions for user_stats
// ============================================================================

export interface UserStats {
    id: number;
    total_eco_points: number;
    current_rank?: number;
    last_sync_at?: number;
    unsynced_count: number;
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
    const database = getDatabase();

    const result = await database.getFirstAsync<UserStats>(
        'SELECT * FROM user_stats WHERE id = 1'
    );

    if (!result) {
        throw new Error('User stats not initialized');
    }

    return result;
}

/**
 * Update user statistics
 */
export async function updateUserStats(updates: Partial<Omit<UserStats, 'id'>>): Promise<void> {
    const database = getDatabase();

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.total_eco_points !== undefined) {
        fields.push('total_eco_points = ?');
        values.push(updates.total_eco_points);
    }

    if (updates.current_rank !== undefined) {
        fields.push('current_rank = ?');
        values.push(updates.current_rank);
    }

    if (updates.last_sync_at !== undefined) {
        fields.push('last_sync_at = ?');
        values.push(updates.last_sync_at);
    }

    if (updates.unsynced_count !== undefined) {
        fields.push('unsynced_count = ?');
        values.push(updates.unsynced_count);
    }

    if (fields.length === 0) return;

    values.push(1); // WHERE id = 1

    await database.runAsync(
        `UPDATE user_stats SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
}

/**
 * Update last sync timestamp
 */
export async function updateLastSyncTimestamp(): Promise<void> {
    const database = getDatabase();

    await database.runAsync(
        'UPDATE user_stats SET last_sync_at = ? WHERE id = 1',
        [Date.now()]
    );
}

// ============================================================================
// Helper Functions for streaks
// ============================================================================

export interface StreakData {
    habit_type: string;
    current_streak: number;
    last_logged_date?: string;
    longest_streak: number;
}

/**
 * Get streak data for a habit type
 */
export async function getStreakData(habitType: string): Promise<StreakData | null> {
    const database = getDatabase();

    return await database.getFirstAsync<StreakData>(
        'SELECT * FROM streaks WHERE habit_type = ?',
        [habitType]
    );
}

/**
 * Update streak data for a habit type
 */
export async function updateStreakData(
    habitType: string,
    currentStreak: number,
    lastLoggedDate: string
): Promise<void> {
    const database = getDatabase();

    // Get existing data to check longest streak
    const existing = await getStreakData(habitType);
    const longestStreak = existing
        ? Math.max(existing.longest_streak, currentStreak)
        : currentStreak;

    await database.runAsync(
        `INSERT OR REPLACE INTO streaks (habit_type, current_streak, last_logged_date, longest_streak)
     VALUES (?, ?, ?, ?)`,
        [habitType, currentStreak, lastLoggedDate, longestStreak]
    );
}

/**
 * Get all streaks
 */
export async function getAllStreaks(): Promise<StreakData[]> {
    const database = getDatabase();

    return await database.getAllAsync<StreakData>(
        'SELECT * FROM streaks ORDER BY habit_type ASC'
    );
}

// ============================================================================
// Migration Utilities
// ============================================================================

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
    const database = getDatabase();

    // Create migrations table if it doesn't exist
    await database.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);

    // Get current version
    const result = await database.getFirstAsync<{ version: number }>(
        'SELECT MAX(version) as version FROM migrations'
    );

    const currentVersion = result?.version || 0;

    // Apply migrations
    if (currentVersion < DATABASE_VERSION) {
        console.log(`Migrating database from version ${currentVersion} to ${DATABASE_VERSION}`);

        // Add future migrations here
        // Example:
        // if (currentVersion < 2) {
        //   await database.execAsync('ALTER TABLE habits_queue ADD COLUMN new_field TEXT');
        //   await database.runAsync('INSERT INTO migrations (version, applied_at) VALUES (2, ?)', [Date.now()]);
        // }

        // Record initial version
        if (currentVersion === 0) {
            await database.runAsync(
                'INSERT INTO migrations (version, applied_at) VALUES (?, ?)',
                [DATABASE_VERSION, Date.now()]
            );
        }
    }
}

/**
 * Clear all data from the database (useful for demo mode reset)
 */
export async function clearAllData(): Promise<void> {
    const database = getDatabase();

    await database.execAsync('DELETE FROM habits_queue');
    await database.execAsync('DELETE FROM leaderboard_cache');
    await database.execAsync('DELETE FROM streaks');
    await database.runAsync(
        'UPDATE user_stats SET total_eco_points = 0, current_rank = NULL, last_sync_at = NULL, unsynced_count = 0 WHERE id = 1'
    );
}

/**
 * Vacuum the database to reclaim space
 */
export async function vacuumDatabase(): Promise<void> {
    const database = getDatabase();
    await database.execAsync('VACUUM');
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
    habitsQueueCount: number;
    leaderboardCacheCount: number;
    streaksCount: number;
}> {
    const database = getDatabase();

    const habitsResult = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM habits_queue'
    );

    const leaderboardResult = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM leaderboard_cache'
    );

    const streaksResult = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM streaks'
    );

    return {
        habitsQueueCount: habitsResult?.count || 0,
        leaderboardCacheCount: leaderboardResult?.count || 0,
        streaksCount: streaksResult?.count || 0,
    };
}
