/**
 * Simple verification script for LeaderboardService
 * This script tests the core functionality without requiring a full test framework
 */

import { initializeDatabase } from '../services/database';
import {
    isOnline,
    leaderboardService
} from '../services/leaderboard-service';

async function testLeaderboardService() {
    console.log('🧪 Testing LeaderboardService...\n');

    try {
        // Initialize database
        console.log('1️⃣ Initializing database...');
        await initializeDatabase();
        console.log('✅ Database initialized\n');

        // Test network status detection
        console.log('2️⃣ Testing network status detection...');
        const online = isOnline();
        console.log(`✅ Network status: ${online ? 'Online' : 'Offline'}\n`);

        // Test demo friends rankings
        console.log('3️⃣ Testing getDemoFriendsRankings...');
        const demoFriends = await leaderboardService.getDemoFriendsRankings();
        console.log(`✅ Retrieved ${demoFriends.length} demo friends`);
        console.log('   Top 3:');
        demoFriends.slice(0, 3).forEach((entry) => {
            console.log(
                `   ${entry.rank}. ${entry.displayName} - ${entry.ecoPoints} points`
            );
        });
        console.log('');

        // Test caching
        console.log('4️⃣ Testing cacheSnapshot...');
        await leaderboardService.cacheSnapshot(demoFriends);
        console.log('✅ Cached demo friends rankings\n');

        // Test retrieving cached data
        console.log('5️⃣ Testing getCachedSnapshot...');
        const cached = await leaderboardService.getCachedSnapshot();
        console.log(`✅ Retrieved ${cached.length} cached entries`);
        console.log('   First entry:', cached[0]?.displayName || 'None');
        console.log('');

        // Test user rank
        console.log('6️⃣ Testing getUserRank...');
        const userRank = await leaderboardService.getUserRank();
        console.log(`✅ User rank: ${userRank.rank}`);
        console.log(`   EcoPoints: ${userRank.ecoPoints}`);
        console.log(`   Delta: ${userRank.delta}`);
        console.log('');

        // Test closest competitors
        console.log('7️⃣ Testing getClosestCompetitors...');
        const competitors = await leaderboardService.getClosestCompetitors(3);
        console.log(`✅ Retrieved ${competitors.length} closest competitors`);
        competitors.forEach((entry) => {
            console.log(
                `   ${entry.rank}. ${entry.displayName} - ${entry.ecoPoints} points`
            );
        });
        console.log('');

        console.log('🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testLeaderboardService()
        .then(() => {
            console.log('\n✨ LeaderboardService verification complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Verification failed:', error);
            process.exit(1);
        });
}

export { testLeaderboardService };
