"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { getDashboard, getErrorMessage } from "../lib/api";
import type { DashboardData } from "../types";
import { LoadingSpinner, ErrorState } from "../components/loading";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  const stats = [
    {
      label: "Total Employees",
      value: data.totalEmployees,
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Present Today",
      value: data.todayAttendance.present,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Absent Today",
      value: data.todayAttendance.absent,
      icon: UserX,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Unmarked Today",
      value: data.todayAttendance.unmarked,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">
          Overview of your HR management system
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-secondary">
                {stat.label}
              </span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {data.recentEmployees.length > 0 && (
        <div className="bg-surface rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold">Recently Added Employees</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-mono">
                      {emp.employeeId}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium">
                      {emp.fullName}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary">
                      {emp.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {emp.department}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
