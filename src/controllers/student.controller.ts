import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma/client";

export async function getStudents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [students, total] = await prisma.$transaction([
      prisma.student.findMany({
        skip,
        take: limit,
        include: { class: { select: { name: true, grade: true } } },
        orderBy: { lastName: "asc" },
      }),
      prisma.student.count(),
    ]);

    res.json({
      data: students,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error); // Pass to error middleware
  }
}

// GET /api/students/:id — Get one student
export async function getStudent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const student = await prisma.student.findUniqueOrThrow({
      where: { id: parseInt(req.params.id as string) },
      include: {
        class: true,
        grades: { include: { subject: true } },
        attendances: { orderBy: { date: "desc" }, take: 30 },
      },
    });
    res.json(student);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    next(error);
  }
}

// POST /api/students — Create a student
export async function createStudent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { firstName, lastName, email, dateOfBirth, gender, classId } =
      req.body;
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        classId: parseInt(classId),
      },
      include: { class: true },
    });
    res.status(201).json(student);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    next(error);
  }
}
// PATCH /api/students/:id — Update a student
export async function updateStudent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const student = await prisma.student.update({
      where: { id: parseInt(req.params.id as string) },
      data: req.body,
    });
    res.json(student);
  } catch (error) {
    next(error);
  }
}
// DELETE /api/students/:id — Delete a student
export async function deleteStudent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await prisma.student.delete({
      where: { id: parseInt(req.params.id as string) },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
