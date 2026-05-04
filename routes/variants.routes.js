import express from "express";
import variantsController from "../controllers/variants.controller.js";
import submissionController from "../controllers/submission.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const variantsRoutes = express.Router();

// Variants CRUD (Admin only)
variantsRoutes.post("/api/variants", authMiddleware, variantsController.createVariant);
variantsRoutes.get("/api/variants", authMiddleware, variantsController.getAllVariants);
variantsRoutes.get("/api/variants/:variantId", authMiddleware, variantsController.getSingleVariant);
variantsRoutes.put("/api/variants/:variantId", authMiddleware, variantsController.updateVariant);
variantsRoutes.delete("/api/variants/:variantId", authMiddleware, variantsController.deleteVariant);

// Submission CRUD
variantsRoutes.post("/api/submissions", authMiddleware, submissionController.createSubmission);
variantsRoutes.get("/api/submissions", authMiddleware, submissionController.getAllSubmissions);
variantsRoutes.get("/api/submissions/:submissionId", authMiddleware, submissionController.getSingleSubmission);
variantsRoutes.put("/api/submissions/:submissionId", authMiddleware, submissionController.updateSubmission);
variantsRoutes.delete("/api/submissions/:submissionId", authMiddleware, submissionController.deleteSubmission);

export default variantsRoutes;
