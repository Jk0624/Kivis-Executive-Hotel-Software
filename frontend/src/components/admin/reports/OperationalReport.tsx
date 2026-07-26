import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

interface OccupancyReport {
  totalRooms: number;
  available: number;
  booked: number;
  reserved: number;
  occupied: number;
  maintenance: number;
}

export default function OperationalReport() {
  const [report, setReport] = useState<OccupancyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/admin/reports/occupancy"
      );

      setReport(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load operational report.");
    } finally {
      setLoading(false);
    }
  };

  const percentages = useMemo(() => {
    if (!report || report.totalRooms === 0) {
      return {
        available: 0,
        booked: 0,
        reserved: 0,
        occupied: 0,
        maintenance: 0,
      };
    }

    return {
      available:
        (report.available / report.totalRooms) * 100,

      booked:
        (report.booked / report.totalRooms) * 100,

      reserved:
        (report.reserved / report.totalRooms) * 100,

      occupied:
        (report.occupied / report.totalRooms) * 100,

      maintenance:
        (report.maintenance / report.totalRooms) * 100,
    };
  }, [report]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-12 text-center text-slate-500 shadow-sm">
        Loading operational report...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-2xl border bg-white p-12 text-center text-red-500 shadow-sm">
        Unable to load operational report.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <StatCard
          title="Total Rooms"
          value={report.totalRooms}
        />

        <StatCard
          title="Available"
          value={report.available}
          color="text-emerald-600"
        />

        <StatCard
          title="Occupied"
          value={report.occupied}
          color="text-red-600"
        />

        <StatCard
          title="Reserved"
          value={report.reserved}
          color="text-blue-600"
        />

        <StatCard
          title="Booked"
          value={report.booked}
          color="text-amber-600"
        />

        <StatCard
          title="Maintenance"
          value={report.maintenance}
          color="text-orange-600"
        />

      </div>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">

        <div className="mb-6">

          <h2 className="text-xl font-semibold text-slate-900">
            Room Occupancy Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current room distribution across all operational
            statuses.
          </p>

        </div>

        <div className="overflow-hidden rounded-full bg-slate-200 h-5">

          <div className="flex h-full">

            <div
              className="bg-emerald-500"
              style={{
                width: `${percentages.available}%`,
              }}
            />

            <div
              className="bg-amber-500"
              style={{
                width: `${percentages.booked}%`,
              }}
            />

            <div
              className="bg-blue-500"
              style={{
                width: `${percentages.reserved}%`,
              }}
            />

            <div
              className="bg-red-500"
              style={{
                width: `${percentages.occupied}%`,
              }}
            />

            <div
              className="bg-orange-500"
              style={{
                width: `${percentages.maintenance}%`,
              }}
            />

          </div>

        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">

          <StatusRow
            label="Available"
            value={report.available}
            percent={percentages.available}
          />

          <StatusRow
            label="Booked"
            value={report.booked}
            percent={percentages.booked}
          />

          <StatusRow
            label="Reserved"
            value={report.reserved}
            percent={percentages.reserved}
          />

          <StatusRow
            label="Occupied"
            value={report.occupied}
            percent={percentages.occupied}
          />

          <StatusRow
            label="Maintenance"
            value={report.maintenance}
            percent={percentages.maintenance}
          />

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

interface StatusRowProps {
  label: string;
  value: number;
  percent: number;
}

function StatusRow({
  label,
  value,
  percent,
}: StatusRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">

      <div>

        <p className="font-medium text-slate-800">
          {label}
        </p>

        <p className="text-sm text-slate-500">
          {value} rooms
        </p>

      </div>

      <div className="text-lg font-bold text-slate-700">
        {percent.toFixed(0)}%
      </div>

    </div>
  );
}