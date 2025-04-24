# PerfObserverKit

![Version](https://img.shields.io/npm/v/perf-observer-kit)
![License](https://img.shields.io/npm/l/perf-observer-kit)

A modular, lightweight frontend performance monitoring library designed for tracking Web performance metrics, including Core Web Vitals, resource loading performance, long tasks execution, and navigation timing.

[English](https://github.com/SailingCoder/perf-observer-kit/blob/main/README.md) | [中文文档](https://github.com/SailingCoder/perf-observer-kit/blob/main/README_CN.md)

## 🆕 Recent Updates

- **INP Metric Support**: Full support for Google's upcoming Interaction to Next Paint metric
- **Optimized CLS Implementation**: Using the latest session window algorithm, compliant with Google's standards
- **Enhanced Logging System**: Improved debugging capabilities with production environment troubleshooting support

## 📋 Features

- 📊 **Core Web Vitals** - Monitor FCP (First Contentful Paint), LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift), INP (Interaction to Next Paint)
- 🔄 **Resource Timing** - Track loading performance of scripts, stylesheets, images
- ⏱️ **Long Tasks** - Detect JavaScript tasks blocking the main thread
- 🧭 **Navigation Timing** - Measure TTFB (Time to First Byte), DOM events, page load metrics
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
  resources: true,
  longTasks: true,
  navigation: true,
  browserInfo: true     // Enable browser information
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

**Core Metrics Explained:**
- **FCP (First Contentful Paint)**: The time at which the first text, image, non-white canvas, or SVG is painted, marking when users first see content on the page.
- **LCP (Largest Contentful Paint)**: The time when the largest content element (usually a main image or text block) in the viewport is rendered, indicating when the main content is visible.
- **FID (First Input Delay)**: The time from when a user first interacts with the page (e.g., clicks a link or button) until the browser is able to respond to that interaction, measuring interaction responsiveness.
- **CLS (Cumulative Layout Shift)**: Measures the degree to which page elements unexpectedly move during loading, quantifying visual stability.
- **INP (Interaction to Next Paint)**: Measures the time from user interaction with the page to the next screen update, providing a comprehensive measure of page responsiveness.

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
  resources: {
    enabled: true,
    excludedPatterns: [/analytics\.com/, /tracker/, 'analytics-tracker.com'],  // Exclude analytics
    allowedTypes: ['script', 'img'],  // Types to monitor, default ['script', 'link', 'img', 'css', 'font']
    maxResources: 100                   // Maximum entries to store
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

**Long Tasks Explained:** Long tasks are JavaScript operations that block the main thread for longer than a specific threshold (typically 50ms), causing user interaction delays and UI jank. Monitoring long tasks helps identify performance bottlenecks and optimize JavaScript execution.

Provides information on:
- Task duration
- Task attribution (script source)
- Task start time
</details>

<details>
<summary><b>Navigation Timing</b></summary>

Navigation timing monitors key time points during page load, such as TTFB (Time to First Byte) and DOM loading time.

```javascript
const perfMonitor = new PerfObserverKit({
  navigation: {
    enabled: true,           // Enable navigation timing monitoring
    includeRawTiming: false, // Whether to include raw navigation timing data
    onUpdate: (metrics) => {
      console.log('Navigation timing metrics:', metrics);
      // Includes performance metrics for all phases
    }
  }
});
```

![Navigation Timing Metrics](https://github.com/SailingCoder/perf-observer-kit/raw/main/docs/images/image.png)

**Navigation Timing Metrics (Grouped by Loading Phase):**

*Navigation Phase*
- **unloadTime**: Time to unload the previous page
- **redirectTime**: Time spent in redirects

*Service Worker and Cache*
- **serviceWorkerTime**: Service Worker startup time
- **appCacheTime**: Application cache time

*Network Connection Phase*
- **dnsTime**: DNS resolution time
- **tcpTime**: TCP connection time
- **sslTime**: SSL handshake time

*Request/Response Phase*
- **ttfb**: Time to First Byte, time from page request to receiving the first byte
- **requestTime**: Request sending time
- **responseTime**: Response receiving time
- **resourceFetchTime**: Total resource fetch time

*DOM Processing Phase*
- **initDOMTime**: DOM initialization time
- **processingTime**: DOM processing time
- **contentLoadTime**: Content loading time
- **domContentLoaded**: Time when HTML document is fully loaded and parsed

*Page Load Completion Metrics*
- **loadEventDuration**: Load event processing time
- **frontEndTime**: Frontend rendering time
- **totalLoadTime**: Total loading time (from navigation start to load event end)

*Metadata*
- **url**: Page URL
- **networkMetrics**: Network information (downlink speed, network type, RTT, etc.)
- **timestamp**: Timestamp when metrics were recorded
- **rawTiming**: Raw performance data (available when includeRawTiming option is enabled)
- **complete**: Whether complete navigation timing data has been collected
- **metric**: Metric type

> **Implementation Detail**: The library uses window.addEventListener('load') to collect navigation events and guarantees that metrics are only reported when loadEventEnd is available, ensuring you get accurate loadEventDuration values. Navigation timing data is collected only once per page load.

For detailed information on all navigation timing metrics, see the [Navigation Timing Documentation](./docs/navigation-timing.md).
</details>

<details>
<summary><b>Browser Information</b></summary>

```javascript
const perfMonitor = new PerfObserverKit({
  browserInfo: {
    enabled: true,             // Enable browser information monitoring
    trackResize: false,        // Update on window resize, default false
    includeOSDetails: true,    // Include OS information
    includeSizeInfo: true      // Include screen/window size
  }
});
```
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
  resources: true,           // Enable Resource Timing (boolean or object)
  longTasks: true,           // Enable Long Tasks (boolean or object)
  navigation: true,          // Enable Navigation Timing (boolean or object)
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

// Advanced usage: Configure logger directly
import { logger } from 'perf-observer-kit';

// Enable logs in production environment
logger.setOptions({
  disableInProduction: false
});

// Check current logger configuration
const config = logger.getConfiguration();
console.log('Current logger config:', config);
```

Log levels:
- 0: NONE - No logging
- 1: ERROR - Only errors
- 2: WARN - Warnings and errors (default)  
- 3: INFO - Information, warnings, and errors
- 4: DEBUG - Verbose debug information

**Note**: For troubleshooting in production environments, the logger can now show debug information by setting `logger.setOptions({disableInProduction: false})`. This is particularly useful when debugging performance issues in a production context.
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
<summary><b>Best Practices</b></summary>

1.  **Selective Enabling**: Only enable the monitoring modules you need to reduce performance overhead
    ```javascript
    const monitor = new PerfObserverKit({
      coreWebVitals: { enabled: true, fcp: true, lcp: true },
      resources: false,
      longTasks: false,
      navigation: true
    });
    ```

2.  **Sampling for High-Traffic Sites**: Use sampling rate to control the volume of monitoring data
    ```javascript
    const monitor = new PerfObserverKit({
      samplingRate: 0.1  // Only 10% of users will be monitored
    });
    ```

3.  **Resource Monitoring Filtering**: Exclude analytics tools and other irrelevant resources
    ```javascript
    const monitor = new PerfObserverKit({
      resources: {
        excludedPatterns: [/analytics/, /tracking/, /ads/]
      }
    });
    ```

4.  **BFCache Event Integration**: Reinitialize when page restores from BFCache
    ```javascript
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        // Page restored from BFCache
        monitor.clearMetrics();
        monitor.start();
      }
    });
    ```

5.  **Avoid Large Data Transfers**: Send data periodically or set reasonable batch sizes
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

## 💪 Advantages Over Other Performance Monitoring Libraries

1.  **Modular Design**: Enable only the functionality you need, reducing performance overhead
2.  **Complete Core Vitals Support**: Full support for all Google Core Web Vitals metrics, including the newest INP
3.  **Precise CLS Implementation**: Using the latest session window algorithm, compliant with Google standards
4.  **Comprehensive Resource Monitoring**: Configurable resource filtering and detailed resource loading performance data
5.  **Flexible Sampling Strategy**: Support for proportional sampling, suitable for high-traffic production environments
6.  **BFCache Support**: Properly handles browser back/forward cache scenarios
7.  **Rich Context Data**: Provides more comprehensive contextual information than simple metric values
8.  **Powerful Debugging Capabilities**: Multi-level logging system with production troubleshooting support
9.  **Graceful Degradation**: Still collects available metrics in browsers that don't support certain APIs
10. **Lightweight**: Small core size with minimal impact on page performance

## 📊 Examples

Check out the [examples directory](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples) for complete usage examples:

- [Basic Usage](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/basic-usage.html) - Simple implementation
- [Advanced Usage](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/advanced-usage.html) - Advanced configuration
- [Modular Configuration](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/modular-config.html) - Fine-grained module settings
- [Logger Usage](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/logger-usage.html) - Logging configuration
- [BFCache Testing](https://github.com/SailingCoder/perf-observer-kit/blob/main/examples/test-bfcache.html) - Back/forward cache handling

## 📄 License

[MIT](LICENSE)
