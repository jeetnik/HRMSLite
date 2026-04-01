export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: "Present" | "Absent";
  createdAt: string;
  employee?: Employee;
}

export interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  total: number;
}

export interface EmployeeAttendance {
  employee: Employee;
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}

export interface DashboardData {
  totalEmployees: number;
  todayAttendance: {
    present: number;
    absent: number;
    unmarked: number;
    total: number;
  };
  recentEmployees: Employee[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: string[];
}
