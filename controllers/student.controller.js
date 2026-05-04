import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class StudentController {
  async getInfo(req, res, next) {
    try {
      const { id } = req.student;
      const student = await prisma.student.findFirst({
        where: {
          id,
        },
        include: {
          group: true,
          homework: true,
          studentActivities: true,
        },
      });
      return res.json(student);
    } catch (error) {
      next(error);
    }
  }
  async getAllStudents(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const students = await prisma.student.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.json({ students });
    } catch (error) {
      next(error);
    }
  }
  async deleteStudent(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.params;
      if (!studentId) {
        res.status(400).json({ error: "Student Id is required!" });
        throw BaseError.BadRequest("Student Id is required!");
      }
      await prisma.student.delete({
        where: {
          id: studentId,
        },
      });
      return res.status(200).json({ message: "Student deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async updateStudent(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.params;
      if (!studentId) {
        res.status(400).json({ error: "Student Id is required!" });
        throw BaseError.BadRequest("Student Id is required!");
      }
      const updatedStudent = await prisma.student.update({
        where: {
          id: studentId,
        },
        data: {
          ...req.body,
        },
      });
      return res
        .status(200)
        .json({ updatedStudent, message: "Student updated successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async getSingleStudent(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({ error: "Student ID is required!" });
      }
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
        },
      });
      if (!student) {
        return res
          .status(400)
          .json({ error: "Student with this ID not found!" });
      }
      return res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentController();
