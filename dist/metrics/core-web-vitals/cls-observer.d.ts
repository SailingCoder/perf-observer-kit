import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
/**
 * Cumulative Layout Shift (CLS) 观察者
 * 负责测量页面累积布局偏移量
 */
export declare class CLSObserver extends BaseObserver {
    private clsObserver;
    private sessionValue;
    private sessionEntries;
    private prevSessionValue;
    constructor(options: ObserverOptions);
    /**
     * 实现观察CLS的方法
     */
    protected observe(): void;
    /**
     * 停止CLS观察
     */
    stop(): void;
    /**
     * BFCache恢复处理
     * CLS应该重置累积值
     */
    protected onBFCacheRestore(event: PageTransitionEvent): void;
}
