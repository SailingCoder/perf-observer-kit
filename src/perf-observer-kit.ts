import { 
  PerfObserverOptions, 
  PerformanceMetrics, 
  CoreWebVitalsMetrics,
  ResourceMetrics,
  LongTaskMetrics,
  NavigationMetrics
} from './types';
import { browserSupport } from './utils';

// 导入各个监视器
import { CoreWebVitalsObserver } from './metrics/core-web-vitals';
import { ResourceTimingObserver } from './metrics/resource-timing';
import { LongTasksObserver } from './metrics/long-tasks';
import { NavigationTimingObserver } from './metrics/navigation-timing';

/**
 * PerfObserverKit - Main class for performance monitoring
 */
export class PerfObserverKit {
  private options: Required<PerfObserverOptions>;
  private coreWebVitalsObserver: CoreWebVitalsObserver | null = null;
  private resourceTimingObserver: ResourceTimingObserver | null = null;
  private longTasksObserver: LongTasksObserver | null = null;
  private navigationTimingObserver: NavigationTimingObserver | null = null;
  
  private metrics: PerformanceMetrics = {
    coreWebVitals: {},
    resources: [],
    longTasks: [],
    navigation: {}
  };
  
  private isRunning = false;
  
  /**
   * Create a new Performance Observer Kit instance
   */
  constructor(options: PerfObserverOptions = {}) {
    // Set default options
    this.options = {
      onMetrics: options.onMetrics || (() => {}),
      enableCoreWebVitals: options.enableCoreWebVitals !== false,
      enableResourceTiming: options.enableResourceTiming !== false,
      enableLongTasks: options.enableLongTasks !== false,
      enableNavigationTiming: options.enableNavigationTiming !== false,
      samplingRate: options.samplingRate || 0 // 0 means no sampling, report all metrics
    };
    
    // Check browser support
    if (!browserSupport.hasPerformanceAPI()) {
      console.warn('Performance API is not supported in this browser');
    }
    
    if (!browserSupport.hasPerformanceObserver()) {
      console.warn('PerformanceObserver is not supported in this browser');
    }
  }
  
  /**
   * Start monitoring performance metrics
   */
  start(): void {
    if (this.isRunning) {
      return;
    }
    
    if (this.options.enableCoreWebVitals) {
      this.startCoreWebVitalsMonitoring();
    }
    
    if (this.options.enableResourceTiming) {
      this.startResourceTimingMonitoring();
    }
    
    if (this.options.enableLongTasks) {
      this.startLongTasksMonitoring();
    }
    
    if (this.options.enableNavigationTiming) {
      this.startNavigationTimingMonitoring();
    }
    
    this.isRunning = true;
  }
  
  /**
   * Stop monitoring performance metrics
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    if (this.coreWebVitalsObserver) {
      this.coreWebVitalsObserver.stop();
    }
    
    if (this.resourceTimingObserver) {
      this.resourceTimingObserver.stop();
    }
    
    if (this.longTasksObserver) {
      this.longTasksObserver.stop();
    }
    
    if (this.navigationTimingObserver) {
      this.navigationTimingObserver.stop();
    }
    
    this.isRunning = false;
  }
  
  /**
   * Get the current metrics
   */
  getMetrics(): PerformanceMetrics {
    return this.metrics;
  }
  
  /**
   * Start monitoring Core Web Vitals
   */
  private startCoreWebVitalsMonitoring(): void {
    const requiredEntryTypes = [
      'largest-contentful-paint',
      'first-input',
      'layout-shift'
    ];
    
    // Check if required entry types are supported
    const unsupportedTypes = requiredEntryTypes.filter(
      type => !browserSupport.supportsEntryType(type)
    );
    
    if (unsupportedTypes.length > 0) {
      console.warn(
        `Some Core Web Vitals metrics are not supported in this browser: ${unsupportedTypes.join(', ')}`
      );
    }
    
    this.coreWebVitalsObserver = new CoreWebVitalsObserver(
      (coreWebVitalsMetrics: CoreWebVitalsMetrics) => {
        this.metrics.coreWebVitals = coreWebVitalsMetrics;
        this.notifyMetricsUpdate();
      }
    );
    
    this.coreWebVitalsObserver.start();
  }
  
  /**
   * Start monitoring Resource Timing
   */
  private startResourceTimingMonitoring(): void {
    if (!browserSupport.supportsEntryType('resource')) {
      console.warn('Resource timing is not supported in this browser');
      return;
    }
    
    this.resourceTimingObserver = new ResourceTimingObserver(
      (resources: ResourceMetrics[]) => {
        this.metrics.resources = resources;
        this.notifyMetricsUpdate();
      }
    );
    
    this.resourceTimingObserver.start();
  }
  
  /**
   * Start monitoring Long Tasks
   */
  private startLongTasksMonitoring(): void {
    if (!browserSupport.supportsEntryType('longtask')) {
      console.warn('Long tasks monitoring is not supported in this browser');
      return;
    }
    
    this.longTasksObserver = new LongTasksObserver(
      (longTasks: LongTaskMetrics[]) => {
        this.metrics.longTasks = longTasks;
        this.notifyMetricsUpdate();
      }
    );
    
    this.longTasksObserver.start();
  }
  
  /**
   * Start monitoring Navigation Timing
   */
  private startNavigationTimingMonitoring(): void {
    if (!browserSupport.supportsEntryType('navigation')) {
      console.warn('Navigation timing is not supported in this browser');
      return;
    }
    
    this.navigationTimingObserver = new NavigationTimingObserver(
      (navigationMetrics: NavigationMetrics) => {
        this.metrics.navigation = navigationMetrics;
        this.notifyMetricsUpdate();
      }
    );
    
    this.navigationTimingObserver.start();
  }
  
  /**
   * Notify metrics update to the callback
   */
  private notifyMetricsUpdate(): void {
    if (this.options.onMetrics) {
      this.options.onMetrics(this.metrics);
    }
  }
} 