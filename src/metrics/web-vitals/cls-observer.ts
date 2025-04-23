import { MetricData } from '../../types';
import { ObserverOptions, LayoutShift } from './types';
import { BaseObserver } from './base-observer';
import { logger } from '../../utils/logger';

/**
 * Cumulative Layout Shift (CLS) 观察者
 * 负责测量页面布局稳定性
 * 使用 Google Web Vitals 推荐的会话窗口计算方法
 */
export class CLSObserver extends BaseObserver {
  private clsObserver: PerformanceObserver | null = null;
  
  // CLS评分阈值
  private static readonly CLS_GOOD_THRESHOLD = 0.1;
  private static readonly CLS_NEEDS_IMPROVEMENT_THRESHOLD = 0.25;
  
  // 记录页面首次隐藏的时间
  private firstHiddenTime: number;
  
  // 会话窗口相关属性
  private sessionCount: number = 0;   // 当前会话中的偏移数量
  private sessionValues: number[] = [0]; // 各个会话窗口的CLS值
  private sessionGap: number = 1000;  // 会话间隔时间，单位毫秒
  private sessionMax: number = 5;     // 最大会话窗口数量
  private maxSessionEntries: number = 100; // 每个会话记录的最大偏移数量
  
  // 上次报告的CLS值
  private prevReportedValue: number = 0;
  // 上次偏移的时间戳
  private lastEntryTime: number = 0;
  // 是否需要在页面重新可见时重置会话
  private shouldResetOnNextVisible: boolean = false;
  // 防抖计时器
  private reportDebounceTimer: number | null = null;
  // 防抖延迟
  private reportDebounceDelay: number = 500;
  
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
   * 为CLS指标分配评级
   */
  private assignCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= CLSObserver.CLS_GOOD_THRESHOLD) {
      return 'good';
    } else if (value <= CLSObserver.CLS_NEEDS_IMPROVEMENT_THRESHOLD) {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  }
  
  /**
   * 实现观察CLS的方法
   */
  protected observe(): void {
    if (typeof PerformanceObserver === 'undefined') {
      logger.error('PerformanceObserver API不可用，无法监控CLS');
      return;
    }
    
    try {
      this.clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        // 只处理页面在可见状态时发生的布局偏移
        if (document.visibilityState !== 'visible') {
          logger.debug('页面不可见，忽略布局偏移事件');
          return;
        }
        
        // 处理新会话的标志
        let newSessionStarted = false;
        
        for (const entry of entries) {
          // 只计算用户未操作时的布局偏移
          const layoutShift = entry as LayoutShift;
          if (!layoutShift.hadRecentInput && layoutShift.startTime < this.firstHiddenTime) {
            // 获取偏移发生的时间戳
            const currentTime = layoutShift.startTime;
            
            // 判断是否需要开始新会话
            if (this.shouldResetOnNextVisible || currentTime - this.lastEntryTime > this.sessionGap) {
              this.startNewSession(layoutShift.value);
              newSessionStarted = true;
              this.shouldResetOnNextVisible = false;
            } else {
              // 累加到当前会话，但限制记录的事件数量
              if (this.sessionCount < this.maxSessionEntries) {
                this.sessionCount++;
                
                // 累加到当前会话
                const currentSessionIndex = this.sessionValues.length - 1;
                this.sessionValues[currentSessionIndex] += layoutShift.value;
              }
            }
            
            // 更新最后一次偏移时间
            this.lastEntryTime = currentTime;
            
            // 防抖处理，减少频繁报告
            this.debouncedReportCLS();
          }
        }
        
        // 如果开始了新会话，立即报告一次，不需要防抖
        if (newSessionStarted) {
          this.reportCLS(this.calculateCLS());
        }
      });
      
      // 使用buffered选项确保不会丢失之前的布局偏移
      this.clsObserver.observe({ type: 'layout-shift', buffered: true });
      logger.debug('CLS观察者已启动，开始监控布局偏移');
    } catch (error) {
      logger.error('CLS监控不受支持', error);
    }
  }
  
  /**
   * 开始新的会话窗口
   * @param initialValue 初始偏移值
   */
  private startNewSession(initialValue: number): void {
    // 添加新会话
    this.sessionValues.push(initialValue);
    this.sessionCount = 1;
    
    // 如果会话窗口超过限制，移除最小的会话
    if (this.sessionValues.length > this.sessionMax) {
      // 找到最小的会话值及其索引
      let minValue = Infinity;
      let minIndex = 0;
      
      for (let i = 0; i < this.sessionValues.length; i++) {
        if (this.sessionValues[i] < minValue) {
          minValue = this.sessionValues[i];
          minIndex = i;
        }
      }
      
      // 移除最小的会话
      this.sessionValues.splice(minIndex, 1);
    }
    
    logger.debug(`开始新的CLS会话，当前会话数: ${this.sessionValues.length}`);
  }
  
  /**
   * 防抖报告CLS，减少频繁更新
   */
  private debouncedReportCLS(): void {
    // 清除现有计时器
    if (this.reportDebounceTimer !== null) {
      window.clearTimeout(this.reportDebounceTimer);
    }
    
    // 设置新计时器
    this.reportDebounceTimer = window.setTimeout(() => {
      const clsValue = this.calculateCLS();
      
      // 只有当CLS值显著变化时才报告
      if (Math.abs(clsValue - this.prevReportedValue) >= 0.01) {
        this.reportCLS(clsValue);
      }
      
      this.reportDebounceTimer = null;
    }, this.reportDebounceDelay);
  }
  
  /**
   * 计算最终CLS值
   * 取所有会话窗口中的最大值
   */
  private calculateCLS(): number {
    return Math.max(...this.sessionValues);
  }
  
  /**
   * 报告CLS指标
   */
  private reportCLS(clsValue: number): void {
    const cls: MetricData = {
      name: 'CLS',
      value: clsValue,
      unit: '', // CLS没有单位，是无量纲数值
      timestamp: new Date().getTime(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      // 添加网络信息和其他上下文
      context: {
        shiftCount: this.sessionCount,
        sessionCount: this.sessionValues.length,
        sessionValues: [...this.sessionValues],
        largestSession: this.calculateCLS(),
        isPageVisible: document.visibilityState === 'visible',
        firstHiddenTime: this.firstHiddenTime === Infinity ? null : this.firstHiddenTime
      }
    };
    
    // 设置评级
    cls.rating = this.assignCLSRating(cls.value);
    
    logger.debug(`报告CLS值: ${cls.value}，评级: ${cls.rating}，页面可见性: ${document.visibilityState}`);
    this.onUpdate(cls);
    
    // 更新上次报告的值
    this.prevReportedValue = clsValue;
  }
  
  /**
   * 停止CLS观察
   */
  public stop(): void {
    // 清除防抖计时器
    if (this.reportDebounceTimer !== null) {
      window.clearTimeout(this.reportDebounceTimer);
      this.reportDebounceTimer = null;
    }
    
    if (this.clsObserver) {
      this.clsObserver.disconnect();
      this.clsObserver = null;
    }
    
    super.stop();
  }
  
  /**
   * 页面可见性变化时的回调
   * @param isVisible 页面是否可见
   */
  protected onVisibilityChange(isVisible: boolean): void {
    if (!isVisible) {
      // 页面隐藏时，报告当前的CLS值
      if (this.firstHiddenTime === Infinity) {
        this.firstHiddenTime = performance.now();
        logger.debug(`页面隐藏，更新firstHiddenTime: ${this.firstHiddenTime}ms`);
      }
      
      const clsValue = this.calculateCLS();
      // 无论大小变化，都在页面隐藏时报告一次
      this.reportCLS(clsValue);
      
      // 标记需要在页面重新可见时开始新会话
      this.shouldResetOnNextVisible = true;
    } else {
      // 页面重新变为可见
      if (this.shouldResetOnNextVisible) {
        logger.debug('页面重新可见，准备开始新的CLS会话');
        // 实际的重置会在下一个布局偏移发生时生效
      }
    }
  }
  
  /**
   * BFCache恢复处理
   * CLS应该重置累积值
   */
  protected onBFCacheRestore(event: PageTransitionEvent): void {
    // 重置CLS会话值
    this.sessionValues = [0];
    this.sessionCount = 0;
    this.prevReportedValue = 0;
    this.lastEntryTime = 0;
    
    // 清除计时器
    if (this.reportDebounceTimer !== null) {
      window.clearTimeout(this.reportDebounceTimer);
      this.reportDebounceTimer = null;
    }
    
    // 重置firstHiddenTime
    this.firstHiddenTime = this.initFirstHiddenTime();
    this.setupFirstHiddenTimeListener();
    
    logger.info('CLS值已在bfcache恢复后重置');
    
    // 重新开始CLS监测
    if (this.clsObserver) {
      this.clsObserver.observe({ type: 'layout-shift', buffered: true });
    }
  }
} 