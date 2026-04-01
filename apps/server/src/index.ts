import "dotenv/config";
import express from "express";
import cors from "cors";
import { employeeRoutes } from "./routes/employee.routes";
import { attendanceRoutes } from "./routes/attendance.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { AppError, errorHandler } from "./middleware/error-handler";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found"));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
