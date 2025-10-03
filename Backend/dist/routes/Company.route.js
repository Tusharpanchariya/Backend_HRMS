"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Comapny_controller_1 = require("../controllers/Comapny.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.verifyToken, Comapny_controller_1.createCompany);
router.put("/:id", auth_middleware_1.verifyToken, Comapny_controller_1.updateCompany);
router.get("/:id", auth_middleware_1.verifyToken, Comapny_controller_1.getCompany); // optional
exports.default = router;
