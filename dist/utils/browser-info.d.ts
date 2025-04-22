/**
 * 浏览器和设备信息收集器
 * 提供收集浏览器环境信息的方法
 */
export declare class BrowserInfoCollector {
    /**
     * 获取浏览器和设备相关信息
     * @returns 浏览器和设备信息
     */
    static getBrowserInfo(): Record<string, any>;
    /**
     * 检测浏览器名称和版本
     * @returns 浏览器名称和版本信息
     */
    static detectBrowser(): {
        name: string;
        version: string;
    };
    /**
     * 检测操作系统
     * @returns 操作系统名称和版本信息
     */
    static detectOS(): {
        name: string;
        version: string;
    };
    /**
     * 获取完整的环境信息
     * @returns 完整的浏览器和操作系统信息
     */
    static getEnvironmentInfo(): Record<string, any>;
}
