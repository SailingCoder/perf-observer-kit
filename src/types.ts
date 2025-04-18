export interface MetricData {
  name: string; // 指标名称
  value: number; // 指标值
  rating?: 'good' | 'needs-improvement' | 'poor'; // 指标评分
  unit?: string; // 指标单位
  timestamp: number; // 指标收集时间
}

export interface CoreWebVitalsMetrics {
  fcp?: MetricData; // 首次内容绘制
  lcp?: MetricData; // 最大内容绘制
  fid?: MetricData; // 首次输入延迟
  cls?: MetricData; // 累积布局偏移
  inp?: MetricData; // 交互到首次内容绘制
}

export interface ResourceMetrics {
  name: string; // 资源名称
  initiatorType: string; // 资源发起者类型
  startTime: number; // 资源开始时间
  duration: number; // 资源加载时间
  transferSize?: number; // 传输大小
  decodedBodySize?: number; // 解码后的大小
  responseEnd: number; // 响应结束时间
}

export interface LongTaskMetrics {
  duration: number; // 任务持续时间
  startTime: number; // 任务开始时间
  attribution?: string; // 任务归属
}

export interface NavigationMetrics {
  ttfb?: MetricData; // 首字节时间
  domContentLoaded?: MetricData; // 文档加载完成时间      
  loadEvent?: MetricData; // 页面加载完成时间
}

export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitalsMetrics; // 核心Web性能指标
  resources: ResourceMetrics[]; // 资源加载性能指标
  longTasks: LongTaskMetrics[]; // 长任务性能指标
  navigation: NavigationMetrics; // 导航性能指标
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
  enableNavigationTiming?: boolean; // 启用导航性能指标监控
  
  /** Custom sampling rate for metrics collection (ms) */
  samplingRate?: number; // 自定义指标收集采样率
} 