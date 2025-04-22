/**
 * API请求性能监控
 * 用于拦截和监控XMLHttpRequest和Fetch API的性能
 */
export class ApiRequestObserver {
    constructor(onUpdate) {
        this.requests = [];
        this.originalXhrOpen = null;
        this.originalXhrSend = null;
        this.originalFetch = null;
        this.onUpdate = onUpdate;
    }
    /**
     * 开始监控API请求
     */
    start() {
        this.monitorXhr();
        this.monitorFetch();
    }
    /**
     * 停止监控API请求
     */
    stop() {
        this.restoreXhr();
        this.restoreFetch();
    }
    /**
     * 获取收集的API请求数据
     */
    getRequests() {
        return this.requests;
    }
    /**
     * 清除收集的API请求数据
     */
    clearRequests() {
        this.requests = [];
        this.onUpdate(this.requests);
    }
    /**
     * 监控XMLHttpRequest
     */
    monitorXhr() {
        if (typeof XMLHttpRequest === 'undefined') {
            console.warn('XMLHttpRequest is not supported in this environment');
            return;
        }
        this.originalXhrOpen = XMLHttpRequest.prototype.open;
        this.originalXhrSend = XMLHttpRequest.prototype.send;
        const self = this;
        XMLHttpRequest.prototype.open = function (method, url, async = true, username, password) {
            this.__perfObserverMethod = method;
            this.__perfObserverUrl = url.toString();
            if (self.originalXhrOpen) {
                self.originalXhrOpen.call(this, method, url, async, username, password);
            }
        };
        XMLHttpRequest.prototype.send = function (body) {
            const startTime = performance.now();
            const url = this.__perfObserverUrl || '';
            const method = this.__perfObserverMethod || 'GET';
            let requestSize = 0;
            // 计算请求大小
            if (body) {
                if (typeof body === 'string') {
                    requestSize = new Blob([body]).size;
                }
                else if (body instanceof Blob) {
                    requestSize = body.size;
                }
                else if (body instanceof FormData) {
                    // FormData大小估算
                    requestSize = 0; // 实际项目中可能需要更复杂的估算
                }
            }
            // 监听加载完成事件
            this.addEventListener('load', function () {
                const endTime = performance.now();
                const duration = endTime - startTime;
                const status = this.status;
                const responseSize = this.responseText ? new Blob([this.responseText]).size : 0;
                const apiRequest = {
                    url,
                    method,
                    status,
                    startTime,
                    duration,
                    requestSize,
                    responseSize,
                    success: status >= 200 && status < 300,
                    timestamp: Date.now()
                };
                self.addRequest(apiRequest);
            });
            // 监听错误事件
            this.addEventListener('error', function () {
                const endTime = performance.now();
                const duration = endTime - startTime;
                const apiRequest = {
                    url,
                    method,
                    status: 0,
                    startTime,
                    duration,
                    requestSize,
                    success: false,
                    errorMessage: 'Network error occurred',
                    timestamp: Date.now()
                };
                self.addRequest(apiRequest);
            });
            // 监听超时事件
            this.addEventListener('timeout', function () {
                const endTime = performance.now();
                const duration = endTime - startTime;
                const apiRequest = {
                    url,
                    method,
                    status: 0,
                    startTime,
                    duration,
                    requestSize,
                    success: false,
                    errorMessage: 'Request timeout',
                    timestamp: Date.now()
                };
                self.addRequest(apiRequest);
            });
            // 监听中止事件
            this.addEventListener('abort', function () {
                const endTime = performance.now();
                const duration = endTime - startTime;
                const apiRequest = {
                    url,
                    method,
                    status: 0,
                    startTime,
                    duration,
                    requestSize,
                    success: false,
                    errorMessage: 'Request aborted',
                    timestamp: Date.now()
                };
                self.addRequest(apiRequest);
            });
            if (self.originalXhrSend) {
                self.originalXhrSend.call(this, body);
            }
        };
    }
    /**
     * 监控Fetch API
     */
    monitorFetch() {
        if (typeof fetch === 'undefined') {
            console.warn('Fetch API is not supported in this environment');
            return;
        }
        this.originalFetch = window.fetch;
        const self = this;
        window.fetch = function (input, init) {
            const startTime = performance.now();
            let method = 'GET';
            let url = '';
            if (typeof input === 'string') {
                url = input;
            }
            else if (input instanceof Request) {
                url = input.url;
                method = input.method || 'GET';
            }
            else if (input instanceof URL) {
                url = input.toString();
            }
            if (init === null || init === void 0 ? void 0 : init.method) {
                method = init.method;
            }
            // 计算请求大小
            let requestSize = 0;
            if (init === null || init === void 0 ? void 0 : init.body) {
                const body = init.body;
                if (typeof body === 'string') {
                    requestSize = new Blob([body]).size;
                }
                else if (body instanceof Blob) {
                    requestSize = body.size;
                }
                else if (body instanceof FormData) {
                    requestSize = 0; // 实际项目中可能需要更复杂的估算
                }
            }
            return self.originalFetch(input, init)
                .then(async (response) => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                const status = response.status;
                // 克隆响应以避免消耗响应流
                const clonedResponse = response.clone();
                let responseSize = 0;
                try {
                    const blob = await clonedResponse.blob();
                    responseSize = blob.size;
                }
                catch (e) {
                    console.error('无法获取响应大小', e);
                }
                const apiRequest = {
                    url,
                    method,
                    status,
                    startTime,
                    duration,
                    requestSize,
                    responseSize,
                    success: status >= 200 && status < 300,
                    timestamp: Date.now()
                };
                self.addRequest(apiRequest);
                return response;
            })
                .catch(error => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                const apiRequest = {
                    url,
                    method,
                    status: 0,
                    startTime,
                    duration,
                    requestSize,
                    success: false,
                    errorMessage: error.message || 'Fetch error',
                    timestamp: Date.now()
                };
                self.addRequest(apiRequest);
                throw error; // 重新抛出错误，保持原始行为
            });
        };
    }
    /**
     * 恢复原始XMLHttpRequest
     */
    restoreXhr() {
        if (typeof XMLHttpRequest !== 'undefined') {
            if (this.originalXhrOpen) {
                XMLHttpRequest.prototype.open = this.originalXhrOpen;
            }
            if (this.originalXhrSend) {
                XMLHttpRequest.prototype.send = this.originalXhrSend;
            }
        }
    }
    /**
     * 恢复原始Fetch
     */
    restoreFetch() {
        if (typeof fetch !== 'undefined' && this.originalFetch) {
            window.fetch = this.originalFetch;
        }
    }
    /**
     * 添加API请求记录
     */
    addRequest(request) {
        this.requests.push(request);
        this.onUpdate(this.requests);
    }
}
//# sourceMappingURL=api-request.js.map