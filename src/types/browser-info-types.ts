/**
 * 浏览器信息数据结构
 */
export interface BrowserInfo {
  userAgent?: string; // 浏览器用户代理
  language?: string; // 浏览器语言
  platform?: string; // 操作系统平台
  vendor?: string; // 浏览器厂商
  url?: string; // 当前页面URL
  screenSize?: {
    width: number;
    height: number;
  }; // 屏幕尺寸
  windowSize?: {
    width: number; 
    height: number;
  }; // 窗口尺寸
  devicePixelRatio?: number; // 设备像素比
  cookiesEnabled?: boolean; // 是否启用cookie
  browser?: {
    name: string; // 浏览器名称
    version: string; // 浏览器版本
  }; // 浏览器详细信息
  os?: {
    name: string; // 操作系统名称
    version: string; // 操作系统版本
  }; // 操作系统详细信息
} 