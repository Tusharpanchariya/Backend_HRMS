// File: src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRoutes from './routes/Profile.route';
import authRoutes from './routes/Auth.route';
import companyRoutes from './routes/Company.route'; 
import departmentRoutes from './routes/Department.route';
import stateRoutes from './routes/State.route';
import EmployeRoutes from './routes/Employe.route';
import attendanceRoutes from './routes/Attendance.route';
import leavemanagementRoutes from './routes/Leave.route';
import payrollRoutes from './routes/Payroll.route';
import trainingRoutes from './routes/Training.route';
import projectRoutes from "./routes/Project.route";
import timeEntryRoutes from "./routes/timeEntries.routes";
import dashboard from "./routes/Dashboard.route"; 
import AttendancePolicy from "./routes/AttendancePolicyRoutes"


import exportRoutes from './routes/ExportAttendance.route'

import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working');
});

// Mount the routes
app.use('/api/profile', profileRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/state',stateRoutes );
app.use('/api/employe',EmployeRoutes );
app.use('/api/attendance',attendanceRoutes );
app.use('/api/exportAttendance',exportRoutes );
app.use('/api/leavemanagement',leavemanagementRoutes );
app.use('/api/payrolls', payrollRoutes);
app.use('/api/training', trainingRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/time-entries", timeEntryRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use("/api/dashboard", dashboard);
app.use("/api/AttendancePolicy", AttendancePolicy);

export default app;
