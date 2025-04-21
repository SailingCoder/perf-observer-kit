import { LongTaskMetrics } from '../types';
import { LongTasksObserverOptions } from './web-vitals/types';

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
 * 长任务监控观察者
 * 负责监控并收集页面中的长任务（Long Tasks）信息
 */
export class LongTasksObserver {
  private observer: PerformanceObserver | null = null;
  private longTasks: LongTaskMetrics[] = [];
  private onUpdate: (longTasks: LongTaskMetrics[]) => void;
  private options: LongTasksObserverOptions;
  
  /**
   * 创建长任务观察者实例
   * @param options 长任务观察者配置
   */
  constructor(options: LongTasksObserverOptions) {
    this.onUpdate = options.onUpdate;
    this.options = {
      enabled: options.enabled !== undefined ? options.enabled : true,
      threshold: options.threshold || 50, // 默认50毫秒
      maxEntries: options.maxEntries || 100,
      ...options
    };
  }
  
  /**
   * 开始监控长任务
   */
  start(): void {
    try {
      this.observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          // 检查任务持续时间是否超过阈值
          if (entry.duration < (this.options.threshold || 50)) {
            continue;
          }
          
          const attribution = this.getAttribution(entry);
          
          const longTask: LongTaskMetrics = {
            duration: entry.duration,
            startTime: entry.startTime,
            attribution
          };
          
          this.longTasks.push(longTask);
          
          // 如果超过最大条目数，移除最旧的
          const maxEntries = this.options.maxEntries || 100;
          if (this.longTasks.length > maxEntries) {
            this.longTasks.shift();
          }
        }
        
        this.onUpdate(this.longTasks);
      });
      
      this.observer.observe({ type: 'longtask', buffered: true });
    } catch (error) {
      console.error('Long tasks monitoring not supported', error);
    }
  }
  
  /**
   * 停止监控长任务
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  /**
   * 获取收集到的长任务数据
   */
  getLongTasks(): LongTaskMetrics[] {
    return this.longTasks;
  }
  
  /**
   * 清除收集到的长任务数据
   */
  clearLongTasks(): void {
    this.longTasks = [];
  }
  
  /**
   * 获取长任务的归属信息
   */
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