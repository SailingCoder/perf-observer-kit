import { NavigationMetrics } from '../types';
import { NavigationTimingObserverOptions } from './web-vitals/types';
/**
 * 导航计时观察者
 * 负责监控页面导航过程中的性能指标，包括TTFB等
 */
export declare class NavigationTimingObserver {
    private observer;
    private metrics;
    private onUpdate;
    private options;
    /**
     * 创建导航计时观察者实例
     * @param options 导航计时观察者配置
     */
    constructor(options: NavigationTimingObserverOptions);
    /**
     * 开始监控导航计时性能
     */
    start(): void;
    /**
     * 停止监控导航计时性能
     */
    stop(): void;
    /**
     * 获取导航计时指标
     */
    getMetrics(): NavigationMetrics;
    /**
     * 收集初始导航计时数据
     */
    private collectInitialNavigationTiming;
    /**
     * 创建带评级的指标数据
     * @param name 指标名称
     * @param value 指标值
     * @param timestamp 时间戳
     * @param thresholds 评级阈值 [good, needs-improvement]
     * @returns 格式化的指标数据对象
     */
    private createMetric;
    /**
     * 处理导航性能条目
     */
    private processNavigationEntry;
}
