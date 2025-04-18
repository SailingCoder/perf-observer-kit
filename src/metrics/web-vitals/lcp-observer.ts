import { MetricData } from '../../types';
import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';

/**
 * Largest Contentful Paint (LCP) 观察者
 * 负责测量页面最大内容绘制时间
 */
export class LCPObserver extends BaseObserver {
  private lcpObserver: PerformanceObserver | null = null;
  
  constructor(options: ObserverOptions) {
    super(options);
  }
  
  /**
   * 实现观察LCP的方法
   */
  protected observe(): void {
    this.startLCPMonitoring();
  }
  
  /**
   * 启动LCP监控
   */
  private startLCPMonitoring(): void {
    try {
      this.lcpObserver = new PerformanceObserver((entryList) => {
        // 只在页面可见状态下处理LCP事件
        if (!this.isPageVisible) {
          return; // 页面不可见时忽略LCP事件
        }
        
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
          
          this.onUpdate(lcp);
          
          // 如果用户已交互，那么在这个LCP事件后停止监听
          if (this.userHasInteracted && this.lcpObserver) {
            console.log('用户已交互且收到LCP事件，停止LCP监听');
            this.lcpObserver.disconnect();
            this.lcpObserver = null;
          }
        }
      });
      
      this.lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      console.error('LCP monitoring not supported', error);
    }
  }
  
  /**
   * 停止LCP观察
   */
  public stop(): void {
    if (this.lcpObserver) {
      this.lcpObserver.disconnect();
      this.lcpObserver = null;
    }
    
    super.stop();
  }
  
  /**
   * BFCache恢复处理
   * 在bfcache恢复后重新计算从恢复到当前的时间差作为新的LCP
   */
  protected onBFCacheRestore(event: PageTransitionEvent): void {
    // 断开现有的LCP观察器
    if (this.lcpObserver) {
      this.lcpObserver.disconnect();
      this.lcpObserver = null;
    }
    
    // 计算从bfcache恢复到当前时间的时间差作为新的LCP值
    const restoreTime = event.timeStamp;
    const currentTime = performance.now();
    const timeFromRestore = currentTime - restoreTime;
    
    // 创建一个新的LCP指标，使用恢复时间差作为值
    const lcp: MetricData = {
      name: 'LCP',
      value: timeFromRestore,
      unit: 'ms',
      timestamp: currentTime,
    };
    
    // LCP rating thresholds (ms)
    if (lcp.value <= 2500) {
      lcp.rating = 'good';
    } else if (lcp.value <= 4000) {
      lcp.rating = 'needs-improvement';
    } else {
      lcp.rating = 'poor';
    }
    
    console.log(`从bfcache恢复到现在的时间: ${timeFromRestore}ms，作为新的LCP值`);
    
    this.onUpdate(lcp);
    
    // 重新开始LCP监测以捕获后续可能的更大内容
    this.startLCPMonitoring();
  }
} 