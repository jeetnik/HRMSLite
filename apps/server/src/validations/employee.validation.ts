import { z } from "zod";

export const createEmployeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required").trim(),
  fullName: z.string().min(1, "Full name is required").trim(),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  department: z.string().min(1, "Department is required").trim(),
});
