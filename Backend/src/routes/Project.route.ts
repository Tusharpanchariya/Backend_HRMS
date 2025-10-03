import { Router } from "express";
import {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjects
} from "../controllers/Project.controller";

const router = Router();

// ✅ Create new project
router.post("/", createProject);

// ✅ Get all projects
router.get("/", getAllProjects);

// ✅ Get single project
router.get("/:id", getProjectById);

// ✅ Update project
router.put("/:id", updateProject);

// ✅ Delete project
router.delete("/:id", deleteProject);

export default router;
