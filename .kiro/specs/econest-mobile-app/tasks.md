# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Install and configure expo-sqlite for local storage
  - Install and configure Convex client SDK
  - Install react-native-reanimated and Moti for animations
  - Install expo-haptics for tactile feedback
  - Install react-native-flash-list for virtualized lists
  - Set up Expo Router file-based navigation structure
  - Configure TypeScript paths and aliases
  - _Requirements: All requirements depend on proper project setup_

- [ ] 2. Implement SQLite database layer and schemas
  - Create database initialization module with schema definitions
  - Implement habits_queue table with indexes
  - Implement leaderboard_cache table with indexes
  - Implement user_stats table (single row)
  - Implement streaks table
  - Create database migration utilities
  - Add database helper functions for common operations
  - _Requirements: 2.2, 4.1, 7.1, 7.2_

- [ ] 3. Build core HabitService with point calculation logic
  - Create HabitService class with interface definition
  - Implement logHabit() method with SQLite write
  - Implement point calculation logic (5-20 base points)
  - Implement streak tracking (3, 7, 14 day bonuses)
  - Implement daily cap enforcement (50 points per category)
  - Implement tap debouncing (300ms delay)
  - Implement undoLastLog() functionality
  - Implement getTodayLogs() and getStreakForHabit() queries
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]\* 3.1 Write unit tests for HabitService
  - Test point calculation with various scenarios
  - Test streak bonus logic
  - Test daily cap enforcement
  - Test debouncing behavior
  - _Requirements: 2.4, 2.5_

- [ ] 4. Build SyncService with batch upload and conflict handling
  - Create SyncService class with interface definition
  - Implement syncPendingItems() with batch logic (max 50 items)
  - Implement Convex API call for sync endpoint
  - Implement response parsing (accepted/conflict/error)
  - Implement SQLite status updates after sync
  - Implement 5-second cooldown enforcement
  - Implement getUnsyncedCount() and getLastSyncTimestamp()
  - Implement handleConflict() for user-driven resolution
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

- [ ]\* 4.1 Write unit tests for SyncService
  - Test batch creation logic
  - Test response handling for all status types
  - Test conflict resolution
  - Test cooldown enforcement
  - _Requirements: 4.2, 4.3, 4.4, 4.6_

- [ ] 5. Build LeaderboardService with real-time subscriptions
  - Create LeaderboardService class with interface definition
  - Implement Convex real-time query subscription for global rankings
  - Implement getDemoFriendsRankings() with predefined list
  - Implement getUserRank() with delta calculation
  - Implement getClosestCompetitors() (3 closest users)
  - Implement cacheSnapshot() to SQLite
  - Implement getCachedSnapshot() for offline viewing
  - Add network status detection
  - _Requirements: 3.1, 3.3, 3.4_

- [ ] 6. Set up Convex backend schema and functions
  - Define users collection schema
  - Define habit_logs collection schema
  - Define sync_batches collection schema
  - Create sync mutation function with validation logic
  - Implement server-side point validation and cap enforcement
  - Create leaderboard query function with ranking logic
  - Create authentication functions (email/password)
  - Add indexes for performance optimization
  - _Requirements: 1.4, 2.6, 4.3, 8.1_

- [ ] 7. Implement authentication and demo mode
  - Create AuthContext with Convex auth integration
  - Create DemoModeContext for sample data management
  - Implement email/password sign-in flow
  - Implement sign-up flow with validation
  - Implement demo mode activation with sample data population
  - Implement session management with expo-secure-store
  - Implement sign-out functionality with data cleanup
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 8. Build onboarding and authentication screens
  - Create splash screen with logo animation (1-2s)
  - Create onboarding screen layout
  - Add "Try demo data" button with prominent styling
  - Add email/password input fields with validation
  - Add sign-in/sign-up toggle
  - Implement navigation to Home on success
  - Add success animation and haptic feedback
  - Add loading states and error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 9. Build Home screen layout and components
  - Create Home screen file structure
  - Implement greeting header with user name/demo indicator
  - Create EcoPoints progress card with rank preview
  - Create 7-day sparkline chart component with tap-to-expand
  - Create "You vs. 3 Closest" compact preview component
  - Create quick log row with 6 habit buttons
  - Implement card shadows and visual hierarchy
  - Add responsive layout for different screen sizes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Implement habit logging UI with animations
  - Create habit button components with icons (44x44pt minimum)
  - Implement tap handler with HabitService integration
  - Create burst animation (200-350ms with particles)
  - Implement haptic feedback (impactLight at 50ms)
  - Create toast notification component ("Logged +10 EcoPoints")
  - Create undo snackbar component (5s duration with Undo button)
  - Implement badge increment animation
  - Add debounce visual feedback
  - Add "Today max reached" microcopy display
  - Coordinate animation sequence timing
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 6.2, 6.3, 6.4_

- [ ] 11. Build sync button and sync UI flow
  - Create sticky sync button component
  - Display last synced timestamp
  - Display unsynced count badge with animation
  - Implement tap handler with SyncService integration
  - Add progress message ("Syncing X items...")
  - Create confetti animation component (≤1s, non-blocking)
  - Create success toast with summary
  - Add haptic feedback for success/error states
  - Implement Retry button for failures
  - Add 5-second cooldown visual feedback
  - _Requirements: 4.1, 4.2, 4.5, 4.6, 5.5, 6.4_

- [ ] 12. Implement conflict resolution UI
  - Create conflict list item component
  - Display local vs server data comparison
  - Highlight "Keep Local" as default action
  - Add "Use Server" as secondary one-tap action
  - Implement resolution handler with SyncService
  - Add visual feedback for resolution
  - _Requirements: 4.4_

- [ ] 13. Build Leaderboard screen with tabs and rankings
  - Create Leaderboard screen file structure
  - Implement tab bar (Global | Demo Friends)
  - Create sticky user card component with rank and delta
  - Implement delta arrow animation (green ↑ / orange ↓, 250ms)
  - Create "You vs. 3 Closest" carousel component
  - Implement virtualized ranking list with react-native-flash-list
  - Add rank badges for top 3 positions
  - Add skeleton loaders for loading states
  - Add offline indicator when network unavailable
  - Implement real-time subscription updates
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 14. Implement privacy toggle and anonymous mode
  - Create privacy toggle component
  - Add toggle to Settings screen
  - Implement privacy state management
  - Update LeaderboardService to respect privacy setting
  - Update display name logic for anonymous mode
  - Add privacy prompt before first leaderboard post
  - _Requirements: 3.6_

- [ ] 15. Build Settings screen with accessibility options
  - Create Settings screen file structure
  - Add reduced motion toggle
  - Add privacy mode toggle (Public/Anonymous)
  - Add haptic feedback toggle
  - Add sign-out button with confirmation
  - Display app version and credits
  - Implement settings persistence to AsyncStorage
  - _Requirements: 6.6, 9.5_

- [ ] 16. Implement reduced motion mode
  - Create ReducedMotionContext
  - Conditionally disable burst animations
  - Conditionally disable confetti animations
  - Conditionally disable scale/bounce effects
  - Keep fade transitions (< 150ms)
  - Ensure haptics and toasts remain functional
  - _Requirements: 6.6, 9.5_

- [ ] 17. Implement accessibility features
  - Add accessibility labels to all interactive elements
  - Ensure minimum touch target size (44x44pt)
  - Verify color contrast ratios (WCAG AA)
  - Test with screen reader (VoiceOver/TalkBack)
  - Implement dynamic font sizing support
  - Add graceful haptic fallback for unsupported devices
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_

- [ ] 18. Create demo data population utilities
  - Create demo user data generator
  - Create demo habit logs generator
  - Create demo leaderboard data generator
  - Implement 1-step demo tour component
  - Highlight Quick Log, Sync, and Leaderboard in tour
  - Populate SQLite with demo data on activation
  - _Requirements: 1.3_

- [ ] 19. Implement offline detection and handling
  - Create network status detection hook
  - Add offline indicator to UI
  - Implement automatic retry when connection restored
  - Update LeaderboardService to use cached data offline
  - Add "No connection — saved locally" messaging
  - Ensure all user actions work offline
  - _Requirements: 3.4, 7.1, 7.3_

- [ ] 20. Add animated number counters for EcoPoints
  - Create AnimatedCounter component
  - Implement counter animation from old to new value
  - Use in EcoPoints progress card
  - Use in habit log success feedback
  - Ensure smooth 60fps animation
  - _Requirements: 6.3, 8.4_

- [ ] 21. Implement streak visualization with progress ring
  - Create StreakProgressRing component
  - Display current streak count
  - Highlight bonuses at 3, 7, and 14 days
  - Add visual indicators for milestone progress
  - Integrate with HabitService streak data
  - _Requirements: 2.4_

- [ ] 22. Polish visual design and theming
  - Define color palette (2-3 brand colors + accent)
  - Create theme configuration file
  - Apply consistent spacing and typography
  - Implement card shadows and elevation
  - Add brand logo and icons
  - Ensure visual hierarchy on all screens
  - Apply concise microcopy throughout
  - _Requirements: 6.1, 6.5, 6.7_

- [ ] 23. Optimize performance
  - Implement React.memo for expensive components
  - Add useMemo and useCallback where appropriate
  - Verify 60fps animation performance
  - Test SQLite query performance with large datasets
  - Implement pagination for leaderboard queries
  - Add database vacuum utility
  - Profile with React Native Performance Monitor
  - _Requirements: 3.5_

- [ ]\* 23.1 Write integration tests for critical flows
  - Test habit log → SQLite → Sync → Convex flow
  - Test offline habit log → online sync flow
  - Test demo mode → habit log → leaderboard flow
  - Test conflict resolution flow
  - Test authentication → sync → leaderboard subscription flow
  - _Requirements: All core requirements_

- [ ] 24. Implement error boundaries and error handling
  - Create global error boundary component
  - Add error handling to all service methods
  - Implement user-friendly error messages
  - Add error logging for debugging
  - Test error scenarios (network failures, validation errors)
  - _Requirements: All requirements_

- [ ] 25. Final integration and 30-second demo validation
  - Test complete 30-second demo flow
  - Verify all animations and haptics work together
  - Ensure demo mode works without authentication
  - Test sync flow with real Convex backend
  - Verify leaderboard real-time updates
  - Test offline → online transition
  - Validate all requirements are met
  - _Requirements: All requirements_
