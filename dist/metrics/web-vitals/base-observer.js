import { NetworkMetricsCollector } from '../../utils/network-metrics';
import { calculateTimeDelta } from '../../utils/time';
import { logger } from '../../utils/logger';
/**
 * 基础观察者类
 * 提供所有Web指标观察者共享的功能
 */
export class BaseObserver {
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
//# sourceMappingURL=base-observer.js.map