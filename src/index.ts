import { PerfObserverKit } from './core/perf-observer-kit';
import {
  PerfObserverOptions,
  MetricData,
  CoreWebVitalsMetrics,
  ResourceMetrics,
  LongTaskMetrics,
  NavigationMetrics,
  BrowserInfo,
  PerformanceMetrics,
  MetricType,
  MetricPayload
} from './types';

// 导出所有类型
export {
  PerfObserverKit,
  PerfObserverOptions,
  MetricData,
  CoreWebVitalsMetrics,
  ResourceMetrics,
  LongTaskMetrics,
  NavigationMetrics,
  BrowserInfo,
  PerformanceMetrics,
  MetricType,
  MetricPayload
};

// 为浏览器环境添加全局对象
if (typeof window !== 'undefined') {
  (window as any).PerfObserverKit = {
    PerfObserverKit,
    MetricType
  };
} 