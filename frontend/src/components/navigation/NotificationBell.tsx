import { Bell } from "lucide-react";

interface NotificationBellProps {
  unreadCount?: number;
}

export default function NotificationBell({
  unreadCount = 0,
}: NotificationBellProps) {
  return (
    <button className="relative rounded-full p-2 transition hover:bg-gray-100">
      <Bell className="h-6 w-6 text-slate-700" />

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}