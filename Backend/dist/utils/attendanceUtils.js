"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHours = void 0;
const calculateHours = (inTime, outTime) => {
    const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;
    const STANDARD_HOURS = 8;
    const diffHours = (outTime.getTime() - inTime.getTime()) / MILLISECONDS_PER_HOUR;
    const overtime = Math.max(0, diffHours - STANDARD_HOURS);
    return {
        totalHours: parseFloat(diffHours.toFixed(2)),
        overtimeHours: parseFloat(overtime.toFixed(2))
    };
};
exports.calculateHours = calculateHours;
