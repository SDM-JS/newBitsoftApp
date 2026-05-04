import "dotenv/config";
import BaseError from "../errors/base.error.js";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export default async function (req, res, next) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return next(BaseError.Unauthorized());
    }
    const token = authorization.split(" ")[1];
    if (!token) {
      return next(BaseError.Unauthorized());
    }
    const { userId, role } = jwt.verify(token, process.env.JWT_SECRET);

    if (!userId) {
      return next(BaseError.Unauthorized());
    }
    const query = await prisma.admin.findFirst({
      where: {
        id: userId,
      },
    });
    const studentQuery = await prisma.student.findFirst({
      where: {
        id: userId,
      },
    });
    let student;
    if (query) {
      student = {
        id: query.id,
        email: query.email,
        role,
      };
    }
    if (studentQuery) {
      console.log("Sevens");
      student = {
        fullName: studentQuery.fullName,
        id: studentQuery.id,
        email: studentQuery.email,
        parentNumber: studentQuery.parentNumber,
        username: studentQuery.username,
        role,
      };
    }
    if (!student) {
      return next(BaseError.Unauthorized());
    }
    req.student = student;
    next();
  } catch (error) {
    console.log(error);
    return next(BaseError.Unauthorized());
  }
}
