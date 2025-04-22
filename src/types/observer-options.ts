import { LogLevel } from '../utils/logger';
import { 
  PerformanceMetrics, 
  MetricType, 
  CoreWebVitalsMetrics, 
  ResourceMetrics, 
  LongTaskMetrics, 
  NavigationMetrics
} from './metric-types';
import { BrowserInfo } from './browser-info-types';

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

/**
 * 核心Web指标观察者选项
 */
export interface CoreWebVitalsOptions {
  /** 是否启用核心Web指标监控 */
  enabled?: boolean;
  
  /** 是否监控累积布局偏移(CLS)指标 */
  cls?: boolean;
  
  /** 是否监控首次输入延迟(FID)指标 */
  fid?: boolean;
  
  /** 是否监控最大内容绘制(LCP)指标 */
  lcp?: boolean;
  
  /** 是否监控首次内容绘制(FCP)指标 */
  fcp?: boolean;
  
  /** 是否监控交互到下一次绘制(INP)指标 */
  inp?: boolean;
  
  /** 后台加载超时阈值(毫秒) */
  backgroundLoadThreshold?: number;

  /** 最大保存的长任务数量 */
  maxLongTasks?: number;

  /** 最大保存的资源数量 */
  maxResources?: number;
}

/**
 * 资源计时观察者选项
 */
export interface ResourceTimingOptions {
  /** 是否启用 */
  enabled?: boolean;
  
  /** 排除的资源模式 */
  excludedPatterns?: (string | RegExp)[];
  
  /** 允许的资源类型 */
  allowedTypes?: string[];
  
  /** 最大记录的条目数 */
  maxEntries?: number;
  
  /** 最大保存的资源数量 */
  maxResources?: number;
}

/**
 * 长任务观察者选项
 */
export interface LongTasksOptions {
  /** 是否启用 */
  enabled?: boolean;
  
  /** 长任务阈值（毫秒） */
  threshold?: number;
  
  /** 最大记录的长任务数量 */
  maxEntries?: number;
  
  /** 最大保存的长任务数量 */
  maxLongTasks?: number;
}

/**
 * 导航计时观察者选项
 */
export interface NavigationTimingOptions {
  /** 是否启用 */
  enabled?: boolean;
  
  /** 是否包含原始计时数据 */
  includeRawTiming?: boolean;
}

/**
 * 浏览器信息观察者选项
 */
export interface BrowserInfoOptions {
  /** 是否启用 */
  enabled?: boolean;
  
  /** 是否在窗口大小变化时重新收集 */
  trackResize?: boolean;
  
  /** 是否包含详细的操作系统信息 */
  includeOSDetails?: boolean;
  
  /** 是否包含屏幕和窗口尺寸信息 */
  includeSizeInfo?: boolean;
}

/**
 * 性能观察器选项
 */
export interface PerfObserverOptions extends GlobalOptions {
  /** 
   * 指标更新回调函数 
   * @param type 指标类型
   * @param metrics 具体指标数据
   */
  onMetrics?: (
    type: MetricType, 
    metrics: CoreWebVitalsMetrics | ResourceMetrics[] | LongTaskMetrics[] | NavigationMetrics | BrowserInfo
  ) => void;
  
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
} 