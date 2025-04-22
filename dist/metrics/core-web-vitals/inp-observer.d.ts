import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
/**
 * Interaction to Next Paint (INP) 观察者
 * 负责测量页面交互响应性能
 */
export declare class INPObserver extends BaseObserver {
    private inpObserver;
    constructor(options: ObserverOptions);
    /**
     * 实现观察INP的方法
     */
    protected observe(): void;
    /**
     * 停止INP观察
     */
    stop(): void;
    /**
     * BFCache恢复处理
     * 重置INP监测
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
