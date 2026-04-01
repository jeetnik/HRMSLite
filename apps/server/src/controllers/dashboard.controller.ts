import type { Request, Response, NextFunction } from "express";
import prisma from "@repo/db";

function getTodayDateRangeUTC() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateOnly = `${yyyy}-${mm}-${dd}`;
  return {
    start: new Date(`${dateOnly}T00:00:00.000Z`),
    end: new Date(`${dateOnly}T23:59:59.999Z`),
  };
}

export async function getDashboardSummary(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const totalEmployees = await prisma.employee.count();
    const { start, end } = getTodayDateRangeUTC();

    const todayAttendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const presentToday = todayAttendance.filter(
      (a) => a.status === "Present"
    ).length;
    const absentToday = todayAttendance.filter(
      (a) => a.status === "Absent"
    ).length;
    const unmarkedToday = Math.max(totalEmployees - todayAttendance.length, 0);

    const recentEmployees = await prisma.employee.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        totalEmployees,
        todayAttendance: {
          present: presentToday,
          absent: absentToday,
          unmarked: unmarkedToday,
          total: todayAttendance.length,
        },
        recentEmployees,
      },
    });
  } catch (error) {
    next(error);
  }
}
