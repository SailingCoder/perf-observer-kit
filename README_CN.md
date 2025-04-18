# perf-observer-kit

一个全面的Web性能监控库，专注于收集：

- 核心Web指标（Core Web Vitals：LCP, FID, CLS, INP）
- 资源加载指标
- 长任务（Long Tasks）
- TTFB（Time to First Byte）

## 安装

```bash
npm install perf-observer-kit
```

## 使用方法

```javascript
import { PerfObserverKit } from 'perf-observer-kit';

// 使用默认配置初始化
const perfMonitor = new PerfObserverKit({
  onMetrics: (metrics) => {
    console.log('性能指标:', metrics);
    // 将指标发送到你的分析平台
  }
});

// 开始监控
perfMonitor.start();

// 需要时停止监控
// perfMonitor.stop();
```

### 在浏览器中通过CDN使用

```html
<!-- 通过unpkg CDN -->
<script src="https://unpkg.com/perf-observer-kit@latest/dist/perf-observer-kit.browser.min.js"></script>
<!-- 或者通过jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/perf-observer-kit@latest/dist/perf-observer-kit.browser.min.js"></script>

<script>
  // 全局对象: window.PerfObserverKit
  const monitor = new PerfObserverKit.PerfObserverKit({
    onMetrics: (metrics) => console.log('性能指标:', metrics)
  });
  
  monitor.start();
</script>
```

## 收集的指标

### 核心Web指标 (Core Web Vitals)

- **LCP (Largest Contentful Paint)** - 最大内容绘制
  - 测量页面主要内容的加载速度
  - 优良值: ≤ 2.5秒

- **FID (First Input Delay)** - 首次输入延迟
  - 测量页面交互响应性
  - 优良值: ≤ 100毫秒
  
- **CLS (Cumulative Layout Shift)** - 累积布局偏移
  - 测量视觉稳定性
  - 优良值: ≤ 0.1

- **INP (Interaction to Next Paint)** - 交互到下一帧绘制的时间
  - 测量用户交互的整体响应性
  - 优良值: ≤ 200毫秒

### 资源加载

- 脚本、样式表、图片等资源的加载时间
- 资源加载成功/失败
- 资源大小和加载持续时间

### 长任务

- 监测长于50ms的任务
- 长任务的持续时间和归属信息

### 导航计时

- TTFB (Time to First Byte) - 首字节时间
- DOM内容加载完成
- 加载事件

## 配置选项

```javascript
const perfMonitor = new PerfObserverKit({
  // 收集到指标时调用的函数
  onMetrics: (metrics) => {},
  
  // 启用核心Web指标监控（默认：true）
  enableCoreWebVitals: true,
  
  // 启用资源计时监控（默认：true）
  enableResourceTiming: true,
  
  // 启用长任务监控（默认：true）
  enableLongTasks: true,
  
  // 启用导航计时监控（默认：true）
  enableNavigationTiming: true,
  
  // 自定义采样率（毫秒，0表示不采样）
  samplingRate: 0
});
```

## 浏览器兼容性

该库主要依赖于以下Web API：

- Performance API
- PerformanceObserver
- 各种性能条目类型：largest-contentful-paint, first-input, layout-shift, resource, longtask, navigation

对于不支持某些性能指标的浏览器，库会优雅降级并仅收集支持的指标。

## 示例

查看 `examples` 目录获取完整示例。

## 许可证

MIT 