# 累积布局偏移 (Cumulative Layout Shift, CLS) 监控

## 概述

累积布局偏移 (CLS) 是衡量页面视觉稳定性的一个重要指标，属于核心网页指标 (Core Web Vitals) 之一。CLS测量页面加载和交互过程中发生的意外布局偏移，这些偏移会影响用户体验。

本文档详细介绍了`CLSObserver`的实现机制，包括会话窗口算法、页面可见性处理、数据收集和报告方式。

## CLS 指标介绍

CLS分数是无单位的，反映了页面上发生的布局偏移的累积量。按照Google的标准：

| 评级 | 阈值 |
|-----|-----|
| 良好 (Good) | ≤ 0.1 |
| 需要改进 (Needs Improvement) | ≤ 0.25 |
| 较差 (Poor) | > 0.25 |

## 实现机制

### 会话窗口算法

`CLSObserver`采用了Google推荐的会话窗口算法来计算CLS，而不是简单地累加所有的布局偏移：

1. **会话窗口定义**：
   - 会话是一系列紧密发生的布局偏移集合
   - 当两次布局偏移之间的间隔超过1000ms时，认为开始了一个新会话
   - 最多保留5个会话窗口

2. **计算方式**：
   - 每个会话窗口内的布局偏移值累加
   - 最终CLS值取所有会话中的最大值
   - 这种方法更公平地评估页面在不同阶段的稳定性

3. **原理解释**：
   ```
   时间轴: -----|-------|-------|-------|------>
   偏移值:   0.1    0.3     0.2     0.4
                  >1000ms
   会话:    [   会话1  ]    [   会话2   ]
   会话值:     0.1+0.3         0.2+0.4
                 0.4             0.6
   最终CLS:                      0.6
   ```

### 页面可见性处理

页面可见性对CLS测量至关重要，因为：

1. **仅测量可见页面**：
   - 当页面处于后台标签页时，不会发生视觉布局偏移
   - `CLSObserver`只在`document.visibilityState === 'visible'`时记录布局偏移

2. **页面隐藏时的处理**：
   - 页面隐藏时，记录当前累积的CLS值
   - 更新`firstHiddenTime`以确保后续只考虑页面首次隐藏前的布局偏移

3. **BFCache恢复**：
   - 当页面从后退/前进缓存恢复时，完全重置CLS测量
   - 这确保了不同的页面访问会话有独立的CLS测量

### 用户交互处理

布局偏移分为两类：

1. **预期偏移**：由用户操作直接引起的布局变化（如点击按钮展开内容）
2. **意外偏移**：非用户交互直接引起的布局变化（如广告加载、图片加载等）

`CLSObserver`只测量意外偏移：
- 通过检查`layoutShift.hadRecentInput`判断是否为用户交互引起
- 只有`hadRecentInput === false`的偏移才计入CLS

## 使用方法

### 基本用法

```javascript
import { CLSObserver } from 'perf-observer-kit';

const clsObserver = new CLSObserver({
  onUpdate: (metrics) => {
    console.log('CLS 指标更新:', metrics);
    // metrics.value 是当前的CLS值
    // metrics.rating 是评级: 'good', 'needs-improvement', 或 'poor'
  }
});

// 开始监控
clsObserver.start();

// 停止监控
clsObserver.stop();
```

### 获取详细指标信息

```javascript
onUpdate: (metrics) => {
  // 基本信息
  console.log(`CLS值: ${metrics.value}`);
  console.log(`评级: ${metrics.rating}`);
  
  // 详细会话信息
  console.log(`偏移次数: ${metrics.context.shiftCount}`);
  console.log(`会话值: ${metrics.context.sessionValues}`);
  console.log(`最大会话值: ${metrics.context.largestSession}`);
}
```

## 性能优化建议

根据CLS指标结果，以下是常见的优化建议：

1. **为图片和视频元素指定尺寸**：
   - 在HTML中添加`width`和`height`属性
   - 使用CSS长宽比工具如`aspect-ratio`

2. **为广告位预留空间**：
   - 静态分配广告容器的空间
   - 使用占位符

3. **避免在已有内容上方插入内容**：
   - 新内容应只在视窗以下加载
   - 使用transform动画代替改变布局属性

4. **预计算足够的空间**：
   - 对于动态加载的内容预先分配足够空间
   - 使用骨架屏(skeleton screens)占位

## 常见问题

### Q: 为什么需要使用会话窗口而不是累加所有布局偏移？
A: 简单地累加所有布局偏移会对长时间运行的单页应用不公平，会话窗口方法允许页面在生命周期的不同阶段有布局变化，而不会无限累积惩罚。

### Q: 页面长时间运行时CLS会持续增加吗？
A: 使用会话窗口方法，CLS值会取最大的会话值，而不是持续累加。这意味着即使页面运行很长时间，CLS也会保持在一个合理的范围内。

### Q: 为什么只测量页面可见时的布局偏移？
A: 当页面不可见时，用户不会看到布局偏移，因此不会影响用户体验。测量这些偏移是没有意义的。

## 参考资料

- [Web Vitals: 累积布局偏移 (CLS)](https://web.dev/articles/cls)
- [进化的累积布局偏移指标](https://web.dev/articles/evolving-cls)
- [布局不稳定性API](https://developer.mozilla.org/zh-CN/docs/Web/API/Layout_Instability_API) 