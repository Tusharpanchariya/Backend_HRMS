"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Training_controller_1 = require("../controllers/Training.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Create a training record
router.post('/', auth_middleware_1.verifyToken, Training_controller_1.createTraining);
// Get a single training by ID
router.get('/:trainingId', auth_middleware_1.verifyToken, Training_controller_1.getTrainingById);
// Get all trainings
router.get('/', auth_middleware_1.verifyToken, Training_controller_1.getAllTrainings);
// Update a training record
router.put('/:trainingId', auth_middleware_1.verifyToken, Training_controller_1.updateTraining);
// Delete a training record
router.delete('/:trainingId', auth_middleware_1.verifyToken, Training_controller_1.deleteTraining);
exports.default = router;
