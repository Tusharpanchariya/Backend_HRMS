"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmployeeIdCard = exports.deleteEmployee = exports.getEmployeeById = exports.updateEmployee = exports.getAllEmployees = exports.createEmployee = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const qrcode_1 = __importDefault(require("qrcode"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const createEmployee = async (req, res) => {
    try {
        const { companyId, departmentName, state, userEmail, email, photo, // <--- ✅ FIXED: Destructure 'photo' as sent by frontend
        faceData, panNumber, aadhaarNumber, bankAccount, bankName, ifscCode, uanNumber, esicNumber, baseSalary, ...employeeData } = req.body;
        const company = await prismaClient_1.default.company.findFirst({
            where: { name: companyId },
        });
        if (!company)
            return res.status(400).json({ success: false, message: "Invalid comapny name" });
        // Convert dates safely
        if (employeeData.joiningDate)
            employeeData.joiningDate = new Date(employeeData.joiningDate);
        if (employeeData.dateOfBirth)
            employeeData.dateOfBirth = new Date(employeeData.dateOfBirth);
        // Validate department
        const department = await prismaClient_1.default.department.findFirst({
            where: { name: departmentName },
        });
        if (!department)
            return res.status(400).json({ success: false, message: "Invalid department name" });
        // Find linked user (optional)
        let userId;
        if (userEmail) {
            const user = await prismaClient_1.default.user.findUnique({ where: { email: userEmail } });
            userId = user?.id;
        }
        // Handle photo upload (base64)
        let photoPath = null;
        if (photo) { // <--- ✅ FIXED: Use the destructured 'photo'
            const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const fileName = `uploads/${Date.now()}-employee-photo.jpg`;
            fs_1.default.writeFileSync(fileName, buffer);
            photoPath = fileName;
        }
        // Handle faceData embeddings (JSON)
        let savedFaceData = null;
        if (faceData) {
            // Check if it's an array
            if (!Array.isArray(faceData)) {
                return res.status(400).json({ success: false, message: "Invalid faceData format" });
            }
            savedFaceData = faceData; // store as JSON
        }
        // Create Employee
        const employee = await prismaClient_1.default.employee.create({
            data: {
                ...employeeData,
                companyId: company.id,
                email,
                state,
                departmentId: department.id,
                userId,
                photo: photoPath,
                faceData: savedFaceData,
                panNumber,
                aadhaarNumber,
                bankAccount,
                bankName,
                ifscCode,
                uanNumber,
                esicNumber,
                baseSalary: baseSalary ? parseFloat(baseSalary) : 0,
            },
        });
        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
        });
    }
    catch (error) {
        console.error("Error creating employee:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.createEmployee = createEmployee;
const getAllEmployees = async (req, res) => {
    try {
        const { department, state, status, name } = req.query;
        const where = {
            ...(name ? { fullName: { contains: name, mode: "insensitive" } } : {}),
            ...(department ? { department: { name: { equals: department, mode: "insensitive" } } } : {}),
            ...(state ? { state: { equals: state, mode: "insensitive" } } : {}),
            ...(status ? { status: status } : {}),
        };
        const [employees, filteredCount, totalEmployees] = await Promise.all([
            prismaClient_1.default.employee.findMany({
                where,
                include: { department: { select: { name: true } }, user: { select: { email: true } } },
                orderBy: { createdAt: "desc" },
            }),
            prismaClient_1.default.employee.count({ where }),
            prismaClient_1.default.employee.count(),
        ]);
        const formattedEmployees = employees.map(emp => ({
            ...emp,
            avatar: emp.photo ? `${req.protocol}://${req.get("host")}/${emp.photo}` : null,
        }));
        return res.status(200).json({
            success: true,
            totalEmployees,
            filteredCount,
            data: formattedEmployees,
        });
    }
    catch (error) {
        console.error("Get Employees Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch employees" });
    }
};
exports.getAllEmployees = getAllEmployees;
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ success: false, message: "Invalid employee ID" });
        }
        // Convert dates safely
        if (updateData.joiningDate)
            updateData.joiningDate = new Date(updateData.joiningDate);
        if (updateData.dateOfBirth)
            updateData.dateOfBirth = new Date(updateData.dateOfBirth);
        // Handle department update
        if (updateData.departmentName) {
            const department = await prismaClient_1.default.department.findFirst({
                where: { name: updateData.departmentName },
            });
            if (!department) {
                return res.status(400).json({ success: false, message: "Invalid department name" });
            }
            updateData.departmentId = department.id;
            delete updateData.departmentName;
        }
        // Parse baseSalary
        if (updateData.baseSalary) {
            const salary = parseFloat(updateData.baseSalary);
            if (isNaN(salary)) {
                return res.status(400).json({ success: false, message: "Invalid baseSalary format" });
            }
            updateData.baseSalary = salary;
        }
        // Handle photo update if file uploaded (Note: This still handles Multer uploads if used for PUT)
        if (req.file)
            updateData.photo = req.file.path;
        // Handle photo update if a base64 string is sent in updateData (no Multer file)
        if (updateData.photo && !req.file) {
            const photo = updateData.photo;
            const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const fileName = `uploads/${Date.now()}-employee-photo.jpg`;
            fs_1.default.writeFileSync(fileName, buffer);
            updateData.photo = fileName;
        }
        // Handle faceData update
        if (updateData.faceData) {
            try {
                // If the data is an array already (from the frontend), it's fine.
                // If it's a string from another source, parse it.
                if (typeof updateData.faceData === 'string') {
                    updateData.faceData = JSON.parse(updateData.faceData);
                }
                // Final check for array format
                if (!Array.isArray(updateData.faceData)) {
                    return res.status(400).json({ success: false, message: "Invalid faceData format (not an array)" });
                }
            }
            catch (err) {
                return res.status(400).json({ success: false, message: "Invalid faceData format (not valid JSON string)" });
            }
        }
        const updatedEmployee = await prismaClient_1.default.employee.update({
            where: { id: Number(id) },
            data: updateData,
            include: { department: { select: { name: true } }, user: { select: { email: true } } },
        });
        // Format the response to include the full avatar URL
        const formattedUpdatedEmployee = {
            ...updatedEmployee,
            avatar: updatedEmployee.photo ? `${req.protocol}://${req.get("host")}/${updatedEmployee.photo}` : null,
        };
        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: formattedUpdatedEmployee,
        });
    }
    catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error?.message });
    }
};
exports.updateEmployee = updateEmployee;
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await prismaClient_1.default.employee.findUnique({
            where: { id: Number(id) },
            include: { department: true, user: true },
        });
        if (!employee)
            return res.status(404).json({ success: false, message: "Employee not found" });
        return res.status(200).json({ success: true, data: employee });
    }
    catch (error) {
        console.error("Get Employee By ID Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch employee" });
    }
};
exports.getEmployeeById = getEmployeeById;
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.employee.delete({ where: { id: Number(id) } });
        return res.status(200).json({ success: true, message: "Employee deleted successfully" });
    }
    catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({ success: false, message: "Employee not found" });
        return res.status(500).json({ success: false, message: "Failed to delete employee" });
    }
};
exports.deleteEmployee = deleteEmployee;
const generateEmployeeIdCard = async (req, res) => {
    // ... (omitted for brevity, no changes required here for the specific issue)
    /* ... */
    try {
        const { id } = req.params;
        // Fetch employee from DB with all required fields
        const employee = await prismaClient_1.default.employee.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                fullName: true,
                designation: true,
                department: {
                    select: { name: true },
                },
                photo: true, // Assuming this is a URL or base64 string
                joiningDate: true,
                // bloodGroup: true,
                emergencyContact: true,
                contactNumber: true,
                email: true,
                // dob: true, // Assuming you have this field
                // expiryDate: true, // Assuming you have this field
            },
        });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        // Prepare dynamic data
        const idNo = String(employee.id).padStart(8, '0');
        // const dob = employee.dob ? new Date(employee.dob).toLocaleDateString('en-GB') : 'DD/MM/YEAR';
        // const joiningDate = employee.joiningDate ? new Date(employee.joiningDate).toLocaleDate('en-GB') : 'DD/MM/YEAR';
        // const expiryDate = employee.expiryDate ? new Date(employee.expiryDate).toLocaleDateString('en-GB') : 'DD/MM/YEAR';
        // const bloodGroup = employee.bloodGroup || 'A+';
        const contactNumber = employee.contactNumber || '+1 (555) 123-4567';
        const email = employee.email || 'john.doe@company.com';
        const photo = employee.photo || ''; // Use the photo field, or a placeholder if it's empty
        // Generate QR code for the back side
        const qrData = JSON.stringify({
            employeeId: employee.id,
            fullName: employee.fullName,
            department: employee.department?.name,
        });
        const qrBuffer = await qrcode_1.default.toBuffer(qrData, { type: 'png', margin: 1, width: 80 });
        const qrCode = qrBuffer.toString('base64');
        // Create a vector barcode directly in the SVG
        const barcodeSvg = `
<svg width="124" height="20" viewBox="0 0 124 20" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="124" height="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <g fill="#374151">
    <rect x="2" y="2" width="2" height="16"/>
    <rect x="5" y="2" width="2" height="14"/>
    <rect x="8" y="2" width="2" height="16"/>
    <rect x="11" y="2" width="2" height="12"/>
    <rect x="14" y="2" width="2" height="16"/>
    <rect x="17" y="2" width="2" height="14"/>
    <rect x="20" y="2" width="2" height="16"/>
    <rect x="23" y="2" width="2" height="12"/>
    <rect x="26" y="2" width="2" height="16"/>
    <rect x="29" y="2" width="2" height="14"/>
    <rect x="32" y="2" width="2" height="16"/>
  </g>
</svg>
    `;
        const barcodeBuffer = Buffer.from(barcodeSvg);
        const barcode = barcodeBuffer.toString('base64');
        // Combine your SVG with the dynamic data
        const idCardSvg = `
<svg width="448" height="322" viewBox="0 0 448 322" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g clip-path="url(#clip0_0_1)">
    <rect width="204" height="322" fill="white"/>
    <path d="M204 320H0V308.5C108 305.5 172 320 204 268V320Z" fill="#2E9DA6"/>
    <path d="M204 322H0V310.5C108 307.5 172 322 204 270V322Z" fill="#000F30"/>
    <path d="M204 5H0V87C111.5 166.5 167 77 204 87V5Z" fill="#2E9DA6"/>
    <path d="M204 0H0V82C111.5 161.5 167 72 204 82V0Z" fill="#000F30"/>
    
    <rect x="60.5" y="73.5" width="83" height="83" rx="41.5" stroke="#2E9DA6" stroke-width="3"/>
    <image href="${photo}" x="62" y="75" width="80" height="80" style="border-radius:50%"/>
    
    <text x="102" y="188" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#000F30">${employee.fullName}</text>
    <text x="102" y="208" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#2E9DA6">${employee.designation}</text>

    <g transform="translate(30, 230)">
        <text x="0" y="0" font-family="Arial, sans-serif" font-size="9" fill="#000F30">ID NO</text>
        <text x="50" y="0" font-family="Arial, sans-serif" font-size="9" fill="#000F30">: ${idNo}</text>
        
        <text x="0" y="12" font-family="Arial, sans-serif" font-size="9" fill="#000F30">DOB</text>
        <text x="50" y="12" font-family="Arial, sans-serif" font-size="9" fill="#000F30">: </text>

        <text x="0" y="24" font-family="Arial, sans-serif" font-size="9" fill="#000F30">Blood</text>
        <text x="50" y="24" font-family="Arial, sans-serif" font-size="9" fill="#000F30">:</text>

        <text x="0" y="36" font-family="Arial, sans-serif" font-size="9" fill="#000F30">Phone</text>
        <text x="50" y="36" font-family="Arial, sans-serif" font-size="9" fill="#000F30">: ${contactNumber}</text>

        <text x="0" y="48" font-family="Arial, sans-serif" font-size="9" fill="#000F30">E-mail</text>
        <text x="50" y="48" font-family="Arial, sans-serif" font-size="9" fill="#000F30">: ${email}</text>
    </g>

    <image href="data:image/svg+xml;base64,${barcode}" x="40" y="272" width="124" height="20"/>

  </g>

  <g clip-path="url(#clip4_0_1)">
    <rect width="204" height="322" transform="translate(244)" fill="white"/>
    <path d="M448 3H244V85C383.5 97.5 298.5 15 448 19.5V3Z" fill="#2E9DA6"/>
    <path d="M448 0H244V82C383.5 94.5 283 16.5 448 16.5V0Z" fill="#000F30"/>
    <path d="M448 320H244V308.5C352 305.5 416 320 448 268V320Z" fill="#2E9DA6"/>
    <path d="M448 322H244V310.5C352 307.5 416 322 448 270V322Z" fill="#000F30"/>

    <text x="346" y="38" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">COMPANY NAME</text>
    <text x="346" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="white">TAG LINE: GCCS LLC</text>

    <text x="260" y="110" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#2E9DA6">TERMS AND CONDITIONS</text>
    <circle cx="265" cy="125" r="3" fill="#2E9DA6"/>
    <text x="275" y="130" font-family="Arial, sans-serif" font-size="9" fill="#000F30">Terms and conditions content goes here. You</text>
    <text x="275" y="140" font-family="Arial, sans-serif" font-size="9" fill="#000F30">can add multiple lines or dynamic text here.</text>
    
    <text x="260" y="180" font-family="Arial, sans-serif" font-size="9" fill="#000F30">Join Date : </text>
    <text x="260" y="195" font-family="Arial, sans-serif" font-size="9" fill="#000F30">Expire Date : </text>

    <line x1="260" y1="230" x2="350" y2="230" stroke="#000F30" stroke-width="0.5"/>
    <text x="305" y="238" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#000F30">Your Signature</text>
    
    <text x="260" y="258" font-family="Arial, sans-serif" font-size="9" fill="#000F30">dholewal chok</text>
    <text x="260" y="270" font-family="Arial, sans-serif" font-size="9" fill="#000F30">125 Street, USA</text>

    <image href="data:image/png;base64,${qrCode}" x="360" y="250" width="60" height="60"/>

  </g>
</svg>
    `;
        // Convert SVG to buffer and send
        const svgBuffer = Buffer.from(idCardSvg, 'utf8');
        const idCardBuffer = await (0, sharp_1.default)(svgBuffer)
            .png({ quality: 100 })
            .toBuffer();
        res.set({
            'Content-Type': 'image/png',
            'Content-Disposition': `inline; filename="${employee.fullName.replace(/\s+/g, '_')}_id_card.png"`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        });
        res.send(idCardBuffer);
    }
    catch (error) {
        console.error('Error generating ID card:', error);
        res.status(500).json({
            message: 'Failed to generate ID card',
            error: error.message,
        });
    }
};
exports.generateEmployeeIdCard = generateEmployeeIdCard;
