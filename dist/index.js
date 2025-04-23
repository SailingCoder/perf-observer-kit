/**
 * 指标类型枚举
 */
var MetricType;
(function (MetricType) {
    MetricType["WEB_VITALS"] = "coreWebVitals";
    MetricType["RESOURCES"] = "resources";
    MetricType["LONG_TASKS"] = "longTasks";
    MetricType["NAVIGATION"] = "navigation";
    MetricType["BROWSER_INFO"] = "browserInfo";
})(MetricType || (MetricType = {}));

/**
 * Utility functions to check browser support for performance APIs
 */
const browserSupport = {
    /**
     * Check if the Performance API is supported
     */
    hasPerformanceAPI() {
        return typeof window !== 'undefined' &&
            typeof performance !== 'undefined';
    },
    /**
     * Check if PerformanceObserver is supported
     */
    hasPerformanceObserver() {
        return typeof window !== 'undefined' &&
            typeof PerformanceObserver !== 'undefined';
    },
    /**
     * Check if a specific performance entry type is supported
     */
    supportsEntryType(entryType) {
        if (!this.hasPerformanceObserver()) {
            return false;
        }
        // In modern browsers, we can check supported entry types
        if (PerformanceObserver.supportedEntryTypes) {
            return PerformanceObserver.supportedEntryTypes.includes(entryType);
        }
        // Fallback detection for older browsers
        switch (entryType) {
            case 'navigation':
                return typeof PerformanceNavigationTiming !== 'undefined';
            case 'resource':
                return typeof PerformanceResourceTiming !== 'undefined';
            case 'largest-contentful-paint':
            case 'layout-shift':
            case 'first-input':
            case 'longtask':
                // No reliable feature detection for these in older browsers
                // Try to create an observer as a test
                try {
                    const observer = new PerformanceObserver(() => { });
                    observer.observe({ type: entryType, buffered: true });
                    observer.disconnect();
                    return true;
                }
                catch (e) {
                    return false;
                }
            default:
                return false;
        }
    }
};

/**
 * 日志级别定义
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["NONE"] = 0] = "NONE";
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG"; // 输出所有日志，包括调试信息
})(LogLevel || (LogLevel = {}));
// 检测是否为生产环境 - 这将由terser自动删除生产版本中不需要的代码
const IS_DEV = typeof process === 'undefined' || !process.env || process.env.NODE_ENV !== 'production';
/**
 * 日志工具类 - 精简版实现，在生产环境会被优化
 */
class Logger {
    /**
     * 创建日志器实例
     * @param options 日志器选项
     */
    constructor(options = {}) {
        var _a, _b, _c;
        this.level = (_a = options.level) !== null && _a !== void 0 ? _a : LogLevel.INFO;
        this.prefix = (_b = options.prefix) !== null && _b !== void 0 ? _b : '[PerfObserverKit]';
        this.disableInProduction = (_c = options.disableInProduction) !== null && _c !== void 0 ? _c : false; // 默认允许在生产环境输出日志
    }
    /**
     * 设置日志级别
     * @param level 日志级别
     */
    setLevel(level) {
        this.level = level;
        // 输出一条日志，确认级别已更改
    }
    /**
     * 设置日志器选项
     * @param options 要设置的选项
     */
    setOptions(options) {
        if (options.level !== undefined) {
            this.level = options.level;
        }
        if (options.prefix !== undefined) {
            this.prefix = options.prefix;
        }
        if (options.disableInProduction !== undefined) {
            this.disableInProduction = options.disableInProduction;
        }
    }
    /**
     * 输出调试日志
     * @param args 日志内容
     */
    debug(...args) {
        // 移除IS_DEV条件，允许生产环境输出调试信息
        if (this.shouldLog(LogLevel.DEBUG)) ;
    }
    /**
     * 输出普通信息日志
     * @param args 日志内容
     */
    info(...args) {
        // 移除IS_DEV条件，允许生产环境输出信息
        if (this.shouldLog(LogLevel.INFO)) ;
    }
    /**
     * 输出警告日志
     * @param args 日志内容
     */
    warn(...args) {
        // 警告总是保留，但在生产环境会受日志级别限制
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.prefix, ...args);
        }
    }
    /**
     * 输出错误日志
     * @param args 日志内容
     */
    error(...args) {
        // 错误总是保留，但在生产环境会受日志级别限制
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.prefix, ...args);
        }
    }
    /**
     * 判断是否应该输出指定级别的日志
     * @param messageLevel 日志消息级别
     * @returns 是否应该输出
     */
    shouldLog(messageLevel) {
        // 移除自动禁用生产环境日志的功能，改为完全尊重disableInProduction设置
        if (!IS_DEV && this.disableInProduction) {
            return false;
        }
        return messageLevel <= this.level;
    }
    /**
     * 获取当前日志配置
     * @returns 当前日志配置
     */
    getConfiguration() {
        return {
            level: this.level,
            levelName: LogLevel[this.level],
            disableInProduction: this.disableInProduction,
            isProduction: !IS_DEV
        };
    }
}
/**
 * 全局默认日志器实例
 */
const logger = new Logger();

/**
 * 网络性能指标收集器
 * 提供收集和分析网络性能相关数据的工具方法
 */
class NetworkMetricsCollector {
    /**
     * 获取当前网络状态信息
     * @returns 网络信息对象
     */
    static getNetworkInformation() {
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
            const connection = navigator.connection;
            if (connection) {
                return {
                    downlink: connection.downlink,
                    effectiveType: connection.effectiveType,
                    rtt: connection.rtt,
                    saveData: connection.saveData
                };
            }
        }
        return undefined;
    }
    /**
     * 获取完整的网络上下文信息
     * @param extraContext 额外的上下文信息
     * @returns 网络上下文信息
     */
    static getNetworkContext(extraContext = {}) {
        const networkInfo = this.getNetworkInformation();
        return {
            networkInfo: networkInfo ? {
                downlink: networkInfo.downlink,
                effectiveType: networkInfo.effectiveType,
                rtt: networkInfo.rtt,
                saveData: networkInfo.saveData
            } : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            visibilityState: typeof document !== 'undefined' ? document.visibilityState : undefined,
            ...extraContext
        };
    }
    /**
     * 计算网络质量评分
     * @param networkInfo 网络信息对象
     * @returns 'good' | 'needs-improvement' | 'poor'
     */
    static rateNetworkQuality(networkInfo) {
        if (!networkInfo) {
            return 'needs-improvement';
        }
        // 根据网络类型评估
        if (networkInfo.effectiveType === '4g' && networkInfo.downlink && networkInfo.downlink >= 5) {
            return 'good';
        }
        else if (networkInfo.effectiveType === '4g' || networkInfo.effectiveType === '3g') {
            return 'needs-improvement';
        }
        else {
            return 'poor';
        }
    }
}

function calculateTime(end, start) {
    return (typeof end === 'number' && typeof start === 'number') ? Math.max(end - start, 0) : 0;
}
/**
 * 计算两个时间点之间的差值，确保结果为非负
 * @param end 结束时间点
 * @param start 开始时间点
 * @returns 非负的时间差值
 */
function calculateTimeDelta(end, start) {
    const delta = end - start;
    return delta > 0 ? delta : 0;
}

/**
 * 基础观察者类
 * 提供所有Web指标观察者共享的功能
 */
class BaseObserver {
    constructor(options) {
        this.observer = null;
        // 页面可见性和用户交互相关属性
        this.isPageVisible = true;
        this.userHasInteracted = false;
        this.visibilityChangeHandler = null;
        this.userInteractionHandler = null;
        this.pageshowHandler = null;
        this.onUpdate = options.onUpdate;
    }
    /**
     * 启动观察
     */
    start() {
        this.setupVisibilityTracking();
        this.setupUserInteractionTracking();
        this.setupPageshowListener();
        this.observe();
    }
    /**
     * 停止观察
     */
    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.cleanupEventListeners();
    }
    /**
     * 清理事件监听器
     */
    cleanupEventListeners() {
        // 移除页面可见性监听
        if (this.visibilityChangeHandler && typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
            this.visibilityChangeHandler = null;
        }
        // 移除用户交互监听
        if (this.userInteractionHandler && typeof document !== 'undefined') {
            document.removeEventListener('click', this.userInteractionHandler);
            document.removeEventListener('keydown', this.userInteractionHandler);
            this.userInteractionHandler = null;
        }
        // 移除pageshow监听
        if (this.pageshowHandler && typeof window !== 'undefined') {
            window.removeEventListener('pageshow', this.pageshowHandler);
            this.pageshowHandler = null;
        }
    }
    /**
     * 设置页面可见性跟踪
     */
    setupVisibilityTracking() {
        if (typeof document === 'undefined') {
            return;
        }
        this.isPageVisible = document.visibilityState === 'visible';
        this.visibilityChangeHandler = (event) => {
            this.isPageVisible = document.visibilityState === 'visible';
            logger.debug('页面可见性变化:', this.isPageVisible ? '可见' : '隐藏');
            // 通知子类可见性变化
            this.onVisibilityChange(this.isPageVisible);
        };
        document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }
    /**
     * 设置用户交互跟踪
     */
    setupUserInteractionTracking() {
        if (typeof document === 'undefined') {
            return;
        }
        this.userInteractionHandler = (event) => {
            if (this.userHasInteracted) {
                return; // 已经处理过用户交互了，不重复处理
            }
            this.userHasInteracted = true;
            logger.debug('用户已交互');
        };
        // 监听点击和键盘事件
        document.addEventListener('click', this.userInteractionHandler);
        document.addEventListener('keydown', this.userInteractionHandler);
    }
    /**
     * 设置bfcache恢复监听
     */
    setupPageshowListener() {
        if (typeof window === 'undefined') {
            return;
        }
        this.pageshowHandler = (event) => {
            // 只有当页面是从bfcache恢复时才处理
            if (event.persisted) {
                logger.info('页面从bfcache恢复');
                // 重置用户交互状态
                this.userHasInteracted = false;
                // 由子类实现具体的bfcache恢复处理
                this.onBFCacheRestore(event);
            }
        };
        window.addEventListener('pageshow', this.pageshowHandler);
    }
    /**
     * 获取网络状态信息
     * @returns 网络信息对象
     */
    getNetworkInformation() {
        return NetworkMetricsCollector.getNetworkInformation();
    }
    /**
     * 获取完整的网络上下文
     * @param extraContext 额外的上下文信息
     * @returns 完整的上下文数据
     */
    getNetworkContext(extraContext = {}) {
        // 获取当前页面URL
        const currentUrl = typeof window !== 'undefined' ? window.location.href : undefined;
        return NetworkMetricsCollector.getNetworkContext({
            ...extraContext,
            userHasInteracted: this.userHasInteracted,
            url: currentUrl
        });
    }
    /**
     * 计算两个时间点之间的差值，确保结果为非负
     * @param end 结束时间点
     * @param start 开始时间点
     * @returns 非负的时间差值
     */
    calculateTimeDelta(end, start) {
        return calculateTimeDelta(end, start);
    }
    /**
     * 页面可见性变化时的回调 - 可由子类重写
     * @param isVisible 页面是否可见
     */
    onVisibilityChange(isVisible) {
        // 默认实现为空，由子类覆盖
    }
    /**
     * BFCache恢复处理 - 由子类重写
     */
    onBFCacheRestore(event) {
        // 默认实现为空，由子类覆盖
    }
}

/**
 * First Contentful Paint (FCP) 观察者
 * 负责测量页面首次内容绘制时间
 * 重新实现基于Google Web Vitals库 (https://github.com/GoogleChrome/web-vitals)
 */
class FCPObserver extends BaseObserver {
    constructor(options) {
        super(options);
        this.fcpObserver = null;
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
     * 为FCP指标分配评级
     */
    assignFCPRating(value) {
        if (value <= FCPObserver.FCP_GOOD_THRESHOLD) {
            return 'good';
        }
        else if (value <= FCPObserver.FCP_NEEDS_IMPROVEMENT_THRESHOLD) {
            return 'needs-improvement';
        }
        else {
            return 'poor';
        }
    }
    /**
     * 实现观察FCP的方法
     */
    observe() {
        if (typeof PerformanceObserver === 'undefined') {
            logger.error('PerformanceObserver API不可用，无法监控FCP');
            return;
        }
        try {
            this.fcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                for (const entry of entries) {
                    if (entry.name === 'first-contentful-paint') {
                        // 只有当页面在FCP发生前未隐藏时才报告
                        if (entry.startTime < this.firstHiddenTime) {
                            // 计算FCP值，考虑activationStart（预渲染）
                            const fcpValue = Math.max(entry.startTime - this.getActivationStart(), 0);
                            const fcp = {
                                name: 'FCP',
                                value: fcpValue,
                                unit: 'ms',
                                timestamp: new Date().getTime(),
                                url: typeof window !== 'undefined' ? window.location.href : undefined,
                                networkMetrics: this.getNetworkInformation()
                            };
                            // 设置评级
                            fcp.rating = this.assignFCPRating(fcp.value);
                            this.onUpdate(fcp);
                            // 标记指标已报告
                            this.metricReported = true;
                        }
                        else {
                            logger.debug('页面在FCP前已隐藏，忽略此FCP事件');
                        }
                        // FCP只报告一次
                        if (this.fcpObserver) {
                            this.fcpObserver.disconnect();
                            this.fcpObserver = null;
                        }
                        break;
                    }
                }
            });
            this.fcpObserver.observe({ type: 'paint', buffered: true });
        }
        catch (error) {
            logger.error('FCP监控不受支持', error);
        }
    }
    /**
     * 停止FCP观察
     */
    stop() {
        if (this.fcpObserver) {
            this.fcpObserver.disconnect();
            this.fcpObserver = null;
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
     * 在bfcache恢复后，使用双RAF测量时间为新的FCP值
     */
    onBFCacheRestore(event) {
        // 对于BFCache恢复，我们需要新的FCP测量
        // 重置状态
        this.metricReported = false;
        this.firstHiddenTime = this.initFirstHiddenTime();
        this.setupFirstHiddenTimeListener();
        // 创建一个新的FCP指标，使用恢复时间差作为值
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
            const fcp = {
                name: 'FCP',
                value: timeFromRestore,
                unit: 'ms',
                timestamp: currentTime,
                url: typeof window !== 'undefined' ? window.location.href : undefined,
                context: {
                    bfcacheRestore: true,
                    restoreTime: restoreTime
                }
            };
            fcp.rating = this.assignFCPRating(fcp.value);
            logger.info(`从bfcache恢复到现在的时间: ${timeFromRestore}ms，作为新的FCP值`);
            this.onUpdate(fcp);
            this.metricReported = true;
        });
        // 重新观察FCP，以防有更早的绘制事件
        this.observe();
    }
}
// FCP评分阈值（毫秒）
FCPObserver.FCP_GOOD_THRESHOLD = 1800;
FCPObserver.FCP_NEEDS_IMPROVEMENT_THRESHOLD = 3000;

/**
 * Largest Contentful Paint (LCP) 观察者
 * 负责测量页面最大内容绘制时间
 * 重新实现基于Google Web Vitals库 (https://github.com/GoogleChrome/web-vitals)
 */
class LCPObserver extends BaseObserver {
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

/**
 * First Input Delay (FID) 观察者
 * 负责测量页面首次输入延迟时间
 */
class FIDObserver extends BaseObserver {
    constructor(options) {
        super(options);
        this.fidObserver = null;
    }
    /**
     * 实现观察FID的方法
     */
    observe() {
        try {
            this.fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                for (const entry of entries) {
                    if (entry.name === 'first-input') {
                        const fidEntry = entry;
                        const fid = {
                            name: 'FID',
                            value: fidEntry.processingStart - fidEntry.startTime,
                            unit: 'ms',
                            timestamp: new Date().getTime(),
                        };
                        // FID rating thresholds (ms)
                        if (fid.value <= 100) {
                            fid.rating = 'good';
                        }
                        else if (fid.value <= 300) {
                            fid.rating = 'needs-improvement';
                        }
                        else {
                            fid.rating = 'poor';
                        }
                        this.onUpdate(fid);
                        // FID is only reported once
                        if (this.fidObserver) {
                            this.fidObserver.disconnect();
                            this.fidObserver = null;
                        }
                        break;
                    }
                }
            });
            this.fidObserver.observe({ type: 'first-input', buffered: true });
        }
        catch (error) {
            logger.error('FID监控不受支持', error);
        }
    }
    /**
     * 停止FID观察
     */
    stop() {
        if (this.fidObserver) {
            this.fidObserver.disconnect();
            this.fidObserver = null;
        }
        super.stop();
    }
    /**
     * 页面可见性变化时的回调
     * @param isVisible 页面是否可见
     */
    onVisibilityChange(isVisible) {
        // FID通常是页面加载后的首次输入事件，不需要在可见性变化时特殊处理
        if (!isVisible) {
            logger.debug('页面隐藏，FID已经收集或仍在等待首次输入事件');
        }
        else {
            logger.debug('页面重新可见，FID状态不变');
        }
    }
    /**
     * BFCache恢复处理
     * FID通常不需要在bfcache恢复时重新计算
     */
    onBFCacheRestore(event) {
        // FID不需要特殊处理bfcache恢复
    }
}

/**
 * Cumulative Layout Shift (CLS) 观察者
 * 负责测量页面布局稳定性
 * 使用 Google Web Vitals 推荐的会话窗口计算方法
 */
class CLSObserver extends BaseObserver {
    constructor(options) {
        super(options);
        this.clsObserver = null;
        // 会话窗口相关属性
        this.sessionCount = 0; // 当前会话中的偏移数量
        this.sessionValues = [0]; // 各个会话窗口的CLS值
        this.sessionGap = 1000; // 会话间隔时间，单位毫秒
        this.sessionMax = 5; // 最大会话窗口数量
        this.maxSessionEntries = 100; // 每个会话记录的最大偏移数量
        // 上次报告的CLS值
        this.prevReportedValue = 0;
        // 上次偏移的时间戳
        this.lastEntryTime = 0;
        // 是否需要在页面重新可见时重置会话
        this.shouldResetOnNextVisible = false;
        // 防抖计时器
        this.reportDebounceTimer = null;
        // 防抖延迟
        this.reportDebounceDelay = 500;
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
     * 为CLS指标分配评级
     */
    assignCLSRating(value) {
        if (value <= CLSObserver.CLS_GOOD_THRESHOLD) {
            return 'good';
        }
        else if (value <= CLSObserver.CLS_NEEDS_IMPROVEMENT_THRESHOLD) {
            return 'needs-improvement';
        }
        else {
            return 'poor';
        }
    }
    /**
     * 实现观察CLS的方法
     */
    observe() {
        if (typeof PerformanceObserver === 'undefined') {
            logger.error('PerformanceObserver API不可用，无法监控CLS');
            return;
        }
        try {
            this.clsObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                // 只处理页面在可见状态时发生的布局偏移
                if (document.visibilityState !== 'visible') {
                    logger.debug('页面不可见，忽略布局偏移事件');
                    return;
                }
                // 处理新会话的标志
                let newSessionStarted = false;
                for (const entry of entries) {
                    // 只计算用户未操作时的布局偏移
                    const layoutShift = entry;
                    if (!layoutShift.hadRecentInput && layoutShift.startTime < this.firstHiddenTime) {
                        // 获取偏移发生的时间戳
                        const currentTime = layoutShift.startTime;
                        // 判断是否需要开始新会话
                        if (this.shouldResetOnNextVisible || currentTime - this.lastEntryTime > this.sessionGap) {
                            this.startNewSession(layoutShift.value);
                            newSessionStarted = true;
                            this.shouldResetOnNextVisible = false;
                        }
                        else {
                            // 累加到当前会话，但限制记录的事件数量
                            if (this.sessionCount < this.maxSessionEntries) {
                                this.sessionCount++;
                                // 累加到当前会话
                                const currentSessionIndex = this.sessionValues.length - 1;
                                this.sessionValues[currentSessionIndex] += layoutShift.value;
                            }
                        }
                        // 更新最后一次偏移时间
                        this.lastEntryTime = currentTime;
                        // 防抖处理，减少频繁报告
                        this.debouncedReportCLS();
                    }
                }
                // 如果开始了新会话，立即报告一次，不需要防抖
                if (newSessionStarted) {
                    this.reportCLS(this.calculateCLS());
                }
            });
            // 使用buffered选项确保不会丢失之前的布局偏移
            this.clsObserver.observe({ type: 'layout-shift', buffered: true });
            logger.debug('CLS观察者已启动，开始监控布局偏移');
        }
        catch (error) {
            logger.error('CLS监控不受支持', error);
        }
    }
    /**
     * 开始新的会话窗口
     * @param initialValue 初始偏移值
     */
    startNewSession(initialValue) {
        // 添加新会话
        this.sessionValues.push(initialValue);
        this.sessionCount = 1;
        // 如果会话窗口超过限制，移除最小的会话
        if (this.sessionValues.length > this.sessionMax) {
            // 找到最小的会话值及其索引
            let minValue = Infinity;
            let minIndex = 0;
            for (let i = 0; i < this.sessionValues.length; i++) {
                if (this.sessionValues[i] < minValue) {
                    minValue = this.sessionValues[i];
                    minIndex = i;
                }
            }
            // 移除最小的会话
            this.sessionValues.splice(minIndex, 1);
        }
        logger.debug(`开始新的CLS会话，当前会话数: ${this.sessionValues.length}`);
    }
    /**
     * 防抖报告CLS，减少频繁更新
     */
    debouncedReportCLS() {
        // 清除现有计时器
        if (this.reportDebounceTimer !== null) {
            window.clearTimeout(this.reportDebounceTimer);
        }
        // 设置新计时器
        this.reportDebounceTimer = window.setTimeout(() => {
            const clsValue = this.calculateCLS();
            // 只有当CLS值显著变化时才报告
            if (Math.abs(clsValue - this.prevReportedValue) >= 0.01) {
                this.reportCLS(clsValue);
            }
            this.reportDebounceTimer = null;
        }, this.reportDebounceDelay);
    }
    /**
     * 计算最终CLS值
     * 取所有会话窗口中的最大值
     */
    calculateCLS() {
        return Math.max(...this.sessionValues);
    }
    /**
     * 报告CLS指标
     */
    reportCLS(clsValue) {
        const cls = {
            name: 'CLS',
            value: clsValue,
            unit: '', // CLS没有单位，是无量纲数值
            timestamp: new Date().getTime(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            // 添加网络信息和其他上下文
            context: {
                shiftCount: this.sessionCount,
                sessionCount: this.sessionValues.length,
                sessionValues: [...this.sessionValues],
                largestSession: this.calculateCLS(),
                isPageVisible: document.visibilityState === 'visible',
                firstHiddenTime: this.firstHiddenTime === Infinity ? null : this.firstHiddenTime
            }
        };
        // 设置评级
        cls.rating = this.assignCLSRating(cls.value);
        logger.debug(`报告CLS值: ${cls.value}，评级: ${cls.rating}，页面可见性: ${document.visibilityState}`);
        this.onUpdate(cls);
        // 更新上次报告的值
        this.prevReportedValue = clsValue;
    }
    /**
     * 停止CLS观察
     */
    stop() {
        // 清除防抖计时器
        if (this.reportDebounceTimer !== null) {
            window.clearTimeout(this.reportDebounceTimer);
            this.reportDebounceTimer = null;
        }
        if (this.clsObserver) {
            this.clsObserver.disconnect();
            this.clsObserver = null;
        }
        super.stop();
    }
    /**
     * 页面可见性变化时的回调
     * @param isVisible 页面是否可见
     */
    onVisibilityChange(isVisible) {
        if (!isVisible) {
            // 页面隐藏时，报告当前的CLS值
            if (this.firstHiddenTime === Infinity) {
                this.firstHiddenTime = performance.now();
                logger.debug(`页面隐藏，更新firstHiddenTime: ${this.firstHiddenTime}ms`);
            }
            const clsValue = this.calculateCLS();
            // 无论大小变化，都在页面隐藏时报告一次
            this.reportCLS(clsValue);
            // 标记需要在页面重新可见时开始新会话
            this.shouldResetOnNextVisible = true;
        }
        else {
            // 页面重新变为可见
            if (this.shouldResetOnNextVisible) {
                logger.debug('页面重新可见，准备开始新的CLS会话');
                // 实际的重置会在下一个布局偏移发生时生效
            }
        }
    }
    /**
     * BFCache恢复处理
     * CLS应该重置累积值
     */
    onBFCacheRestore(event) {
        // 重置CLS会话值
        this.sessionValues = [0];
        this.sessionCount = 0;
        this.prevReportedValue = 0;
        this.lastEntryTime = 0;
        // 清除计时器
        if (this.reportDebounceTimer !== null) {
            window.clearTimeout(this.reportDebounceTimer);
            this.reportDebounceTimer = null;
        }
        // 重置firstHiddenTime
        this.firstHiddenTime = this.initFirstHiddenTime();
        this.setupFirstHiddenTimeListener();
        logger.info('CLS值已在bfcache恢复后重置');
        // 重新开始CLS监测
        if (this.clsObserver) {
            this.clsObserver.observe({ type: 'layout-shift', buffered: true });
        }
    }
}
// CLS评分阈值
CLSObserver.CLS_GOOD_THRESHOLD = 0.1;
CLSObserver.CLS_NEEDS_IMPROVEMENT_THRESHOLD = 0.25;

/**
 * Interaction to Next Paint (INP) 观察者
 * 负责测量页面交互响应性能
 * 实现基于 Google Web Vitals 推荐方法
 */
class INPObserver extends BaseObserver {
    constructor(options) {
        super(options);
        this.inpObserver = null;
        // 存储所有交互事件的持续时间
        this.interactionEvents = [];
        // 上次报告的INP值
        this.lastReportedINP = 0;
        // 报告频率控制
        this.minReportingChange = 10; // 最小报告变化阈值（毫秒）
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
     * 为INP指标分配评级
     */
    assignINPRating(value) {
        if (value <= INPObserver.INP_GOOD_THRESHOLD) {
            return 'good';
        }
        else if (value <= INPObserver.INP_NEEDS_IMPROVEMENT_THRESHOLD) {
            return 'needs-improvement';
        }
        else {
            return 'poor';
        }
    }
    /**
     * 实现观察INP的方法
     */
    observe() {
        if (typeof PerformanceObserver === 'undefined') {
            logger.error('PerformanceObserver API不可用，无法监控INP');
            return;
        }
        try {
            // 定义要观察的交互类型
            const eventTypes = ['click', 'keydown', 'pointerdown'];
            this.inpObserver = new PerformanceObserver((entryList) => {
                // 只处理页面在可见状态时发生的交互
                if (document.visibilityState !== 'visible')
                    return;
                const events = entryList.getEntries();
                // 处理每个交互事件
                for (const event of events) {
                    // 只处理发生在页面可见状态的交互
                    if (event.startTime < this.firstHiddenTime) {
                        const timing = event;
                        // 检查事件类型是否在我们关注的范围内
                        if (eventTypes.includes(timing.name)) {
                            this.interactionEvents.push({
                                duration: timing.duration,
                                name: timing.name,
                                startTime: timing.startTime
                            });
                            // 计算并可能报告新的INP值
                            this.calculateAndReportINP();
                        }
                    }
                }
            });
            // 使用类型断言处理非标准属性
            try {
                // 尝试使用带有durationThreshold的observe
                // durationThreshold是较新浏览器中可用的非标准属性
                this.inpObserver.observe({
                    type: 'event',
                    buffered: true,
                    // 使用类型断言来处理非标准属性
                    ...{ durationThreshold: 16 } // 只测量至少持续16ms的事件
                });
            }
            catch (error) {
                // 回退到不带durationThreshold的observe
                this.inpObserver.observe({
                    type: 'event',
                    buffered: true
                });
                logger.warn('浏览器不支持durationThreshold参数，使用默认配置');
            }
        }
        catch (error) {
            logger.error('INP监控不受支持', error);
        }
    }
    /**
     * 计算INP（交互到下一次绘制）值
     * 使用Google推荐的方法（取第75百分位数）
     */
    calculateINP() {
        if (this.interactionEvents.length === 0) {
            return 0;
        }
        // 将交互事件按持续时间排序
        const sortedDurations = this.interactionEvents.map(event => event.duration).sort((a, b) => a - b);
        // 计算第75百分位数
        const percentile = 0.75;
        const index = Math.floor(sortedDurations.length * percentile);
        // 如果只有一个交互，直接返回
        if (sortedDurations.length === 1) {
            return sortedDurations[0];
        }
        // 返回第75百分位数的值
        return sortedDurations[index];
    }
    /**
     * 计算并报告INP值，如果值有显著变化
     */
    calculateAndReportINP() {
        // 计算新的INP值
        const inpValue = this.calculateINP();
        // 只有当INP值显著变化时才报告
        if (Math.abs(inpValue - this.lastReportedINP) >= this.minReportingChange) {
            // 创建INP指标对象
            const inp = {
                name: 'INP',
                value: inpValue,
                unit: 'ms',
                timestamp: new Date().getTime(),
                url: typeof window !== 'undefined' ? window.location.href : undefined,
                context: {
                    interactionCount: this.interactionEvents.length,
                    percentile: 75,
                    highestDuration: Math.max(...this.interactionEvents.map(e => e.duration)),
                    medianDuration: this.interactionEvents.length > 0
                        ? this.interactionEvents.map(e => e.duration).sort((a, b) => a - b)[Math.floor(this.interactionEvents.length / 2)]
                        : 0,
                    eventTypes: [...new Set(this.interactionEvents.map(e => e.name))],
                    firstHiddenTime: this.firstHiddenTime === Infinity ? null : this.firstHiddenTime
                }
            };
            // 设置评级
            inp.rating = this.assignINPRating(inp.value);
            logger.debug(`报告INP值: ${inp.value}ms，评级: ${inp.rating}，基于${this.interactionEvents.length}个交互`);
            this.onUpdate(inp);
            // 更新最后报告的值
            this.lastReportedINP = inpValue;
        }
    }
    /**
     * 停止INP观察
     */
    stop() {
        if (this.inpObserver) {
            this.inpObserver.disconnect();
            this.inpObserver = null;
        }
        super.stop();
    }
    /**
     * 页面可见性变化时的回调
     * @param isVisible 页面是否可见
     */
    onVisibilityChange(isVisible) {
        // 更新firstHiddenTime
        if (!isVisible && this.firstHiddenTime === Infinity) {
            this.firstHiddenTime = performance.now();
            logger.debug(`页面隐藏，更新firstHiddenTime: ${this.firstHiddenTime}ms`);
            // 当页面隐藏时，报告当前的INP值
            if (this.interactionEvents.length > 0) {
                this.calculateAndReportINP();
            }
        }
    }
    /**
     * BFCache恢复处理
     * 重置INP监测
     */
    onBFCacheRestore(event) {
        // 重置INP值和交互事件
        this.interactionEvents = [];
        this.lastReportedINP = 0;
        // 重置firstHiddenTime
        this.firstHiddenTime = this.initFirstHiddenTime();
        this.setupFirstHiddenTimeListener();
        logger.info('INP监测已在bfcache恢复后重置');
        // 重新启动INP监测
        if (this.inpObserver) {
            this.inpObserver.disconnect();
            this.inpObserver = null;
        }
        this.observe();
    }
}
// INP评分阈值（毫秒）
INPObserver.INP_GOOD_THRESHOLD = 200;
INPObserver.INP_NEEDS_IMPROVEMENT_THRESHOLD = 500;

/**
 * 核心Web指标观察者
 * 负责监控所有Core Web Vitals指标
 */
class CoreWebVitalsObserver {
    constructor(options) {
        this.metrics = {};
        // 各个指标的观察者
        this.fcpObserver = null;
        this.lcpObserver = null;
        this.fidObserver = null;
        this.clsObserver = null;
        this.inpObserver = null;
        this.onUpdate = options.onUpdate;
        this.options = {
            // 默认启用
            enabled: options.enabled !== undefined ? options.enabled : true,
            // FCP和LCP默认启用，其他指标默认不启用
            fcp: options.fcp !== undefined ? options.fcp : true,
            lcp: options.lcp !== undefined ? options.lcp : true,
            fid: options.fid !== undefined ? options.fid : false,
            cls: options.cls !== undefined ? options.cls : false,
            inp: options.inp !== undefined ? options.inp : false,
            // 其他选项
            backgroundLoadThreshold: options.backgroundLoadThreshold,
            ...options
        };
        logger.debug('核心Web指标观察者已创建，初始配置:', {
            enabled: this.options.enabled,
            fcp: this.options.fcp,
            lcp: this.options.lcp,
            fid: this.options.fid,
            cls: this.options.cls,
            inp: this.options.inp
        });
    }
    /**
     * 开始监控所有核心Web指标
     */
    start() {
        logger.info('开始监控核心Web指标');
        // 启动FCP监测
        if (this.options.fcp) {
            logger.debug('启动FCP监测');
            this.startFCPMonitoring();
        }
        // 启动LCP监测
        if (this.options.lcp) {
            logger.debug('启动LCP监测');
            this.startLCPMonitoring();
        }
        // 启动FID监测
        if (this.options.fid) {
            logger.debug('启动FID监测');
            this.startFIDMonitoring();
        }
        // 启动CLS监测
        if (this.options.cls) {
            logger.debug('启动CLS监测');
            this.startCLSMonitoring();
        }
        // 启动INP监测
        if (this.options.inp) {
            logger.debug('启动INP监测');
            this.startINPMonitoring();
        }
        logger.debug('核心Web指标监控启动完成');
    }
    /**
     * 停止所有监控
     */
    stop() {
        logger.info('停止所有核心Web指标监控');
        if (this.fcpObserver) {
            this.fcpObserver.stop();
            this.fcpObserver = null;
            logger.debug('FCP监控已停止');
        }
        if (this.lcpObserver) {
            this.lcpObserver.stop();
            this.lcpObserver = null;
            logger.debug('LCP监控已停止');
        }
        if (this.fidObserver) {
            this.fidObserver.stop();
            this.fidObserver = null;
            logger.debug('FID监控已停止');
        }
        if (this.clsObserver) {
            this.clsObserver.stop();
            this.clsObserver = null;
            logger.debug('CLS监控已停止');
        }
        if (this.inpObserver) {
            this.inpObserver.stop();
            this.inpObserver = null;
            logger.debug('INP监控已停止');
        }
        logger.debug('所有核心Web指标监控均已停止');
    }
    /**
     * 发送指标更新通知
     */
    notifyMetricsUpdate() {
        logger.debug('发送核心Web指标更新通知');
        this.onUpdate(this.metrics);
    }
    /**
     * 启动FCP监测
     */
    startFCPMonitoring() {
        try {
            this.fcpObserver = new FCPObserver({
                onUpdate: (metric) => {
                    this.metrics.fcp = metric;
                    logger.debug('FCP指标已更新:', metric.value.toFixed(2) + 'ms', `(${metric.rating})`);
                    this.notifyMetricsUpdate();
                }
            });
            this.fcpObserver.start();
        }
        catch (error) {
            logger.error('启动FCP监控失败:', error);
        }
    }
    /**
     * 启动LCP监测
     */
    startLCPMonitoring() {
        try {
            this.lcpObserver = new LCPObserver({
                onUpdate: (metric) => {
                    this.metrics.lcp = metric;
                    logger.debug('LCP指标已更新:', metric.value.toFixed(2) + 'ms', `(${metric.rating})`);
                    this.notifyMetricsUpdate();
                },
                backgroundLoadThreshold: this.options.backgroundLoadThreshold
            });
            this.lcpObserver.start();
        }
        catch (error) {
            logger.error('启动LCP监控失败:', error);
        }
    }
    /**
     * 启动FID监测
     */
    startFIDMonitoring() {
        try {
            this.fidObserver = new FIDObserver({
                onUpdate: (metric) => {
                    this.metrics.fid = metric;
                    logger.debug('FID指标已更新:', metric.value.toFixed(2) + 'ms', `(${metric.rating})`);
                    this.notifyMetricsUpdate();
                }
            });
            this.fidObserver.start();
        }
        catch (error) {
            logger.error('启动FID监控失败:', error);
        }
    }
    /**
     * 启动CLS监测
     */
    startCLSMonitoring() {
        try {
            this.clsObserver = new CLSObserver({
                onUpdate: (metric) => {
                    this.metrics.cls = metric;
                    logger.debug('CLS指标已更新:', metric.value.toFixed(4), `(${metric.rating})`);
                    this.notifyMetricsUpdate();
                }
            });
            this.clsObserver.start();
        }
        catch (error) {
            logger.error('启动CLS监控失败:', error);
        }
    }
    /**
     * 启动INP监测
     */
    startINPMonitoring() {
        try {
            this.inpObserver = new INPObserver({
                onUpdate: (metric) => {
                    this.metrics.inp = metric;
                    logger.debug('INP指标已更新:', metric.value.toFixed(2) + 'ms', `(${metric.rating})`);
                    this.notifyMetricsUpdate();
                }
            });
            this.inpObserver.start();
        }
        catch (error) {
            logger.error('启动INP监控失败:', error);
        }
    }
}

/**
 * 资源计时观察者
 * 监控并收集页面资源加载性能指标
 */
class ResourceTimingObserver {
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
        const isDuplicate = this.resources.some(r => r.name === resourceEntry.name && r.startTime === resourceEntry.startTime);
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
            name: resourceEntry.name,
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

/**
 * 长任务监控观察者
 * 负责监控并收集页面中的长任务（Long Tasks）信息
 */
class LongTasksObserver {
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
                        timestamp: new Date().getTime()
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

/**
 * 导航计时观察者
 * 用于收集页面加载相关的导航计时性能指标
 */
class NavigationObserver {
    /**
     * 创建导航计时观察者实例
     * @param options 配置选项
     */
    constructor(options) {
        this.metrics = {};
        this.started = false;
        this.hasReportedMetrics = false;
        this.onUpdate = options.onUpdate;
        this.options = {
            enabled: options.enabled !== undefined ? options.enabled : true,
            includeRawTiming: options.includeRawTiming || false,
            onUpdate: options.onUpdate
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
        const networkMetrics = NetworkMetricsCollector.getNetworkInformation();
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
            metric: 'navigation',
            networkMetrics,
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

/**
 * 浏览器和设备信息收集器
 * 提供收集浏览器环境信息的方法
 */
class BrowserInfoCollector {
    /**
     * 获取浏览器和设备相关信息
     * @returns 浏览器和设备信息
     */
    static getBrowserInfo() {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return {};
        }
        try {
            return {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                vendor: navigator.vendor,
                screenSize: {
                    width: window.screen.width,
                    height: window.screen.height
                },
                windowSize: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                devicePixelRatio: window.devicePixelRatio,
                cookiesEnabled: navigator.cookieEnabled
            };
        }
        catch (error) {
            console.warn('无法获取完整的浏览器信息', error);
            return {};
        }
    }
    /**
     * 检测浏览器名称和版本
     * @returns 浏览器名称和版本信息
     */
    static detectBrowser() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (typeof navigator === 'undefined') {
            return { name: 'unknown', version: 'unknown' };
        }
        const userAgent = navigator.userAgent;
        let browserName = 'unknown';
        let version = 'unknown';
        try {
            // 检测常见浏览器
            if (userAgent.indexOf('Firefox') > -1) {
                browserName = 'Firefox';
                version = ((_a = userAgent.match(/Firefox\/([\d.]+)/)) === null || _a === void 0 ? void 0 : _a[1]) || '';
            }
            else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg/') > -1) {
                browserName = 'Edge';
                version = ((_b = userAgent.match(/Edge\/([\d.]+)/)) === null || _b === void 0 ? void 0 : _b[1]) ||
                    ((_c = userAgent.match(/Edg\/([\d.]+)/)) === null || _c === void 0 ? void 0 : _c[1]) || '';
            }
            else if (userAgent.indexOf('Chrome') > -1) {
                browserName = 'Chrome';
                version = ((_d = userAgent.match(/Chrome\/([\d.]+)/)) === null || _d === void 0 ? void 0 : _d[1]) || '';
            }
            else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
                browserName = 'Safari';
                version = ((_e = userAgent.match(/Version\/([\d.]+)/)) === null || _e === void 0 ? void 0 : _e[1]) || '';
            }
            else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
                browserName = 'Internet Explorer';
                version = ((_f = userAgent.match(/MSIE ([\d.]+)/)) === null || _f === void 0 ? void 0 : _f[1]) ||
                    ((_g = userAgent.match(/rv:([\d.]+)/)) === null || _g === void 0 ? void 0 : _g[1]) || '';
            }
            else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR/') > -1) {
                browserName = 'Opera';
                version = ((_h = userAgent.match(/Opera\/([\d.]+)/)) === null || _h === void 0 ? void 0 : _h[1]) ||
                    ((_j = userAgent.match(/OPR\/([\d.]+)/)) === null || _j === void 0 ? void 0 : _j[1]) || '';
            }
            return { name: browserName, version };
        }
        catch (error) {
            console.warn('无法检测浏览器版本', error);
            return { name: 'unknown', version: 'unknown' };
        }
    }
    /**
     * 检测操作系统
     * @returns 操作系统名称和版本信息
     */
    static detectOS() {
        var _a, _b, _c, _d, _e;
        if (typeof navigator === 'undefined') {
            return { name: 'unknown', version: 'unknown' };
        }
        const userAgent = navigator.userAgent;
        let osName = 'unknown';
        let version = 'unknown';
        try {
            if (userAgent.indexOf('Windows') > -1) {
                osName = 'Windows';
                if (userAgent.indexOf('Windows NT 10.0') > -1)
                    version = '10';
                else if (userAgent.indexOf('Windows NT 6.3') > -1)
                    version = '8.1';
                else if (userAgent.indexOf('Windows NT 6.2') > -1)
                    version = '8';
                else if (userAgent.indexOf('Windows NT 6.1') > -1)
                    version = '7';
                else if (userAgent.indexOf('Windows NT 6.0') > -1)
                    version = 'Vista';
                else if (userAgent.indexOf('Windows NT 5.1') > -1)
                    version = 'XP';
            }
            else if (userAgent.indexOf('Mac OS X') > -1) {
                osName = 'macOS';
                version = ((_b = (_a = userAgent.match(/Mac OS X ([0-9_\.]+)/)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.replace(/_/g, '.')) || '';
            }
            else if (userAgent.indexOf('Android') > -1) {
                osName = 'Android';
                version = ((_c = userAgent.match(/Android ([0-9\.]+)/)) === null || _c === void 0 ? void 0 : _c[1]) || '';
            }
            else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
                osName = 'iOS';
                version = ((_e = (_d = userAgent.match(/OS ([0-9_\.]+)/)) === null || _d === void 0 ? void 0 : _d[1]) === null || _e === void 0 ? void 0 : _e.replace(/_/g, '.')) || '';
            }
            else if (userAgent.indexOf('Linux') > -1) {
                osName = 'Linux';
            }
            return { name: osName, version };
        }
        catch (error) {
            console.warn('无法检测操作系统', error);
            return { name: 'unknown', version: 'unknown' };
        }
    }
    /**
     * 获取完整的环境信息
     * @returns 完整的浏览器和操作系统信息
     */
    static getEnvironmentInfo() {
        const browserInfo = this.getBrowserInfo();
        const browserDetails = this.detectBrowser();
        const osDetails = this.detectOS();
        return {
            ...browserInfo,
            browser: browserDetails,
            os: osDetails
        };
    }
}

/**
 * 浏览器信息观察者
 * 负责收集和监控浏览器和设备相关信息
 */
class BrowserInfoObserver {
    /**
     * 创建浏览器信息观察者实例
     * @param options 浏览器信息观察者配置
     */
    constructor(options) {
        this.browserInfo = {};
        this.resizeHandler = null;
        this._resizeTimeout = 0;
        this.onUpdate = options.onUpdate;
        this.options = {
            enabled: options.enabled !== undefined ? options.enabled : true,
            trackResize: options.trackResize !== undefined ? options.trackResize : true,
            includeOSDetails: options.includeOSDetails !== undefined ? options.includeOSDetails : true,
            includeSizeInfo: options.includeSizeInfo !== undefined ? options.includeSizeInfo : true,
            onUpdate: options.onUpdate
        };
    }
    /**
     * 开始收集浏览器信息
     */
    start() {
        if (!this.options.enabled) {
            return;
        }
        try {
            // 收集初始浏览器信息
            this.collectBrowserInfo();
            // 如果启用了调整大小跟踪，则设置调整大小事件监听器
            if (this.options.trackResize && typeof window !== 'undefined') {
                this.resizeHandler = this.handleResize.bind(this);
                window.addEventListener('resize', this.resizeHandler);
                logger.debug('开始监听窗口大小变化');
            }
            logger.info('浏览器信息观察者已启动');
        }
        catch (error) {
            logger.error('启动浏览器信息观察者时出错', error);
        }
    }
    /**
     * 停止收集浏览器信息
     */
    stop() {
        if (this.resizeHandler && typeof window !== 'undefined') {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        logger.info('浏览器信息观察者已停止');
    }
    /**
     * 获取收集到的浏览器信息
     * @returns 浏览器和设备信息
     */
    getBrowserInfo() {
        return this.browserInfo;
    }
    /**
     * 手动更新浏览器信息
     */
    refresh() {
        this.collectBrowserInfo();
    }
    /**
     * 收集浏览器信息
     */
    collectBrowserInfo() {
        try {
            // 获取完整的环境信息
            const fullInfo = BrowserInfoCollector.getEnvironmentInfo();
            // 根据选项过滤信息
            if (!this.options.includeOSDetails) {
                delete fullInfo.os;
            }
            if (!this.options.includeSizeInfo) {
                delete fullInfo.screenSize;
                delete fullInfo.windowSize;
                delete fullInfo.devicePixelRatio;
            }
            // 添加当前URL
            if (typeof window !== 'undefined') {
                fullInfo.url = window.location.href;
            }
            this.browserInfo = fullInfo;
            // 通知更新
            this.onUpdate(this.browserInfo);
        }
        catch (error) {
            logger.error('收集浏览器信息时出错', error);
        }
    }
    /**
     * 处理窗口大小调整事件
     */
    handleResize() {
        if (typeof window === 'undefined') {
            return;
        }
        // 使用防抖动以避免频繁更新
        if (this.resizeHandler) {
            window.clearTimeout(this._resizeTimeout);
            this._resizeTimeout = window.setTimeout(() => {
                logger.debug('窗口大小已更改，更新浏览器信息');
                this.collectBrowserInfo();
            }, 500); // 500ms防抖动
        }
    }
}

// 从package.json获取版本号 - 这个值会在构建时被rollup插件替换
// 使用字符串形式，避免TypeScript编译错误
const VERSION = '0.0.3';
/**
 * 性能观察工具包 - 性能监控的主类
 */
class PerfObserverKit {
    /**
     * 创建性能观察工具包实例
     */
    constructor(options = {}) {
        this.coreWebVitalsObserver = null;
        this.resourceTimingObserver = null;
        this.longTasksObserver = null;
        this.navigationObserver = null;
        this.browserInfoObserver = null;
        this.metrics = {
            coreWebVitals: {},
            resources: [],
            longTasks: [],
            navigation: {},
            browserInfo: {}
        };
        this.isRunning = false;
        // 验证选项
        this.validateOptions(options);
        // 初始化日志级别
        const logLevel = this.determineLogLevel(options);
        // 构建内部选项配置
        this.options = {
            // 回调函数，在指标更新时调用
            onMetrics: options.onMetrics || null,
            // 通用设置
            debug: options.debug || false,
            logLevel: logLevel,
            autoStart: options.autoStart || false,
            samplingRate: options.samplingRate === undefined ? 0 : options.samplingRate,
            // 核心Web指标配置
            coreWebVitals: this.normalizeCoreWebVitalsOptions(options.coreWebVitals),
            // 资源计时配置
            resources: this.normalizeResourceOptions(options.resources),
            // 长任务配置
            longTasks: this.normalizeModuleOptions(options.longTasks, false),
            // 导航计时配置
            navigation: this.normalizeModuleOptions(options.navigation, false),
            // 浏览器信息配置 - 唯一默认启用的模块
            browserInfo: this.normalizeModuleOptions(options.browserInfo, true)
        };
        // 初始化日志系统 - 通过显式设置选项，确保即使在生产环境也能使用调试模式
        logger.setOptions({
            level: this.options.logLevel,
            disableInProduction: false // 确保生产环境中也能使用日志
        });
        // 输出初始化日志
        logger.debug('PerfObserverKit初始化完成，配置:', this.options);
        // 检查浏览器支持
        this.checkBrowserCompatibility();
        // 如果启用了自动开始，则自动启动监控
        if (this.options.autoStart) {
            this.start();
        }
    }
    /**
     * 验证传入的选项
     */
    validateOptions(options) {
        // 验证采样率
        if (options.samplingRate !== undefined &&
            (typeof options.samplingRate !== 'number' ||
                options.samplingRate < 0 ||
                options.samplingRate > 1)) {
            logger.warn('无效的采样率设置，应为0到1之间的数字，将使用默认值0');
            options.samplingRate = 0;
        }
        // 验证onMetrics回调
        if (options.onMetrics !== undefined && typeof options.onMetrics !== 'function') {
            logger.warn('onMetrics必须是一个函数，将使用默认空函数');
            options.onMetrics = () => { };
        }
    }
    /**
     * 检查浏览器兼容性
     */
    checkBrowserCompatibility() {
        if (!browserSupport.hasPerformanceAPI()) {
            logger.warn('当前浏览器不支持Performance API');
        }
        if (!browserSupport.hasPerformanceObserver()) {
            logger.warn('当前浏览器不支持PerformanceObserver');
        }
    }
    /**
     * 确定使用的日志级别
     */
    determineLogLevel(options) {
        if (options.logLevel !== undefined) {
            // 确保值在有效范围内
            const level = Number(options.logLevel);
            if (level >= LogLevel.NONE && level <= LogLevel.DEBUG) {
                return level;
            }
        }
        // 基于debug选项设置默认日志级别
        return options.debug ? LogLevel.DEBUG : LogLevel.WARN;
    }
    /**
     * 规范化模块配置为标准格式
     * @param options 用户提供的模块配置
     * @param defaultEnabled 默认是否启用
     */
    normalizeModuleOptions(options, defaultEnabled) {
        try {
            // 处理布尔值情况
            if (typeof options === 'boolean') {
                return { enabled: options };
            }
            // 处理对象情况
            if (options && typeof options === 'object') {
                return {
                    ...options,
                    enabled: options.enabled !== undefined ? options.enabled : defaultEnabled
                };
            }
            // 处理未定义情况
            return { enabled: defaultEnabled };
        }
        catch (error) {
            logger.error('规范化模块配置失败:', error);
            return { enabled: defaultEnabled };
        }
    }
    /**
     * 规范化资源计时选项
     */
    normalizeResourceOptions(options) {
        try {
            // 首先使用通用方法获取基础选项
            const normalizedOptions = this.normalizeModuleOptions(options, true);
            // 处理配置选项，设置默认值
            return {
                ...normalizedOptions,
                maxResources: normalizedOptions.maxResources !== undefined ? normalizedOptions.maxResources : 100,
                excludedPatterns: normalizedOptions.excludedPatterns || [],
                allowedTypes: normalizedOptions.allowedTypes || [], // 默认允许所有类型
                captureNetworkInfo: normalizedOptions.captureNetworkInfo !== undefined ? normalizedOptions.captureNetworkInfo : true,
                maxEntries: normalizedOptions.maxEntries !== undefined ? normalizedOptions.maxEntries : 1000
            };
        }
        catch (error) {
            logger.error('规范化资源计时选项失败:', error);
            return {
                enabled: false,
                maxResources: 100,
                excludedPatterns: [],
                allowedTypes: [],
                captureNetworkInfo: true,
                maxEntries: 1000
            };
        }
    }
    /**
     * 规范化核心Web指标选项
     */
    normalizeCoreWebVitalsOptions(options) {
        try {
            // 首先使用通用方法获取基础选项
            const normalizedOptions = this.normalizeModuleOptions(options, false);
            // 如果传入的是布尔值true，启用所有指标
            if (options === true) {
                return {
                    enabled: true,
                    fcp: true,
                    lcp: true,
                    fid: true,
                    cls: true,
                    inp: true,
                    maxLongTasks: 50,
                    maxResources: 100
                };
            }
            // 处理配置选项，设置默认值
            return {
                ...normalizedOptions,
                fcp: normalizedOptions.fcp !== undefined ? normalizedOptions.fcp : true,
                lcp: normalizedOptions.lcp !== undefined ? normalizedOptions.lcp : true,
                fid: normalizedOptions.fid !== undefined ? normalizedOptions.fid : false,
                cls: normalizedOptions.cls !== undefined ? normalizedOptions.cls : false,
                inp: normalizedOptions.inp !== undefined ? normalizedOptions.inp : false,
                maxLongTasks: normalizedOptions.maxLongTasks !== undefined ? normalizedOptions.maxLongTasks : 50,
                maxResources: normalizedOptions.maxResources !== undefined ? normalizedOptions.maxResources : 100
            };
        }
        catch (error) {
            logger.error('规范化核心Web指标选项失败:', error);
            return {
                enabled: false,
                fcp: false,
                lcp: false,
                fid: false,
                cls: false,
                inp: false,
                maxLongTasks: 50,
                maxResources: 100
            };
        }
    }
    /**
     * 开始监控性能指标
     */
    start() {
        if (this.isRunning) {
            logger.warn('性能监控已经在运行中');
            return;
        }
        logger.info('开始监控性能指标');
        // 采样率检查 - 如果配置了采样率，根据随机数决定是否收集数据
        if (this.options.samplingRate > 0 && Math.random() > this.options.samplingRate) {
            logger.debug(`根据采样率(${this.options.samplingRate})决定不收集此会话的性能数据`);
            // 将状态设置为运行中，但实际不启动监控
            this.isRunning = true;
            return;
        }
        // 使用通用方法启动各个观察器
        this.startObserver('coreWebVitals', this.startCoreWebVitalsMonitoring.bind(this));
        this.startObserver('resources', this.startResourceTimingMonitoring.bind(this));
        this.startObserver('longTasks', this.startLongTasksMonitoring.bind(this));
        this.startObserver('navigation', this.startNavigationMonitoring.bind(this));
        // 浏览器信息 - 默认启用，无论配置如何都启动
        this.startBrowserInfoMonitoring();
        this.isRunning = true;
        logger.debug('所有启用的性能监控模块已启动');
    }
    /**
     * 通用启动观察器方法
     */
    startObserver(name, startMethod) {
        const option = this.options[name];
        if (option && option.enabled) {
            startMethod();
        }
    }
    /**
     * 停止监控性能指标
     */
    stop() {
        if (!this.isRunning) {
            logger.warn('性能监控未在运行中');
            return;
        }
        logger.info('停止监控性能指标');
        // 停止并清理所有观察器
        this.cleanupObserver(this.coreWebVitalsObserver);
        this.cleanupObserver(this.resourceTimingObserver);
        this.cleanupObserver(this.longTasksObserver);
        this.cleanupObserver(this.navigationObserver);
        this.cleanupObserver(this.browserInfoObserver);
        // 重置所有观察器引用
        this.coreWebVitalsObserver = null;
        this.resourceTimingObserver = null;
        this.longTasksObserver = null;
        this.navigationObserver = null;
        this.browserInfoObserver = null;
        this.isRunning = false;
        logger.debug('所有性能监控模块已停止');
    }
    /**
     * 清理观察器
     */
    cleanupObserver(observer) {
        if (observer) {
            try {
                observer.stop();
            }
            catch (error) {
                logger.error('停止观察器失败:', error);
            }
        }
    }
    /**
     * 获取当前的指标数据
     */
    getMetrics() {
        return this.metrics;
    }
    /**
     * 清除指标数据
     */
    clearMetrics() {
        logger.debug('清除指标数据，保留浏览器信息');
        // 保存当前的浏览器信息
        const currentBrowserInfo = this.metrics.browserInfo;
        this.metrics = {
            coreWebVitals: {},
            resources: [],
            longTasks: [],
            navigation: {},
            // 保留浏览器信息不清除
            browserInfo: currentBrowserInfo
        };
    }
    /**
     * 设置日志级别
     * @param level 日志级别
     */
    setLogLevel(level) {
        if (level >= LogLevel.NONE && level <= LogLevel.DEBUG) {
            this.options.logLevel = level;
            logger.setLevel(level);
            logger.debug('已更新日志级别为:', level);
        }
        else {
            logger.warn('无效的日志级别:', level);
        }
    }
    /**
     * 设置调试模式
     * @param enabled 是否启用调试模式
     */
    setDebugMode(enabled) {
        this.options.debug = enabled;
        // 如果启用了调试模式，自动将日志级别设置为DEBUG
        if (enabled && this.options.logLevel < LogLevel.DEBUG) {
            this.setLogLevel(LogLevel.DEBUG);
        }
        // 确保生产环境也可以看到日志
        logger.setOptions({
            disableInProduction: false
        });
        logger.debug('调试模式已' + (enabled ? '启用' : '禁用'));
        // 输出更详细的诊断信息
        if (enabled) {
            const config = logger.getConfiguration();
            logger.debug('日志配置状态:', config);
            logger.debug('当前监控状态:', {
                isRunning: this.isRunning,
                activeObservers: {
                    coreWebVitals: !!this.coreWebVitalsObserver,
                    resources: !!this.resourceTimingObserver,
                    longTasks: !!this.longTasksObserver,
                    navigation: !!this.navigationObserver,
                    browserInfo: !!this.browserInfoObserver
                }
            });
        }
    }
    /**
     * 开始监控核心Web指标
     */
    startCoreWebVitalsMonitoring() {
        try {
            const requiredEntryTypes = [
                'paint', // For FCP
                'largest-contentful-paint',
                'first-input',
                'layout-shift'
            ];
            // 检查所需的条目类型是否受支持
            const unsupportedTypes = requiredEntryTypes.filter(type => !browserSupport.supportsEntryType(type));
            if (unsupportedTypes.length > 0) {
                logger.warn(`部分核心Web指标在当前浏览器中不受支持: ${unsupportedTypes.join(', ')}`);
            }
            // 将配置传递给观察者
            const options = this.options.coreWebVitals;
            this.coreWebVitalsObserver = new CoreWebVitalsObserver({
                onUpdate: (coreWebVitalsMetrics) => {
                    this.metrics.coreWebVitals = coreWebVitalsMetrics;
                    this.notifyMetricsUpdate(MetricType.WEB_VITALS, coreWebVitalsMetrics);
                },
                enabled: options.enabled,
                fcp: options.fcp,
                lcp: options.lcp,
                fid: options.fid,
                cls: options.cls,
                inp: options.inp,
                backgroundLoadThreshold: options.backgroundLoadThreshold
            });
            this.coreWebVitalsObserver.start();
            logger.debug('核心Web指标监控已启动');
        }
        catch (error) {
            logger.error('启动核心Web指标监控失败:', error);
        }
    }
    /**
     * 开始监控资源计时
     */
    startResourceTimingMonitoring() {
        try {
            if (!browserSupport.supportsEntryType('resource')) {
                logger.warn('当前浏览器不支持资源计时监控');
                return;
            }
            const options = this.options.resources;
            this.resourceTimingObserver = new ResourceTimingObserver((resources) => {
                this.notifyMetricsUpdate(MetricType.RESOURCES, resources);
                this.metrics.resources.push(...resources);
                this.metrics.resources = this.metrics.resources.slice(-options.maxResources);
            }, options.excludedPatterns, options.allowedTypes);
            this.resourceTimingObserver.start();
            logger.debug('资源计时监控已启动');
        }
        catch (error) {
            logger.error('启动资源计时监控失败:', error);
        }
    }
    /**
     * 开始监控长任务
     */
    startLongTasksMonitoring() {
        try {
            if (!browserSupport.supportsEntryType('longtask')) {
                logger.warn('当前浏览器不支持长任务监控');
                return;
            }
            const options = this.options.longTasks;
            const maxLongTasks = options.maxLongTasks || 50; // 提供默认值防止未定义
            this.longTasksObserver = new LongTasksObserver({
                onUpdate: (longTasks) => {
                    this.notifyMetricsUpdate(MetricType.LONG_TASKS, longTasks);
                    this.metrics.longTasks.push(...longTasks);
                    this.metrics.longTasks = this.metrics.longTasks.slice(-maxLongTasks);
                },
                enabled: options.enabled,
                threshold: options.threshold,
                maxEntries: options.maxEntries
            });
            this.longTasksObserver.start();
            logger.debug('长任务监控已启动');
        }
        catch (error) {
            logger.error('启动长任务监控失败:', error);
        }
    }
    /**
     * 开始监控导航计时
     */
    startNavigationMonitoring() {
        try {
            if (!browserSupport.supportsEntryType('navigation')) {
                logger.warn('当前浏览器不支持导航计时监控');
                return;
            }
            const options = this.options.navigation;
            this.navigationObserver = new NavigationObserver({
                onUpdate: (navigationMetrics) => {
                    this.metrics.navigation = navigationMetrics;
                    this.notifyMetricsUpdate(MetricType.NAVIGATION, navigationMetrics);
                },
                enabled: options.enabled,
                includeRawTiming: options.includeRawTiming
            });
            this.navigationObserver.start();
            logger.debug('导航计时监控已启动');
        }
        catch (error) {
            logger.error('启动导航计时监控失败:', error);
        }
    }
    /**
     * 开始监控浏览器信息
     */
    startBrowserInfoMonitoring() {
        try {
            const options = this.options.browserInfo;
            this.browserInfoObserver = new BrowserInfoObserver({
                onUpdate: (browserInfo) => {
                    this.metrics.browserInfo = browserInfo;
                    this.notifyMetricsUpdate(MetricType.BROWSER_INFO, browserInfo);
                },
                enabled: true, // 强制启用，无论配置如何
                trackResize: options.trackResize,
                includeOSDetails: options.includeOSDetails,
                includeSizeInfo: options.includeSizeInfo
            });
            this.browserInfoObserver.start();
            logger.debug('浏览器信息监控已启动');
        }
        catch (error) {
            logger.error('启动浏览器信息监控失败:', error);
        }
    }
    /**
     * 通知指标更新给回调函数
     */
    notifyMetricsUpdate(type, metrics) {
        try {
            if (this.options.onMetrics) {
                // 调用回调函数
                this.options.onMetrics(type, metrics);
            }
        }
        catch (error) {
            logger.error('指标更新回调执行失败:', error);
        }
    }
    /**
     * 获取库版本信息
     */
    getVersion() {
        return VERSION;
    }
    /**
     * 检查当前环境是否支持所有必要的API
     */
    static checkBrowserSupport() {
        const details = {
            performanceAPI: browserSupport.hasPerformanceAPI(),
            performanceObserver: browserSupport.hasPerformanceObserver(),
            navigation: browserSupport.supportsEntryType('navigation'),
            longtask: browserSupport.supportsEntryType('longtask'),
            resources: browserSupport.supportsEntryType('resource'),
            paint: browserSupport.supportsEntryType('paint'),
            largestContentfulPaint: browserSupport.supportsEntryType('largest-contentful-paint'),
            firstInput: browserSupport.supportsEntryType('first-input'),
            layoutShift: browserSupport.supportsEntryType('layout-shift')
        };
        // 基本支持需要Performance API和PerformanceObserver
        const supported = details.performanceAPI && details.performanceObserver;
        return { supported, details };
    }
    getStatus() {
        return {
            isRunning: this.isRunning,
            metrics: {
                coreWebVitals: !!this.coreWebVitalsObserver,
                resources: !!this.resourceTimingObserver,
                longTasks: !!this.longTasksObserver,
                navigation: !!this.navigationObserver,
                browserInfo: !!this.browserInfoObserver
            }
        };
    }
}

// 为浏览器环境添加全局对象
if (typeof window !== 'undefined') {
    window.PerfObserverKit = {
        PerfObserverKit,
        MetricType
    };
}

export { MetricType, PerfObserverKit };
//# sourceMappingURL=index.js.map
