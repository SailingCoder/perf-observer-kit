import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
/**
 * First Contentful Paint (FCP) 观察者
 * 负责测量页面首次内容绘制时间
 * 重新实现基于Google Web Vitals库 (https://github.com/GoogleChrome/web-vitals)
 */
export declare class FCPObserver extends BaseObserver {
    private fcpObserver;
    private static readonly FCP_GOOD_THRESHOLD;
    private static readonly FCP_NEEDS_IMPROVEMENT_THRESHOLD;
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
     * 为FCP指标分配评级
     */
    private assignFCPRating;
    /**
     * 实现观察FCP的方法
     */
    protected observe(): void;
    /**
     * 停止FCP观察
     */
    stop(): void;
    /**
     * 页面可见性变化时的回调
     * @param isVisible 页面是否可见
     */
    protected onVisibilityChange(isVisible: boolean): void;
    /**
     * BFCache恢复处理
     * 在bfcache恢复后，使用双RAF测量时间为新的FCP值
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
