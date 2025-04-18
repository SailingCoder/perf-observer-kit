import { MetricData } from '../../types';
import { ObserverOptions, LayoutShift } from './types';
import { BaseObserver } from './base-observer';

/**
 * Cumulative Layout Shift (CLS) 观察者
 * 负责测量页面累积布局偏移量
 */
export class CLSObserver extends BaseObserver {
  private clsObserver: PerformanceObserver | null = null;
  private sessionValue: number = 0;
  private sessionEntries: PerformanceEntry[] = [];
  private prevSessionValue: number = 0;
  
  constructor(options: ObserverOptions) {
    super(options);
  }
  
  /**
   * 实现观察CLS的方法
   */
  protected observe(): void {
    try {
      this.clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          // Only count layout shifts without recent user input
          const layoutShift = entry as LayoutShift;
          if (!layoutShift.hadRecentInput) {
            this.sessionValue += layoutShift.value;
            this.sessionEntries.push(layoutShift);
            
            // Report CLS if it has changed significantly
            if (this.sessionValue > this.prevSessionValue) {
              const cls: MetricData = {
                name: 'CLS',
                value: this.sessionValue,
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
              
              this.onUpdate(cls);
              
              this.prevSessionValue = this.sessionValue;
            }
          }
        }
      });
      
      this.clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.error('CLS monitoring not supported', error);
    }
  }
  
  /**
   * 停止CLS观察
   */
  public stop(): void {
    if (this.clsObserver) {
      this.clsObserver.disconnect();
      this.clsObserver = null;
    }
    
    super.stop();
  }
  
  /**
   * BFCache恢复处理
   * CLS应该重置累积值
   */
  protected onBFCacheRestore(event: PageTransitionEvent): void {
    // 重置CLS会话值
    this.sessionValue = 0;
    this.sessionEntries = [];
    this.prevSessionValue = 0;
    
    console.log('CLS值已在bfcache恢复后重置');
    
    // 重新开始CLS监测
    if (this.clsObserver) {
      this.clsObserver.disconnect();
      this.clsObserver = null;
    }
    
    this.observe();
  }
} 