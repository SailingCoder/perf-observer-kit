// 导入BrowserInfo类型
import { BrowserInfo } from './browser-info-types';

/**
 * 指标类型枚举
 */
export enum MetricType {
  WEB_VITALS = 'webVitals',
  RESOURCES = 'resources',
  LONG_TASKS = 'longTasks',
  NAVIGATION = 'navigation',
  BROWSER_INFO = 'browserInfo'
}

/**
 * 基础性能指标数据
 */
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
 * 核心Web指标数据
 */
export interface CoreWebVitalsMetrics {
  fcp?: MetricData; // 首次内容绘制
  lcp?: MetricData; // 最大内容绘制
  fid?: MetricData; // 首次输入延迟
  cls?: MetricData; // 累积布局偏移
  inp?: MetricData; // 交互到首次内容绘制
}

/**
 * 资源加载指标数据
 */
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

/**
 * 长任务指标数据
 */
export interface LongTaskMetrics {
  duration: number; // 任务持续时间
  startTime: number; // 任务开始时间
  attribution?: string; // 任务归属
}

/**
 * 导航计时指标数据
 */
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

/**
 * 所有性能指标数据集合
 */
export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitalsMetrics; // 核心Web性能指标
  resources: ResourceMetrics[]; // 资源加载性能指标
  longTasks: LongTaskMetrics[]; // 长任务性能指标
  navigation: NavigationMetrics; // 导航性能指标
  browserInfo: BrowserInfo; // 浏览器和设备信息
} 