"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayroll = exports.updatePayroll = exports.getPayrollById = exports.getAllPayrolls = exports.generatePayrollReceiptPDF = exports.generateBulkPayrollReceipts = exports.createPayroll = void 0;
const client_1 = require("@prisma/client");
const bwip_js_1 = __importDefault(require("bwip-js"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const number_to_words_1 = require("number-to-words");
const jszip_1 = __importDefault(require("jszip"));
const docx_1 = require("docx");
const prisma = new client_1.PrismaClient();
// ✅ Create Payroll (Auto-fetch baseSalary from Employee model)
const createPayroll = async (req, res) => {
    try {
        const { employeeId, allowances = 0, deductions = 0, advancePayment = 0, bonus = 0, incentive = 0, month, year } = req.body;
        // Accept alternate inputs for period/month/year
        const period = req.body.period;
        const paymentDateInput = req.body.paymentDate || req.body.date;
        // Infer month/year from provided inputs
        let monthNum = null;
        let yearNum = null;
        // 1) Direct month/year if provided
        if (req.body.month !== undefined && req.body.year !== undefined) {
            const m = parseInt(req.body.month, 10);
            const y = parseInt(req.body.year, 10);
            if (!isNaN(m) && !isNaN(y)) {
                monthNum = m;
                yearNum = y;
            }
        }
        // 2) Fallback to period formatted as "YYYY-MM" or "YYYY-MM-DD"
        if ((monthNum === null || yearNum === null) && typeof period === 'string' && period.trim() !== '') {
            const match = period.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
            if (match) {
                yearNum = Number(match[1]);
                monthNum = Number(match[2]);
            }
        }
        // 3) Fallback to paymentDate/date
        if ((monthNum === null || yearNum === null) && paymentDateInput) {
            const dt = new Date(paymentDateInput);
            if (!Number.isNaN(dt.getTime())) {
                yearNum = dt.getFullYear();
                monthNum = dt.getMonth() + 1;
            }
        }
        // Validate after inference
        if (monthNum === null || yearNum === null) {
            return res.status(400).json({ success: false, message: "Month and Year are required" });
        }
        if (Number.isNaN(monthNum) || Number.isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ success: false, message: "Month must be between 1 and 12" });
        }
        // Prevent duplicate payroll for the same month
        const existingPayroll = await prisma.payroll.findFirst({
            where: {
                employeeId: Number(employeeId),
                createdAt: {
                    gte: new Date(yearNum, monthNum - 1, 1),
                    lte: new Date(yearNum, monthNum, 0),
                },
            },
        });
        if (existingPayroll) {
            return res.status(400).json({ success: false, message: "Payroll already generated for this employee for the selected month." });
        }
        // Fetch employee
        const employee = await prisma.employee.findUnique({
            where: { id: Number(employeeId) },
            select: { id: true, fullName: true, baseSalary: true },
        });
        if (!employee)
            return res.status(404).json({ success: false, message: "Employee not found" });
        const monthlySalary = employee.baseSalary ?? 0;
        const perDaySalary = monthlySalary / 30;
        // Attendance date range (based on inferred month/year)
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0);
        // Fetch attendance
        const attendances = await prisma.attendance.findMany({
            where: {
                employeeId: Number(employeeId),
                attendanceDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { status: true, id: true },
        });
        // Calculate absent/half-day deductions
        const absentDays = attendances.filter(a => a.status === 'ABSENT').length;
        const halfDays = attendances.filter(a => a.status === 'HALF_DAY').length;
        const totalDeductionDays = absentDays + halfDays * 0.5;
        const salaryWithoutDeductions = perDaySalary * (30 - totalDeductionDays);
        // Final net salary (bonus/incentive already integrated)
        const netSalary = salaryWithoutDeductions +
            Number(allowances) +
            Number(bonus) +
            Number(incentive) -
            Number(deductions) -
            Number(advancePayment);
        // Optional: Link payroll to first attendance
        const firstAttendanceId = attendances.length > 0 ? attendances[0].id : null;
        // Create payroll (includes bonus and incentive)
        const payroll = await prisma.payroll.create({
            data: {
                employeeId: Number(employeeId),
                baseSalary: monthlySalary,
                allowances: Number(allowances),
                deductions: Number(deductions),
                advancePayment: Number(advancePayment),
                bonus: Number(bonus),
                incentive: Number(incentive),
                netSalary,
                attendanceId: firstAttendanceId,
                paymentStatus: 'PENDING',
            },
        });
        // Structured response (includes month/year, bonus, incentive)
        return res.status(201).json({
            success: true,
            message: "Payroll created successfully",
            payroll: {
                employeeId: payroll.employeeId,
                baseSalary: payroll.baseSalary,
                allowances: payroll.allowances,
                deductions: payroll.deductions,
                advancePayment: payroll.advancePayment,
                bonus: payroll.bonus,
                incentive: payroll.incentive,
                netSalary: payroll.netSalary,
                month: monthNum,
                year: yearNum,
                paymentStatus: payroll.paymentStatus,
            },
        });
    }
    catch (error) {
        console.error("Error creating payroll:", error);
        return res.status(500).json({
            success: false,
            message: "Payroll creation failed",
            error: error.message || error,
        });
    }
};
exports.createPayroll = createPayroll;
function monthName(monthNumber) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1] || "";
}
// Helper: Convert number to words (simple wrapper using number-to-words, supports ints)
function amountInWords(amount) {
    // number-to-words outputs "one hundred twenty-three"
    const intAmount = Math.round(amount);
    const words = (0, number_to_words_1.toWords)(intAmount);
    // Capitalize first letter and append "Rupees Only" (customize as needed)
    return (words.charAt(0).toUpperCase() + words.slice(1)) + " rupees only";
}
// Generate barcode PNG data URL using bwip-js
async function generateBarcodeDataURL(payloadText) {
    // bwip-js returns a Buffer
    const pngBuffer = await bwip_js_1.default.toBuffer({
        bcid: "code128", // Barcode type
        text: payloadText, // Text to encode
        scale: 3, // 1-10
        height: 10, // barcode height in millimeters
        includetext: false, // show human readable text below barcode
        // textxalign: 'center'
    });
    const base64 = pngBuffer.toString("base64");
    return `data:image/png;base64,${base64}`;
}
const sanitize = (s) => s
    .replace(/[^a-z0-9_\-\.]/gi, "_")
    .replace(/_+/g, "_")
    .substring(0, 120);
const generateBulkPayrollReceipts = async (req, res) => {
    try {
        // Fetch all PAID payroll records (include employee)
        const records = await prisma.payroll.findMany({
            where: { paymentStatus: "PAID" },
            include: { employee: true },
        });
        if (!records || records.length === 0) {
            return res.status(404).json({ success: false, message: "No paid payroll records found" });
        }
        const zip = new jszip_1.default();
        for (const record of records) {
            const employee = record.employee;
            // Try common employee name fields; fallback to email or id
            const empName = (employee.fullName || employee.full_name || employee.name || employee.firstName || employee.email) ?? `emp_${employee.id}`;
            const paymentDateStr = record.paymentDate
                ? new Date(record.paymentDate).toISOString().split("T")[0]
                : "unknown";
            const fileName = sanitize(`Payroll_${empName}_${paymentDateStr}.docx`);
            // Build simple docx content
            const doc = new docx_1.Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new docx_1.Paragraph({
                                children: [new docx_1.TextRun({ text: "Payroll Receipt", bold: true, size: 32 })],
                            }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Payroll ID: ${record.id}`, bold: false })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Employee Name: ${empName}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Employee ID: ${record.employeeId}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Email: ${employee.email ?? "N/A"}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Phone: ${employee.phone ?? employee.mobile ?? "N/A"}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: " " })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Base Salary: ₹${(record.baseSalary ?? 0).toFixed(2)}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Allowances: ₹${(record.allowances ?? 0).toFixed(2)}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Bonus: ₹${(record.bonus ?? 0).toFixed(2)}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Incentive: ₹${(record.incentive ?? 0).toFixed(2)}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Advance Payment: ₹${(record.advancePayment ?? 0).toFixed(2)}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Deductions: ₹${(record.deductions ?? 0).toFixed(2)}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: " " })] }),
                            new docx_1.Paragraph({
                                children: [new docx_1.TextRun({ text: `Net Salary: ₹${(record.netSalary ?? 0).toFixed(2)}`, bold: true })],
                            }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Payment Date: ${record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : "N/A"}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: " " })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: "This is a computer generated salary receipt." })] }),
                        ],
                    },
                ],
            });
            const buffer = await docx_1.Packer.toBuffer(doc); // Buffer
            zip.file(fileName, buffer);
        }
        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
        // Set headers so browser/Postman will download the file
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename=Payroll_Receipts_Paid.zip`);
        res.setHeader("Content-Length", String(zipBuffer.length));
        return res.send(zipBuffer);
    }
    catch (error) {
        console.error("Error generating bulk payroll receipts:", error);
        return res.status(500).json({ success: false, message: "Failed to generate bulk receipts", error: error.message || error });
    }
};
exports.generateBulkPayrollReceipts = generateBulkPayrollReceipts;
const generatePayrollReceiptPDF = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ success: false, message: "Invalid payroll id" });
        }
        // Fetch payroll + employee
        const payroll = await prisma.payroll.findUnique({
            where: { id: Number(id) },
            include: {
                employee: true,
            },
        });
        if (!payroll) {
            return res.status(404).json({ success: false, message: "Payroll not found" });
        }
        // Only allow PDF for PAID payrolls
        if (payroll.paymentStatus !== "PAID") {
            return res.status(403).json({ success: false, message: "Only PAID payrolls can generate receipts" });
        }
        // Prepare display fields
        const employee = payroll.employee;
        const payrollId = payroll.id;
        const paymentDate = payroll.paymentDate ? new Date(payroll.paymentDate) : new Date();
        const baseSalary = payroll.baseSalary ?? 0;
        const allowances = payroll.allowances ?? 0;
        const deductions = payroll.deductions ?? 0;
        const bonus = payroll.bonus ?? 0;
        const incentive = payroll.incentive ?? 0;
        const advancePayment = payroll.advancePayment ?? 0;
        const netSalary = payroll.netSalary ?? 0;
        // Determine month/year from createdAt or any other logic you prefer.
        // If you stored month/year separately in payroll, use that. Fallback to createdAt:
        const created = payroll.createdAt ?? new Date();
        const month = created.getMonth() + 1;
        const year = created.getFullYear();
        const monthText = `${monthName(month)} ${year}`;
        const amountWords = amountInWords(netSalary);
        // Barcode payload: you can encode a JSON string or just simple id + employee id
        const barcodePayload = `PAYROLL#${payrollId}|EMP#${employee.id}|AMT#${Math.round(netSalary)}`;
        // Generate barcode image data URL
        const barcodeDataUrl = await generateBarcodeDataURL(barcodePayload);
        // Optionally you can embed a logo (data URL) or use a hosted URL
        const companyLogoUrl = ""; // put base64 data url or http url to logo. Leave empty to hide.
        // Create HTML template for the receipt (modern UI)
        const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payroll Receipt - ${payrollId}</title>
  <style>
    /* Reset + basic */
    body { font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial; margin: 0; padding: 0; color: #222; }
    .container { width: 800px; margin: 24px auto; padding: 28px; border-radius: 12px; box-shadow: 0 4px 22px rgba(0,0,0,0.08); background: #fff; }
    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .company { display:flex; gap:12px; align-items:center; }
    .logo { width:86px; height:86px; border-radius:8px; background:#f2f2f2; display:flex; align-items:center; justify-content:center; font-weight:700; color:#444; }
    .company-info { font-size:14px; color:#333; }
    h1 { margin: 0; font-size:20px; letter-spacing: 0.2px; }
    .meta { text-align:right; font-size:12px; color:#666; }
    .section { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #eee; }
    .row { display:flex; justify-content:space-between; margin:8px 0; }
    .label { color:#666; font-size:13px; }
    .value { font-weight:600; font-size:14px; }
    table { width:100%; border-collapse: collapse; margin-top:12px; }
    th, td { padding:10px 8px; border-bottom:1px solid #f1f1f1; text-align:left; font-size:14px; }
    th { font-weight:700; color:#444; background: #fafafa; }
    .totals { display:flex; justify-content:flex-end; margin-top:12px; }
    .totals .box { width:320px; border-radius:8px; padding:12px; background:#fbfbfd; border:1px solid #f0f0ff; }
    .big { font-size:18px; font-weight:700; color:#0b4db7; }
    .small-muted { font-size:12px; color:#777; margin-top:6px; }
    footer { margin-top:18px; display:flex; justify-content:space-between; align-items:center; }
    .sign { text-align:center; width:180px; }
    .barcode { width:240px; height:60px; object-fit:contain; }
    .stamp { font-size:12px; padding:6px 8px; border-radius:6px; background:#f5f9ff; color:#0b4db7; border:1px solid #e6f0ff; }
    .muted { color:#777; font-size:13px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="company">
        <div class="logo">${companyLogoUrl ? `<img src="${companyLogoUrl}" style="width:86px;height:86px;border-radius:8px;object-fit:contain" />` : `<div style="text-align:center;font-size:18px">Company</div>`}</div>
        <div class="company-info">
          <h1>Finamit Solutions (sample)</h1>
          <div class="muted">123 Business Park, Bengaluru, KA · GSTIN: 29XXXXX</div>
          <div class="muted">Email: hr@finamit.example · Phone: +91 98XXXXXXX</div>
        </div>
      </div>
      <div class="meta">
        <div><strong>Payroll Receipt</strong></div>
        <div class="small-muted">Payroll ID: ${payrollId}</div>
        <div class="small-muted">Date: ${paymentDate.toLocaleDateString()}</div>
        <div class="stamp">Status: PAID</div>
      </div>
    </header>

    <div class="section">
      <div class="row">
        <div>
          <div class="label">Employee</div>
          <div class="value">${employee.fullName || "—"}</div>
          <div class="muted">${employee.designation || ""}</div>
        </div>
        <div>
          <div class="label">Contact</div>
          <div class="value">${employee.phone || employee.mobile || "—"}</div>
          <div class="muted">${employee.email || "—"}</div>
        </div>
        <div>
          <div class="label">Pay Period</div>
          <div class="value">${monthText}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <table>
        <thead>
          <tr>
            <th>EARNING / DEDUCTION</th>
            <th style="width:140px; text-align:right">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td style="text-align:right">${baseSalary.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Allowances</td>
            <td style="text-align:right">${allowances.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Bonus</td>
            <td style="text-align:right">${bonus.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Incentive</td>
            <td style="text-align:right">${incentive.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Advance Payment</td>
            <td style="text-align:right">-${advancePayment.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Deductions (PF/ESIC/Tax)</td>
            <td style="text-align:right">-${deductions.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals">
        <div class="box">
          <div style="display:flex; justify-content:space-between;">
            <div class="muted">Net Salary</div>
            <div class="big">₹ ${netSalary.toFixed(2)}</div>
          </div>
          <div class="small-muted">${amountWords}</div>
        </div>
      </div>
    </div>

    <footer>
      <div>
        <div style="font-size:13px">Generated by Payroll System</div>
        <div class="muted">This is a computer generated receipt and does not require signature.</div>
      </div>

      <div style="text-align:right">
        <img src="${barcodeDataUrl}" class="barcode" alt="barcode" />
        <div style="font-size:11px; margin-top:6px; color:#666">Scan to verify</div>
      </div>
    </footer>
  </div>
</body>
</html>
    `;
        // Launch puppeteer and render PDF
        const browser = await puppeteer_1.default.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        // Set content and wait for load
        await page.setContent(html, { waitUntil: "networkidle0" });
        // Create pdf buffer
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
        });
        await browser.close();
        // Respond with PDF file
        const fileName = `payroll_receipt_${payrollId}_${Date.now()}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        return res.send(pdfBuffer);
    }
    catch (error) {
        console.error("Error generating payroll receipt PDF:", error);
        return res.status(500).json({ success: false, message: "Failed to generate PDF", error: error.message || error });
    }
};
exports.generatePayrollReceiptPDF = generatePayrollReceiptPDF;
// ✅ Get All Payrolls
const getAllPayrolls = async (req, res) => {
    try {
        const payrolls = await prisma.payroll.findMany({
            include: {
                employee: true,
                Attendance: true,
            },
        });
        return res.status(200).json({ success: true, payrolls });
    }
    catch (error) {
        console.error("Error fetching payrolls:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch payrolls", error: error.message || error });
    }
};
exports.getAllPayrolls = getAllPayrolls;
// ✅ Get Payroll by ID
const getPayrollById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ success: false, message: "Invalid Payroll ID" });
        }
        const payroll = await prisma.payroll.findUnique({
            where: { id: Number(id) },
            include: { employee: true, Attendance: true },
        });
        if (!payroll) {
            return res.status(404).json({ success: false, message: "Payroll not found" });
        }
        return res.status(200).json({ success: true, payroll });
    }
    catch (error) {
        console.error("Error fetching payroll:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch payroll", error: error.message || error });
    }
};
exports.getPayrollById = getPayrollById;
// ✅ Update Payroll
const updatePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const { allowances, deductions, advancePayment, paymentStatus, paymentDate, attendanceId } = req.body;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ success: false, message: "Invalid Payroll ID" });
        }
        // Fetch payroll with employee baseSalary
        const oldPayroll = await prisma.payroll.findUnique({
            where: { id: Number(id) },
            include: { employee: true },
        });
        if (!oldPayroll) {
            return res.status(404).json({ success: false, message: "Payroll not found" });
        }
        const baseSalary = oldPayroll.employee.baseSalary;
        // Recalculate net salary
        const netSalary = baseSalary +
            (allowances ?? oldPayroll.allowances) -
            (deductions ?? oldPayroll.deductions) -
            (advancePayment ?? oldPayroll.advancePayment);
        const payroll = await prisma.payroll.update({
            where: { id: Number(id) },
            data: {
                allowances,
                deductions,
                advancePayment,
                netSalary,
                paymentStatus,
                paymentDate: paymentStatus === "PAID" ? paymentDate || new Date() : null,
                attendanceId: attendanceId || null,
            },
            include: { employee: true, Attendance: true },
        });
        return res.status(200).json({ success: true, message: "Payroll updated successfully", payroll });
    }
    catch (error) {
        console.error("Error updating payroll:", error);
        return res.status(500).json({ success: false, message: "Failed to update payroll", error: error.message || error });
    }
};
exports.updatePayroll = updatePayroll;
// ✅ Delete Payroll
const deletePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ success: false, message: "Invalid Payroll ID" });
        }
        await prisma.payroll.delete({ where: { id: Number(id) } });
        return res.status(200).json({ success: true, message: "Payroll deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting payroll:", error);
        return res.status(500).json({ success: false, message: "Failed to delete payroll", error: error.message || error });
    }
};
exports.deletePayroll = deletePayroll;
