import { Router } from "express";
import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudents,
  updateStudent,
} from "../controllers/student.controller";

const router = Router();

router.get("/", getStudents); // GET /api/students

router.get("/:id", getStudent); // GET /api/students/1

router.post("/", createStudent); // POST /api/students

router.patch("/:id", updateStudent); // PATCH /api/students/1

router.delete("/:id", deleteStudent); // DELETE /api/students/1

export default router;
