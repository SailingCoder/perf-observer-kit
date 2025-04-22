export function calculateTime(end, start) {
    return (typeof end === 'number' && typeof start === 'number') ? Math.max(end - start, 0) : 0;
}
/**
 * 计算两个时间点之间的差值，确保结果为非负
 * @param end 结束时间点
 * @param start 开始时间点
 * @returns 非负的时间差值
 */
export function calculateTimeDelta(end, start) {
    const delta = end - start;
    return delta > 0 ? delta : 0;
}
//# sourceMappingURL=time.js.map