export interface MetricData {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  unit?: string;
  timestamp: number;
}

export interface CoreWebVitalsMetrics {
  lcp?: MetricData;
  fid?: MetricData;
  cls?: MetricData;
  inp?: MetricData;
}

export interface ResourceMetrics {
  name: string;
  initiatorType: string;
  startTime: number;
  duration: number;
  transferSize?: number;
  decodedBodySize?: number;
  responseEnd: number;
}

export interface LongTaskMetrics {
  duration: number;
  startTime: number;
  attribution?: string;
}

export interface NavigationMetrics {
  ttfb?: MetricData;
  domContentLoaded?: MetricData;
  loadEvent?: MetricData;
}

export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitalsMetrics;
  resources: ResourceMetrics[];
  longTasks: LongTaskMetrics[];
  navigation: NavigationMetrics;
}

export interface PerfObserverOptions {
  /** Function to be called when metrics are collected */
  onMetrics?: (metrics: PerformanceMetrics) => void;
  
  /** Enable Core Web Vitals monitoring */
  enableCoreWebVitals?: boolean;
  
  /** Enable Resource timing monitoring */
  enableResourceTiming?: boolean;
  
  /** Enable Long Tasks monitoring */
  enableLongTasks?: boolean;
  
  /** Enable Navigation timing monitoring */
  enableNavigationTiming?: boolean;
  
  /** Custom sampling rate for metrics collection (ms) */
  samplingRate?: number;
} 