import ReceptionistLayout from "../../layouts/ReceptionistLayout";

function Notifications() {
  return (
    <ReceptionistLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Notifications
      </h1>

      <p className="mt-3 text-gray-600">
        View all system notifications.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Notification History
        </h2>

        <div className="space-y-4">

          <div className="rounded-lg border p-4">
            <p className="font-semibold">✅ Guest Checked In</p>
            <p className="text-sm text-gray-500">
              12 July 2026 • 10:30 AM
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-semibold">
              ✅ Booking Extended Successfully
            </p>
            <p className="text-sm text-gray-500">
              12 July 2026 • 10:15 AM
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-semibold">
              ✅ RFID Registered
            </p>
            <p className="text-sm text-gray-500">
              12 July 2026 • 09:45 AM
            </p>
          </div>

        </div>

      </div>

    </ReceptionistLayout>
  );
}

export default Notifications;