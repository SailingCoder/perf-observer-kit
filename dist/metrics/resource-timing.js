import { NetworkMetricsCollector } from '../utils/network-metrics';
import { calculateTimeDelta } from '../utils/time';
import { logger } from '../utils/logger';
/**
 * 资源计时观察者
 * 监控并收集页面资源加载性能指标
 */
export class ResourceTimingObserver {
    /**
     * 创建资源计时观察者实例
     * @param onUpdate 当收集到新资源时的回调函数
     * @param excludedPatterns 要排除的资源URL模式
     * @param allowedResourceTypes 允许监控的资源类型
     */
    constructor(onUpdate, excludedPatterns = [], allowedResourceTypes) {
        this.observer = null;
        this.resources = [];
        this.excludedPatterns = [];
        this.allowedResourceTypes = ['script', 'link', 'img', 'css', 'font'];
        this.onUpdate = onUpdate;
        this.excludedPatterns = excludedPatterns;
        if (allowedResourceTypes === null || allowedResourceTypes === void 0 ? void 0 : allowedResourceTypes.length) {
            this.allowedResourceTypes = allowedResourceTypes;
        }
        logger.debug('资源计时观察者已创建', {
            excludedPatterns: this.excludedPatterns.length,
            allowedResourceTypes: this.allowedResourceTypes
        });
    }
    /**
     * 开始监控资源加载性能
     */
    start() {
        logger.info('开始监控资源加载性能');
        if (typeof PerformanceObserver === 'undefined') {
            logger.warn('PerformanceObserver API不可用，无法监控资源加载性能');
            return;
        }
        try {
            this.observer = new PerformanceObserver(this.handleEntries.bind(this));
            this.observer.observe({ type: 'resource', buffered: true });
            logger.debug('资源计时观察者已启动');
        }
        catch (error) {
            logger.error('资源计时监控不支持', error);
        }
    }
    /**
     * 处理性能观察者捕获的条目
     */
    handleEntries(entryList) {
        const entries = entryList.getEntries();
        let hasNewEntries = false;
        let newEntriesCount = 0;
        for (const entry of entries) {
            if (entry.entryType !== 'resource')
                continue;
            const resourceEntry = entry;
            // 应用过滤逻辑
            if (!this.shouldProcessEntry(resourceEntry))
                continue;
            // 构建资源指标并添加到集合
            const resourceMetric = this.buildResourceMetric(resourceEntry);
            this.resources.push(resourceMetric);
            hasNewEntries = true;
            newEntriesCount++;
            logger.debug('记录资源性能指标:', {
                type: resourceEntry.initiatorType,
                url: this.shortenUrl(resourceEntry.name),
                size: `${(resourceEntry.transferSize / 1024).toFixed(2)}KB`,
                duration: `${resourceEntry.duration.toFixed(2)}ms`
            });
        }
        // 只有在有新条目时才触发更新
        if (hasNewEntries) {
            logger.info(`新增${newEntriesCount}个资源性能指标，总计${this.resources.length}个`);
            this.onUpdate(this.resources);
            this.resources = [];
        }
    }
    /**
     * 判断是否应该处理资源条目
     */
    shouldProcessEntry(resourceEntry) {
        // 检查资源类型是否允许监控
        if (!this.allowedResourceTypes.includes(resourceEntry.initiatorType)) {
            logger.debug('忽略不在允许类型中的资源:', resourceEntry.initiatorType, this.shortenUrl(resourceEntry.name));
            return false;
        }
        // 检查是否在排除列表中
        if (this.isExcluded(resourceEntry.name)) {
            logger.debug('忽略在排除列表中的资源:', this.shortenUrl(resourceEntry.name));
            return false;
        }
        // 检查是否为重复条目
        const isDuplicate = this.resources.some(r => r.url === resourceEntry.name && r.startTime === resourceEntry.startTime);
        if (isDuplicate) {
            logger.debug('忽略重复的资源:', this.shortenUrl(resourceEntry.name));
        }
        return !isDuplicate;
    }
    /**
     * 从资源条目构建资源指标对象
     */
    buildResourceMetric(resourceEntry) {
        // 计算时间指标
        const dnsTime = calculateTimeDelta(resourceEntry.domainLookupEnd, resourceEntry.domainLookupStart);
        const tcpTime = calculateTimeDelta(resourceEntry.connectEnd, resourceEntry.connectStart);
        const sslTime = resourceEntry.secureConnectionStart > 0
            ? calculateTimeDelta(resourceEntry.connectEnd, resourceEntry.secureConnectionStart)
            : 0;
        const ttfb = calculateTimeDelta(resourceEntry.responseStart, resourceEntry.requestStart);
        const requestTime = calculateTimeDelta(resourceEntry.responseStart, resourceEntry.fetchStart);
        const responseTime = calculateTimeDelta(resourceEntry.responseEnd, resourceEntry.responseStart);
        // 获取网络信息
        const networkMetrics = NetworkMetricsCollector.getNetworkInformation();
        return {
            url: resourceEntry.name,
            initiatorType: resourceEntry.initiatorType,
            startTime: resourceEntry.startTime,
            duration: resourceEntry.duration,
            transferSize: resourceEntry.transferSize,
            decodedBodySize: resourceEntry.decodedBodySize,
            encodedSize: resourceEntry.encodedBodySize || undefined,
            responseEnd: resourceEntry.responseEnd,
            ttfb,
            dnsTime,
            tcpTime,
            sslTime,
            requestTime,
            responseTime,
            networkMetrics,
            timestamp: new Date().getTime(),
            metric: 'resources'
        };
    }
    /**
     * 检查资源URL是否应被排除
     */
    isExcluded(url) {
        if (!this.excludedPatterns.length) {
            return false;
        }
        return this.excludedPatterns.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(url);
            }
            return url.includes(pattern);
        });
    }
    /**
     * 停止资源性能监控
     */
    stop() {
        logger.info('停止资源性能监控');
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
            logger.debug('资源计时观察者已断开连接');
        }
    }
    /**
     * 获取收集到的资源性能指标
     */
    getResources() {
        return this.resources;
    }
    /**
     * 清除已收集的资源性能指标
     */
    clearResources() {
        const count = this.resources.length;
        this.resources = [];
        logger.info(`清除了${count}个资源性能指标`);
        if (typeof performance !== 'undefined' &&
            typeof performance.clearResourceTimings === 'function') {
            performance.clearResourceTimings();
            logger.debug('清除了浏览器性能条目缓存');
        }
    }
    /**
     * 截断URL以便于日志输出
     * @param url 完整URL
     * @returns 截断后的URL
     */
    shortenUrl(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            // 只返回主机名和路径名的最后部分
            return urlObj.hostname + pathname.substring(pathname.lastIndexOf('/'));
        }
        catch (e) {
            // 如果URL解析失败，则返回截断后的URL
            return url.length > 40 ? url.substring(0, 25) + '...' + url.substring(url.length - 12) : url;
        }
    }
}
//# sourceMappingURL=resource-timing.js.map