import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class VariantsController {
  async createVariant(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { option, isTrue, quizSchemaId } = req.body;
      if (!option || quizSchemaId === undefined) {
        return res.status(400).json({ error: "Option and quizSchemaId are required!" });
      }
      const variant = await prisma.variants.create({
        data: { option, isTrue: isTrue ?? false, quizSchemaId },
      });
      return res.status(201).json({ message: "Variant created successfully!", variant });
    } catch (error) {
      next(error);
    }
  }
  async getAllVariants(req, res, next) {
    try {
      const { quizSchemaId } = req.query;
      const whereClause = quizSchemaId ? { quizSchemaId } : {};
      const variants = await prisma.variants.findMany({
        where: whereClause,
        include: { quizSchema: true },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ variants });
    } catch (error) {
      next(error);
    }
  }
  async getSingleVariant(req, res, next) {
    try {
      const { variantId } = req.params;
      if (!variantId) {
        return res.status(400).json({ error: "Variant ID is required!" });
      }
      const variant = await prisma.variants.findUnique({
        where: { id: variantId },
        include: { quizSchema: true },
      });
      if (!variant) {
        return res.status(404).json({ error: "Variant not found!" });
      }
      return res.status(200).json({ variant });
    } catch (error) {
      next(error);
    }
  }
  async updateVariant(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { variantId } = req.params;
      if (!variantId) {
        return res.status(400).json({ error: "Variant ID is required!" });
      }
      const variant = await prisma.variants.update({
        where: { id: variantId },
        data: { ...req.body },
      });
      return res.status(200).json({ message: "Variant updated successfully!", variant });
    } catch (error) {
      next(error);
    }
  }
  async deleteVariant(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { variantId } = req.params;
      if (!variantId) {
        return res.status(400).json({ error: "Variant ID is required!" });
      }
      await prisma.variants.delete({
        where: { id: variantId },
      });
      return res.status(200).json({ message: "Variant deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
}

export default new VariantsController();
