import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";
class Manager {
async submitTask(req, res, next) {
  try {
    const { taskId } = req.params;
    const { id } = req.student; 

    if (!taskId || !id) {
      return res.status(400).json({ error: "Task id required" });
    }

    const updatedTask = await prisma.tasks.update({
      where: { 
        id: taskId 
      },
      data: {
        completed: {
          connect: { id: id } 
        }
      },
      include: {
        completed: true 
      }
    });

    if(!updatedTask){
      return res.status(404).json({error:"task not found"})
    }

    return res.status(200).json({
      message: "Task done!",
      data: updatedTask
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
}
 async getTestOption(req,res,next){
  try{
      const {id}=req.params
   if(!id) return res.status(400).json({error:"Test id is required "})

 const singleOptions=await prisma.test.findMany({
  where:{tasksId:id},
  include:{
   options:true
  }
 })
   if(singleOptions.length==0) return res.status(404).json({error:"Option not found or does not exists"})

   res.status(200).json({options:singleOptions})
  }catch(error){
   console.error(error);
    next(error);
  }
 }
 
 async createTest(req, res, next) {
  try {
    const { role } = req.student;
    if (role !== "org::admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { title, question, imageUrl, tasksId, options } = req.body;


    if (!title || !question || !options || !Array.isArray(options) || !tasksId) {
      return res.status(400).json({ error: "Title, question va options massivi talab qilinadi!" });
    }


    const test = await prisma.test.create({
      data: {
        title,
        question,
        imageUrl,
        tasksId, 
        options: {
         
          create: options.map((opt) => ({
            answer: opt.answer,
            isCorrect: opt.isCorrect,
            imageUrl: opt.imageUrl || null,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return res.status(201).json({
      message: "Test va variantlar muvaffaqiyatli yaratildi!",
      test,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
  async createNews(req, res, next) {
    try {
      const { title, description } = req.body;
      const { role } = req.student;

      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const news = await prisma.news.create({
        data: {
          title,
          description,
          pictureUrl: req.body.pictureUrl || "",
          videoId: req.body.videoId || "",
          url: req.body.url || "",
        },
      });
      return res.status(201).json(news);
    } catch (error) {
      console.log(error);
      // next(error);
    }
  }
  async getInfo(req, res, next) {
    try {
      const { id } = req.student;
      const student = await prisma.student.findFirst({
        where: {
          id,
        },
        include: {
          group: true,
          homework: true,
          studentActivities: true,
        },
      });
      return res.json(student);
    } catch (error) {
      next(error);
    }
  }
  async getAllNews(req, res, next) {
    try {
      const allNews = await prisma.news.findMany();
      return res.json({ news: allNews });
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
  async getLatestNews(req, res, next) {
    try {
      const latestNews = await prisma.news.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json({ news: latestNews[0] });
    } catch (error) {
      next(error);
    }
  }
  async deleteNews(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { newsId } = req.params;
      if (!newsId) {
        res.status(400).json({ error: "News Id is required!" });
        throw BaseError.BadRequest("News Id is required!");
      }
      await prisma.news.delete({
        where: {
          id: newsId,
        },
      });
      return res.status(200).json({ message: "News deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async updateNews(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { newsId } = req.params;
      if (!newsId) {
        res.status(400).json({ error: "News Id is required!" });
        throw BaseError.BadRequest("News Id is required!");
      }
      const updatedNews = await prisma.news.update({
        where: {
          id: newsId,
        },
        data: {
          ...req.body,
        },
      });
      return res
        .status(200)
        .json({ updatedNews, message: "News updated successfully!" });
    } catch (error) {
      next(error);
    }
  }
  // Student based routes
  async getAllStudents(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const students = await prisma.student.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.json({ students });
    } catch (error) {
      next(error);
    }
  }
  async deleteStudent(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.params;
      if (!studentId) {
        res.status(400).json({ error: "Student Id is required!" });
        throw BaseError.BadRequest("Student Id is required!");
      }
      await prisma.student.delete({
        where: {
          id: studentId,
        },
      });
      return res.status(200).json({ message: "Student deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async updateStudent(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.params;
      if (!studentId) {
        res.status(400).json({ error: "Student Id is required!" });
        throw BaseError.BadRequest("Student Id is required!");
      }
      const updatedStudent = await prisma.student.update({
        where: {
          id: studentId,
        },
        data: {
          ...req.body,
        },
      });
      return res
        .status(200)
        .json({ updatedStudent, message: "Student updated successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async getSingleStudent(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({ error: "Student ID is required!" });
      }
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
        },
      });
      if (!student) {
        return res
          .status(400)
          .json({ error: "Student with this ID not found!" });
      }
      return res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  }
  // Course Functions
  async createCourse(req, res, next) {
    try {
      const { name, description } = req.body;
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const fields = [name, description];
      if (fields.some((field) => !field)) {
        return res.status(400).json({ error: "Please fill all the fileds!" });
      }
      const course = await prisma.course.create({
        data: {
          name,
          description,
        },
      });
      return res
        .status(201)
        .json({ course, message: "Course created successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async getAllCourses(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const courses = await prisma.course.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json({ courses }).status(200);
    } catch (error) {
      next(error);
    }
  }
  async getSingleCourse(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }

      const { courseId } = req.params;
      if (!courseId) {
        return res.status(400).json({ error: "Course Id is required!" });
      }
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
        },
        include: {
          groups: true,
        },
      });
      if (!course) {
        return res
          .status(400)
          .json({ error: "Course with this ID not found!" });
      }
      return res.status(200).json({ course });
    } catch (error) {
      next(error);
    }
  }
  async deleteCourse(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { courseId } = req.params;
      if (!courseId) {
        return res.status(400).json({ error: "Course Id is required!" });
      }
      const course = await prisma.course.delete({
        where: {
          id: courseId,
        },
      });
      if (!course) {
        return res
          .status(400)
          .json({ error: "Course with this ID not found!" });
      }
      return res.status(200).json({ message: "Course deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async updateCourse(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { courseId } = req.params;
      if (!courseId) {
        return res.status(400).json({ error: "Course Id is required!" });
      }
      const course = await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          ...req.body,
        },
      });
      if (!course) {
        return res
          .status(400)
          .json({ error: "Course with this ID not found!" });
      }
      return res.status(200).json({ message: "Course updated successfully!" });
    } catch (error) {
      next(error);
    }
  }
  // Group Functions
  async createGroup(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const fields = [req.body.name, req.body.courseId];
      console.log(req.body);
      if (fields.some((field) => !field)) {
        return res.status(400).json({ error: "Please fill all the fileds!" });
      }

      const group = await prisma.group.create({
        data: {
          courseId: fields[1],
          name: fields[0],
        },
      });
      return res
        .status(201)
        .json({ message: "Group created successfully!", group });
    } catch (error) {
      next(error);
    }
  }
  async getAllGroups(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const groups = await prisma.group.findMany();
      return res.status(200).json({ groups });
    } catch (error) {
      next(error);
    }
  }
  async getSingleGroup(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { groupId } = req.params;
      if (!groupId) {
        return res.status(400).json({ error: "Group ID is required!" });
      }
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
        },
        include: {
          course: true,
          students: true,
        },
      });
      if (!group) {
        return res.status(400).json({ error: "Group with this ID not found!" });
      }
      return res.status(200).json({ group });
    } catch (error) {
      next(error);
    }
  }
  async updateGroup(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { groupId } = req.params;
      if (!groupId) {
        return res.status(400).json({ error: "Group ID is required!" });
      }
      const group = await prisma.group.update({
        where: {
          id: groupId,
        },
        data: {
          ...req.body,
        },
      });
      if (!group) {
        return res
          .status(400)
          .json({ error: "Course with this ID not found!" });
      }
    } catch (error) {
      next(error);
    }
  }
  async deleteGroup(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { groupId } = req.params;
      if (!groupId) {
        return res.status(400).json({ error: "Group Id is required!" });
      }
      const group = await prisma.group.delete({
        where: {
          id: groupId,
        },
      });
      if (!group) {
        return res.status(400).json({ error: "Group with this ID not found!" });
      }
      return res.status(200).json({ message: "Group deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
  // Homework Functions
  async createHomework(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const fields = {
        title: req.body.title,
        description: req.body.description,
        deadline: req.body.deadline,
        studentId: req.body.studentId,
      };
      if (
        Object.values(fields).some(
          (field) => field === undefined || field === "",
        )
      ) {
        return res.status(400).json({ error: "Please fill all the fileds!" });
      }

      const homework = await prisma.homework.create({
        data: {
          studentId: fields.studentId,
          title: fields.title,
          description: fields.description,
          checked: req.body.checked !== undefined ? req.body.checked : false,
          point: req.body.point ? parseInt(req.body.point) : null,
          deadline: new Date(fields.deadline),
        },
      });
      return res
        .status(201)
        .json({ message: "Homework created successfully!", homework });
    } catch (error) {
      next(error);
    }
  }
  async getAllHomeworks(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.query;
      const whereClause = studentId ? { studentId } : {};
      const homeworks = await prisma.homework.findMany({
        where: whereClause,
        include: {
          student: true,
          studentActivity: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ homeworks });
    } catch (error) {
      next(error);
    }
  }
  async getSingleHomework(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { homeworkId } = req.params;
      const homework = await prisma.homework.findFirst({
        where: {
          id: homeworkId,
        },
        include: {
          student: true,
          studentActivity: true,
        },
      });
      if (!homework) {
        return res
          .status(400)
          .json({ error: "Homework with this ID not found!" });
      }
      return res.status(200).json({ homework });
    } catch (error) {
      next(error);
    }
  }
  async updateHomework(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { homeworkId } = req.params;
      if (!homeworkId) {
        return res.status(400).json({ error: "Homework ID is required!" });
      }

      const { deadline, point, ...rest } = req.body;
      const updateData = { ...rest };
      if (deadline) updateData.deadline = new Date(deadline);
      if (point !== undefined) updateData.point = parseInt(point);

      const homework = await prisma.homework.update({
        where: { id: homeworkId },
        data: updateData,
      });
      return res
        .status(200)
        .json({ message: "Homework updated successfully!", homework });
    } catch (error) {
      next(error);
    }
  }
  async deleteHomework(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { homeworkId } = req.params;
      if (!homeworkId) {
        return res.status(400).json({ error: "Homework ID is required!" });
      }
      await prisma.homework.delete({
        where: { id: homeworkId },
      });
      return res
        .status(200)
        .json({ message: "Homework deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }

  // StudentActivity Functions
  async createStudentActivity(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId, rating } = req.body;
      if (!studentId || !rating) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields!" });
      }
      const studentActivity = await prisma.studentActivity.create({
        data: {
          studentId,
          rating,
        },
      });
      return res.status(201).json({
        message: "StudentActivity created successfully!",
        studentActivity,
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllStudentActivities(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { studentId } = req.query;
      const whereClause = studentId ? { studentId } : {};
      const studentActivities = await prisma.studentActivity.findMany({
        where: whereClause,
        include: {
          student: true,
          tasks: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ studentActivities });
    } catch (error) {
      next(error);
    }
  }
  async getSingleStudentActivity(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { activityId } = req.params;
      const studentActivity = await prisma.studentActivity.findFirst({
        where: { id: activityId },
        include: {
          student: true,
          tasks: true,
        },
      });
      if (!studentActivity) {
        return res.status(400).json({ error: "StudentActivity not found!" });
      }
      return res.status(200).json({ studentActivity });
    } catch (error) {
      next(error);
    }
  }
  async updateStudentActivity(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { activityId } = req.params;
      if (!activityId) {
        return res.status(400).json({ error: "Activity ID is required!" });
      }
      const studentActivity = await prisma.studentActivity.update({
        where: { id: activityId },
        data: {
          ...req.body,
        },
      });
      return res.status(200).json({
        message: "StudentActivity updated successfully!",
        studentActivity,
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteStudentActivity(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { activityId } = req.params;
      if (!activityId) {
        return res.status(400).json({ error: "Activity ID is required!" });
      }
      await prisma.studentActivity.delete({
        where: { id: activityId },
      });
      return res
        .status(200)
        .json({ message: "StudentActivity deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }

  // Admin CRUD
  async createAdmin(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required!" });
      }
      const existingAdmin = await prisma.admin.findFirst({ where: { email } });
      if (existingAdmin) {
        return res.status(400).json({ error: "Admin with this email already exists!" });
      }
      const admin = await prisma.admin.create({
        data: { email, password },
      });
      return res.status(201).json({ message: "Admin created successfully!", admin });
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmins(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const admins = await prisma.admin.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ admins });
    } catch (error) {
      next(error);
    }
  }

  async getSingleAdmin(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { adminId } = req.params;
      if (!adminId) {
        return res.status(400).json({ error: "Admin ID is required!" });
      }
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });
      if (!admin) {
        return res.status(404).json({ error: "Admin not found!" });
      }
      return res.status(200).json({ admin });
    } catch (error) {
      next(error);
    }
  }

  async updateAdmin(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { adminId } = req.params;
      if (!adminId) {
        return res.status(400).json({ error: "Admin ID is required!" });
      }
      const admin = await prisma.admin.update({
        where: { id: adminId },
        data: { ...req.body },
      });
      return res.status(200).json({ message: "Admin updated successfully!", admin });
    } catch (error) {
      next(error);
    }
  }

  async deleteAdmin(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { adminId } = req.params;
      if (!adminId) {
        return res.status(400).json({ error: "Admin ID is required!" });
      }
      await prisma.admin.delete({
        where: { id: adminId },
      });
      return res.status(200).json({ message: "Admin deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }

  // Notes CRUD
  async createNote(req, res, next) {
    try {
      const { text, studentId } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required!" });
      }
      const note = await prisma.notes.create({
        data: {
          text,
          studentId: studentId || req.student.id,
        },
      });
      return res.status(201).json({ message: "Note created successfully!", note });
    } catch (error) {
      next(error);
    }
  }

  async getAllNotes(req, res, next) {
    try {
      const { studentId } = req.query;
      const whereClause = studentId ? { studentId } : {};
      const notes = await prisma.notes.findMany({
        where: whereClause,
        include: { student: true },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ notes });
    } catch (error) {
      next(error);
    }
  }

  async getSingleNote(req, res, next) {
    try {
      const { noteId } = req.params;
      if (!noteId) {
        return res.status(400).json({ error: "Note ID is required!" });
      }
      const note = await prisma.notes.findUnique({
        where: { id: noteId },
        include: { student: true },
      });
      if (!note) {
        return res.status(404).json({ error: "Note not found!" });
      }
      return res.status(200).json({ note });
    } catch (error) {
      next(error);
    }
  }

  async updateNote(req, res, next) {
    try {
      const { noteId } = req.params;
      if (!noteId) {
        return res.status(400).json({ error: "Note ID is required!" });
      }
      const note = await prisma.notes.update({
        where: { id: noteId },
        data: { ...req.body },
      });
      return res.status(200).json({ message: "Note updated successfully!", note });
    } catch (error) {
      next(error);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const { noteId } = req.params;
      if (!noteId) {
        return res.status(400).json({ error: "Note ID is required!" });
      }
      await prisma.notes.delete({
        where: { id: noteId },
      });
      return res.status(200).json({ message: "Note deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }

  // Tasks CRUD
 async createTask(req, res, next) {
  try {
    const { role } = req.student;
    if (role !== "org::admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { title, topic, level, desc, correctCode, learn } = req.body;

    const task = await prisma.tasks.create({
      data: {
        title,
        topic,
        level,
        desc,
        correctCode,
        // Learn modelini bog'langan holda yaratish
        learn: learn && learn.length > 0 ? {
          create: learn.map((item) => ({
            imageUrl: item.imageUrl,
            desc: item.desc,
          })),
        } : undefined,
      }, // <-- data obyekti shu yerda yopilishi shart!
      include: { 
        learn: true 
      }
    });

    return res.status(201).json({ message: "Task va uning elementlari yaratildi!", task });
  } catch (error) {
    console.error("Xatolik tafsiloti:", error);
    next(error);
  }
}
async getAllTasks(req, res, next) {
  try {
   
    const tasks = await prisma.tasks.findMany({
      include: { 
        learn: true, 
        completed: true  },
      orderBy: { 
        createdAt: "desc" 
      },
    });

    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
}

  async getSingleTask(req, res, next) {
    try {
      const { taskId } = req.params;
      if (!taskId) {
        return res.status(400).json({ error: "Task ID is required!" });
      }
      const task = await prisma.tasks.findUnique({
        where: { id: taskId },
        include: { learn: true, completed: true },
      });
      if (!task) {
        return res.status(404).json({ error: "Task not found!" });
      }
      return res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { taskId } = req.params;
      if (!taskId) {
        return res.status(400).json({ error: "Task ID is required!" });
      }
      const { learn, ...rest } = req.body;
      const task = await prisma.tasks.update({
        where: { id: taskId },
        data: {
          ...rest,
          learn: learn?.length
            ? {
                deleteMany: {},
                create: learn.map((l) => ({ imageUrl: l.imageUrl, desc: l.desc })),
              }
            : undefined,
        },
        include: { learn: true },
      });
      return res.status(200).json({ message: "Task updated successfully!", task });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { taskId } = req.params;
      if (!taskId) {
        return res.status(400).json({ error: "Task ID is required!" });
      }
      await prisma.tasks.delete({
        where: { id: taskId },
      });
      return res.status(200).json({ message: "Task deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }

  // Learn CRUD
  async createLearn(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { imageUrl, desc, tasksId } = req.body;
      if (!imageUrl || !desc) {
        return res.status(400).json({ error: "ImageUrl and desc are required!" });
      }
      const learn = await prisma.learn.create({
        data: { imageUrl, desc, tasksId },
      });
      return res.status(201).json({ message: "Learn resource created successfully!", learn });
    } catch (error) {
      next(error);
    }
  }

  async getAllLearn(req, res, next) {
    try {
      const { tasksId } = req.query;
      const whereClause = tasksId ? { tasksId } : {};
      const learns = await prisma.learn.findMany({
        where: whereClause,
        include: { tasks: true },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ learns });
    } catch (error) {
      next(error);
    }
  }

  async getSingleLearn(req, res, next) {
    try {
      const { learnId } = req.params;
      if (!learnId) {
        return res.status(400).json({ error: "Learn ID is required!" });
      }
      const learn = await prisma.learn.findUnique({
        where: { id: learnId },
        include: { tasks: true },
      });
      if (!learn) {
        return res.status(404).json({ error: "Learn resource not found!" });
      }
      return res.status(200).json({ learn });
    } catch (error) {
      next(error);
    }
  }

  async updateLearn(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { learnId } = req.params;
      if (!learnId) {
        return res.status(400).json({ error: "Learn ID is required!" });
      }
      const learn = await prisma.learn.update({
        where: { id: learnId },
        data: { ...req.body },
      });
      return res.status(200).json({ message: "Learn resource updated successfully!", learn });
    } catch (error) {
      next(error);
    }
  }

  async deleteLearn(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { learnId } = req.params;
      if (!learnId) {
        return res.status(400).json({ error: "Learn ID is required!" });
      }
      await prisma.learn.delete({
        where: { id: learnId },
      });
      return res.status(200).json({ message: "Learn resource deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }

  // Variants CRUD
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

  // Submission CRUD
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

export default new Manager();
