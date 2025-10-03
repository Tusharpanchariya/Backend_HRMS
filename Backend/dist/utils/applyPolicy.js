"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPolicyLogic = applyPolicyLogic;
// Helper: convert "HH:mm" string to Date (based on a given base date)
function toTime(base, timeStr) {
    if (!timeStr)
        return null;
    const [h, m] = timeStr.split(":").map(Number);
    const dt = new Date(base);
    dt.setHours(h, m, 0, 0);
    return dt;
}
function applyPolicyLogic(inTime, outTime, policy) {
    if (!policy)
        return { status: "PRESENT", deduction: 0 };
    if (!inTime)
        return { status: "ABSENT", deduction: policy.deductionFullDay };
    let status = "PRESENT";
    let deduction = 0;
    // 🔹 Office timings
    const officeStart = toTime(inTime, policy.officeStartTime);
    const officeEnd = toTime(inTime, policy.officeEndTime);
    // 🔹 Grace logic
    const graceLimit = new Date(officeStart);
    graceLimit.setMinutes(graceLimit.getMinutes() + policy.gracePeriodMins);
    // 🔹 Late arrival cutoffs
    const qLateStart = toTime(inTime, policy.quarterDayLateStart);
    const qLateEnd = toTime(inTime, policy.quarterDayLateEnd);
    const halfDayLateAfter = toTime(inTime, policy.halfDayLateAfter);
    // 🔹 Early leave cutoffs
    const qEarlyStart = toTime(inTime, policy.quarterDayEarlyStart);
    const qEarlyEnd = toTime(inTime, policy.quarterDayEarlyEnd);
    const halfDayEarlyBefore = toTime(inTime, policy.halfDayEarlyBefore);
    // ✅ Check Late Arrival
    if (inTime > graceLimit) {
        if (qLateStart && qLateEnd && inTime >= qLateStart && inTime <= qLateEnd) {
            status = "LATE";
            deduction = Math.max(deduction, policy.deductionQuarterDay);
        }
        else if (halfDayLateAfter && inTime > halfDayLateAfter) {
            status = "HALF_DAY";
            deduction = Math.max(deduction, policy.deductionHalfDay);
        }
    }
    // ✅ Check Early Leave
    if (outTime) {
        if (qEarlyStart && qEarlyEnd && outTime >= qEarlyStart && outTime <= qEarlyEnd) {
            status = "EARLY_LEAVE";
            deduction = Math.max(deduction, policy.deductionQuarterDay);
        }
        else if (halfDayEarlyBefore && outTime < halfDayEarlyBefore) {
            status = "HALF_DAY";
            deduction = Math.max(deduction, policy.deductionHalfDay);
        }
        else if (outTime < officeEnd) {
            // Left before official office end
            status = "EARLY_LEAVE";
            deduction = Math.max(deduction, policy.deductionQuarterDay);
        }
    }
    return { status, deduction };
}
