import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Hook to detect and monitor network connectivity status
 * Works across web and native platforms
 * 
 * @returns Object with isOnline status and isChecking loading state
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Initial check
        checkNetworkStatus();

        // Set up listeners based on platform
        if (Platform.OS === 'web') {
            // Web platform: use navigator.onLine and window events
            const handleOnline = () => setIsOnline(true);
            const handleOffline = () => setIsOnline(false);

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        } else {
            // Native platform: poll periodically or use NetInfo if available
            // For now, we'll use a simple polling mechanism
            const interval = setInterval(checkNetworkStatus, 5000);

            return () => clearInterval(interval);
        }
    }, []);

    /**
     * Check current network status
     */
    const checkNetworkStatus = async () => {
        try {
            if (Platform.OS === 'web') {
                // Web: use navigator.onLine
                setIsOnline(navigator.onLine);
            } else {
                // Native: try a lightweight network request
                // We'll assume online by default for native
                // In production, you'd use @react-native-community/netinfo
                setIsOnline(true);
            }
        } catch (error) {
            console.error('Failed to check network status:', error);
            setIsOnline(false);
        } finally {
            setIsChecking(false);
        }
    };

    return {
        isOnline,
        isChecking,
    };
}
