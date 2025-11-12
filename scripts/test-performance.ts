/**
 * Performance testing script for EcoNest
 * Tests database queries, animations, and component rendering
 */

import {
    analyzeDatabase,
    getCachedLeaderboard,
    getDatabaseStats,
    getPendingHabitLogs,
    getUserStats,
    initializeDatabase,
    needsOptimization,
    optimizeDatabase,
} from '../services/database';
import { habitService } from '../services/habit-service';
import { performanceMonitor } from '../utils/performance';

/**
 * Test database query performance
 */
async function testDatabasePerformance() {
    console.log('\n🔍 Testing Database Performance...\n');

    // Test user stats query
    await performanceMonitor.measure('getUserStats', async () => {
        await getUserStats();
    });

    // Test pending logs query
    await performanceMonitor.measure('getPendingHabitLogs', async () => {
        await getPendingHabitLogs(50);
    });

    // Test leaderboard cache query
    await performanceMonitor.measure('getCachedLeaderboard', async () => {
        await getCachedLeaderboard(100);
    });

    // Test database stats
    await performanceMonitor.measure('getDatabaseStats', async () => {
        const stats = await getDatabaseStats();
        console.log('Database stats:', stats);
    });

    // Check if optimization is needed
    const needsOpt = await needsOptimization();
    console.log(`Database needs optimization: ${needsOpt}`);
}

/**
 * Test habit logging performance
 */
async function testHabitLoggingPerformance() {
    console.log('\n📝 Testing Habit Logging Performance...\n');

    const habitTypes = ['recycle', 'bike', 'meatless', 'reusable', 'compost', 'water'] as const;

    for (const habitType of habitTypes) {
        await performanceMonitor.measure(`logHabit-${habitType}`, async () => {
            try {
                await habitService.logHabit(habitType);
            } catch (error) {
                // Ignore errors (e.g., daily cap reached)
            }
        });
    }
}

/**
 * Test database optimization
 */
async function testDatabaseOptimization() {
    console.log('\n⚡ Testing Database Optimization...\n');

    // Test analyze
    await performanceMonitor.measure('analyzeDatabase', async () => {
        await analyzeDatabase();
    });

    // Test vacuum (only if needed)
    const needsOpt = await needsOptimization();
    if (needsOpt) {
        await performanceMonitor.measure('optimizeDatabase', async () => {
            await optimizeDatabase();
        });
    } else {
        console.log('Database optimization not needed at this time');
    }
}

/**
 * Test large dataset queries
 */
async function testLargeDatasetPerformance() {
    console.log('\n📊 Testing Large Dataset Performance...\n');

    // Test pagination
    const pageSize = 20;
    const pages = 5;

    for (let i = 0; i < pages; i++) {
        await performanceMonitor.measure(`getLeaderboard-page-${i + 1}`, async () => {
            await getCachedLeaderboard(pageSize, i * pageSize);
        });
    }
}

/**
 * Run all performance tests
 */
async function runPerformanceTests() {
    console.log('🚀 Starting EcoNest Performance Tests\n');
    console.log('═'.repeat(60));

    try {
        // Initialize database
        await initializeDatabase();

        // Run tests
        await testDatabasePerformance();
        await testHabitLoggingPerformance();
        await testLargeDatasetPerformance();
        await testDatabaseOptimization();

        // Print summary
        console.log('\n');
        console.log('═'.repeat(60));
        performanceMonitor.logSummary();

        // Performance recommendations
        console.log('\n💡 Performance Recommendations:\n');

        const metrics = performanceMonitor.getMetrics();
        const slowQueries = metrics.filter((m) => m.duration && m.duration > 16);

        if (slowQueries.length === 0) {
            console.log('✅ All operations are running at 60fps or better!');
        } else {
            console.log('⚠️  The following operations may need optimization:');
            slowQueries.forEach((m) => {
                console.log(`   - ${m.name}: ${m.duration?.toFixed(2)}ms`);
            });
        }

        console.log('\n📈 Performance Tips:');
        console.log('   - Run database optimization weekly');
        console.log('   - Use pagination for large lists');
        console.log('   - Memoize expensive components with React.memo');
        console.log('   - Use useCallback for event handlers');
        console.log('   - Use useMemo for expensive calculations');
        console.log('   - Enable removeClippedSubviews on FlatLists');

        console.log('\n✅ Performance tests completed!\n');
    } catch (error) {
        console.error('❌ Performance tests failed:', error);
        throw error;
    }
}

// Run tests if executed directly
if (require.main === module) {
    runPerformanceTests()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { runPerformanceTests };
