# EcoNest Mobile App - Design Document

## Overview

EcoNest is a React Native + Expo mobile application that enables users to log eco-friendly habits and compete through gamification. The app follows a **local-first architecture** with explicit synchronization, ensuring offline reliability while providing real-time leaderboard updates via Convex.

### Core Design Principles

1. **Local-First**: All user actions are immediately persisted to SQLite, ensuring zero data loss
2. **Explicit Sync**: Users control when data syncs to the server, providing transparency and battery efficiency
3. **Demo-First**: Instant exploration with sample data before authentication
4. **Micro-Interaction Delight**: Coordinated animations, haptics, and feedback create engaging experiences
5. **30-Second Demo**: Every feature is designed to be demonstrable in under 30 seconds

### Technology Stack

- **Frontend**: React Native (Expo SDK 52+)
- **Backend**: Convex (real-time database + server functions)
- **Local Storage**: expo-sqlite for offline queue and caching
- **State Management**: React Context + hooks for local state, Convex queries for server state
- **Navigation**: Expo Router (file-based routing)
- **Animations**: react-native-reanimated + Moti for smooth 60fps animations
- **Haptics**: expo-haptics for tactile feedback

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Native App                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Home       │  │  Leaderboard │  │   Settings   │  │
│  │   Screen     │  │    Screen    │  │    Screen    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│  ┌──────┴──────────────────┴──────────────────┴───────┐ │
│  │           Application State Layer                   │ │
│  │  - Demo Mode Context                                │ │
│  │  - Auth Context (Convex)                           │ │
│  │  - Sync Status Context                             │ │
│  └──────┬──────────────────┬──────────────────────────┘ │
│         │                  │                             │
│  ┌──────┴───────┐   ┌──────┴──────────┐                │
│  │   SQLite     │   │  Convex Client  │                │
│  │  Local Queue │   │  (Real-time)    │                │
│  └──────────────┘   └─────────────────┘                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Convex Backend │
                  │  - Auth        │
                  │  - Sync API    │
                  │  - Leaderboard │
                  └────────────────┘
```

### Data Flow

**Habit Logging Flow (Offline-First)**

```
User Taps Habit
    ↓
Write to SQLite (status: pending)
    ↓
Show UI Feedback (animation + haptic + toast)
    ↓
Increment Unsynced Badge
    ↓
[User triggers Sync]
    ↓
Batch Upload to Convex (max 50 items)
    ↓
Receive Response (accepted/conflict/error)
    ↓
Update SQLite (mark as synced)
    ↓
Show Success Feedback (confetti + toast)
```

**Leaderboard Flow (Real-Time)**

```
User Opens Leaderboard
    ↓
Check Network Status
    ↓
If Online: Subscribe to Convex Query (real-time)
    ↓
If Offline: Load Cached Snapshot from SQLite
    ↓
Display Rankings with Delta Animations
    ↓
[Real-time updates arrive]
    ↓
Animate Rank Changes (green/orange arrows)
```

## Components and Interfaces

### Screen Components

#### 1. Onboarding/Auth Screen

**Location**: `app/(auth)/index.tsx`

**Responsibilities**:

- Display splash screen with logo animation (1-2s)
- Provide "Try demo data" button
- Provide email/password authentication via Convex
- Navigate to Home on success

**Key UI Elements**:

- Logo with subtle fade-in animation
- "Try demo data" button (prominent, secondary style)
- Email/password inputs with validation
- "Sign In" / "Sign Up" toggle
- Loading state during authentication

**Design Decision**: Demo button is prominent to encourage instant exploration without friction.

#### 2. Home Screen

**Location**: `app/(tabs)/index.tsx`

**Responsibilities**:

- Display daily snapshot and key metrics
- Provide quick habit logging
- Show sync status and trigger sync
- Preview leaderboard position

**Layout Order** (top to bottom):

1. Greeting header with user name/demo indicator
2. EcoPoints progress card with rank preview
3. 7-day sparkline chart (tap to expand)
4. "You vs. 3 Closest" compact preview
5. Quick log row (6 habit buttons + custom)
6. Sticky Sync button (bottom)

**Key UI Elements**:

- Progress ring showing daily points
- Sparkline chart (7 days, tap for details)
- Habit buttons with icons (44x44pt minimum)
- Unsynced badge with animated counter
- Sync button with timestamp and status

**Design Decision**: Single-screen dashboard reduces navigation complexity and enables 30-second demo flow.

#### 3. Leaderboard Screen

**Location**: `app/(tabs)/leaderboard.tsx`

**Responsibilities**:

- Display global and demo friends rankings
- Show user's current position with delta
- Provide "You vs. 3 Closest" carousel
- Handle real-time updates

**Layout**:

- Tab bar: Global | Demo Friends
- Sticky user card (current rank + delta)
- "You vs. 3 Closest" carousel
- Virtualized list of rankings
- Offline indicator (when applicable)

**Key UI Elements**:

- Rank badges (1st, 2nd, 3rd with special styling)
- Delta arrows (green ↑ / orange ↓) with animation
- Avatar placeholders
- Skeleton loaders during fetch
- Privacy toggle (Public/Anonymous)

**Design Decision**: "You vs. 3 Closest" provides attainable targets instead of only showing top global ranks, improving motivation.

#### 4. Settings Screen

**Location**: `app/(tabs)/settings.tsx`

**Responsibilities**:

- Manage user preferences
- Provide accessibility options
- Display app information

**Key Settings**:

- Reduced motion toggle
- Privacy mode (Public/Anonymous)
- Haptic feedback toggle
- Sign out button
- App version and credits

### Core Services

#### SyncService

**Location**: `services/SyncService.ts`

**Interface**:

```typescript
interface SyncService {
  syncPendingItems(): Promise<SyncResult>;
  getUnsyncedCount(): Promise<number>;
  getLastSyncTimestamp(): Promise<Date | null>;
  handleConflict(itemId: string, resolution: "local" | "server"): Promise<void>;
}

interface SyncResult {
  uploaded: number;
  conflicts: ConflictItem[];
  errors: ErrorItem[];
}

interface ConflictItem {
  id: string;
  localData: any;
  serverData: any;
}
```

**Responsibilities**:

- Batch pending items from SQLite (max 50)
- Upload to Convex sync endpoint
- Handle responses (accepted/conflict/error)
- Update SQLite status
- Enforce 5-second cooldown

**Design Decision**: Explicit sync with user control provides transparency and prevents battery drain from background syncing.

#### HabitService

**Location**: `services/HabitService.ts`

**Interface**:

```typescript
interface HabitService {
  logHabit(habitType: HabitType): Promise<LogResult>;
  undoLastLog(logId: string): Promise<void>;
  getTodayLogs(): Promise<HabitLog[]>;
  getStreakForHabit(habitType: HabitType): Promise<number>;
  canLogHabit(habitType: HabitType): Promise<boolean>;
}

interface LogResult {
  logId: string;
  pointsAwarded: number;
  newTotal: number;
  streakBonus?: number;
  cappedOut: boolean;
}

type HabitType =
  | "recycle"
  | "bike"
  | "meatless"
  | "reusable"
  | "compost"
  | "water"
  | "custom";
```

**Responsibilities**:

- Write habit logs to SQLite with pending status
- Calculate base points (5-20 per action)
- Track streaks (3, 7, 14 day bonuses)
- Enforce daily caps (50 points per category)
- Debounce rapid taps (300ms)

**Design Decision**: Points are calculated client-side for instant feedback, but server validates on sync to prevent manipulation.

#### LeaderboardService

**Location**: `services/LeaderboardService.ts`

**Interface**:

```typescript
interface LeaderboardService {
  getGlobalRankings(limit: number): Promise<RankingEntry[]>;
  getDemoFriendsRankings(): Promise<RankingEntry[]>;
  getUserRank(): Promise<UserRankInfo>;
  getClosestCompetitors(count: number): Promise<RankingEntry[]>;
  cacheSnapshot(rankings: RankingEntry[]): Promise<void>;
  getCachedSnapshot(): Promise<RankingEntry[]>;
}

interface RankingEntry {
  userId: string;
  displayName: string;
  ecoPoints: number;
  rank: number;
  isAnonymous: boolean;
}

interface UserRankInfo {
  rank: number;
  delta: number; // change since last check
  ecoPoints: number;
}
```

**Responsibilities**:

- Subscribe to Convex real-time queries when online
- Cache snapshots to SQLite for offline viewing
- Calculate rank deltas for animations
- Filter by privacy settings

**Design Decision**: Real-time subscriptions via Convex provide instant leaderboard updates without polling.

### Data Models

#### SQLite Schema

**habits_queue** (Local Queue)

```sql
CREATE TABLE habits_queue (
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

CREATE INDEX idx_status ON habits_queue(status);
CREATE INDEX idx_created_at ON habits_queue(created_at);
```

**leaderboard_cache**

```sql
CREATE TABLE leaderboard_cache (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  eco_points INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  is_anonymous INTEGER NOT NULL,
  cached_at INTEGER NOT NULL
);

CREATE INDEX idx_rank ON leaderboard_cache(rank);
```

**user_stats**

```sql
CREATE TABLE user_stats (
  id INTEGER PRIMARY KEY CHECK(id = 1), -- single row
  total_eco_points INTEGER DEFAULT 0,
  current_rank INTEGER,
  last_sync_at INTEGER,
  unsynced_count INTEGER DEFAULT 0
);
```

**streaks**

```sql
CREATE TABLE streaks (
  habit_type TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  last_logged_date TEXT,
  longest_streak INTEGER DEFAULT 0
);
```

#### Convex Schema

**users** collection

```typescript
{
  _id: Id<"users">,
  _creationTime: number,
  email: string,
  displayName: string,
  ecoPoints: number,
  isAnonymous: boolean,
  lastActive: number
}
```

**habit_logs** collection

```typescript
{
  _id: Id<"habit_logs">,
  _creationTime: number,
  userId: Id<"users">,
  habitType: string,
  pointsAwarded: number,
  clientId: string, // for deduplication
  loggedAt: number,
  validated: boolean
}
```

**sync_batches** collection (for tracking)

```typescript
{
  _id: Id<"sync_batches">,
  _creationTime: number,
  userId: Id<"users">,
  itemCount: number,
  status: "processing" | "completed" | "failed"
}
```

### Sync Contract

**Client Request**:

```typescript
interface SyncRequest {
  items: SyncItem[];
}

interface SyncItem {
  id: string; // client-generated UUID
  type: "habit";
  payload: {
    habitType: string;
    pointsAwarded: number;
    loggedAt: number;
  };
  createdAt: number;
}
```

**Server Response**:

```typescript
interface SyncResponse {
  results: SyncItemResult[];
}

interface SyncItemResult {
  id: string; // matches client id
  status: "accepted" | "conflict" | "error";
  serverId?: string; // Convex document ID
  message?: string;
  retryAfter?: number; // seconds
  serverData?: any; // for conflicts
}
```

**Design Decision**: Batch size limited to 50 items prevents timeout issues and provides incremental progress feedback.

## Error Handling

### Network Errors

**Scenario**: Sync fails due to no connection

**Handling**:

1. Catch network error in SyncService
2. Keep items in SQLite with status 'pending'
3. Show toast: "No connection — saved locally"
4. Display Retry button
5. Provide light error haptic

**Design Decision**: Graceful degradation ensures users never lose data and understand the app state.

### Conflict Resolution

**Scenario**: Server has different data than client

**Handling**:

1. Server returns status 'conflict' with serverData
2. Display conflict item in UI as list item
3. Default action: "Keep Local" (highlighted)
4. Secondary action: "Use Server" (one-tap)
5. User selects resolution
6. Update SQLite accordingly

**Design Decision**: "Keep Local" default respects user's offline work while providing power users an override option.

### Validation Errors

**Scenario**: Server rejects habit log (e.g., cap exceeded)

**Handling**:

1. Server returns status 'error' with message
2. Mark item as 'failed' in SQLite
3. Show toast with error message
4. Provide option to dismiss or retry

**Design Decision**: Server-side validation prevents point manipulation and ensures fair leaderboards.

### Rate Limiting

**Scenario**: User taps Sync repeatedly

**Handling**:

1. Disable Sync button after tap
2. Enforce 5-second cooldown client-side
3. Show countdown timer on button
4. Re-enable after cooldown

**Design Decision**: Prevents server overload and accidental duplicate syncs.

## Animation and Micro-Interaction Specifications

### Habit Log Success Sequence

**Duration**: 800ms total

**Sequence**:

1. **Burst Animation** (0-350ms)
   - Scale button from 1.0 → 1.2 → 1.0
   - Emit 8-12 particles radially
   - Particles fade out over 300ms
2. **Haptic Feedback** (at 50ms)
   - Type: "impactLight"
   - Duration: ~10ms
3. **Toast Notification** (at 200ms)
   - Slide in from top
   - Message: "Logged +10 EcoPoints"
   - Duration: 2s
   - Auto-dismiss
4. **Undo Snackbar** (at 350ms)
   - Slide in from bottom
   - Message: "Undo" button (primary action)
   - Duration: 5s
   - Dismissible

5. **Badge Increment** (at 400ms)
   - Scale badge from 1.0 → 1.3 → 1.0
   - Update number with counter animation
   - Duration: 200ms

**Design Decision**: Staggered timing creates a cohesive sequence that feels responsive without overwhelming the user.

### Sync Success Sequence

**Duration**: 1200ms total

**Sequence**:

1. **Progress Message** (0-800ms)
   - "Syncing X items..."
   - Spinner animation
2. **Success Haptic** (at 800ms)
   - Type: "notificationSuccess"
3. **Confetti Animation** (800-1800ms)
   - Emit confetti from top
   - 20-30 pieces
   - Fall with physics
   - Non-blocking overlay
4. **Success Toast** (at 900ms)
   - Message: "X items uploaded — Y conflicts kept local"
   - Duration: 3s
5. **Badge Reset** (at 1000ms)
   - Fade out unsynced badge
   - Duration: 200ms

### Leaderboard Rank Delta Animation

**Duration**: 250ms

**Sequence**:

1. **Arrow Appearance** (0-100ms)
   - Fade in from alpha 0 → 1
   - Small scale 0.8 → 1.0
2. **Number Update** (0-250ms)
   - Counter animation from old → new rank
   - Color: green (up) / orange (down)
3. **Subtle Bounce** (100-250ms)
   - Scale 1.0 → 1.1 → 1.0
   - Easing: spring

**Design Decision**: Quick, subtle animations provide feedback without distracting from leaderboard browsing.

### Reduced Motion Mode

**When Enabled**:

- Disable burst animations
- Disable confetti
- Disable scale/bounce effects
- Keep fade transitions (< 150ms)
- Keep haptic feedback
- Keep toasts and snackbars

**Design Decision**: Respects user accessibility preferences while maintaining essential feedback.

## Security Considerations

### Authentication

- Use Convex built-in auth with email/password
- Store auth tokens securely via expo-secure-store
- Implement session timeout (7 days)
- Provide sign-out functionality

### Data Validation

- Server-side validation for all point awards
- Enforce caps and limits on Convex backend
- Validate habit types against whitelist
- Sanitize user inputs

### Privacy

- Anonymous mode hides display name on leaderboard
- Demo mode uses isolated sample data
- No tracking or analytics in MVP
- Clear data on sign-out

**Design Decision**: Privacy-first approach builds trust and complies with data protection standards.

## Performance Optimizations

### SQLite Optimizations

- Index on status and created_at columns
- Batch inserts for demo data
- Vacuum database periodically
- Limit query results with pagination

### React Native Optimizations

- Virtualized lists for leaderboard (react-native-flash-list)
- Memoized components with React.memo
- Debounced habit taps (300ms)
- Lazy load screens with React.lazy

### Convex Optimizations

- Real-time subscriptions instead of polling
- Paginated queries for large datasets
- Indexed fields for fast lookups
- Batch sync operations

**Design Decision**: Local-first architecture inherently provides excellent performance by eliminating network latency for user actions.

## Deployment and Configuration

### Environment Variables

```
CONVEX_DEPLOYMENT=<production-url>
DEMO_MODE_ENABLED=true
MAX_SYNC_BATCH_SIZE=50
SYNC_COOLDOWN_SECONDS=5
```

### Build Configuration

- Expo EAS Build for iOS and Android
- Separate development and production builds
- Code signing for app stores
- OTA updates via Expo Updates

**Design Decision**: Expo ecosystem provides streamlined deployment and updates without complex native tooling.

---

## Out of Scope for MVP

The following features are explicitly excluded from the initial release:

- Friend request flows (Demo Friends use predefined list)
- Country/region-specific leaderboards
- Complex merge UI for conflicts
- Background location tracking
- Push notifications
- Social sharing
- In-app purchases
- Custom habit creation (limited to 1 per day)
- Multi-language support
- Dark mode (system default only)

These features may be considered for future iterations based on user feedback and usage metrics.
