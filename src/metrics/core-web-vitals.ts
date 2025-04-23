import { CoreWebVitalsMetrics } from '../types';
import {
  FCPObserver,
  LCPObserver,
  FIDObserver,
  CLSObserver,
  INPObserver
} from './web-vitals/index';
import { CoreWebVitalsObserverOptions } from './web-vitals/types';
import { logger } from '../utils/logger';

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
      // 默认启用
      enabled: options.enabled !== undefined ? options.enabled : false,
      
      // FCP和LCP默认启用，其他指标默认不启用
      fcp: options.fcp !== undefined ? options.fcp : false,
      lcp: options.lcp !== undefined ? options.lcp : false,
      fid: options.fid !== undefined ? options.fid : false,
      cls: options.cls !== undefined ? options.cls : false,
      inp: options.inp !== undefined ? options.inp : false,
      
      // 其他选项
      backgroundLoadThreshold: options.backgroundLoadThreshold,
      
      ...options
    };

    console.log('core-web-vitals options', options, this.options);
    
    logger.debug('核心Web指标观察者已创建，初始配置:', {
      enabled: this.options.enabled,
      fcp: this.options.fcp,
      lcp: this.options.lcp,
      fid: this.options.fid,
      cls: this.options.cls,
      inp: this.options.inp
    });
  }
  
  /**
   * 开始监控所有核心Web指标
   */
  start(): void {
    logger.info('开始监控核心Web指标');
    
    // 启动FCP监测
    if (this.options.fcp) {
      logger.debug('启动FCP监测');
      this.startFCPMonitoring();
    }
    
    // 启动LCP监测
    if (this.options.lcp) {
      logger.debug('启动LCP监测');
      this.startLCPMonitoring();
    }
    
    // 启动FID监测
    if (this.options.fid) {
      logger.debug('启动FID监测');
      this.startFIDMonitoring();
    }
    
    // 启动CLS监测
    if (this.options.cls) {
      logger.debug('启动CLS监测');
      this.startCLSMonitoring();
    }
    
    // 启动INP监测
    if (this.options.inp) {
      logger.debug('启动INP监测');
      this.startINPMonitoring();
    }
    
    logger.debug('核心Web指标监控启动完成');
  }
  
  /**
   * 停止所有监控
   */
  stop(): void {
    logger.info('停止所有核心Web指标监控');
    
    if (this.fcpObserver) {
      this.fcpObserver.stop();
      this.fcpObserver = null;
      logger.debug('FCP监控已停止');
    }
    
    if (this.lcpObserver) {
      this.lcpObserver.stop();
      this.lcpObserver = null;
      logger.debug('LCP监控已停止');
    }
    
    if (this.fidObserver) {
      this.fidObserver.stop();
      this.fidObserver = null;
      logger.debug('FID监控已停止');
    }
    
    if (this.clsObserver) {
      this.clsObserver.stop();
      this.clsObserver = null;
      logger.debug('CLS监控已停止');
    }
    
    if (this.inpObserver) {
      this.inpObserver.stop();
      this.inpObserver = null;
      logger.debug('INP监控已停止');
    }
    
    logger.debug('所有核心Web指标监控均已停止');
  }
  
  /**
   * 发送指标更新通知
   */
  private notifyMetricsUpdate(): void {
    logger.debug('发送核心Web指标更新通知');
    this.onUpdate(this.metrics);
  }

  /**
   * 启动FCP监测
   */
  private startFCPMonitoring(): void {
    try {
      this.fcpObserver = new FCPObserver({
        onUpdate: (metric) => {
          this.metrics.fcp = metric;
          logger.debug('FCP指标已更新:', metric.value.toFixed(2) + 'ms', `(${metric.rating})`);
          this.notifyMetricsUpdate();
        }
      });
      
      this.fcpObserver.start();
    } catch (error) {
      logger.error('启动FCP监控失败:', error);
    }
  }
  
  /**
   * 启动LCP监测
   */
  private startLCPMonitoring(): void {
    try {
      this.lcpObserver = new LCPObserver({
        onUpdate: (metric) => {
          this.metrics.lcp = metric;
          logger.debug('LCP指标已更新:', metric.value.toFixed(2) + 'ms', `(${metric.rating})`);
          this.notifyMetricsUpdate();
        },
        backgroundLoadThreshold: this.options.backgroundLoadThreshold
      });
      
      this.lcpObserver.start();
    } catch (error) {
      logger.error('启动LCP监控失败:', error);
    }
  }
  
  /**
   * 启动FID监测
   */
  private startFIDMonitoring(): void {
    try {
      this.fidObserver = new FIDObserver({
        onUpdate: (metric) => {
          this.metrics.fid = metric;
          logger.debug('FID指标已更新:', metric.value.toFixed(2) + 'ms', `(${metric.rating})`);
          this.notifyMetricsUpdate();
        }
      });
      
      this.fidObserver.start();
    } catch (error) {
      logger.error('启动FID监控失败:', error);
    }
  }
  
  /**
   * 启动CLS监测
   */
  private startCLSMonitoring(): void {
    try {
      this.clsObserver = new CLSObserver({
        onUpdate: (metric) => {
          this.metrics.cls = metric;
          logger.debug('CLS指标已更新:', metric.value.toFixed(4), `(${metric.rating})`);
          this.notifyMetricsUpdate();
        }
      });
      
      this.clsObserver.start();
    } catch (error) {
      logger.error('启动CLS监控失败:', error);
    }
  }
  
  /**
   * 启动INP监测
   */
  private startINPMonitoring(): void {
    try {
      this.inpObserver = new INPObserver({
        onUpdate: (metric) => {
          this.metrics.inp = metric;
          logger.debug('INP指标已更新:', metric.value.toFixed(2) + 'ms', `(${metric.rating})`);
          this.notifyMetricsUpdate();
        }
      });
      
      this.inpObserver.start();
    } catch (error) {
      logger.error('启动INP监控失败:', error);
    }
  }
} 