import authController from "../controllers/auth.controller.js";

import express from "express";

const router = express.Router();

router.post("/api/sign-up", authController.signUp);

router.post("/api/login", authController.login);

router.post("/api/login/admin", authController.adminLogin);

router.post("/api/sign-up/admin", authController.adminSignUp);

export default router;
