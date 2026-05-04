import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthController {
  async signUp(req, res, next) {
    try {
      const { fullName, parentNumber, email, password, username, groupId } =
        req.body;
      const fields = [fullName, parentNumber, email, password, username];
      if (fields.some((field) => !field)) {
        return res.status(400).json({ error: "Please fill all the fileds!" });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be more than 6 characters long!" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newStudent = await prisma.student.create({
        data: {
          fullName,
          email,
          parentNumber,
          username,
          password: hashedPassword,
          groupId: groupId || undefined,
          level :'easy'
        },
      });
      return res.status(201).json({
        message: "Student created successfully",
        student: newStudent,
      });
    } catch (error) {
      next(error);
      //   console.log(error);
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Please fill all the fields!" });
      }

      const student = await prisma.student.findFirst({
        where: { email },
      });

      if (!student) {
        return res.status(400).json({ error: "Invalid email or password!" });
      }

      const isCorrectPassword = await bcrypt.compare(
        password,
        student.password,
      );
      if (!isCorrectPassword) {
        return res.status(400).json({ error: "Invalid email or password!" });
      }

      const token = jwt.sign(
        { userId: student.id, role: "student" },
        process.env.JWT_SECRET,
        {
          expiresIn: "365d",
          algorithm: "HS512",
        },
      );
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: { id: student.id, email: student.email },
        token,
      });
    } catch (error) {
      console.error(error); // Log first
      // next(error); // Then pass to global error handler
    }
  }
  async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Please fill all the fields!" });
      }

      const admin = await prisma.admin.findFirst({
        where: { email },
      });

      if (!admin) {
        return res.status(400).json({ error: "Invalid email or password!" });
      }

      const isCorrectPassword = await bcrypt.compare(password, admin.password);
      if (!isCorrectPassword) {
        return res.status(400).json({ error: "Invalid email or password!" });
      }

      const token = jwt.sign(
        { userId: admin.id, role: "org::admin" },
        process.env.JWT_SECRET,
        {
          expiresIn: "365d",
          algorithm: "HS512",
        },
      );
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: { id: admin.id, email: admin.email },
        token,
      });
    } catch (error) {
      // console.error(error); // Log first
      next(error); // Then pass to global error handler
    }
  }
  async adminSignUp(req, res, next) {
    try {
      const { email, password } = req.body;
      const fields = [email, password];
      if (fields.some((field) => !field)) {
        return res.status(400).json({ error: "Please fill all the fileds!" });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be more than 6 characters long!" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newAdmin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
      return res.status(201).json({
        message: "Admin created successfully",
        student: newAdmin,
      });
    } catch (error) {
      next(error);
      //   console.log(error);
    }
  }
}

export default new AuthController();
