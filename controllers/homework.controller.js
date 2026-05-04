import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class HomeworkController {
  async createHomework(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const fields = {
        title: req.body.title,
        description: req.body.description,
        deadline: req.body.deadline,
        studentId: req.body.studentId,
      };
      if (
        Object.values(fields).some(
          (field) => field === undefined || field === "",
        )
      ) {
        return res.status(400).json({ error: "Please fill all the fileds!" });
      }

      const homework = await prisma.homework.create({
        data: {
          studentId: fields.studentId,
          title: fields.title,
          description: fields.description,
          checked: req.body.checked !== undefined ? req.body.checked : false,
          point: req.body.point ? parseInt(req.body.point) : null,
          deadline: new Date(fields.deadline),
        },
      });
      return res
        .status(201)
        .json({ message: "Homework created successfully!", homework });
    } catch (error) {
      next(error);
    }
  }
  async getAllHomeworks(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.query;
      const whereClause = studentId ? { studentId } : {};
      const homeworks = await prisma.homework.findMany({
        where: whereClause,
        include: {
          student: true,
          studentActivity: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ homeworks });
    } catch (error) {
      next(error);
    }
  }
  async getSingleHomework(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { homeworkId } = req.params;
      const homework = await prisma.homework.findFirst({
        where: {
          id: homeworkId,
        },
        include: {
          student: true,
          studentActivity: true,
        },
      });
      if (!homework) {
        return res
          .status(400)
          .json({ error: "Homework with this ID not found!" });
      }
      return res.status(200).json({ homework });
    } catch (error) {
      next(error);
    }
  }
  async updateHomework(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { homeworkId } = req.params;
      if (!homeworkId) {
        return res.status(400).json({ error: "Homework ID is required!" });
      }

      const { deadline, point, ...rest } = req.body;
      const updateData = { ...rest };
      if (deadline) updateData.deadline = new Date(deadline);
      if (point !== undefined) updateData.point = parseInt(point);

      const homework = await prisma.homework.update({
        where: { id: homeworkId },
        data: updateData,
      });
      return res
        .status(200)
        .json({ message: "Homework updated successfully!", homework });
    } catch (error) {
      next(error);
    }
  }
  async deleteHomework(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { homeworkId } = req.params;
      if (!homeworkId) {
        return res.status(400).json({ error: "Homework ID is required!" });
      }
      await prisma.homework.delete({
        where: { id: homeworkId },
      });
      return res
        .status(200)
        .json({ message: "Homework deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
}

export default new HomeworkController();
