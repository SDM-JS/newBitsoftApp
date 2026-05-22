import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class LearnController {
  async createLearn(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { imageUrl, desc, tasksId } = req.body;
      if (!imageUrl || !desc) {
        return res
          .status(400)
          .json({ error: "ImageUrl and desc are required!" });
      }
      const learn = await prisma.learn.create({
        data: { imageUrl, desc, tasksId },
      });
      return res
        .status(201)
        .json({ message: "Learn resource created successfully!", learn });
    } catch (error) {
      next(error);
    }
  }
  async getAllLearn(req, res, next) {
    try {
      const { tasksId } = req.query;
      const whereClause = tasksId ? { tasksId } : {};
      const learns = await prisma.learn.findMany({
        where: whereClause,
        include: { tasks: true },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ learns });
    } catch (error) {
      next(error);
    }
  }
  async getSingleLearn(req, res, next) {
    try {
      const { learnId } = req.params;
      if (!learnId) {
        return res.status(400).json({ error: "Learn ID is required!" });
      }
      const learn = await prisma.learn.findUnique({
        where: { id: learnId },
        include: { tasks: true },
      });
      if (!learn) {
        return res.status(404).json({ error: "Learn resource not found!" });
      }
      return res.status(200).json({ learn });
    } catch (error) {
      next(error);
    }
  }
  async updateLearn(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { learnId } = req.params;
      if (!learnId) {
        return res.status(400).json({ error: "Learn ID is required!" });
      }
      const learn = await prisma.learn.update({
        where: { id: learnId },
        data: { ...req.body },
      });
      return res
        .status(200)
        .json({ message: "Learn resource updated successfully!", learn });
    } catch (error) {
      next(error);
    }
  }
  async deleteLearn(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { learnId } = req.params;
      if (!learnId) {
        return res.status(400).json({ error: "Learn ID is required!" });
      }
      await prisma.learn.delete({
        where: { id: learnId },
      });
      return res
        .status(200)
        .json({ message: "Learn resource deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }

  async updateStudentPassword(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId, newPassword } = req.body;
      if (!studentId || !newPassword) {
        return res
          .status(400)
          .json({ error: "Student ID and new password are required!" });
      }
      const hashPassword = await bcrypt.hash(newPassword, 10);
      const student = await prisma.students.update({
        where: { id: studentId },
        data: { password: hashPassword },
      });
      return res
        .status(200)
        .json({ message: "Student password updated successfully!", student });
    } catch (error) {
      next(error);
    }
  }
}

export default new LearnController();
