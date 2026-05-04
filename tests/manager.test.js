import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

describe("Manager API (CRUD)", () => {
  let adminToken;
  let sharedCourseId;
  let sharedGroupId;

  beforeAll(async () => {
    // Setup Admin Token
    const admin = await prisma.admin.findFirst() || await prisma.admin.create({
      data: { email: "manager_test@bitsoft.com", password: "password" }
    });
    adminToken = jwt.sign({ userId: admin.id, role: "org::admin" }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("News CRUD", () => {
    let newsId;
    it("should create news as admin", async () => {
      const res = await request(app)
        .post("/api/news")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Test News", description: "Test Content" });
      expect(res.statusCode).toEqual(201);
      newsId = res.body.id;
    });

    it("should get all news", async () => {
      const res = await request(app)
        .get("/api/get-all-news")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body.news).toBeDefined();
    });

    it("should update news", async () => {
      const res = await request(app)
        .put(`/api/news/${newsId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Updated News" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.updatedNews.title).toBe("Updated News");
    });

    it("should delete news", async () => {
      const res = await request(app)
        .delete(`/api/news/${newsId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("Courses & Groups CRUD", () => {
    it("should create a course", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Testing 101", description: "Intro to testing" });
      expect(res.statusCode).toEqual(201);
      sharedCourseId = res.body.course.id;
    });

    it("should create a group tied to the course", async () => {
      const res = await request(app)
        .post("/api/groups")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Beta Group", courseId: sharedCourseId });
      expect(res.statusCode).toEqual(201);
      sharedGroupId = res.body.group.id;
    });

    it("should get single group details", async () => {
      const res = await request(app)
        .get(`/api/groups/${sharedGroupId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.group.course.id).toBe(sharedCourseId);
    });
  });

  describe("Homeworks", () => {
    let hwId;
    it("should create homework for a student", async () => {
      const student = await prisma.student.findFirst();
      if (!student) return;

      const res = await request(app)
        .post("/api/homeworks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Math HW",
          description: "Solve puzzles",
          deadline: new Date(Date.now() + 86400000).toISOString(),
          studentId: student.id
        });
      expect(res.statusCode).toEqual(201);
      hwId = res.body.homework.id;
    });

    it("should list homeworks", async () => {
      const res = await request(app)
        .get("/api/homeworks")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.homeworks.length).toBeGreaterThan(0);
    });
  });
});
