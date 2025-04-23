/**
 * 浏览器和设备信息接口
 * 用于收集和存储有关用户浏览器和设备的信息
 */
export interface BrowserInfo {
    /** 浏览器名称 */
    browserName?: string;
    /** 浏览器版本 */
    browserVersion?: string;
    /** 操作系统名称 */
    osName?: string;
    /** 操作系统版本 */
    osVersion?: string;
    /** 设备类型 (desktop, mobile, tablet) */
    deviceType?: string;
    /** 设备厂商 */
    deviceVendor?: string;
    /** 设备型号 */
    deviceModel?: string;
    /** 屏幕分辨率 */
    screenResolution?: string;
    /** 屏幕方向 (portrait, landscape) */
    screenOrientation?: string;
    /** 浏览器语言设置 */
    language?: string;
    /** 浏览器用户代理字符串 */
    userAgent?: string;
    /** 记录时的时间戳 */
    timestamp?: number;
}
