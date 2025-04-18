import { ResourceMetrics } from '../types';

/**
 * Observer for resource timing metrics
 * 监控资源加载性能指标
 */
export class ResourceTimingObserver {
  private observer: PerformanceObserver | null = null;
  private resources: ResourceMetrics[] = [];
  private onUpdate: (resources: ResourceMetrics[]) => void;
  private excludedPatterns: (string | RegExp)[] = [];
  private allowedResourceTypes: string[] = ['script', 'link', 'img', 'css', 'font'];
  
  constructor(
    onUpdate: (resources: ResourceMetrics[]) => void, 
    excludedPatterns: (string | RegExp)[] = [],
    allowedResourceTypes?: string[]
  ) {
    this.onUpdate = onUpdate;
    this.excludedPatterns = excludedPatterns;
    
    // 如果提供了自定义资源类型，则使用它
    if (allowedResourceTypes && allowedResourceTypes.length > 0) {
      this.allowedResourceTypes = allowedResourceTypes;
    }
  }
  
  start(): void {
    try {
      this.observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            // 静态资源过滤
            if (!this.allowedResourceTypes.includes(resourceEntry.initiatorType)) {
              continue;
            }

            // 检查是否在排除列表中
            if (this.isExcluded(resourceEntry.name)) {
              console.log('Resource excluded from monitoring:', resourceEntry.name);
              continue;
            }

            // 避免重复条目
            const existingEntryIndex = this.resources.findIndex(
              r => r.name === resourceEntry.name && r.startTime === resourceEntry.startTime
            );
            
            if (existingEntryIndex >= 0) {
              continue;
            }
            
            console.log('resourceEntry', resourceEntry);
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
    } catch (error) {
      console.error('Resource timing monitoring not supported', error);
    }
  }
  
  /**
   * 检查资源URL是否应被排除
   * @param url 资源URL
   * @returns 如果应该排除则返回true
   */
  private isExcluded(url: string): boolean {
    if (!this.excludedPatterns.length) {
      return false;
    }
    
    return this.excludedPatterns.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(url);
      }
      return url.includes(pattern);
    });
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