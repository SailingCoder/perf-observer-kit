(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PerfObserverKit = {}));
})(this, (function (exports) { 'use strict';
  
  import { PerfObserverKit } from './perf-observer-kit';
// 导出所有类型
export { PerfObserverKit };
// 为浏览器环境添加全局对象
if (typeof window !== 'undefined') {
    window.PerfObserverKit = {
        PerfObserverKit
    };
}
//# sourceMappingURL=index.js.map
  
  // 导出主模块
  Object.defineProperty(exports, '__esModule', { value: true });
  
})); 