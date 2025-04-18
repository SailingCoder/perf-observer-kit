import { MetricData, CoreWebVitalsMetrics } from '../types';

// Define LayoutShift interface if not available
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

/**
 * Observer for Core Web Vitals metrics
 */
export class CoreWebVitalsObserver {
  private observer: PerformanceObserver | null = null;
  private fcpObserver: PerformanceObserver | null = null;
  private lcpObserver: PerformanceObserver | null = null;
  private fidObserver: PerformanceObserver | null = null;
  private clsObserver: PerformanceObserver | null = null;
  private inpObserver: PerformanceObserver | null = null;
  
  private metrics: CoreWebVitalsMetrics = {};
  private clsValueTotal = 0;
  private clsEntries: PerformanceEntry[] = [];
  
  private onUpdate: (metrics: CoreWebVitalsMetrics) => void;

  constructor(onUpdate: (metrics: CoreWebVitalsMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  start(): void {
    this.observeFCP();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeINP();
  }

  stop(): void {
    if (this.fcpObserver) {
      this.fcpObserver.disconnect();
      this.fcpObserver = null;
    }
    
    if (this.lcpObserver) {
      this.lcpObserver.disconnect();
      this.lcpObserver = null;
    }
    
    if (this.fidObserver) {
      this.fidObserver.disconnect();
      this.fidObserver = null;
    }
    
    if (this.clsObserver) {
      this.clsObserver.disconnect();
      this.clsObserver = null;
    }
    
    if (this.inpObserver) {
      this.inpObserver.disconnect();
      this.inpObserver = null;
    }
  }

  getMetrics(): CoreWebVitalsMetrics {
    return this.metrics;
  }

  private observeFCP(): void {
    try {
      this.fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            const fcp: MetricData = {
              name: 'FCP',
              value: entry.startTime,
              unit: 'ms',
              timestamp: performance.now(),
            };
            
            // FCP评级阈值
            if (fcp.value <= 1800) {
              fcp.rating = 'good';
            } else if (fcp.value <= 3000) {
              fcp.rating = 'needs-improvement';
            } else {
              fcp.rating = 'poor';
            }
            
            this.metrics.fcp = fcp;
            this.onUpdate(this.metrics);
            
            // FCP只报告一次
            if (this.fcpObserver) {
              this.fcpObserver.disconnect();
            }
            break;
          }
        }
      });
      
      this.fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (error) {
      console.error('FCP monitoring not supported', error);
    }
  }

  private observeLCP(): void {
    try {
      this.lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          const lcp: MetricData = {
            name: 'LCP',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: performance.now(),
          };
          
          // LCP rating thresholds (ms)
          if (lcp.value <= 2500) {
            lcp.rating = 'good';
          } else if (lcp.value <= 4000) {
            lcp.rating = 'needs-improvement';
          } else {
            lcp.rating = 'poor';
          }
          
          this.metrics.lcp = lcp;
          this.onUpdate(this.metrics);
        }
      });
      
      this.lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      console.error('LCP monitoring not supported', error);
    }
  }

  private observeFID(): void {
    try {
      this.fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          if (entry.name === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            const fid: MetricData = {
              name: 'FID',
              value: fidEntry.processingStart! - fidEntry.startTime,
              unit: 'ms',
              timestamp: performance.now(),
            };
            
            // FID rating thresholds (ms)
            if (fid.value <= 100) {
              fid.rating = 'good';
            } else if (fid.value <= 300) {
              fid.rating = 'needs-improvement';
            } else {
              fid.rating = 'poor';
            }
            
            this.metrics.fid = fid;
            this.onUpdate(this.metrics);
            
            // FID is only reported once
            if (this.fidObserver) {
              this.fidObserver.disconnect();
            }
            break;
          }
        }
      });
      
      this.fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.error('FID monitoring not supported', error);
    }
  }

  private observeCLS(): void {
    try {
      let sessionValue = 0;
      let sessionEntries: PerformanceEntry[] = [];
      let prevSessionValue = 0;
      
      this.clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          // Only count layout shifts without recent user input
          const layoutShift = entry as LayoutShift;
          if (!layoutShift.hadRecentInput) {
            sessionValue += layoutShift.value;
            sessionEntries.push(layoutShift);
            
            // Report CLS if it has changed significantly
            if (sessionValue > prevSessionValue) {
              const cls: MetricData = {
                name: 'CLS',
                value: sessionValue,
                timestamp: performance.now(),
              };
              
              // CLS rating thresholds
              if (cls.value <= 0.1) {
                cls.rating = 'good';
              } else if (cls.value <= 0.25) {
                cls.rating = 'needs-improvement';
              } else {
                cls.rating = 'poor';
              }
              
              this.metrics.cls = cls;
              this.onUpdate(this.metrics);
              
              prevSessionValue = sessionValue;
            }
          }
        }
      });
      
      this.clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.error('CLS monitoring not supported', error);
    }
  }

  private observeINP(): void {
    try {
      this.inpObserver = new PerformanceObserver((entryList) => {
        const events = entryList.getEntries();
        
        // Find the longest duration event or interaction
        if (events.length > 0) {
          let longestDuration = 0;
          let longestEvent = null;
          
          for (const event of events) {
            const duration = (event as PerformanceEventTiming).duration;
            if (duration > longestDuration) {
              longestDuration = duration;
              longestEvent = event;
            }
          }
          
          if (longestEvent) {
            const inp: MetricData = {
              name: 'INP',
              value: longestDuration,
              unit: 'ms',
              timestamp: performance.now(),
            };
            
            // INP rating thresholds (ms)
            if (inp.value <= 200) {
              inp.rating = 'good';
            } else if (inp.value <= 500) {
              inp.rating = 'needs-improvement';
            } else {
              inp.rating = 'poor';
            }
            
            this.metrics.inp = inp;
            this.onUpdate(this.metrics);
          }
        }
      });
      
      // Use a type assertion to handle the non-standard property
      this.inpObserver.observe({ 
        type: 'event', 
        buffered: true,
        // @ts-ignore - durationThreshold is available in newer browsers
        durationThreshold: 16  // Only measure events that take at least 16ms
      });
    } catch (error) {
      console.error('INP monitoring not supported', error);
    }
  }
} 