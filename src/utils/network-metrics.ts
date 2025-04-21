import { NetworkInformation } from '../metrics/web-vitals/types';

/**
 * 网络性能指标收集器
 * 提供收集和分析网络性能相关数据的工具方法
 */
export class NetworkMetricsCollector {
  /**
   * 获取当前网络状态信息
   * @returns 网络信息对象
   */
  static getNetworkInformation(): NetworkInformation | undefined {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        return {
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    }
    return undefined;
  }

  /**
   * 获取完整的网络上下文信息
   * @param extraContext 额外的上下文信息
   * @returns 网络上下文信息
   */
  static getNetworkContext(extraContext: Record<string, any> = {}): Record<string, any> {
    const networkInfo = this.getNetworkInformation();
    
    return {
      networkInfo: networkInfo ? {
        downlink: networkInfo.downlink,
        effectiveType: networkInfo.effectiveType,
        rtt: networkInfo.rtt,
        saveData: networkInfo.saveData
      } : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      visibilityState: typeof document !== 'undefined' ? document.visibilityState : undefined,
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : undefined,
      ...extraContext
    };
  }

  /**
   * 计算网络质量评分
   * @param networkInfo 网络信息对象
   * @returns 'good' | 'needs-improvement' | 'poor'
   */
  static rateNetworkQuality(networkInfo?: NetworkInformation): 'good' | 'needs-improvement' | 'poor' {
    if (!networkInfo) {
      return 'needs-improvement';
    }

    // 根据网络类型评估
    if (networkInfo.effectiveType === '4g' && networkInfo.downlink && networkInfo.downlink >= 5) {
      return 'good';
    } else if (networkInfo.effectiveType === '4g' || networkInfo.effectiveType === '3g') {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  }
} 