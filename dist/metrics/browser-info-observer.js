import { BrowserInfoCollector } from '../utils/browser-info';
import { logger } from '../utils/logger';
/**
 * 浏览器信息观察者
 * 负责收集和监控浏览器和设备相关信息
 */
export class BrowserInfoObserver {
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
//# sourceMappingURL=browser-info-observer.js.map