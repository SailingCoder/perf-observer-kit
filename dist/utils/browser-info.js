/**
 * 浏览器和设备信息收集器
 * 提供收集浏览器环境信息的方法
 */
export class BrowserInfoCollector {
    /**
     * 获取浏览器和设备相关信息
     * @returns 浏览器和设备信息
     */
    static getBrowserInfo() {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return {};
        }
        try {
            return {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                vendor: navigator.vendor,
                screenSize: {
                    width: window.screen.width,
                    height: window.screen.height
                },
                windowSize: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                devicePixelRatio: window.devicePixelRatio,
                cookiesEnabled: navigator.cookieEnabled
            };
        }
        catch (error) {
            console.warn('无法获取完整的浏览器信息', error);
            return {};
        }
    }
    /**
     * 检测浏览器名称和版本
     * @returns 浏览器名称和版本信息
     */
    static detectBrowser() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (typeof navigator === 'undefined') {
            return { name: 'unknown', version: 'unknown' };
        }
        const userAgent = navigator.userAgent;
        let browserName = 'unknown';
        let version = 'unknown';
        try {
            // 检测常见浏览器
            if (userAgent.indexOf('Firefox') > -1) {
                browserName = 'Firefox';
                version = ((_a = userAgent.match(/Firefox\/([\d.]+)/)) === null || _a === void 0 ? void 0 : _a[1]) || '';
            }
            else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg/') > -1) {
                browserName = 'Edge';
                version = ((_b = userAgent.match(/Edge\/([\d.]+)/)) === null || _b === void 0 ? void 0 : _b[1]) ||
                    ((_c = userAgent.match(/Edg\/([\d.]+)/)) === null || _c === void 0 ? void 0 : _c[1]) || '';
            }
            else if (userAgent.indexOf('Chrome') > -1) {
                browserName = 'Chrome';
                version = ((_d = userAgent.match(/Chrome\/([\d.]+)/)) === null || _d === void 0 ? void 0 : _d[1]) || '';
            }
            else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
                browserName = 'Safari';
                version = ((_e = userAgent.match(/Version\/([\d.]+)/)) === null || _e === void 0 ? void 0 : _e[1]) || '';
            }
            else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
                browserName = 'Internet Explorer';
                version = ((_f = userAgent.match(/MSIE ([\d.]+)/)) === null || _f === void 0 ? void 0 : _f[1]) ||
                    ((_g = userAgent.match(/rv:([\d.]+)/)) === null || _g === void 0 ? void 0 : _g[1]) || '';
            }
            else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR/') > -1) {
                browserName = 'Opera';
                version = ((_h = userAgent.match(/Opera\/([\d.]+)/)) === null || _h === void 0 ? void 0 : _h[1]) ||
                    ((_j = userAgent.match(/OPR\/([\d.]+)/)) === null || _j === void 0 ? void 0 : _j[1]) || '';
            }
            return { name: browserName, version };
        }
        catch (error) {
            console.warn('无法检测浏览器版本', error);
            return { name: 'unknown', version: 'unknown' };
        }
    }
    /**
     * 检测操作系统
     * @returns 操作系统名称和版本信息
     */
    static detectOS() {
        var _a, _b, _c, _d, _e;
        if (typeof navigator === 'undefined') {
            return { name: 'unknown', version: 'unknown' };
        }
        const userAgent = navigator.userAgent;
        let osName = 'unknown';
        let version = 'unknown';
        try {
            if (userAgent.indexOf('Windows') > -1) {
                osName = 'Windows';
                if (userAgent.indexOf('Windows NT 10.0') > -1)
                    version = '10';
                else if (userAgent.indexOf('Windows NT 6.3') > -1)
                    version = '8.1';
                else if (userAgent.indexOf('Windows NT 6.2') > -1)
                    version = '8';
                else if (userAgent.indexOf('Windows NT 6.1') > -1)
                    version = '7';
                else if (userAgent.indexOf('Windows NT 6.0') > -1)
                    version = 'Vista';
                else if (userAgent.indexOf('Windows NT 5.1') > -1)
                    version = 'XP';
            }
            else if (userAgent.indexOf('Mac OS X') > -1) {
                osName = 'macOS';
                version = ((_b = (_a = userAgent.match(/Mac OS X ([0-9_\.]+)/)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.replace(/_/g, '.')) || '';
            }
            else if (userAgent.indexOf('Android') > -1) {
                osName = 'Android';
                version = ((_c = userAgent.match(/Android ([0-9\.]+)/)) === null || _c === void 0 ? void 0 : _c[1]) || '';
            }
            else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
                osName = 'iOS';
                version = ((_e = (_d = userAgent.match(/OS ([0-9_\.]+)/)) === null || _d === void 0 ? void 0 : _d[1]) === null || _e === void 0 ? void 0 : _e.replace(/_/g, '.')) || '';
            }
            else if (userAgent.indexOf('Linux') > -1) {
                osName = 'Linux';
            }
            return { name: osName, version };
        }
        catch (error) {
            console.warn('无法检测操作系统', error);
            return { name: 'unknown', version: 'unknown' };
        }
    }
    /**
     * 获取完整的环境信息
     * @returns 完整的浏览器和操作系统信息
     */
    static getEnvironmentInfo() {
        const browserInfo = this.getBrowserInfo();
        const browserDetails = this.detectBrowser();
        const osDetails = this.detectOS();
        return {
            ...browserInfo,
            browser: browserDetails,
            os: osDetails
        };
    }
}
//# sourceMappingURL=browser-info.js.map