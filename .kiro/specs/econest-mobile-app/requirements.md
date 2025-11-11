# Requirements Document

## Introduction

EcoNest is a mobile application built with React Native and Expo that helps users log eco-friendly habits and compete with others through gamification. The app focuses on two core features: a delightful Habit Logger with instant feedback and a motivating Leaderboard with real-time rankings. EcoNest combines local-first offline reliability with real-time leaderboard updates powered by Convex, ensuring smooth performance and transparency. The app is designed for instant exploration with a demo-first experience and can be fully demonstrated in 30 seconds.

## Glossary

- **EcoNest System**: The complete mobile application including frontend and Convex backend
- **User**: An authenticated individual using the EcoNest mobile application
- **Demo Mode**: A temporary exploration mode with sample data that allows Users to try all features without signing in
- **Habit Log**: A recorded instance of an eco-friendly action performed by the User
- **EcoPoints**: Gamification currency awarded to Users for completing eco-friendly actions
- **Sync Operation**: The process of synchronizing local data with the Convex backend server
- **Convex Backend**: The real-time database and server function platform handling data persistence and ranking
- **Local Queue**: SQLite-based storage for unsynced User actions and cached data
- **Leaderboard**: A ranked list of Users based on EcoPoints
- **Haptic Feedback**: Physical vibration responses provided through the device

## Requirements

### Requirement 1: Demo Mode and Onboarding

**User Story:** As a new user, I want to quickly explore the app, so that I can understand its value before signing up.

#### Acceptance Criteria

1. WHEN the EcoNest System launches for the first time, THE EcoNest System SHALL display a splash screen with logo and subtle animation for 1 to 2 seconds
2. THE EcoNest System SHALL provide a prominent "Try demo data" button on the onboarding and login screens allowing Users to explore features without authentication
3. WHEN the User selects demo mode, THE EcoNest System SHALL populate the app with representative sample data and trigger a 1-step demo tour highlighting Quick Log, Sync, and Leaderboard
4. THE EcoNest System SHALL provide simple email and password authentication through the Convex Backend for Users who wish to create an account
5. WHEN authentication succeeds, THE EcoNest System SHALL navigate the User to the Home screen with a brief confirmation animation and success Haptic Feedback

### Requirement 2: Habit Logger

**User Story:** As a user, I want to quickly log my eco-friendly habits, so that I can track my progress and earn EcoPoints.

#### Acceptance Criteria

1. THE EcoNest System SHALL display 6 default habit buttons with icons and labels plus 1 custom habit option per day
2. WHEN a habit is tapped, THE EcoNest System SHALL write the log to SQLite with status pending, show a burst animation lasting 200 to 350 milliseconds with toast stating "Logged +10 EcoPoints", provide success Haptic Feedback, and display an undo snackbar for 5 seconds with primary action "Undo"
3. THE EcoNest System SHALL mark logs as pending and increment the Home unsynced badge with animation
4. THE EcoNest System SHALL award base points between 5 and 20 per action, visualize streaks with a progress ring showing bonuses at 3, 7, and 14 consecutive days, and cap daily points at 50 per habit category
5. THE EcoNest System SHALL debounce rapid taps with 300 millisecond delay and display friendly microcopy stating "Today max reached" when caps are hit
6. THE Convex Backend SHALL validate all point awards server-side to enforce caps and prevent client manipulation on Sync
7. THE EcoNest System SHALL provide an undo functionality that removes the most recent log from SQLite and decrements the unsynced badge when the user taps "Undo" within 5 seconds

### Requirement 3: Leaderboard

**User Story:** As a user, I want to see how I rank against others, so that I stay motivated to improve my eco-friendly behavior.

#### Acceptance Criteria

1. THE EcoNest System SHALL display Leaderboard tabs for Global and Demo Friends views
2. THE EcoNest System SHALL display a sticky user card showing current rank and numeric delta with a small upward green arrow or downward orange arrow animating in 250 milliseconds when ranking changes
3. THE EcoNest System SHALL display a "You vs. 3 closest" carousel showing attainable targets rather than only top global ranks
4. THE EcoNest System SHALL update Leaderboard data via Convex Backend real-time queries when online and display cached snapshot with offline indicator when network is unavailable
5. THE EcoNest System SHALL display skeleton placeholders while loading and virtualize the list for performance with large datasets
6. THE EcoNest System SHALL provide a privacy toggle for Public versus Anonymous participation before posting scores

### Requirement 4: Explicit Synchronization

**User Story:** As a user, I want to control when my data syncs with the server, so that I have transparency over network activity.

#### Acceptance Criteria

1. THE EcoNest System SHALL display a sticky Sync button on Home screen showing last synced timestamp and unsynced count badge
2. WHEN the User taps Sync, THE EcoNest System SHALL disable the button, show progress message "Syncing X items...", provide light impact Haptic Feedback, and re-enable on failure with message "No connection — saved locally" and Retry button
3. THE EcoNest System SHALL upload batches limited to 50 items to Convex Backend server function and receive per-item status response with accepted, conflict, or error states
4. WHEN conflicts occur, THE EcoNest System SHALL surface conflicts as a single list item per conflicting record with Keep Local highlighted as default and Use Server as one-tap secondary action for power users
5. WHEN Sync succeeds, THE EcoNest System SHALL display a one-line summary stating "X items uploaded — Y conflicts kept local", show a short confetti animation lasting under 1 second, success toast, and success Haptic Feedback
6. THE EcoNest System SHALL enforce a 5-second client cooldown after Sync to prevent repeated taps

**Sync Contract (Dev Note):** Client sends `[{id, type:'habit', payload, createdAt}]`. Server returns `[{id, status:'accepted'|'conflict'|'error', serverId?, message?, retryAfter?}]`.

**SQLite Schema (Local Queue):** `id, type, payloadJSON, status(pending/synced/failed), createdAt, attempts`

### Requirement 5: Home Dashboard

**User Story:** As a user, I want to see my daily snapshot and key metrics on the home screen, so that I can quickly understand my current status.

#### Acceptance Criteria

1. THE EcoNest System SHALL display Home screen components in the following order: greeting, EcoPoints progress with rank preview, 7-day sparkline chart, compact "You vs. 3 Closest" leaderboard preview, quick log row for 6 habits, and sticky Sync button
2. THE EcoNest System SHALL display a compact 7-day sparkline chart showing EcoPoints trend with tap-to-expand functionality for exact values
3. THE EcoNest System SHALL display a compact "You vs. 3 Closest" leaderboard preview on the Home screen below the sparkline
4. THE EcoNest System SHALL use card shadows and clear visual hierarchy with one primary call-to-action per card
5. THE EcoNest System SHALL display the unsynced item count prominently on the Home screen with increment animation when new logs are created

### Requirement 6: Visual Design and Animation Polish

**User Story:** As a user, I want a polished and delightful interface, so that the app feels professional and engaging.

#### Acceptance Criteria

1. THE EcoNest System SHALL use a minimal color palette of 2 to 3 brand colors including one accent for positive gains and one for alerts
2. THE EcoNest System SHALL animate all transitions with smooth animations under 300 milliseconds
3. THE EcoNest System SHALL use animated number counters for EcoPoints increases animating from previous value to new value
4. THE EcoNest System SHALL coordinate success feedback micro-interactions including burst animation, short haptic, and toast into sequences under 1 second to create cohesive delight
5. THE EcoNest System SHALL use concise microcopy throughout the interface with success messages stating "Saved ✓", error messages stating "Uh oh — try again", and empty states stating "No logs yet — tap + to log your first habit"
6. THE EcoNest System SHALL provide a "reduced motion" toggle in settings to disable non-essential animations for accessibility
7. THE EcoNest System SHALL ensure all toasts and confetti are non-blocking and dismissible

### Requirement 7: Offline-First Data Management

**User Story:** As a user, I want my actions to be saved locally even without internet, so that I never lose my progress.

#### Acceptance Criteria

1. THE EcoNest System SHALL immediately write all User actions to the Local Queue with a pending status
2. WHEN a Sync Operation completes successfully, THE EcoNest System SHALL mark synchronized items as synced and store server identifiers
3. THE EcoNest System SHALL ensure no action is lost offline by automatically retrying pending Sync items when connection is restored without background auto-sync to preserve battery

### Requirement 8: Points & Motivation

**User Story:** As a user, I want a fair and motivating points system, so that I feel rewarded for my eco-friendly actions.

#### Acceptance Criteria

1. THE EcoNest System SHALL implement server-side validation of all point awards through the Convex Backend to enforce caps, recompute points, and prevent client-side manipulation with server answer as source-of-truth on next sync
2. THE EcoNest System SHALL display points as meaningful metrics by showing EcoPoints total prominently
3. THE EcoNest System SHALL make points visible in Leaderboards and badges to reinforce value
4. THE EcoNest System SHALL visualize point increases with animated counters and highlight milestones using confetti micro-animations

### Requirement 9: Accessibility

**User Story:** As a user with accessibility needs, I want the app to be usable with assistive technologies, so that I can access all features.

#### Acceptance Criteria

1. THE EcoNest System SHALL provide tappable areas with a minimum size of 44x44 points
2. THE EcoNest System SHALL maintain color contrast ratios meeting WCAG AA standards
3. THE EcoNest System SHALL provide alternative text and screen reader labels for all interactive elements
4. THE EcoNest System SHALL support dynamic font sizing based on device accessibility settings
5. THE EcoNest System SHALL provide a "reduced motion" toggle in settings to disable non-essential animations for accessibility
6. WHERE Haptic Feedback is unsupported by the device, THE EcoNest System SHALL gracefully continue without haptics

---

## Demo Script

**30-Second Demo Flow:**

1. **Start**: Open app → "Try demo data" → Home screen appears instantly with sample data
2. **Log Habit**: Tap a habit icon → burst animation + "Logged +10 EcoPoints" toast → undo snackbar appears → unsynced badge increments
3. **Show Offline**: Point out unsynced badge (e.g., "3 unsynced")
4. **Sync**: Tap Sync button → "Syncing 3 items..." → confetti animation + success toast "3 uploaded — 0 conflicts"
5. **Leaderboard**: Navigate to Leaderboard → show "You vs. 3 closest" carousel → highlight current rank with delta animation (green arrow up)
6. **Finish**: Show leaderboard delta animation → emphasize real-time ranking and smooth micro-interactions

**Tagline:** "EcoNest — track your green wins, compete with friends, and stay eco-motivated — all offline-first."

**Key Talking Points:**

- Local-first architecture ensures no data loss
- Real-time leaderboard updates via Convex
- Delightful micro-interactions (burst, confetti, haptics)
- Privacy-first with demo mode for instant exploration

---

## Implementation Notes

**Micro-interaction Timing:**

- Burst animation: 200–350ms with small scale + particle effect
- Undo snackbar: visible 5s, primary action "Undo" (tappable)
- Sync confetti: ≤1s, non-blocking; combine with success haptic and toast
- Leaderboard delta: small arrow + numeric delta (e.g., `+2 ↑`) animates in 250ms

**Offline Retry Policy:**

- Automatic retry only when connection returns
- No background auto-sync to preserve battery
- Explicit Sync button is demo-friendly and transparent

**Server Validation:**

- Convex functions enforce caps and recompute points
- Client treats server answer as source-of-truth on next sync
- Batch size: 50 items with pagination for future background sync

**Out of Scope for MVP:**

- Friend request flows (Demo Friends only)
- Country leaderboard tab (Global + Demo Friends only)
- Complex merge UI (Keep Local default with Use Server option)
- Background location and push notifications
