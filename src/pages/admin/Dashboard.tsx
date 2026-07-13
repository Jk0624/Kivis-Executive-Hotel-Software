import AdminLayout from "../../layouts/AdminLayout";

function Dashboard() {
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Welcome Back,
      </h1>

      <h2 className="mt-2 text-2xl font-semibold text-blue-700">
        OWN001
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
        25
        </p>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">
        Bookings
        </h3>

        <p className="mt-4 text-4xl font-bold text-blue-700">
        120
        </p>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">
        Guests
        </h3>

        <p className="mt-4 text-4xl font-bold text-blue-700">
        78
        </p>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">
        Receptionists
        </h3>

        <p className="mt-4 text-4xl font-bold text-blue-700">
        4
        </p>

    </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">
            Access Devices
            </h3>

            <p className="mt-4 text-4xl font-bold text-blue-700">
            25
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

  <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">

    <p className="text-lg text-gray-500">
      Coming Soon
    </p>

  </div>

</div>

    </AdminLayout>
  );
}

export default Dashboard;