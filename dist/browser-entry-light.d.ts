/**
 * 轻量级浏览器入口文件
 * 提供最小化版本，仅包含核心功能
 */
import { PerfObserverKit } from './perf-observer-kit';
import { MetricType } from './types/metric-types';
export { PerfObserverKit, MetricType };
declare const _default: {
    PerfObserverKit: typeof PerfObserverKit;
    MetricType: typeof MetricType;
};
export default _default;
