import authMiddleware from "../middleware/auth.middleware.js";
import express from "express";
import newsController from "../controllers/news.controller.js";
import studentController from "../controllers/student.controller.js";
import courseController from "../controllers/course.controller.js";
import groupController from "../controllers/group.controller.js";
import homeworkController from "../controllers/homework.controller.js";
import studentActivityController from "../controllers/studentActivity.controller.js";

const managerRoutes = express.Router();

managerRoutes.post("/api/news", authMiddleware, newsController.createNews);

managerRoutes.get("/api/me", authMiddleware, studentController.getInfo);

managerRoutes.get(
  "/api/get-all-news",
  authMiddleware,
  newsController.getAllNews,
);

managerRoutes.get(
  "/api/get-latest-news",
  authMiddleware,
  newsController.getLatestNews,
);

managerRoutes.put(
  "/api/news/:newsId",
  authMiddleware,
  newsController.updateNews,
);

managerRoutes.delete(
  "/api/news/:newsId",
  authMiddleware,
  newsController.deleteNews,
);

managerRoutes.get(
  "/api/students",
  authMiddleware,
  studentController.getAllStudents,
);
managerRoutes.delete(
  "/api/students/:studentId",
  authMiddleware,
  studentController.deleteStudent,
);

managerRoutes.put(
  "/api/students/:studentId",
  authMiddleware,
  studentController.updateStudent,
);

managerRoutes.get(
  "/api/students/:studentId",
  authMiddleware,
  studentController.getSingleStudent,
);

// COURSE BASED ROUTES

managerRoutes.post(
  "/api/courses",
  authMiddleware,
  courseController.createCourse,
);
managerRoutes.get(
  "/api/courses",
  authMiddleware,
  courseController.getAllCourses,
);

managerRoutes.get(
  "/api/courses/:courseId",
  authMiddleware,
  courseController.getSingleCourse,
);
managerRoutes.delete(
  "/api/courses/:courseId",
  authMiddleware,
  courseController.deleteCourse,
);

managerRoutes.put(
  "/api/courses/:courseId",
  authMiddleware,
  courseController.updateCourse,
);

// GROUP BASED ROUTES
managerRoutes.post(
  "/api/groups",
  authMiddleware,
  groupController.createGroup,
);

managerRoutes.get(
  "/api/groups",
  authMiddleware,
  groupController.getAllGroups,
);

managerRoutes.get(
  "/api/groups/:groupId",
  authMiddleware,
  groupController.getSingleGroup,
);

managerRoutes.put(
  "/api/groups/:groupId",
  authMiddleware,
  groupController.updateGroup,
);

managerRoutes.delete(
  "/api/groups/:groupId",
  authMiddleware,
  groupController.deleteGroup,
);

// HOMEWORK BASED ROUTES
managerRoutes.post(
  "/api/homeworks",
  authMiddleware,
  homeworkController.createHomework,
);
managerRoutes.get(
  "/api/homeworks",
  authMiddleware,
  homeworkController.getAllHomeworks,
);
managerRoutes.get(
  "/api/homeworks/:homeworkId",
  authMiddleware,
  homeworkController.getSingleHomework,
);
managerRoutes.put(
  "/api/homeworks/:homeworkId",
  authMiddleware,
  homeworkController.updateHomework,
);
managerRoutes.delete(
  "/api/homeworks/:homeworkId",
  authMiddleware,
  homeworkController.deleteHomework,
);

// STUDENT ACTIVITY BASED ROUTES
managerRoutes.post(
  "/api/student-activities",
  authMiddleware,
  studentActivityController.createStudentActivity,
);
managerRoutes.get(
  "/api/student-activities",
  authMiddleware,
  studentActivityController.getAllStudentActivities,
);
managerRoutes.get(
  "/api/student-activities/:activityId",
  authMiddleware,
  studentActivityController.getSingleStudentActivity,
);
managerRoutes.put(
  "/api/student-activities/:activityId",
  authMiddleware,
  studentActivityController.updateStudentActivity,
);
managerRoutes.delete(
  "/api/student-activities/:activityId",
  authMiddleware,
  studentActivityController.deleteStudentActivity,
);

export default managerRoutes;
