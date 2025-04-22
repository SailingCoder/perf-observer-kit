/**
 * 日志级别定义
 */
export declare enum LogLevel {
    NONE = 0,// 不输出任何日志
    ERROR = 1,// 只输出错误
    WARN = 2,// 输出警告和错误
    INFO = 3,// 输出信息、警告和错误
    DEBUG = 4
}
/**
 * 日志器选项
 */
export interface LoggerOptions {
    /** 日志级别 */
    level?: LogLevel;
    /** 是否在生产环境中禁用日志 */
    disableInProduction?: boolean;
    /** 自定义前缀 */
    prefix?: string;
}
/**
 * 日志工具类 - 精简版实现，在生产环境会被优化
 */
export declare class Logger {
    private level;
    private prefix;
    private disableInProduction;
    /**
     * 创建日志器实例
     * @param options 日志器选项
     */
    constructor(options?: LoggerOptions);
    /**
     * 设置日志级别
     * @param level 日志级别
     */
    setLevel(level: LogLevel): void;
    /**
     * 输出调试日志
     * @param args 日志内容
     */
    debug(...args: any[]): void;
    /**
     * 输出普通信息日志
     * @param args 日志内容
     */
    info(...args: any[]): void;
    /**
     * 输出警告日志
     * @param args 日志内容
     */
    warn(...args: any[]): void;
    /**
     * 输出错误日志
     * @param args 日志内容
     */
    error(...args: any[]): void;
    /**
     * 判断是否应该输出指定级别的日志
     * @param messageLevel 日志消息级别
     * @returns 是否应该输出
     */
    private shouldLog;
}
/**
 * 全局默认日志器实例
 */
export declare const logger: Logger;
/**
 * 创建一个新的日志器实例
 * @param options 日志器选项
 * @returns 日志器实例
 */
export declare function createLogger(options?: LoggerOptions): Logger;
