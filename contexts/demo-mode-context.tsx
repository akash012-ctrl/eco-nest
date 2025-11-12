import { clearAllData, initializeDatabase } from "@/services/database";
import { populateAllDemoData } from "@/utils/demo-data";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Demo mode context type
interface DemoModeContextType {
  isDemoMode: boolean;
  isLoading: boolean;
  showDemoTour: boolean;
  activateDemoMode: () => Promise<void>;
  deactivateDemoMode: () => Promise<void>;
  completeDemoTour: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(
  undefined
);

// Secure storage keys
const DEMO_MODE_KEY = "econest_demo_mode";
const DEMO_TOUR_COMPLETED_KEY = "econest_demo_tour_completed";

interface DemoModeProviderProps {
  children: ReactNode;
}

export function DemoModeProvider({ children }: DemoModeProviderProps) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDemoTour, setShowDemoTour] = useState(false);

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

      // Populate all demo data using the new utilities
      await populateAllDemoData();

      // Save demo mode state
      await SecureStore.setItemAsync(DEMO_MODE_KEY, "true");
      setIsDemoMode(true);

      // Check if tour has been completed before
      const tourCompleted = await SecureStore.getItemAsync(
        DEMO_TOUR_COMPLETED_KEY
      );

      // Show tour if not completed
      if (tourCompleted !== "true") {
        setShowDemoTour(true);
      }
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
      setShowDemoTour(false);
    } catch (error) {
      console.error("Failed to deactivate demo mode:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete demo tour
  const completeDemoTour = async () => {
    setShowDemoTour(false);
    try {
      await SecureStore.setItemAsync(DEMO_TOUR_COMPLETED_KEY, "true");
    } catch (error) {
      console.error("Failed to save tour completion:", error);
    }
  };

  const value: DemoModeContextType = {
    isDemoMode,
    isLoading,
    showDemoTour,
    activateDemoMode,
    deactivateDemoMode,
    completeDemoTour,
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
