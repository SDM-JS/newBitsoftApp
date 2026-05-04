import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";

describe("Authentication API", () => {
  const studentData = {
    fullName: "Auth Test User",
    email: "authtest@exam.com",
    password: "password123",
    username: "authtestuser",
    parentNumber: "5551234",
  };

  const adminData = {
    email: "adminauth@exam.com",
    password: "adminpassword",
  };

  beforeAll(async () => {
    await prisma.student.deleteMany({ where: { email: studentData.email } });
    await prisma.admin.deleteMany({ where: { email: adminData.email } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Student Auth", () => {
    it("should register a new student", async () => {
      const res = await request(app)
        .post("/api/sign-up")
        .send(studentData);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.student).toHaveProperty("id");
      expect(res.body.student.email).toBe(studentData.email);
    });

    it("should login the student", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          email: studentData.email,
          password: studentData.password,
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should fail login with wrong password", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          email: studentData.email,
          password: "wrongpassword",
        });
      
      expect(res.statusCode).toEqual(400);
    });
  });

  describe("Admin Auth", () => {
    it("should register a new admin", async () => {
      const res = await request(app)
        .post("/api/sign-up/admin")
        .send(adminData);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.student).toHaveProperty("id"); // AuthController calls it 'student' in response
    });

    it("should login the admin", async () => {
      const res = await request(app)
        .post("/api/login/admin")
        .send(adminData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });
  });
});
