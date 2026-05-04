import { Router } from "express";
import testController from "../controllers/test.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const testRouter = Router();

// Student & Admin accessible
testRouter.get("/api/tests/daily", authMiddleware, testController.getDailyTest);
testRouter.post("/api/tests/submit", authMiddleware, testController.submitTest);
testRouter.get("/api/tests/leaderboard", authMiddleware, testController.getLeaderboard);

// Admin only (Check implemented inside controller too)
testRouter.post("/api/tests/batch", authMiddleware, testController.createBatchTests);
testRouter.get("/api/tests", authMiddleware, testController.getAllTests);

export default testRouter;
