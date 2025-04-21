import { CoreWebVitalsMetrics } from '../types';
import {
  FCPObserver,
  LCPObserver,
  FIDObserver,
  CLSObserver,
  INPObserver
} from './web-vitals/index';
import { CoreWebVitalsObserverOptions } from './web-vitals/types';

/**
 * 核心Web指标观察者
 * 负责监控所有Core Web Vitals指标
 */
export class CoreWebVitalsObserver {
  private metrics: CoreWebVitalsMetrics = {};
  private onUpdate: (metrics: CoreWebVitalsMetrics) => void;
  private options: CoreWebVitalsObserverOptions;
  
  // 各个指标的观察者
  private fcpObserver: FCPObserver | null = null;
  private lcpObserver: LCPObserver | null = null;
  private fidObserver: FIDObserver | null = null;
  private clsObserver: CLSObserver | null = null;
  private inpObserver: INPObserver | null = null;

  constructor(options: CoreWebVitalsObserverOptions) {
    this.onUpdate = options.onUpdate;
    this.options = {
      // 默认不启用，必须显式配置
      enabled: options.enabled !== undefined ? options.enabled : false,
      // 所有指标默认都不启用，必须显式配置启用
      includeFCP: options.includeFCP !== undefined ? options.includeFCP : false,
      includeLCP: options.includeLCP !== undefined ? options.includeLCP : false,
      includeFID: options.includeFID !== undefined ? options.includeFID : false,
      includeCLS: options.includeCLS !== undefined ? options.includeCLS : false,
      includeINP: options.includeINP !== undefined ? options.includeINP : false,
      ...options
    };
  }
  
  /**
   * 开始监控所有核心Web指标
   */
  start(): void {
    // 启动FCP监测
    if (this.options.includeFCP) {
      this.startFCPMonitoring();
    }
    
    // 启动LCP监测
    if (this.options.includeLCP) {
      this.startLCPMonitoring();
    }
    
    // 启动FID监测
    if (this.options.includeFID) {
      this.startFIDMonitoring();
    }
    
    // 启动CLS监测
    if (this.options.includeCLS) {
      this.startCLSMonitoring();
    }
    
    // 启动INP监测
    if (this.options.includeINP) {
      this.startINPMonitoring();
    }
  }
  
  /**
   * 停止所有监控
   */
  stop(): void {
    if (this.fcpObserver) {
      this.fcpObserver.stop();
      this.fcpObserver = null;
    }
    
    if (this.lcpObserver) {
      this.lcpObserver.stop();
      this.lcpObserver = null;
    }
    
    if (this.fidObserver) {
      this.fidObserver.stop();
      this.fidObserver = null;
    }
    
    if (this.clsObserver) {
      this.clsObserver.stop();
      this.clsObserver = null;
    }
    
    if (this.inpObserver) {
      this.inpObserver.stop();
      this.inpObserver = null;
    }
  }
  
  /**
   * 发送指标更新通知
   */
  private notifyMetricsUpdate(): void {
    this.onUpdate(this.metrics);
  }

  /**
   * 启动FCP监测
   */
  private startFCPMonitoring(): void {
    this.fcpObserver = new FCPObserver({
      onUpdate: (metric) => {
        this.metrics.fcp = metric;
        this.notifyMetricsUpdate();
      }
    });
    
    this.fcpObserver.start();
  }
  
  /**
   * 启动LCP监测
   */
  private startLCPMonitoring(): void {
    this.lcpObserver = new LCPObserver({
      onUpdate: (metric) => {
        this.metrics.lcp = metric;
        this.notifyMetricsUpdate();
      }
    });
    
    this.lcpObserver.start();
  }
  
  /**
   * 启动FID监测
   */
  private startFIDMonitoring(): void {
    this.fidObserver = new FIDObserver({
      onUpdate: (metric) => {
        this.metrics.fid = metric;
        this.notifyMetricsUpdate();
      }
    });
    
    this.fidObserver.start();
  }
  
  /**
   * 启动CLS监测
   */
  private startCLSMonitoring(): void {
    this.clsObserver = new CLSObserver({
      onUpdate: (metric) => {
        this.metrics.cls = metric;
        this.notifyMetricsUpdate();
      }
    });
    
    this.clsObserver.start();
  }
  
  /**
   * 启动INP监测
   */
  private startINPMonitoring(): void {
    this.inpObserver = new INPObserver({
      onUpdate: (metric) => {
        this.metrics.inp = metric;
        this.notifyMetricsUpdate();
      }
    });
    
    this.inpObserver.start();
  }
} 