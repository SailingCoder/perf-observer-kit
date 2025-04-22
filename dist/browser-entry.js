/**
 * 浏览器入口文件
 * 这个文件是为了生成可直接在浏览器中使用的UMD模块
 */
import { PerfObserverKit } from './perf-observer-kit';
import { CoreWebVitalsObserver } from './metrics/core-web-vitals';
import { MetricType } from './types';
// 创建一个对象供浏览器使用
const LibraryExports = {
    PerfObserverKit: PerfObserverKit,
    CoreWebVitalsObserver: CoreWebVitalsObserver,
    MetricType: MetricType
};
// 导出整个对象作为命名导出
export { PerfObserverKit, CoreWebVitalsObserver, MetricType };
// 导出默认值等于主要类的实例化方法
export default LibraryExports;
//# sourceMappingURL=browser-entry.js.map