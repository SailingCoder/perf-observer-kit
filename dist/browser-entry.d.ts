/**
 * 浏览器入口文件
 * 这个文件是为了生成可直接在浏览器中使用的UMD模块
 */
import { PerfObserverKit } from './core/perf-observer-kit';
import { CoreWebVitalsObserver } from './metrics/core-web-vitals';
import { MetricType } from './types';
import { logger, LogLevel } from './utils/logger';
declare const LibraryExports: {
    PerfObserverKit: typeof PerfObserverKit;
    CoreWebVitalsObserver: typeof CoreWebVitalsObserver;
    MetricType: typeof MetricType;
    logger: import("./utils/logger").Logger;
    LogLevel: typeof LogLevel;
};
export { PerfObserverKit, CoreWebVitalsObserver, MetricType, logger, LogLevel };
export default LibraryExports;
