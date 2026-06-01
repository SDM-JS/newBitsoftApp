import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class AdminController {
  async createAdmin(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required!" });
      }
      const existingAdmin = await prisma.admin.findFirst({ where: { email } });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ error: "Admin with this email already exists!" });
      }
      const admin = await prisma.admin.create({
        data: { email, password },
      });
      return res
        .status(201)
        .json({ message: "Admin created successfully!", admin });
    } catch (error) {
      next(error);
    }
  }
  async getAllAdmins(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const admins = await prisma.admin.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ admins });
    } catch (error) {
      next(error);
    }
  }
  async getSingleAdmin(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { adminId } = req.params;
      if (!adminId) {
        return res.status(400).json({ error: "Admin ID is required!" });
      }
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });
      if (!admin) {
        return res.status(404).json({ error: "Admin not found!" });
      }
      return res.status(200).json({ admin });
    } catch (error) {
      next(error);
    }
  }
  async updateAdmin(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { adminId } = req.params;
      if (!adminId) {
        return res.status(400).json({ error: "Admin ID is required!" });
      }
      const admin = await prisma.admin.update({
        where: { id: adminId },
        data: { ...req.body },
      });
      return res
        .status(200)
        .json({ message: "Admin updated successfully!", admin });
    } catch (error) {
      next(error);
    }
  }
  async deleteAdmin(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { adminId } = req.params;
      if (!adminId) {
        return res.status(400).json({ error: "Admin ID is required!" });
      }
      await prisma.admin.delete({
        where: { id: adminId },
      });
      return res.status(200).json({ message: "Admin deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }

  async changeStudentPassword(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.params;
      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ error: "New password is required!" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be more than 6 characters long!" });
      }
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });
      if (!student) {
        return res.status(404).json({ error: "Student not found!" });
      }
      await prisma.student.update({
        where: { id: studentId },
        data: { password: newPassword },
      });
      return res
        .status(200)
        .json({ message: "Student password updated successfully!" });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
