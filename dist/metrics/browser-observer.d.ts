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
export declare class BrowserInfoObserver {
    private options;
    private onUpdate;
    private browserInfo;
    private resizeHandler;
    /**
     * 创建浏览器信息观察者实例
     * @param options 浏览器信息观察者配置
     */
    constructor(options: BrowserInfoObserverOptions);
    /**
     * 开始收集浏览器信息
     */
    start(): void;
    /**
     * 停止收集浏览器信息
     */
    stop(): void;
    /**
     * 获取收集到的浏览器信息
     * @returns 浏览器和设备信息
     */
    getBrowserInfo(): Record<string, any>;
    /**
     * 手动更新浏览器信息
     */
    refresh(): void;
    /**
     * 收集浏览器信息
     */
    private collectBrowserInfo;
    /**
     * 处理窗口大小调整事件
     */
    private handleResize;
    private _resizeTimeout;
}
