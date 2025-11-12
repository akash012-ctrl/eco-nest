/**
 * Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */

// ============================================================================
// Error Types
// ============================================================================

export enum ErrorType {
    NETWORK = 'NETWORK',
    VALIDATION = 'VALIDATION',
    DATABASE = 'DATABASE',
    SYNC = 'SYNC',
    AUTH = 'AUTH',
    UNKNOWN = 'UNKNOWN',
}

export interface AppError {
    type: ErrorType;
    message: string;
    originalError?: Error;
    retryable: boolean;
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Classify an error and return structured error information
 */
export function classifyError(error: unknown): AppError {
    // Handle string errors
    if (typeof error === 'string') {
        return {
            type: ErrorType.UNKNOWN,
            message: error,
            retryable: false,
        };
    }

    // Handle Error objects
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Network errors
        if (
            message.includes('network') ||
            message.includes('connection') ||
            message.includes('offline') ||
            message.includes('no connection')
        ) {
            return {
                type: ErrorType.NETWORK,
                message: getUserFriendlyMessage(ErrorType.NETWORK, error.message),
                originalError: error,
                retryable: true,
            };
        }

        // Validation errors
        if (
            message.includes('validation') ||
            message.includes('invalid') ||
            message.includes('required') ||
            message.includes('max reached') ||
            message.includes('debounce')
        ) {
            return {
                type: ErrorType.VALIDATION,
                message: getUserFriendlyMessage(ErrorType.VALIDATION, error.message),
                originalError: error,
                retryable: false,
            };
        }

        // Database errors
        if (
            message.includes('database') ||
            message.includes('sqlite') ||
            message.includes('query')
        ) {
            return {
                type: ErrorType.DATABASE,
                message: getUserFriendlyMessage(ErrorType.DATABASE, error.message),
                originalError: error,
                retryable: true,
            };
        }

        // Sync errors
        if (
            message.includes('sync') ||
            message.includes('conflict') ||
            message.includes('cooldown')
        ) {
            return {
                type: ErrorType.SYNC,
                message: getUserFriendlyMessage(ErrorType.SYNC, error.message),
                originalError: error,
                retryable: true,
            };
        }

        // Auth errors
        if (
            message.includes('auth') ||
            message.includes('unauthorized') ||
            message.includes('token')
        ) {
            return {
                type: ErrorType.AUTH,
                message: getUserFriendlyMessage(ErrorType.AUTH, error.message),
                originalError: error,
                retryable: false,
            };
        }

        // Unknown error
        return {
            type: ErrorType.UNKNOWN,
            message: getUserFriendlyMessage(ErrorType.UNKNOWN, error.message),
            originalError: error,
            retryable: false,
        };
    }

    // Fallback for unknown error types
    return {
        type: ErrorType.UNKNOWN,
        message: 'Uh oh — try again',
        retryable: false,
    };
}

// ============================================================================
// User-Friendly Messages
// ============================================================================

/**
 * Convert technical error messages to user-friendly messages
 */
function getUserFriendlyMessage(type: ErrorType, originalMessage: string): string {
    // Check for specific known messages first
    const lowerMessage = originalMessage.toLowerCase();

    // Specific message mappings
    if (lowerMessage.includes('no connection') || lowerMessage.includes('saved locally')) {
        return 'No connection — saved locally';
    }

    if (lowerMessage.includes('today max reached')) {
        return 'Today max reached';
    }

    if (lowerMessage.includes('please wait') && lowerMessage.includes('seconds')) {
        return originalMessage; // Keep the specific cooldown message
    }

    if (lowerMessage.includes('debounce') || lowerMessage.includes('wait before logging')) {
        return 'Please wait before logging this habit again';
    }

    if (lowerMessage.includes('log not found')) {
        return 'Unable to undo — log not found';
    }

    if (lowerMessage.includes('conflict')) {
        return 'Data conflict detected — please review';
    }

    // Generic messages by type
    switch (type) {
        case ErrorType.NETWORK:
            return 'No connection — saved locally';

        case ErrorType.VALIDATION:
            return originalMessage; // Validation messages are usually user-friendly

        case ErrorType.DATABASE:
            return 'Uh oh — try again';

        case ErrorType.SYNC:
            return 'Sync failed — try again';

        case ErrorType.AUTH:
            return 'Authentication failed — please sign in again';

        case ErrorType.UNKNOWN:
        default:
            return 'Uh oh — try again';
    }
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log error for debugging
 * In production, this would send to a logging service
 */
export function logError(error: AppError, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';

    console.error(`[${timestamp}]${contextStr} Error:`, {
        type: error.type,
        message: error.message,
        retryable: error.retryable,
        originalError: error.originalError,
    });

    // TODO: In production, send to logging service
    // Example: sendToLoggingService({ timestamp, context, error });
}

// ============================================================================
// Error Handler Wrapper
// ============================================================================

/**
 * Wrap an async function with error handling
 * Returns a tuple of [result, error]
 */
export async function handleAsync<T>(
    fn: () => Promise<T>,
    context?: string
): Promise<[T | null, AppError | null]> {
    try {
        const result = await fn();
        return [result, null];
    } catch (error) {
        const appError = classifyError(error);
        logError(appError, context);
        return [null, appError];
    }
}

/**
 * Wrap a sync function with error handling
 * Returns a tuple of [result, error]
 */
export function handleSync<T>(
    fn: () => T,
    context?: string
): [T | null, AppError | null] {
    try {
        const result = fn();
        return [result, null];
    } catch (error) {
        const appError = classifyError(error);
        logError(appError, context);
        return [null, appError];
    }
}
