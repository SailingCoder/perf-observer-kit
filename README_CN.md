# PerfObserverKit

![版本](https://img.shields.io/npm/v/perf-observer-kit)
![许可证](https://img.shields.io/npm/l/perf-observer-kit)

一款模块化、轻量级的前端性能监控库，专为监测 Web 性能指标而设计，包括核心网页指标 (Core Web Vitals)、资源加载性能、长任务执行和导航计时。

[English](https://github.com/SailingCoder/perf-observer-kit/blob/main/README.md) | [中文文档](https://github.com/SailingCoder/perf-observer-kit/blob/main/README_CN.md)

## 🆕 最近更新

- **支持 INP 指标监控**：全面支持 Google 即将推出的 Interaction to Next Paint 交互到下一次绘制指标
- **优化 CLS 实现**：使用最新的会话窗口算法，符合 Google 最新标准
- **增强日志系统**：改进调试功能，支持在生产环境中进行故障排查

## 📋 特性

*   📊 **核心网页指标监控** - 监控 FCP（首次内容绘制）、LCP（最大内容绘制）、FID（首次输入延迟）、CLS（累积布局偏移）、INP（交互到下一次绘制）等关键性能指标
*   🔄 **资源加载监控** - 跟踪脚本、样式表、图片等资源的加载性能
*   ⏱️ **长任务监测** - 检测主线程阻塞超过指定阈值的 JavaScript 任务
*   🧭 **导航计时** - 完整收集导航相关的所有性能指标，如TTFB（首字节时间）、页面完全加载等关键指标
*   🖥️ **浏览器和环境信息** - 收集浏览器、操作系统和设备详情，以及屏幕尺寸和窗口大小
*   📱 **响应式兼容** - 适用于移动和桌面浏览器
*   ⚡ **BFCache 支持** - 正确处理浏览器前进/后退缓存场景
*   📝 **灵活日志系统** - 可配置的调试日志记录

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
    console.log(`指标更新 [${type}]：`, metrics);
    // 将指标数据发送到您的分析平台
  },
  // 启用所有监控模块
  coreWebVitals: true, // 启用核心指标监控，默认 FCP LCP
  resources: true,     // 启用资源监控
  longTasks: true,     // 启用长任务监控
  navigation: true,    // 启用导航计时监控
  browserInfo: true    // 启用浏览器信息监控
});

// 开始监控
perfMonitor.start();

// 随时访问指标
const currentMetrics = perfMonitor.getMetrics();
```

### 通过 CDN 在浏览器中使用

```html
<script src="https://unpkg.com/perf-observer-kit@latest/dist/perf-observer-kit.browser.js"></script>
<script>
  const monitor = new PerfObserverKit.PerfObserverKit({
    onMetrics: (type, metrics) => console.log(`指标 [${type}]：`, metrics)
  });
  
  monitor.start();
</script>
```

## 📖 文档（详细配置）

<details>
<summary><b>核心网页指标监控</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  coreWebVitals: {
    enabled: true,       // 启用核心网页指标监控
    fcp: true,           // 首次内容绘制 - 页面首次显示内容的时间
    lcp: true,           // 最大内容绘制 - 页面最大内容元素绘制完成的时间
    fid: true,           // 首次输入延迟 - 用户首次与页面交互的响应时间
    cls: true,           // 累积布局偏移 - 页面元素位置变化的累积分数
    inp: true            // 交互到下一次绘制 - 测量页面交互响应性能
  }
});
```

**核心指标解释：**
- **FCP（首次内容绘制）**：页面加载过程中首次显示任何文本、图像、非白色画布或SVG的时间点，表示用户第一次看到页面内容的时间。
- **LCP（最大内容绘制）**：视口内最大内容元素（通常是主图片或文本块）完成渲染的时间点，表示页面的主要内容何时可见。
- **FID（首次输入延迟）**：用户首次与页面交互（如点击链接或按钮）到浏览器实际能够响应该交互的时间，测量交互响应性。
- **CLS（累积布局偏移）**：测量页面元素在加载过程中意外移动的程度，量化视觉稳定性。
- **INP（交互到下一次绘制）**：测量用户交互与页面后到下一次屏幕更新之间的时间，是对页面响应性的综合测量。

**阈值标准：**
- FCP：良好 ≤ 1.8秒，差 > 3.0秒
- LCP：良好 ≤ 2.5秒，差 > 4.0秒
- FID：良好 ≤ 100毫秒，差 > 300毫秒
- CLS：良好 ≤ 0.1，差 > 0.25
- INP：良好 ≤ 200毫秒，差 > 500毫秒

[了解更多关于核心网页指标](https://web.dev/vitals/)

有关CLS实现和优化策略的详细信息，请参阅[累积布局偏移文档](./docs/cls-metrics-CN.md)。
</details>

<details>
<summary><b>资源加载监控</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  resources: {
    enabled: true,
    excludedPatterns: [/analytics\.com/, /tracker/, 'analytics-tracker.com'],  // 排除分析工具
    allowedTypes: ['script', 'img'],  // 要监控的类型，默认 ['script', 'link', 'img', 'css', 'font']
    maxResources: 100                   // 最大存储条目数
  }
});
```

捕获资源加载的详细信息：
- 资源 URL 和类型
- 加载时长和大小
- 首字节时间 (TTFB)
- 请求开始到完成的各阶段耗时
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

**长任务说明：** 长任务是指在主线程上执行时间超过特定阈值（通常为50毫秒）的JavaScript操作，这些任务会阻塞主线程，导致用户交互延迟、界面卡顿等问题。监控长任务有助于识别性能瓶颈和优化JavaScript执行。

监控功能提供以下信息：
- 任务持续时间
- 任务归属（脚本来源）
- 任务开始时间
</details>

<details>
<summary><b>导航计时监控 (Navigation Timing)</b></summary>

导航计时监控用于测量页面加载过程中的关键时间点，如TTFB（首字节时间）、DOM加载时间等。

```js
import { PerfObserverKit } from 'perf-observer-kit';

// 启用导航计时监控
const perfObserver = new PerfObserverKit({
  navigation: {
    enabled: true,
    includeRawTiming: false, // 是否包含原始导航计时数据
    onUpdate: (metrics) => {
      console.log('导航计时指标：', metrics);
      // 包含各个阶段的性能指标
    }
  }
});
```

![导航计时指标](https://github.com/SailingCoder/perf-observer-kit/raw/main/docs/images/image.png)

**导航计时指标 (按加载阶段分组)：**

*导航阶段*
- **unloadTime**：卸载前一个页面所需时间
- **redirectTime**：重定向所需时间

*服务工作线程和缓存*
- **serviceWorkerTime**：Service Worker启动时间
- **appCacheTime**：应用缓存时间

*网络连接阶段*
- **dnsTime**：DNS解析所需时间
- **tcpTime**：建立TCP连接所需时间
- **sslTime**：SSL握手时间

*请求/响应阶段*
- **ttfb**：首字节时间，从发起页面请求到接收到第一个字节的时间
- **requestTime**：请求发送时间
- **responseTime**：响应接收时间
- **resourceFetchTime**：资源获取总时间

*DOM处理阶段*
- **initDOMTime**：DOM初始化时间
- **processingTime**：DOM处理时间
- **contentLoadTime**：内容加载时间
- **domContentLoaded**：HTML文档被完全加载和解析的时间点

*页面加载完成指标*
- **loadEventDuration**：load事件处理时间
- **frontEndTime**：前端渲染时间
- **totalLoadTime**：总加载时间（从导航开始到load事件结束）

*元数据*
- **url**：页面URL地址
- **networkMetrics**：网络信息（下行速度、网络类型、往返时间等）
- **timestamp**：记录时的时间戳
- **rawTiming**：原始性能数据（开启includeRawTiming选项时可用）
- **complete**：是否已收集到完整的导航计时数据
- **metric**：指标类型

> **实现细节**：该库使用 `window.addEventListener('load')` 来收集导航事件，并确保指标仅在 loadEventEnd 可用时才报告，从而确保您获得准确的 loadEventDuration 值。导航计时数据在每次页面加载时只会收集一次。（后续考虑可以设置放开）

有关所有导航计时指标的详细信息，请参阅[导航计时文档](./docs/navigation-timing-CN.md)。
</details>

<details>
<summary><b>浏览器信息</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  browserInfo: {
    enabled: true,             // 启用浏览器信息监控
    trackResize: false,        // 窗口大小变化时更新，默认false
    includeOSDetails: true,    // 包含操作系统信息
    includeSizeInfo: true      // 包含屏幕/窗口大小
  }
});
```
</details>

<details>
<summary><b>完整配置选项</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  // 指标回调 - 指标更新时调用
  onMetrics: (type, metrics) => {
    console.log(`指标更新 [${type}]：`, metrics);
  },
  
  // 通用设置
  debug: false,              // 启用调试模式（详细日志）
  logLevel: 2,               // 0:无, 1:错误, 2:警告, 3:信息, 4:调试
  autoStart: false,          // 自动开始监控
  samplingRate: 0,           // 采样率 (0-1), 0 = 不采样
  
  // 模块配置
  coreWebVitals: true,       // 启用核心网页指标（布尔值或对象）
  resources: true,           // 启用资源计时（布尔值或对象）
  longTasks: true,           // 启用长任务（布尔值或对象）
  navigation: true,          // 启用导航计时（布尔值或对象）
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

**CLS 指标上下文属性：**
```javascript
// CLS 指标的额外上下文信息
console.log(metrics.coreWebVitals.cls.context.sessionValues);  // 所有会话值
console.log(metrics.coreWebVitals.cls.context.shiftCount);     // 布局偏移次数
console.log(metrics.coreWebVitals.cls.context.sessionCount);   // 会话数量
console.log(metrics.coreWebVitals.cls.context.isPageVisible);  // 页面可见性状态
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

// 高级用法：直接配置日志器
import { logger } from 'perf-observer-kit';

// 在生产环境中启用日志
logger.setOptions({
  disableInProduction: false
});

// 检查当前日志器配置
const config = logger.getConfiguration();
console.log('当前日志配置：', config);
```

日志级别：
- 0: NONE - 无日志
- 1: ERROR - 仅错误
- 2: WARN - 警告和错误（默认）
- 3: INFO - 信息、警告和错误
- 4: DEBUG - 详细调试信息

**注意**：在生产环境中进行故障排除时，日志器现在可以通过设置 `logger.setOptions({disableInProduction: false})` 来显示调试信息。这在生产环境中调试性能问题时特别有用。
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
<summary><b>最佳实践</b></summary>

1.  **选择性启用**：只启用你需要的监控模块，降低性能开销
    ```javascript
    const monitor = new PerfObserverKit({
      coreWebVitals: { enabled: true, fcp: true, lcp: true },
      resources: false,
      longTasks: false,
      navigation: true
    });
    ```

2.  **高流量网站使用采样**：使用采样率控制监控数据量
    ```javascript
    const monitor = new PerfObserverKit({
      samplingRate: 0.1  // 10% 的用户会被监控
    });
    ```

3.  **资源监控过滤**：排除分析工具等不相关资源
    ```javascript
    const monitor = new PerfObserverKit({
      resources: {
        excludedPatterns: [/analytics/, /tracking/, /ads/]
      }
    });
    ```

4.  **结合 BFCache 事件**：在页面从 BFCache 恢复时重新初始化
    ```javascript
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        // 页面从 BFCache 恢复
        monitor.clearMetrics();
        monitor.start();
      }
    });
    ```

5.  **避免大量数据传输**：定期发送数据或设置合理的批量大小
    ```javascript
    let metricsBuffer = [];

    const monitor = new PerfObserverKit({
      onMetrics: (type, metrics) => {
        metricsBuffer.push({type, metrics, timestamp: Date.now()});
        
        if (metricsBuffer.length >= 10) {
          sendToAnalytics(metricsBuffer);
          metricsBuffer = [];
        }
      }
    });
    ```

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

### 页面可见性与 CLS

如果您的 CLS 值看起来不一致，请注意以下几点：
- CLS 只在页面可见时测量
- 当页面转到后台时，CLS 收集会暂停
- 当页面重新变为可见时，会开始一个新的 CLS 会话
- CLS 使用会话窗口模型，以最大的会话值作为最终分数

### 浏览器兼容性

本库主要依赖于：
- Performance API
- PerformanceObserver
- 性能条目类型：largest-contentful-paint, first-input, layout-shift 等

对于不支持某些性能指标的浏览器，库会优雅降级，只收集支持的指标。
</details>

## 💪 相比其他性能监控库的优势

1.  **模块化设计**：可按需启用所需功能，减少性能开销
2.  **完整的核心指标支持**：全面支持 Google Core Web Vitals 所有指标，包括最新的 INP
3.  **精确的 CLS 实现**：使用最新的会话窗口算法，符合 Google 标准
4.  **全面的资源监控**：可配置的资源过滤和详细的资源加载性能数据
5.  **灵活的采样策略**：支持按比例采样，适合高流量生产环境
6.  **BFCache 支持**：正确处理浏览器前进/后退缓存场景
7.  **丰富的上下文数据**：提供比简单指标值更全面的上下文信息
8.  **强大的调试功能**：多级日志系统，支持生产环境故障排查
9.  **优雅降级**：在不支持某些 API 的浏览器中仍能收集可用指标
10. **轻量级**：核心体积小，对页面性能影响极小

## 📊 示例

查看[示例目录](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples)获取完整使用示例：

- [基本用法](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/basic-usage.html) - 简单实现
- [高级用法](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/advanced-usage.html) - 高级配置
- [模块化配置](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/modular-config.html) - 精细模块设置
- [日志系统用法](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/logger-usage.html) - 日志配置
- [BFCache 测试](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/test-bfcache.html) - 前进/后退缓存处理

## 📄 许可证

[MIT](LICENSE)