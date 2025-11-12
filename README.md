# EcoNest Contexts

This directory contains React contexts for managing authentication and demo mode in the EcoNest application.

## AuthContext

Manages user authentication, session management, and Convex integration.

### Features

- Email/password authentication via Convex backend
- Secure session storage using expo-secure-store
- 7-day session duration with automatic expiry
- Privacy settings management
- Database initialization on app startup

### Usage

```tsx
import { useAuth } from "@/contexts";

function MyComponent() {
  const { user, isAuthenticated, signIn, signUp, signOut } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn("user@example.com", "password123");
      // Navigate to home screen
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.displayName}!</Text>
      ) : (
        <Button title="Sign In" onPress={handleSignIn} />
      )}
    </View>
  );
}
```

### API

#### `useAuth()`

Returns an object with the following properties:

- `user: AuthUser | null` - Current authenticated user
- `isLoading: boolean` - Loading state
- `isAuthenticated: boolean` - Whether user is authenticated
- `signIn(email, password): Promise<void>` - Sign in with email/password
- `signUp(email, password, displayName): Promise<void>` - Create new account
- `signOut(): Promise<void>` - Sign out and clear session
- `updatePrivacy(isAnonymous): Promise<void>` - Update privacy settings

#### `AuthUser` Type

```typescript
interface AuthUser {
  userId: Id<"users">;
  email: string;
  displayName: string;
  ecoPoints: number;
  isAnonymous: boolean;
}
```

## DemoModeContext

Manages demo mode activation and sample data population.

### Features

- One-tap demo mode activation
- Realistic sample data generation
- Demo habit logs (7 days of data)
- Demo leaderboard with rankings
- Demo streaks and statistics
- Clean data cleanup on deactivation

### Usage

```tsx
import { useDemoMode } from "@/contexts";

function OnboardingScreen() {
  const { isDemoMode, activateDemoMode } = useDemoMode();

  const handleTryDemo = async () => {
    try {
      await activateDemoMode();
      // Navigate to home screen
    } catch (error) {
      console.error("Failed to activate demo mode:", error);
    }
  };

  return (
    <View>
      <Button title="Try demo data" onPress={handleTryDemo} />
    </View>
  );
}
```

### API

#### `useDemoMode()`

Returns an object with the following properties:

- `isDemoMode: boolean` - Whether demo mode is active
- `isLoading: boolean` - Loading state
- `activateDemoMode(): Promise<void>` - Activate demo mode with sample data
- `deactivateDemoMode(): Promise<void>` - Deactivate demo mode and clear data

#### `getDemoFriendsLeaderboard()`

Utility function that returns a predefined list of demo friends for the leaderboard.

```typescript
const demoFriends = getDemoFriendsLeaderboard();
// Returns array of demo friend rankings
```

## Demo Data

### Demo Habit Logs

- 7 days of habit logs
- 2-5 logs per day
- Random habit types (recycle, bike, meatless, etc.)
- Random points (5-20 per action)
- 3 unsynced items for demonstration

### Demo Leaderboard

- 100+ demo users with realistic rankings
- Demo user positioned at rank 42
- Users around demo user's rank for "You vs. 3 Closest"
- Top 10 users for global leaderboard view

### Demo Streaks

- Recycle: 5-day streak
- Bike: 3-day streak
- Meatless: 7-day streak
- Reusable: 2-day streak

### Demo User Stats

- Display Name: "Demo User"
- EcoPoints: 245
- Rank: 42
- Unsynced Count: 3

## Integration

Both contexts are integrated in the root layout (`app/_layout.tsx`):

```tsx
<ConvexProvider client={convex}>
  <AuthProvider>
    <DemoModeProvider>{/* App content */}</DemoModeProvider>
  </AuthProvider>
</ConvexProvider>
```

## Session Management

### Session Storage

Sessions are stored securely using expo-secure-store with the following keys:

- `econest_user_id` - User ID
- `econest_user_email` - User email
- `econest_user_display_name` - Display name
- `econest_session_expiry` - Session expiry timestamp
- `econest_demo_mode` - Demo mode flag

### Session Duration

- Default: 7 days
- Automatically expires after duration
- Restored on app restart if not expired

## Error Handling

Both contexts include comprehensive error handling:

- Network errors during authentication
- Database initialization failures
- Session restoration failures
- Demo data population errors

All errors are logged to console and thrown to the caller for UI handling.

## Database Integration

Both contexts integrate with the SQLite database service:

- Initialize database on app startup
- Clear data when switching modes
- Populate demo data in demo mode
- Clean up on sign out

## Security Considerations

- Passwords are hashed on the server (Convex backend)
- Session tokens stored securely with expo-secure-store
- Session expiry enforced client-side
- Demo mode isolated from authenticated data
- Privacy settings respected in leaderboard

## Future Enhancements

- Biometric authentication (Face ID, Touch ID)
- Social authentication (Google, Apple)
- Multi-device session management
- Background session refresh
- Offline authentication caching
