import type { Request, Response, NextFunction } from "express";
import prisma from "@repo/db";
import { AppError } from "../middleware/error-handler";

export async function getAllEmployees(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { employeeId, fullName, email, department } = req.body;

    const employee = await prisma.employee.create({
      data: { employeeId, fullName, email, department },
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    const prismaErr = error as { code?: string; meta?: Record<string, unknown> };
    if (prismaErr.code === "P2002") {
      const target = Array.isArray(prismaErr.meta?.target)
        ? (prismaErr.meta?.target as string[]).join(", ")
        : "employeeId/email";
      next(new AppError(409, `Duplicate employee data for: ${target}`));
      return;
    }
    next(error);
  }
}

export async function deleteEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new AppError(404, "Employee not found");
    }

    await prisma.employee.delete({ where: { id } });
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        attendance: { orderBy: { date: "desc" } },
      },
    });

    if (!employee) {
      throw new AppError(404, "Employee not found");
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
}
