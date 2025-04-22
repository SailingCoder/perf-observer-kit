import { BaseObserver } from './base-observer';
/**
 * First Contentful Paint (FCP) 观察者
 * 负责测量页面首次内容绘制时间
 */
export class FCPObserver extends BaseObserver {
    constructor(options) {
        super(options);
        this.fcpObserver = null;
    }
    /**
     * 实现观察FCP的方法
     */
    observe() {
        try {
            this.fcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                for (const entry of entries) {
                    if (entry.name === 'first-contentful-paint') {
                        const fcp = {
                            name: 'FCP',
                            value: entry.startTime,
                            unit: 'ms',
                            timestamp: performance.now(),
                        };
                        // FCP评级阈值
                        if (fcp.value <= 1800) {
                            fcp.rating = 'good';
                        }
                        else if (fcp.value <= 3000) {
                            fcp.rating = 'needs-improvement';
                        }
                        else {
                            fcp.rating = 'poor';
                        }
                        this.onUpdate(fcp);
                        // FCP只报告一次
                        if (this.fcpObserver) {
                            this.fcpObserver.disconnect();
                            this.fcpObserver = null;
                        }
                        break;
                    }
                }
            });
            this.fcpObserver.observe({ type: 'paint', buffered: true });
        }
        catch (error) {
            console.error('FCP monitoring not supported', error);
        }
    }
    /**
     * 停止FCP观察
     */
    stop() {
        if (this.fcpObserver) {
            this.fcpObserver.disconnect();
            this.fcpObserver = null;
        }
        super.stop();
    }
    /**
     * BFCache恢复处理
     * FCP通常不需要在bfcache恢复时重新计算
     */
    onBFCacheRestore(event) {
        // FCP不需要特殊处理bfcache恢复
    }
}
//# sourceMappingURL=fcp-observer.js.map