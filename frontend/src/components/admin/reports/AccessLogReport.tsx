import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

interface AccessLog {
  id: string;
  method: string;
  status: string;
  reason: string | null;
  createdAt: string;

  booking: {
    bookingId: string;
    user: {
      name: string;
      phone: string;
    };
  };

  accessDevice: {
    deviceId: string;
    room: {
      roomNo: string;
    };
  };
}

interface AccessLogResponse {
  message: string;
  accessLogs: AccessLog[];
}

export default function AccessLogReport() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const response =
        await api.get<AccessLogResponse>(
          "/admin/reports/access-logs"
        );

      setLogs(response.data.accessLogs);
    } catch (error) {
      console.error(error);
      alert("Failed to load access logs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
  const keyword = search.toLowerCase().trim();

  return logs.filter((log) => {
    const bookingId =
      log.booking?.bookingId ?? "";

    const guestName =
      log.booking?.user?.name ?? "";

    const roomNo =
      log.accessDevice?.room?.roomNo ?? "";

    const deviceId =
      log.accessDevice?.deviceId ?? "";

    return (
      bookingId.toLowerCase().includes(keyword) ||
      guestName.toLowerCase().includes(keyword) ||
      roomNo.toLowerCase().includes(keyword) ||
      deviceId.toLowerCase().includes(keyword)
    );
  });
}, [logs, search]);

  const successful =
    logs.filter(
      (log) => log.status === "SUCCESS"
    ).length;

  const failed =
    logs.filter(
      (log) => log.status !== "SUCCESS"
    ).length;

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-700";

      default:
        return "bg-red-100 text-red-700";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        Loading access logs...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="grid gap-6 md:grid-cols-3">

        <StatCard
          title="Total Logs"
          value={logs.length}
        />

        <StatCard
          title="Successful Access"
          value={successful}
          color="text-green-600"
        />

        <StatCard
          title="Failed Access"
          value={failed}
          color="text-red-600"
        />

      </div>

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b p-6">

          <h2 className="text-xl font-semibold">
            Access History
          </h2>

          <input
            type="text"
            placeholder="Search booking, guest, room or device..."
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
                  Booking
                </th>

                <th className="px-4 py-3 text-left">
                  Guest
                </th>

                <th className="px-4 py-3 text-left">
                  Room
                </th>

                <th className="px-4 py-3 text-left">
                  Device
                </th>

                <th className="px-4 py-3 text-left">
                  Method
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Reason
                </th>

                <th className="px-4 py-3 text-left">
                  Time
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredLogs.length === 0 ? (
                <tr>

                  <td
                    colSpan={8}
                    className="py-10 text-center text-slate-500"
                  >
                    No access logs found.
                  </td>

                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="px-4 py-4 font-medium">
                      {log.booking.bookingId}
                    </td>

                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">
                          {log.booking?.user?.name ?? "Unknown Guest"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {log.booking?.user?.phone ?? "-"}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {log.accessDevice?.room?.roomNo ?? "-"}
                    </td>

                    <td className="px-4 py-4">
                      {log.accessDevice.deviceId}
                    </td>

                    <td className="px-4 py-4">
                      {log.method}
                    </td>

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>

                    </td>

                    <td className="px-4 py-4">
                      {log.reason ?? "-"}
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