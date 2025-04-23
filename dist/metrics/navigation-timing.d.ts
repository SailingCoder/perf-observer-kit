import { NavigationMetrics } from '../types';
import { NavigationObserverOptions } from './web-vitals/types';
/**
 * 导航计时观察者
 * 收集页面加载性能指标，包括导航计时、网络信息等
 */
export declare class NavigationObserver {
    private metrics;
    private isStarted;
    private hasCollectedMetrics;
    private options;
    private metricsUpdateCallback;
    private perfObserver;
    private timeoutId;
    private readonly MAX_WAIT_TIME_MS;
    private readonly MAX_POLL_ATTEMPTS;
    private readonly POLL_INTERVAL_MS;
    constructor(options: NavigationObserverOptions);
    start(): void;
    stop(): void;
    /**
     * 获取收集到的导航性能指标
     */
    getMetrics(): NavigationMetrics;
    /**
     * 检查是否可以开始收集指标
     */
    private canStart;
    /**
     * 清理超时定时器
     */
    private clearTimeout;
    /**
     * 清理所有资源
     */
    private cleanupResources;
    /**
     * 使用传统方法开始收集导航性能数据
     */
    private startWithTraditionalMethod;
    /**
     * 通过轮询方式检查并获取导航性能数据
     */
    private pollForNavigationData;
    /**
     * 获取最新的导航性能条目
     */
    private getLatestNavigationEntry;
    /**
     * 收集导航计时数据
     */
    private collectNavigationData;
    /**
     * 判断load事件是否已完成
     */
    private isLoadEventComplete;
    /**
     * 处理导航性能条目，提取和计算指标
     */
    private processNavigationData;
}
