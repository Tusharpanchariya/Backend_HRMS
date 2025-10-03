import axios from "axios";

// ---- Types based on your Prisma model ----
export type TrainerType = "Internal" | "External";
export type TrainingMode = "Online" | "Offline";
export type CertificateStatus = "Required" | "NotRequired"; // Based on your usage

export interface Training {
  trainingId: number;
  employeeId: number;
  trainerType: TrainerType;
  trainerName: string;
  mode: TrainingMode;
  trainingTopic: string;
  startDate: string;
  endDate: string;
  certificate: CertificateStatus;
  departmentId?: number | null;
  departmentName?: string | null;
  managerId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// ---- Axios API Instance ----
const API = axios.create({
  baseURL: "/api/training", // Adjust if your API route differs
  headers: { "Content-Type": "application/json" }
});

// ---- Create Training ----
export const createTraining = async (
  payload: Omit<Training, "trainingId" | "createdAt" | "updatedAt">
): Promise<{ message: string; data: Training }> => {
  const { data } = await API.post<{ message: string; data: Training }>("/", payload);
  return data;
};

// ---- Get All Trainings ----
export const getAllTrainings = async (): Promise<Training[]> => {
  const { data } = await API.get<{ data: Training[] }>("/");
  return data.data;
};

// ---- Get Training by ID ----
export const getTrainingById = async (trainingId: number): Promise<Training> => {
  const { data } = await API.get<{ data: Training }>(`/${trainingId}`);
  return data.data;
};

// ---- Update Training ----
export const updateTraining = async (
  trainingId: number,
  updates: Partial<Omit<Training, "trainingId" | "createdAt" | "updatedAt">>
): Promise<{ message: string; data: Training }> => {
  const { data } = await API.put<{ message: string; data: Training }>(
    `/${trainingId}`,
    updates
  );
  return data;
};

// ---- Delete Training ----
export const deleteTraining = async (
  trainingId: number
): Promise<{ message: string }> => {
  const { data } = await API.delete<{ message: string }>(`/${trainingId}`);
  return data;
};
