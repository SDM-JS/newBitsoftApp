import express from "express";
import notesController from "../controllers/notes.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const notesRoutes = express.Router();

// Notes CRUD
notesRoutes.post("/api/notes", authMiddleware, notesController.createNote);
notesRoutes.get("/api/notes", authMiddleware, notesController.getAllNotes);
notesRoutes.get("/api/notes/:noteId", authMiddleware, notesController.getSingleNote);
notesRoutes.put("/api/notes/:noteId", authMiddleware, notesController.updateNote);
notesRoutes.delete("/api/notes/:noteId", authMiddleware, notesController.deleteNote);

export default notesRoutes;
