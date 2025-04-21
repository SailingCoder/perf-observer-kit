import { MetricData } from '../../types';
import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
import { logger } from '../../utils/logger';

/**
 * First Contentful Paint (FCP) 观察者
 * 负责测量页面首次内容绘制时间
 * 重新实现基于Google Web Vitals库 (https://github.com/GoogleChrome/web-vitals)
 */
export class FCPObserver extends BaseObserver {
  private fcpObserver: PerformanceObserver | null = null;
  
  // FCP评分阈值（毫秒）
  private static readonly FCP_GOOD_THRESHOLD = 1800;
  private static readonly FCP_NEEDS_IMPROVEMENT_THRESHOLD = 3000;
  
  // 记录页面首次隐藏的时间
  private firstHiddenTime: number;
  
  // 记录指标是否已上报
  private metricReported: boolean = false;
  
  constructor(options: ObserverOptions) {
    super(options);
    
    // 初始化首次隐藏时间
    this.firstHiddenTime = this.initFirstHiddenTime();
    
    // 监听visibility变化以更新首次隐藏时间
    this.setupFirstHiddenTimeListener();
  }
  
  /**
   * 获取页面首次隐藏的时间
   */
  private initFirstHiddenTime(): number {
    // 如果页面已经是隐藏状态，返回0
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return 0;
    }
    // 否则返回无限大，表示页面尚未隐藏
    return Infinity;
  }
  
  /**
   * 设置监听页面首次隐藏的事件
   */
  private setupFirstHiddenTimeListener(): void {
    if (typeof document === 'undefined') return;
    
    const updateHiddenTime = () => {
      if (document.visibilityState === 'hidden' && this.firstHiddenTime === Infinity) {
        this.firstHiddenTime = performance.now();
        logger.debug(`记录页面首次隐藏时间: ${this.firstHiddenTime}ms`);
      }
    };
    
    // 监听页面visibility变化
    document.addEventListener('visibilitychange', updateHiddenTime, { once: true });
    
    // 页面卸载时也视为隐藏
    document.addEventListener('unload', updateHiddenTime, { once: true });
  }
  
  /**
   * 获取激活开始时间
   */
  private getActivationStart(): number {
    if (typeof performance === 'undefined') return 0;
    
    const entries = performance.getEntriesByType('navigation');
    if (!entries || entries.length === 0) return 0;
    
    const navigationEntry = entries[0] as PerformanceNavigationTiming;
    // activationStart是非标准属性，在某些浏览器中可用
    const activationStart = (navigationEntry as any)?.activationStart;
    return activationStart ? activationStart : 0;
  }
  
  /**
   * 为FCP指标分配评级
   */
  private assignFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= FCPObserver.FCP_GOOD_THRESHOLD) {
      return 'good';
    } else if (value <= FCPObserver.FCP_NEEDS_IMPROVEMENT_THRESHOLD) {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  }
  
  /**
   * 实现观察FCP的方法
   */
  protected observe(): void {
    if (typeof PerformanceObserver === 'undefined') {
      logger.error('PerformanceObserver API不可用，无法监控FCP');
      return;
    }
    
    try {
      this.fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            // 只有当页面在FCP发生前未隐藏时才报告
            if (entry.startTime < this.firstHiddenTime) {
              // 计算FCP值，考虑activationStart（预渲染）
              const fcpValue = Math.max(entry.startTime - this.getActivationStart(), 0);
              
              const fcp: MetricData = {
                name: 'FCP',
                value: fcpValue,
                unit: 'ms',
                timestamp: new Date().getTime(),
                url: typeof window !== 'undefined' ? window.location.href : undefined,
                networkMetrics: this.getNetworkInformation()
              };
              
              // 设置评级
              fcp.rating = this.assignFCPRating(fcp.value);
              
              this.onUpdate(fcp);
              
              // 标记指标已报告
              this.metricReported = true;
            } else {
              logger.debug('页面在FCP前已隐藏，忽略此FCP事件');
            }
            
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
    if (!isVisible && this.firstHiddenTime === Infinity) {
      this.firstHiddenTime = performance.now();
      logger.debug(`页面隐藏，更新firstHiddenTime: ${this.firstHiddenTime}ms`);
    }
  }
  
  /**
   * BFCache恢复处理
   * 在bfcache恢复后，使用双RAF测量时间为新的FCP值
   */
  protected onBFCacheRestore(event: PageTransitionEvent): void {
    // 对于BFCache恢复，我们需要新的FCP测量
    // 重置状态
    this.metricReported = false;
    this.firstHiddenTime = this.initFirstHiddenTime();
    this.setupFirstHiddenTimeListener();
    
    // 创建一个新的FCP指标，使用恢复时间差作为值
    const restoreTime = event.timeStamp;
    
    // 使用双重requestAnimationFrame确保我们在浏览器绘制后进行测量
    const doubleRAF = (callback: () => void): void => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          callback();
        });
      });
    };
    
    doubleRAF(() => {
      const currentTime = performance.now();
      const timeFromRestore = currentTime - restoreTime;
      
      const fcp: MetricData = {
        name: 'FCP',
        value: timeFromRestore,
        unit: 'ms',
        timestamp: currentTime,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        context: {
          bfcacheRestore: true,
          restoreTime: restoreTime
        }
      };
      
      fcp.rating = this.assignFCPRating(fcp.value);
      
      logger.info(`从bfcache恢复到现在的时间: ${timeFromRestore}ms，作为新的FCP值`);
      
      this.onUpdate(fcp);
      this.metricReported = true;
    });
    
    // 重新观察FCP，以防有更早的绘制事件
    this.observe();
  }
} 