import { NavigationMetrics } from '../types';
import { NavigationObserverOptions } from './web-vitals/types';
/**
 * 导航计时观察者
 * 用于收集页面加载相关的导航计时性能指标
 */
export declare class NavigationObserver {
    private metrics;
    private started;
    private hasReportedMetrics;
    private onUpdate;
    private options;
    /**
     * 创建导航计时观察者实例
     * @param options 配置选项
     */
    constructor(options: NavigationObserverOptions);
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
     * 收集导航计时数据
     */
    private collectNavigationTiming;
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
     * 计算所有导航时间指标
     * @param entry 导航性能条目
     * @returns 计算后的时间指标
     */
    private calculateTimingMetrics;
    /**
     * 处理导航性能条目
     */
    private processNavigationEntry;
}
