import { MetricData, NavigationMetrics } from '../types';

/**
 * Observer for navigation timing metrics, including TTFB
 */
export class NavigationTimingObserver {
  private observer: PerformanceObserver | null = null;
  private metrics: NavigationMetrics = {};
  private onUpdate: (metrics: NavigationMetrics) => void;
  
  constructor(onUpdate: (metrics: NavigationMetrics) => void) {
    this.onUpdate = onUpdate;
  }
  
  start(): void {
    // First try to get the current navigation timing metrics
    this.collectInitialNavigationTiming();
    
    // Then observe future navigations
    try {
      this.observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        if (entries.length > 0) {
          // Use the most recent navigation entry
          const navigationEntry = entries[entries.length - 1] as PerformanceNavigationTiming;
          this.processNavigationEntry(navigationEntry);
        }
      });
      
      this.observer.observe({ type: 'navigation', buffered: true });
    } catch (error) {
      console.error('Navigation timing observation not supported', error);
    }
  }
  
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  getMetrics(): NavigationMetrics {
    return this.metrics;
  }
  
  private collectInitialNavigationTiming(): void {
    try {
      const navigationEntries = performance.getEntriesByType('navigation');
      
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
        this.processNavigationEntry(navigationEntry);
      }
    } catch (error) {
      console.error('Error collecting initial navigation timing', error);
    }
  }
  
  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    const now = performance.now();
    
    // Calculate TTFB (Time to First Byte)
    const ttfb: MetricData = {
      name: 'TTFB',
      value: entry.responseStart - entry.requestStart,
      unit: 'ms',
      timestamp: now,
    };
    
    // TTFB rating thresholds (ms)
    if (ttfb.value <= 100) {
      ttfb.rating = 'good';
    } else if (ttfb.value <= 200) {
      ttfb.rating = 'needs-improvement';
    } else {
      ttfb.rating = 'poor';
    }
    
    // DOM Content Loaded
    const domContentLoaded: MetricData = {
      name: 'DOMContentLoaded',
      value: entry.domContentLoadedEventEnd - entry.startTime,
      unit: 'ms',
      timestamp: now,
    };
    
    // Load Event
    const loadEvent: MetricData = {
      name: 'Load',
      value: entry.loadEventEnd - entry.startTime,
      unit: 'ms',
      timestamp: now,
    };
    
    this.metrics = {
      ttfb,
      domContentLoaded,
      loadEvent,
    };
    
    this.onUpdate(this.metrics);
  }
} 