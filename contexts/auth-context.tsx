import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { initializeDatabase } from "@/services/database";
import { ConvexReactClient, useMutation } from "convex/react";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Convex client instance
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL!;
export const convex = new ConvexReactClient(convexUrl);

// Auth user type
export interface AuthUser {
  userId: Id<"users">;
  email: string;
  displayName: string;
  ecoPoints: number;
  isAnonymous: boolean;
}

// Auth context type
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updatePrivacy: (isAnonymous: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure storage keys
const USER_ID_KEY = "econest_user_id";
const USER_EMAIL_KEY = "econest_user_email";
const USER_DISPLAY_NAME_KEY = "econest_user_display_name";
const SESSION_EXPIRY_KEY = "econest_session_expiry";

// Session duration: 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convex mutations
  const signInMutation = useMutation(api.auth.signIn);
  const signUpMutation = useMutation(api.auth.signUp);
  const updatePrivacyMutation = useMutation(api.auth.updatePrivacy);

  // Initialize database and restore session on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database
        await initializeDatabase();

        // Try to restore session
        await restoreSession();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Restore session from secure storage
  const restoreSession = async () => {
    try {
      const userId = await SecureStore.getItemAsync(USER_ID_KEY);
      const email = await SecureStore.getItemAsync(USER_EMAIL_KEY);
      const displayName = await SecureStore.getItemAsync(USER_DISPLAY_NAME_KEY);
      const expiryStr = await SecureStore.getItemAsync(SESSION_EXPIRY_KEY);

      if (!userId || !email || !displayName || !expiryStr) {
        return;
      }

      const expiry = parseInt(expiryStr, 10);
      const now = Date.now();

      // Check if session expired
      if (now > expiry) {
        await clearSession();
        return;
      }

      // Fetch current user data from Convex
      // Note: We'll use the query hook in a separate component
      // For now, set basic user data
      setUser({
        userId: userId as Id<"users">,
        email,
        displayName,
        ecoPoints: 0,
        isAnonymous: false,
      });
    } catch (error) {
      console.error("Failed to restore session:", error);
      await clearSession();
    }
  };

  // Save session to secure storage
  const saveSession = async (authUser: AuthUser) => {
    try {
      const expiry = Date.now() + SESSION_DURATION;

      await SecureStore.setItemAsync(USER_ID_KEY, authUser.userId);
      await SecureStore.setItemAsync(USER_EMAIL_KEY, authUser.email);
      await SecureStore.setItemAsync(
        USER_DISPLAY_NAME_KEY,
        authUser.displayName
      );
      await SecureStore.setItemAsync(SESSION_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error("Failed to save session:", error);
      throw error;
    }
  };

  // Clear session from secure storage
  const clearSession = async () => {
    try {
      await SecureStore.deleteItemAsync(USER_ID_KEY);
      await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
      await SecureStore.deleteItemAsync(USER_DISPLAY_NAME_KEY);
      await SecureStore.deleteItemAsync(SESSION_EXPIRY_KEY);
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const result = await signInMutation({ email, password });

      const authUser: AuthUser = {
        userId: result.userId,
        email: result.email,
        displayName: result.displayName,
        ecoPoints: result.ecoPoints,
        isAnonymous: result.isAnonymous,
      };

      await saveSession(authUser);
      setUser(authUser);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      setIsLoading(true);

      const result = await signUpMutation({ email, password, displayName });

      const authUser: AuthUser = {
        userId: result.userId,
        email: result.email,
        displayName: result.displayName,
        ecoPoints: result.ecoPoints,
        isAnonymous: false,
      };

      await saveSession(authUser);
      setUser(authUser);
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);

      // Clear session
      await clearSession();

      // Clear user state
      setUser(null);

      // Note: Database cleanup will be handled by demo mode context
      // when switching between demo and authenticated modes
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update privacy settings
  const updatePrivacy = async (isAnonymous: boolean) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      await updatePrivacyMutation({
        userId: user.userId,
        isAnonymous,
      });

      // Update local user state
      setUser({
        ...user,
        isAnonymous,
      });
    } catch (error) {
      console.error("Failed to update privacy:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signIn,
    signUp,
    signOut,
    updatePrivacy,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
