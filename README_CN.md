# PerfObserverKit

一个全面的 Web 性能监控库，专注于测量和报告 Core Web Vitals 和其他关键性能指标。

## 特性

- 📊 核心 Web 指标监控：LCP、FCP、CLS、FID、INP 等
- 🔄 资源加载性能跟踪
- ⏱️ 长任务检测
- 🧭 导航计时详细分析
- 💻 浏览器和设备信息收集
- 📱 响应式设计，适用于移动和桌面环境
- 🌐 支持单页应用 (SPA) 和传统网站
- 🔍 支持 BFCache 恢复场景的性能监控
- 📝 灵活的日志系统，可根据环境自动调整

## 安装

使用 npm：

```bash
npm install perf-observer-kit --save
```

使用 yarn：

```bash
yarn add perf-observer-kit
```

## 基本用法

```javascript
import { PerfObserverKit } from 'perf-observer-kit';

// 创建性能监控实例
const perfMonitor = new PerfObserverKit({
  onMetrics: function(metrics) {
    console.log('收集到性能指标:', metrics);
    // 可以将数据发送到分析服务器或展示在界面上
  },
  
  // 重要提示：除了浏览器信息外，所有模块都需要显式启用
  coreWebVitals: true, // 必须显式启用
  resourceTiming: true, // 必须显式启用
  longTasks: true, // 必须显式启用
  navigationTiming: true // 必须显式启用
});

// 启动监控
perfMonitor.start();

// ...稍后停止监控
// perfMonitor.stop();
```

## 高级配置

```javascript
const perfMonitor = new PerfObserverKit({
  // 基本配置
  onMetrics: function(metrics) {
    console.log('收集到性能指标:', metrics);
  },
  debug: false,             // 是否开启调试模式
  logLevel: 2,              // 日志级别 (0: 无日志, 1: 错误, 2: 警告, 3: 信息, 4: 调试)
  autoStart: true,          // 是否自动开始监控（默认为false，true时创建实例后立即开始监控，false时需要手动调用start()）
  samplingRate: 0,          // 采样率 (0-1), 0 表示不采样
  
  // 核心 Web 指标配置（需要显式开启）
  coreWebVitals: {
    enabled: true,          // 必须显式启用核心 Web 指标监控
    // 每个指标都必须单独配置启用
    includeFCP: true,       // 启用首次内容绘制监控
    includeLCP: true,       // 启用最大内容绘制监控
    includeFID: true,       // 启用首次输入延迟监控
    includeCLS: true,       // 启用累积布局偏移监控
    includeINP: true        // 启用交互到下一次绘制监控
  },
  
  // 资源计时配置（需要显式开启）
  resourceTiming: {
    enabled: true,          // 是否启用资源计时监控
    excludedPatterns: [     // 要排除的资源 URL 正则表达式
      /google-analytics.com/,
      /analytics/
    ],
    allowedTypes: [         // 要监控的资源类型
      'script', 'link', 'img', 'css', 'font', 'fetch', 'xmlhttprequest'
    ],
    maxEntries: 1000        // 最大记录条目数
  },
  
  // 长任务监控配置（需要显式开启）
  longTasks: {
    enabled: true,          // 是否启用长任务监控
    threshold: 50,          // 长任务阈值 (毫秒)
    maxEntries: 50          // 最大记录条目数
  },
  
  // 导航计时配置（需要显式开启）
  navigationTiming: {
    enabled: true,          // 是否启用导航计时监控
    includeRawTiming: false // 是否包含原始计时数据
  },
  
  // 浏览器信息配置（默认开启）
  browserInfo: {
    enabled: true,          // 浏览器信息收集默认开启
    trackResize: true,      // 窗口大小改变时是否更新信息
    includeOSDetails: true, // 是否包含详细的操作系统信息
    includeSizeInfo: true   // 是否包含屏幕和窗口尺寸信息
  }
});
```

## 日志系统

PerfObserverKit 提供了一个灵活的日志系统，用于调试和监控库的行为。

### 日志级别

```javascript
import { PerfObserverKit, LogLevel } from 'perf-observer-kit';

// 使用枚举设置日志级别
const perfMonitor = new PerfObserverKit({
  logLevel: LogLevel.DEBUG  // 使用 LogLevel 枚举
});

// 或使用数字设置日志级别
const perfMonitor2 = new PerfObserverKit({
  logLevel: 4  // 4 = DEBUG
});
```

可用的日志级别：

| 级别 | 数值 | 描述 |
|------|------|------|
| NONE | 0 | 不输出任何日志 |
| ERROR | 1 | 只输出错误 |
| WARN | 2 | 输出警告和错误 |
| INFO | 3 | 输出信息、警告和错误 |
| DEBUG | 4 | 输出所有日志，包括调试信息 |

### 动态调整日志级别

您可以在运行时动态调整日志级别：

```javascript
// 创建监控实例
const perfMonitor = new PerfObserverKit({
  logLevel: LogLevel.WARN  // 默认只显示警告和错误
});

// 在调试问题时临时设置更详细的日志级别
perfMonitor.setLogLevel(LogLevel.DEBUG);

// 问题解决后恢复到只显示警告
perfMonitor.setLogLevel(LogLevel.WARN);

// 或开启/关闭调试模式 (自动设置为 DEBUG 级别)
perfMonitor.setDebugMode(true);  // 设为 DEBUG 级别
perfMonitor.setDebugMode(false); // 保持当前级别不变
```

### 生产环境中的日志

默认情况下，在生产环境中（`NODE_ENV=production`）会自动禁用所有日志，以提高性能。如果您需要在生产环境中查看某些日志，可以使用自定义日志器：

```javascript
import { createLogger, LogLevel } from 'perf-observer-kit';

// 创建自定义日志器，设置为在生产环境中允许错误日志
const productionLogger = createLogger({
  level: LogLevel.ERROR,
  disableInProduction: false,  // 在生产环境中不禁用
  prefix: '[MyApp Performance]'  // 自定义前缀
});

// 使用自定义日志器记录性能问题
productionLogger.error('发现严重性能问题:', details);
```

## BFCache 恢复支持

PerfObserverKit 能够监测浏览器从 BFCache（后退/前进缓存）恢复的网页，并正确计算恢复后的性能指标。

当页面从 BFCache 恢复时：
1. LCP 指标会被重新计算，基于从恢复时间点开始的时间差
2. 用户交互状态会被重置
3. 性能监控会自动重新初始化

无需额外配置，这些功能已内置到库中。

## 页面可见性跟踪

PerfObserverKit 根据页面可见性状态智能处理性能指标：

1. 当页面隐藏时（切换标签页或最小化窗口）：
   - LCP 事件将被忽略
   - 资源加载继续监控，但会添加页面隐藏时的上下文信息

2. 用户交互跟踪：
   - 在第一次点击或按键后，LCP 监控将停止（符合 Web Vitals 标准）
   - 交互状态会在性能数据中标记，便于分析

## 浏览器和设备信息收集

PerfObserverKit 提供了浏览器和设备信息收集功能，帮助您了解用户环境对性能的影响。**该功能是唯一默认开启的模块**。

**重要说明：** 除了浏览器信息收集外，其他所有模块（核心Web指标、资源计时、长任务和导航计时）都必须显式配置才能开启。特别是核心Web指标中的每个子指标（FCP、LCP、FID、CLS、INP等）也都需要单独配置启用。

### 收集的信息类型

- **浏览器信息**：名称、版本、厂商
- **操作系统**：名称、版本
- **屏幕和窗口尺寸**：宽度、高度
- **设备像素比**：用于高DPI屏幕
- **当前页面URL**：完整URL地址
- **语言和平台**：用户语言偏好和平台信息

### 使用方式

```javascript
// 获取浏览器和设备信息
const browserInfo = perfMonitor.getMetrics().browserInfo;

// 检查不同的浏览器类型
if (browserInfo.browser.name === 'Chrome') {
  // Chrome特定的处理逻辑
}

// 根据操作系统调整性能优化
if (browserInfo.os.name === 'iOS') {
  // iOS设备优化
}

// 根据屏幕尺寸优化
if (browserInfo.screenSize.width < 768) {
  // 移动设备优化
}
```

### 实时更新

启用 `trackResize` 选项后，浏览器信息会在窗口大小变化时自动更新，使您能够跟踪用户调整窗口大小时的性能影响。

```javascript
const perfMonitor = new PerfObserverKit({
  browserInfo: {
    enabled: true,
    trackResize: true  // 窗口大小变化时更新信息
  },
  onMetrics: function(metrics) {
    // 窗口大小变化时会触发此回调，包含最新的浏览器信息
    console.log('当前窗口尺寸:', metrics.browserInfo.windowSize);
  }
});
```

## 自定义和扩展

### 自定义指标收集

```javascript
const perfMonitor = new PerfObserverKit({
  onMetrics: function(metrics) {
    // 添加您自己的业务自定义指标
    metrics.custom = {
      businessMetric: calculateBusinessMetric(),
      userTimingMarks: performance.getEntriesByType('mark'),
      userTimingMeasures: performance.getEntriesByType('measure')
    };
    
    // 发送到分析服务
    sendToAnalytics(metrics);
  }
});
```

### 集成用户体验指标

```javascript
// 记录用户交互指标
function trackUserInteraction(interactionName) {
  // 使用 User Timing API 标记开始
  performance.mark(`${interactionName}-start`);
  
  return {
    end: function() {
      // 标记结束并测量
      performance.mark(`${interactionName}-end`);
      performance.measure(
        interactionName,
        `${interactionName}-start`,
        `${interactionName}-end`
      );
    }
  };
}

// 使用示例
document.getElementById('searchButton').addEventListener('click', function() {
  const interaction = trackUserInteraction('search');
  
  // 执行搜索...
  performSearch().then(() => {
    // 搜索完成后结束测量
    interaction.end();
  });
});
```

## 排障指南

### 设置调试模式

```javascript
const perfMonitor = new PerfObserverKit({
  debug: true,
  logLevel: LogLevel.DEBUG
});
```

开启调试模式后，在浏览器控制台中将显示详细的日志，包括：
- 性能观察器的注册和初始化
- 指标收集事件和测量值
- 页面可见性变化和用户交互事件
- BFCache 恢复事件

### 常见问题

#### 1. 不同浏览器的兼容性

某些性能指标在旧浏览器中可能不可用。PerfObserverKit 会自动检测浏览器支持，并只收集可用的指标，同时在控制台输出警告信息。

#### 2. 数据采样

对于高流量网站，可以设置采样率来减少数据量：

```javascript
const perfMonitor = new PerfObserverKit({
  samplingRate: 0.1  // 只记录 10% 的用户数据
});
```

#### 3. 内存泄漏

长时间运行的应用应该在不需要监控时停止监控：

```javascript
// 在 SPA 路由变化时
router.beforeEach((to, from, next) => {
  // 停止当前页面的监控
  if (perfMonitor) {
    perfMonitor.stop();
  }
  
  next();
});

router.afterEach((to) => {
  // 为新页面创建新的监控
  perfMonitor = new PerfObserverKit({
    onMetrics: (metrics) => {
      console.log(`页面 ${to.path} 的性能指标:`, metrics);
    }
  });
  perfMonitor.start();
});
```

## API 参考

### PerfObserverKit 类

#### 构造函数

```javascript
new PerfObserverKit(options)
```

#### 方法

| 方法 | 描述 |
|------|------|
| `start()` | 开始监控性能指标 |
| `stop()` | 停止监控性能指标 |
| `getMetrics()` | 获取当前收集的所有指标 |
| `clearMetrics()` | 清除已收集的指标数据 |
| `setLogLevel(level)` | 设置日志级别 |
| `setDebugMode(enabled)` | 设置调试模式 |

### 日志 API

#### LogLevel 枚举

```javascript
import { LogLevel } from 'perf-observer-kit';

LogLevel.NONE   // 0
LogLevel.ERROR  // 1
LogLevel.WARN   // 2
LogLevel.INFO   // 3
LogLevel.DEBUG  // 4
```

#### 全局日志器

```javascript
import { logger } from 'perf-observer-kit';

logger.debug('调试信息');
logger.info('一般信息');
logger.warn('警告信息');
logger.error('错误信息');
```

#### 创建自定义日志器

```javascript
import { createLogger, LogLevel } from 'perf-observer-kit';

const customLogger = createLogger({
  level: LogLevel.INFO,
  disableInProduction: true,
  prefix: '[CustomModule]'
});
```

## 兼容性

- 主要功能：Chrome 60+, Firefox 58+, Safari 11+, Edge 79+
- 部分功能（如 INP 和 CLS）可能需要更新的浏览器版本
- 在不支持某些 API 的浏览器中，库会优雅降级，只收集可用的指标

## 贡献

欢迎提交问题和拉取请求。请确保更新测试并遵循代码风格指南。

## 许可证

MIT

## 获取性能指标

```javascript
// 随时获取当前的性能指标
const metrics = perfMonitor.getMetrics();

// 核心Web指标
console.log(metrics.coreWebVitals.fcp);  // 首次内容绘制
console.log(metrics.coreWebVitals.lcp);  // 最大内容绘制
console.log(metrics.coreWebVitals.fid);  // 首次输入延迟
console.log(metrics.coreWebVitals.cls);  // 累积布局偏移
console.log(metrics.coreWebVitals.inp);  // 交互到下一次绘制

// 资源加载指标
console.log(metrics.resources);          // 资源加载指标数组

// 长任务指标
console.log(metrics.longTasks);          // 长任务指标数组

// 导航计时指标
console.log(metrics.navigation.ttfb);    // 首字节时间
console.log(metrics.navigation.domContentLoaded); // DOM内容加载完成时间

// 浏览器信息
console.log(metrics.browserInfo);        // 浏览器和设备信息
console.log(metrics.browserInfo.browser); // 浏览器名称和版本
console.log(metrics.browserInfo.os);     // 操作系统详细信息
console.log(metrics.browserInfo.screenSize); // 屏幕尺寸
console.log(metrics.browserInfo.windowSize); // 窗口尺寸
```