"use strict";
// import axios from "axios";
// // Define the Payroll type (based on your Prisma model)
// export interface Payroll {
//   id: number;
//   employeeId: number;
//   baseSalary: number;
//   allowances: number;
//   deductions: number;
//   advancePayment: number;
//   netSalary: number;
//   paymentStatus: "PENDING" | "PAID" | "FAILED";
//   paymentDate?: string | null;
//   attendanceId?: number | null;
//   createdAt: string;
//   updatedAt: string;
//   employee?: any; // Replace with Employee type if available
//   Attendance?: any; // Replace with Attendance type if available
// }
// // Base API instance
// const API = axios.create({
//   baseURL: "/api/payroll", // Adjust base URL if different
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
// // Generate Payroll (Create)
// export const createPayroll = async (
//   payload: {
//     employeeId: number;
//     baseSalary: number;
//     allowances?: number;
//     deductions?: number;
//     advancePayment?: number;
//     attendanceId?: number;
//   }
// ): Promise<{ message: string; payroll: Payroll }> => {
//   const { data } = await API.post<{ message: string; payroll: Payroll }>(
//     "/generate",
//     payload
//   );
//   return data;
// };
// // Get All Payrolls
// export const getAllPayrolls = async (): Promise<Payroll[]> => {
//   const { data } = await API.get<Payroll[]>("/");
//   return data;
// };
// // Get Payroll by ID
// export const getPayrollById = async (id: number): Promise<Payroll> => {
//   const { data } = await API.get<Payroll>(`/${id}`);
//   return data;
// };
// // Update Payroll
// export const updatePayroll = async (
//   id: number,
//   payload: Partial<Omit<Payroll, "id" | "createdAt" | "updatedAt">>
// ): Promise<{ message: string; payroll: Payroll }> => {
//   const { data } = await API.put<{ message: string; payroll: Payroll }>(
//     `/${id}`,
//     payload
//   );
//   return data;
// };
// // Delete Payroll
// export const deletePayroll = async (
//   id: number
// ): Promise<{ message: string }> => {
//   const { data } = await API.delete<{ message: string }>(`/${id}`);
//   return data;
// };
