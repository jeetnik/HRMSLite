import { Router } from "express";
import { validate } from "../middleware/validate";
import { createEmployeeSchema } from "../validations/employee.validation";
import {
  getAllEmployees,
  createEmployee,
  deleteEmployee,
  getEmployeeById,
} from "../controllers/employee.controller";

export const employeeRoutes = Router();

employeeRoutes.get("/", getAllEmployees);
employeeRoutes.get("/:id", getEmployeeById);
employeeRoutes.post("/", validate(createEmployeeSchema), createEmployee);
employeeRoutes.delete("/:id", deleteEmployee);
