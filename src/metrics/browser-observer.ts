import { BrowserInfoCollector } from '../utils/browser-info';
import { logger } from '../utils/logger';

/**
 * 浏览器信息观察者选项
 */
export interface BrowserInfoObserverOptions {
    /** 指标更新回调函数 */
    onUpdate: (browserInfo: Record<string, any>) => void;

    /** 是否启用该观察者，默认为true */
    enabled?: boolean;

    /** 是否在窗口大小变化时重新收集，默认为false */
    trackResize?: boolean;

    /** 是否包含详细的操作系统信息，默认为true */
    includeOSDetails?: boolean;

    /** 是否包含屏幕和窗口尺寸信息，默认为true */
    includeSizeInfo?: boolean;
}

/**
 * 浏览器信息观察者
 * 负责收集和监控浏览器和设备相关信息
 */
export class BrowserInfoObserver {
    private options: Required<BrowserInfoObserverOptions>;
    private onUpdate: (browserInfo: Record<string, any>) => void;
    private browserInfo: Record<string, any> = {};
    private resizeHandler: (() => void) | null = null;

    /**
     * 创建浏览器信息观察者实例
     * @param options 浏览器信息观察者配置
     */
    constructor(options: BrowserInfoObserverOptions) {
        this.onUpdate = options.onUpdate;
        this.options = {
            enabled: options.enabled !== undefined ? options.enabled : true,
            trackResize: options.trackResize !== undefined ? options.trackResize : false,
            includeOSDetails: options.includeOSDetails !== undefined ? options.includeOSDetails : true,
            includeSizeInfo: options.includeSizeInfo !== undefined ? options.includeSizeInfo : true,
            onUpdate: options.onUpdate
        };
    }

    /**
     * 开始收集浏览器信息
     */
    start(): void {
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
        } catch (error) {
            logger.error('启动浏览器信息观察者时出错', error);
        }
    }

    /**
     * 停止收集浏览器信息
     */
    stop(): void {
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
    getBrowserInfo(): Record<string, any> {
        return this.browserInfo;
    }

    /**
     * 手动更新浏览器信息
     */
    refresh(): void {
        this.collectBrowserInfo();
    }

    /**
     * 收集浏览器信息
     */
    private collectBrowserInfo(): void {
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
        } catch (error) {
            logger.error('收集浏览器信息时出错', error);
        }
    }

    /**
     * 处理窗口大小调整事件
     */
    private handleResize(): void {
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

    private _resizeTimeout: number = 0;
} 