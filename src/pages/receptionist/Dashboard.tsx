import ReceptionLayout from "../../layouts/ReceptionistLayout";
import TodayArrivals from "../../components/receptionist/TodayArrivals";
import { useEffect, useState } from "react";
import api from "../../services/api";

function Dashboard() {
  const [statistics, setStatistics] = useState<any | null>(null);
  useEffect(() => {
  const fetchStatistics = async () => {
    try {
      const response = await api.get("/reception/dashboard/statistics");
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error("Failed to fetch dashboard statistics:", error);
    }
  };

  fetchStatistics();
}, []);


  return (
    <ReceptionLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Reception Dashboard
      </h1>

      <p className="mt-3 text-gray-600">
        Welcome back! Here's today's hotel overview.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-gray-500">Today's Check-ins</h3>

          <p className="mt-2 text-3xl font-bold">
            {statistics?.checkedInToday ?? 0}
          </p>

        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-gray-500">Today's Check-outs</h3>

          <p className="mt-2 text-3xl font-bold">
            {statistics?.checkedOutToday ?? 0}
          </p>
        
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-gray-500">Available Rooms</h3>

          <p className="mt-2 text-3xl font-bold">
            {statistics?.availableRooms ?? 0}
          </p>

        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-gray-500">Total Rooms</h3>

          <p className="mt-2 text-3xl font-bold">
            {statistics?.totalRooms ?? 0}
          </p>

        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-gray-500">Total Bookings</h3>

          <p className="mt-2 text-3xl font-bold">
            {statistics?.totalBookings ?? 0}
          </p>
        </div>

      </div>
      <TodayArrivals />
    </ReceptionLayout>
  );
}

export default Dashboard;