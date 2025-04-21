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
  /** 指标更新回调函数 */
  onUpdate: (metrics: MetricData) => void;
  
  /** 是否启用该观察者，默认为true */
  enabled?: boolean;
  
  /** 是否在用户交互后停止监控，默认为true（适用于LCP等） */
  stopOnUserInteraction?: boolean;
  
  /** 是否在页面隐藏时停止监控，默认为true */
  stopOnHidden?: boolean;
  
  /** 自定义的阈值设置 */
  thresholds?: {
    good?: number;
    needsImprovement?: number;
  };
}

/**
 * 核心Web指标观察者选项
 */
export interface CoreWebVitalsObserverOptions {
  /** 指标更新回调函数 */
  onUpdate: (metrics: CoreWebVitalsMetrics) => void;
  
  /** 是否启用该观察者，默认为true */
  enabled?: boolean;
  
  /** 是否监控FCP指标 */
  includeFCP?: boolean;
  
  /** 是否监控LCP指标 */
  includeLCP?: boolean;
  
  /** 是否监控FID指标 */
  includeFID?: boolean;
  
  /** 是否监控CLS指标 */
  includeCLS?: boolean;
  
  /** 是否监控INP指标 */
  includeINP?: boolean;
}

/**
 * 长任务观察者选项
 */
export interface LongTasksObserverOptions {
  /** 指标更新回调函数 */
  onUpdate: (metrics: any[]) => void;
  
  /** 是否启用该观察者，默认为true */
  enabled?: boolean;
  
  /** 长任务阈值（毫秒），默认为50ms */
  threshold?: number;
  
  /** 最大记录的长任务数量 */
  maxEntries?: number;
}

/**
 * 导航计时观察者选项
 */
export interface NavigationTimingObserverOptions {
  /** 指标更新回调函数 */
  onUpdate: (metrics: any) => void;
  
  /** 是否启用该观察者，默认为true */
  enabled?: boolean;
  
  /** 是否包含原始计时数据 */
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