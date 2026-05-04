import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class SubmissionController {
  async createSubmission(req, res, next) {
    try {
      const { quizSchemaId, studentId } = req.body;
      if (!quizSchemaId) {
        return res.status(400).json({ error: "QuizSchemaId is required!" });
      }
      const submission = await prisma.submission.create({
        data: {
          quizSchemaId,
          studentId: studentId || req.student.id,
        },
      });
      return res.status(201).json({ message: "Submission created successfully!", submission });
    } catch (error) {
      next(error);
    }
  }
  async getAllSubmissions(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId, quizSchemaId } = req.query;
      const whereClause = {};
      if (studentId) whereClause.studentId = studentId;
      if (quizSchemaId) whereClause.quizSchemaId = quizSchemaId;
      const submissions = await prisma.submission.findMany({
        where: whereClause,
        include: { student: true, quizSchema: true },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ submissions });
    } catch (error) {
      next(error);
    }
  }
  async getSingleSubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      if (!submissionId) {
        return res.status(400).json({ error: "Submission ID is required!" });
      }
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: { student: true, quizSchema: true },
      });
      if (!submission) {
        return res.status(404).json({ error: "Submission not found!" });
      }
      return res.status(200).json({ submission });
    } catch (error) {
      next(error);
    }
  }
  async updateSubmission(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { submissionId } = req.params;
      if (!submissionId) {
        return res.status(400).json({ error: "Submission ID is required!" });
      }
      const submission = await prisma.submission.update({
        where: { id: submissionId },
        data: { ...req.body },
      });
      return res.status(200).json({ message: "Submission updated successfully!", submission });
    } catch (error) {
      next(error);
    }
  }
  async deleteSubmission(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { submissionId } = req.params;
      if (!submissionId) {
        return res.status(400).json({ error: "Submission ID is required!" });
      }
      await prisma.submission.delete({
        where: { id: submissionId },
      });
      return res.status(200).json({ message: "Submission deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
}

export default new SubmissionController();
