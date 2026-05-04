import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class GroupController {
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
}

export default new GroupController();
