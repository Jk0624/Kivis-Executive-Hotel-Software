import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

interface AuditLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  bookingReference: string | null;
}

interface AuditResponse {
  message: string;
  auditLogs: AuditLog[];
}

export default function SecurityAuditReport() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);

      const response =
        await api.get<AuditResponse>(
          "/admin/reports/security-audit"
        );

      setLogs(response.data.auditLogs);
    } catch (error) {
      console.error(error);
      alert("Failed to load security audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const keyword = search.toLowerCase();

    return logs.filter((log) => {
      return (
        log.employeeName
          .toLowerCase()
          .includes(keyword) ||

        log.employeeId
          .toLowerCase()
          .includes(keyword) ||

        log.action
          .toLowerCase()
          .includes(keyword) ||

        (log.bookingReference ?? "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [logs, search]);

  const totalLogs = logs.length;

  const bookingActions = logs.filter(
    (log) =>
      log.action.includes("BOOKING")
  ).length;

  const accessActions = logs.filter(
    (log) =>
      log.action.includes("ACCESS")
  ).length;

  const getActionClass = (
    action: string
  ) => {
    if (action.includes("BOOKING"))
      return "bg-blue-100 text-blue-700";

    if (action.includes("ACCESS"))
      return "bg-green-100 text-green-700";

    return "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        Loading security audit report...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="grid gap-6 md:grid-cols-3">

        <StatCard
          title="Total Audit Logs"
          value={totalLogs}
        />

        <StatCard
          title="Booking Actions"
          value={bookingActions}
          color="text-blue-600"
        />

        <StatCard
          title="Access Actions"
          value={accessActions}
          color="text-green-600"
        />

      </div>

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b p-6">

          <h2 className="text-xl font-semibold">
            Security Audit Trail
          </h2>

          <input
            type="text"
            placeholder="Search employee, booking or action..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="mt-4 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          />

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-4 py-3 text-left">
                  Employee
                </th>

                <th className="px-4 py-3 text-left">
                  Role
                </th>

                <th className="px-4 py-3 text-left">
                  Action
                </th>

                <th className="px-4 py-3 text-left">
                  Booking
                </th>

                <th className="px-4 py-3 text-left">
                  Details
                </th>

                <th className="px-4 py-3 text-left">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredLogs.length === 0 ? (
                <tr>

                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-500"
                  >
                    No audit logs found.
                  </td>

                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="px-4 py-4">

                      <div>
                        <p className="font-medium">
                          {log.employeeName}
                        </p>

                        <p className="text-sm text-slate-500">
                          {log.employeeId}
                        </p>
                      </div>

                    </td>

                    <td className="px-4 py-4">
                      {log.employeeRole}
                    </td>

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionClass(
                          log.action
                        )}`}
                      >
                        {log.action.replace(
                          /_/g,
                          " "
                        )}
                      </span>

                    </td>

                    <td className="px-4 py-4">
                      {log.bookingReference ?? "-"}
                    </td>

                    <td className="px-4 py-4">
                      {log.details ?? "-"}
                    </td>

                    <td className="px-4 py-4">
                      {new Date(
                        log.createdAt
                      ).toLocaleString()}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  color?: string;
}

function StatCard({
  title,
  value,
  color = "text-slate-900",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className={`mt-3 text-4xl font-bold ${color}`}>
        {value}
      </h2>

    </div>
  );
}