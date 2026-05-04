import express from "express";
import tasksController from "../controllers/tasks.controller.js";
import learnController from "../controllers/learn.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const tasksRoutes = express.Router();

<<<<<<< HEAD
// Tasks CRUD
tasksRoutes.post("/api/tasks", authMiddleware, tasksController.createTask);
tasksRoutes.get("/api/tasks", authMiddleware, tasksController.getAllTasks);
tasksRoutes.get("/api/tasks/:taskId", authMiddleware, tasksController.getSingleTask);
tasksRoutes.put("/api/tasks/:taskId", authMiddleware, tasksController.updateTask);
tasksRoutes.delete("/api/tasks/:taskId", authMiddleware, tasksController.deleteTask);
=======
tasksRoutes.post("/api/tasks", authMiddleware, managerController.createTask);
tasksRoutes.get("/api/tests/:id",authMiddleware, managerController.getTestOption)
tasksRoutes.post("/api/tests/:taskId/submit",authMiddleware, managerController.submitTask)
tasksRoutes.post("/api/tests",authMiddleware,managerController.createTest);
tasksRoutes.get("/api/tasks", authMiddleware, managerController.getAllTasks);
tasksRoutes.get("/api/tasks/:taskId", authMiddleware, managerController.getSingleTask);
tasksRoutes.put("/api/tasks/:taskId", authMiddleware, managerController.updateTask);
tasksRoutes.delete("/api/tasks/:taskId", authMiddleware, managerController.deleteTask);
>>>>>>> 0a4cec3d234d442d86b589c5acb0f7d8c5c4f88d

// Learn CRUD (nested under tasks)
tasksRoutes.post("/api/learn", authMiddleware, learnController.createLearn);
tasksRoutes.get("/api/learn", authMiddleware, learnController.getAllLearn);
tasksRoutes.get("/api/learn/:learnId", authMiddleware, learnController.getSingleLearn);
tasksRoutes.put("/api/learn/:learnId", authMiddleware, learnController.updateLearn);
tasksRoutes.delete("/api/learn/:learnId", authMiddleware, learnController.deleteLearn);

export default tasksRoutes;
