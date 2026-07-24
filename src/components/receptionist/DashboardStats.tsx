import {
  BedDouble,
  ClipboardList,
  DoorOpen,
  LogOut,
  Hotel,
} from "lucide-react";

interface DashboardStatsProps {
  statistics: {
    checkedInToday: number;
    checkedOutToday: number;
    availableRooms: number;
    totalRooms: number;
    totalBookings: number;
  } | null;
}

const stats = [
  {
    title: "Today's Check-ins",
    key: "checkedInToday",
    icon: DoorOpen,
    color: "bg-blue-50 text-blue-700",
    subtitle: "Guests arriving today",
  },
  {
    title: "Today's Check-outs",
    key: "checkedOutToday",
    icon: LogOut,
    color: "bg-rose-50 text-rose-700",
    subtitle: "Departures today",
  },
  {
    title: "Available Rooms",
    key: "availableRooms",
    icon: BedDouble,
    color: "bg-emerald-50 text-emerald-700",
    subtitle: "Ready for booking",
  },
  {
    title: "Occupied Rooms",
    key: "occupiedRooms",
    icon: Hotel,
    color: "bg-slate-100 text-slate-700",
    subtitle: "Currently occupied",
  },
  {
    title: "Total Bookings",
    key: "totalBookings",
    icon: ClipboardList,
    color: "bg-amber-50 text-amber-700",
    subtitle: "All reservations",
  },
];

export default function DashboardStats({
  statistics,
}: DashboardStatsProps) {
  const occupiedRooms =
    (statistics?.totalRooms ?? 0) -
    (statistics?.availableRooms ?? 0);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {stats.map((card) => {
        const Icon = card.icon;

        const value =
          card.key === "occupiedRooms"
            ? occupiedRooms
            : statistics?.[
                card.key as keyof typeof statistics
              ] ?? 0;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
                </p>

                <h2 className="mt-4 text-4xl font-bold text-slate-900">
                  {value}
                </h2>

                
              </div>

              <div
                className={`ml-2 rounded-lg p-2 ${card.color}`}
                >
                <Icon size={18} />
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}