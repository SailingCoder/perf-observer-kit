import { BrowserInfo } from './browser-info-types';
/**
 * 指标类型枚举
 */
export declare enum MetricType {
    WEB_VITALS = "coreWebVitals",
    RESOURCES = "resources",
    LONG_TASKS = "longTasks",
    NAVIGATION = "navigation",
    BROWSER_INFO = "browserInfo"
}
/**
 * 基础性能指标数据
 */
export interface MetricData {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    url?: string;
    rating?: MetricRating;
    context?: Record<string, any>;
    networkMetrics?: {
        downlink?: number;
        effectiveType?: string;
        rtt?: number;
        saveData?: boolean;
    };
}
/**
 * 性能指标评级
 */
export type MetricRating = 'good' | 'needs-improvement' | 'poor';
/**
 * 核心Web指标数据
 */
export interface CoreWebVitalsMetrics {
    fcp?: MetricData;
    lcp?: MetricData;
    fid?: MetricData;
    cls?: MetricData;
    inp?: MetricData;
}
/**
 * 资源加载指标数据
 */
export interface ResourceMetrics {
    name: string;
    initiatorType: string;
    startTime: number;
    duration: number;
    transferSize?: number;
    decodedBodySize?: number;
    encodedSize?: number;
    responseEnd: number;
    ttfb?: number;
    dnsTime?: number;
    tcpTime?: number;
    sslTime?: number;
    requestTime?: number;
    responseTime?: number;
    code?: number;
    networkMetrics?: {
        downlink?: number;
        effectiveType?: string;
        rtt?: number;
        saveData?: boolean;
    };
    timestamp?: number;
    metric?: string;
}
/**
 * 长任务指标数据
 */
export interface LongTaskMetrics {
    duration: number;
    startTime: number;
    attribution?: string;
    timestamp?: number;
    metric?: string;
}
/**
 * 导航计时指标数据
 */
export interface NavigationMetrics {
    ttfb?: number;
    domContentLoaded?: number;
    loadEvent?: number;
    processingTime?: number;
    dnsTime?: number;
    tcpTime?: number;
    sslTime?: number;
    requestTime?: number;
    responseTime?: number;
    loadEventDuration?: number;
    totalLoadTime?: number;
    resourceFetchTime?: number;
    url?: string;
    networkInfo?: {
        downlink?: number;
        effectiveType?: string;
        rtt?: number;
        saveData?: boolean;
    };
    timestamp?: number;
    rawTiming?: Record<string, any>;
    complete?: boolean;
}
/**
 * 所有性能指标数据集合
 */
export interface PerformanceMetrics {
    coreWebVitals: CoreWebVitalsMetrics;
    resources: ResourceMetrics[];
    longTasks: LongTaskMetrics[];
    navigation: NavigationMetrics;
    browserInfo: BrowserInfo;
}
