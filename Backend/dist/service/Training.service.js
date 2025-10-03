"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTraining = exports.updateTraining = exports.getTrainingById = exports.getAllTrainings = exports.createTraining = void 0;
const axios_1 = __importDefault(require("axios"));
// ---- Axios API Instance ----
const API = axios_1.default.create({
    baseURL: "/api/training", // Adjust if your API route differs
    headers: { "Content-Type": "application/json" }
});
// ---- Create Training ----
const createTraining = async (payload) => {
    const { data } = await API.post("/", payload);
    return data;
};
exports.createTraining = createTraining;
// ---- Get All Trainings ----
const getAllTrainings = async () => {
    const { data } = await API.get("/");
    return data.data;
};
exports.getAllTrainings = getAllTrainings;
// ---- Get Training by ID ----
const getTrainingById = async (trainingId) => {
    const { data } = await API.get(`/${trainingId}`);
    return data.data;
};
exports.getTrainingById = getTrainingById;
// ---- Update Training ----
const updateTraining = async (trainingId, updates) => {
    const { data } = await API.put(`/${trainingId}`, updates);
    return data;
};
exports.updateTraining = updateTraining;
// ---- Delete Training ----
const deleteTraining = async (trainingId) => {
    const { data } = await API.delete(`/${trainingId}`);
    return data;
};
exports.deleteTraining = deleteTraining;
