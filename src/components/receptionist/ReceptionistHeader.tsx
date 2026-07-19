import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import NotificationDropdown from "./NotificationDropdown";

function ReceptionistHeader() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const fetchRecentNotifications = async () => {
        try {
          const response = await api.get("/notifications/reception/recent");
          setNotifications(response.data.notifications);
        } catch (error) {
          console.error("Failed to fetch recent notifications:", error);
        }
      };

      fetchRecentNotifications();
    }, []);

    useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target as Node)
    ) {
      setShowNotifications(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <header className="mb-8 flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-md">

      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Receptionist Portal
        </h2>
      </div>

      <div className="flex items-center gap-6">

        {/* Notification Bell */}

        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 transition hover:bg-slate-100"
          >
            <Bell size={24} />

            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

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