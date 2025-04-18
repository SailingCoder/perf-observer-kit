(function(global) {
  'use strict';
  
  // PerfObserverKit主类
  function PerfObserverKit(options) {
    this.options = {
      onMetrics: (options && options.onMetrics) || function() {},
      enableCoreWebVitals: options ? (options.enableCoreWebVitals !== false) : true,
      enableResourceTiming: options ? (options.enableResourceTiming !== false) : true,
      enableLongTasks: options ? (options.enableLongTasks !== false) : true,
      enableNavigationTiming: options ? (options.enableNavigationTiming !== false) : true,
      samplingRate: (options && options.samplingRate) || 0
    };
    
    this.metrics = {
      coreWebVitals: {},
      resources: [],
      longTasks: [],
      navigation: {}
    };
    
    this.observers = [];
    this.isRunning = false;
    
    // 检查浏览器支持
    if (typeof performance === 'undefined') {
      console.warn('Performance API is not supported in this browser');
      return;
    }
    
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver is not supported in this browser');
      return;
    }
  }
  
  // 开始监控
  PerfObserverKit.prototype.start = function() {
    if (this.isRunning) return;
    
    var self = this;
    
    // 核心Web指标监控
    if (this.options.enableCoreWebVitals) {
      // LCP监控
      this._observeMetric('largest-contentful-paint', function(entries) {
        var lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          var lcp = {
            name: 'LCP',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: performance.now()
          };
          
          // LCP评级阈值
          if (lcp.value <= 2500) {
            lcp.rating = 'good';
          } else if (lcp.value <= 4000) {
            lcp.rating = 'needs-improvement';
          } else {
            lcp.rating = 'poor';
          }
          
          self.metrics.coreWebVitals.lcp = lcp;
          self._notifyMetricsUpdate();
        }
      });
      
      // FID监控
      this._observeMetric('first-input', function(entries) {
        var entry = entries[0];
        if (entry) {
          var fid = {
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            timestamp: performance.now()
          };
          
          // FID评级阈值
          if (fid.value <= 100) {
            fid.rating = 'good';
          } else if (fid.value <= 300) {
            fid.rating = 'needs-improvement';
          } else {
            fid.rating = 'poor';
          }
          
          self.metrics.coreWebVitals.fid = fid;
          self._notifyMetricsUpdate();
        }
      });
      
      // CLS监控
      this._observeMetric('layout-shift', function(entries) {
        var clsValue = 0;
        
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          // 只计算没有最近用户输入的布局偏移
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        
        if (clsValue > 0) {
          var cls = {
            name: 'CLS',
            value: clsValue,
            timestamp: performance.now()
          };
          
          // CLS评级阈值
          if (cls.value <= 0.1) {
            cls.rating = 'good';
          } else if (cls.value <= 0.25) {
            cls.rating = 'needs-improvement';
          } else {
            cls.rating = 'poor';
          }
          
          self.metrics.coreWebVitals.cls = cls;
          self._notifyMetricsUpdate();
        }
      });
    }
    
    // 资源加载监控
    if (this.options.enableResourceTiming) {
      this._observeMetric('resource', function(entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          
          // 避免重复条目
          var isDuplicate = false;
          for (var j = 0; j < self.metrics.resources.length; j++) {
            if (self.metrics.resources[j].name === entry.name && 
                self.metrics.resources[j].startTime === entry.startTime) {
              isDuplicate = true;
              break;
            }
          }
          
          if (!isDuplicate) {
            self.metrics.resources.push({
              name: entry.name,
              initiatorType: entry.initiatorType,
              startTime: entry.startTime,
              duration: entry.duration,
              transferSize: entry.transferSize,
              decodedBodySize: entry.decodedBodySize,
              responseEnd: entry.responseEnd
            });
          }
        }
        
        self._notifyMetricsUpdate();
      });
    }
    
    // 长任务监控
    if (this.options.enableLongTasks) {
      this._observeMetric('longtask', function(entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          var attribution = 'unknown';
          
          // 尝试获取归因信息
          if (entry.attribution && entry.attribution.length > 0) {
            var attr = entry.attribution[0];
            if (attr.containerName) {
              attribution = attr.containerName;
            } else if (attr.containerSrc) {
              attribution = attr.containerSrc;
            }
          }
          
          self.metrics.longTasks.push({
            duration: entry.duration,
            startTime: entry.startTime,
            attribution: attribution
          });
        }
        
        self._notifyMetricsUpdate();
      });
    }
    
    // 导航计时监控
    if (this.options.enableNavigationTiming) {
      // 获取当前导航计时
      var navEntries = performance.getEntriesByType('navigation');
      if (navEntries && navEntries.length > 0) {
        var navEntry = navEntries[0];
        var now = performance.now();
        
        // 计算TTFB
        var ttfb = {
          name: 'TTFB',
          value: navEntry.responseStart - navEntry.requestStart,
          unit: 'ms',
          timestamp: now
        };
        
        // TTFB评级阈值
        if (ttfb.value <= 100) {
          ttfb.rating = 'good';
        } else if (ttfb.value <= 200) {
          ttfb.rating = 'needs-improvement';
        } else {
          ttfb.rating = 'poor';
        }
        
        var domContentLoaded = {
          name: 'DOMContentLoaded',
          value: navEntry.domContentLoadedEventEnd - navEntry.startTime,
          unit: 'ms',
          timestamp: now
        };
        
        var loadEvent = {
          name: 'Load',
          value: navEntry.loadEventEnd - navEntry.startTime,
          unit: 'ms',
          timestamp: now
        };
        
        self.metrics.navigation = {
          ttfb: ttfb,
          domContentLoaded: domContentLoaded,
          loadEvent: loadEvent
        };
        
        self._notifyMetricsUpdate();
      }
      
      // 监控未来导航
      this._observeMetric('navigation', function(entries) {
        if (entries.length > 0) {
          var navEntry = entries[entries.length - 1];
          var now = performance.now();
          
          // 计算TTFB
          var ttfb = {
            name: 'TTFB',
            value: navEntry.responseStart - navEntry.requestStart,
            unit: 'ms',
            timestamp: now
          };
          
          // TTFB评级阈值
          if (ttfb.value <= 100) {
            ttfb.rating = 'good';
          } else if (ttfb.value <= 200) {
            ttfb.rating = 'needs-improvement';
          } else {
            ttfb.rating = 'poor';
          }
          
          var domContentLoaded = {
            name: 'DOMContentLoaded',
            value: navEntry.domContentLoadedEventEnd - navEntry.startTime,
            unit: 'ms',
            timestamp: now
          };
          
          var loadEvent = {
            name: 'Load',
            value: navEntry.loadEventEnd - navEntry.startTime,
            unit: 'ms',
            timestamp: now
          };
          
          self.metrics.navigation = {
            ttfb: ttfb,
            domContentLoaded: domContentLoaded,
            loadEvent: loadEvent
          };
          
          self._notifyMetricsUpdate();
        }
      });
    }
    
    this.isRunning = true;
  };
  
  // 停止监控
  PerfObserverKit.prototype.stop = function() {
    if (!this.isRunning) return;
    
    // 断开所有观察器连接
    for (var i = 0; i < this.observers.length; i++) {
      try {
        this.observers[i].disconnect();
      } catch (e) {
        console.error('Error disconnecting observer:', e);
      }
    }
    
    this.observers = [];
    this.isRunning = false;
  };
  
  // 获取当前指标
  PerfObserverKit.prototype.getMetrics = function() {
    return this.metrics;
  };
  
  // 观察特定指标
  PerfObserverKit.prototype._observeMetric = function(type, callback) {
    try {
      var observer = new PerformanceObserver(function(list) {
        callback(list.getEntries());
      });
      
      observer.observe({ type: type, buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Failed to observe ' + type + ':', e);
    }
  };
  
  // 通知指标更新
  PerfObserverKit.prototype._notifyMetricsUpdate = function() {
    if (this.options.onMetrics) {
      this.options.onMetrics(this.metrics);
    }
  };
  
  // 导出到全局对象
  global.PerfObserverKit = {
    PerfObserverKit: PerfObserverKit
  };
  
})(typeof window !== 'undefined' ? window : this); 