import { Bell } from "lucide-react";
import { useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

function ReceptionistHeader() {
    const [showNotifications, setShowNotifications] = useState(false);
  return (
    <header className="mb-8 flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-md">

      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Receptionist Portal
        </h2>
      </div>

      <div className="flex items-center gap-6">

        {/* Notification Bell */}

        <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 transition hover:bg-slate-100"
            >

          <Bell size={24} />

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            3
          </span>

        </button>
        {showNotifications && <NotificationDropdown />}

        {/* Receptionist */}

        <div className="text-right">

          <p className="font-semibold text-slate-900">
            Mary Ann
          </p>

          <p className="text-sm text-gray-500">
            Receptionist
          </p>

        </div>

      </div>

    </header>
  );
}

export default ReceptionistHeader;