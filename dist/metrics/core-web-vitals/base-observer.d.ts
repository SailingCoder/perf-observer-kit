import { MetricData } from '../../types';
import { ObserverOptions, VisibilityChangeHandler, UserInteractionHandler, PageshowHandler } from './types';
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
     * BFCache恢复处理 - 由子类重写
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
