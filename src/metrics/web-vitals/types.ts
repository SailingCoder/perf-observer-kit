import { MetricData, CoreWebVitalsMetrics } from '../../types';

/**
 * 布局偏移接口定义
 */
export interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

/**
 * 观察者选项接口
 */
export interface ObserverOptions {
  /** 指标更新回调函数，用于接收和处理收集到的性能指标数据 */
  onUpdate: (metrics: MetricData) => void;
  
  /** 是否启用该观察者，默认为true */
  enabled?: boolean;
  
  /** 是否在用户交互(如点击、按键)后停止监控，默认为true（适用于LCP等） */
  stopOnUserInteraction?: boolean;
  
  /** 是否在页面隐藏(切换到其他标签页)时停止监控，默认为true */
  stopOnHidden?: boolean;
  
  /** 
   * 自定义的性能评级阈值设置 
   * 用于覆盖默认的性能指标评级阈值
   */
  thresholds?: {
    /** 良好性能的阈值 */
    good?: number;
    /** 需要改进性能的阈值 */
    needsImprovement?: number;
  };

  /** 
   * 后台加载超时阈值(毫秒)，默认为5000ms
   * 控制在后台加载页面变为可见时，LCP值的处理方式
   */
  backgroundLoadThreshold?: number;
}

/**
 * 核心Web指标观察者选项
 */
export interface CoreWebVitalsObserverOptions {
  /** 指标更新回调函数 */
  onUpdate: (metrics: CoreWebVitalsMetrics) => void;
  
  /** 是否启用该观察者，默认为false */
  enabled?: boolean;
  
  /** 
   * 是否监控首次内容绘制(FCP)指标
   * 测量从页面开始加载到页面内容的任何部分在屏幕上完成渲染的时间
   */
  fcp?: boolean;
  
  /** 
   * 是否监控最大内容绘制(LCP)指标
   * 测量页面主要内容加载完成的时间
   */
  lcp?: boolean;
  
  /** 
   * 是否监控首次输入延迟(FID)指标
   * 测量从用户第一次与页面交互到浏览器实际能够响应交互的时间
   */
  fid?: boolean;
  
  /** 
   * 是否监控累积布局偏移(CLS)指标
   * 衡量页面加载过程中的视觉稳定性
   */
  cls?: boolean;
  
  /** 
   * 是否监控交互到下一次绘制(INP)指标
   * 测量页面响应用户交互的速度
   */
  inp?: boolean;
  
  /** 
   * 后台加载超时阈值(毫秒)，默认为5000ms
   * 控制在后台加载页面变为可见时，LCP值的处理方式
   */
  backgroundLoadThreshold?: number;
}

/**
 * 长任务观察者选项
 * 用于监控页面中执行时间过长的JavaScript任务
 */
export interface LongTasksObserverOptions {
  /** 指标更新回调函数，用于接收长任务性能数据 */
  onUpdate: (metrics: any[]) => void;
  
  /** 是否启用该观察者，默认为true */
  enabled?: boolean;
  
  /** 
   * 长任务阈值（毫秒），默认为50ms
   * 超过此时间的任务将被视为长任务并记录
   */
  threshold?: number;
  
  /** 最大记录的长任务数量，防止内存占用过大 */
  maxEntries?: number;
}

/**
 * 导航计时观察者选项
 * 用于监控页面加载过程中的各个阶段性能
 */
export interface NavigationTimingObserverOptions {
  /** 指标更新回调函数，用于接收导航计时性能数据 */
  onUpdate: (metrics: any) => void;
  
  /** 是否启用该观察者，默认为true */
  enabled?: boolean;
  
  /** 
   * 是否包含原始计时数据
   * 如果为true，将包含更多详细的原始性能条目数据
   */
  includeRawTiming?: boolean;
}

/**
 * 页面可见性相关处理程序类型
 */
export type VisibilityChangeHandler = ((event: Event) => void) | null;

/**
 * 用户交互相关处理程序类型
 */
export type UserInteractionHandler = ((event: Event) => void) | null;

/**
 * 页面显示相关处理程序类型
 */
export type PageshowHandler = ((event: PageTransitionEvent) => void) | null;

/**
 * 网络信息接口定义
 */
export interface NetworkInformation {
  downlink?: number; // 下行速度 (Mbps)
  effectiveType?: string; // 网络类型 (4g, 3g等)
  rtt?: number; // 往返时间 (ms)
  saveData?: boolean; // 是否启用数据节省模式
} 