import { LongTaskMetrics } from '../types';
import { LongTasksObserverOptions } from './web-vitals/types';
/**
 * 长任务监控观察者
 * 负责监控并收集页面中的长任务（Long Tasks）信息
 */
export declare class LongTasksObserver {
    private observer;
    private longTasks;
    private onUpdate;
    private options;
    /**
     * 创建长任务观察者实例
     * @param options 长任务观察者配置
     */
    constructor(options: LongTasksObserverOptions);
    /**
     * 开始监控长任务
     */
    start(): void;
    /**
     * 停止监控长任务
     */
    stop(): void;
    /**
     * 获取收集到的长任务数据
     */
    getLongTasks(): LongTaskMetrics[];
    /**
     * 清除收集到的长任务数据
     */
    clearLongTasks(): void;
    /**
     * 获取长任务的归属信息
     */
    private getAttribution;
}
