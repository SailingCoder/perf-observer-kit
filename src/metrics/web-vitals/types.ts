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
  onUpdate: (metrics: MetricData) => void;
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