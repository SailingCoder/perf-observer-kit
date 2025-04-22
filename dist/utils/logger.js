/**
 * 日志级别定义
 */
export var LogLevel;
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
export class Logger {
    /**
     * 创建日志器实例
     * @param options 日志器选项
     */
    constructor(options = {}) {
        var _a, _b, _c;
        this.level = (_a = options.level) !== null && _a !== void 0 ? _a : LogLevel.INFO;
        this.prefix = (_b = options.prefix) !== null && _b !== void 0 ? _b : '[PerfObserverKit]';
        this.disableInProduction = (_c = options.disableInProduction) !== null && _c !== void 0 ? _c : true;
    }
    /**
     * 设置日志级别
     * @param level 日志级别
     */
    setLevel(level) {
        this.level = level;
    }
    /**
     * 输出调试日志
     * @param args 日志内容
     */
    debug(...args) {
        if (IS_DEV && this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.prefix, ...args);
        }
    }
    /**
     * 输出普通信息日志
     * @param args 日志内容
     */
    info(...args) {
        if (IS_DEV && this.shouldLog(LogLevel.INFO)) {
            console.info(this.prefix, ...args);
        }
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
        if (!IS_DEV && this.disableInProduction) {
            return false;
        }
        return messageLevel <= this.level;
    }
}
/**
 * 全局默认日志器实例
 */
export const logger = new Logger();
/**
 * 创建一个新的日志器实例
 * @param options 日志器选项
 * @returns 日志器实例
 */
export function createLogger(options = {}) {
    return new Logger(options);
}
//# sourceMappingURL=logger.js.map