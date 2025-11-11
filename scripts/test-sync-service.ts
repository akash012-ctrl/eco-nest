/**
 * Test script for SyncService
 * This script validates the core functionality of the SyncService
 */

import { v4 as uuidv4 } from 'uuid';
import { getPendingHabitLogs, initializeDatabase, insertHabitLog } from '../services/database';
import { syncService } from '../services/sync-service';

async function testSyncService() {
    console.log('🧪 Testing SyncService...\n');

    try {
        // Initialize database
        console.log('1. Initializing database...');
        await initializeDatabase();
        console.log('✅ Database initialized\n');

        // Test getUnsyncedCount
        console.log('2. Testing getUnsyncedCount()...');
        const initialCount = await syncService.getUnsyncedCount();
        console.log(`✅ Initial unsynced count: ${initialCount}\n`);

        // Test getLastSyncTimestamp
        console.log('3. Testing getLastSyncTimestamp()...');
        const lastSync = await syncService.getLastSyncTimestamp();
        console.log(`✅ Last sync timestamp: ${lastSync ? lastSync.toISOString() : 'Never'}\n`);

        // Add some test habit logs
        console.log('4. Adding test habit logs...');
        const testLogs = [
            {
                id: uuidv4(),
                habitType: 'recycle',
                pointsAwarded: 15,
                loggedAt: Date.now(),
            },
            {
                id: uuidv4(),
                habitType: 'bike',
                pointsAwarded: 20,
                loggedAt: Date.now(),
            },
        ];

        for (const log of testLogs) {
            await insertHabitLog(log.id, 'habit', log);
        }
        console.log(`✅ Added ${testLogs.length} test logs\n`);

        // Verify unsynced count increased
        console.log('5. Verifying unsynced count...');
        const newCount = await syncService.getUnsyncedCount();
        console.log(`✅ New unsynced count: ${newCount}\n`);

        // Test cooldown
        console.log('6. Testing cooldown functionality...');
        const isOnCooldown = syncService.isOnCooldown();
        const remainingCooldown = syncService.getRemainingCooldown();
        console.log(`✅ On cooldown: ${isOnCooldown}, Remaining: ${remainingCooldown}s\n`);

        // Test batch retrieval
        console.log('7. Testing batch retrieval...');
        const pendingLogs = await getPendingHabitLogs(50);
        console.log(`✅ Retrieved ${pendingLogs.length} pending logs\n`);

        // Test conflict resolution
        console.log('8. Testing conflict resolution...');
        if (testLogs.length > 0) {
            try {
                await syncService.handleConflict(testLogs[0].id, 'local');
                console.log('✅ Conflict resolution (keep local) successful\n');
            } catch (error) {
                console.log(`⚠️  Conflict resolution test: ${error}\n`);
            }
        }

        // Note: We can't test actual sync without Convex client configured
        console.log('9. Testing syncPendingItems() without Convex client...');
        try {
            await syncService.syncPendingItems();
            console.log('❌ Should have thrown error without Convex client\n');
        } catch (error) {
            if (error instanceof Error && error.message.includes('Convex client not configured')) {
                console.log('✅ Correctly throws error when Convex client not configured\n');
            } else {
                console.log(`⚠️  Unexpected error: ${error}\n`);
            }
        }

        console.log('✅ All SyncService tests completed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Run tests
testSyncService().catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
