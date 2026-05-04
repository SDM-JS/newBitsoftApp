import express from "express";
import tasksController from "../controllers/tasks.controller.js";
import learnController from "../controllers/learn.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const tasksRoutes = express.Router();

// Tasks CRUD
tasksRoutes.post("/api/tasks", authMiddleware, tasksController.createTask);
tasksRoutes.get("/api/tasks", authMiddleware, tasksController.getAllTasks);
tasksRoutes.get(
  "/api/tasks/:taskId",
  authMiddleware,
  tasksController.getSingleTask,
);
tasksRoutes.put(
  "/api/tasks/:taskId",
  authMiddleware,
  tasksController.updateTask,
);
tasksRoutes.delete(
  "/api/tasks/:taskId",
  authMiddleware,
  tasksController.deleteTask,
);


// Learn CRUD (nested under tasks)
tasksRoutes.post("/api/learn", authMiddleware, learnController.createLearn);
tasksRoutes.get("/api/learn", authMiddleware, learnController.getAllLearn);
tasksRoutes.get(
  "/api/learn/:learnId",
  authMiddleware,
  learnController.getSingleLearn,
);
tasksRoutes.put(
  "/api/learn/:learnId",
  authMiddleware,
  learnController.updateLearn,
);
tasksRoutes.delete(
  "/api/learn/:learnId",
  authMiddleware,
  learnController.deleteLearn,
);

export default tasksRoutes;
