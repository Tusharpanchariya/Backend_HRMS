"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const State_controller_1 = require("../controllers/State.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const Validate_middlewere_1 = require("../middleware/Validate.middlewere");
const state_validation_1 = require("../validations/state.validation");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.verifyToken, (0, Validate_middlewere_1.validateRequest)(state_validation_1.createStateSchema), State_controller_1.createState);
router.get("/", auth_middleware_1.verifyToken, State_controller_1.getAllStates);
router.put("/:id", auth_middleware_1.verifyToken, (0, Validate_middlewere_1.validateRequest)(state_validation_1.updateStateSchema), State_controller_1.updateState);
router.delete("/:id", auth_middleware_1.verifyToken, State_controller_1.deleteState);
exports.default = router;
