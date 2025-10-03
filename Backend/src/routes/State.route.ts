import express from "express";
import {
  createState,
  getAllStates,
  updateState,
  deleteState,
} from "../controllers/State.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/Validate.middlewere";
import { 
  createStateSchema,
  updateStateSchema 
} from "../validations/state.validation";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  validateRequest(createStateSchema),
  createState
);

router.get("/", verifyToken, getAllStates);

router.put(
  "/:id",
  verifyToken,
  validateRequest(updateStateSchema),
  updateState
);

router.delete("/:id", verifyToken, deleteState);

export default router;