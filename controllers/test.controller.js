import { prisma } from "../lib/prisma.js";
import BaseError from "../errors/base.error.js";

class TestController {
  // Admin: Create quiz schemas (batch)
  // Body: { tests: [{ type, title, desc, difficulty, topic, image, givenTime, extraTime, score, isDaily, isActive, input, explanation, variants: [{ option, isTrue }] }] }
  async createBatchTests(req, res, next) {
    try {
      if (req.student.role !== "org::admin") {
        return next(BaseError.Forbidden());
      }

      const { tests } = req.body;

      if (!Array.isArray(tests) || tests.length === 0) {
        return next(BaseError.BadRequest("Expected a non-empty array of tests"));
      }

      const created = [];
      for (const t of tests) {
        const { type, title, desc, difficulty, topic, image, givenTime, extraTime, score, isDaily, isActive, input, explanation, variants } = t;

        const quiz = await prisma.quizSchema.create({
          data: {
            type,
            title,
            desc: desc ?? null,
            difficulty,
            topic,
            image: image ?? null,
            givenTime,
            extraTime: extraTime ?? 0,
            score,
            isDaily: isDaily ?? false,
            isActive: isActive ?? true,
            input: input ?? "",
            explanation: explanation ?? "",
            variants: {
              create: (variants || []).map((v) => ({
                option: v.option,
                isTrue: v.isTrue,
              })),
            },
          },
          include: { variants: true },
        });

        created.push(quiz);
      }

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }

  // Student / Admin: Get the active daily quiz for a given difficulty level
  // Requires header: level: easy | medium | hard | expert | master
  async getDailyTest(req, res, next) {
    try {
      const VALID_LEVELS = ["easy", "medium", "hard", "expert", "master"];
      const level = req.headers["level"];

      if (!level || !VALID_LEVELS.includes(level)) {
        return next(
          BaseError.BadRequest(
            `Missing or invalid 'level' header. Must be one of: ${VALID_LEVELS.join(", ")}`,
          ),
        );
      }

      const quiz = await prisma.quizSchema.findFirst({
        where: { isDaily: true, isActive: true, difficulty: level },
        include: { variants: true },
      });

      if (!quiz) {
        return res
          .status(404)
          .json({ message: `No active daily test for difficulty: ${level}` });
      }

      // Check if this student already submitted
      const submission = await prisma.submission.findFirst({
        where: {
          quizSchemaId: quiz.id,
          studentId: req.student.id,
        },
      });

      res.status(200).json({ ...quiz, submitted: !!submission, submission });
    } catch (error) {
      next(error);
    }
  }

  // Student: Submit a quiz (one submission per quiz per student)
  // Body: { quizSchemaId }
  async submitTest(req, res, next) {
    try {
      const { quizSchemaId } = req.body;
      const studentId = req.student.id;

      if (!quizSchemaId) {
        return next(BaseError.BadRequest("Missing quizSchemaId"));
      }

      const quiz = await prisma.quizSchema.findUnique({
        where: { id: quizSchemaId },
      });

      if (!quiz) {
        return next(BaseError.BadRequest("Quiz not found"));
      }

      const existing = await prisma.submission.findFirst({
        where: { quizSchemaId, studentId },
      });

      if (existing) {
        return next(BaseError.BadRequest("You have already submitted this quiz"));
      }

      const submission = await prisma.submission.create({
        data: { quizSchemaId, studentId },
      });

      res.status(201).json(submission);
    } catch (error) {
      next(error);
    }
  }

  // All authenticated: Leaderboard ranked by total score of completed quizzes
  async getLeaderboard(req, res, next) {
    try {
      const students = await prisma.student.findMany({
        select: {
          id: true,
          fullName: true,
          rating: true,
          level: true,
          submits: {
            select: {
              quizSchema: {
                select: { score: true },
              },
            },
          },
        },
      });

      const formatted = students
        .map((s) => ({
          id: s.id,
          fullName: s.fullName,
          rating: s.rating,
          level: s.level,
          totalScore: s.submits.reduce(
            (sum, sub) => sum + (sub.quizSchema?.score ?? 0),
            0,
          ),
          testsCompleted: s.submits.length,
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

      res.status(200).json(formatted);
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get all quiz schemas
  async getAllTests(req, res, next) {
    try {
      if (req.student.role !== "org::admin") {
        return next(BaseError.Forbidden());
      }

      const quizzes = await prisma.quizSchema.findMany({
        include: { variants: true, submittedUsers: true },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(quizzes);
    } catch (error) {
      next(error);
    }
  }
}

export default new TestController();
