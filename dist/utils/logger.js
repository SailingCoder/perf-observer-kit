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
        this.disableInProduction = (_c = options.disableInProduction) !== null && _c !== void 0 ? _c : false; // 默认允许在生产环境输出日志
    }
    /**
     * 设置日志级别
     * @param level 日志级别
     */
    setLevel(level) {
        this.level = level;
        // 输出一条日志，确认级别已更改
        console.log(`${this.prefix} 日志级别已更改为: ${LogLevel[level]} (${level})`);
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
        console.log(`${this.prefix} 日志配置已更新:`, {
            level: LogLevel[this.level],
            disableInProduction: this.disableInProduction,
            isDevEnv: IS_DEV
        });
    }
    /**
     * 输出调试日志
     * @param args 日志内容
     */
    debug(...args) {
        // 移除IS_DEV条件，允许生产环境输出调试信息
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.prefix, ...args);
        }
    }
    /**
     * 输出普通信息日志
     * @param args 日志内容
     */
    info(...args) {
        // 移除IS_DEV条件，允许生产环境输出信息
        if (this.shouldLog(LogLevel.INFO)) {
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