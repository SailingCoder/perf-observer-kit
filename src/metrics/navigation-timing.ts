import { MetricData, NavigationMetrics } from '../types';
import { calculateTime } from '../utils/time';
import { NetworkMetricsCollector } from '../utils/network-metrics';
import { BrowserInfoCollector } from '../utils/browser-info';
import { NavigationTimingObserverOptions } from './web-vitals/types';
import { logger } from '../utils/logger';

/**
 * 导航计时观察者
 * 负责监控页面导航过程中的性能指标，包括TTFB等
 */
export class NavigationTimingObserver {
  private observer: PerformanceObserver | null = null;
  private metrics: NavigationMetrics = {};
  private onUpdate: (metrics: NavigationMetrics) => void;
  private options: NavigationTimingObserverOptions;
  
  /**
   * 创建导航计时观察者实例
   * @param options 导航计时观察者配置
   */
  constructor(options: NavigationTimingObserverOptions) {
    this.onUpdate = options.onUpdate;
    this.options = {
      enabled: options.enabled !== undefined ? options.enabled : true,
      includeRawTiming: options.includeRawTiming !== undefined ? options.includeRawTiming : true,
      ...options
    };
    
    logger.debug('导航计时观察者已创建，配置:', {
      enabled: this.options.enabled,
      includeRawTiming: this.options.includeRawTiming
    });
  }
  
  /**
   * 开始监控导航计时性能
   */
  start(): void {
    logger.info('开始监控导航计时性能');
    
    // First try to get the current navigation timing metrics
    this.collectInitialNavigationTiming();
    
    // Then observe future navigations
    try {
      this.observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        if (entries.length > 0) {
          // Use the most recent navigation entry
          const navigationEntry = entries[entries.length - 1] as PerformanceNavigationTiming;
          logger.debug('收到新的导航计时条目:', navigationEntry.name);
          this.processNavigationEntry(navigationEntry);
        }
      });
      
      this.observer.observe({ type: 'navigation', buffered: true });
      logger.debug('导航计时观察者已启动');
    } catch (error) {
      logger.error('导航计时观察不受支持:', error);
    }
  }
  
  /**
   * 停止监控导航计时性能
   */
  stop(): void {
    logger.info('停止导航计时性能监控');
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      logger.debug('导航计时观察者已断开连接');
    }
  }
  
  /**
   * 获取导航计时指标
   */
  getMetrics(): NavigationMetrics {
    return this.metrics;
  }
  
  /**
   * 收集初始导航计时数据
   */
  private collectInitialNavigationTiming(): void {
    try {
      const navigationEntries = performance.getEntriesByType('navigation');
      
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
        logger.debug('收集初始导航计时数据:', navigationEntry.name);
        this.processNavigationEntry(navigationEntry);
      } else {
        logger.warn('未找到导航计时条目');
      }
    } catch (error) {
      logger.error('收集初始导航计时数据时出错:', error);
    }
  }
  
  /**
   * 创建带评级的指标数据
   * @param name 指标名称 
   * @param value 指标值
   * @param timestamp 时间戳
   * @param thresholds 评级阈值 [good, needs-improvement]
   * @returns 格式化的指标数据对象
   */
  private createMetric(
    name: string,
    value: number | undefined,
    timestamp: number,
    thresholds?: [number, number]
  ): MetricData {
    // 确保值为数字且非负
    const safeValue = typeof value === 'number' ? Math.max(0, value) : 0;
    
    const metric: MetricData = {
      name,
      value: safeValue,
      unit: 'ms',
      timestamp
    };
    
    // 如果提供了阈值，添加评级
    if (thresholds && (thresholds[0] > 0 || thresholds[1] > 0)) {
      if (safeValue <= thresholds[0]) {
        metric.rating = 'good';
      } else if (safeValue <= thresholds[1]) {
        metric.rating = 'needs-improvement';
      } else {
        metric.rating = 'poor';
      }
    }
    
    // 添加网络上下文信息
    metric.context = NetworkMetricsCollector.getNetworkContext();
    
    return metric;
  }
  
  /**
   * 处理导航性能条目
   */
  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    // 计算各个时间段
    const dnsLookupTime = calculateTime(entry.domainLookupEnd, entry.domainLookupStart) || 0;
    const tcpConnectionTime = calculateTime(entry.connectEnd, entry.connectStart) || 0;
    const sslNegotiationTime = entry.secureConnectionStart > 0 
      ? calculateTime(entry.connectEnd, entry.secureConnectionStart) || 0 
      : 0;
    const ttfbTime = calculateTime(entry.responseStart, entry.requestStart) || 0;
    const requestTime = calculateTime(entry.responseStart, entry.fetchStart) || 0;
    const responseTime = calculateTime(entry.responseEnd, entry.responseStart) || 0;
    const domProcessingTime = calculateTime(entry.domComplete, entry.domInteractive) || 0;
    const domContentLoadedTime = calculateTime(entry.domContentLoadedEventEnd, entry.startTime) || 0;
    const loadTime = calculateTime(entry.loadEventEnd, entry.startTime) || 0;
    
    // 记录关键性能指标
    logger.debug('计算导航计时指标:', {
      url: entry.name,
      ttfb: ttfbTime.toFixed(2) + 'ms',
      domContentLoaded: domContentLoadedTime.toFixed(2) + 'ms',
      loadTime: loadTime.toFixed(2) + 'ms'
    });
    
    // 获取网络信息
    const networkInfo = NetworkMetricsCollector.getNetworkInformation();
    
    // 获取当前页面URL
    const pageUrl = typeof window !== 'undefined' ? window.location.href : entry.name;
    
    // 整合所有指标，直接使用数值
    this.metrics = {
      ttfb: ttfbTime,
      domContentLoaded: domContentLoadedTime,
      loadEvent: loadTime,
      processingTime: domProcessingTime,
      dnsTime: dnsLookupTime,
      tcpTime: tcpConnectionTime,
      sslTime: sslNegotiationTime > 0 ? sslNegotiationTime : undefined,
      requestTime: requestTime,
      responseTime: responseTime,
      url: pageUrl,
      networkInfo
    };
    
    // 根据配置决定是否包含原始计时数据
    if (this.options.includeRawTiming) {
      this.metrics.rawTiming = {
        navigationStart: entry.startTime,
        unloadEventStart: entry.unloadEventStart,
        unloadEventEnd: entry.unloadEventEnd,
        redirectStart: entry.redirectStart,
        redirectEnd: entry.redirectEnd,
        fetchStart: entry.fetchStart,
        domainLookupStart: entry.domainLookupStart,
        domainLookupEnd: entry.domainLookupEnd,
        connectStart: entry.connectStart,
        connectEnd: entry.connectEnd,
        secureConnectionStart: entry.secureConnectionStart,
        requestStart: entry.requestStart,
        responseStart: entry.responseStart,
        responseEnd: entry.responseEnd,
        domInteractive: entry.domInteractive,
        domContentLoadedEventStart: entry.domContentLoadedEventStart,
        domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
        domComplete: entry.domComplete,
        loadEventStart: entry.loadEventStart,
        loadEventEnd: entry.loadEventEnd,
        type: entry.type,
        redirectCount: entry.redirectCount,
      };
      logger.debug('包含原始导航计时数据');
    }
    
    logger.info('导航计时指标已更新:', {
      url: pageUrl.split('?')[0], // 移除查询参数以避免日志过长
      ttfb: ttfbTime.toFixed(2) + 'ms',
      domContentLoaded: domContentLoadedTime.toFixed(2) + 'ms',
      load: loadTime.toFixed(2) + 'ms'
    });
    
    this.onUpdate(this.metrics);
  }
} 