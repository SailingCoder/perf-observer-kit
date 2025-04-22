import { BaseObserver } from './base-observer';
import { logger } from '../../utils/logger';
/**
 * Largest Contentful Paint (LCP) 观察者
 * 负责测量页面最大内容绘制时间
 * 重新实现基于Google Web Vitals库 (https://github.com/GoogleChrome/web-vitals)
 */
export class LCPObserver extends BaseObserver {
    constructor(options) {
        super(options);
        this.lcpObserver = null;
        // 记录指标是否已上报
        this.metricReported = false;
        // 初始化首次隐藏时间
        this.firstHiddenTime = this.initFirstHiddenTime();
        // 监听visibility变化以更新首次隐藏时间
        this.setupFirstHiddenTimeListener();
    }
    /**
     * 获取页面首次隐藏的时间
     */
    initFirstHiddenTime() {
        // 如果页面已经是隐藏状态，返回0
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            return 0;
        }
        // 否则返回无限大，表示页面尚未隐藏
        return Infinity;
    }
    /**
     * 设置监听页面首次隐藏的事件
     */
    setupFirstHiddenTimeListener() {
        if (typeof document === 'undefined')
            return;
        const updateHiddenTime = () => {
            if (document.visibilityState === 'hidden' && this.firstHiddenTime === Infinity) {
                this.firstHiddenTime = performance.now();
                logger.debug(`记录页面首次隐藏时间: ${this.firstHiddenTime}ms`);
            }
        };
        // 监听页面visibility变化
        document.addEventListener('visibilitychange', updateHiddenTime, { once: true });
        // 页面卸载时也视为隐藏
        document.addEventListener('unload', updateHiddenTime, { once: true });
    }
    /**
     * 获取激活开始时间
     */
    getActivationStart() {
        if (typeof performance === 'undefined')
            return 0;
        const entries = performance.getEntriesByType('navigation');
        if (!entries || entries.length === 0)
            return 0;
        const navigationEntry = entries[0];
        // activationStart是非标准属性，在某些浏览器中可用
        const activationStart = navigationEntry === null || navigationEntry === void 0 ? void 0 : navigationEntry.activationStart;
        return activationStart ? activationStart : 0;
    }
    /**
     * 实现观察LCP的方法
     */
    observe() {
        this.startLCPMonitoring();
    }
    /**
     * 为LCP指标分配评级
     */
    assignLCPRating(value) {
        if (value <= LCPObserver.LCP_GOOD_THRESHOLD) {
            return 'good';
        }
        else if (value <= LCPObserver.LCP_NEEDS_IMPROVEMENT_THRESHOLD) {
            return 'needs-improvement';
        }
        else {
            return 'poor';
        }
    }
    /**
     * 启动LCP监控
     */
    startLCPMonitoring() {
        if (typeof PerformanceObserver === 'undefined') {
            logger.error('PerformanceObserver API不可用，无法监控LCP');
            return;
        }
        try {
            this.lcpObserver = new PerformanceObserver((entryList) => {
                // 获取所有entries，但如果不需要报告所有变化，只考虑最后一个
                const entries = entryList.getEntries();
                // 遍历entries（通常只有一个）
                entries.forEach(entry => {
                    // 只有当页面在LCP发生前未隐藏时才报告
                    if (entry.startTime < this.firstHiddenTime) {
                        // 计算LCP值，考虑activationStart（预渲染）
                        const lcpValue = Math.max(entry.startTime - this.getActivationStart(), 0);
                        // 创建LCP指标
                        const lcp = {
                            name: 'LCP',
                            value: lcpValue,
                            unit: 'ms',
                            timestamp: new Date().getTime(),
                            url: typeof window !== 'undefined' ? window.location.href : undefined,
                            networkMetrics: this.getNetworkInformation(),
                            context: {
                                elementId: entry.element ? entry.element.id || null : null,
                                elementTagName: entry.element ? entry.element.tagName || null : null,
                                elementType: entry.element ? entry.element.type || null : null,
                                size: entry.size || 0
                            }
                        };
                        // 设置评级
                        lcp.rating = this.assignLCPRating(lcp.value);
                        // 发送指标更新
                        this.onUpdate(lcp);
                    }
                    else {
                        logger.debug('页面在LCP前已隐藏，忽略此LCP事件');
                    }
                });
            });
            // 启动观察
            this.lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            // 设置停止监听的条件
            this.setupStopListening();
        }
        catch (error) {
            logger.error('LCP监控不受支持', error);
        }
    }
    /**
     * 设置停止监听的各种条件
     */
    setupStopListening() {
        // 用于确保只报告一次的函数
        const stopListening = () => {
            if (this.metricReported || !this.lcpObserver)
                return;
            // 处理所有剩余记录
            const records = this.lcpObserver.takeRecords();
            if (records && records.length > 0) {
                const lastEntry = records[records.length - 1];
                if (lastEntry && lastEntry.startTime < this.firstHiddenTime) {
                    const lcpValue = Math.max(lastEntry.startTime - this.getActivationStart(), 0);
                    const lcp = {
                        name: 'LCP',
                        value: lcpValue,
                        unit: 'ms',
                        timestamp: new Date().getTime(),
                        url: typeof window !== 'undefined' ? window.location.href : undefined,
                        networkMetrics: this.getNetworkInformation(),
                        context: {
                            elementId: lastEntry.element ? lastEntry.element.id || null : null,
                            elementTagName: lastEntry.element ? lastEntry.element.tagName || null : null,
                            elementType: lastEntry.element ? lastEntry.element.type || null : null,
                            size: lastEntry.size || 0,
                            finalReport: true
                        }
                    };
                    lcp.rating = this.assignLCPRating(lcp.value);
                    this.onUpdate(lcp);
                }
            }
            // 断开观察器连接
            this.lcpObserver.disconnect();
            this.lcpObserver = null;
            this.metricReported = true;
            logger.debug('LCP测量完成，指标已报告');
        };
        // 监听用户交互事件（键盘和点击）
        const addInteractionListener = (type) => {
            if (typeof document === 'undefined')
                return;
            document.addEventListener(type, () => {
                // 使用setTimeout将回调放入单独的任务中，减少对INP的影响
                setTimeout(() => {
                    logger.debug(`检测到用户${type}交互，停止LCP监听`);
                    stopListening();
                }, 0);
            }, { once: true, capture: true });
        };
        ['keydown', 'click'].forEach(addInteractionListener);
        // 监听页面隐藏事件
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    logger.debug('页面隐藏，停止LCP监听');
                    stopListening();
                }
            });
        }
    }
    /**
     * 停止LCP观察
     */
    stop() {
        if (this.lcpObserver) {
            this.lcpObserver.disconnect();
            this.lcpObserver = null;
        }
        super.stop();
    }
    /**
     * 页面可见性变化时的回调
     * @param isVisible 页面是否可见
     */
    onVisibilityChange(isVisible) {
        if (!isVisible && this.firstHiddenTime === Infinity) {
            this.firstHiddenTime = performance.now();
            logger.debug(`页面隐藏，更新firstHiddenTime: ${this.firstHiddenTime}ms`);
        }
    }
    /**
     * BFCache恢复处理
     * 在bfcache恢复后重新计算从恢复到当前的时间差作为新的LCP
     */
    onBFCacheRestore(event) {
        // 断开现有的LCP观察器
        if (this.lcpObserver) {
            this.lcpObserver.disconnect();
            this.lcpObserver = null;
        }
        // 重置状态
        this.metricReported = false;
        this.firstHiddenTime = this.initFirstHiddenTime();
        this.setupFirstHiddenTimeListener();
        // 创建一个新的LCP指标，使用恢复时间差作为值
        const restoreTime = event.timeStamp;
        // 使用双重requestAnimationFrame确保我们在浏览器绘制后进行测量
        const doubleRAF = (callback) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    callback();
                });
            });
        };
        doubleRAF(() => {
            const currentTime = performance.now();
            const timeFromRestore = currentTime - restoreTime;
            const lcp = {
                name: 'LCP',
                value: timeFromRestore,
                unit: 'ms',
                timestamp: currentTime,
                url: typeof window !== 'undefined' ? window.location.href : undefined,
                context: {
                    bfcacheRestore: true,
                    restoreTime: restoreTime
                }
            };
            lcp.rating = this.assignLCPRating(lcp.value);
            logger.info(`从bfcache恢复到现在的时间: ${timeFromRestore}ms，作为新的LCP值`);
            this.onUpdate(lcp);
            this.metricReported = true;
        });
        // 重新开始LCP监测以捕获后续可能的更大内容
        this.startLCPMonitoring();
    }
}
// LCP评分阈值（毫秒）
LCPObserver.LCP_GOOD_THRESHOLD = 2500;
LCPObserver.LCP_NEEDS_IMPROVEMENT_THRESHOLD = 4000;
//# sourceMappingURL=lcp-observer.js.map