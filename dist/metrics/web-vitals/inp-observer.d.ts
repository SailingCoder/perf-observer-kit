import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
/**
 * Interaction to Next Paint (INP) 观察者
 * 负责测量页面交互响应性能
 * 实现基于 Google Web Vitals 推荐方法
 */
export declare class INPObserver extends BaseObserver {
    private inpObserver;
    private static readonly INP_GOOD_THRESHOLD;
    private static readonly INP_NEEDS_IMPROVEMENT_THRESHOLD;
    private firstHiddenTime;
    private interactionEvents;
    private lastReportedINP;
    private minReportingChange;
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
     * 为INP指标分配评级
     */
    private assignINPRating;
    /**
     * 实现观察INP的方法
     */
    protected observe(): void;
    /**
     * 计算INP（交互到下一次绘制）值
     * 使用Google推荐的方法（取第75百分位数）
     */
    private calculateINP;
    /**
     * 计算并报告INP值，如果值有显著变化
     */
    private calculateAndReportINP;
    /**
     * 停止INP观察
     */
    stop(): void;
    /**
     * 页面可见性变化时的回调
     * @param isVisible 页面是否可见
     */
    protected onVisibilityChange(isVisible: boolean): void;
    /**
     * BFCache恢复处理
     * 重置INP监测
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
