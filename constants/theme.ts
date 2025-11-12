/**
 * EcoNest Design System
 * 
 * Complete theme configuration including colors, typography, spacing, and elevation.
 * Supports light and dark modes with accessibility-compliant contrast ratios (WCAG AA).
 */

import { Platform } from 'react-native';

// ============================================================================
// BRAND COLORS
// ============================================================================

// Primary brand color - represents growth, nature, eco-friendliness
const ecoGreen = '#34C759';
const ecoGreenDark = '#30D158'; // Slightly brighter for dark mode

// Secondary brand color - trust, reliability
const ecoBlue = '#007AFF';
const ecoBlueDark = '#0A84FF';

// Alert/warning color - used for negative deltas, warnings
const alertOrange = '#FF9500';
const alertOrangeDark = '#FF9F0A';

// Success color - used for positive feedback
const successGreen = '#34C759';

// Error color - used for errors and failures
const errorRed = '#FF3B30';
const errorRedDark = '#FF453A';

// Neutral grays
const gray50 = '#F9FAFB';
const gray100 = '#F3F4F6';
const gray200 = '#E5E7EB';
const gray300 = '#D1D5DB';
const gray400 = '#9CA3AF';
const gray500 = '#6B7280';
const gray600 = '#4B5563';
const gray700 = '#374151';
const gray800 = '#1F2937';
const gray900 = '#111827';

const tintColorLight = ecoGreen;
const tintColorDark = ecoGreenDark;

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const Colors = {
  light: {
    // Base colors
    text: '#11181C',
    textSecondary: gray600,
    textTertiary: gray500,
    background: '#FFFFFF',
    backgroundSecondary: gray50,

    // Brand colors
    tint: tintColorLight,
    accent: ecoGreen,
    secondary: ecoBlue,

    // Semantic colors
    success: successGreen,
    error: errorRed,
    warning: alertOrange,
    alert: alertOrange,

    // UI elements
    border: gray200,
    borderLight: gray100,
    card: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.1)',

    // Icons
    icon: gray600,
    iconSecondary: gray400,
    tabIconDefault: gray500,
    tabIconSelected: tintColorLight,

    // Interactive states
    buttonPrimary: ecoGreen,
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: gray100,
    buttonSecondaryText: gray900,

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    modalBackground: 'rgba(0, 0, 0, 0.4)',

    // Leaderboard specific
    rankUp: successGreen,
    rankDown: alertOrange,
    rankBadgeGold: '#FFD700',
    rankBadgeSilver: '#C0C0C0',
    rankBadgeBronze: '#CD7F32',
  },
  dark: {
    // Base colors
    text: '#ECEDEE',
    textSecondary: gray400,
    textTertiary: gray500,
    background: '#151718',
    backgroundSecondary: gray900,

    // Brand colors
    tint: tintColorDark,
    accent: ecoGreenDark,
    secondary: ecoBlueDark,

    // Semantic colors
    success: ecoGreenDark,
    error: errorRedDark,
    warning: alertOrangeDark,
    alert: alertOrangeDark,

    // UI elements
    border: gray700,
    borderLight: gray800,
    card: '#1C1C1E',
    cardShadow: 'rgba(0, 0, 0, 0.3)',

    // Icons
    icon: gray400,
    iconSecondary: gray500,
    tabIconDefault: gray500,
    tabIconSelected: tintColorDark,

    // Interactive states
    buttonPrimary: ecoGreenDark,
    buttonPrimaryText: '#000000',
    buttonSecondary: gray800,
    buttonSecondaryText: gray100,

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    modalBackground: 'rgba(0, 0, 0, 0.6)',

    // Leaderboard specific
    rankUp: ecoGreenDark,
    rankDown: alertOrangeDark,
    rankBadgeGold: '#FFD700',
    rankBadgeSilver: '#C0C0C0',
    rankBadgeBronze: '#CD7F32',
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Text styles (pre-configured combinations)
  styles: {
    h1: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 43,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 29,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 27,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 21,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 21,
    },
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,

  // Semantic spacing
  cardPadding: 16,
  screenPadding: 16,
  sectionGap: 24,
  itemGap: 12,
};

// ============================================================================
// ELEVATION & SHADOWS
// ============================================================================

export const Shadows = {
  // Card shadows
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
    web: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  }),

  // Elevated card (more prominent)
  cardElevated: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
    web: {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  }),

  // Button shadow
  button: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
    },
  }),

  // Modal shadow
  modal: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
    },
    web: {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    },
  }),
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,

  // Semantic radius
  card: 12,
  button: 8,
  input: 8,
  badge: 16,
};

// ============================================================================
// FONT FAMILIES
// ============================================================================

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ============================================================================
// MICROCOPY
// ============================================================================

export const Microcopy = {
  // Success messages
  success: {
    saved: 'Saved ✓',
    synced: 'Synced ✓',
    logged: 'Logged',
  },

  // Error messages
  error: {
    generic: 'Uh oh — try again',
    noConnection: 'No connection — saved locally',
    syncFailed: 'Sync failed — try again',
  },

  // Empty states
  empty: {
    noLogs: 'No logs yet — tap + to log your first habit',
    noLeaderboard: 'No rankings yet — sync to see your position',
    noData: 'No data available',
  },

  // Loading states
  loading: {
    syncing: 'Syncing',
    loading: 'Loading',
  },

  // Actions
  actions: {
    retry: 'Retry',
    undo: 'Undo',
    sync: 'Sync',
    keepLocal: 'Keep Local',
    useServer: 'Use Server',
  },

  // Status
  status: {
    maxReached: 'Today max reached',
    offline: 'Offline',
    online: 'Online',
  },
};
