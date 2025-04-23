import { logger } from '../utils/logger';
/**
 * 长任务监控观察者
 * 负责监控并收集页面中的长任务（Long Tasks）信息
 */
export class LongTasksObserver {
    /**
     * 创建长任务观察者实例
     * @param options 长任务观察者配置
     */
    constructor(options) {
        this.observer = null;
        this.longTasks = [];
        this.onUpdate = options.onUpdate;
        this.options = {
            enabled: options.enabled !== undefined ? options.enabled : true,
            threshold: options.threshold || 50, // 默认50毫秒
            maxEntries: options.maxEntries || 100,
            ...options
        };
        logger.debug('长任务观察者已创建，配置:', {
            enabled: this.options.enabled,
            threshold: this.options.threshold,
            maxEntries: this.options.maxEntries
        });
    }
    /**
     * 开始监控长任务
     */
    start() {
        logger.info('开始长任务监控');
        try {
            this.observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                let newTasksCount = 0;
                for (const entry of entries) {
                    // 检查任务持续时间是否超过阈值
                    if (entry.duration < (this.options.threshold || 50)) {
                        continue;
                    }
                    const attribution = this.getAttribution(entry);
                    const longTask = {
                        duration: entry.duration,
                        startTime: entry.startTime,
                        attribution,
                        timestamp: new Date().getTime(),
                        metric: 'longTasks'
                    };
                    this.longTasks.push(longTask);
                    newTasksCount++;
                    logger.debug('检测到长任务:', {
                        duration: `${entry.duration.toFixed(2)}ms`,
                        source: attribution || 'unknown'
                    });
                    // 如果超过最大条目数，移除最旧的
                    const maxEntries = this.options.maxEntries || 100;
                    if (this.longTasks.length > maxEntries) {
                        this.longTasks.shift();
                        logger.debug('超出最大长任务记录数，移除最旧的条目');
                    }
                }
                if (newTasksCount > 0) {
                    logger.info(`检测到${newTasksCount}个新的长任务，总计${this.longTasks.length}个`);
                    this.onUpdate(this.longTasks);
                    this.longTasks = [];
                }
            });
            this.observer.observe({ type: 'longtask', buffered: true });
            logger.debug('长任务观察者已启动，阈值为', this.options.threshold, 'ms');
        }
        catch (error) {
            logger.error('长任务监控不受支持', error);
        }
    }
    /**
     * 停止监控长任务
     */
    stop() {
        logger.info('停止长任务监控');
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
            logger.debug('长任务观察者已断开连接');
        }
    }
    /**
     * 获取收集到的长任务数据
     */
    getLongTasks() {
        return this.longTasks;
    }
    /**
     * 清除收集到的长任务数据
     */
    clearLongTasks() {
        const count = this.longTasks.length;
        this.longTasks = [];
        logger.info(`清除了${count}个长任务记录`);
    }
    /**
     * 获取长任务的归属信息
     */
    getAttribution(entry) {
        // Try to get attribution from the entry if available
        if ('attribution' in entry) {
            const attribution = entry.attribution;
            if (Array.isArray(attribution) && attribution.length > 0) {
                const attributionEntry = attribution[0];
                if (attributionEntry.containerName) {
                    return attributionEntry.containerName;
                }
                else if (attributionEntry.containerSrc) {
                    return attributionEntry.containerSrc;
                }
                else if (attributionEntry.containerId) {
                    return attributionEntry.containerId;
                }
                else if (attributionEntry.containerType) {
                    return attributionEntry.containerType;
                }
            }
        }
        return 'unknown';
    }
}
//# sourceMappingURL=long-tasks.js.map