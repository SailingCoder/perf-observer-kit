import { MetricData, NavigationMetrics } from '../types';
import { calculateTime } from '../utils/time';
import { NetworkMetricsCollector } from '../utils/network-metrics';
import { NavigationTimingObserverOptions } from './web-vitals/types';

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
  }
  
  /**
   * 开始监控导航计时性能
   */
  start(): void {
    // First try to get the current navigation timing metrics
    this.collectInitialNavigationTiming();
    
    // Then observe future navigations
    try {
      this.observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        if (entries.length > 0) {
          // Use the most recent navigation entry
          const navigationEntry = entries[entries.length - 1] as PerformanceNavigationTiming;
          this.processNavigationEntry(navigationEntry);
        }
      });
      
      this.observer.observe({ type: 'navigation', buffered: true });
    } catch (error) {
      console.error('Navigation timing observation not supported', error);
    }
  }
  
  /**
   * 停止监控导航计时性能
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
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
        this.processNavigationEntry(navigationEntry);
      }
    } catch (error) {
      console.error('Error collecting initial navigation timing', error);
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
    const now = performance.now();
    
    // 网络连接阶段
    const dnsLookup = this.createMetric(
      'DNSLookup',
      calculateTime(entry.domainLookupEnd, entry.domainLookupStart) || 0,
      now
    );
    
    const tcpConnection = this.createMetric(
      'TCPConnection',
      calculateTime(entry.connectEnd, entry.connectStart) || 0,
      now
    );
    
    // SSL/TLS握手时间
    const sslTime = entry.secureConnectionStart > 0 ?
      this.createMetric(
        'SSLNegotiation',
        calculateTime(entry.connectEnd, entry.secureConnectionStart) || 0,
        now
      ) : undefined;
    
    // 请求/响应阶段
    const ttfb = this.createMetric(
      'TTFB',
      calculateTime(entry.responseStart, entry.requestStart) || 0,
      now,
      [100, 200] // TTFB评级阈值
    );
    
    const requestTime = this.createMetric(
      'Request',
      calculateTime(entry.responseStart, entry.fetchStart) || 0,
      now
    );
    
    const responseTime = this.createMetric(
      'Response',
      calculateTime(entry.responseEnd, entry.responseStart) || 0,
      now
    );
    
    // 文档处理阶段
    const domProcessing = this.createMetric(
      'DOMProcessing',
      calculateTime(entry.domComplete, entry.domInteractive) || 0,
      now
    );
    
    const domContentLoaded = this.createMetric(
      'DOMContentLoaded',
      calculateTime(entry.domContentLoadedEventEnd, entry.startTime) || 0,
      now
    );
    
    const loadEvent = this.createMetric(
      'Load',
      calculateTime(entry.loadEventEnd, entry.startTime) || 0,
      now
    );
    
    // 获取网络信息
    const networkInfo = NetworkMetricsCollector.getNetworkInformation();
    
    // 整合所有指标
    this.metrics = {
      ttfb,
      domContentLoaded,
      loadEvent,
      dnsTime: dnsLookup,
      tcpTime: tcpConnection,
      sslTime,
      requestTime,
      responseTime,
      processingTime: domProcessing,
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
    }
    
    this.onUpdate(this.metrics);
  }
} 