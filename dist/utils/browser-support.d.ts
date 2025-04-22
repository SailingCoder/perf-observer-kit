/**
 * Utility functions to check browser support for performance APIs
 */
export declare const browserSupport: {
    /**
     * Check if the Performance API is supported
     */
    hasPerformanceAPI(): boolean;
    /**
     * Check if PerformanceObserver is supported
     */
    hasPerformanceObserver(): boolean;
    /**
     * Check if a specific performance entry type is supported
     */
    supportsEntryType(entryType: string): boolean;
};
