# Project Structure

## Directory Organization

```
app/                    # File-based routing (Expo Router)
  (tabs)/              # Tab-based navigation screens
  _layout.tsx          # Root layout with theme provider
  modal.tsx            # Modal screen example

components/            # Reusable UI components
  ui/                  # UI primitives and building blocks
  themed-*.tsx         # Theme-aware components (ThemedText, ThemedView)
  *.tsx                # Feature components (haptic-tab, parallax-scroll-view, etc.)

constants/             # App-wide constants
  theme.ts             # Color palette and font definitions

hooks/                 # Custom React hooks
  use-color-scheme.ts  # Color scheme detection (with .web.ts variant)
  use-theme-color.ts   # Theme color resolution

assets/                # Static assets
  images/              # Icons, splash screens, app icons

convex/                # Convex backend
  _generated/          # Auto-generated Convex types
  README.md            # Convex setup instructions
  tsconfig.json        # Convex-specific TypeScript config

scripts/               # Build and utility scripts
  reset-project.js     # Project reset utility
```

## Code Organization Patterns

### Component Structure

- **Themed Components**: Use `ThemedText` and `ThemedView` for automatic light/dark mode support
- **Component Props**: Export prop types (e.g., `ThemedTextProps`) for reusability
- **Styling**: Use `StyleSheet.create()` for performance, define styles at bottom of file
- **Platform-Specific**: Use `.web.ts` suffix for web-specific implementations

### Import Conventions

- Use path alias `@/` for imports from root (e.g., `@/hooks/use-theme-color`)
- Group imports: React/React Native first, then third-party, then local

### File Naming

- Components: kebab-case (e.g., `themed-text.tsx`, `haptic-tab.tsx`)
- Hooks: kebab-case with `use-` prefix (e.g., `use-color-scheme.ts`)
- Constants: kebab-case (e.g., `theme.ts`)
- Routes: Expo Router conventions (parentheses for groups, underscore for layouts)

### Theme System

- Colors defined in `constants/theme.ts` with light/dark variants
- Use `useThemeColor` hook to resolve theme-aware colors
- Support both `lightColor`/`darkColor` props and theme keys

## Key Architectural Decisions

- **File-Based Routing**: Screens live in `app/` directory, routes auto-generated
- **Theme-First**: All UI components should support light/dark mode
- **Platform Awareness**: Use Platform.select() for platform-specific code
- **Type Safety**: Strict TypeScript with exported prop types
- **Expo Router**: Anchor set to `(tabs)` for tab-based navigation root
