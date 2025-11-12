import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

// AsyncStorage key for haptic feedback setting
const HAPTIC_FEEDBACK_KEY = "econest_haptic_feedback";

/**
 * Safely trigger haptic feedback with graceful fallback
 * Checks if haptics are enabled in settings and if device supports haptics
 */
export async function triggerHaptic(
    style:
        | Haptics.ImpactFeedbackStyle
        | Haptics.NotificationFeedbackType = Haptics.ImpactFeedbackStyle.Light
): Promise<void> {
    try {
        // Check if haptic feedback is enabled in settings
        const hapticEnabled = await getHapticFeedbackSetting();
        if (!hapticEnabled) {
            return;
        }

        // Attempt to trigger haptic feedback
        if (
            style === Haptics.NotificationFeedbackType.Success ||
            style === Haptics.NotificationFeedbackType.Warning ||
            style === Haptics.NotificationFeedbackType.Error
        ) {
            await Haptics.notificationAsync(
                style as Haptics.NotificationFeedbackType
            );
        } else {
            await Haptics.impactAsync(style as Haptics.ImpactFeedbackStyle);
        }
    } catch (error) {
        // Gracefully fail if haptics are not supported
        // No need to log or alert - this is expected on some devices
    }
}

/**
 * Get the haptic feedback setting from AsyncStorage
 * @returns Promise<boolean> - true if haptic feedback is enabled (default)
 */
async function getHapticFeedbackSetting(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(HAPTIC_FEEDBACK_KEY);
        return value !== "false"; // Default to true
    } catch (error) {
        console.error("Failed to get haptic feedback setting:", error);
        return true; // Default to enabled on error
    }
}

/**
 * Check if the device supports haptic feedback
 * This is a best-effort check and may not be 100% accurate
 */
export async function isHapticSupported(): Promise<boolean> {
    try {
        // Try to trigger a very light haptic to test support
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return true;
    } catch (error) {
        return false;
    }
}
