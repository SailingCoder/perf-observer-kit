import { BaseObserver } from './base-observer';
import { logger } from '../../utils/logger';
/**
 * Cumulative Layout Shift (CLS) 观察者
 * 负责测量页面布局稳定性
 * 使用 Google Web Vitals 推荐的会话窗口计算方法
 */
export class CLSObserver extends BaseObserver {
    constructor(options) {
        super(options);
        this.clsObserver = null;
        // 会话窗口相关属性
        this.sessionEntries = [];
        this.sessionValues = [0]; // 各个会话窗口的CLS值
        this.sessionGap = 1000; // 会话间隔时间，单位毫秒
        this.sessionMax = 5; // 最大会话窗口数量
        // 上次报告的CLS值
        this.prevReportedValue = 0;
        // 上次偏移的时间戳
        this.lastEntryTime = 0;
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
                if (document.visibilityState !== 'visible')
                    return;
                for (const entry of entries) {
                    // 只计算用户未操作时的布局偏移
                    const layoutShift = entry;
                    if (!layoutShift.hadRecentInput && layoutShift.startTime < this.firstHiddenTime) {
                        // 更新会话窗口
                        this.updateSessionWindows(layoutShift);
                        // 计算最终CLS值
                        const clsValue = this.calculateCLS();
                        // 只有当CLS值显著变化时才报告
                        if (clsValue > this.prevReportedValue + 0.01 || clsValue < this.prevReportedValue - 0.01) {
                            this.reportCLS(clsValue);
                            this.prevReportedValue = clsValue;
                        }
                    }
                }
            });
            this.clsObserver.observe({ type: 'layout-shift', buffered: true });
        }
        catch (error) {
            logger.error('CLS监控不受支持', error);
        }
    }
    /**
     * 更新CLS会话窗口
     * 使用Google推荐的会话窗口方法
     * @see https://web.dev/articles/evolving-cls
     */
    updateSessionWindows(layoutShift) {
        const currentTime = layoutShift.startTime;
        // 如果是新会话
        if (currentTime - this.lastEntryTime > this.sessionGap) {
            // 添加新会话
            this.sessionValues.push(layoutShift.value);
            this.sessionEntries = [layoutShift];
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
        }
        else {
            // 累加到当前会话
            const currentSessionIndex = this.sessionValues.length - 1;
            this.sessionValues[currentSessionIndex] += layoutShift.value;
            this.sessionEntries.push(layoutShift);
        }
        // 更新最后一次偏移时间
        this.lastEntryTime = currentTime;
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
                shiftCount: this.sessionEntries.length,
                sessionValues: [...this.sessionValues],
                largestSession: this.calculateCLS(),
                firstHiddenTime: this.firstHiddenTime === Infinity ? null : this.firstHiddenTime
            }
        };
        // 设置评级
        cls.rating = this.assignCLSRating(cls.value);
        logger.debug(`报告CLS值: ${cls.value}，评级: ${cls.rating}`);
        this.onUpdate(cls);
    }
    /**
     * 停止CLS观察
     */
    stop() {
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
        // 更新firstHiddenTime
        if (!isVisible && this.firstHiddenTime === Infinity) {
            this.firstHiddenTime = performance.now();
            logger.debug(`页面隐藏，更新firstHiddenTime: ${this.firstHiddenTime}ms`);
            // 当页面隐藏时，报告当前的CLS值
            const clsValue = this.calculateCLS();
            if (clsValue > 0) {
                this.reportCLS(clsValue);
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
        this.sessionEntries = [];
        this.prevReportedValue = 0;
        this.lastEntryTime = 0;
        // 重置firstHiddenTime
        this.firstHiddenTime = this.initFirstHiddenTime();
        this.setupFirstHiddenTimeListener();
        logger.info('CLS值已在bfcache恢复后重置');
        // 重新开始CLS监测
        if (this.clsObserver) {
            this.clsObserver.disconnect();
            this.clsObserver = null;
        }
        this.observe();
    }
}
// CLS评分阈值
CLSObserver.CLS_GOOD_THRESHOLD = 0.1;
CLSObserver.CLS_NEEDS_IMPROVEMENT_THRESHOLD = 0.25;
//# sourceMappingURL=cls-observer.js.map