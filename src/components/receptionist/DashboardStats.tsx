import {
  BedDouble,
  ClipboardList,
  DoorOpen,
  Hotel,
  LogOut,
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">

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
            className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">

              <div className="pr-3">

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                  {value}
                </h2>

              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
              >
                <Icon size={22} />
              </div>

            </div>

            <p className="mt-6 text-sm text-slate-500">
              {card.subtitle}
            </p>

          </div>
        );
      })}
    </div>
  );
}