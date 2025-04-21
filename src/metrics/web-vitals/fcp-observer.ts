import { MetricData } from '../../types';
import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
import { logger } from '../../utils/logger';

/**
 * First Contentful Paint (FCP) 观察者
 * 负责测量页面首次内容绘制时间
 */
export class FCPObserver extends BaseObserver {
  private fcpObserver: PerformanceObserver | null = null;
  
  constructor(options: ObserverOptions) {
    super(options);
  }
  
  /**
   * 实现观察FCP的方法
   */
  protected observe(): void {
    try {
      this.fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            
            const fcp: MetricData = {
              name: 'FCP',
              value: entry.startTime,
              unit: 'ms',
              timestamp: new Date().getTime(),
              url: typeof window !== 'undefined' ? window.location.href : undefined,
              networkMetrics: this.getNetworkInformation()
            };
            
            // FCP评级阈值
            if (fcp.value <= 1800) {
              fcp.rating = 'good';
            } else if (fcp.value <= 3000) {
              fcp.rating = 'needs-improvement';
            } else {
              fcp.rating = 'poor';
            }
            
            this.onUpdate(fcp);
            
            // FCP只报告一次
            if (this.fcpObserver) {
              this.fcpObserver.disconnect();
              this.fcpObserver = null;
            }
            break;
          }
        }
      });
      
      this.fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (error) {
      logger.error('FCP监控不受支持', error);
    }
  }
  
  /**
   * 停止FCP观察
   */
  public stop(): void {
    if (this.fcpObserver) {
      this.fcpObserver.disconnect();
      this.fcpObserver = null;
    }
    
    super.stop();
  }
  
  /**
   * 页面可见性变化时的回调
   * @param isVisible 页面是否可见
   */
  protected onVisibilityChange(isVisible: boolean): void {
    // FCP通常是页面加载时的一次性事件，不需要在可见性变化时特殊处理
    // 但仍然可以记录日志以便调试
    if (!isVisible) {
      logger.debug('页面隐藏，FCP已经收集或仍在等待首次内容绘制');
    } else {
      logger.debug('页面重新可见，FCP状态不变');
    }
  }
  
  /**
   * BFCache恢复处理
   * FCP通常不需要在bfcache恢复时重新计算
   */
  protected onBFCacheRestore(event: PageTransitionEvent): void {
    // FCP不需要特殊处理bfcache恢复
  }
} 