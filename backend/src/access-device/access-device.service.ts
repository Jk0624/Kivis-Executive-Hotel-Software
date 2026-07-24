import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterAccessDeviceDto } from './dto/register-access-device.dto';
import { generateApiKey } from './utils/generate-api-key.util';
import { UpdateAccessDeviceDto } from './dto/update-access-device.dto';
import { TestAccessDeviceDto } from './dto/test-access-device.dto';
import { NotificationService } from '../notifications/notification.service';


@Injectable()
export class AccessDeviceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // ==========================================
  // FIND ROOM BY NUMBER
  // ==========================================
  private async findRoomByNumber(
    roomNo: string,
  ) {
    const room =
      await this.prisma.room.findUnique({
        where: {
          roomNo,
        },
      });

    if (!room) {
      throw new NotFoundException(
        'Room not found.',
      );
    }

    return room;
  }

  // ==========================================
  // VALIDATE ACCESS DEVICE
  // ==========================================
  private async validateAccessDevice(
    roomId: string,
    deviceId: string,
  ) {
    const existingRoomDevice =
      await this.prisma.accessDevice.findUnique({
        where: {
          roomId,
        },
      });

    if (existingRoomDevice) {
      throw new BadRequestException(
        'This room already has an access device. Use the update feature to update it',
      );
    }

    const existingDevice =
      await this.prisma.accessDevice.findUnique({
        where: {
          deviceId,
        },
      });

    if (existingDevice) {
      throw new BadRequestException(
        'This device has already been registered.',
      );
    }
  }

  // ==========================================
// REGISTER ACCESS DEVICE
// ==========================================
async registerAccessDevice(
  registerAccessDeviceDto: RegisterAccessDeviceDto,
) {
  // ==========================================
  // FIND ROOM
  // ==========================================
  const room =
    await this.findRoomByNumber(
      registerAccessDeviceDto.roomNo,
    );

  // ==========================================
  // VALIDATE ACCESS DEVICE
  // ==========================================
  await this.validateAccessDevice(
    room.id,
    registerAccessDeviceDto.deviceId,
  );

  // ==========================================
  // GENERATE API KEY
  // ==========================================
  const apiKey = generateApiKey();

  // ==========================================
  // CREATE ACCESS DEVICE
  // ==========================================
  const accessDevice =
    await this.prisma.accessDevice.create({
      data: {
        deviceId:
          registerAccessDeviceDto.deviceId,
        apiKey,
        roomId: room.id,
      },
    });

  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================
  const notification =
    await this.notificationService.createNotification(
      'Access Device Registered',
      `Access device ${accessDevice.deviceId} has been registered for room ${registerAccessDeviceDto.roomNo}.`,
    );

  await this.notificationService.notifyAdmins(
    notification.id,
  );

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Access device registered successfully.',
    apiKey,
    accessDevice,
  };
}

// ==========================================
// GET ALL ACCESS DEVICES
// ==========================================
async getAllAccessDevices() {
const accessDevices =
  await this.prisma.accessDevice.findMany({
    select: {
      id: true,
      deviceId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      room: {
        select: {
          roomNo: true,
          type: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    message:
      'Access devices retrieved successfully.',
    accessDevices,
  };
}

// ==========================================
// GET ACCESS DEVICE
// ==========================================
async getAccessDevice(
  id: string,
) {
  const accessDevice =
    await this.prisma.accessDevice.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        deviceId: true,
        apiKey: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        room: {
          select: {
            roomNo: true,
            type: true,
            status: true,
          },
        },
      },
    });

  if (!accessDevice) {
    throw new NotFoundException(
      'Access device not found.',
    );
  }

  return {
    message:
      'Access device retrieved successfully.',
    accessDevice,
  };
}

// ==========================================
// UPDATE ACCESS DEVICE
// ==========================================
async updateAccessDevice(
  id: string,
  updateAccessDeviceDto: UpdateAccessDeviceDto,
) {
  // ==========================================
  // FIND ACCESS DEVICE
  // ==========================================
  const accessDevice =
    await this.prisma.accessDevice.findUnique({
      where: {
        id,
      },
    });

  if (!accessDevice) {
    throw new NotFoundException(
      'Access device not found.',
    );
  }

// ==========================================
// BUILD UPDATE DATA
// ==========================================
const updateData: {
  deviceId?: string;
  roomId?: string;
} = {};

// ==========================================
// UPDATE DEVICE ID
// ==========================================
if (updateAccessDeviceDto.deviceId) {
  const existingDevice =
    await this.prisma.accessDevice.findFirst({
      where: {
        deviceId:
          updateAccessDeviceDto.deviceId,
        NOT: {
          id,
        },
      },
    });

  if (existingDevice) {
    throw new BadRequestException(
      'Device ID is already in use.',
    );
  }

  updateData.deviceId =
    updateAccessDeviceDto.deviceId;
}

// ==========================================
// UPDATE ROOM
// ==========================================
if (updateAccessDeviceDto.roomNo) {
  const room =
    await this.findRoomByNumber(
      updateAccessDeviceDto.roomNo,
    );

  const roomAlreadyAssigned =
    await this.prisma.accessDevice.findFirst({
      where: {
        roomId: room.id,
        NOT: {
          id,
        },
      },
    });

  if (roomAlreadyAssigned) {
    throw new BadRequestException(
      'Another access device is already assigned to this room.',
    );
  }

  updateData.roomId = room.id;
}

  // ==========================================
  // SAVE CHANGES
  // ==========================================
  const updatedAccessDevice =
    await this.prisma.accessDevice.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        room: true,
      },
    });

  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================
  const notification =
    await this.notificationService.createNotification(
      'Access Device Updated',
      `Access device ${updatedAccessDevice.deviceId} has been updated.`,
    );

  await this.notificationService.notifyAdmins(
    notification.id,
  );

  return {
    message:
      'Access device updated successfully.',
    accessDevice: updatedAccessDevice,
  };
}

// ==========================================
// DISABLE ACCESS DEVICE
// ==========================================
async disableAccessDevice(
  id: string,
) {

  // ==========================================
  // FIND ACCESS DEVICE
  // ==========================================
  const accessDevice =
    await this.prisma.accessDevice.findUnique({
      where: {
        id,
      },
    });

  if (!accessDevice) {
    throw new NotFoundException(
      'Access device not found.',
    );
  }

  // ==========================================
  // ALREADY DISABLED
  // ==========================================
  if (!accessDevice.isActive) {
    throw new BadRequestException(
      'Access device is already disabled.',
    );
  }

  // ==========================================
  // DISABLE DEVICE
  // ==========================================
  const updatedAccessDevice =
  await this.prisma.accessDevice.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });

  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================
  const notification =
    await this.notificationService.createNotification(
      'Access Device Disabled',
      `Access device ${updatedAccessDevice.deviceId} has been disabled.`,
    );

  await this.notificationService.notifyAdmins(
    notification.id,
  );

  return {
    message:
      'Access device disabled successfully.',
  };
}

// ==========================================
// ENABLE ACCESS DEVICE
// ==========================================
async enableAccessDevice(
  id: string,
) {

  // ==========================================
  // FIND ACCESS DEVICE
  // ==========================================
  const accessDevice =
    await this.prisma.accessDevice.findUnique({
      where: {
        id,
      },
    });

  if (!accessDevice) {
    throw new NotFoundException(
      'Access device not found.',
    );
  }

  // ==========================================
  // ALREADY ENABLED
  // ==========================================
  if (accessDevice.isActive) {
    throw new BadRequestException(
      'Access device is already enabled.',
    );
  }

  // ==========================================
  // ENABLE DEVICE
  // ==========================================
  const updatedAccessDevice =
  await this.prisma.accessDevice.update({
    where: {
      id,
    },
    data: {
      isActive: true,
    },
  });

  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================
  const notification =
    await this.notificationService.createNotification(
      'Access Device Enabled',
      `Access device ${updatedAccessDevice.deviceId} has been enabled.`,
    );

  await this.notificationService.notifyAdmins(
    notification.id,
  );

  return {
    message:
      'Access device enabled successfully.',
  };
}

// ==========================================
// DELETE ACCESS DEVICE
// ==========================================
async deleteAccessDevice(
  id: string,
) {

  // ==========================================
  // FIND ACCESS DEVICE
  // ==========================================
  const accessDevice =
    await this.prisma.accessDevice.findUnique({
      where: {
        id,
      },
    });

  if (!accessDevice) {
    throw new NotFoundException(
      'Access device not found.',
    );
  }

  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================
  const notification =
    await this.notificationService.createNotification(
      'Access Device Deleted',
      `Access device ${accessDevice.deviceId} has been deleted.`,
    );

  await this.notificationService.notifyAdmins(
    notification.id,
  );

  // ==========================================
  // DELETE ACCESS DEVICE
  // ==========================================
  await this.prisma.accessDevice.delete({
    where: {
      id,
    },
  });

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Access device deleted successfully.',
  };
}

// ==========================================
// TEST ACCESS DEVICE
// ==========================================
async testAccessDevice(
  testAccessDeviceDto: TestAccessDeviceDto,
) {

  // ==========================================
  // FIND ACCESS DEVICE
  // ==========================================
  const accessDevice =
    await this.prisma.accessDevice.findUnique({
      where: {
        deviceId: testAccessDeviceDto.deviceId,
      },
      include: {
        room: true,
      },
    });

  if (!accessDevice) {
    throw new NotFoundException(
      'Access device not found.',
    );
  }

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    connected: true,
    message:
      'Access device authenticated successfully.',
    device: {
      deviceId: accessDevice.deviceId,
      roomNo: accessDevice.room.roomNo,
      roomType: accessDevice.room.type,
    },
  };
}

}