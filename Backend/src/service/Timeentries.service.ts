// import axios from 'axios';
// import { TimeEntry, CreateTimeEntryData, UpdateTimeEntryData, BulkTimeEntryData } from '../types/timeEntry';

// const API_BASE_URL = process.env.REACT_APP_API_URL ||

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   }, 
// });

// // Add request interceptor for auth token if needed
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Get all time entries
// export const getTimeEntries = async (): Promise<TimeEntry[]> => {
//   try {
//     const response = await api.get('/');
//     return response.data;
//   } catch (error: any) {
//     console.error('Error fetching time entries:', error);
//     throw new Error(error.response?.data?.error || 'Failed to fetch time entries');
//   }
// };

// // Get single time entry by ID
// export const getTimeEntryById = async (id: number): Promise<TimeEntry> => {
//   try {
//     const response = await api.get(`/${id}`);
//     return response.data;
//   } catch (error: any) {
//     console.error('Error fetching time entry:', error);
//     throw new Error(error.response?.data?.error || 'Failed to fetch time entry');
//   }
// };

// // Create a single time entry
// export const createTimeEntry = async (entryData: CreateTimeEntryData): Promise<TimeEntry> => {
//   try {
//     const response = await api.post('/', entryData);
//     return response.data;
//   } catch (error: any) {
//     console.error('Error creating time entry:', error);
//     throw new Error(error.response?.data?.error || 'Failed to create time entry');
//   }
// };

// // Create bulk time entries
// export const createBulkTimeEntries = async (bulkData: BulkTimeEntryData): Promise<TimeEntry[]> => {
//   try {
//     const response = await api.post('/bulk', bulkData);
//     return response.data;
//   } catch (error: any) {
//     console.error('Error creating bulk time entries:', error);
//     throw new Error(error.response?.data?.error || 'Failed to create bulk time entries');
//   }
// };

// // Update time entry
// export const updateTimeEntry = async (id: number, updateData: UpdateTimeEntryData): Promise<TimeEntry> => {
//   try {
//     const response = await api.put(`/${id}`, updateData);
//     return response.data;
//   } catch (error: any) {
//     console.error('Error updating time entry:', error);
//     throw new Error(error.response?.data?.error || 'Failed to update time entry');
//   }
// };

// // Delete time entry
// export const deleteTimeEntry = async (id: number): Promise<{ message: string }> => {
//   try {
//     const response = await api.delete(`/${id}`);
//     return response.data;
//   } catch (error: any) {
//     console.error('Error deleting time entry:', error);
//     throw new Error(error.response?.data?.error || 'Failed to delete time entry');
//   }
// };