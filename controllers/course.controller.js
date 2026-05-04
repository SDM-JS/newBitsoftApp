import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class CourseController {
  async createCourse(req, res, next) {
    try {
      const { name, description } = req.body;
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const fields = [name, description];
      if (fields.some((field) => !field)) {
        return res.status(400).json({ error: "Please fill all the fileds!" });
      }
      const course = await prisma.course.create({
        data: {
          name,
          description,
        },
      });
      return res
        .status(201)
        .json({ course, message: "Course created successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async getAllCourses(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const courses = await prisma.course.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json({ courses }).status(200);
    } catch (error) {
      next(error);
    }
  }
  async getSingleCourse(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }

      const { courseId } = req.params;
      if (!courseId) {
        return res.status(400).json({ error: "Course Id is required!" });
      }
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
        },
        include: {
          groups: true,
        },
      });
      if (!course) {
        return res
          .status(400)
          .json({ error: "Course with this ID not found!" });
      }
      return res.status(200).json({ course });
    } catch (error) {
      next(error);
    }
  }
  async deleteCourse(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { courseId } = req.params;
      if (!courseId) {
        return res.status(400).json({ error: "Course Id is required!" });
      }
      const course = await prisma.course.delete({
        where: {
          id: courseId,
        },
      });
      if (!course) {
        return res
          .status(400)
          .json({ error: "Course with this ID not found!" });
      }
      return res.status(200).json({ message: "Course deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async updateCourse(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { courseId } = req.params;
      if (!courseId) {
        return res.status(400).json({ error: "Course Id is required!" });
      }
      const course = await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          ...req.body,
        },
      });
      if (!course) {
        return res
          .status(400)
          .json({ error: "Course with this ID not found!" });
      }
      return res.status(200).json({ message: "Course updated successfully!" });
    } catch (error) {
      next(error);
    }
  }
}

export default new CourseController();
