import { ResourceMetrics } from '../types';
/**
 * 资源计时观察者
 * 监控并收集页面资源加载性能指标
 */
export declare class ResourceTimingObserver {
    private observer;
    private resources;
    private onUpdate;
    private excludedPatterns;
    private allowedResourceTypes;
    /**
     * 创建资源计时观察者实例
     * @param onUpdate 当收集到新资源时的回调函数
     * @param excludedPatterns 要排除的资源URL模式
     * @param allowedResourceTypes 允许监控的资源类型
     */
    constructor(onUpdate: (resources: ResourceMetrics[]) => void, excludedPatterns?: (string | RegExp)[], allowedResourceTypes?: string[]);
    /**
     * 开始监控资源加载性能
     */
    start(): void;
    /**
     * 处理性能观察者捕获的条目
     */
    private handleEntries;
    /**
     * 判断是否应该处理资源条目
     */
    private shouldProcessEntry;
    /**
     * 从资源条目构建资源指标对象
     */
    private buildResourceMetric;
    /**
     * 检查资源URL是否应被排除
     */
    private isExcluded;
    /**
     * 停止资源性能监控
     */
    stop(): void;
    /**
     * 获取收集到的资源性能指标
     */
    getResources(): ResourceMetrics[];
    /**
     * 清除已收集的资源性能指标
     */
    clearResources(): void;
    /**
     * 截断URL以便于日志输出
     * @param url 完整URL
     * @returns 截断后的URL
     */
    private shortenUrl;
}
