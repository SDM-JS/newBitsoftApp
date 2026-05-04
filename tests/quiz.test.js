import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

describe("Quiz & Test API Endpoints", () => {
  let adminToken;
  let studentToken;
  let studentId;
  let testId;

  beforeAll(async () => {
    // Cleanup and setup test data
    await prisma.submission.deleteMany();
    await prisma.question.deleteMany();
    await prisma.test.deleteMany();
    await prisma.student.deleteMany();
    await prisma.admin.deleteMany();

    // Create Admin
    const admin = await prisma.admin.create({
      data: {
        email: "testadmin@exam.com",
        password: "hashedpassword", // Simplification for test
      },
    });
    adminToken = jwt.sign({ userId: admin.id, role: "org::admin" }, process.env.JWT_SECRET);

    // Create Student
    const student = await prisma.student.create({
      data: {
        fullName: "Test Student",
        email: "teststudent@exam.com",
        parentNumber: "12345",
        password: "hashedpassword",
      },
    });
    studentId = student.id;
    studentToken = jwt.sign({ userId: student.id, role: "student" }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Admin: Batch Create Tests", () => {
    it("should allow admin to create multiple tests", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const res = await request(app)
        .post("/api/tests/batch")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          tests: [
            {
              title: "Test Unit 1",
              scheduledDate: today.toISOString(),
              questions: [
                {
                  text: "1 + 1?",
                  points: 5,
                  options: ["1", "2", "3"],
                  answer: "2",
                },
              ],
            },
          ],
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body[0]).toHaveProperty("id");
      testId = res.body[0].id;
    });

    it("should return 403 if student tries to create tests", async () => {
      const res = await request(app)
        .post("/api/tests/batch")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ tests: [] });
      expect(res.statusCode).toEqual(403);
    });
  });

  describe("Student: Daily Test", () => {
    it("should fetch today's test", async () => {
      const res = await request(app)
        .get("/api/tests/daily")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toBeDefined();
      expect(res.body.questions).toHaveLength(1);
    });
  });

  describe("Student: Submission", () => {
    it("should submit answers and return a score", async () => {
      const answers = {};
      const testRes = await request(app)
        .get("/api/tests/daily")
        .set("Authorization", `Bearer ${studentToken}`);
      
      const qId = testRes.body.questions[0].id;
      answers[qId] = "2"; // Correct answer

      const res = await request(app)
        .post("/api/tests/submit")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          testId: testRes.body.id,
          answers: answers,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.score).toEqual(5);
    });

    it("should prevent duplicate submissions", async () => {
      const res = await request(app)
        .post("/api/tests/submit")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          testId: testId,
          answers: {},
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/already submitted/i);
    });
  });

  describe("Leaderboard", () => {
    it("should return student rankings", async () => {
      const res = await request(app)
        .get("/api/tests/leaderboard")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].fullName).toEqual("Test Student");
      expect(res.body[0].totalScore).toEqual(5);
    });
  });
});
