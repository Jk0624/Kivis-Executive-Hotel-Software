import { RoomType } from '@prisma/client';

export function formatRoomType(
  roomType: RoomType,
): string {
  switch (roomType) {
    case RoomType.STANDARD:
      return 'Standard';

    case RoomType.DELUXE:
      return 'Deluxe';

    case RoomType.EXECUTIVE:
      return 'Executive';

    case RoomType.SUITE:
      return 'Suite';

    default:
      return roomType;
  }
}