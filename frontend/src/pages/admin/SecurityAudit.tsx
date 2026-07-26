import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

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

export default function SecurityAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const response = await api.get("/security-audit");

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

  const checkIns = logs.filter((log) =>
    log.action.includes("CHECK_IN")
  ).length;

  const checkOuts = logs.filter((log) =>
    log.action.includes("CHECK_OUT")
  ).length;

  const failedAccess = logs.filter((log) =>
    log.action.includes("DENIED")
  ).length;

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CHECK_IN":
        return "bg-green-100 text-green-700";

      case "CHECK_OUT":
        return "bg-blue-100 text-blue-700";

      case "ACCESS_DENIED":
        return "bg-red-100 text-red-700";

      case "MASTER_KEY_USED":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout>

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-slate-900">
            Security Audit
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor all system activities performed by staff.
          </p>

        </div>

      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-4">

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <p className="text-gray-500">
            Total Logs
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {totalLogs}
          </h2>

        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <p className="text-gray-500">
            Check-Ins
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {checkIns}
          </h2>

        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <p className="text-gray-500">
            Check-Outs
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {checkOuts}
          </h2>

        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <p className="text-gray-500">
            Failed Access
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {failedAccess}
          </h2>

        </div>

      </div>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6">

          <input
            type="text"
            placeholder="Search by employee, booking or action..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />

        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading security audit logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b bg-slate-100 text-left">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Date & Time</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-gray-500"
                    >
                      No security audit logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {log.employeeName}
                      </td>

                      <td className="px-4 py-3">
                        {log.employeeId}
                      </td>

                      <td className="px-4 py-3">
                        {log.employeeRole}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {log.bookingReference ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        {log.details || "-"}
                      </td>

                      <td className="px-4 py-3">
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
        )}

      </div>

    </AdminLayout>
  );
}