import { CoreWebVitalsObserverOptions } from './web-vitals/types';
/**
 * 核心Web指标观察者
 * 负责监控所有Core Web Vitals指标
 */
export declare class CoreWebVitalsObserver {
    private metrics;
    private onUpdate;
    private options;
    private fcpObserver;
    private lcpObserver;
    private fidObserver;
    private clsObserver;
    private inpObserver;
    constructor(options: CoreWebVitalsObserverOptions);
    /**
     * 开始监控所有核心Web指标
     */
    start(): void;
    /**
     * 停止所有监控
     */
    stop(): void;
    /**
     * 发送指标更新通知
     */
    private notifyMetricsUpdate;
    /**
     * 启动FCP监测
     */
    private startFCPMonitoring;
    /**
     * 启动LCP监测
     */
    private startLCPMonitoring;
    /**
     * 启动FID监测
     */
    private startFIDMonitoring;
    /**
     * 启动CLS监测
     */
    private startCLSMonitoring;
    /**
     * 启动INP监测
     */
    private startINPMonitoring;
}
