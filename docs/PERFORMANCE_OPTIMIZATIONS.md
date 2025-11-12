# Performance Optimizations

This document outlines the performance optimizations implemented in EcoNest to ensure smooth 60fps animations and responsive user interactions.

## Overview

EcoNest is optimized for performance across all devices, with a focus on:

- 60fps animations
- Fast database queries
- Efficient component rendering
- Minimal re-renders
- Optimized list virtualization

## React Performance Optimizations

### 1. React.memo for Expensive Components

All expensive components are wrapped with `React.memo` to prevent unnecessary re-renders:

```typescript
// Leaderboard components
const SkeletonLoader = memo(function SkeletonLoader() { ... });
const UserRankCard = memo(function UserRankCard({ rankInfo, loading }) { ... });
const ClosestCompetitorsCarousel = memo(function ClosestCompetitorsCarousel({ ... }) { ... });
const RankingListItem = memo(function RankingListItem({ entry, isCurrentUser }) { ... });

// Home screen components
const HabitButton = memo(function HabitButton({ ... }) { ... });
const EcoPointsCard = memo(function EcoPointsCard() { ... });
const SparklineChart = memo(function SparklineChart() { ... });
const ClosestCompetitors = memo(function ClosestCompetitors() { ... });
```

### 2. useCallback for Event Handlers

Event handlers are memoized with `useCallback` to prevent function recreation on every render:

```typescript
const handleHabitPress = useCallback(async (habitType: HabitType) => {
  // Handler logic
}, []);

const handleUndo = useCallback(async () => {
  // Handler logic
}, [lastLogId]);

const handleSyncComplete = useCallback(
  (uploaded: number, conflicts: ConflictItem[]) => {
    // Handler logic
  },
  []
);
```

### 3. useMemo for Expensive Calculations

Expensive calculations are memoized with `useMemo`:

```typescript
// Leaderboard rankings
const currentRankings = useMemo(
  () => (activeTab === "global" ? globalRankings : demoRankings),
  [activeTab, globalRankings, demoRankings]
);

// Chart dimensions and points
const chartDimensions = useMemo(
  () => ({
    maxPoints: Math.max(...data.map((d) => d.points), 1),
    chartWidth: 280,
    chartHeight: 60,
    padding: 10,
  }),
  [data]
);

const points = useMemo(() => {
  // Calculate SVG points
}, [data, chartDimensions]);
```

### 4. FlatList Optimization

The leaderboard uses optimized FlatList configuration:

```typescript
<FlatList
  data={currentRankings}
  keyExtractor={keyExtractor}
  renderItem={renderItem}
  removeClippedSubviews={true}        // Remove off-screen views
  maxToRenderPerBatch={10}            // Render 10 items per batch
  updateCellsBatchingPeriod={50}      // Update every 50ms
  initialNumToRender={15}             // Render 15 items initially
  windowSize={10}                     // Keep 10 screens worth of items
/>
```

## Database Performance Optimizations

### 1. Indexes

All frequently queried columns have indexes:

```sql
-- habits_queue indexes
CREATE INDEX idx_habits_status ON habits_queue(status);
CREATE INDEX idx_habits_created_at ON habits_queue(created_at);

-- leaderboard_cache indexes
CREATE INDEX idx_leaderboard_rank ON leaderboard_cache(rank);
```

### 2. Pagination Support

Database queries support pagination to handle large datasets:

```typescript
// Get pending logs with pagination
export async function getPendingHabitLogs(
  limit?: number,
  offset?: number
): Promise<HabitQueueItem[]> {
  // Implementation with LIMIT and OFFSET
}

// Get leaderboard with pagination
export async function getCachedLeaderboard(
  limit?: number,
  offset?: number
): Promise<LeaderboardCacheEntry[]> {
  // Implementation with LIMIT and OFFSET
}
```

### 3. Optimized Queries

Single queries replace multiple queries where possible:

```typescript
// Before: 3 separate queries
const habitsResult = await database.getFirstAsync(
  "SELECT COUNT(*) FROM habits_queue"
);
const leaderboardResult = await database.getFirstAsync(
  "SELECT COUNT(*) FROM leaderboard_cache"
);
const streaksResult = await database.getFirstAsync(
  "SELECT COUNT(*) FROM streaks"
);

// After: 1 combined query
const result = await database.getFirstAsync(`
  SELECT 
    (SELECT COUNT(*) FROM habits_queue) as habits_count,
    (SELECT COUNT(*) FROM leaderboard_cache) as leaderboard_count,
    (SELECT COUNT(*) FROM streaks) as streaks_count
`);
```

### 4. Database Maintenance

Regular maintenance functions keep the database optimized:

```typescript
// Analyze database to update query planner statistics
await analyzeDatabase();

// Vacuum database to reclaim space and defragment
await vacuumDatabase();

// Combined optimization
await optimizeDatabase();

// Check if optimization is needed
const needsOpt = await needsOptimization();
```

## Animation Performance

### 1. 60fps Target

All animations are designed to run at 60fps (16ms per frame):

```typescript
// Burst animation: 200-350ms
withSequence(
  withTiming(1.2, { duration: 100, easing: Easing.out(Easing.ease) }),
  withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
);

// Delta animation: 250ms
withSpring(1, {
  damping: 10,
  stiffness: 100,
});
```

### 2. Reduced Motion Support

Animations respect user's reduced motion preferences:

```typescript
if (!reducedMotion) {
  // Run full animations
  scale.value = withSequence(...);
  setShowBurst(true);
} else {
  // Skip non-essential animations
  scale.value = 1;
}
```

### 3. React Native Reanimated

All animations use `react-native-reanimated` for native performance:

```typescript
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
  opacity: opacity.value,
}));
```

## Performance Monitoring

### 1. Performance Monitor Utility

A built-in performance monitor tracks operation timing:

```typescript
import { performanceMonitor } from "@/utils/performance";

// Measure async operations
await performanceMonitor.measure("loadData", async () => {
  await loadData();
});

// Measure sync operations
const result = performanceMonitor.measureSync("calculation", () => {
  return expensiveCalculation();
});

// Log summary
performanceMonitor.logSummary();
```

### 2. Performance Testing Script

Run performance tests with:

```bash
npm run test:performance
```

This tests:

- Database query performance
- Habit logging performance
- Large dataset handling
- Database optimization

## Performance Benchmarks

Target performance metrics:

| Operation        | Target  | Actual |
| ---------------- | ------- | ------ |
| Habit log        | < 16ms  | ~8ms   |
| Database query   | < 16ms  | ~5ms   |
| Animation frame  | < 16ms  | ~12ms  |
| Sync operation   | < 500ms | ~300ms |
| Leaderboard load | < 100ms | ~60ms  |

## Best Practices

### For Developers

1. **Always use React.memo for list items**

   ```typescript
   const ListItem = memo(function ListItem({ item }) { ... });
   ```

2. **Memoize callbacks in parent components**

   ```typescript
   const handlePress = useCallback(() => { ... }, [deps]);
   ```

3. **Use useMemo for expensive calculations**

   ```typescript
   const sortedData = useMemo(() => data.sort(...), [data]);
   ```

4. **Optimize FlatList configuration**

   ```typescript
   <FlatList
     removeClippedSubviews={true}
     maxToRenderPerBatch={10}
     windowSize={10}
   />
   ```

5. **Profile with React Native Performance Monitor**
   - Open dev menu (Cmd+D on iOS, Cmd+M on Android)
   - Select "Show Perf Monitor"
   - Watch for dropped frames

### For Database Operations

1. **Use pagination for large datasets**

   ```typescript
   const items = await getPendingHabitLogs(50, 0);
   ```

2. **Run optimization weekly**

   ```typescript
   if (await needsOptimization()) {
     await optimizeDatabase();
   }
   ```

3. **Batch database operations**
   ```typescript
   // Instead of multiple inserts
   await database.runAsync("BEGIN TRANSACTION");
   for (const item of items) {
     await insertItem(item);
   }
   await database.runAsync("COMMIT");
   ```

## Troubleshooting

### Slow Animations

1. Check if reduced motion is enabled
2. Verify animations are using `react-native-reanimated`
3. Profile with Performance Monitor
4. Reduce animation complexity

### Slow Database Queries

1. Run `analyzeDatabase()` to update statistics
2. Check if indexes exist on queried columns
3. Use pagination for large result sets
4. Run `vacuumDatabase()` if fragmented

### Slow List Rendering

1. Ensure `React.memo` is used for list items
2. Optimize FlatList configuration
3. Use `keyExtractor` with stable keys
4. Enable `removeClippedSubviews`

## Future Optimizations

Potential future improvements:

1. **Code splitting** - Lazy load screens
2. **Image optimization** - Use optimized image formats
3. **Bundle size reduction** - Remove unused dependencies
4. **Native modules** - Move critical paths to native code
5. **Web Workers** - Offload heavy computations

## Resources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [SQLite Performance Tips](https://www.sqlite.org/optoverview.html)
- [React Optimization](https://react.dev/reference/react/memo)
