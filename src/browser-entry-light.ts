/**
 * 浏览器轻量级入口文件
 * 针对只需要核心功能的场景
 */

import { PerfObserverKit } from './perf-observer-kit';
import { MetricType } from './types';
import { logger, LogLevel } from './utils/logger';

// 命名导出
export { PerfObserverKit, MetricType, logger, LogLevel };

// 默认导出
export default { PerfObserverKit, MetricType, logger, LogLevel }; 