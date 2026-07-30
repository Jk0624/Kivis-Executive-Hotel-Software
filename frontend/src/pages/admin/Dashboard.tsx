import AdminLayout from "../../layouts/AdminLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import {
  BedDouble,
  CalendarDays,
  Smartphone,
  Users,
  UserCog,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] =
    useState<any | null>(null);

  const [header, setHeader] =
    useState<any | null>(null);

  const [recentActivity, setRecentActivity] =
    useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const response = await api.get(
          "/admin/dashboard/summary"
        );

        setSummary(response.data);
      } catch (error) {
        console.error(
          "Failed to fetch dashboard summary:",
          error
        );
      }
    };

    fetchDashboardSummary();
  }, []);

  useEffect(() => {
    const fetchDashboardHeader = async () => {
      try {
        const response = await api.get(
          "/admin/dashboard/header"
        );

        setHeader(response.data.user);
      } catch (error) {
        console.error(
          "Failed to fetch dashboard header:",
          error
        );
      }
    };

    fetchDashboardHeader();
  }, []);

  useEffect(() => {
    const fetchRecentActivity =
      async () => {
        try {
          const response = await api.get(
            "/admin/dashboard/recent-activity"
          );

          setRecentActivity(response.data);
        } catch (error) {
          console.error(
            "Failed to fetch recent activity:",
            error
          );
        }
      };

    fetchRecentActivity();
  }, []);

  const statCards = [
    {
      title: "Rooms",
      value: summary?.totalRooms ?? 0,
      icon: BedDouble,
      color: "bg-blue-50 text-blue-700",
      subtitle: "Total rooms",
    },
    {
      title: "Bookings",
      value: summary?.totalBookings ?? 0,
      icon: CalendarDays,
      color: "bg-emerald-50 text-emerald-700",
      subtitle: "Reservations",
    },
    {
      title: "Guests",
      value: summary?.totalGuests ?? 0,
      icon: Users,
      color: "bg-amber-50 text-amber-700",
      subtitle: "Registered guests",
    },
    {
      title: "Receptionists",
      value:
        summary?.totalReceptionists ?? 0,
      icon: UserCog,
      color: "bg-purple-50 text-purple-700",
      subtitle: "Staff accounts",
    },
    {
      title: "Access Devices",
      value: summary?.totalDevices ?? 0,
      icon: Smartphone,
      color: "bg-slate-100 text-slate-700",
      subtitle: "ESP32 devices",
    },
  ];

  return (
    <AdminLayout>

      {/* Welcome */}

<section>

  <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
    Welcome Back
  </h1>

  <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
    KIVIZ Executive Lodge Administration Dashboard
  </p>

</section>
      {/* Statistics */}

      <section className="mt-8 sm:mt-10">

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">

          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >

<div className="flex items-center justify-between">

  <h2 className="text-4xl font-bold text-slate-900">
    {card.value}
  </h2>

  <div
    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${card.color}`}
  >
    <Icon size={26} />
  </div>

</div>
                <p className="mt-6 text-sm text-slate-500">

                  {card.subtitle}

                </p>

              </div>
            );
          })}

        </div>

      </section>

            {/* Quick Actions */}

      <section className="mt-8 sm:mt-10">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-semibold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Frequently used administrative tasks.
            </p>

          </div>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          <button
  onClick={() => navigate("/admin/receptionists?create=true")}
  className="rounded-2xl bg-blue-700 p-8 text-left text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-lg"
>
  <h3 className="text-lg font-semibold">
    Add Receptionist
  </h3>

  <p className="mt-2 text-sm text-blue-100">
    Register a new receptionist account.
  </p>
</button>

          <button
          
onClick={() => navigate("/admin/access-devices?create=true")}
  className="rounded-2xl bg-emerald-700 p-8 text-left text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-800 hover:shadow-lg"
>
  <h3 className="text-lg font-semibold">
    Register ESP32 Device
  </h3>

  <p className="mt-2 text-sm text-emerald-100">
    Connect a new smart access device.
  </p>
</button>

          <button
  onClick={() => navigate("/admin/security-audit")}
  className="rounded-2xl bg-slate-800 p-8 text-left text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:shadow-lg"
>
  <h3 className="text-lg font-semibold">
    View Reports
  </h3>

  <p className="mt-2 text-sm text-slate-300">
    Review system activity and access logs.
  </p>
</button>

        </div>

      </section>

      {/* Recent Activity */}

      <section className="mt-8 sm:mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

          <h2 className="text-2xl font-semibold text-slate-900">
            Recent System Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest booking and room activity.
          </p>

        </div>

        <div className="divide-y divide-slate-100">

          {recentActivity.length === 0 ? (

            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">

              <p className="text-lg font-semibold text-slate-700">
                No recent activity
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Activity will appear here once staff begin using the system.
              </p>

            </div>

          ) : (

            recentActivity.map((activity) => (

              <div
                key={activity.bookingReference}
                className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >

                <div className="min-w-0">

                  <p className="truncate font-semibold text-slate-900">

                    {activity.guestName}

                  </p>

                  <p className="mt-1 break-all text-sm text-slate-500">

                    Booking: {activity.bookingReference}

                  </p>

                  <p className="mt-1 text-sm text-slate-500">

                    Room {activity.roomNumber}

                  </p>

                </div>

                <div className="sm:text-right">

                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">

                    {activity.status}

                  </span>

                  <p className="mt-2 text-sm text-slate-500">

                    {new Date(
                      activity.updatedAt
                    ).toLocaleString()}

                  </p>

                </div>

              </div>

            ))

          )}

        </div>

      </section>

    </AdminLayout>
  );
}

export default Dashboard;