import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
/**
 * Largest Contentful Paint (LCP) 观察者
 * 负责测量页面最大内容绘制时间
 * 重新实现基于Google Web Vitals库 (https://github.com/GoogleChrome/web-vitals)
 */
export declare class LCPObserver extends BaseObserver {
    private lcpObserver;
    private static readonly LCP_GOOD_THRESHOLD;
    private static readonly LCP_NEEDS_IMPROVEMENT_THRESHOLD;
    private firstHiddenTime;
    private metricReported;
    constructor(options: ObserverOptions);
    /**
     * 获取页面首次隐藏的时间
     */
    private initFirstHiddenTime;
    /**
     * 设置监听页面首次隐藏的事件
     */
    private setupFirstHiddenTimeListener;
    /**
     * 获取激活开始时间
     */
    private getActivationStart;
    /**
     * 实现观察LCP的方法
     */
    protected observe(): void;
    /**
     * 为LCP指标分配评级
     */
    private assignLCPRating;
    /**
     * 启动LCP监控
     */
    private startLCPMonitoring;
    /**
     * 设置停止监听的各种条件
     */
    private setupStopListening;
    /**
     * 停止LCP观察
     */
    stop(): void;
    /**
     * 页面可见性变化时的回调
     * @param isVisible 页面是否可见
     */
    protected onVisibilityChange(isVisible: boolean): void;
    /**
     * BFCache恢复处理
     * 在bfcache恢复后重新计算从恢复到当前的时间差作为新的LCP
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
