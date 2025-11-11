# Technology Stack

## Framework & Platform

- **React Native** (0.81.5) with **Expo** (~54.0.23)
- **Expo Router** (~6.0.14) for file-based routing
- **TypeScript** (~5.9.2) with strict mode enabled
- React 19.1.0 with new architecture enabled

## Key Libraries

- **Convex** (^1.28.2): Real-time backend for leaderboard and data sync
- **React Navigation**: Bottom tabs and native navigation
- **Expo Haptics**: Physical feedback for user actions
- **Expo Image**: Optimized image handling
- **React Native Reanimated** (~4.1.1): Smooth animations
- **React Native Gesture Handler** (~2.28.0): Touch interactions

## Local Storage

- **SQLite**: Local queue for offline-first data management
- Schema: `id, type, payloadJSON, status(pending/synced/failed), createdAt, attempts`

## Build & Development

### Common Commands

```bash
# Start development server
npm start

# Platform-specific development
npm run android
npm run ios
npm run web

# Linting
npm run lint

# Reset project to blank state
npm run reset-project
```

### Project Configuration

- **TypeScript**: Strict mode with path aliases (`@/*` maps to root)
- **ESLint**: Using `eslint-config-expo`
- **Expo Config**: `app.json` with typed routes and React Compiler experiments enabled
- **New Architecture**: Enabled for performance improvements

## Platform Support

- iOS (supports tablet)
- Android (edge-to-edge, adaptive icons)
- Web (static output)

## Development Notes

- Use `expo start` for development (not `npm run dev`)
- File-based routing in `app/` directory
- Path aliases: Use `@/` prefix for imports from root
- Expo Go available for quick testing, but development builds recommended for full features
