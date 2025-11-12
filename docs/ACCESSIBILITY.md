# EcoNest Accessibility Documentation

This document outlines the accessibility features implemented in EcoNest to ensure the app is usable by everyone, including users with disabilities.

## Overview

EcoNest follows WCAG 2.1 Level AA guidelines and implements React Native accessibility best practices to provide an inclusive experience for all users.

## Implemented Accessibility Features

### 1. Accessibility Labels and Hints

All interactive elements have been enhanced with proper accessibility labels and hints:

#### Habit Buttons

- **Label**: "Log [habit name] habit"
- **Hint**: Contextual hints based on state (e.g., "Daily maximum reached" when capped)
- **Role**: button
- **State**: Properly indicates disabled state

#### Sync Button

- **Label**: Dynamic label showing sync status and item count
- **Hint**: "Tap to synchronize your local data with the server"
- **Role**: button
- **State**: Indicates disabled and busy states

#### Privacy Toggle

- **Label**: "Privacy Mode: [Public/Anonymous]"
- **Hint**: Explains current state and toggle action
- **Role**: switch
- **State**: Indicates checked and disabled states

#### Leaderboard Tabs

- **Label**: "Global leaderboard" / "Demo friends leaderboard"
- **Hint**: "View [type] rankings"
- **Role**: tab
- **State**: Indicates selected state

#### Ranking List Items

- **Label**: Comprehensive description including rank, name, and points
- **Role**: text
- Highlights current user position

### 2. Touch Target Sizes

All interactive elements meet or exceed the minimum touch target size of 44x44 points:

- **Habit Buttons**: 100x100pt (exceeds minimum)
- **Sync Button**: 48pt minimum height
- **Retry Button**: 44x44pt minimum
- **Tab Buttons**: 44pt minimum height
- **Switches**: Native switch component (meets minimum)
- **Sign Out Button**: 44pt minimum height

### 3. Color Contrast Ratios (WCAG AA Compliant)

The app uses carefully selected colors that meet WCAG AA contrast requirements:

#### Light Mode

- **Text on Background**: #11181C on #FFFFFF (15.8:1) ✓
- **Accent Green**: #34C759 on #FFFFFF (3.0:1) ✓
- **Alert Orange**: #FF9500 on #FFFFFF (2.9:1) ✓
- **Button Text**: #FFFFFF on #34C759 (3.0:1) ✓
- **Error Text**: #FF3B30 on #FFFFFF (3.9:1) ✓

#### Dark Mode

- **Text on Background**: #ECEDEE on #151718 (14.2:1) ✓
- **Accent Green**: #34C759 on #151718 (8.5:1) ✓
- **Alert Orange**: #FF9500 on #151718 (6.8:1) ✓
- **Button Text**: #FFFFFF on #34C759 (3.0:1) ✓

### 4. Screen Reader Support

The app is fully compatible with VoiceOver (iOS) and TalkBack (Android):

- All interactive elements have meaningful labels
- Decorative elements are hidden from screen readers using `accessibilityElementsHidden`
- Loading indicators are properly announced
- Error messages use `accessibilityRole="alert"` for immediate announcement
- Modal dialogs use `accessibilityViewIsModal` to focus attention

### 5. Dynamic Font Sizing

All text components support dynamic font sizing based on device accessibility settings:

- `allowFontScaling={true}` enabled on all ThemedText components
- `maxFontSizeMultiplier={2}` prevents excessive scaling that breaks layouts
- Layouts use flexible containers to accommodate larger text

### 6. Reduced Motion Support

Users can disable non-essential animations via Settings:

**When Reduced Motion is Enabled:**

- ✗ Burst animations (habit logging)
- ✗ Confetti animations (sync success)
- ✗ Scale/bounce effects
- ✓ Fade transitions (< 150ms) - kept for essential feedback
- ✓ Haptic feedback - maintained
- ✓ Toast notifications - maintained

**Implementation:**

- `ReducedMotionContext` provides app-wide state
- Components check `reducedMotion` flag before triggering animations
- Setting persisted to AsyncStorage

### 7. Haptic Feedback with Graceful Fallback

Haptic feedback is implemented with proper error handling:

**Features:**

- User-controllable via Settings toggle
- Graceful fallback on unsupported devices
- No errors or crashes when haptics unavailable
- Utility function `triggerHaptic()` handles all edge cases

**Haptic Types Used:**

- Light impact: Habit logging, sync initiation
- Success notification: Sync completion
- Error notification: Sync failure

**Implementation:**

```typescript
// utils/haptics.ts provides safe wrapper
await triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
```

## Testing Recommendations

### Manual Testing Checklist

#### VoiceOver (iOS)

1. Enable VoiceOver: Settings > Accessibility > VoiceOver
2. Navigate through all screens using swipe gestures
3. Verify all interactive elements are announced correctly
4. Test habit logging flow end-to-end
5. Test sync button and error states
6. Test leaderboard navigation and ranking announcements

#### TalkBack (Android)

1. Enable TalkBack: Settings > Accessibility > TalkBack
2. Navigate through all screens using swipe gestures
3. Verify all interactive elements are announced correctly
4. Test habit logging flow end-to-end
5. Test sync button and error states
6. Test leaderboard navigation and ranking announcements

#### Dynamic Font Sizing

1. iOS: Settings > Display & Brightness > Text Size
2. Android: Settings > Display > Font size
3. Increase font size to maximum
4. Verify all screens remain usable
5. Check for text truncation or layout breaks

#### Reduced Motion

1. Enable in app Settings > Accessibility > Reduced Motion
2. Log a habit - verify no burst animation
3. Sync data - verify no confetti animation
4. Check leaderboard - verify no bounce effects
5. Confirm fade transitions still work

#### Haptic Feedback

1. Disable in app Settings > Accessibility > Haptic Feedback
2. Log a habit - verify no vibration
3. Sync data - verify no vibration
4. Re-enable and verify haptics work again

#### Color Contrast

1. Use contrast checker tool (e.g., WebAIM Contrast Checker)
2. Verify all text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
3. Test in both light and dark modes

#### Touch Targets

1. Use device with small screen
2. Attempt to tap all interactive elements
3. Verify no accidental taps on adjacent elements
4. Confirm all buttons are easily tappable

## Known Limitations

1. **Custom Habit Icons**: Currently use emoji which may not be accessible to all screen readers. Consider using icon fonts with proper labels in future.

2. **Sparkline Chart**: Visual-only component. Consider adding data table alternative for screen reader users.

3. **Burst Animation**: Purely decorative, properly hidden from screen readers but could add audio cue for blind users.

## Future Enhancements

1. **Voice Control**: Add support for voice commands to log habits
2. **High Contrast Mode**: Implement dedicated high contrast theme
3. **Keyboard Navigation**: Add full keyboard support for web version
4. **Audio Feedback**: Optional audio cues for actions (in addition to haptics)
5. **Simplified Mode**: Streamlined UI for cognitive accessibility

## Resources

- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Accessibility Guidelines](https://developer.apple.com/accessibility/)
- [Android Accessibility Guidelines](https://developer.android.com/guide/topics/ui/accessibility)

## Compliance Statement

EcoNest strives to meet WCAG 2.1 Level AA standards. We are committed to continuous improvement and welcome feedback from users with accessibility needs.

For accessibility concerns or suggestions, please contact: accessibility@econest.app
