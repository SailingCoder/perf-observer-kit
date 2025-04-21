import { MetricData } from '../../types';
import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
import { logger } from '../../utils/logger';

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
  
  private getActivationStart(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const activationStart:any = navigationEntry?.activationStart;
    return activationStart ? activationStart : 0;
  }
  /**
   * 启动LCP监控
   */
  private startLCPMonitoring(): void {
    try {
      this.lcpObserver = new PerformanceObserver((entryList) => {
        // 只在页面可见状态下处理LCP事件
        console.log('lcpObserver1212', this.isPageVisible);
        if (!this.isPageVisible) {
          return; // 页面不可见时忽略LCP事件
        }
        
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          // 获取绘制时间
          const lcpValue = lastEntry.startTime;
          
          const lcp: MetricData = {
            name: 'LCP',
            value: lcpValue,
            unit: 'ms',
            timestamp: new Date().getTime(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            networkMetrics: this.getNetworkInformation(),
            context: {
              elementId: (lastEntry as any).element ? (lastEntry as any).element.id || null : null,
              elementTagName: (lastEntry as any).element ? (lastEntry as any).element.tagName || null : null,
              elementType: (lastEntry as any).element ? (lastEntry as any).element.type || null : null,
              size: (lastEntry as any).size || 0
            }
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
            logger.debug('用户已交互且收到LCP事件，停止LCP监听');
            this.lcpObserver.disconnect();
            this.lcpObserver = null;
          }
        }
      });
      
      this.lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      logger.error('LCP监控不受支持', error);
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
   * 页面可见性变化时的回调
   * @param isVisible 页面是否可见
   */
  protected onVisibilityChange(isVisible: boolean): void {
    if (!isVisible) {
      // 当页面隐藏时，停止监听LCP
      if (this.lcpObserver) {
        logger.debug('页面隐藏，暂停LCP监听');
        this.lcpObserver.disconnect();
        this.lcpObserver = null;
      }
    } else if (!this.lcpObserver && !this.userHasInteracted) {
      // 当页面重新可见且用户未交互时，重新启动LCP监控
      logger.debug('页面重新可见，恢复LCP监听');
      this.startLCPMonitoring();
    }
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
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      // 添加网络信息作为附加上下文
      context: this.getNetworkContext({
        bfcacheRestore: true,
        restoreTime: restoreTime
      })
    };
    
    // LCP rating thresholds (ms)
    if (lcp.value <= 2500) {
      lcp.rating = 'good';
    } else if (lcp.value <= 4000) {
      lcp.rating = 'needs-improvement';
    } else {
      lcp.rating = 'poor';
    }
    
    logger.info(`从bfcache恢复到现在的时间: ${timeFromRestore}ms，作为新的LCP值`);
    
    this.onUpdate(lcp);
    
    // 重新开始LCP监测以捕获后续可能的更大内容
    this.startLCPMonitoring();
  }
} 