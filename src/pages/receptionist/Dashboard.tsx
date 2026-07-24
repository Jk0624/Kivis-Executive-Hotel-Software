import ReceptionLayout from "../../layouts/ReceptionistLayout";
import DashboardStats from "../../components/receptionist/DashboardStats";
//import TodayArrivals from "../../components/receptionist/TodayArrivals";

import PendingCheckIns from "../../components/receptionist/PendingCheckIns";
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

        <p className="mt-2 text-slate-600">
          Welcome back! Here is today's overview.
        </p>
      

      <div className="mt-10">
        <DashboardStats statistics={statistics} />
      </div>

      <div className="mt-8">
        <PendingCheckIns />
      </div>
      
    </ReceptionLayout>
  );
}

export default Dashboard;