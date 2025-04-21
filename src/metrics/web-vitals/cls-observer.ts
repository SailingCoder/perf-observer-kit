import { MetricData } from '../../types';
import { ObserverOptions, LayoutShift } from './types';
import { BaseObserver } from './base-observer';
import { logger } from '../../utils/logger';

/**
 * Cumulative Layout Shift (CLS) 观察者
 * 负责测量页面布局稳定性
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
                unit: '', // CLS没有单位，是无量纲数值
                timestamp: performance.now(),
                // 添加网络信息和其他上下文
                context: this.getNetworkContext({
                  shiftCount: this.sessionEntries.length,
                  largestShift: Math.max(...this.sessionEntries.map((e) => (e as LayoutShift).value))
                })
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
      logger.error('CLS监控不受支持', error);
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
   * 页面可见性变化时的回调
   * @param isVisible 页面是否可见
   */
  protected onVisibilityChange(isVisible: boolean): void {
    if (!isVisible) {
      // 当页面隐藏时，报告当前累积的CLS值
      if (this.sessionValue > 0) {
        const cls: MetricData = {
          name: 'CLS',
          value: this.sessionValue,
          unit: '',
          timestamp: performance.now(),
          context: this.getNetworkContext({
            shiftCount: this.sessionEntries.length,
            largestShift: this.sessionEntries.length > 0 
              ? Math.max(...this.sessionEntries.map((e) => (e as LayoutShift).value)) 
              : 0,
            visibilityChange: 'hidden'
          })
        };
        
        // CLS rating thresholds
        if (cls.value <= 0.1) {
          cls.rating = 'good';
        } else if (cls.value <= 0.25) {
          cls.rating = 'needs-improvement';
        } else {
          cls.rating = 'poor';
        }
        
        logger.debug('页面隐藏，报告当前累积CLS值:', cls.value);
        this.onUpdate(cls);
      }
    } else {
      logger.debug('页面重新可见，继续累积CLS值');
    }
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
    
    logger.info('CLS值已在bfcache恢复后重置');
    
    // 重新开始CLS监测
    if (this.clsObserver) {
      this.clsObserver.disconnect();
      this.clsObserver = null;
    }
    
    this.observe();
  }
} 