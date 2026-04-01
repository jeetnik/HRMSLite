import axios from "axios";
import type {
  Employee,
  EmployeeAttendance,
  DashboardData,
  ApiResponse,
  AttendanceRecord,
} from "../types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

export async function getEmployees(): Promise<Employee[]> {
  const { data } = await api.get<ApiResponse<Employee[]>>("/employees");
  return data.data;
}

export async function getEmployee(id: string): Promise<Employee> {
  const { data } = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
  return data.data;
}

export async function createEmployee(employee: {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
}): Promise<Employee> {
  const { data } = await api.post<ApiResponse<Employee>>("/employees", employee);
  return data.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/employees/${id}`);
}

export async function markAttendance(payload: {
  employeeId: string;
  date: string;
  status: "Present" | "Absent";
}): Promise<AttendanceRecord> {
  const { data } = await api.post<ApiResponse<AttendanceRecord>>(
    "/attendance",
    payload
  );
  return data.data;
}

export async function getAttendanceByEmployee(
  employeeId: string,
  startDate?: string,
  endDate?: string
): Promise<EmployeeAttendance> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const query = params.toString() ? `?${params.toString()}` : "";
  const { data } = await api.get<ApiResponse<EmployeeAttendance>>(
    `/attendance/employee/${employeeId}${query}`
  );
  return data.data;
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<ApiResponse<DashboardData>>(
    "/dashboard/summary"
  );
  return data.data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
