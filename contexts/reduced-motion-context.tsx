import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// AsyncStorage key for reduced motion setting
const REDUCED_MOTION_KEY = "econest_reduced_motion";

interface ReducedMotionContextType {
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}

const ReducedMotionContext = createContext<
  ReducedMotionContextType | undefined
>(undefined);

interface ReducedMotionProviderProps {
  children: ReactNode;
}

export function ReducedMotionProvider({
  children,
}: ReducedMotionProviderProps) {
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load setting on mount
  useEffect(() => {
    loadReducedMotionSetting();
  }, []);

  const loadReducedMotionSetting = async () => {
    try {
      const value = await AsyncStorage.getItem(REDUCED_MOTION_KEY);
      setReducedMotionState(value === "true");
    } catch (error) {
      console.error("Failed to load reduced motion setting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setReducedMotion = async (enabled: boolean) => {
    try {
      setReducedMotionState(enabled);
      await AsyncStorage.setItem(REDUCED_MOTION_KEY, enabled.toString());
    } catch (error) {
      console.error("Failed to save reduced motion setting:", error);
      // Revert on error
      setReducedMotionState(!enabled);
      throw error;
    }
  };

  return (
    <ReducedMotionContext.Provider
      value={{ reducedMotion, setReducedMotion, isLoading }}
    >
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion() {
  const context = useContext(ReducedMotionContext);
  if (context === undefined) {
    throw new Error(
      "useReducedMotion must be used within a ReducedMotionProvider"
    );
  }
  return context;
}
