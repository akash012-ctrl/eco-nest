import {
  cacheLeaderboardData,
  clearAllData,
  initializeDatabase,
  insertHabitLog,
  updateStreakData,
  updateUserStats,
} from "@/services/database";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

// Demo mode context type
interface DemoModeContextType {
  isDemoMode: boolean;
  isLoading: boolean;
  activateDemoMode: () => Promise<void>;
  deactivateDemoMode: () => Promise<void>;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(
  undefined
);

// Secure storage key
const DEMO_MODE_KEY = "econest_demo_mode";

// Demo user data
const DEMO_USER = {
  displayName: "Demo User",
  ecoPoints: 245,
  rank: 42,
};

// Demo habit types
const HABIT_TYPES = [
  "recycle",
  "bike",
  "meatless",
  "reusable",
  "compost",
  "water",
];

interface DemoModeProviderProps {
  children: ReactNode;
}

export function DemoModeProvider({ children }: DemoModeProviderProps) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check demo mode status on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database
        await initializeDatabase();

        // Check if demo mode is active
        const demoModeStr = await SecureStore.getItemAsync(DEMO_MODE_KEY);
        const isDemo = demoModeStr === "true";
        setIsDemoMode(isDemo);
      } catch (error) {
        console.error("Failed to initialize demo mode:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Activate demo mode with sample data
  const activateDemoMode = async () => {
    try {
      setIsLoading(true);

      // Clear existing data
      await clearAllData();

      // Populate demo habit logs
      await populateDemoHabitLogs();

      // Populate demo leaderboard
      await populateDemoLeaderboard();

      // Update user stats
      await updateUserStats({
        total_eco_points: DEMO_USER.ecoPoints,
        current_rank: DEMO_USER.rank,
        unsynced_count: 3, // Show some unsynced items
      });

      // Populate demo streaks
      await populateDemoStreaks();

      // Save demo mode state
      await SecureStore.setItemAsync(DEMO_MODE_KEY, "true");
      setIsDemoMode(true);
    } catch (error) {
      console.error("Failed to activate demo mode:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate demo mode and clear data
  const deactivateDemoMode = async () => {
    try {
      setIsLoading(true);

      // Clear all data
      await clearAllData();

      // Remove demo mode flag
      await SecureStore.deleteItemAsync(DEMO_MODE_KEY);
      setIsDemoMode(false);
    } catch (error) {
      console.error("Failed to deactivate demo mode:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: DemoModeContextType = {
    isDemoMode,
    isLoading,
    activateDemoMode,
    deactivateDemoMode,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

// Hook to use demo mode context
export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}

// ============================================================================
// Demo Data Population Utilities
// ============================================================================

/**
 * Populate demo habit logs with realistic data
 */
async function populateDemoHabitLogs() {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Create logs for the past 7 days
  for (let day = 0; day < 7; day++) {
    const dayTimestamp = now - day * oneDayMs;

    // Random number of logs per day (2-5)
    const logsPerDay = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < logsPerDay; i++) {
      const habitType =
        HABIT_TYPES[Math.floor(Math.random() * HABIT_TYPES.length)];
      const pointsAwarded = Math.floor(Math.random() * 16) + 5; // 5-20 points

      const logId = uuidv4();
      const payload = {
        habitType,
        pointsAwarded,
        loggedAt: dayTimestamp - i * 60 * 60 * 1000, // Spread throughout the day
      };

      // Most logs are synced, but keep 3 as pending for demo
      const status = day === 0 && i < 3 ? "pending" : "synced";

      await insertHabitLog(logId, "habit", payload);

      // If synced, update the status manually
      if (status === "synced") {
        // We'll need to update the database directly
        // For now, we'll just insert as pending and let the demo show unsynced items
      }
    }
  }
}

/**
 * Populate demo leaderboard with realistic rankings
 */
async function populateDemoLeaderboard() {
  const demoLeaderboard = [
    {
      user_id: "demo-1",
      display_name: "EcoWarrior",
      eco_points: 892,
      rank: 1,
      is_anonymous: 0,
    },
    {
      user_id: "demo-2",
      display_name: "GreenThumb",
      eco_points: 756,
      rank: 2,
      is_anonymous: 0,
    },
    {
      user_id: "demo-3",
      display_name: "TreeHugger",
      eco_points: 623,
      rank: 3,
      is_anonymous: 0,
    },
    {
      user_id: "demo-4",
      display_name: "EcoChamp",
      eco_points: 534,
      rank: 4,
      is_anonymous: 0,
    },
    {
      user_id: "demo-5",
      display_name: "NatureLover",
      eco_points: 478,
      rank: 5,
      is_anonymous: 0,
    },
    {
      user_id: "demo-6",
      display_name: "PlanetSaver",
      eco_points: 423,
      rank: 6,
      is_anonymous: 0,
    },
    {
      user_id: "demo-7",
      display_name: "GreenGuru",
      eco_points: 389,
      rank: 7,
      is_anonymous: 0,
    },
    {
      user_id: "demo-8",
      display_name: "EcoHero",
      eco_points: 356,
      rank: 8,
      is_anonymous: 0,
    },
    {
      user_id: "demo-9",
      display_name: "ClimateChamp",
      eco_points: 334,
      rank: 9,
      is_anonymous: 0,
    },
    {
      user_id: "demo-10",
      display_name: "SustainStar",
      eco_points: 312,
      rank: 10,
      is_anonymous: 0,
    },

    // Add users around the demo user's rank (42)
    {
      user_id: "demo-40",
      display_name: "GreenBean",
      eco_points: 252,
      rank: 40,
      is_anonymous: 0,
    },
    {
      user_id: "demo-41",
      display_name: "EcoFriend",
      eco_points: 248,
      rank: 41,
      is_anonymous: 0,
    },
    {
      user_id: "demo-user",
      display_name: DEMO_USER.displayName,
      eco_points: DEMO_USER.ecoPoints,
      rank: DEMO_USER.rank,
      is_anonymous: 0,
    },
    {
      user_id: "demo-43",
      display_name: "NatureNinja",
      eco_points: 242,
      rank: 43,
      is_anonymous: 0,
    },
    {
      user_id: "demo-44",
      display_name: "GreenMachine",
      eco_points: 238,
      rank: 44,
      is_anonymous: 0,
    },
    {
      user_id: "demo-45",
      display_name: "EcoExplorer",
      eco_points: 234,
      rank: 45,
      is_anonymous: 0,
    },

    // Add more users for scrolling
    {
      user_id: "demo-50",
      display_name: "TreeFriend",
      eco_points: 210,
      rank: 50,
      is_anonymous: 0,
    },
    {
      user_id: "demo-60",
      display_name: "GreenVibes",
      eco_points: 189,
      rank: 60,
      is_anonymous: 0,
    },
    {
      user_id: "demo-70",
      display_name: "EcoSpirit",
      eco_points: 167,
      rank: 70,
      is_anonymous: 0,
    },
    {
      user_id: "demo-80",
      display_name: "NaturePal",
      eco_points: 145,
      rank: 80,
      is_anonymous: 0,
    },
    {
      user_id: "demo-90",
      display_name: "GreenHeart",
      eco_points: 123,
      rank: 90,
      is_anonymous: 0,
    },
    {
      user_id: "demo-100",
      display_name: "EcoAdvocate",
      eco_points: 101,
      rank: 100,
      is_anonymous: 0,
    },
  ];

  await cacheLeaderboardData(demoLeaderboard);
}

/**
 * Populate demo streaks for habit types
 */
async function populateDemoStreaks() {
  const today = new Date().toISOString().split("T")[0];

  // Create streaks for some habits
  await updateStreakData("recycle", 5, today);
  await updateStreakData("bike", 3, today);
  await updateStreakData("meatless", 7, today);
  await updateStreakData("reusable", 2, today);
}

/**
 * Generate demo friends leaderboard (predefined list)
 */
export function getDemoFriendsLeaderboard() {
  return [
    {
      user_id: "friend-1",
      display_name: "Sarah Green",
      eco_points: 312,
      rank: 1,
      is_anonymous: 0,
    },
    {
      user_id: "friend-2",
      display_name: "Mike Eco",
      eco_points: 289,
      rank: 2,
      is_anonymous: 0,
    },
    {
      user_id: "demo-user",
      display_name: DEMO_USER.displayName,
      eco_points: DEMO_USER.ecoPoints,
      rank: 3,
      is_anonymous: 0,
    },
    {
      user_id: "friend-3",
      display_name: "Lisa Nature",
      eco_points: 234,
      rank: 4,
      is_anonymous: 0,
    },
    {
      user_id: "friend-4",
      display_name: "Tom Planet",
      eco_points: 198,
      rank: 5,
      is_anonymous: 0,
    },
    {
      user_id: "friend-5",
      display_name: "Emma Earth",
      eco_points: 176,
      rank: 6,
      is_anonymous: 0,
    },
    {
      user_id: "friend-6",
      display_name: "Alex Climate",
      eco_points: 154,
      rank: 7,
      is_anonymous: 0,
    },
    {
      user_id: "friend-7",
      display_name: "Jordan Sustain",
      eco_points: 132,
      rank: 8,
      is_anonymous: 0,
    },
  ];
}
