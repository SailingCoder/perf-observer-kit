import { MetricData } from '../../types';
import { ObserverOptions } from './types';
import { BaseObserver } from './base-observer';
import { logger } from '../../utils/logger';

/**
 * Interaction to Next Paint (INP) 观察者
 * 负责测量页面交互响应性能
 * 实现基于 Google Web Vitals 推荐方法
 */
export class INPObserver extends BaseObserver {
  private inpObserver: PerformanceObserver | null = null;
  
  // INP评分阈值（毫秒）
  private static readonly INP_GOOD_THRESHOLD = 200;
  private static readonly INP_NEEDS_IMPROVEMENT_THRESHOLD = 500;
  
  // 记录页面首次隐藏的时间
  private firstHiddenTime: number;
  
  // 存储所有交互事件的持续时间
  private interactionEvents: {duration: number, name: string, startTime: number}[] = [];
  
  // 上次报告的INP值
  private lastReportedINP: number = 0;
  
  // 报告频率控制
  private minReportingChange = 10; // 最小报告变化阈值（毫秒）
  
  constructor(options: ObserverOptions) {
    super(options);
    
    // 初始化首次隐藏时间
    this.firstHiddenTime = this.initFirstHiddenTime();
    
    // 监听visibility变化以更新首次隐藏时间
    this.setupFirstHiddenTimeListener();
  }
  
  /**
   * 获取页面首次隐藏的时间
   */
  private initFirstHiddenTime(): number {
    // 如果页面已经是隐藏状态，返回0
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return 0;
    }
    // 否则返回无限大，表示页面尚未隐藏
    return Infinity;
  }
  
  /**
   * 设置监听页面首次隐藏的事件
   */
  private setupFirstHiddenTimeListener(): void {
    if (typeof document === 'undefined') return;
    
    const updateHiddenTime = () => {
      if (document.visibilityState === 'hidden' && this.firstHiddenTime === Infinity) {
        this.firstHiddenTime = performance.now();
        logger.debug(`记录页面首次隐藏时间: ${this.firstHiddenTime}ms`);
      }
    };
    
    // 监听页面visibility变化
    document.addEventListener('visibilitychange', updateHiddenTime, { once: true });
    
    // 页面卸载时也视为隐藏
    document.addEventListener('unload', updateHiddenTime, { once: true });
  }
  
  /**
   * 为INP指标分配评级
   */
  private assignINPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= INPObserver.INP_GOOD_THRESHOLD) {
      return 'good';
    } else if (value <= INPObserver.INP_NEEDS_IMPROVEMENT_THRESHOLD) {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  }
  
  /**
   * 实现观察INP的方法
   */
  protected observe(): void {
    if (typeof PerformanceObserver === 'undefined') {
      logger.error('PerformanceObserver API不可用，无法监控INP');
      return;
    }
    
    try {
      // 定义要观察的交互类型
      const eventTypes = ['click', 'keydown', 'pointerdown'];
      
      this.inpObserver = new PerformanceObserver((entryList) => {
        // 只处理页面在可见状态时发生的交互
        if (document.visibilityState !== 'visible') return;
        
        const events = entryList.getEntries();
        
        // 处理每个交互事件
        for (const event of events) {
          // 只处理发生在页面可见状态的交互
          if (event.startTime < this.firstHiddenTime) {
            const timing = event as PerformanceEventTiming;
            
            // 检查事件类型是否在我们关注的范围内
            if (eventTypes.includes(timing.name)) {
              this.interactionEvents.push({
                duration: timing.duration,
                name: timing.name,
                startTime: timing.startTime
              });
              
              // 计算并可能报告新的INP值
              this.calculateAndReportINP();
            }
          }
        }
      });
      
      // 使用类型断言处理非标准属性
      try {
        // 尝试使用带有durationThreshold的observe
        // durationThreshold是较新浏览器中可用的非标准属性
        this.inpObserver.observe({ 
          type: 'event', 
          buffered: true,
          // 使用类型断言来处理非标准属性
          ...({durationThreshold: 16} as {durationThreshold: number})  // 只测量至少持续16ms的事件
        });
      } catch (error) {
        // 回退到不带durationThreshold的observe
        this.inpObserver.observe({ 
          type: 'event', 
          buffered: true
        });
        logger.warn('浏览器不支持durationThreshold参数，使用默认配置');
      }
    } catch (error) {
      logger.error('INP监控不受支持', error);
    }
  }
  
  /**
   * 计算INP（交互到下一次绘制）值
   * 使用Google推荐的方法（取第75百分位数）
   */
  private calculateINP(): number {
    if (this.interactionEvents.length === 0) {
      return 0;
    }
    
    // 将交互事件按持续时间排序
    const sortedDurations = this.interactionEvents.map(event => event.duration).sort((a, b) => a - b);
    
    // 计算第75百分位数
    const percentile = 0.75;
    const index = Math.floor(sortedDurations.length * percentile);
    
    // 如果只有一个交互，直接返回
    if (sortedDurations.length === 1) {
      return sortedDurations[0];
    }
    
    // 返回第75百分位数的值
    return sortedDurations[index];
  }
  
  /**
   * 计算并报告INP值，如果值有显著变化
   */
  private calculateAndReportINP(): void {
    // 计算新的INP值
    const inpValue = this.calculateINP();
    
    // 只有当INP值显著变化时才报告
    if (Math.abs(inpValue - this.lastReportedINP) >= this.minReportingChange) {
      // 创建INP指标对象
      const inp: MetricData = {
        name: 'INP',
        value: inpValue,
        unit: 'ms',
        timestamp: performance.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        context: {
          interactionCount: this.interactionEvents.length,
          percentile: 75,
          highestDuration: Math.max(...this.interactionEvents.map(e => e.duration)),
          medianDuration: this.interactionEvents.length > 0 
            ? this.interactionEvents.map(e => e.duration).sort((a, b) => a - b)[Math.floor(this.interactionEvents.length / 2)]
            : 0,
          eventTypes: [...new Set(this.interactionEvents.map(e => e.name))],
          firstHiddenTime: this.firstHiddenTime === Infinity ? null : this.firstHiddenTime
        }
      };
      
      // 设置评级
      inp.rating = this.assignINPRating(inp.value);
      
      logger.debug(`报告INP值: ${inp.value}ms，评级: ${inp.rating}，基于${this.interactionEvents.length}个交互`);
      this.onUpdate(inp);
      
      // 更新最后报告的值
      this.lastReportedINP = inpValue;
    }
  }
  
  /**
   * 停止INP观察
   */
  public stop(): void {
    if (this.inpObserver) {
      this.inpObserver.disconnect();
      this.inpObserver = null;
    }
    
    super.stop();
  }
  
  /**
   * 页面可见性变化时的回调
   * @param isVisible 页面是否可见
   */
  protected onVisibilityChange(isVisible: boolean): void {
    // 更新firstHiddenTime
    if (!isVisible && this.firstHiddenTime === Infinity) {
      this.firstHiddenTime = performance.now();
      logger.debug(`页面隐藏，更新firstHiddenTime: ${this.firstHiddenTime}ms`);
      
      // 当页面隐藏时，报告当前的INP值
      if (this.interactionEvents.length > 0) {
        this.calculateAndReportINP();
      }
    }
  }
  
  /**
   * BFCache恢复处理
   * 重置INP监测
   */
  protected onBFCacheRestore(event: PageTransitionEvent): void {
    // 重置INP值和交互事件
    this.interactionEvents = [];
    this.lastReportedINP = 0;
    
    // 重置firstHiddenTime
    this.firstHiddenTime = this.initFirstHiddenTime();
    this.setupFirstHiddenTimeListener();
    
    logger.info('INP监测已在bfcache恢复后重置');
    
    // 重新启动INP监测
    if (this.inpObserver) {
      this.inpObserver.disconnect();
      this.inpObserver = null;
    }
    
    this.observe();
  }
} 