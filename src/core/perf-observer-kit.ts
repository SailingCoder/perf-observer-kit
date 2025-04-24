import { 
  PerfObserverOptions, 
  PerformanceMetrics, 
  CoreWebVitalsMetrics,
  ResourceMetrics,
  LongTaskMetrics,
  NavigationMetrics,
  CoreWebVitalsOptions,
  LongTasksOptions,
  NavigationOptions,
  BrowserInfoOptions,
  BrowserInfo,
  MetricType,
  ResourceOptions,
  MetricPayload
} from '../types';
import { browserSupport } from '../utils';
import { logger, LogLevel } from '../utils/logger';

// 导入各个监视器
import { CoreWebVitalsObserver } from '../metrics/core-web-vitals';
import { ResourceTimingObserver } from '../metrics/resource-timing';
import { LongTasksObserver } from '../metrics/long-tasks';
import { NavigationObserver } from '../metrics/navigation-timing';
import { BrowserInfoObserver } from '../metrics/browser-observer';

// 从package.json获取版本号 - 这个值会在构建时被rollup插件替换
// 使用字符串形式，避免TypeScript编译错误
const VERSION = '__VERSION__';

/**
 * 性能观察工具包 - 性能监控的主类
 */
export class PerfObserverKit {
  private options: {
    onMetrics: ((type: MetricType, metrics: MetricPayload) => void) | null;
    debug: boolean;
    logLevel: LogLevel;
    autoStart: boolean;
    samplingRate: number;
    coreWebVitals: CoreWebVitalsOptions;
    resources: Required<ResourceOptions>;
    longTasks: LongTasksOptions;
    navigation: NavigationOptions;
    browserInfo: BrowserInfoOptions;
  };
  
  private coreWebVitalsObserver: CoreWebVitalsObserver | null = null;
  private resourceTimingObserver: ResourceTimingObserver | null = null;
  private longTasksObserver: LongTasksObserver | null = null;
  private navigationObserver: NavigationObserver | null = null;
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
    // 检查基本兼容性
    this.checkBrowserCompatibility();
    
    // 验证输入选项
    this.validateOptions(options);
    
    // 规范化和组合选项
    const logLevel = this.determineLogLevel(options);
    
    this.options = {
      onMetrics: options.onMetrics || null,
      debug: options.debug !== undefined ? options.debug : false,
      logLevel,
      autoStart: options.autoStart !== undefined ? options.autoStart : false,
      samplingRate: options.samplingRate !== undefined ? options.samplingRate : 0,
      coreWebVitals: this.normalizeCoreWebVitalsOptions(options.coreWebVitals),
      resources: this.normalizeResourceOptions(options.resources),
      longTasks: this.normalizeModuleOptions(options.longTasks, false),
      navigation: this.normalizeModuleOptions(options.navigation, false),
      browserInfo: this.normalizeModuleOptions(options.browserInfo, false)
    };
    
    // 初始化日志系统 - 通过显式设置选项，确保即使在生产环境也能使用调试模式
    logger.setOptions({
      level: this.options.logLevel,
      disableInProduction: false // 确保生产环境中也能使用日志
    });
    
    // 输出初始化日志
    logger.debug('PerfObserverKit初始化完成，配置:', this.options);
    
    // 如果启用了自动开始，则自动启动监控
    if (this.options.autoStart) {
      this.start();
    }
  }
  
  /**
   * 验证传入的选项
   */
  private validateOptions(options: PerfObserverOptions): void {
    // 验证采样率
    if (options.samplingRate !== undefined && 
        (typeof options.samplingRate !== 'number' || 
         options.samplingRate < 0 || 
         options.samplingRate > 1)) {
      logger.warn('无效的采样率设置，应为0到1之间的数字，将使用默认值0');
      options.samplingRate = 0;
    }
    
    // 验证onMetrics回调
    if (options.onMetrics !== undefined && typeof options.onMetrics !== 'function') {
      logger.warn('onMetrics必须是一个函数，将使用默认空函数');
      options.onMetrics = () => {};
    }
  }
  
  /**
   * 检查浏览器兼容性
   */
  private checkBrowserCompatibility(): void {
    if (!browserSupport.hasPerformanceAPI()) {
      logger.warn('当前浏览器不支持Performance API');
    }
    
    if (!browserSupport.hasPerformanceObserver()) {
      logger.warn('当前浏览器不支持PerformanceObserver');
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
   * 规范化模块配置为标准格式
   * @param options 用户提供的模块配置
   * @param defaultEnabled 默认是否启用
   */
  private normalizeModuleOptions<T extends { enabled?: boolean }>(
    options: boolean | T | undefined, 
    defaultEnabled: boolean
  ): T & { enabled: boolean } {
    try {
      // 处理布尔值情况
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
    options: boolean | ResourceOptions | undefined
  ): Required<ResourceOptions> {
    try {
      // 首先使用通用方法获取基础选项
      const normalizedOptions = this.normalizeModuleOptions(options, true);
      
      // 处理配置选项，设置默认值
      return {
        ...normalizedOptions,
        maxResources: normalizedOptions.maxResources !== undefined ? normalizedOptions.maxResources : 100,
        excludedPatterns: normalizedOptions.excludedPatterns || [],
        allowedTypes: normalizedOptions.allowedTypes || [], // 默认允许所有类型
        captureNetworkInfo: normalizedOptions.captureNetworkInfo !== undefined ? normalizedOptions.captureNetworkInfo : true,
        maxEntries: normalizedOptions.maxEntries !== undefined ? normalizedOptions.maxEntries : 100
      };
    } catch (error) {
      logger.error('规范化资源计时选项失败:', error);
      return { 
        enabled: false, 
        maxResources: 100,
        excludedPatterns: [],
        allowedTypes: [],
        captureNetworkInfo: true,
        maxEntries: 100
      };
    }
  }
  
  /**
   * 规范化核心Web指标选项
   */
  private normalizeCoreWebVitalsOptions(
    options: boolean | CoreWebVitalsOptions | undefined
  ): CoreWebVitalsOptions {
    try {
      // 首先使用通用方法获取基础选项
      const normalizedOptions = this.normalizeModuleOptions(options, false);
      
      // 如果传入的是布尔值true，启用所有指标
      if (options === true) {
        return {
          enabled: true,
          fcp: true,
          lcp: true,
          fid: false,
          cls: false,
          inp: false,
          maxLongTasks: 50,
          maxResources: 100
        };
      }
      
      // 处理配置选项，设置默认值
      return {
        ...normalizedOptions,
        fcp: normalizedOptions.fcp !== undefined ? normalizedOptions.fcp : false,
        lcp: normalizedOptions.lcp !== undefined ? normalizedOptions.lcp : false,
        fid: normalizedOptions.fid !== undefined ? normalizedOptions.fid : false,
        cls: normalizedOptions.cls !== undefined ? normalizedOptions.cls : false,
        inp: normalizedOptions.inp !== undefined ? normalizedOptions.inp : false,
        maxLongTasks: normalizedOptions.maxLongTasks !== undefined ? normalizedOptions.maxLongTasks : 50,
        maxResources: normalizedOptions.maxResources !== undefined ? normalizedOptions.maxResources : 100
      };
    } catch (error) {
      logger.error('规范化核心Web指标选项失败:', error);
      return { 
        enabled: false,
        fcp: false,
        lcp: false,
        fid: false,
        cls: false,
        inp: false,
        maxLongTasks: 50,
        maxResources: 100
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
    
    // 采样率检查 - 如果配置了采样率，根据随机数决定是否收集数据
    if (this.options.samplingRate > 0 && Math.random() > this.options.samplingRate) {
      logger.debug(`根据采样率(${this.options.samplingRate})决定不收集此会话的性能数据`);
      // 将状态设置为运行中，但实际不启动监控
      this.isRunning = true;
      return;
    }
    
    // 使用通用方法启动各个观察器
    this.startObserver('coreWebVitals', this.startCoreWebVitalsMonitoring.bind(this));
    this.startObserver('resources', this.startResourceTimingMonitoring.bind(this));
    this.startObserver('longTasks', this.startLongTasksMonitoring.bind(this));
    this.startObserver('navigation', this.startNavigationMonitoring.bind(this));
    this.startObserver('browserInfo', this.startBrowserInfoMonitoring.bind(this));
    
    this.isRunning = true;
    logger.debug('所有启用的性能监控模块已启动');
  }
  
  /**
   * 通用启动观察器方法
   */
  private startObserver(
    name: keyof Pick<PerfObserverKit['options'], 'coreWebVitals' | 'resources' | 'longTasks' | 'navigation' | 'browserInfo'>, 
    startMethod: () => void
  ): void {
    const option = this.options[name];
    if (option && option.enabled) {
      startMethod();
    }
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
    
    // 停止并清理所有观察器
    this.cleanupObserver(this.coreWebVitalsObserver);
    this.cleanupObserver(this.resourceTimingObserver);
    this.cleanupObserver(this.longTasksObserver);
    this.cleanupObserver(this.navigationObserver);
    this.cleanupObserver(this.browserInfoObserver);
    
    // 重置所有观察器引用
    this.coreWebVitalsObserver = null;
    this.resourceTimingObserver = null;
    this.longTasksObserver = null;
    this.navigationObserver = null;
    this.browserInfoObserver = null;
    
    this.isRunning = false;
    logger.debug('所有性能监控模块已停止');
  }
  
  /**
   * 清理观察器
   */
  private cleanupObserver<T extends { stop: () => void }>(observer: T | null): void {
    if (observer) {
      try {
        observer.stop();
      } catch (error) {
        logger.error('停止观察器失败:', error);
      }
    }
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
    logger.debug('清除指标数据，保留浏览器信息');
    
    // 保存当前的浏览器信息
    const currentBrowserInfo = this.metrics.browserInfo;
    
    this.metrics = {
      coreWebVitals: {},
      resources: [],
      longTasks: [],
      navigation: {},
      // 保留浏览器信息不清除
      browserInfo: currentBrowserInfo
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
    
    // 确保生产环境也可以看到日志
    logger.setOptions({
      disableInProduction: false
    });
    
    logger.debug('调试模式已' + (enabled ? '启用' : '禁用'));
    
    // 输出更详细的诊断信息
    if (enabled) {
      const config = logger.getConfiguration();
      logger.debug('日志配置状态:', config);
      logger.debug('当前监控状态:', {
        isRunning: this.isRunning,
        activeObservers: {
          coreWebVitals: !!this.coreWebVitalsObserver,
          resources: !!this.resourceTimingObserver,
          longTasks: !!this.longTasksObserver,
          navigation: !!this.navigationObserver,
          browserInfo: !!this.browserInfoObserver
        }
      });
    }
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
          this.notifyMetricsUpdate(MetricType.WEB_VITALS, coreWebVitalsMetrics);
        },
        enabled: options.enabled,
        fcp: options.fcp,
        lcp: options.lcp,
        fid: options.fid,
        cls: options.cls,
        inp: options.inp,
        backgroundLoadThreshold: options.backgroundLoadThreshold
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
      
      const options = this.options.resources;
      
      this.resourceTimingObserver = new ResourceTimingObserver(
        (resources: ResourceMetrics[]) => {
          this.notifyMetricsUpdate(MetricType.RESOURCES, resources);
          this.metrics.resources.push(...resources);
          this.metrics.resources = this.metrics.resources.slice(-options.maxResources);
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
      const maxLongTasks = options.maxLongTasks || 50; // 提供默认值防止未定义
      
      this.longTasksObserver = new LongTasksObserver({
        onUpdate: (longTasks: LongTaskMetrics[]) => {
          this.notifyMetricsUpdate(MetricType.LONG_TASKS, longTasks);
          this.metrics.longTasks.push(...longTasks);
          this.metrics.longTasks = this.metrics.longTasks.slice(-maxLongTasks);
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
  private startNavigationMonitoring(): void {
    try {
      if (!browserSupport.supportsEntryType('navigation')) {
        logger.warn('当前浏览器不支持导航计时监控');
        return;
      }
      
      const options = this.options.navigation;
      
      this.navigationObserver = new NavigationObserver({
        onUpdate: (navigationMetrics: NavigationMetrics) => {
          this.metrics.navigation = navigationMetrics;
          this.notifyMetricsUpdate(MetricType.NAVIGATION, navigationMetrics);
        },
        enabled: options.enabled,
        includeRawTiming: options.includeRawTiming
      });
      
      this.navigationObserver.start();
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
      
      // 如果配置未启用，则直接返回
      if (!options.enabled) {
        logger.debug('浏览器信息监控未启用');
        return;
      }
      
      this.browserInfoObserver = new BrowserInfoObserver({
        onUpdate: (browserInfo: BrowserInfo) => {
          this.metrics.browserInfo = browserInfo;
          this.notifyMetricsUpdate(MetricType.BROWSER_INFO, browserInfo);
        },
        // 不再强制设为true，而是使用配置值
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
  private notifyMetricsUpdate(type: MetricType, metrics: MetricPayload): void {
    try {
      if (this.options.onMetrics) {
        // 调用回调函数
        this.options.onMetrics(type, metrics);
      }
    } catch (error) {
      logger.error('指标更新回调执行失败:', error);
    }
  }
  
  /**
   * 获取库版本信息
   */
  getVersion(): string {
    return VERSION;
  }
  
  /**
   * 检查当前环境是否支持所有必要的API
   */
  static checkBrowserSupport(): { supported: boolean; details: Record<string, boolean> } {
    const details = {
      performanceAPI: browserSupport.hasPerformanceAPI(),
      performanceObserver: browserSupport.hasPerformanceObserver(),
      navigation: browserSupport.supportsEntryType('navigation'),
      longtask: browserSupport.supportsEntryType('longtask'),
      resources: browserSupport.supportsEntryType('resource'),
      paint: browserSupport.supportsEntryType('paint'),
      largestContentfulPaint: browserSupport.supportsEntryType('largest-contentful-paint'),
      firstInput: browserSupport.supportsEntryType('first-input'),
      layoutShift: browserSupport.supportsEntryType('layout-shift')
    };
    
    // 基本支持需要Performance API和PerformanceObserver
    const supported = details.performanceAPI && details.performanceObserver;
    
    return { supported, details };
  }

  getStatus(): {
    isRunning: boolean;
    metrics: {
      coreWebVitals: boolean;
      resources: boolean;
      longTasks: boolean;
      navigation: boolean;
      browserInfo: boolean;
    };
  } {
    return {
      isRunning: this.isRunning,
      metrics: {
        coreWebVitals: !!this.coreWebVitalsObserver,
        resources: !!this.resourceTimingObserver,
        longTasks: !!this.longTasksObserver,
        navigation: !!this.navigationObserver,
        browserInfo: !!this.browserInfoObserver
      }
    };
  }
} 