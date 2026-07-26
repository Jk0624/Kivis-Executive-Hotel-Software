import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  RoomStatus,
  BookingStatus,
} from '@prisma/client';
import {
  CreateRoomDto,
} from '../admin/dto/create-room.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateRoomDto } from '../admin/dto/update-room.dto';
import { NotificationService } from '../notifications/notification.service';
import { FilterGuestRoomsDto} from '../guest/dto/filter-guest-rooms.dto';
import { formatRoomType } from '../common/utils/room-type.util';
import { formatRoomStatus } from '../common/utils/room-status.util';


@Injectable()
export class RoomService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly cloudinaryService: CloudinaryService,
  private readonly notificationService: NotificationService,
) {}

// ==========================================
// GET ALL ROOMS
// ==========================================
async getAllRooms() {
  const rooms = await this.prisma.room.findMany({
    where: {
      status: {
        not: RoomStatus.MAINTENANCE,
      },
    },

    orderBy: {
      roomNo: 'asc',
    },

    select: {
      id: true,
      roomNo: true,
      type: true,
      price: true,
      status: true,
      amenities: true,
      photos: true,
    },
  });

  return {
    message: 'Rooms retrieved successfully.',
    rooms: rooms.map((room) => ({
      id: room.id,
      roomNo: room.roomNo,
      type: formatRoomType(room.type),
      price: room.price,
      status: formatRoomStatus(room.status),
      amenities: room.amenities,
      photo: room.photos[0] ?? null,
    })),
  };
}

// ==========================================
// GET ROOM FOR RECEPTION
// ==========================================
async getRoomForReception(
  roomId: string,
) {

  const room =
    await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
      select: {
        roomNo: true,
        type: true,
        price: true,
        description: true,
        amenities: true,
        status: true,
      },
    });

  if (!room) {
    throw new NotFoundException(
      'Room not found.',
    );
  }

  return {
    message:
      'Room retrieved successfully.',
    room: {
      ...room,
      type: formatRoomType(room.type),
      status: formatRoomStatus(room.status),
    },
  };
}

// ==========================================
// GET ROOM FOR ADMIN
// ==========================================
async getRoomForAdmin(
  roomId: string,
) {

  const room =
    await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
      select: {
        roomNo: true,
        type: true,
        description: true,
        amenities: true,
        photos: true,
        photoPublicIds: true,
        price: true,
        status: true,
      },
    });

  if (!room) {
    throw new NotFoundException(
      'Room not found.',
    );
  }

  return {
    message:
      'Room retrieved successfully.',
    room: {
      ...room,
      type: formatRoomType(room.type),
      status: formatRoomStatus(room.status),
    },
  };
}

// ==========================================
// UPLOAD ROOM IMAGES
// ==========================================
async uploadRoomImages(
  filePaths: string[],
) {

  const uploads =
    await this.cloudinaryService.uploadImages(
      filePaths,
    );

    return {
    message:
        'Room images uploaded successfully.',

    images: uploads.map(
        (image) => ({
        url: image.secure_url,
        publicId: image.public_id,
        }),
    ),
    };
}

// ==========================================
// CREATE ROOM
// ==========================================
async createRoom(
  createRoomDto: CreateRoomDto,
) {

  // ==========================================
  // CHECK ROOM NUMBER
  // ==========================================
  const existingRoom =
    await this.prisma.room.findUnique({
      where: {
        roomNo: createRoomDto.roomNo,
      },
    });

  if (existingRoom) {
    throw new BadRequestException( 
      'Room number already exists.',
    );
  }

  // ==========================================
  // CREATE ROOM
  // ==========================================
  const room =
    await this.prisma.room.create({
      data: {
        roomNo: createRoomDto.roomNo,
        type: createRoomDto.type,
        description:
          createRoomDto.description,
        amenities:
          createRoomDto.amenities,
        photos:
          createRoomDto.photos,
        photoPublicIds:
          createRoomDto.photoPublicIds,
        price:
          createRoomDto.price,
        status:
          RoomStatus.AVAILABLE,
      },
    });

  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================
  const notification =
    await this.notificationService.createNotification(
      'Room Created',
      `Room ${room.roomNo} has been created and is now available.`,
    );

  await this.notificationService.notifyAdmins(
    notification.id,
  );

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Room created successfully.',

    room,
  };
}

// ==========================================
// DELETE ROOM IMAGE
// ==========================================
async deleteRoomImage(
  publicId: string,
) {

  await this.cloudinaryService.deleteImage(
    publicId,
  );

  return {
    message:
      'Room image deleted successfully.',
  };
}

// ==========================================
// UPDATE ROOM
// ==========================================
async updateRoom(
  roomId: string,
  updateRoomDto: UpdateRoomDto,
) {

  // ==========================================
  // FIND ROOM
  // ==========================================
  const room =
    await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

  if (!room) {
    throw new NotFoundException(
      'Room not found.',
    );
  }

  // ==========================================
  // CHECK ROOM NUMBER
  // ==========================================
  if (
    updateRoomDto.roomNo &&
    updateRoomDto.roomNo !== room.roomNo
  ) {

    const existingRoom =
      await this.prisma.room.findUnique({
        where: {
          roomNo:
            updateRoomDto.roomNo,
        },
      });

    if (existingRoom) {
      throw new BadRequestException(
        'Room number already exists.',
      );
    }
  }

  // ==========================================
  // UPDATE ROOM
  // ==========================================
  const updatedRoom =
    await this.prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        roomNo:
          updateRoomDto.roomNo,
        type:
          updateRoomDto.type,
        description:
          updateRoomDto.description,
        amenities:
          updateRoomDto.amenities,
        photos:
          updateRoomDto.photos,
        photoPublicIds:
          updateRoomDto.photoPublicIds,
        price:
          updateRoomDto.price,
      },
    });

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================
    const notification =
      await this.notificationService.createNotification(
        'Room Updated',
        `Room ${updatedRoom.roomNo} has been updated.`,
      );

    await this.notificationService.notifyAdmins(
      notification.id,
    );

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Room updated successfully.',
    room: updatedRoom,
  };
}

// ==========================================
// FIND AVAILABLE ROOMS
// ==========================================
private async findAvailableRooms(
  query: FilterGuestRoomsDto,
) {
  const {
    checkIn,
    checkOut,
    roomType,
    maxPrice,
  } = query;

  // If no dates are provided, return all guest-visible rooms
if (!checkIn || !checkOut) {
  return this.prisma.room.findMany({
    where: {
      status: {
        not: RoomStatus.MAINTENANCE,
      },

      ...(roomType && {
        type: roomType,
      }),

      ...(maxPrice && {
        price: {
          lte: maxPrice,
        },
      }),
    },

    orderBy: {
      roomNo: 'asc',
    },

    select: {
      id: true,
      roomNo: true,
      type: true,
      price: true,
      status: true,
      amenities: true,
      photos: true,
    },
  });
}

  return this.prisma.room.findMany({
    where: {
      status: {
        not: RoomStatus.MAINTENANCE,
      },

      ...(roomType && {
        type: roomType,
      }),

      ...(maxPrice && {
        price: {
          lte: maxPrice,
        },
      }),

      bookings: {
        none: {
          status: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.PAID,
              BookingStatus.CHECKED_IN,
            ],
          },

          checkIn: {
            lt: new Date(checkOut),
          },

          checkOut: {
            gt: new Date(checkIn),
          },
        },
      },
    },

    orderBy: {
      roomNo: 'asc',
    },

    select: {
      id: true,
      roomNo: true,
      type: true,
      price: true,
      status: true,
      amenities: true,
      photos: true,
    },
  });
}

// ==========================================
//FILTER ROOMS FOR GUEST
// ==========================================
async filterRoomsForGuest(
  query: FilterGuestRoomsDto,
) {

  const {
    checkIn,
    checkOut,
  } = query;

  const rooms =
    await this.findAvailableRooms(
      query,
    );

  return {
    message:
      'Rooms retrieved successfully.',

    search: {
      checkIn,
      checkOut,
    },

    rooms: rooms.map((room) => ({
      id: room.id,
      roomNo: room.roomNo,
      type: formatRoomType(room.type),
      price: room.price,
      status: formatRoomStatus(room.status),
      amenities: room.amenities,
      photo: room.photos[0] ?? null,
    })),
  };
}

// ==========================================
// GET ROOM FOR GUEST
// ==========================================
async getRoomForGuest(
  roomId: string,
) {
  const room =
    await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
      select: {
        id: true,
        roomNo: true,
        type: true,
        price: true,
        status: true,
        description: true,
        amenities: true,
        photos: true,
      },
    });

  if (!room) {
    throw new NotFoundException(
      'Room not found.',
    );
  }

  return {
    message:
      'Room retrieved successfully.',
    room: {
      ...room,
      type: formatRoomType(room.type),
      status: formatRoomStatus(
        room.status,
      ),
    },
  };
}

}