# Product Overview

EcoNest is a mobile application that helps users log eco-friendly habits and compete with others through gamification. The app combines local-first offline reliability with real-time leaderboard updates.

## Core Features

- **Habit Logger**: Quick-tap logging of eco-friendly actions with instant feedback (burst animations, haptics, toasts)
- **EcoPoints System**: Gamified rewards with streaks, daily caps, and server-side validation
- **Leaderboard**: Real-time rankings showing "You vs. 3 closest" competitors with delta animations
- **Offline-First**: All actions saved locally to SQLite, explicit user-controlled sync to Convex backend
- **Demo Mode**: Instant exploration with sample data, no authentication required

## Key Principles

- **Transparency**: Explicit sync button with unsynced badge - users control when data uploads
- **Delight**: Coordinated micro-interactions (burst, confetti, haptics) under 1 second
- **Privacy**: Demo mode for exploration, optional public/anonymous leaderboard participation
- **Reliability**: No data loss offline, automatic retry on reconnection
- **30-Second Demo**: Designed to showcase full value in half a minute

## Target Experience

Users should feel instant gratification when logging habits, clear visibility of their progress, and motivation through attainable competitive targets rather than unreachable top ranks.
