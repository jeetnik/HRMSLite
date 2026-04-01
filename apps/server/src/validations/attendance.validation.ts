import { z } from "zod";

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const markAttendanceSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .regex(dateOnlyRegex, "Date must be in YYYY-MM-DD format"),
  status: z.enum(["Present", "Absent"], {
    errorMap: () => ({ message: "Status must be 'Present' or 'Absent'" }),
  }),
});
