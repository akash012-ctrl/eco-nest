/**
 * Performance monitoring utilities for EcoNest
 * Helps track and optimize app performance
 */

interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
}

class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetric> = new Map();
    private enabled: boolean = __DEV__; // Only enable in development

    /**
     * Start measuring a performance metric
     */
    start(name: string): void {
        if (!this.enabled) return;

        this.metrics.set(name, {
            name,
            startTime: performance.now(),
        });
    }

    /**
     * End measuring a performance metric and log the result
     */
    end(name: string): number | null {
        if (!this.enabled) return null;

        const metric = this.metrics.get(name);
        if (!metric) {
            console.warn(`Performance metric "${name}" was not started`);
            return null;
        }

        const endTime = performance.now();
        const duration = endTime - metric.startTime;

        metric.endTime = endTime;
        metric.duration = duration;

        // Log if duration is significant (> 16ms for 60fps)
        if (duration > 16) {
            console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    /**
     * Measure an async function's execution time
     */
    async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
        if (!this.enabled) return fn();

        this.start(name);
        try {
            const result = await fn();
            this.end(name);
            return result;
        } catch (error) {
            this.end(name);
            throw error;
        }
    }

    /**
     * Measure a synchronous function's execution time
     */
    measureSync<T>(name: string, fn: () => T): T {
        if (!this.enabled) return fn();

        this.start(name);
        try {
            const result = fn();
            this.end(name);
            return result;
        } catch (error) {
            this.end(name);
            throw error;
        }
    }

    /**
     * Get all recorded metrics
     */
    getMetrics(): PerformanceMetric[] {
        return Array.from(this.metrics.values());
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.metrics.clear();
    }

    /**
     * Log a summary of all metrics
     */
    logSummary(): void {
        if (!this.enabled) return;

        const metrics = this.getMetrics().filter((m) => m.duration !== undefined);

        if (metrics.length === 0) {
            console.log('No performance metrics recorded');
            return;
        }

        console.log('\n📊 Performance Summary:');
        console.log('─'.repeat(50));

        metrics
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))
            .forEach((metric) => {
                const duration = metric.duration!.toFixed(2);
                const status = metric.duration! > 16 ? '⚠️' : '✅';
                console.log(`${status} ${metric.name}: ${duration}ms`);
            });

        console.log('─'.repeat(50));

        const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
        console.log(`Total: ${total.toFixed(2)}ms\n`);
    }

    /**
     * Enable or disable performance monitoring
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring method performance
 * Usage: @measurePerformance('methodName')
 */
export function measurePerformance(name: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            return performanceMonitor.measure(name, () =>
                originalMethod.apply(this, args)
            );
        };

        return descriptor;
    };
}

/**
 * Check if animations should run at 60fps
 */
export function shouldUse60FPS(): boolean {
    // In production, always aim for 60fps
    // In development, check if we're consistently hitting 60fps
    return true;
}

/**
 * Throttle function calls for performance
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Debounce function calls for performance
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return function (this: any, ...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
