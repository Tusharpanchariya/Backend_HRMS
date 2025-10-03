import axios from "axios";

// ---- Project Type (based on your Prisma model) ----
export interface Project {
  id: number;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: any[]; // Replace `any[]` with your Task type if available
}

// ---- Axios API Instance ----
const API = axios.create({
  baseURL: "/api/project", // Adjust if your API route is different
  headers: { "Content-Type": "application/json" }
});

// ---- Create Project ----
export const createProject = async (
  payload: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks">
): Promise<{ success: boolean; data: Project }> => {
  const { data } = await API.post<{ success: boolean; data: Project }>("/", payload);
  return data;
};

// ---- Get All Projects ----
export const getAllProjects = async (): Promise<Project[]> => {
  const { data } = await API.get<{
    success: boolean;
    message?: string;
    data: Project[];
  }>("/");
  return data.data;
};

// ---- Get Project by ID ----
export const getProjectById = async (id: number): Promise<Project> => {
  const { data } = await API.get<{ success: boolean; data: Project }>(`/${id}`);
  return data.data;
};

// ---- Update Project ----
export const updateProject = async (
  id: number,
  updates: Partial<Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks">>
): Promise<{ success: boolean; data: Project }> => {
  const { data } = await API.put<{ success: boolean; data: Project }>(
    `/${id}`,
    updates
  );
  return data;
};

// ---- Delete Project ----
export const deleteProject = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const { data } = await API.delete<{ success: boolean; message: string }>(
    `/${id}`
  );
  return data;
};