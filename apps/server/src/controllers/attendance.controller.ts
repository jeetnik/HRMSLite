import type { Request, Response, NextFunction } from "express";
import prisma from "@repo/db";
import { AppError } from "../middleware/error-handler";

function parseDateOnly(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, "Invalid date format. Use YYYY-MM-DD");
  }
  return date;
}

function parseOptionalDate(value: unknown, label: string): Date | undefined {
  if (!value) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(400, `${label} must be in YYYY-MM-DD format`);
  }
  return parseDateOnly(value);
}

export async function markAttendance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { employeeId, date, status } = req.body;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new AppError(404, "Employee not found");
    }

    const dateObj = parseDateOnly(date);

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: { employeeId, date: dateObj },
      },
      create: { employeeId, date: dateObj, status },
      update: { status },
      include: { employee: true },
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
}

export async function getAttendanceByEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new AppError(404, "Employee not found");
    }

    const start = parseOptionalDate(startDate, "startDate");
    const end = parseOptionalDate(endDate, "endDate");

    if (start && end && start > end) {
      throw new AppError(400, "startDate cannot be later than endDate");
    }

    const where: {
      employeeId: string;
      date?: { gte?: Date; lte?: Date };
    } = { employeeId };

    if (start || end) {
      where.date = {};
      if (start) where.date.gte = start;
      if (end) where.date.lte = end;
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const totalPresent = records.filter((r) => r.status === "Present").length;
    const totalAbsent = records.filter((r) => r.status === "Absent").length;

    res.json({
      success: true,
      data: {
        employee,
        records,
        summary: { totalPresent, totalAbsent, total: records.length },
      },
    });
  } catch (error) {
    next(error);
  }
}
