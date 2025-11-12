# Demo Data Utilities

This directory contains utilities for populating the EcoNest app with demo data.

## Files

### `demo-data.ts`

Comprehensive demo data generation utilities for the EcoNest app.

#### Key Functions

- **`populateAllDemoData()`**: Main function to populate all demo data (habits, leaderboard, streaks)
- **`populateDemoHabitLogs()`**: Creates realistic habit logs for the past 7 days with varying patterns
- **`populateDemoLeaderboard()`**: Generates a leaderboard with 30+ users including the demo user at rank 42
- **`populateDemoStreaks()`**: Creates streak data for all habit types
- **`generateDemoUser()`**: Returns demo user information
- **`generateDemoFriendsLeaderboard()`**: Returns a predefined list of demo friends

#### Demo Data Characteristics

**Habit Logs:**

- 7 days of historical data
- 2-5 logs per day with random distribution
- Points range from 5-20 base points
- Includes streak bonuses (3, 7, 14 day milestones)
- 3 most recent logs are marked as "pending" for demo sync
- Total demo user points: 245

**Leaderboard:**

- 30+ users with realistic rankings
- Demo user positioned at rank 42 (mid-tier for motivation)
- Includes top 10 users and users around demo user's rank
- Users distributed across ranks 1-100 for scrolling demo

**Streaks:**

- Active streaks for all 6 habit types
- Ranges from 1-7 consecutive days
- Demonstrates streak bonus system

**Demo Friends:**

- 8 predefined friends
- Demo user positioned at rank 3 among friends
- Shows attainable competitive targets

## Usage

```typescript
import { populateAllDemoData } from "@/utils/demo-data";

// Populate all demo data when activating demo mode
await populateAllDemoData();
```

## Integration

The demo data utilities are integrated with:

- `contexts/demo-mode-context.tsx` - Calls `populateAllDemoData()` on demo mode activation
- `components/demo-tour.tsx` - Shows a 1-step tour highlighting key features
- SQLite database - All data is persisted locally for offline-first experience
