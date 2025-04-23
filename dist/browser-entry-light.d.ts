/**
 * 浏览器轻量级入口文件
 * 针对只需要核心功能的场景
 */
import { PerfObserverKit } from './core/perf-observer-kit';
import { MetricType } from './types';
import { logger, LogLevel } from './utils/logger';
export { PerfObserverKit, MetricType, logger, LogLevel };
declare const _default: {
    PerfObserverKit: typeof PerfObserverKit;
    MetricType: typeof MetricType;
    logger: import("./utils/logger").Logger;
    LogLevel: typeof LogLevel;
};
export default _default;
