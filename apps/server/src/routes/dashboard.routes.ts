import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller";

export const dashboardRoutes = Router();

dashboardRoutes.get("/summary", getDashboardSummary);
