import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
/**
 * Cumulative Layout Shift (CLS) 观察者
 * 负责测量页面布局稳定性
 * 使用 Google Web Vitals 推荐的会话窗口计算方法
 */
export declare class CLSObserver extends BaseObserver {
    private clsObserver;
    private static readonly CLS_GOOD_THRESHOLD;
    private static readonly CLS_NEEDS_IMPROVEMENT_THRESHOLD;
    private firstHiddenTime;
    private sessionEntries;
    private sessionValues;
    private sessionGap;
    private sessionMax;
    private prevReportedValue;
    private lastEntryTime;
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
     * 为CLS指标分配评级
     */
    private assignCLSRating;
    /**
     * 实现观察CLS的方法
     */
    protected observe(): void;
    /**
     * 更新CLS会话窗口
     * 使用Google推荐的会话窗口方法
     * @see https://web.dev/articles/evolving-cls
     */
    private updateSessionWindows;
    /**
     * 计算最终CLS值
     * 取所有会话窗口中的最大值
     */
    private calculateCLS;
    /**
     * 报告CLS指标
     */
    private reportCLS;
    /**
     * 停止CLS观察
     */
    stop(): void;
    /**
     * 页面可见性变化时的回调
     * @param isVisible 页面是否可见
     */
    protected onVisibilityChange(isVisible: boolean): void;
    /**
     * BFCache恢复处理
     * CLS应该重置累积值
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
