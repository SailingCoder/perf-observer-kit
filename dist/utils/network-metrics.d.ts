import { NetworkInformation } from '../metrics/web-vitals/types';
/**
 * 网络性能指标收集器
 * 提供收集和分析网络性能相关数据的工具方法
 */
export declare class NetworkMetricsCollector {
    /**
     * 获取当前网络状态信息
     * @returns 网络信息对象
     */
    static getNetworkInformation(): NetworkInformation | undefined;
    /**
     * 获取完整的网络上下文信息
     * @param extraContext 额外的上下文信息
     * @returns 网络上下文信息
     */
    static getNetworkContext(extraContext?: Record<string, any>): Record<string, any>;
    /**
     * 计算网络质量评分
     * @param networkInfo 网络信息对象
     * @returns 'good' | 'needs-improvement' | 'poor'
     */
    static rateNetworkQuality(networkInfo?: NetworkInformation): 'good' | 'needs-improvement' | 'poor';
}
