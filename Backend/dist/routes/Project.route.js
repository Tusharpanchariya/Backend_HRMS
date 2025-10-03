"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Project_controller_1 = require("../controllers/Project.controller");
const router = (0, express_1.Router)();
// ✅ Create new project
router.post("/", Project_controller_1.createProject);
// ✅ Get all projects
router.get("/", Project_controller_1.getAllProjects);
// ✅ Get single project
router.get("/:id", Project_controller_1.getProjectById);
// ✅ Update project
router.put("/:id", Project_controller_1.updateProject);
// ✅ Delete project
router.delete("/:id", Project_controller_1.deleteProject);
exports.default = router;
