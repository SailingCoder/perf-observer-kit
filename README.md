# PerfObserverKit

![Version](https://img.shields.io/npm/v/perf-observer-kit)
![License](https://img.shields.io/npm/l/perf-observer-kit)

A lightweight, flexible library for monitoring web performance metrics including Core Web Vitals, resource loading performance, long tasks, and navigation timing.

[English](https://github.com/SailingCoder/perf-observer-kit/blob/main/README.md) | [中文文档](https://github.com/SailingCoder/perf-observer-kit/blob/main/README_CN.md)

## 📋 Features

- 📊 **Core Web Vitals** - Monitor FCP, LCP, FID, CLS, INP
- 🔄 **Resource Timing** - Track loading performance of scripts, stylesheets, images
- ⏱️ **Long Tasks** - Detect JavaScript tasks blocking the main thread
- 🧭 **Navigation Timing** - Measure TTFB, DOM events, page load metrics
- 🖥️ **Browser Info** - Collect browser, OS, and device details
- 📱 **Responsive** - Works on mobile and desktop browsers
- ⚡ **BFCache Support** - Properly handles back/forward cache scenarios
- 📝 **Flexible Logging** - Configurable logging for debugging

## 🚀 Quick Start

### Installation

```bash
npm install perf-observer-kit
```

### Basic Usage

```javascript
import { PerfObserverKit } from 'perf-observer-kit';

// Create a performance monitor instance
const perfMonitor = new PerfObserverKit({
  onMetrics: (type, metrics) => {
    console.log(`Metrics updated [${type}]:`, metrics);
    // Send metrics to your analytics platform
  },
  // Enable all monitoring modules
  coreWebVitals: true, // default FCP LCP
  resourceTiming: true,
  longTasks: true,
  navigationTiming: true
});

// Start monitoring
perfMonitor.start();

// Access metrics anytime
const currentMetrics = perfMonitor.getMetrics();
```

### Browser Usage via CDN

```html
<script src="https://unpkg.com/perf-observer-kit@latest/dist/perf-observer-kit.browser.js"></script>
<script>
  const monitor = new PerfObserverKit.PerfObserverKit({
    onMetrics: (type, metrics) => console.log(`Metrics [${type}]:`, metrics)
  });
  
  monitor.start();
</script>
```

## 📖 Documentation

<details>
<summary><b>Core Web Vitals Monitoring</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  coreWebVitals: {
    enabled: true,       // Enable Core Web Vitals monitoring
    fcp: true,           // First Contentful Paint
    lcp: true,           // Largest Contentful Paint
    fid: true,           // First Input Delay
    cls: true,           // Cumulative Layout Shift
    inp: true            // Interaction to Next Paint
  }
});
```

**Thresholds:**
- FCP: Good ≤ 1.8s, Poor > 3.0s
- LCP: Good ≤ 2.5s, Poor > 4.0s
- FID: Good ≤ 100ms, Poor > 300ms
- CLS: Good ≤ 0.1, Poor > 0.25
- INP: Good ≤ 200ms, Poor > 500ms

[Learn more about Core Web Vitals](https://web.dev/vitals/)

For detailed information on CLS implementation and strategies, see the [Cumulative Layout Shift Documentation](./docs/cls-metrics.md).
</details>

<details>
<summary><b>Resource Timing Monitoring</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  resourceTiming: {
    enabled: true,
    excludedPatterns: [/analytics\.com/, /tracker/],  // Exclude analytics
    allowedTypes: ['script', 'img', 'css', 'fetch'],  // Types to monitor
    maxEntries: 500                                   // Max entries to store
  }
});
```

Captures details on resource loading:
- Resource URL and type
- Load duration and size
- Time to First Byte (TTFB)
- Connection and processing times
</details>

<details>
<summary><b>Long Tasks Monitoring</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  longTasks: {
    enabled: true,      // Enable long tasks monitoring
    threshold: 50,      // Task duration threshold in ms
    maxEntries: 100     // Maximum entries to store
  }
});
```

Detects JavaScript tasks that block the main thread for more than 50ms, providing:
- Task duration
- Task attribution (script source)
- Task start time
</details>

<details>
<summary><b>Navigation Timing</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  navigationTiming: {
    enabled: true,           // Enable navigation timing monitoring
    includeRawTiming: false, // Whether to include raw navigation timing data
    onUpdate: (metrics) => {
      console.log('Navigation timing metrics:', metrics);
      // Includes domainLookupTime, tcpConnectTime, ttfb, responseTime, domParse, domContentLoaded, loadEvent, etc.
    }
  }
});
```

Measures key page load metrics:
- TTFB (Time to First Byte)
- DOM Content Loaded
- Load Event
- Network connection details

> **Implementation Detail**: The library uses window.addEventListener('load') to collect navigation events and guarantees that metrics are only reported when loadEventEnd is available, ensuring you get accurate loadEventDuration values. Navigation timing data is collected only once per page load.

For detailed information on all navigation timing metrics, see the [Navigation Timing Documentation](./docs/navigation-timing.md).
</details>

<details>
<summary><b>Browser Information</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  browserInfo: {
    enabled: true,             // Enabled by default
    trackResize: true,         // Update on window resize
    includeOSDetails: true,    // Include OS information
    includeSizeInfo: true      // Include screen/window size
  }
});
```

**Note:** Browser Information is the only module enabled by default.
</details>

<details>
<summary><b>Full Configuration Options</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  // Metrics callback - called when metrics are updated
  onMetrics: (type, metrics) => {
    console.log(`Metrics updated [${type}]:`, metrics);
  },
  
  // General settings
  debug: false,              // Enable debug mode (verbose logging)
  logLevel: 2,               // 0:None, 1:Error, 2:Warn, 3:Info, 4:Debug
  autoStart: false,          // Start monitoring automatically
  samplingRate: 0,           // Sampling rate (0-1), 0 = no sampling
  
  // Module configurations
  coreWebVitals: true,       // Enable Core Web Vitals (boolean or object)
  resourceTiming: true,      // Enable Resource Timing (boolean or object)
  longTasks: true,           // Enable Long Tasks (boolean or object)
  navigationTiming: true,    // Enable Navigation Timing (boolean or object)
  browserInfo: true          // Enable Browser Info (boolean or object)
});
```
</details>

<details>
<summary><b>Accessing Metrics</b></summary>

```javascript
// Get current metrics at any time
const metrics = perfMonitor.getMetrics();

// Core Web Vitals
console.log(metrics.coreWebVitals.fcp);  // First Contentful Paint
console.log(metrics.coreWebVitals.lcp);  // Largest Contentful Paint
console.log(metrics.coreWebVitals.fid);  // First Input Delay
console.log(metrics.coreWebVitals.cls);  // Cumulative Layout Shift
console.log(metrics.coreWebVitals.inp);  // Interaction to Next Paint

// Resources
console.log(metrics.resources);          // Array of resource metrics

// Long tasks
console.log(metrics.longTasks);          // Array of long tasks

// Navigation timing
console.log(metrics.navigation.ttfb);    // Time to First Byte
```

**CLS Metrics Context Properties:**
```javascript
// Additional context available for CLS metrics
console.log(metrics.coreWebVitals.cls.context.sessionValues);  // All session values
console.log(metrics.coreWebVitals.cls.context.shiftCount);     // Number of layout shifts
console.log(metrics.coreWebVitals.cls.context.sessionCount);   // Number of sessions
console.log(metrics.coreWebVitals.cls.context.isPageVisible);  // Page visibility state
```
</details>

<details>
<summary><b>Logging and Debugging</b></summary>

```javascript
// Enable debug mode when initializing
const perfMonitor = new PerfObserverKit({
  debug: true                // Sets log level to DEBUG
});

// Adjust log level after initialization
perfMonitor.setLogLevel(4);  // 4 = DEBUG (most verbose)
perfMonitor.setDebugMode(true);  // Enable debug mode

// Clear collected metrics
perfMonitor.clearMetrics();
```

Log levels:
- 0: NONE - No logging
- 1: ERROR - Only errors
- 2: WARN - Warnings and errors (default)  
- 3: INFO - Information, warnings, and errors
- 4: DEBUG - Verbose debug information
</details>

<details>
<summary><b>API Reference</b></summary>

### Methods

| Method | Description |
|--------|-------------|
| `start()` | Start monitoring performance metrics |
| `stop()` | Stop monitoring performance metrics |
| `getMetrics()` | Get currently collected metrics |
| `clearMetrics()` | Clear all collected metrics |
| `setLogLevel(level)` | Set logging level (0-4) |
| `setDebugMode(enabled)` | Enable or disable debug mode |

### Event Types

`MetricType` enum values:
- `WEB_VITALS` - Core Web Vitals metrics
- `RESOURCES` - Resource timing metrics
- `LONG_TASKS` - Long tasks metrics
- `NAVIGATION` - Navigation timing metrics
- `BROWSER_INFO` - Browser information metrics
</details>

<details>
<summary><b>Troubleshooting</b></summary>

### "PerfObserverKit is not defined" error

If you get this error in the browser, ensure you're using the proper browser build:

```html
<!-- Always use the browser build for browser environments -->
<script src="https://unpkg.com/perf-observer-kit@latest/dist/perf-observer-kit.browser.js"></script>
```

Don't use the non-browser build in direct browser code:

```html
<!-- ❌ DON'T use this in browser environments -->
<script src="https://unpkg.com/perf-observer-kit@latest/dist/index.js"></script>
```

### Page Visibility and CLS

If your CLS values seem inconsistent, be aware that:
- CLS is only measured when the page is visible
- When a page goes to background, CLS collection pauses
- When a page becomes visible again, a new CLS session will start
- CLS uses a session window model, taking the largest session value as the final score

### Browser Compatibility

This library primarily relies on:
- Performance API
- PerformanceObserver
- Performance entry types: largest-contentful-paint, first-input, layout-shift, etc.

For browsers that don't support certain performance metrics, the library gracefully degrades and only collects supported metrics.
</details>

## 📊 Examples

Check out the [examples directory](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples) for complete usage examples:

- [Basic Usage](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/basic-usage.html) - Simple implementation
- [Advanced Usage](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/advanced-usage.html) - Advanced configuration
- [Modular Configuration](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/modular-config.html) - Fine-grained module settings
- [Logger Usage](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/logger-usage.html) - Logging configuration
- [BFCache Testing](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/test-bfcache.html) - Back/forward cache handling

## 📄 License

[MIT](LICENSE)
