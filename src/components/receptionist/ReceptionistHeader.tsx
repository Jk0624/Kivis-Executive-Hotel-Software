import { Bell, CalendarDays } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
//import { useLocation } from "react-router-dom";
import api from "../../services/api";
import NotificationDropdown from "./NotificationDropdown";

function ReceptionistHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notificationRef = useRef<HTMLDivElement>(null);

  //const location = useLocation();

  useEffect(() => {
    async function fetchRecentNotifications() {
      try {
        const response = await api.get("/notifications/reception/recent");
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }

    fetchRecentNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pageInfo: Record<
    string,
    {
      title: string;
      subtitle: string;
    }
  > = {
    "/receptionist/dashboard": {
      title: "Dashboard",
      subtitle: "Monitor bookings, guests and hotel operations.",
    },

    "/receptionist/bookings": {
      title: "Bookings",
      subtitle: "Manage all guest reservations.",
    },

    "/receptionist/walkin": {
      title: "Walk-in Booking",
      subtitle: "Register guests arriving without reservations.",
    },

    "/receptionist/checkin": {
      title: "Guest Check-In",
      subtitle: "Check guests into their assigned rooms.",
    },

    "/receptionist/checkout": {
      title: "Guest Check-Out",
      subtitle: "Complete departures and finalize stays.",
    },

    "/receptionist/booking-extension": {
      title: "Booking Extension",
      subtitle: "Extend existing reservations.",
    },

    "/receptionist/rooms": {
      title: "Room Management",
      subtitle: "Monitor room availability and occupancy.",
    },

    "/receptionist/guests": {
      title: "Guest Management",
      subtitle: "Manage guest information and profiles.",
    },

    "/receptionist/notifications": {
      title: "Notifications",
      subtitle: "View hotel alerts and updates.",
    },
  };

  //const page =
   // pageInfo[location.pathname] || {
     // title: "Reception Portal",
      //subtitle: "Hotel Operations",
    //};

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const firstName =
  user.name?.split(" ")[0] || "Receptionist";

  
  return (
    

      <header className="sticky top-0 z-40 mb-6 rounded-2xl border border-slate-200 bg-white px-8 py-5 shadow-sm">

  <div className="flex items-center justify-between">

    {/* LEFT */}

    <div className="flex items-center gap-3">

      <CalendarDays
        size={22}
        className="text-blue-700"
      />

      <div>

        <p className="text-xs uppercase tracking-widest text-slate-500">
          Today
        </p>

        <p className="text-base font-semibold text-slate-900">
          {today}
        </p>

      </div>

    </div>

    {/* RIGHT */}

    <div className="flex items-center gap-6">

      {/* Notification */}

      <div
        ref={notificationRef}
        className="relative"
      >
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 transition hover:text-blue-700"
        >
          <Bell
            size={22}
            className="text-slate-700"
          />

          {notifications.length > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
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

      {/* Divider */}

      <div className="h-10 w-px bg-slate-200" />

      {/* User */}

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 font-semibold text-white">
          M
        </div>

        <div>

          <p className="font-semibold text-slate-900">
            Hi, {firstName}
          </p>

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full rounded-full bg-emerald-500" />

            <p className="text-sm text-slate-500">
              Receptionist
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>
</header>
  );
}

export default ReceptionistHeader;