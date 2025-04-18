import { ResourceMetrics } from '../types';

/**
 * Observer for resource timing metrics
 */
export class ResourceTimingObserver {
  private observer: PerformanceObserver | null = null;
  private resources: ResourceMetrics[] = [];
  private onUpdate: (resources: ResourceMetrics[]) => void;
  
  constructor(onUpdate: (resources: ResourceMetrics[]) => void) {
    this.onUpdate = onUpdate;
  }
  
  start(): void {
    try {
      this.observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Avoid duplicate entries
            const existingEntryIndex = this.resources.findIndex(
              r => r.name === resourceEntry.name && r.startTime === resourceEntry.startTime
            );
            
            if (existingEntryIndex >= 0) {
              continue;
            }
            
            const resource: ResourceMetrics = {
              name: resourceEntry.name,
              initiatorType: resourceEntry.initiatorType,
              startTime: resourceEntry.startTime,
              duration: resourceEntry.duration,
              transferSize: resourceEntry.transferSize,
              decodedBodySize: resourceEntry.decodedBodySize,
              responseEnd: resourceEntry.responseEnd
            };
            
            this.resources.push(resource);
          }
        }
        
        this.onUpdate(this.resources);
      });
      
      this.observer.observe({ type: 'resource', buffered: true });
      
      // Also get already loaded resources
      const existingEntries = performance.getEntriesByType('resource');
      if (existingEntries.length > 0) {
        for (const entry of existingEntries) {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          const resource: ResourceMetrics = {
            name: resourceEntry.name,
            initiatorType: resourceEntry.initiatorType,
            startTime: resourceEntry.startTime,
            duration: resourceEntry.duration,
            transferSize: resourceEntry.transferSize,
            decodedBodySize: resourceEntry.decodedBodySize,
            responseEnd: resourceEntry.responseEnd
          };
          
          this.resources.push(resource);
        }
        
        this.onUpdate(this.resources);
      }
    } catch (error) {
      console.error('Resource timing monitoring not supported', error);
    }
  }
  
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  getResources(): ResourceMetrics[] {
    return this.resources;
  }
  
  clearResources(): void {
    this.resources = [];
    performance.clearResourceTimings();
  }
} 