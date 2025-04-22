# 性能观察工具包类型定义

本目录包含了性能观察工具包的所有类型定义，根据功能分为以下几个文件：

## 文件结构

- `metric-types.ts` - 性能指标相关的类型定义
  - `MetricType` - 指标类型枚举
  - `MetricData` - 基础指标数据接口
  - `CoreWebVitalsMetrics` - 核心Web指标数据
  - `ResourceMetrics` - 资源加载指标数据
  - `LongTaskMetrics` - 长任务指标数据
  - `NavigationMetrics` - 导航计时指标数据
  - `PerformanceMetrics` - 所有性能指标的集合

- `browser-info-types.ts` - 浏览器信息相关的类型定义
  - `BrowserInfo` - 浏览器信息数据接口

- `observer-options.ts` - 各种观察者的配置选项
  - `GlobalOptions` - 全局配置选项
  - `CoreWebVitalsOptions` - 核心Web指标配置
  - `ResourceTimingOptions` - 资源计时配置
  - `LongTasksOptions` - 长任务配置
  - `NavigationTimingOptions` - 导航计时配置
  - `BrowserInfoOptions` - 浏览器信息配置
  - `PerfObserverOptions` - 性能观察器总配置

- `index.ts` - 汇总导出所有类型的索引文件

## 使用方法

在代码中导入类型的方法：

```typescript
// 从总索引导入所有类型
import { MetricData, BrowserInfo, PerfObserverOptions } from '../types';

// 或者直接从特定文件导入
import { MetricData } from '../types/metric-types';
import { BrowserInfo } from '../types/browser-info-types';
import { PerfObserverOptions } from '../types/observer-options';
```

## 设计原则

1. **关注点分离** - 将不同功能领域的类型定义分开，使代码更加模块化
2. **类型安全** - 提供严格的类型定义，减少运行时错误
3. **文档完备** - 每个类型都提供详细的注释说明
4. **向后兼容** - 通过索引文件保持对现有代码的兼容性 