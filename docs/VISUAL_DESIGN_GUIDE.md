# EcoNest Visual Design Guide

## Overview

This document outlines the visual design system for EcoNest, including color palette, typography, spacing, shadows, and component styling guidelines.

## Brand Colors

### Primary Colors

- **Eco Green** (`#34C759` / `#30D158` dark): Primary brand color representing growth, nature, and eco-friendliness
  - Used for: Primary buttons, accent elements, positive feedback, EcoPoints display
  - Contrast ratio: WCAG AA compliant

- **Eco Blue** (`#007AFF` / `#0A84FF` dark): Secondary brand color representing trust and reliability
  - Used for: Secondary actions, informational elements
  - Contrast ratio: WCAG AA compliant

### Semantic Colors

- **Success Green** (`#34C759` / `#30D158` dark): Positive actions and confirmations
- **Alert Orange** (`#FF9500` / `#FF9F0A` dark): Warnings and negative deltas
- **Error Red** (`#FF3B30` / `#FF453A` dark): Errors and failures

### Neutral Grays

- **Gray 50-900**: Full spectrum of neutral grays for text, borders, and backgrounds
- Light mode uses darker grays for text, lighter for backgrounds
- Dark mode inverts this relationship

### Leaderboard Specific

- **Rank Up**: Green (`#34C759`) with upward arrow ↑
- **Rank Down**: Orange (`#FF9500`) with downward arrow ↓
- **Rank Badges**:
  - Gold: `#FFD700` (1st place)
  - Silver: `#C0C0C0` (2nd place)
  - Bronze: `#CD7F32` (3rd place)

## Typography

### Font Families

- **iOS**: System UI fonts (San Francisco)
- **Android**: Roboto
- **Web**: System font stack

### Font Sizes

```
xs:   12px - Captions, badges
sm:   14px - Labels, secondary text
base: 16px - Body text, buttons
lg:   18px - Large body text
xl:   20px - Subtitles
2xl:  24px - Section headers
3xl:  30px - Page headers
4xl:  36px - Hero text
5xl:  48px - Large numbers (EcoPoints)
```

### Font Weights

- Regular: 400 - Body text
- Medium: 500 - Labels
- Semibold: 600 - Buttons, emphasis
- Bold: 700 - Headers

### Pre-configured Text Styles

- **h1-h4**: Heading styles with appropriate size and weight
- **body**: Standard body text (16px, regular)
- **bodyLarge**: Larger body text (18px)
- **bodySmall**: Smaller body text (14px)
- **caption**: Small text (12px)
- **button**: Button text (16px, semibold)
- **label**: Form labels (14px, medium)

### Dynamic Font Sizing

All text supports `allowFontScaling={true}` with `maxFontSizeMultiplier={2}` for accessibility.

## Spacing System

### Base Units

```
xs:   4px  - Tight spacing
sm:   8px  - Small gaps
md:   16px - Standard spacing
lg:   24px - Section gaps
xl:   32px - Large sections
2xl:  48px - Major sections
3xl:  64px - Page sections
```

### Semantic Spacing

- **cardPadding**: 16px - Internal card padding
- **screenPadding**: 16px - Screen edge padding
- **sectionGap**: 24px - Gap between major sections
- **itemGap**: 12px - Gap between list items

## Elevation & Shadows

### Card Shadow

Subtle shadow for standard cards:

- iOS: shadowOpacity 0.1, shadowRadius 8, offset (0, 2)
- Android: elevation 3
- Web: box-shadow with 8px blur

### Elevated Card

More prominent shadow for important cards:

- iOS: shadowOpacity 0.15, shadowRadius 12, offset (0, 4)
- Android: elevation 6
- Web: box-shadow with 12px blur

### Button Shadow

Light shadow for buttons:

- iOS: shadowOpacity 0.08, shadowRadius 4, offset (0, 1)
- Android: elevation 2
- Web: box-shadow with 4px blur

### Modal Shadow

Strong shadow for modals:

- iOS: shadowOpacity 0.25, shadowRadius 24, offset (0, 8)
- Android: elevation 12
- Web: box-shadow with 24px blur

## Border Radius

```
sm:   4px  - Small elements
md:   8px  - Buttons, inputs
lg:   12px - Cards
xl:   16px - Large cards, habit buttons
2xl:  24px - Hero elements
full: 9999px - Circular elements
```

### Semantic Radius

- **card**: 12px
- **button**: 8px
- **input**: 8px
- **badge**: 16px (pill shape)

## Component Styling Guidelines

### Cards

- Use `Card` component from `@/components/ui/card`
- Default padding: 16px (cardPadding)
- Border radius: 12px
- Shadow: Standard card shadow
- Elevated variant available for emphasis

### Buttons

- Minimum touch target: 44x44pt (accessibility)
- Border radius: 8px
- Variants:
  - **Primary**: Eco Green background, white text
  - **Secondary**: Gray background, dark text
  - **Ghost**: Transparent background, accent text
- Sizes: sm (36px), md (44px), lg (52px)
- Shadow: Button shadow
- Loading state with spinner
- Disabled state at 50% opacity

### Badges

- Border radius: 16px (pill shape)
- Padding: 8px horizontal, 4px vertical
- Font: 14px semibold
- Variants: primary, secondary, error, warning
- Sizes: sm, md
- Hide when count is 0

### Habit Buttons

- Size: 100x100px
- Border radius: 16px
- Icon: 32px emoji
- Label: 12px semibold white text
- Shadow: Button shadow
- Minimum touch target: 44x44pt
- Disabled state: 50% opacity
- "Max" badge when capped out

### Toast Notifications

- Position: Top of screen (60px from top)
- Background: Accent color (Eco Green)
- Text: White, 15px semibold
- Border radius: 12px
- Shadow: Elevated card shadow
- Duration: 2 seconds
- Animation: Slide in from top (300ms)

### Sync Button

- Position: Sticky at bottom
- Background: Accent color (Eco Green)
- Text: White, 16px semibold
- Border radius: 12px
- Minimum height: 48px
- Shadow: Elevated card shadow
- Cooldown timer displayed
- Unsynced badge visible when items pending

## Microcopy Guidelines

### Success Messages

- "Saved ✓" - Generic save confirmation
- "Synced ✓" - Sync completion
- "Logged +X EcoPoints" - Habit log success

### Error Messages

- "Uh oh — try again" - Generic error
- "No connection — saved locally" - Offline state
- "Sync failed — try again" - Sync error

### Empty States

- "No logs yet — tap + to log your first habit"
- "No rankings yet — sync to see your position"
- "No data available"

### Loading States

- "Syncing X items..." - During sync
- "Loading..." - Generic loading

### Actions

- "Retry" - Retry failed action
- "Undo" - Undo last action
- "Sync" - Trigger sync
- "Keep Local" - Conflict resolution (default)
- "Use Server" - Conflict resolution (alternative)

### Status

- "Today max reached" - Daily cap hit
- "Offline" - No network connection
- "Online" - Network available

## Accessibility Compliance

### Color Contrast

All color combinations meet WCAG AA standards:

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Touch Targets

- Minimum size: 44x44pt
- Adequate spacing between interactive elements
- Clear visual feedback on press

### Screen Reader Support

- All interactive elements have accessibility labels
- Semantic roles assigned (button, alert, etc.)
- State changes announced
- Non-essential animations hidden from screen readers

### Reduced Motion

- Toggle available in settings
- Disables burst animations, confetti, scale effects
- Preserves fade transitions (<150ms)
- Maintains haptic feedback and toasts

## Animation Guidelines

### Timing

- Quick transitions: 150-200ms
- Standard animations: 250-350ms
- Emphasis animations: 400-500ms
- Maximum duration: 1 second (confetti)

### Easing

- Ease out: For entering elements
- Ease in: For exiting elements
- Ease in-out: For state changes
- Spring: For playful interactions

### Coordinated Sequences

Habit log success (800ms total):

1. Burst animation (0-350ms)
2. Haptic feedback (50ms)
3. Toast notification (200ms)
4. Undo snackbar (350ms)
5. Badge increment (400ms)

Sync success (1200ms total):

1. Progress message (0-800ms)
2. Success haptic (800ms)
3. Confetti animation (800-1800ms)
4. Success toast (900ms)
5. Badge reset (1000ms)

## Visual Hierarchy

### Home Screen Order

1. Greeting header (h2 + h3)
2. EcoPoints card (elevated, prominent)
3. 7-day sparkline (compact)
4. "You vs. 3 Closest" preview (compact)
5. Quick log row (6 habit buttons)
6. Sticky sync button (bottom)

### Card Hierarchy

- One primary call-to-action per card
- Clear visual separation between sections
- Consistent padding and spacing
- Shadows indicate importance

### Text Hierarchy

- Headers: Bold, larger size
- Body: Regular weight, standard size
- Secondary: Reduced opacity or gray color
- Tertiary: Smallest size, lowest contrast

## Implementation Notes

### Using the Theme System

```typescript
import {
  Colors,
  Typography,
  Spacing,
  Shadows,
  BorderRadius,
  Microcopy
} from '@/constants/theme';

// Access colors
const accentColor = useThemeColor({}, 'accent');

// Use typography
fontSize: Typography.fontSize.lg,
fontWeight: Typography.fontWeight.semibold,

// Apply spacing
padding: Spacing.md,
gap: Spacing.sm,

// Add shadows
...Shadows.card,

// Set border radius
borderRadius: BorderRadius.button,

// Use microcopy
<Text>{Microcopy.success.saved}</Text>
```

### Using UI Components

```typescript
import { Card, Badge, Button } from '@/components/ui';

// Card with elevation
<Card elevated padding="lg">
  <ThemedText type="h3">Title</ThemedText>
</Card>

// Badge
<Badge count={5} variant="primary" size="md" />

// Button
<Button
  title="Sync"
  variant="primary"
  size="md"
  fullWidth
  onPress={handleSync}
/>
```

### Using Themed Text

```typescript
import { ThemedText } from '@/components/themed-text';

// With type and variant
<ThemedText type="h2" variant="primary">
  Heading
</ThemedText>

<ThemedText type="body" variant="secondary">
  Secondary text
</ThemedText>

<ThemedText type="caption" variant="tertiary">
  Tertiary text
</ThemedText>
```

## Brand Assets

### Logo

- Location: `assets/images/icon.png`
- Usage: App icon, splash screen
- Format: PNG with transparency
- Sizes: Multiple resolutions for different platforms

### Habit Icons

Habit buttons use emoji for simplicity and universal recognition:

- ♻️ Recycle
- 🚴 Bike
- 🥗 Meatless
- 🥤 Reusable
- 🌱 Compost
- 💧 Water

## Platform-Specific Considerations

### iOS

- Uses SF Pro font family
- Native shadow rendering
- Haptic feedback available
- Rounded design language

### Android

- Uses Roboto font family
- Elevation-based shadows
- Material Design influence
- Adaptive icons

### Web

- System font stack
- CSS box-shadow
- Responsive design
- Keyboard navigation support

## Future Enhancements

- Custom icon set for habits
- Animated illustrations
- Dark mode refinements
- Seasonal themes
- Achievement badges
- Custom user avatars
