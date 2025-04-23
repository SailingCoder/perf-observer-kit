import { PerfObserverOptions, PerformanceMetrics } from '../types';
import { LogLevel } from '../utils/logger';
/**
 * 性能观察工具包 - 性能监控的主类
 */
export declare class PerfObserverKit {
    private options;
    private coreWebVitalsObserver;
    private resourceTimingObserver;
    private longTasksObserver;
    private navigationObserver;
    private browserInfoObserver;
    private metrics;
    private isRunning;
    /**
     * 创建性能观察工具包实例
     */
    constructor(options?: PerfObserverOptions);
    /**
     * 验证传入的选项
     */
    private validateOptions;
    /**
     * 检查浏览器兼容性
     */
    private checkBrowserCompatibility;
    /**
     * 确定使用的日志级别
     */
    private determineLogLevel;
    /**
     * 规范化模块配置为标准格式
     * @param options 用户提供的模块配置
     * @param defaultEnabled 默认是否启用
     */
    private normalizeModuleOptions;
    /**
     * 规范化资源计时选项
     */
    private normalizeResourceOptions;
    /**
     * 规范化核心Web指标选项
     */
    private normalizeCoreWebVitalsOptions;
    /**
     * 开始监控性能指标
     */
    start(): void;
    /**
     * 通用启动观察器方法
     */
    private startObserver;
    /**
     * 停止监控性能指标
     */
    stop(): void;
    /**
     * 清理观察器
     */
    private cleanupObserver;
    /**
     * 获取当前的指标数据
     */
    getMetrics(): PerformanceMetrics;
    /**
     * 清除指标数据
     */
    clearMetrics(): void;
    /**
     * 设置日志级别
     * @param level 日志级别
     */
    setLogLevel(level: LogLevel): void;
    /**
     * 设置调试模式
     * @param enabled 是否启用调试模式
     */
    setDebugMode(enabled: boolean): void;
    /**
     * 开始监控核心Web指标
     */
    private startCoreWebVitalsMonitoring;
    /**
     * 开始监控资源计时
     */
    private startResourceTimingMonitoring;
    /**
     * 开始监控长任务
     */
    private startLongTasksMonitoring;
    /**
     * 开始监控导航计时
     */
    private startNavigationMonitoring;
    /**
     * 开始监控浏览器信息
     */
    private startBrowserInfoMonitoring;
    /**
     * 通知指标更新给回调函数
     */
    private notifyMetricsUpdate;
    /**
     * 获取库版本信息
     */
    getVersion(): string;
    /**
     * 检查当前环境是否支持所有必要的API
     */
    static checkBrowserSupport(): {
        supported: boolean;
        details: Record<string, boolean>;
    };
    getStatus(): {
        isRunning: boolean;
        metrics: {
            coreWebVitals: boolean;
            resources: boolean;
            longTasks: boolean;
            navigation: boolean;
            browserInfo: boolean;
        };
    };
}
