/**
 * Utility functions to check browser support for performance APIs
 */
export const browserSupport = {
  /**
   * Check if the Performance API is supported
   */
  hasPerformanceAPI(): boolean {
    return typeof window !== 'undefined' && 
           typeof performance !== 'undefined';
  },
  
  /**
   * Check if PerformanceObserver is supported
   */
  hasPerformanceObserver(): boolean {
    return typeof window !== 'undefined' && 
           typeof PerformanceObserver !== 'undefined';
  },
  
  /**
   * Check if a specific performance entry type is supported
   */
  supportsEntryType(entryType: string): boolean {
    if (!this.hasPerformanceObserver()) {
      return false;
    }
    
    // In modern browsers, we can check supported entry types
    if (PerformanceObserver.supportedEntryTypes) {
      return PerformanceObserver.supportedEntryTypes.includes(entryType);
    }
    
    // Fallback detection for older browsers
    switch (entryType) {
      case 'navigation':
        return typeof PerformanceNavigationTiming !== 'undefined';
      case 'resource':
        return typeof PerformanceResourceTiming !== 'undefined';
      case 'largest-contentful-paint':
      case 'layout-shift':
      case 'first-input':
      case 'longtask':
        // No reliable feature detection for these in older browsers
        // Try to create an observer as a test
        try {
          const observer = new PerformanceObserver(() => {});
          observer.observe({ type: entryType, buffered: true });
          observer.disconnect();
          return true;
        } catch (e) {
          return false;
        }
      default:
        return false;
    }
  }
}; 