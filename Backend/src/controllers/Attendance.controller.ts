
import { Request, Response } from 'express';
import { Prisma, AttendancePolicy, AttendanceStatus } from '@prisma/client';
import prisma from '../lib/prismaClient';
import * as xlsx from "xlsx";
import axios from 'axios';
import { applyPolicyLogic } from '../utils/applyPolicy';

// ---------------------------
// Helper: parse "HH:mm" string into Date on same day as baseDate
// ---------------------------
function toTimeOnDate(baseDate: Date, timeStr?: string | null): Date | null {
  if (!timeStr) return null;
  const parts = timeStr.split(':').map(Number);
  if (parts.length < 2) return null;
  const dt = new Date(baseDate);
  dt.setHours(parts[0], parts[1], 0, 0);
  return dt;
}

function toLocalDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------------------------
// computeAttendanceResult - central policy logic (async b/c it checks monthly grace usage)
// ---------------------------
// Returns: { status: string, deduction: number, usedGraceThisTime: boolean }
// status values: "PRESENT", "ABSENT", "LATE", "HALF_DAY", "EARLY_LEAVE"
export async function computeAttendanceResult(
  employeeId: number,
  inTime: Date | null,
  outTime: Date | null,
  policy: AttendancePolicy | null
) {
  // default fallback
  if (!policy) {
    // if no policy exists, mark present if inTime exists
    if (!inTime) return { status: 'ABSENT', deduction: 1.0, usedGraceThisTime: false };
    return { status: 'PRESENT', deduction: 0.0, usedGraceThisTime: false };
  }

  // If no inTime => ABSENT
  if (!inTime) {
    return { status: 'ABSENT', deduction: policy.deductionFullDay ?? 1.0, usedGraceThisTime: false };
  }

  const attendanceDate = toLocalDate(inTime);

  // build office times on the attendance date
  const officeStart = toTimeOnDate(inTime, policy.officeStartTime) ?? (() => { const d=new Date(inTime); d.setHours(10,0,0,0); return d; })();
  const officeEnd = toTimeOnDate(inTime, policy.officeEndTime) ?? (() => { const d=new Date(inTime); d.setHours(18,30,0,0); return d; })();

  // grace limits
  const graceLimit = new Date(officeStart);
  graceLimit.setMinutes(graceLimit.getMinutes() + (policy.gracePeriodMins ?? 0));

  // extended grace limit (e.g. upto maxGraceExceptions * gracePeriodMins)
  const extendedGraceLimit = new Date(officeStart);
  extendedGraceLimit.setMinutes(extendedGraceLimit.getMinutes() + ((policy.gracePeriodMins ?? 0) * (policy.maxGraceExceptions ?? 0)));

  // parse the configured quarter/half day cutoff times (they might be null)
  const qLateStart = toTimeOnDate(inTime, policy.quarterDayLateStart);
  const qLateEnd = toTimeOnDate(inTime, policy.quarterDayLateEnd);
  const halfDayLateAfter = toTimeOnDate(inTime, policy.halfDayLateAfter);

  const qEarlyStart = toTimeOnDate(inTime, policy.quarterDayEarlyStart);
  const qEarlyEnd = toTimeOnDate(inTime, policy.quarterDayEarlyEnd);
  const halfDayEarlyBefore = toTimeOnDate(inTime, policy.halfDayEarlyBefore);

  // Count how many times the employee used "grace" window this month.
  // Strategy: count attendances in the same month where inTime is > graceLimit && inTime <= extendedGraceLimit.
  // This approximates "used grace" occurrences.
  const startOfMonth = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), 1);
  const startOfNextMonth = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth() + 1, 1);

  const graceUsedThisMonth = await prisma.attendance.count({
    where: {
      employeeId,
      attendanceDate: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
      inTime: {
        gt: graceLimit,
        lte: extendedGraceLimit
      }
    }
  });

  const maxGrace = policy.maxGraceExceptions ?? 0;
  let usedGraceThisTime = false;

  // Initialize
  let status: string = 'PRESENT';
  let deduction = 0;

  // If within basic grace -> present
  if (inTime <= graceLimit) {
    status = 'PRESENT';
    deduction = 0;
  } else {
    // if within extendedGraceLimit AND still under maxGraceExceptions -> treat as PRESENT (grace)
    if (inTime > graceLimit && inTime <= extendedGraceLimit && graceUsedThisMonth < maxGrace) {
      status = 'PRESENT';
      deduction = 0;
      usedGraceThisTime = true;
    } else {
      // Now evaluate quarter-day and half-day late windows
      if (qLateStart && qLateEnd && inTime >= qLateStart && inTime <= qLateEnd) {
        status = 'LATE';
        deduction = policy.deductionQuarterDay ?? 0.25;
      } else if (halfDayLateAfter && inTime > halfDayLateAfter) {
        status = 'HALF_DAY';
        deduction = policy.deductionHalfDay ?? 0.5;
      } else {
        // If none matched but inTime > graceLimit -> fallback LATE with quarter deduction
        status = 'LATE';
        deduction = policy.deductionQuarterDay ?? 0.25;
      }
    }
  }

  // Evaluate outTime / early leave
  if (outTime) {
    // If employee left very early by hours (< 4 working hours) -> HALF_DAY
    const totalHours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
    if (totalHours > 0 && totalHours < 4) {
      status = 'HALF_DAY';
      deduction = Math.max(deduction, policy.deductionHalfDay ?? 0.5);
    } else {
      // else check early leave windows
      if (qEarlyStart && qEarlyEnd && outTime >= qEarlyStart && outTime <= qEarlyEnd) {
        status = status === 'HALF_DAY' ? 'HALF_DAY' : 'EARLY_LEAVE';
        deduction = Math.max(deduction, policy.deductionQuarterDay ?? 0.25);
      } else if (halfDayEarlyBefore && outTime < halfDayEarlyBefore) {
        status = 'HALF_DAY';
        deduction = Math.max(deduction, policy.deductionHalfDay ?? 0.5);
      } else if (outTime < officeEnd) {
        // left before official end but not in configured ranges
        status = status === 'HALF_DAY' ? 'HALF_DAY' : 'EARLY_LEAVE';
        deduction = Math.max(deduction, policy.deductionQuarterDay ?? 0.25);
      }
    }
  } else {
    // No outTime - cannot compute full day; but keep status as previously determined.
    // Optionally, decision could assume present if inTime exists, but we keep prior result.
  }

  // Final fallback: if somehow deduction still 0 and computed status indicates deduction should be full day (rare)
  if (status === 'ABSENT') {
    deduction = policy.deductionFullDay ?? 1.0;
  }

  // Return result plus whether this hit a grace usage (caller may record or audit)
  return { status, deduction, usedGraceThisTime, graceUsedThisMonth };
}

function mapStatusToEnum(status: string): AttendanceStatus {
  const upper = status.toUpperCase();
  if (
    upper === 'PRESENT' ||
    upper === 'ABSENT' ||
    upper === 'HALF_DAY' ||
    upper === 'LEAVE' ||
    upper === 'HOLIDAY'
  ) {
    return upper as AttendanceStatus;
  }
  // Map non-enum computed states to closest enum
  if (upper === 'LATE' || upper === 'EARLY_LEAVE') {
    return 'PRESENT';
  }
  return 'PRESENT';
}

// =============================
// CREATE MANUAL ATTENDANCE
// =============================
export const createManualAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId, attendanceDate, inTime, outTime, remarks } = req.body;

    // ✅ Fetch employee with company
    const employee = await prisma.employee.findUnique({
      where: { id: Number(employeeId) },
      include: { company: true },
    });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // ✅ Fetch company policy
    const policy = employee.companyId
      ? await prisma.attendancePolicy.findUnique({
          where: { companyId: employee.companyId },
        })
      : null;

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "No attendance policy for this company",
      });
    }

    // ✅ Apply policy logic (compute status + deduction)
    const applied = applyPolicyLogic(
      inTime ? new Date(inTime) : null,
      outTime ? new Date(outTime) : null,
      policy
    );

    // ✅ Create attendance
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: Number(employeeId),
        attendanceDate: new Date(attendanceDate),
        inTime: inTime ? new Date(inTime) : null,
        outTime: outTime ? new Date(outTime) : null,
        remarks,
        status: mapStatusToEnum(applied.status), // ✅ Correct mapping
        deduction: applied.deduction,
        policyId: policy.id,
        isBiometric: false, // manual entry
      },
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error("❌ createManualAttendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create manual attendance record",
    });
  }
};

// ----------------------------
// Upload Attendance From Excel
// ----------------------------
export const uploadAttendanceFromExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<any>(sheet);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const employeeId = Number(row.employeeId);
      if (!employeeId) { skippedCount++; continue; }

      const employee = await prisma.employee.findUnique({ where: { id: employeeId }, include: { company: true } });
      if (!employee || !employee.company) { skippedCount++; continue; }

      // parse attendance date (excel numeric or string)
      let rawDate: Date | null = null;
      if (typeof row.attendanceDate === "number") {
        const parsed = xlsx.SSF.parse_date_code(row.attendanceDate);
        rawDate = parsed ? new Date(parsed.y, parsed.m - 1, parsed.d) : null;
      } else if (typeof row.attendanceDate === "string" || row.attendanceDate instanceof Date) {
        rawDate = new Date(row.attendanceDate);
      }
      if (!rawDate) { skippedCount++; continue; }

      const datePart = rawDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'
      // allow both HH:mm or ISO string; prefer string times from excel
      const inTime = row.inTime ? new Date(`${datePart}T${row.inTime}`) : null;
      const outTime = row.outTime ? new Date(`${datePart}T${row.outTime}`) : null;
      const totalHours = inTime && outTime ? parseFloat(((outTime.getTime() - inTime.getTime()) / (1000*60*60)).toFixed(2)) : 0;

      const policy = employee.companyId
        ? await prisma.attendancePolicy.findUnique({ where: { companyId: employee.companyId } })
        : null;
      const { status: finalStatus, deduction } = await computeAttendanceResult(employeeId, inTime, outTime, policy);

      await prisma.attendance.upsert({
        where: { employeeId_attendanceDate: { employeeId, attendanceDate: toLocalDate(rawDate) } },
        update: { inTime, outTime, status: mapStatusToEnum(row.status?.toString().trim().toUpperCase() || finalStatus), totalHours, policyId: policy ? policy.id : undefined, deduction },
        create: { employeeId, attendanceDate: toLocalDate(rawDate), inTime, outTime, status: mapStatusToEnum(row.status?.toString().trim().toUpperCase() || finalStatus), totalHours, policyId: policy ? policy.id : undefined, deduction, isBiometric: false },
      });

      insertedCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Attendance upload completed. Inserted/Updated: ${insertedCount}, Skipped: ${skippedCount}`,
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// CREATE BULK ATTENDANCE
// =============================
// export const createBulkAttendance = async (req: Request, res: Response) => {
//   try {
//     const attendances = req.body.attendances; // Expecting an array of attendance objects

//     if (!Array.isArray(attendances) || attendances.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Attendance array is required"
//       });
//     }

//     // Validate each record
//     for (const record of attendances) {
//       if (!record.employeeId || !record.attendanceDate) {
//         return res.status(400).json({
//           success: false,
//           message: "Each record must have employeeId and attendanceDate"
//         });
//       }
//     }

//     const createdRecords = await prisma.$transaction(async (tx) => {
//       const results = [];
//       for (const record of attendances) {
//         const employeeExists = await tx.employee.findUnique({
//           where: { id: record.employeeId },
//           select: { id: true, companyId: true }
//         });

//         if (!employeeExists) {
//           throw new Error(`Employee with ID ${record.employeeId} not found`);
//         }

//         const parsedAttendanceDate = toLocalDate(new Date(record.attendanceDate));
//         const parsedInTime = record.inTime ? new Date(typeof record.inTime === 'string' ? record.inTime : record.inTime) : null;
//         const parsedOutTime = record.outTime ? new Date(typeof record.outTime === 'string' ? record.outTime : record.outTime) : null;

//         let totalHours = 0;
//         let overtimeHours = 0;
//         if (parsedInTime && parsedOutTime) {
//           const timeDiffMs = parsedOutTime.getTime() - parsedInTime.getTime();
//           totalHours = parseFloat((timeDiffMs / (1000 * 60 * 60)).toFixed(2));
//           const STANDARD_HOURS = 8;
//           overtimeHours = Math.max(0, totalHours - STANDARD_HOURS);
//         }

//         // use tx to fetch policy inside transaction for consistent read
//         const policy = await tx.attendancePolicy.findUnique({ where: { companyId: employeeExists.companyId } });
//         // compute result using tx-bound prisma? computeAttendanceResult uses global prisma count; that's acceptable.
//         const { status: finalStatus, deduction } = await computeAttendanceResult(record.employeeId, parsedInTime, parsedOutTime, policy);

//         const newAttendance = await tx.attendance.create({
//           data: {
//             employee: { connect: { id: record.employeeId } },
//             attendanceDate: parsedAttendanceDate,
//             inTime: parsedInTime,
//             outTime: parsedOutTime,
//             status: mapStatusToEnum(record.status || finalStatus || ""),
//             isBiometric: false,
//             totalHours,
//             overtimeHours,
//             policyId: policy?.id,
//             deduction
//           },
//           select: {
//             id: true,
//             employeeId: true,
//             attendanceDate: true,
//             inTime: true,
//             outTime: true,
//             status: true,
//             totalHours: true,
//             overtimeHours: true
//           }
//         });

//         results.push(newAttendance);
//       }
//       return results;
//     });

//     return res.status(201).json({
//       success: true,
//       message: `${createdRecords.length} attendance records created successfully`,
//       data: createdRecords
//     });

//   } catch (error: any) {
//     console.error("Bulk attendance creation error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create bulk attendance records"
//     });
//   }
// };

// ----------------------------
// Biometric Attendance
// ----------------------------
export const biometricAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId, faceData, latitude, longitude } = req.body;

    if (!employeeId || !faceData || !Array.isArray(faceData)) {
      return res.status(400).json({ success: false, message: "Missing or invalid face data" });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { company: true },
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    if (!employee.faceData || !Array.isArray(employee.faceData)) {
      return res.status(400).json({ success: false, message: "No valid face registered for employee" });
    }

    const storedFace: number[] = employee.faceData as number[];
    const currentFace: number[] = faceData;

    // Face distance check
    const faceDistance = (a: number[], b: number[]): number => {
      if (a.length !== b.length) return Infinity;
      return Math.sqrt(a.reduce((acc, v, i) => acc + Math.pow(v - b[i], 2), 0));
    };

    const distance = faceDistance(storedFace, currentFace);
    if (distance > 0.5) {
      return res.status(400).json({ success: false, message: "Face mismatch!" });
    }

    const similarity = compareFaces(storedFace, currentFace);
    if (similarity < 0.7) {
      return res.status(400).json({ success: false, message: "Face mismatch!" });
    }

    // Attendance logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    // Fetch policy only if companyId exists
    let policy = null;
    if (employee.companyId) {
      policy = await prisma.attendancePolicy.findUnique({
        where: { companyId: employee.companyId },
      });
    }

    const existing = await prisma.attendance.findUnique({
      where: { employeeId_attendanceDate: { employeeId, attendanceDate: today } },
    });

    // Helper to reverse geocode
    const getAddressFromCoords = async (lat?: number, lng?: number) => {
      if (!lat || !lng) return null;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) return null;
      try {
        const response = await axios.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
        if (response.data.status === "OK") {
          return response.data.results[0]?.formatted_address || null;
        }
        return null;
      } catch (err) {
        console.error("Geocoding error:", err);
        return null;
      }
    };

    if (existing) {
      // If existing inTime but no outTime -> mark outTime
      if (!existing.outTime) {
        const { status: finalStatus, deduction } = await computeAttendanceResult(employeeId, existing.inTime, now, policy);

        const updated = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            outTime: now,
            status: mapStatusToEnum(finalStatus),
            deduction,
            updatedAt: new Date(),
          },
        });

        return res.json({ success: true, data: updated, message: "Out time marked" });
      }

      return res.status(400).json({ success: false, message: "Attendance already marked fully for today" });
    }

    // First punch -> create attendance
    const { status: finalStatus, deduction } = await computeAttendanceResult(employeeId, now, null, policy);
    const address = await getAddressFromCoords(latitude, longitude);

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        attendanceDate: today,
        inTime: now,
        status: mapStatusToEnum(finalStatus),
        isBiometric: true,
        latitude,
        longitude,
        location: address ?? undefined,
        policyId: policy ? policy.id : undefined,
        deduction,
        faceData: currentFace,
      },
    });

    return res.json({ success: true, data: attendance, message: "In time marked" });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to mark biometric attendance" });
  }
};

// Safe cosine similarity
export const compareFaces = (stored: number[], current: number[]): number => {
  if (stored.length !== current.length) return 0;
  const dot = stored.reduce((acc, v, i) => acc + v * current[i], 0);
  const normA = Math.sqrt(stored.reduce((acc, v) => acc + v * v, 0));
  const normB = Math.sqrt(current.reduce((acc, v) => acc + v * v, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
};

// ----------------------------
// Get all attendances
// ----------------------------
export const getAllAttendances = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.AttendanceWhereInput = {};

    if (req.query.employeeId) whereClause.employeeId = req.query.employeeId as unknown as number;
    if (req.query.status) whereClause.status = mapStatusToEnum(String(req.query.status));
    if (req.query.startDate || req.query.endDate) {
      whereClause.attendanceDate = {};
      if (req.query.startDate) whereClause.attendanceDate.gte = new Date(req.query.startDate as string);
      if (req.query.endDate) whereClause.attendanceDate.lte = new Date(req.query.endDate as string);
    }

    const [attendances, totalCount] = await Promise.all([
      prisma.attendance.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { attendanceDate: 'desc' },
        include: {
          employee: {
            select: {
              fullName: true,
              department: true
            }
          }
        }
      }),
      prisma.attendance.count({ where: whereClause })
    ]);

    return res.status(200).json({
      success: true,
      data: attendances,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendances"
    });
  }
};

// Get single attendance by ID (unchanged)
export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Attendance ID is required"
      });
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID format"
      });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: numericId },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            department: true,
          }
        }
      }
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    const responseData = {
      id: attendance.id,
      attendanceDate: attendance.attendanceDate,
      inTime: attendance.inTime,
      outTime: attendance.outTime,
      status: attendance.status,
      employee: {
        id: attendance.employee.id,
        fullName: attendance.employee.fullName,
        department: attendance.employee.department
      },
      totalHours: attendance.totalHours,
      overtimeHours: attendance.overtimeHours
    };

    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2023') {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance ID format"
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching attendance"
    });
  }
};

// Update attendance (unchanged - you can keep yours)
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { inTime, outTime, status } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid numeric attendance ID is required"
      });
    }

    const attendanceId = Number(id);

    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: attendanceId }
    });

    if (!existingAttendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    const updateData: {
      inTime?: Date;
      outTime?: Date;
      status?: AttendanceStatus;
      totalHours?: number;
      overtimeHours?: number;
    } = {};

    if (inTime) {
      const parsedInTime = new Date(inTime);
      if (isNaN(parsedInTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid inTime format"
        });
      }
      updateData.inTime = parsedInTime;
    }

    if (outTime) {
      const parsedOutTime = new Date(outTime);
      if (isNaN(parsedOutTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid outTime format"
        });
      }
      updateData.outTime = parsedOutTime;
    }

    if (status) updateData.status = mapStatusToEnum(String(status));

    if (inTime || outTime) {
      const effectiveInTime = updateData.inTime || existingAttendance.inTime;
      const effectiveOutTime = updateData.outTime || existingAttendance.outTime;

      if (effectiveInTime && effectiveOutTime) {
        const timeDiffMs = effectiveOutTime.getTime() - effectiveInTime.getTime();
        updateData.totalHours = parseFloat((timeDiffMs / (1000 * 60 * 60)).toFixed(2));
        const STANDARD_HOURS = 8;
        updateData.overtimeHours = Math.max(0, updateData.totalHours - STANDARD_HOURS);
      } else {
        updateData.totalHours = 0;
        updateData.overtimeHours = 0;
      }
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: updateData,
      select: {
        id: true,
        employeeId: true,
        attendanceDate: true,
        inTime: true,
        outTime: true,
        status: true,
        totalHours: true,
        overtimeHours: true,
        isBiometric: true
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedAttendance
    });

  } catch (error) {
    console.error('Update attendance error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found"
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update attendance record"
    });
  }
};

// Delete attendance (unchanged)
export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID"
      });
    }

    await prisma.attendance.delete({
      where: { id: Number(id) }
    });

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully"
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Attendance not found"
        });
      }
    }
    return res.status(500).json({
      success: false,
      message: "Failed to delete attendance"
    });
  }
};
