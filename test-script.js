// 这个脚本在浏览器中使用
// 需要将其通过 <script> 标签引入

// 假设我们已经加载了 dist/index.js
console.log('测试 PerfObserverKit 是否正常工作...');

// 初始化监控实例
const perfMonitor = new PerfObserverKit.PerfObserverKit({
  onMetrics: function(metrics) {
    console.log('收集到性能指标:', metrics);
  }
});

// 启动监控
perfMonitor.start();

console.log('性能监控已启动，请查看控制台日志...'); 