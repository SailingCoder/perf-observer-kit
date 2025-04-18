import { LongTaskMetrics } from '../types';

// Define TaskAttributionTiming interface if not available
interface TaskAttributionTiming {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  containerType?: string;
  containerName?: string;
  containerId?: string;
  containerSrc?: string;
}

/**
 * Observer for long tasks metrics
 */
export class LongTasksObserver {
  private observer: PerformanceObserver | null = null;
  private longTasks: LongTaskMetrics[] = [];
  private onUpdate: (longTasks: LongTaskMetrics[]) => void;
  
  constructor(onUpdate: (longTasks: LongTaskMetrics[]) => void) {
    this.onUpdate = onUpdate;
  }
  
  start(): void {
    try {
      this.observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          const attribution = this.getAttribution(entry);
          
          const longTask: LongTaskMetrics = {
            duration: entry.duration,
            startTime: entry.startTime,
            attribution
          };
          
          this.longTasks.push(longTask);
        }
        
        this.onUpdate(this.longTasks);
      });
      
      this.observer.observe({ type: 'longtask', buffered: true });
    } catch (error) {
      console.error('Long tasks monitoring not supported', error);
    }
  }
  
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  getLongTasks(): LongTaskMetrics[] {
    return this.longTasks;
  }
  
  clearLongTasks(): void {
    this.longTasks = [];
  }
  
  private getAttribution(entry: PerformanceEntry): string | undefined {
    // Try to get attribution from the entry if available
    if ('attribution' in entry) {
      const attribution = (entry as any).attribution;
      if (Array.isArray(attribution) && attribution.length > 0) {
        const attributionEntry = attribution[0] as TaskAttributionTiming;
        
        if (attributionEntry.containerName) {
          return attributionEntry.containerName;
        } else if (attributionEntry.containerSrc) {
          return attributionEntry.containerSrc;
        } else if (attributionEntry.containerId) {
          return attributionEntry.containerId;
        } else if (attributionEntry.containerType) {
          return attributionEntry.containerType;
        }
      }
    }
    
    return 'unknown';
  }
} 