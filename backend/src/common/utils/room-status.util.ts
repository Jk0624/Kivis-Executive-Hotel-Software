import { RoomStatus } from '@prisma/client';

export function formatRoomStatus(
  roomStatus: RoomStatus,
): string {
  switch (roomStatus) {
    case RoomStatus.AVAILABLE:
      return 'Available';

    case RoomStatus.BOOKED:
      return 'Booked';

    case RoomStatus.RESERVED:
      return 'Reserved';

    case RoomStatus.OCCUPIED:
      return 'Occupied';

    case RoomStatus.MAINTENANCE:
      return 'Under Maintenance';

    default:
      return roomStatus;
  }
}