import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class NotesController {
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
}

export default new NotesController();
