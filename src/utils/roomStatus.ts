export interface RoomStatusStyle {
  label: string;
  badge: string;
  dot: string;
}

export function getRoomStatus(status: string): RoomStatusStyle {
  switch (status.toUpperCase()) {
    case "AVAILABLE":
      return {
        label: "Available",
        badge:
          "bg-emerald-50/90 text-emerald-700 border border-emerald-200",
        dot: "bg-emerald-500",
      };

    case "RESERVED":
      return {
        label: "Reserved",
        badge:
          "bg-blue-50/90 text-blue-700 border border-blue-200",
        dot: "bg-blue-500",
      };

    case "BOOKED":
      return {
        label: "Booked",
        badge:
          "bg-red-50/90 text-red-700 border border-red-200",
        dot: "bg-red-500",
      };

    case "OCCUPIED":
      return {
        label: "Occupied",
        badge:
          "bg-red-50/90 text-red-700 border border-red-200",
        dot: "bg-red-500",
      };

    case "MAINTENANCE":
      return {
        label: "Under Maintenance",
        badge:
          "bg-orange-50/90 text-orange-700 border border-orange-200",
        dot: "bg-orange-500",
      };

    default:
      return {
        label: status,
        badge:
          "bg-slate-100 text-slate-700 border border-slate-200",
        dot: "bg-slate-500",
      };
  }
}