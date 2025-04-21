import { 
  PerfObserverOptions, 
  PerformanceMetrics, 
  CoreWebVitalsMetrics,
  ResourceMetrics,
  LongTaskMetrics,
  NavigationMetrics,
  ResourceTimingOptions,
  CoreWebVitalsOptions,
  LongTasksOptions,
  NavigationTimingOptions,
  BrowserInfoOptions,
  BrowserInfo,
  GlobalOptions
} from './types';
import { browserSupport } from './utils';
import { logger, LogLevel } from './utils/logger';

// 导入各个监视器
import { CoreWebVitalsObserver } from './metrics/core-web-vitals';
import { ResourceTimingObserver } from './metrics/resource-timing';
import { LongTasksObserver } from './metrics/long-tasks';
import { NavigationTimingObserver } from './metrics/navigation-timing';
import { BrowserInfoObserver } from './metrics/browser-observer';
import {
  CoreWebVitalsObserverOptions,
  LongTasksObserverOptions,
  NavigationTimingObserverOptions
} from './metrics/web-vitals/types';

/**
 * 性能观察工具包 - 性能监控的主类
 */
export class PerfObserverKit {
  private options: {
    onMetrics: (metrics: PerformanceMetrics) => void;
    debug: boolean;
    logLevel: LogLevel;
    autoStart: boolean;
    samplingRate: number;
    coreWebVitals: CoreWebVitalsOptions;
    resourceTiming: Required<ResourceTimingOptions>;
    longTasks: LongTasksOptions;
    navigationTiming: NavigationTimingOptions;
    browserInfo: BrowserInfoOptions;
  };
  
  private coreWebVitalsObserver: CoreWebVitalsObserver | null = null;
  private resourceTimingObserver: ResourceTimingObserver | null = null;
  private longTasksObserver: LongTasksObserver | null = null;
  private navigationTimingObserver: NavigationTimingObserver | null = null;
  private browserInfoObserver: BrowserInfoObserver | null = null;
  
  private metrics: PerformanceMetrics = {
    coreWebVitals: {},
    resources: [],
    longTasks: [],
    navigation: {},
    browserInfo: {}
  };
  
  private isRunning = false;
  
  /**
   * 创建性能观察工具包实例
   */
  constructor(options: PerfObserverOptions = {}) {
    // 处理向后兼容
    this.handleBackwardCompatibility(options);
    
    // 设置默认选项
    this.options = {
      onMetrics: options.onMetrics || (() => {}),
      debug: options.debug || false,
      logLevel: this.determineLogLevel(options),
      autoStart: options.autoStart !== undefined ? options.autoStart : false,
      samplingRate: options.samplingRate || 0, // 0表示不采样，报告所有指标
      
      // 核心Web指标配置
      coreWebVitals: this.normalizeModuleOptions(options.coreWebVitals, true),
      
      // 资源计时配置
      resourceTiming: this.normalizeResourceOptions(options.resourceTiming, options),
      
      // 长任务监控配置
      longTasks: this.normalizeModuleOptions(options.longTasks, true),
      
      // 导航计时配置
      navigationTiming: this.normalizeModuleOptions(options.navigationTiming, true),
      
      // 浏览器信息配置
      browserInfo: this.normalizeModuleOptions(options.browserInfo, true)
    };
    
    // 初始化日志系统
    logger.setLevel(this.options.logLevel);
    
    // 输出初始化日志
    logger.debug('PerfObserverKit初始化完成，配置:', this.options);
    
    // 检查浏览器支持
    if (!browserSupport.hasPerformanceAPI()) {
      logger.warn('当前浏览器不支持Performance API');
    }
    
    if (!browserSupport.hasPerformanceObserver()) {
      logger.warn('当前浏览器不支持PerformanceObserver');
    }
    
    // 如果启用了自动开始，则自动启动监控
    if (this.options.autoStart) {
      this.start();
    }
  }
  
  /**
   * 确定使用的日志级别
   */
  private determineLogLevel(options: PerfObserverOptions): LogLevel {
    if (options.logLevel !== undefined) {
      // 确保值在有效范围内
      const level = Number(options.logLevel);
      if (level >= LogLevel.NONE && level <= LogLevel.DEBUG) {
        return level;
      }
    }
    
    // 基于debug选项设置默认日志级别
    return options.debug ? LogLevel.DEBUG : LogLevel.WARN;
  }
  
  /**
   * 处理向后兼容的配置选项
   */
  private handleBackwardCompatibility(options: PerfObserverOptions): void {
    // 如果使用了旧的配置选项，但没有使用新的配置选项，则应用向后兼容
    if (options.enableCoreWebVitals !== undefined && options.coreWebVitals === undefined) {
      options.coreWebVitals = options.enableCoreWebVitals;
    }
    
    if (options.enableResourceTiming !== undefined && options.resourceTiming === undefined) {
      options.resourceTiming = options.enableResourceTiming;
    }
    
    if (options.enableLongTasks !== undefined && options.longTasks === undefined) {
      options.longTasks = options.enableLongTasks;
    }
    
    if (options.enableNavigationTiming !== undefined && options.navigationTiming === undefined) {
      options.navigationTiming = options.enableNavigationTiming;
    }
    
    // 浏览器信息没有旧的配置选项
  }
  
  /**
   * 将模块配置规范化为标准格式
   * @param options 用户提供的模块配置
   * @param defaultEnabled 默认是否启用
   */
  private normalizeModuleOptions<T extends { enabled?: boolean }>(
    options: boolean | T | undefined, 
    defaultEnabled: boolean
  ): T & { enabled: boolean } {
    try {
      // 处理布尔值情况 (向后兼容)
      if (typeof options === 'boolean') {
        return { enabled: options } as T & { enabled: boolean };
      }
      
      // 处理对象情况
      if (options && typeof options === 'object') {
        return { 
          ...options,
          enabled: options.enabled !== undefined ? options.enabled : defaultEnabled
        } as T & { enabled: boolean };
      }
      
      // 处理未定义情况
      return { enabled: defaultEnabled } as T & { enabled: boolean };
    } catch (error) {
      logger.error('规范化模块配置失败:', error);
      return { enabled: defaultEnabled } as T & { enabled: boolean };
    }
  }
  
  /**
   * 规范化资源计时选项
   */
  private normalizeResourceOptions(
    options: boolean | ResourceTimingOptions | undefined,
    legacyOptions: PerfObserverOptions
  ): Required<ResourceTimingOptions> {
    try {
      const normalizedOptions = this.normalizeModuleOptions(options, true);
      
      return {
        enabled: normalizedOptions.enabled,
        excludedPatterns: normalizedOptions.excludedPatterns || 
                          legacyOptions.excludedResourcePatterns || [],
        allowedTypes: normalizedOptions.allowedTypes || 
                      legacyOptions.allowedResourceTypes || 
                      ['script', 'link', 'img', 'css', 'font'],
        maxEntries: normalizedOptions.maxEntries || 1000
      };
    } catch (error) {
      logger.error('规范化资源计时选项失败:', error);
      return {
        enabled: true,
        excludedPatterns: [],
        allowedTypes: ['script', 'link', 'img', 'css', 'font'],
        maxEntries: 1000
      };
    }
  }
  
  /**
   * 开始监控性能指标
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('性能监控已经在运行中');
      return;
    }
    
    logger.info('开始监控性能指标');
    
    if (this.options.coreWebVitals.enabled) {
      this.startCoreWebVitalsMonitoring();
    }
    
    if (this.options.resourceTiming.enabled) {
      this.startResourceTimingMonitoring();
    }
    
    if (this.options.longTasks.enabled) {
      this.startLongTasksMonitoring();
    }
    
    if (this.options.navigationTiming.enabled) {
      this.startNavigationTimingMonitoring();
    }
    
    if (this.options.browserInfo.enabled) {
      this.startBrowserInfoMonitoring();
    }
    
    this.isRunning = true;
    logger.debug('所有启用的性能监控模块已启动');
  }
  
  /**
   * 停止监控性能指标
   */
  stop(): void {
    if (!this.isRunning) {
      logger.warn('性能监控未在运行中');
      return;
    }
    
    logger.info('停止监控性能指标');
    
    if (this.coreWebVitalsObserver) {
      this.coreWebVitalsObserver.stop();
      this.coreWebVitalsObserver = null;
    }
    
    if (this.resourceTimingObserver) {
      this.resourceTimingObserver.stop();
      this.resourceTimingObserver = null;
    }
    
    if (this.longTasksObserver) {
      this.longTasksObserver.stop();
      this.longTasksObserver = null;
    }
    
    if (this.navigationTimingObserver) {
      this.navigationTimingObserver.stop();
      this.navigationTimingObserver = null;
    }
    
    if (this.browserInfoObserver) {
      this.browserInfoObserver.stop();
      this.browserInfoObserver = null;
    }
    
    this.isRunning = false;
    logger.debug('所有性能监控模块已停止');
  }
  
  /**
   * 获取当前的指标数据
   */
  getMetrics(): PerformanceMetrics {
    return this.metrics;
  }
  
  /**
   * 清除指标数据
   */
  clearMetrics(): void {
    logger.debug('清除所有指标数据');
    this.metrics = {
      coreWebVitals: {},
      resources: [],
      longTasks: [],
      navigation: {},
      browserInfo: {}
    };
  }
  
  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLogLevel(level: LogLevel): void {
    if (level >= LogLevel.NONE && level <= LogLevel.DEBUG) {
      this.options.logLevel = level;
      logger.setLevel(level);
      logger.debug('已更新日志级别为:', level);
    } else {
      logger.warn('无效的日志级别:', level);
    }
  }
  
  /**
   * 设置调试模式
   * @param enabled 是否启用调试模式
   */
  setDebugMode(enabled: boolean): void {
    this.options.debug = enabled;
    
    // 如果启用了调试模式，自动将日志级别设置为DEBUG
    if (enabled && this.options.logLevel < LogLevel.DEBUG) {
      this.setLogLevel(LogLevel.DEBUG);
    }
    
    logger.debug('调试模式已' + (enabled ? '启用' : '禁用'));
  }
  
  /**
   * 开始监控核心Web指标
   */
  private startCoreWebVitalsMonitoring(): void {
    try {
      const requiredEntryTypes = [
        'paint', // For FCP
        'largest-contentful-paint',
        'first-input',
        'layout-shift'
      ];
      
      // 检查所需的条目类型是否受支持
      const unsupportedTypes = requiredEntryTypes.filter(
        type => !browserSupport.supportsEntryType(type)
      );
      
      if (unsupportedTypes.length > 0) {
        logger.warn(
          `部分核心Web指标在当前浏览器中不受支持: ${unsupportedTypes.join(', ')}`
        );
      }
      
      // 将配置传递给观察者
      const options = this.options.coreWebVitals;
      
      this.coreWebVitalsObserver = new CoreWebVitalsObserver({
        onUpdate: (coreWebVitalsMetrics: CoreWebVitalsMetrics) => {
          this.metrics.coreWebVitals = coreWebVitalsMetrics;
          this.notifyMetricsUpdate();
        },
        enabled: options.enabled,
        includeFCP: options.includeFCP,
        includeLCP: options.includeLCP,
        includeFID: options.includeFID,
        includeCLS: options.includeCLS,
        includeINP: options.includeINP
      });
      
      this.coreWebVitalsObserver.start();
      logger.debug('核心Web指标监控已启动');
    } catch (error) {
      logger.error('启动核心Web指标监控失败:', error);
    }
  }
  
  /**
   * 开始监控资源计时
   */
  private startResourceTimingMonitoring(): void {
    try {
      if (!browserSupport.supportsEntryType('resource')) {
        logger.warn('当前浏览器不支持资源计时监控');
        return;
      }
      
      const options = this.options.resourceTiming;
      
      this.resourceTimingObserver = new ResourceTimingObserver(
        (resources: ResourceMetrics[]) => {
          this.metrics.resources = resources;
          this.notifyMetricsUpdate();
        },
        options.excludedPatterns,
        options.allowedTypes
      );
      
      this.resourceTimingObserver.start();
      logger.debug('资源计时监控已启动');
    } catch (error) {
      logger.error('启动资源计时监控失败:', error);
    }
  }
  
  /**
   * 开始监控长任务
   */
  private startLongTasksMonitoring(): void {
    try {
      if (!browserSupport.supportsEntryType('longtask')) {
        logger.warn('当前浏览器不支持长任务监控');
        return;
      }
      
      const options = this.options.longTasks;
      
      this.longTasksObserver = new LongTasksObserver({
        onUpdate: (longTasks: LongTaskMetrics[]) => {
          this.metrics.longTasks = longTasks;
          this.notifyMetricsUpdate();
        },
        enabled: options.enabled,
        threshold: options.threshold,
        maxEntries: options.maxEntries
      });
      
      this.longTasksObserver.start();
      logger.debug('长任务监控已启动');
    } catch (error) {
      logger.error('启动长任务监控失败:', error);
    }
  }
  
  /**
   * 开始监控导航计时
   */
  private startNavigationTimingMonitoring(): void {
    try {
      if (!browserSupport.supportsEntryType('navigation')) {
        logger.warn('当前浏览器不支持导航计时监控');
        return;
      }
      
      const options = this.options.navigationTiming;
      
      this.navigationTimingObserver = new NavigationTimingObserver({
        onUpdate: (navigationMetrics: NavigationMetrics) => {
          this.metrics.navigation = navigationMetrics;
          this.notifyMetricsUpdate();
        },
        enabled: options.enabled,
        includeRawTiming: options.includeRawTiming
      });
      
      this.navigationTimingObserver.start();
      logger.debug('导航计时监控已启动');
    } catch (error) {
      logger.error('启动导航计时监控失败:', error);
    }
  }
  
  /**
   * 开始监控浏览器信息
   */
  private startBrowserInfoMonitoring(): void {
    try {
      const options = this.options.browserInfo;
      
      this.browserInfoObserver = new BrowserInfoObserver({
        onUpdate: (browserInfo: BrowserInfo) => {
          this.metrics.browserInfo = browserInfo;
          this.notifyMetricsUpdate();
        },
        enabled: options.enabled,
        trackResize: options.trackResize,
        includeOSDetails: options.includeOSDetails,
        includeSizeInfo: options.includeSizeInfo
      });
      
      this.browserInfoObserver.start();
      logger.debug('浏览器信息监控已启动');
    } catch (error) {
      logger.error('启动浏览器信息监控失败:', error);
    }
  }
  
  /**
   * 通知指标更新给回调函数
   */
  private notifyMetricsUpdate(): void {
    try {
      if (this.options.onMetrics) {
        this.options.onMetrics(this.metrics);
      }
    } catch (error) {
      logger.error('指标更新回调执行失败:', error);
    }
  }
} 