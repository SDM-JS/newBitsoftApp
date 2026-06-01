import express from "express";
import adminController from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const adminRoutes = express.Router();

// Admin CRUD (only Super Admin can perform these operations)
adminRoutes.post("/api/admins", authMiddleware, adminController.createAdmin);
adminRoutes.get("/api/admins", authMiddleware, adminController.getAllAdmins);
adminRoutes.get(
  "/api/admins/:adminId",
  authMiddleware,
  adminController.getSingleAdmin,
);
adminRoutes.put(
  "/api/admins/:adminId",
  authMiddleware,
  adminController.updateAdmin,
);
adminRoutes.delete(
  "/api/admins/:adminId",
  authMiddleware,
  adminController.deleteAdmin,
);

adminRoutes.patch(
  "/api/students/:studentId/password",
  authMiddleware,
  adminController.changeStudentPassword,
);

export default adminRoutes;
