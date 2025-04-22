import { BaseObserver } from './base-observer';
/**
 * Interaction to Next Paint (INP) 观察者
 * 负责测量页面交互响应性能
 */
export class INPObserver extends BaseObserver {
    constructor(options) {
        super(options);
        this.inpObserver = null;
    }
    /**
     * 实现观察INP的方法
     */
    observe() {
        try {
            this.inpObserver = new PerformanceObserver((entryList) => {
                const events = entryList.getEntries();
                // Find the longest duration event or interaction
                if (events.length > 0) {
                    let longestDuration = 0;
                    let longestEvent = null;
                    for (const event of events) {
                        const duration = event.duration;
                        if (duration > longestDuration) {
                            longestDuration = duration;
                            longestEvent = event;
                        }
                    }
                    if (longestEvent) {
                        const inp = {
                            name: 'INP',
                            value: longestDuration,
                            unit: 'ms',
                            timestamp: performance.now(),
                        };
                        // INP rating thresholds (ms)
                        if (inp.value <= 200) {
                            inp.rating = 'good';
                        }
                        else if (inp.value <= 500) {
                            inp.rating = 'needs-improvement';
                        }
                        else {
                            inp.rating = 'poor';
                        }
                        this.onUpdate(inp);
                    }
                }
            });
            // Use a type assertion to handle the non-standard property
            this.inpObserver.observe({
                type: 'event',
                buffered: true,
                // @ts-ignore - durationThreshold is available in newer browsers
                durationThreshold: 16 // Only measure events that take at least 16ms
            });
        }
        catch (error) {
            console.error('INP monitoring not supported', error);
        }
    }
    /**
     * 停止INP观察
     */
    stop() {
        if (this.inpObserver) {
            this.inpObserver.disconnect();
            this.inpObserver = null;
        }
        super.stop();
    }
    /**
     * BFCache恢复处理
     * 重置INP监测
     */
    onBFCacheRestore(event) {
        // 重新启动INP监测
        if (this.inpObserver) {
            this.inpObserver.disconnect();
            this.inpObserver = null;
        }
        this.observe();
    }
}
//# sourceMappingURL=inp-observer.js.map