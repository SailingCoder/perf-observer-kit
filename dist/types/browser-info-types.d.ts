/**
 * 浏览器信息数据结构
 */
export interface BrowserInfo {
    userAgent?: string;
    language?: string;
    platform?: string;
    vendor?: string;
    url?: string;
    screenSize?: {
        width: number;
        height: number;
    };
    windowSize?: {
        width: number;
        height: number;
    };
    devicePixelRatio?: number;
    cookiesEnabled?: boolean;
    browser?: {
        name: string;
        version: string;
    };
    os?: {
        name: string;
        version: string;
    };
}
