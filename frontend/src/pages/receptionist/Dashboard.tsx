import { useEffect, useState } from "react";

import ReceptionLayout from "../../layouts/ReceptionistLayout";
import DashboardStats from "../../components/receptionist/DashboardStats";
import PendingCheckIns from "../../components/receptionist/PendingCheckIns";
import api from "../../services/api";

function Dashboard() {
  const [statistics, setStatistics] =
    useState<any | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get(
          "/reception/dashboard/statistics"
        );

        setStatistics(
          response.data.statistics
        );
      } catch (error) {
        console.error(
          "Failed to fetch dashboard statistics:",
          error
        );
      }
    };

    fetchStatistics();
  }, []);

  return (
    <ReceptionLayout>

      <section>

        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Reception Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Welcome back! Here is today's overview.
        </p>

      </section>

      <section className="mt-6 sm:mt-8 lg:mt-10">

        <DashboardStats
          statistics={statistics}
        />

      </section>

      <section className="mt-6 sm:mt-8">

        <PendingCheckIns />

      </section>

    </ReceptionLayout>
  );
}

export default Dashboard;