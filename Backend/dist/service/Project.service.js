"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getAllProjects = exports.createProject = void 0;
const axios_1 = __importDefault(require("axios"));
// ---- Axios API Instance ----
const API = axios_1.default.create({
    baseURL: "/api/project", // Adjust if your API route is different
    headers: { "Content-Type": "application/json" }
});
// ---- Create Project ----
const createProject = async (payload) => {
    const { data } = await API.post("/", payload);
    return data;
};
exports.createProject = createProject;
// ---- Get All Projects ----
const getAllProjects = async () => {
    const { data } = await API.get("/");
    return data.data;
};
exports.getAllProjects = getAllProjects;
// ---- Get Project by ID ----
const getProjectById = async (id) => {
    const { data } = await API.get(`/${id}`);
    return data.data;
};
exports.getProjectById = getProjectById;
// ---- Update Project ----
const updateProject = async (id, updates) => {
    const { data } = await API.put(`/${id}`, updates);
    return data;
};
exports.updateProject = updateProject;
// ---- Delete Project ----
const deleteProject = async (id) => {
    const { data } = await API.delete(`/${id}`);
    return data;
};
exports.deleteProject = deleteProject;
