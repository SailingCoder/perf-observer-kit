import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
/**
 * First Input Delay (FID) 观察者
 * 负责测量页面首次输入延迟时间
 */
export declare class FIDObserver extends BaseObserver {
    private fidObserver;
    constructor(options: ObserverOptions);
    /**
     * 实现观察FID的方法
     */
    protected observe(): void;
    /**
     * 停止FID观察
     */
    stop(): void;
    /**
     * BFCache恢复处理
     * FID通常不需要在bfcache恢复时重新计算
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
