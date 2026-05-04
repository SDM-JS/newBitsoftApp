import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class StudentActivityController {
  async createStudentActivity(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId, rating } = req.body;
      if (!studentId || !rating) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields!" });
      }
      const studentActivity = await prisma.studentActivity.create({
        data: {
          studentId,
          rating,
        },
      });
      return res.status(201).json({
        message: "StudentActivity created successfully!",
        studentActivity,
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllStudentActivities(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.query;
      const whereClause = studentId ? { studentId } : {};
      const studentActivities = await prisma.studentActivity.findMany({
        where: whereClause,
        include: {
          student: true,
          tasks: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ studentActivities });
    } catch (error) {
      next(error);
    }
  }
  async getSingleStudentActivity(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { activityId } = req.params;
      const studentActivity = await prisma.studentActivity.findFirst({
        where: { id: activityId },
        include: {
          student: true,
          tasks: true,
        },
      });
      if (!studentActivity) {
        return res.status(400).json({ error: "StudentActivity not found!" });
      }
      return res.status(200).json({ studentActivity });
    } catch (error) {
      next(error);
    }
  }
  async updateStudentActivity(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { activityId } = req.params;
      if (!activityId) {
        return res.status(400).json({ error: "Activity ID is required!" });
      }
      const studentActivity = await prisma.studentActivity.update({
        where: { id: activityId },
        data: {
          ...req.body,
        },
      });
      return res.status(200).json({
        message: "StudentActivity updated successfully!",
        studentActivity,
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteStudentActivity(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { activityId } = req.params;
      if (!activityId) {
        return res.status(400).json({ error: "Activity ID is required!" });
      }
      await prisma.studentActivity.delete({
        where: { id: activityId },
      });
      return res
        .status(200)
        .json({ message: "StudentActivity deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentActivityController();
