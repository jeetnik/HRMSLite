import { Router } from "express";
import { validate } from "../middleware/validate";
import { markAttendanceSchema } from "../validations/attendance.validation";
import {
  markAttendance,
  getAttendanceByEmployee,
} from "../controllers/attendance.controller";

export const attendanceRoutes = Router();

attendanceRoutes.post("/", validate(markAttendanceSchema), markAttendance);
attendanceRoutes.get("/employee/:employeeId", getAttendanceByEmployee);
