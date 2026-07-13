import ReceptionLayout from "../../layouts/ReceptionistLayout";
import TodayArrivals from "../../components/receptionist/TodayArrivals";

function Dashboard() {
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
          <p className="mt-2 text-3xl font-bold">12</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-gray-500">Today's Check-outs</h3>
          <p className="mt-2 text-3xl font-bold">8</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-gray-500">Available Rooms</h3>
          <p className="mt-2 text-3xl font-bold">24</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-gray-500">Occupied Rooms</h3>
          <p className="mt-2 text-3xl font-bold">36</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="text-gray-500">Pending Bookings</h3>
          <p className="mt-2 text-3xl font-bold">5</p>
        </div>

      </div>
      <TodayArrivals />
    </ReceptionLayout>
  );
}

export default Dashboard;