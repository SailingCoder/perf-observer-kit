/**
 * 日志级别定义
 */
export enum LogLevel {
  NONE = 0,    // 不输出任何日志
  ERROR = 1,   // 只输出错误
  WARN = 2,    // 输出警告和错误
  INFO = 3,    // 输出信息、警告和错误
  DEBUG = 4    // 输出所有日志，包括调试信息
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
 * 日志工具类
 * 提供统一的日志输出接口，支持日志级别控制
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;
  private disableInProduction: boolean;
  private isProduction: boolean;

  /**
   * 创建日志器实例
   * @param options 日志器选项
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.prefix = options.prefix ?? '[PerfObserverKit]';
    this.disableInProduction = options.disableInProduction ?? true;
    
    // 检测是否为生产环境
    this.isProduction = typeof process !== 'undefined' && 
                      process.env && 
                      process.env.NODE_ENV === 'production';
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 输出调试日志
   * @param args 日志内容
   */
  debug(...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.prefix, ...args);
    }
  }

  /**
   * 输出普通信息日志
   * @param args 日志内容
   */
  info(...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.prefix, ...args);
    }
  }

  /**
   * 输出警告日志
   * @param args 日志内容
   */
  warn(...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.prefix, ...args);
    }
  }

  /**
   * 输出错误日志
   * @param args 日志内容
   */
  error(...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.prefix, ...args);
    }
  }

  /**
   * 判断是否应该输出指定级别的日志
   * @param messageLevel 日志消息级别
   * @returns 是否应该输出
   */
  private shouldLog(messageLevel: LogLevel): boolean {
    // 在生产环境中且配置了禁用，则不输出日志
    if (this.isProduction && this.disableInProduction) {
      return false;
    }
    
    // 日志级别不够，不输出
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
export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options);
} 