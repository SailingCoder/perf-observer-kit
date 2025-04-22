import { MetricData } from '../../types';
import { ObserverOptions, VisibilityChangeHandler, UserInteractionHandler, PageshowHandler, NetworkInformation } from './types';
/**
 * 基础观察者类
 * 提供所有Web指标观察者共享的功能
 */
export declare abstract class BaseObserver {
    protected observer: PerformanceObserver | null;
    protected onUpdate: (metrics: MetricData) => void;
    protected isPageVisible: boolean;
    protected userHasInteracted: boolean;
    protected visibilityChangeHandler: VisibilityChangeHandler;
    protected userInteractionHandler: UserInteractionHandler;
    protected pageshowHandler: PageshowHandler;
    constructor(options: ObserverOptions);
    /**
     * 启动观察
     */
    start(): void;
    /**
     * 停止观察
     */
    stop(): void;
    /**
     * 具体的观察实现 - 由子类重写
     */
    protected abstract observe(): void;
    /**
     * 清理事件监听器
     */
    protected cleanupEventListeners(): void;
    /**
     * 设置页面可见性跟踪
     */
    protected setupVisibilityTracking(): void;
    /**
     * 设置用户交互跟踪
     */
    protected setupUserInteractionTracking(): void;
    /**
     * 设置bfcache恢复监听
     */
    protected setupPageshowListener(): void;
    /**
     * 获取网络状态信息
     * @returns 网络信息对象
     */
    protected getNetworkInformation(): NetworkInformation | undefined;
    /**
     * 获取完整的网络上下文
     * @param extraContext 额外的上下文信息
     * @returns 完整的上下文数据
     */
    protected getNetworkContext(extraContext?: Record<string, any>): Record<string, any>;
    /**
     * 计算两个时间点之间的差值，确保结果为非负
     * @param end 结束时间点
     * @param start 开始时间点
     * @returns 非负的时间差值
     */
    protected calculateTimeDelta(end: number, start: number): number;
    /**
     * 页面可见性变化时的回调 - 可由子类重写
     * @param isVisible 页面是否可见
     */
    protected onVisibilityChange(isVisible: boolean): void;
    /**
     * BFCache恢复处理 - 由子类重写
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
