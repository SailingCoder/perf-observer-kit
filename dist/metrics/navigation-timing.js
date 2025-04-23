import { calculateTime } from '../utils/time';
import { NetworkMetricsCollector } from '../utils/network-metrics';
import { logger } from '../utils/logger';
/**
 * 导航计时观察者
 * 负责监控页面导航过程中的性能指标，包括TTFB等
 */
export class NavigationTimingObserver {
    /**
     * 创建导航计时观察者实例
     * @param options 导航计时观察者配置
     */
    constructor(options) {
        this.metrics = {};
        this.started = false;
        this.hasReportedMetrics = false;
        this.onUpdate = options.onUpdate;
        this.options = {
            enabled: true,
            includeRawTiming: false,
            ...options
        };
        logger.debug('导航计时观察者已创建，配置:', {
            enabled: this.options.enabled,
            includeRawTiming: this.options.includeRawTiming
        });
    }
    /**
     * 开始监控导航计时性能
     */
    start() {
        if (!this.options.enabled || this.started || this.hasReportedMetrics) {
            return;
        }
        this.started = true;
        // 如果页面已经加载完成，直接获取性能指标
        if (document.readyState === 'complete') {
            this.collectNavigationTiming();
        }
        else {
            // 页面加载完成后获取性能指标
            window.addEventListener('load', () => {
                // 延迟一点采集，确保数据完整
                setTimeout(() => this.collectNavigationTiming(), 100);
            });
        }
        logger.debug('导航计时观察者已启动');
    }
    /**
     * 停止监控导航计时性能
     */
    stop() {
        logger.info('停止导航计时性能监控');
        this.started = false;
    }
    /**
     * 获取导航计时指标
     */
    getMetrics() {
        return this.metrics;
    }
    /**
     * 收集导航计时数据
     */
    collectNavigationTiming() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const navEntries = performance.getEntriesByType('navigation');
            if (navEntries && navEntries.length > 0) {
                // 获取最后一次导航记录
                const entry = navEntries[navEntries.length - 1];
                this.processNavigationEntry(entry);
                // 收集完指标后停止
                if (this.hasReportedMetrics) {
                    this.stop();
                }
            }
            else {
                logger.warn('未找到导航性能条目');
            }
        }
        else {
            logger.warn('浏览器不支持Performance API或getEntriesByType方法');
        }
    }
    /**
     * 创建带评级的指标数据
     * @param name 指标名称
     * @param value 指标值
     * @param timestamp 时间戳
     * @param thresholds 评级阈值 [good, needs-improvement]
     * @returns 格式化的指标数据对象
     */
    createMetric(name, value, timestamp, thresholds) {
        // 确保值为数字且非负
        const safeValue = typeof value === 'number' ? Math.max(0, value) : 0;
        const metric = {
            name,
            value: safeValue,
            unit: 'ms',
            timestamp
        };
        // 如果提供了阈值，添加评级
        if (thresholds && (thresholds[0] > 0 || thresholds[1] > 0)) {
            if (safeValue <= thresholds[0]) {
                metric.rating = 'good';
            }
            else if (safeValue <= thresholds[1]) {
                metric.rating = 'needs-improvement';
            }
            else {
                metric.rating = 'poor';
            }
        }
        // 添加网络上下文信息
        metric.context = NetworkMetricsCollector.getNetworkContext();
        return metric;
    }
    /**
     * 计算所有导航时间指标
     * @param entry 导航性能条目
     * @returns 计算后的时间指标
     */
    calculateTimingMetrics(entry) {
        return {
            // 卸载前一个页面的时间
            unloadTime: calculateTime(entry.unloadEventEnd, entry.unloadEventStart),
            // 重定向时间
            redirectTime: calculateTime(entry.redirectEnd, entry.redirectStart),
            // Service Worker时间
            serviceWorkerTime: entry.workerStart > 0
                ? calculateTime(entry.workerStart, entry.fetchStart)
                : undefined,
            // 应用缓存检查时间
            appCacheTime: calculateTime(entry.domainLookupStart, entry.fetchStart),
            // DNS查找时间
            dnsTime: calculateTime(entry.domainLookupEnd, entry.domainLookupStart),
            // TCP连接时间
            tcpTime: calculateTime(entry.connectEnd, entry.connectStart),
            // SSL协商时间（如果适用）
            sslTime: entry.secureConnectionStart > 0
                ? calculateTime(entry.connectEnd, entry.secureConnectionStart)
                : undefined,
            // 请求发送时间
            requestTime: calculateTime(entry.responseStart, entry.requestStart),
            // TTFB: 从请求开始到收到第一个字节的时间
            ttfb: calculateTime(entry.responseStart, entry.requestStart),
            // 资源获取总时间（包括DNS解析、TCP连接、请求发送和接收第一个字节）
            resourceFetchTime: calculateTime(entry.responseStart, entry.fetchStart),
            // 响应时间: 从收到第一个字节到完全接收响应的时间
            responseTime: calculateTime(entry.responseEnd, entry.responseStart),
            // DOM初始化时间
            initDOMTime: calculateTime(entry.domInteractive, entry.responseEnd),
            // DOM处理时间
            processingTime: calculateTime(entry.domComplete, entry.domInteractive),
            // 内容加载时间
            contentLoadTime: calculateTime(entry.domContentLoadedEventEnd, entry.domContentLoadedEventStart),
            // DOM内容加载完成时间（从导航开始）
            domContentLoaded: calculateTime(entry.domContentLoadedEventEnd, entry.startTime),
            // load事件处理时间
            loadEventDuration: calculateTime(entry.loadEventEnd, entry.loadEventStart),
            // 前端总渲染时间
            frontEndTime: calculateTime(entry.loadEventEnd, entry.responseEnd),
            // 总加载时间（从导航开始到load事件结束）
            totalLoadTime: calculateTime(entry.loadEventEnd, entry.startTime)
        };
    }
    /**
     * 处理导航性能条目
     */
    processNavigationEntry(entry) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // 计算所有时间指标
        const timingMetrics = this.calculateTimingMetrics(entry);
        // 获取网络信息
        const networkInfo = NetworkMetricsCollector.getNetworkInformation();
        // 获取当前页面URL
        const pageUrl = typeof window !== 'undefined' ? window.location.href : entry.name;
        // 记录关键性能指标
        logger.debug('计算导航计时指标:', {
            url: entry.name,
            ttfb: `${((_a = timingMetrics.ttfb) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || 0}ms`,
            domContentLoaded: `${((_b = timingMetrics.domContentLoaded) === null || _b === void 0 ? void 0 : _b.toFixed(2)) || 0}ms`,
            loadEventDuration: `${((_c = timingMetrics.loadEventDuration) === null || _c === void 0 ? void 0 : _c.toFixed(2)) || 0}ms`,
            totalLoadTime: `${((_d = timingMetrics.totalLoadTime) === null || _d === void 0 ? void 0 : _d.toFixed(2)) || 0}ms`
        });
        // 整合所有指标
        this.metrics = {
            ...timingMetrics, // 添加所有计算的时间指标
            url: pageUrl,
            networkInfo,
            timestamp: new Date().getTime(),
            complete: true // 标记这是一个完整的导航指标
        };
        // 根据配置决定是否包含原始计时数据
        if (this.options.includeRawTiming) {
            // 创建一个更高效的原始计时数据对象
            this.metrics.rawTiming = {
                navigationStart: entry.startTime,
                unloadEventStart: entry.unloadEventStart,
                unloadEventEnd: entry.unloadEventEnd,
                redirectStart: entry.redirectStart,
                redirectEnd: entry.redirectEnd,
                fetchStart: entry.fetchStart,
                domainLookupStart: entry.domainLookupStart,
                domainLookupEnd: entry.domainLookupEnd,
                connectStart: entry.connectStart,
                connectEnd: entry.connectEnd,
                secureConnectionStart: entry.secureConnectionStart,
                requestStart: entry.requestStart,
                responseStart: entry.responseStart,
                responseEnd: entry.responseEnd,
                domInteractive: entry.domInteractive,
                domContentLoadedEventStart: entry.domContentLoadedEventStart,
                domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
                domComplete: entry.domComplete,
                loadEventStart: entry.loadEventStart,
                loadEventEnd: entry.loadEventEnd,
                type: entry.type,
                redirectCount: entry.redirectCount,
            };
        }
        logger.info('导航计时指标已更新:', {
            url: pageUrl.split('?')[0], // 移除查询参数以避免日志过长
            ttfb: `${((_e = timingMetrics.ttfb) === null || _e === void 0 ? void 0 : _e.toFixed(2)) || 0}ms`,
            domContentLoaded: `${((_f = timingMetrics.domContentLoaded) === null || _f === void 0 ? void 0 : _f.toFixed(2)) || 0}ms`,
            loadEventDuration: `${((_g = timingMetrics.loadEventDuration) === null || _g === void 0 ? void 0 : _g.toFixed(2)) || 0}ms`,
            totalLoadTime: `${((_h = timingMetrics.totalLoadTime) === null || _h === void 0 ? void 0 : _h.toFixed(2)) || 0}ms`
        });
        this.onUpdate(this.metrics);
        this.hasReportedMetrics = true;
    }
}
//# sourceMappingURL=navigation-timing.js.map