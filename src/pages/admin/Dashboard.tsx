import AdminLayout from "../../layouts/AdminLayout";
import { useEffect, useState } from "react";
import api from "../../services/api";

function Dashboard() {
  const [summary, setSummary] = useState<any | null>(null);
  const [header, setHeader] = useState<any | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
  const fetchDashboardSummary = async () => {
    try {
      const response = await api.get("/admin/dashboard/summary");
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error);
    }
  };
  fetchDashboardSummary();
}, []);

useEffect(() => {
  const fetchDashboardHeader = async () => {
    try {
      const response = await api.get("/admin/dashboard/header");
      setHeader(response.data.user);
    } catch (error) {
      console.error("Failed to fetch dashboard header:", error);
    }
  };

  fetchDashboardHeader();
}, []);  

useEffect(() => {
  const fetchRecentActivity = async () => {
    try {
      const response = await api.get("/admin/dashboard/recent-activity");
      setRecentActivity(response.data);
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
    }
  };

  fetchRecentActivity();
}, []);

  
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Welcome Back,
      </h1>

      <h2 className="mt-2 text-2xl font-semibold text-blue-700">
        {header?.name ?? "Administrator"}
      </h2>

      <p className="mt-2 text-gray-600">
        Kiviz Executive Lodge Administration
      </p>

      {/* Statistics */}

    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">

    <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">
        Rooms
        </h3>

        <p className="mt-4 text-4xl font-bold text-blue-700">
        {summary?.totalRooms ?? 0}
        </p>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">
        Bookings
        </h3>

        <p className="mt-4 text-4xl font-bold text-blue-700">
          {summary?.totalBookings ?? 0}
        </p>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">
        Guests
        </h3>

        <p className="mt-4 text-4xl font-bold text-blue-700">
          {summary?.totalGuests ?? 0}
        </p>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">
        Receptionists
        </h3>

        <p className="mt-4 text-4xl font-bold text-blue-700">
          {summary?.totalReceptionists ?? 0}
        </p>

    </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">
            Access Devices
            </h3>

            <p className="mt-4 text-4xl font-bold text-blue-700">
              {summary?.totalDevices ?? 0}
            </p>
        </div>

    </div>


    {/* Quick Actions */}

<div className="mt-10">

  <h2 className="mb-6 text-2xl font-semibold text-slate-900">
    Quick Actions
  </h2>

  <div className="grid gap-6 md:grid-cols-3">

    <button className="rounded-xl bg-blue-700 p-8 text-lg font-semibold text-white shadow-md transition hover:bg-blue-800">
      Add Receptionist
    </button>

    <button className="rounded-xl bg-green-700 p-8 text-lg font-semibold text-white shadow-md transition hover:bg-green-800">
      Register ESP32 Device
    </button>

    <button className="rounded-xl bg-slate-800 p-8 text-lg font-semibold text-white shadow-md transition hover:bg-slate-900">
      View Security Audit
    </button>

  </div>

</div>


{/* Recent Activity */}

<div className="mt-10 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold text-slate-900">
    Recent System Activity
  </h2>

  <div className="space-y-4">
  {recentActivity.length === 0 ? (
    <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
      <p className="text-lg text-gray-500">
        No recent activity.
      </p>
    </div>
  ) : (
    recentActivity.map((activity) => (
      <div
        key={activity.bookingReference}
        className="flex items-center justify-between rounded-lg border p-4"
      >
        <div>
          <p className="font-semibold">
            {activity.guestName}
          </p>

          <p className="text-sm text-gray-600">
            Booking: {activity.bookingReference} • Room {activity.roomNumber}
          </p>
        </div>

        <div className="text-right">
          <p className="font-medium">
            {activity.status}
          </p>

          <p className="text-sm text-gray-500">
            {new Date(activity.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    ))
  )}
</div>

</div>

    </AdminLayout>
  );
}

export default Dashboard;