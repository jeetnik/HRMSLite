"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, UserCheck, UserX } from "lucide-react";
import {
  getEmployees,
  markAttendance,
  getAttendanceByEmployee,
  getErrorMessage,
} from "../../lib/api";
import type { Employee, EmployeeAttendance } from "../../types";
import {
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from "../../components/loading";
import { useToast } from "../../components/toast";

function getLocalDateOnly(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateFromISODateOnly(isoDateOrDateTime: string) {
  const dateOnly = isoDateOrDateTime.slice(0, 10);
  const safeDate = new Date(`${dateOnly}T00:00:00.000Z`);

  const date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(safeDate);

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(safeDate);

  return { date, weekday };
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [date, setDate] = useState(() => getLocalDateOnly());
  const [status, setStatus] = useState<"Present" | "Absent">("Present");
  const [attendance, setAttendance] = useState<EmployeeAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const attendanceRequestIdRef = useRef(0);
  const { showToast } = useToast();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchAttendance = async (
    employeeId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const requestId = ++attendanceRequestIdRef.current;

    try {
      setAttendanceLoading(true);
      const data = await getAttendanceByEmployee(
        employeeId,
        startDate || undefined,
        endDate || undefined
      );

      if (attendanceRequestIdRef.current !== requestId) {
        return;
      }
      setAttendance(data);
    } catch (err) {
      if (attendanceRequestIdRef.current !== requestId) {
        return;
      }
      showToast(getErrorMessage(err), "error");
    } finally {
      if (attendanceRequestIdRef.current === requestId) {
        setAttendanceLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedEmployee) {
      setAttendance(null);
      return;
    }
    fetchAttendance(selectedEmployee, startDateFilter, endDateFilter);
  }, [selectedEmployee]);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !date) {
      showToast("Please select an employee and date", "error");
      return;
    }

    try {
      setSubmitting(true);
      await markAttendance({
        employeeId: selectedEmployee,
        date,
        status,
      });
      showToast(`Attendance marked as ${status} for ${date}`, "success");
      await fetchAttendance(selectedEmployee, startDateFilter, endDateFilter);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilter = async () => {
    if (!selectedEmployee) return;

    if (startDateFilter && endDateFilter && startDateFilter > endDateFilter) {
      showToast("From date cannot be later than To date", "error");
      return;
    }

    await fetchAttendance(selectedEmployee, startDateFilter, endDateFilter);
  };

  const clearFilter = async () => {
    if (!selectedEmployee) {
      setStartDateFilter("");
      setEndDateFilter("");
      return;
    }

    setStartDateFilter("");
    setEndDateFilter("");
    await fetchAttendance(selectedEmployee, "", "");
  };

  if (loading) return <LoadingSpinner text="Loading employees..." />;
  if (error) return <ErrorState message={error} onRetry={fetchEmployees} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-text-secondary text-sm mt-1">
          Track and manage employee attendance
        </p>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="Add employees first before tracking attendance."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                Mark Attendance
              </h2>
              <form onSubmit={handleMarkAttendance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Employee
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus("Present")}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        status === "Present"
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "border-border text-text-secondary hover:bg-gray-50"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("Absent")}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        status === "Absent"
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "border-border text-text-secondary hover:bg-gray-50"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!selectedEmployee || submitting}
                  className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {submitting ? "Marking..." : "Mark Attendance"}
                </button>
              </form>
            </div>

            {attendance && (
              <div className="bg-surface rounded-xl border border-border p-5">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      Present
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {attendance.summary.totalPresent}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary flex items-center gap-2">
                      <UserX className="w-4 h-4 text-red-600" />
                      Absent
                    </span>
                    <span className="text-sm font-semibold text-red-600">
                      {attendance.summary.totalAbsent}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Total Records</span>
                    <span className="text-sm font-semibold">
                      {attendance.summary.total}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {!selectedEmployee ? (
              <div className="bg-surface rounded-xl border border-border">
                <EmptyState
                  title="Select an employee"
                  description="Choose an employee from the dropdown to view and manage their attendance records."
                />
              </div>
            ) : attendanceLoading ? (
              <div className="bg-surface rounded-xl border border-border">
                <LoadingSpinner text="Loading attendance..." />
              </div>
            ) : attendance ? (
              <div className="bg-surface rounded-xl border border-border">
                <div className="p-5 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold">
                      Attendance Records — {attendance.employee.fullName}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                        className="px-3 py-1.5 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                        className="px-3 py-1.5 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleFilter}
                      className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                    >
                      Filter
                    </button>
                    {(startDateFilter || endDateFilter) && (
                      <button
                        onClick={clearFilter}
                        className="px-4 py-1.5 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                {attendance.records.length === 0 ? (
                  <EmptyState
                    title="No attendance records"
                    description="No records found for this employee. Mark attendance to get started."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left bg-gray-50/50">
                          <th className="px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Day
                          </th>
                          <th className="px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.records.map((record) => {
                          const { date: readableDate, weekday } =
                            formatDateFromISODateOnly(record.date);

                          return (
                            <tr
                              key={record.id}
                              className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-5 py-3.5 text-sm">{readableDate}</td>
                              <td className="px-5 py-3.5 text-sm text-text-secondary">
                                {weekday}
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    record.status === "Present"
                                      ? "bg-green-50 text-green-700"
                                      : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
