# perf-observer-kit

A comprehensive web performance monitoring library that focuses on collecting:

- Core Web Vitals (FCP, LCP, FID, CLS, INP)
- Resource loading metrics
- Long tasks
- TTFB (Time to First Byte)

[中文文档](./README_CN.md)

## Installation

```bash
npm install perf-observer-kit
```

## Usage

```javascript
import { PerfObserverKit } from 'perf-observer-kit';

// Initialize with default configuration
const perfMonitor = new PerfObserverKit({
  onMetrics: (metrics) => {
    console.log('Performance metrics:', metrics);
    // Send metrics to your analytics platform
  }
});

// Start monitoring
perfMonitor.start();

// Stop monitoring when needed
// perfMonitor.stop();
```

### Using via CDN in the browser

```html
<!-- Via unpkg CDN -->
<script src="https://unpkg.com/perf-observer-kit@latest/dist/perf-observer-kit.browser.min.js"></script>
<!-- Or via jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/perf-observer-kit@latest/dist/perf-observer-kit.browser.min.js"></script>

<script>
  // Global object: window.PerfObserverKit
  const monitor = new PerfObserverKit.PerfObserverKit({
    onMetrics: (metrics) => console.log('Performance metrics:', metrics)
  });
  
  monitor.start();
</script>
```

## Metrics Collected

### Core Web Vitals

- **FCP (First Contentful Paint)**
  - Measures the time it takes for the first content to be painted
  - Good threshold: ≤ 1.8s

- **LCP (Largest Contentful Paint)**
  - Measures loading performance
  - Good threshold: ≤ 2.5s

- **FID (First Input Delay)**
  - Measures interactivity
  - Good threshold: ≤ 100ms
  
- **CLS (Cumulative Layout Shift)**
  - Measures visual stability
  - Good threshold: ≤ 0.1

- **INP (Interaction to Next Paint)**
  - Measures overall responsiveness
  - Good threshold: ≤ 200ms

### Resource Loading

- Resource timing for scripts, stylesheets, images, etc.
- Resource load success/failure
- Resource size and load duration

### Long Tasks

- Detection of tasks taking longer than 50ms
- Duration and attribution of long tasks

### Navigation Timing

- TTFB (Time to First Byte)
- DOM Content Loaded
- Load Event

### Browser Information

- Browser name, version, and vendor
- Operating system name and version
- Screen and window size
- Device pixel ratio
- Current page URL
- Language and platform information

**Note: Browser Information is the only module enabled by default.** All other modules (Core Web Vitals, Resource Timing, Long Tasks, and Navigation Timing) must be explicitly enabled.

## Configuration Options

The library supports a modular configuration system, allowing fine-grained control over each monitoring module.

### Basic Configuration

```javascript
const perfMonitor = new PerfObserverKit({
  // Function to be called when metrics are collected
  onMetrics: (metrics) => {},
  
  // Custom sampling rate (ms, 0 means no sampling)
  samplingRate: 0,
  
  // Automatically start monitoring when initialized (default: false)
  autoStart: false,
  
  // Important: Only Browser Information is enabled by default
  // All other modules must be explicitly enabled as shown below
  
  // Enable/disable individual modules (simple boolean flags)
  coreWebVitals: true, // Must be explicitly enabled
  resourceTiming: true, // Must be explicitly enabled
  longTasks: true, // Must be explicitly enabled
  navigationTiming: true // Must be explicitly enabled
});
```

### Advanced Configuration

```javascript
const perfMonitor = new PerfObserverKit({
  onMetrics: (metrics) => {},
  
  // Core Web Vitals advanced configuration
  coreWebVitals: {
    enabled: true, // Must be explicitly enabled
    // Each metric must be explicitly enabled
    includeFCP: true, // Enable First Contentful Paint monitoring
    includeLCP: true, // Enable Largest Contentful Paint monitoring
    includeFID: true, // Enable First Input Delay monitoring 
    includeCLS: true, // Enable Cumulative Layout Shift monitoring
    includeINP: true  // Enable Interaction to Next Paint monitoring
  },
  
  // Resource Timing advanced configuration
  resourceTiming: {
    enabled: true,
    excludedPatterns: [/analytics/, /tracker/], // Exclude analytics/tracker scripts
    allowedTypes: ['script', 'img', 'css', 'fetch', 'xmlhttprequest'],
    maxEntries: 500 // Maximum number of resource entries to store
  },
  
  // Long Tasks advanced configuration
  longTasks: {
    enabled: true,
    threshold: 50, // Duration threshold in ms
    maxEntries: 100 // Maximum number of long tasks to store
  },
  
  // Navigation Timing advanced configuration  
  navigationTiming: {
    enabled: true,
    includeRawTiming: true // Include raw performance timing data
  },
  
  // Browser Information configuration
  browserInfo: {
    enabled: true,
    trackResize: true, // Update info when window size changes
    includeOSDetails: true, // Include detailed OS information
    includeSizeInfo: true // Include screen and window size information
  }
});

### Debugging & Logging

The library provides debugging and logging capabilities to help troubleshoot performance monitoring issues:

```javascript
const perfMonitor = new PerfObserverKit({
  // Enable debug mode (sets log level to DEBUG)
  debug: true,
  
  // Or set a specific log level:
  // 0: NONE - No logging
  // 1: ERROR - Only errors
  // 2: WARN - Warnings and errors (default)
  // 3: INFO - Informational messages, warnings, and errors
  // 4: DEBUG - Detailed debug messages, informational messages, warnings, and errors
  logLevel: 3,
  
  // Auto-start monitoring when initialized (default: false)
  // When true, monitoring starts immediately after instantiation
  // When false, you need to call perfMonitor.start() manually
  autoStart: true
});

// You can also set debug mode or log level after initialization
perfMonitor.setDebugMode(true);  // Enable debug mode
perfMonitor.setLogLevel(4);      // Set log level to DEBUG

// Clear all collected metrics
perfMonitor.clearMetrics();
```

When debug mode is enabled, the library will output detailed information about its operations to the console, which can be helpful for diagnosing issues.
```

### Legacy Configuration (Deprecated)

```javascript
// Legacy configuration is still supported for backward compatibility
const perfMonitor = new PerfObserverKit({
  enableCoreWebVitals: true,       // Deprecated, use coreWebVitals instead
  enableResourceTiming: true,      // Deprecated, use resourceTiming instead
  enableLongTasks: true,           // Deprecated, use longTasks instead
  enableNavigationTiming: true,    // Deprecated, use navigationTiming instead
  excludedResourcePatterns: [],    // Deprecated, use resourceTiming.excludedPatterns
  allowedResourceTypes: []         // Deprecated, use resourceTiming.allowedTypes
});
```

## Getting Metrics

```javascript
// Get current metrics at any time
const currentMetrics = perfMonitor.getMetrics();

// Core Web Vitals metrics
console.log(currentMetrics.coreWebVitals.fcp);  // First Contentful Paint
console.log(currentMetrics.coreWebVitals.lcp);  // Largest Contentful Paint
console.log(currentMetrics.coreWebVitals.fid);  // First Input Delay
console.log(currentMetrics.coreWebVitals.cls);  // Cumulative Layout Shift
console.log(currentMetrics.coreWebVitals.inp);  // Interaction to Next Paint

// Resource metrics
console.log(currentMetrics.resources);          // Array of resource metrics

// Long tasks
console.log(currentMetrics.longTasks);          // Array of long tasks

// Navigation metrics
console.log(currentMetrics.navigation.ttfb);    // Time to First Byte

// Browser information
console.log(currentMetrics.browserInfo);        // Browser and device information
console.log(currentMetrics.browserInfo.browser);// Browser name and version
console.log(currentMetrics.browserInfo.os);     // Operating system details
```

## Troubleshooting

### "PerfObserverKit is not defined" error

If you get this error in the browser, ensure you're using the proper browser build:

```html
<!-- Always use the browser build for browser environments -->
<script src="https://unpkg.com/perf-observer-kit@latest/dist/perf-observer-kit.browser.js"></script>

<script>
  // The library is available as a global PerfObserverKit object
  const monitor = new PerfObserverKit.PerfObserverKit({
    onMetrics: (metrics) => console.log('Performance metrics:', metrics)
  });
  
  // MetricType enum is also available on the global object
  console.log(PerfObserverKit.MetricType.WEB_VITALS);
  
  monitor.start();
</script>
```

Don't use the non-browser build in direct browser code:

```html
<!-- ❌ DON'T use this in browser environments -->
<script src="https://unpkg.com/perf-observer-kit@latest/dist/index.js"></script>
```

## Browser Compatibility

This library primarily relies on:

- Performance API
- PerformanceObserver
- Various performance entry types: largest-contentful-paint, first-input, layout-shift, resource, longtask, navigation

For browsers that don't support certain performance metrics, the library gracefully degrades and only collects supported metrics.

## Examples

Check the `examples` directory for complete examples.

## License

MIT
