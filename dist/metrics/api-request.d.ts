import { ApiRequestMetrics } from '../types';
declare global {
    interface XMLHttpRequest {
        __perfObserverMethod?: string;
        __perfObserverUrl?: string;
    }
}
/**
 * API请求性能监控
 * 用于拦截和监控XMLHttpRequest和Fetch API的性能
 */
export declare class ApiRequestObserver {
    private requests;
    private onUpdate;
    private originalXhrOpen;
    private originalXhrSend;
    private originalFetch;
    constructor(onUpdate: (requests: ApiRequestMetrics[]) => void);
    /**
     * 开始监控API请求
     */
    start(): void;
    /**
     * 停止监控API请求
     */
    stop(): void;
    /**
     * 获取收集的API请求数据
     */
    getRequests(): ApiRequestMetrics[];
    /**
     * 清除收集的API请求数据
     */
    clearRequests(): void;
    /**
     * 监控XMLHttpRequest
     */
    private monitorXhr;
    /**
     * 监控Fetch API
     */
    private monitorFetch;
    /**
     * 恢复原始XMLHttpRequest
     */
    private restoreXhr;
    /**
     * 恢复原始Fetch
     */
    private restoreFetch;
    /**
     * 添加API请求记录
     */
    private addRequest;
}
