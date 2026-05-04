import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class TasksController {
  async createTask(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { title, topic, level, desc, learn, correctCode } = req.body;
      if (!title || !topic || !level || !desc || !correctCode) {
        return res.status(400).json({ error: "Title, topic, level, desc, and correctCode are required!" });
      }
      const task = await prisma.tasks.create({
        data: {
          title,
          topic,
          level,
          desc,
          correctCode,
          learn: learn?.length
            ? { create: learn.map((l) => ({ imageUrl: l.imageUrl, desc: l.desc })) }
            : undefined,
        },
        include: { learn: true },
      });
      return res.status(201).json({ message: "Task created successfully!", task });
    } catch (error) {
      next(error);
    }
  }
  async getAllTasks(req, res, next) {
    try {
      const { level, topic } = req.query;
      const whereClause = {};
      if (level) whereClause.level = level;
      if (topic) whereClause.topic = topic;
      const tasks = await prisma.tasks.findMany({
        where: whereClause,
        include: { learn: true, completed: true },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ tasks });
    } catch (error) {
      next(error);
    }
  }
  async getSingleTask(req, res, next) {
    try {
      const { taskId } = req.params;
      if (!taskId) {
        return res.status(400).json({ error: "Task ID is required!" });
      }
      const task = await prisma.tasks.findUnique({
        where: { id: taskId },
        include: { learn: true, completed: true },
      });
      if (!task) {
        return res.status(404).json({ error: "Task not found!" });
      }
      return res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }
  async updateTask(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { taskId } = req.params;
      if (!taskId) {
        return res.status(400).json({ error: "Task ID is required!" });
      }
      const { learn, ...rest } = req.body;
      const task = await prisma.tasks.update({
        where: { id: taskId },
        data: {
          ...rest,
          learn: learn?.length
            ? {
                deleteMany: {},
                create: learn.map((l) => ({ imageUrl: l.imageUrl, desc: l.desc })),
              }
            : undefined,
        },
        include: { learn: true },
      });
      return res.status(200).json({ message: "Task updated successfully!", task });
    } catch (error) {
      next(error);
    }
  }
  async deleteTask(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { taskId } = req.params;
      if (!taskId) {
        return res.status(400).json({ error: "Task ID is required!" });
      }
      await prisma.tasks.delete({
        where: { id: taskId },
      });
      return res.status(200).json({ message: "Task deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
}

export default new TasksController();
