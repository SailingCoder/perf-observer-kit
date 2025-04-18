import { CoreWebVitalsMetrics } from '../types';
import {
  FCPObserver,
  LCPObserver,
  FIDObserver,
  CLSObserver,
  INPObserver
} from './web-vitals/index';

/**
 * 核心Web指标观察者
 * 负责监控所有Core Web Vitals指标
 */
export class CoreWebVitalsObserver {
  private metrics: CoreWebVitalsMetrics = {};
  private onUpdate: (metrics: CoreWebVitalsMetrics) => void;
  
  // 各个指标的观察者
  private fcpObserver: FCPObserver | null = null;
  private lcpObserver: LCPObserver | null = null;
  private fidObserver: FIDObserver | null = null;
  private clsObserver: CLSObserver | null = null;
  private inpObserver: INPObserver | null = null;

  constructor(onUpdate: (metrics: CoreWebVitalsMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  /**
   * 启动所有指标的监测
   */
  start(): void {
    this.startFCPMonitoring();
    this.startLCPMonitoring();
    this.startFIDMonitoring();
    this.startCLSMonitoring();
    this.startINPMonitoring();
  }

  /**
   * 停止所有指标的监测
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
   * 获取当前指标数据
   */
  getMetrics(): CoreWebVitalsMetrics {
    return this.metrics;
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
  
  /**
   * 通知指标更新
   */
  private notifyMetricsUpdate(): void {
    this.onUpdate(this.metrics);
  }
} 