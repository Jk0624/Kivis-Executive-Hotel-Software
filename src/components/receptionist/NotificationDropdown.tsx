function NotificationDropdown() {
  return (
    <div className="absolute right-0 top-14 z-50 w-96 rounded-xl bg-white shadow-xl border border-gray-200">

      <div className="border-b px-5 py-4">

        <h2 className="text-lg font-semibold text-slate-900">
          Notifications
        </h2>

      </div>

      <div className="max-h-96 overflow-y-auto">

        {/* Notification 1 */}

        <div className="border-b px-5 py-4 hover:bg-slate-50">

          <p className="font-medium text-slate-900">
            ✅ Guest Checked In
          </p>

          <p className="mt-1 text-sm text-gray-500">
            2 minutes ago
          </p>

        </div>

        {/* Notification 2 */}

        <div className="border-b px-5 py-4 hover:bg-slate-50">

          <p className="font-medium text-slate-900">
            ✅ Booking Extended Successfully
          </p>

          <p className="mt-1 text-sm text-gray-500">
            10 minutes ago
          </p>

        </div>

        {/* Notification 3 */}

        <div className="border-b px-5 py-4 hover:bg-slate-50">

          <p className="font-medium text-slate-900">
            ✅ RFID Registered
          </p>

          <p className="mt-1 text-sm text-gray-500">
            30 minutes ago
          </p>

        </div>

        {/* Notification 4 */}

        <div className="px-5 py-4 hover:bg-slate-50">

          <p className="font-medium text-slate-900">
            ✅ RFID Replaced
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Yesterday
          </p>

        </div>

      </div>

    </div>
  );
}

export default NotificationDropdown;