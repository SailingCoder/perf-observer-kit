import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
/**
 * Largest Contentful Paint (LCP) 观察者
 * 负责测量页面最大内容绘制时间
 */
export declare class LCPObserver extends BaseObserver {
    private lcpObserver;
    constructor(options: ObserverOptions);
    /**
     * 实现观察LCP的方法
     */
    protected observe(): void;
    /**
     * 启动LCP监控
     */
    private startLCPMonitoring;
    /**
     * 停止LCP观察
     */
    stop(): void;
    /**
     * BFCache恢复处理
     * 在bfcache恢复后重新计算从恢复到当前的时间差作为新的LCP
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
