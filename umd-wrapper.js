(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PerfObserverKit = {}));
})(this, (function (exports) { 'use strict';
  
  // 这里会包含编译后的代码
  // 在构建过程中，我们会将编译后的代码插入这里
  
  // 确保PerfObserverKit正确导出
  if (typeof exports.PerfObserverKit === 'undefined' && typeof exports.default !== 'undefined') {
    exports.PerfObserverKit = exports.default;
  }
  
  // 导出主模块
  Object.defineProperty(exports, '__esModule', { value: true });
  
})); 