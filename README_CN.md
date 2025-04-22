# PerfObserverKit

![版本](https://img.shields.io/npm/v/perf-observer-kit)
![许可证](https://img.shields.io/npm/l/perf-observer-kit)

一个轻量级、灵活的库，用于监控网页性能指标，包括核心网页指标（Core Web Vitals）、资源加载性能、长任务（Long Tasks）和导航计时（Navigation Timing）。

[English](./README.md) | [中文文档](./README_CN.md)

## 📋 功能特点

- 📊 **核心网页指标** - 监控 FCP、LCP、FID、CLS、INP
- 🔄 **资源计时** - 跟踪脚本、样式表、图片等资源加载性能
- ⏱️ **长任务监控** - 检测阻塞主线程的 JavaScript 任务
- 🧭 **导航计时** - 测量 TTFB、DOM 事件、页面加载指标
- 🖥️ **浏览器信息** - 收集浏览器、操作系统和设备详情
- 📱 **响应式设计** - 兼容移动端和桌面端浏览器
- ⚡ **支持 BFCache** - 正确处理浏览器前进/后退缓存场景
- 📝 **灵活的日志系统** - 可配置的调试日志

## 🚀 快速开始

### 安装

```bash
npm install perf-observer-kit
```

### 基本用法

```javascript
import { PerfObserverKit } from 'perf-observer-kit';

// 创建性能监控实例
const perfMonitor = new PerfObserverKit({
  onMetrics: (type, metrics) => {
    console.log(`指标更新 [${type}]:`, metrics);
    // 将指标发送到您的分析平台
  },
  // 启用所有监控模块
  coreWebVitals: true,
  resourceTiming: true,
  longTasks: true,
  navigationTiming: true
});

// 开始监控
perfMonitor.start();

// 随时获取指标
const currentMetrics = perfMonitor.getMetrics();
```

### 通过 CDN 在浏览器中使用

```html
<script src="https://unpkg.com/perf-observer-kit@latest/dist/perf-observer-kit.browser.js"></script>
<script>
  const monitor = new PerfObserverKit.PerfObserverKit({
    onMetrics: (type, metrics) => console.log(`指标 [${type}]:`, metrics)
  });
  
  monitor.start();
</script>
```

## 📖 文档

<details>
<summary><b>核心网页指标监控</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  coreWebVitals: {
    enabled: true,       // 启用核心网页指标监控
    fcp: true,           // 首次内容绘制
    lcp: true,           // 最大内容绘制
    fid: true,           // 首次输入延迟
    cls: true,           // 累积布局偏移
    inp: true            // 交互到下一次绘制
  }
});
```

**阈值标准:**
- FCP: 良好 ≤ 1.8秒, 差 > 3.0秒
- LCP: 良好 ≤ 2.5秒, 差 > 4.0秒
- FID: 良好 ≤ 100毫秒, 差 > 300毫秒
- CLS: 良好 ≤ 0.1, 差 > 0.25
- INP: 良好 ≤ 200毫秒, 差 > 500毫秒

[了解更多关于核心网页指标](https://web.dev/vitals/)
</details>

<details>
<summary><b>资源计时监控</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  resourceTiming: {
    enabled: true,
    excludedPatterns: [/analytics\.com/, /tracker/],  // 排除分析工具
    allowedTypes: ['script', 'img', 'css', 'fetch'],  // 要监控的类型
    maxEntries: 500                                   // 最大存储条目数
  }
});
```

捕获资源加载的详细信息：
- 资源 URL 和类型
- 加载时长和大小
- 首字节时间 (TTFB)
- 连接和处理时间
</details>

<details>
<summary><b>长任务监控</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  longTasks: {
    enabled: true,      // 启用长任务监控
    threshold: 50,      // 任务时长阈值（毫秒）
    maxEntries: 100     // 最大存储条目数
  }
});
```

检测阻塞主线程超过 50 毫秒的 JavaScript 任务，提供：
- 任务持续时间
- 任务归属（脚本来源）
- 任务开始时间
</details>

<details>
<summary><b>导航计时</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  navigationTiming: {
    enabled: true,           // 启用导航计时
    includeRawTiming: false  // 包含原始性能条目
  }
});
```

测量关键页面加载指标：
- TTFB (首字节时间)
- DOM Content Loaded (DOM 内容加载完成)
- Load Event (加载事件)
- 网络连接详情
</details>

<details>
<summary><b>浏览器信息</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  browserInfo: {
    enabled: true,             // 默认启用
    trackResize: true,         // 窗口大小变化时更新
    includeOSDetails: true,    // 包含操作系统信息
    includeSizeInfo: true      // 包含屏幕/窗口大小
  }
});
```

**注意：** 浏览器信息是唯一默认启用的模块。
</details>

<details>
<summary><b>完整配置选项</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  // 指标回调 - 指标更新时调用
  onMetrics: (type, metrics) => {
    console.log(`指标更新 [${type}]:`, metrics);
  },
  
  // 通用设置
  debug: false,              // 启用调试模式（详细日志）
  logLevel: 2,               // 0:无, 1:错误, 2:警告, 3:信息, 4:调试
  autoStart: false,          // 自动开始监控
  samplingRate: 0,           // 采样率 (0-1), 0 = 不采样
  
  // 模块配置
  coreWebVitals: true,       // 启用核心网页指标（布尔值或对象）
  resourceTiming: true,      // 启用资源计时（布尔值或对象）
  longTasks: true,           // 启用长任务（布尔值或对象）
  navigationTiming: true,    // 启用导航计时（布尔值或对象）
  browserInfo: true          // 启用浏览器信息（布尔值或对象）
});
```
</details>

<details>
<summary><b>获取指标</b></summary>

```javascript
// 随时获取当前指标
const metrics = perfMonitor.getMetrics();

// 核心网页指标
console.log(metrics.coreWebVitals.fcp);  // 首次内容绘制
console.log(metrics.coreWebVitals.lcp);  // 最大内容绘制
console.log(metrics.coreWebVitals.fid);  // 首次输入延迟
console.log(metrics.coreWebVitals.cls);  // 累积布局偏移
console.log(metrics.coreWebVitals.inp);  // 交互到下一次绘制

// 资源
console.log(metrics.resources);          // 资源指标数组

// 长任务
console.log(metrics.longTasks);          // 长任务数组

// 导航计时
console.log(metrics.navigation.ttfb);    // 首字节时间
```
</details>

<details>
<summary><b>日志和调试</b></summary>

```javascript
// 初始化时启用调试模式
const perfMonitor = new PerfObserverKit({
  debug: true                // 设置日志级别为 DEBUG
});

// 初始化后调整日志级别
perfMonitor.setLogLevel(4);  // 4 = DEBUG（最详细）
perfMonitor.setDebugMode(true);  // 启用调试模式

// 清除收集的指标
perfMonitor.clearMetrics();
```

日志级别：
- 0: NONE - 无日志
- 1: ERROR - 仅错误
- 2: WARN - 警告和错误（默认）
- 3: INFO - 信息、警告和错误
- 4: DEBUG - 详细调试信息
</details>

<details>
<summary><b>API 参考</b></summary>

### 方法

| 方法 | 描述 |
|--------|-------------|
| `start()` | 开始监控性能指标 |
| `stop()` | 停止监控性能指标 |
| `getMetrics()` | 获取当前收集的指标 |
| `clearMetrics()` | 清除所有收集的指标 |
| `setLogLevel(level)` | 设置日志级别 (0-4) |
| `setDebugMode(enabled)` | 启用或禁用调试模式 |

### 事件类型

`MetricType` 枚举值：
- `WEB_VITALS` - 核心网页指标
- `RESOURCES` - 资源计时指标
- `LONG_TASKS` - 长任务指标
- `NAVIGATION` - 导航计时指标
- `BROWSER_INFO` - 浏览器信息指标
</details>

<details>
<summary><b>故障排除</b></summary>

### "PerfObserverKit is not defined" 错误

如果在浏览器中遇到此错误，请确保使用正确的浏览器构建版本：

```html
<!-- 在浏览器环境中总是使用浏览器构建版本 -->
<script src="https://unpkg.com/perf-observer-kit@latest/dist/perf-observer-kit.browser.js"></script>
```

不要在浏览器代码中直接使用非浏览器构建版本：

```html
<!-- ❌ 不要在浏览器环境中使用这个 -->
<script src="https://unpkg.com/perf-observer-kit@latest/dist/index.js"></script>
```

### 浏览器兼容性

本库主要依赖于：
- Performance API
- PerformanceObserver
- 性能条目类型：largest-contentful-paint, first-input, layout-shift 等

对于不支持某些性能指标的浏览器，库会优雅降级，只收集支持的指标。
</details>

## 📊 示例

查看[示例目录](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples)获取完整使用示例：

- [基本用法](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/basic-usage.html) - 简单实现
- [高级用法](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/advanced-usage.html) - 高级配置
- [模块化配置](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/modular-config.html) - 精细模块设置
- [日志系统用法](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/logger-usage.html) - 日志配置
- [BFCache 测试](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/test-bfcache.html) - 前进/后退缓存处理

## 📄 许可证

[MIT](LICENSE)