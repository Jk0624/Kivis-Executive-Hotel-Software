import { Bell, CalendarDays, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import NotificationDropdown from "../common/NotificationDropdown";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

type AdminHeaderProps = {
  onMenuClick: () => void;
};

function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRecentNotifications() {
      try {
        const response = await api.get(
          "/notifications/admin/recent"
        );

        setNotifications(
          response.data.notifications
        );
      } catch (error) {
        console.error(
          "Failed to fetch notifications:",
          error
        );
      }
    }

    fetchRecentNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const today = useMemo(() => {
    return new Date().toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }, []);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const firstName =
    user.name?.split(" ")[0] ||
    "Administrator";

  const initials =
    user.name
      ?.split(" ")
      .map((name: string) =>
        name.charAt(0)
      )
      .join("")
      .substring(0, 2)
      .toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">

      <div className="flex items-center justify-between">

        {/* Left */}

        <div className="flex items-center gap-3">

          {/* Mobile Menu */}

          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 transition hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <CalendarDays
            size={22}
            className="text-blue-700"
          />

          <div className="hidden sm:block">

            <p className="text-xs uppercase tracking-widest text-slate-500">
              Today
            </p>

            <p className="text-base font-semibold text-slate-900">
              {today}
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-4 sm:gap-6">

          {/* Notifications */}

          <div
            ref={notificationRef}
            className="relative"
          >

            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
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
                onClose={() =>
                  setShowNotifications(false)
                }
              />
            )}

          </div>

          {/* Divider */}

          <div className="hidden sm:block h-10 w-px bg-slate-200" />

          {/* User */}

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 font-semibold text-white">

              {initials}

            </div>

            <div className="hidden md:block">

              <p className="font-semibold text-slate-900">
                Hi, {firstName}
              </p>

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <p className="text-sm text-slate-500">
                  Administrator
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}

export default AdminHeader;