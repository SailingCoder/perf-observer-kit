import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
/**
 * First Contentful Paint (FCP) 观察者
 * 负责测量页面首次内容绘制时间
 */
export declare class FCPObserver extends BaseObserver {
    private fcpObserver;
    constructor(options: ObserverOptions);
    /**
     * 实现观察FCP的方法
     */
    protected observe(): void;
    /**
     * 停止FCP观察
     */
    stop(): void;
    /**
     * BFCache恢复处理
     * FCP通常不需要在bfcache恢复时重新计算
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
