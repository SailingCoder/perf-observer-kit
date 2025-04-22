import { BaseObserver } from './base-observer';
/**
 * First Input Delay (FID) 观察者
 * 负责测量页面首次输入延迟时间
 */
export class FIDObserver extends BaseObserver {
    constructor(options) {
        super(options);
        this.fidObserver = null;
    }
    /**
     * 实现观察FID的方法
     */
    observe() {
        try {
            this.fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                for (const entry of entries) {
                    if (entry.name === 'first-input') {
                        const fidEntry = entry;
                        const fid = {
                            name: 'FID',
                            value: fidEntry.processingStart - fidEntry.startTime,
                            unit: 'ms',
                            timestamp: performance.now(),
                        };
                        // FID rating thresholds (ms)
                        if (fid.value <= 100) {
                            fid.rating = 'good';
                        }
                        else if (fid.value <= 300) {
                            fid.rating = 'needs-improvement';
                        }
                        else {
                            fid.rating = 'poor';
                        }
                        this.onUpdate(fid);
                        // FID is only reported once
                        if (this.fidObserver) {
                            this.fidObserver.disconnect();
                            this.fidObserver = null;
                        }
                        break;
                    }
                }
            });
            this.fidObserver.observe({ type: 'first-input', buffered: true });
        }
        catch (error) {
            console.error('FID monitoring not supported', error);
        }
    }
    /**
     * 停止FID观察
     */
    stop() {
        if (this.fidObserver) {
            this.fidObserver.disconnect();
            this.fidObserver = null;
        }
        super.stop();
    }
    /**
     * BFCache恢复处理
     * FID通常不需要在bfcache恢复时重新计算
     */
    onBFCacheRestore(event) {
        // FID不需要特殊处理bfcache恢复
    }
}
//# sourceMappingURL=fid-observer.js.map