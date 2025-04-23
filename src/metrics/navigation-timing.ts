import { MetricData, NavigationMetrics } from '../types';
import { logger } from '../utils/logger';
import { NavigationObserverOptions } from './web-vitals/types';
import { NetworkMetricsCollector } from '../utils/network-metrics';
import { calculateTime } from '../utils/time';

/**
 * 导航计时观察者
 * 收集页面加载性能指标，包括导航计时、网络信息等
 */
export class NavigationObserver {
  // 存储收集到的指标数据
  private metrics: NavigationMetrics = {};
  
  // 当前实例状态标记
  private isStarted = false;
  private hasCollectedMetrics = false;
  
  // 配置项和回调函数
  private options: NavigationObserverOptions;
  private metricsUpdateCallback: (metrics: NavigationMetrics) => void;
  
  // 性能观察器和超时控制
  private perfObserver: PerformanceObserver | null = null;
  private timeoutId: number | null = null;
  
  // 配置常量
  private readonly MAX_WAIT_TIME_MS = 10000; // 10秒超时限制
  private readonly MAX_POLL_ATTEMPTS = 10;   // 最大轮询次数
  private readonly POLL_INTERVAL_MS = 200;   // 轮询间隔
  
  constructor(options: NavigationObserverOptions) {
    this.metricsUpdateCallback = options.onUpdate;
    this.options = {
      enabled: options.enabled !== undefined ? options.enabled : true,
      includeRawTiming: options.includeRawTiming || false,
      onUpdate: options.onUpdate
    };
    
    logger.debug('创建导航计时观察者', {
      enabled: this.options.enabled,
      includeRawTiming: this.options.includeRawTiming
    });
  }
 
  public start(): void {
    // 避免重复启动或已收集过指标
    if (!this.canStart()) {
      return;
    }

    this.isStarted = true;
    this.timeoutId = window.setTimeout(() => {
      logger.warn(`等待超过${this.MAX_WAIT_TIME_MS}ms，强制收集可用的导航性能数据`);
      this.collectNavigationData(true); // 强制收集
      this.cleanupResources();
    }, this.MAX_WAIT_TIME_MS);
    
    // 尝试使用PerformanceObserver（现代浏览器首选方法）
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.perfObserver = new PerformanceObserver((entries) => {
          const navigationEntries = entries.getEntries()
            .filter(entry => entry.entryType === 'navigation') as PerformanceNavigationTiming[];
          
          if (navigationEntries.length === 0) {
            return;
          }
          
          const latestEntry = navigationEntries[navigationEntries.length - 1];
          if (this.isLoadEventComplete(latestEntry)) {
            this.processNavigationData(latestEntry);
            this.cleanupResources();
          }
        });
        this.perfObserver.observe({ type: 'navigation', buffered: true });
        logger.debug('开始使用PerformanceObserver监测导航性能');
      } catch (error) {
        logger.error('PerformanceObserver初始化失败', error);
        this.startWithTraditionalMethod();
      }
    } else {
      this.startWithTraditionalMethod();
    }
  }
  
  public stop(): void {
    logger.info('停止导航性能数据收集');
    this.isStarted = false;
    this.cleanupResources();
  }
  
  /**
   * 获取收集到的导航性能指标
   */
  public getMetrics(): NavigationMetrics {
    return this.metrics;
  }
  
  /**
   * 检查是否可以开始收集指标
   */
  private canStart(): boolean {
    if (!this.options.enabled) {
      logger.debug('导航计时观察者已禁用');
      return false;
    }
    
    if (this.isStarted) {
      logger.debug('导航计时观察者已处于活动状态');
      return false;
    }
    
    if (this.hasCollectedMetrics) {
      logger.debug('导航计时观察者已收集过指标');
      return false;
    }
    
    return true;
  }
  
  /**
   * 清理超时定时器
   */
  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  
  /**
   * 清理所有资源
   */
  private cleanupResources(): void {
    // 清理性能观察者
    if (this.perfObserver) {
      this.perfObserver.disconnect();
      this.perfObserver = null;
    }
    
    // 清理定时器
    this.clearTimeout();
  }
  
  /**
   * 使用传统方法开始收集导航性能数据
   */
  private startWithTraditionalMethod(): void {
    logger.info('使用传统方法收集导航性能数据');
    
    if (document.readyState === 'complete') {
      this.pollForNavigationData();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.pollForNavigationData(), 100);
      });
    }
  }
  
  /**
   * 通过轮询方式检查并获取导航性能数据
   */
  private pollForNavigationData(attemptCount = 0): void {
    // 超过最大尝试次数，强制收集
    if (attemptCount > this.MAX_POLL_ATTEMPTS) {
      logger.warn(`轮询${this.MAX_POLL_ATTEMPTS}次后未获取到完整数据，强制收集可用数据`);
      this.collectNavigationData(true);
      return;
    }
    
    // 尝试获取导航性能条目
    const navEntry = this.getLatestNavigationEntry();
    
    if (!navEntry) {
      logger.warn('未找到导航性能条目');
      return;
    }
    
    // 检查数据是否完整
    if (this.isLoadEventComplete(navEntry)) {
      this.collectNavigationData();
      this.clearTimeout();
    } else {
      // 延迟后再次尝试
      setTimeout(
        () => this.pollForNavigationData(attemptCount + 1), 
        this.POLL_INTERVAL_MS
      );
    }
  }
  
  /**
   * 获取最新的导航性能条目
   */
  private getLatestNavigationEntry(): PerformanceNavigationTiming | null {
    if (!('performance' in window) || !('getEntriesByType' in performance)) {
      return null;
    }
    
    const entries = performance.getEntriesByType('navigation');
    
    if (!entries || entries.length === 0) {
      return null;
    }
    
    return entries[entries.length - 1] as PerformanceNavigationTiming;
  }
  
  /**
   * 收集导航计时数据
   */
  private collectNavigationData(forceProcess = false): void {
    const navEntry = this.getLatestNavigationEntry();
    
    if (!navEntry) {
      logger.warn('无法收集导航性能数据：未找到导航性能条目');
      return;
    }
    
    // 检查loadEvent数据是否完整
    if (!forceProcess && !this.isLoadEventComplete(navEntry)) {
      logger.warn('导航性能数据不完整：load事件未完成');
      return;
    }
    
    this.processNavigationData(navEntry);
  }
  
  /**
   * 判断load事件是否已完成
   */
  private isLoadEventComplete(entry: PerformanceNavigationTiming): boolean {
    // 检查loadEvent相关属性是否有效
    const hasValidStart = typeof entry.loadEventStart === 'number' && entry.loadEventStart > 0;
    const hasValidEnd = typeof entry.loadEventEnd === 'number' && entry.loadEventEnd > 0;
    const isComplete = hasValidStart && hasValidEnd && entry.loadEventEnd >= entry.loadEventStart;
    
    if (!isComplete) {
      logger.debug('load事件数据不完整', {
        loadEventStart: entry.loadEventStart,
        loadEventEnd: entry.loadEventEnd
      });
    }
    
    return isComplete;
  }
  
  /**
   * 处理导航性能条目，提取和计算指标
   */
  private processNavigationData(entry: PerformanceNavigationTiming): void {
    // 计算性能指标
    const timingMetrics = {
      // 资源加载阶段
      unloadTime: calculateTime(entry.unloadEventEnd, entry.unloadEventStart),
      redirectTime: calculateTime(entry.redirectEnd, entry.redirectStart),
      
      // Service Worker阶段
      serviceWorkerTime: entry.workerStart > 0 
        ? calculateTime(entry.workerStart, entry.fetchStart) 
        : undefined,
      
      // DNS/TCP/SSL阶段
      appCacheTime: calculateTime(entry.domainLookupStart, entry.fetchStart),
      dnsTime: calculateTime(entry.domainLookupEnd, entry.domainLookupStart),
      tcpTime: calculateTime(entry.connectEnd, entry.connectStart),
      sslTime: entry.secureConnectionStart > 0 
        ? calculateTime(entry.connectEnd, entry.secureConnectionStart) 
        : undefined,
      
      // 请求/响应阶段
      requestTime: calculateTime(entry.responseStart, entry.requestStart),
      ttfb: calculateTime(entry.responseStart, entry.requestStart),
      resourceFetchTime: calculateTime(entry.responseStart, entry.fetchStart),
      responseTime: calculateTime(entry.responseEnd, entry.responseStart),
      
      // DOM处理阶段
      initDOMTime: calculateTime(entry.domInteractive, entry.responseEnd),
      processingTime: calculateTime(entry.domComplete, entry.domInteractive),
      contentLoadTime: calculateTime(entry.domContentLoadedEventEnd, entry.domContentLoadedEventStart),
      
      // 页面加载完成指标
      domContentLoaded: calculateTime(entry.domContentLoadedEventEnd, entry.startTime),
      loadEventDuration: calculateTime(entry.loadEventEnd, entry.loadEventStart),
      frontEndTime: calculateTime(entry.loadEventEnd, entry.responseEnd),
      totalLoadTime: calculateTime(entry.loadEventEnd, entry.startTime)
    };
    
    // 获取网络信息
    const networkMetrics = NetworkMetricsCollector.getNetworkInformation();
    
    // 获取当前页面URL
    const pageUrl = typeof window !== 'undefined' ? window.location.href : entry.name;
    
    logger.info('导航性能指标', {
      url: entry.name, // 移除查询参数
      ttfb: `${timingMetrics.ttfb?.toFixed(2) || 0}ms`,
      domContentLoaded: `${timingMetrics.domContentLoaded?.toFixed(2) || 0}ms`,
      loadEventDuration: `${timingMetrics.loadEventDuration?.toFixed(2) || 0}ms`,
      totalLoadTime: `${timingMetrics.totalLoadTime?.toFixed(2) || 0}ms`
    });
    
    // 整合所有指标
    this.metrics = {
      ...timingMetrics as any,
      url: pageUrl,
      metric: 'navigation',
      networkMetrics,
      timestamp: Date.now(),
      complete: true
    };
    
    // 根据配置添加原始计时数据
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
    
    // 调用回调函数
    this.metricsUpdateCallback(this.metrics);
    this.hasCollectedMetrics = true;
  }
} 