import { LogLevel } from './utils/logger';

export interface MetricData {
  name: string; // 指标名称
  value: number; // 指标值
  unit: string; // 值的单位 (ms, %, 等)
  timestamp: number; // 记录时的时间戳
  url?: string; // 发生指标的页面URL
  rating?: MetricRating; // 可选的性能评级
  context?: Record<string, any>; // 其他上下文信息
  networkMetrics?: {
    downlink?: number; // 下行速度 (Mbps)
    effectiveType?: string; // 网络类型 (4g, 3g等)
    rtt?: number; // 往返时间 (ms)
    saveData?: boolean; // 是否启用数据节省模式
  }; // 网络性能指标
}

/**
 * 性能指标评级
 */
export type MetricRating = 'good' | 'needs-improvement' | 'poor';

/**
 * 全局选项
 */
export interface GlobalOptions {
  /** 是否启用调试模式 */
  debug?: boolean;
  
  /** 日志级别 */
  logLevel?: LogLevel;
  
  /** 是否自动开始监控 */
  autoStart?: boolean;
  
  /** 采样率 (0表示不采样) */
  samplingRate?: number;
}

// 核心Web指标观察者选项
export interface CoreWebVitalsOptions {
  enabled?: boolean; // 是否启用
  // 添加核心Web指标特定配置项
  includeCLS?: boolean; // 是否包含CLS指标
  includeFID?: boolean; // 是否包含FID指标
  includeLCP?: boolean; // 是否包含LCP指标
  includeFCP?: boolean; // 是否包含FCP指标
  includeINP?: boolean; // 是否包含INP指标
}

// 资源计时观察者选项
export interface ResourceTimingOptions {
  enabled?: boolean; // 是否启用
  excludedPatterns?: (string | RegExp)[]; // 排除的资源模式
  allowedTypes?: string[]; // 允许的资源类型
  maxEntries?: number; // 最大记录的条目数
}

// 长任务观察者选项
export interface LongTasksOptions {
  enabled?: boolean; // 是否启用
  threshold?: number; // 长任务阈值（毫秒）
  maxEntries?: number; // 最大记录的长任务数量
}

// 导航计时观察者选项
export interface NavigationTimingOptions {
  enabled?: boolean; // 是否启用
  includeRawTiming?: boolean; // 是否包含原始计时数据
}

// 浏览器信息观察者选项
export interface BrowserInfoOptions {
  enabled?: boolean; // 是否启用
  trackResize?: boolean; // 是否在窗口大小变化时重新收集
  includeOSDetails?: boolean; // 是否包含详细的操作系统信息
  includeSizeInfo?: boolean; // 是否包含屏幕和窗口尺寸信息
}

export interface CoreWebVitalsMetrics {
  fcp?: MetricData; // 首次内容绘制
  lcp?: MetricData; // 最大内容绘制
  fid?: MetricData; // 首次输入延迟
  cls?: MetricData; // 累积布局偏移
  inp?: MetricData; // 交互到首次内容绘制
}

export interface ResourceMetrics {
  name: string; // 资源URL地址
  initiatorType: string; // 资源发起者类型
  startTime: number; // 资源开始时间
  duration: number; // 资源加载时间
  transferSize?: number; // 传输大小
  decodedBodySize?: number; // 解码后的大小
  encodedSize?: number; // 编码后的大小
  responseEnd: number; // 响应结束时间
  ttfb?: number; // 首字节时间
  dnsTime?: number; // DNS解析时间
  tcpTime?: number; // TCP连接时间
  sslTime?: number; // SSL握手时间
  requestTime?: number; // 请求发送时间
  responseTime?: number; // 响应接收时间
  code?: number; // HTTP状态码
  networkMetrics?: {
    downlink?: number; // 下行速度 (Mbps)
    effectiveType?: string; // 网络类型 (4g, 3g等)
    rtt?: number; // 往返时间 (ms)
    saveData?: boolean; // 是否启用数据节省模式
  }; // 网络性能指标
}

export interface LongTaskMetrics {
  duration: number; // 任务持续时间
  startTime: number; // 任务开始时间
  attribution?: string; // 任务归属
}

export interface NavigationMetrics {
  ttfb?: number; // 首字节时间
  domContentLoaded?: number; // 文档加载完成时间      
  loadEvent?: number; // 页面加载完成时间
  processingTime?: number; // DOM处理时间
  dnsTime?: number; // DNS解析时间
  tcpTime?: number; // TCP连接时间
  sslTime?: number; // SSL/TLS握手时间
  requestTime?: number; // 请求发送时间
  responseTime?: number; // 响应接收时间
  url?: string; // 页面URL地址
  networkInfo?: {
    downlink?: number; // 下行速度 (Mbps)
    effectiveType?: string; // 网络类型 (4g, 3g等)
    rtt?: number; // 往返时间 (ms)
    saveData?: boolean; // 是否启用数据节省模式
  }; // 网络信息
  rawTiming?: Record<string, any>; // 原始性能数据
}

export interface BrowserInfo {
  userAgent?: string; // 浏览器用户代理
  language?: string; // 浏览器语言
  platform?: string; // 操作系统平台
  vendor?: string; // 浏览器厂商
  url?: string; // 当前页面URL
  screenSize?: {
    width: number;
    height: number;
  }; // 屏幕尺寸
  windowSize?: {
    width: number; 
    height: number;
  }; // 窗口尺寸
  devicePixelRatio?: number; // 设备像素比
  cookiesEnabled?: boolean; // 是否启用cookie
  browser?: {
    name: string; // 浏览器名称
    version: string; // 浏览器版本
  }; // 浏览器详细信息
  os?: {
    name: string; // 操作系统名称
    version: string; // 操作系统版本
  }; // 操作系统详细信息
}

export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitalsMetrics; // 核心Web性能指标
  resources: ResourceMetrics[]; // 资源加载性能指标
  longTasks: LongTaskMetrics[]; // 长任务性能指标
  navigation: NavigationMetrics; // 导航性能指标
  browserInfo: BrowserInfo; // 浏览器和设备信息
}

/**
 * 性能观察器选项
 */
export interface PerfObserverOptions extends GlobalOptions {
  /** 指标更新回调函数 */
  onMetrics?: (metrics: PerformanceMetrics) => void;
  
  /** 自定义日志前缀 */
  logPrefix?: string;
  
  /** 是否在生产环境禁用日志 */
  disableLogsInProduction?: boolean;
  
  /** 核心Web指标配置 */
  coreWebVitals?: boolean | CoreWebVitalsOptions;
  
  /** 资源计时配置 */
  resourceTiming?: boolean | ResourceTimingOptions;
  
  /** 长任务监控配置 */
  longTasks?: boolean | LongTasksOptions;
  
  /** 导航计时配置 */
  navigationTiming?: boolean | NavigationTimingOptions;
  
  /** 浏览器信息配置 */
  browserInfo?: boolean | BrowserInfoOptions;
  
  // 向后兼容的旧选项
  /** @deprecated 使用 coreWebVitals 替代 */
  enableCoreWebVitals?: boolean;
  
  /** @deprecated 使用 resourceTiming 替代 */
  enableResourceTiming?: boolean;
  
  /** @deprecated 使用 longTasks 替代 */
  enableLongTasks?: boolean;
  
  /** @deprecated 使用 navigationTiming 替代 */
  enableNavigationTiming?: boolean;
  
  /** @deprecated 使用 resourceTiming.excludedPatterns 替代 */
  excludedResourcePatterns?: RegExp[];
  
  /** @deprecated 使用 resourceTiming.allowedTypes 替代 */
  allowedResourceTypes?: string[];
} 