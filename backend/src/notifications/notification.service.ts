import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================
  async createNotification(
    title: string,
    message: string,
    bookingId?: string,
  ) {
    return this.prisma.notification.create({
      data: {
        title,
        message,
        bookingId,
      },
    });
  }

  // ==========================================
  // NOTIFY ALL ACTIVE RECEPTIONISTS
  // ==========================================
  async notifyReceptionists(
    notificationId: string,
  ): Promise<void> {
    const receptionists =
      await this.prisma.user.findMany({
        where: {
          role: 'RECEPTIONIST',
          isActive: true,
        },
        select: {
          id: true,
        },
      });

    if (receptionists.length === 0) {
      return;
    }

    await this.prisma.receptionistNotification.createMany({
      data: receptionists.map(
        (receptionist) => ({
          notificationId,
          receptionistId:
            receptionist.id,
        }),
      ),
    });
  }

  // ==========================================
  // GET ALL RECEPTIONIST NOTIFICATIONS
  // ==========================================
  async getReceptionNotifications(
    receptionistId: string,
  ) {
    const notifications =
      await this.prisma.receptionistNotification.findMany({
        where: {
          receptionistId,
          hiddenAt: null,
        },
        orderBy: {
          notification: {
            createdAt: 'desc',
          },
        },
        select: {
          notification: {
            select: {
              id: true,
              title: true,
              message: true,
              createdAt: true,
            },
          },
        },
      });

    await this.prisma.receptionistNotification.updateMany({
      where: {
        receptionistId,
        hiddenAt: null,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    const formattedNotifications = notifications.map(
    (item) => item.notification,
    );

    return {
    message:
        formattedNotifications.length > 0
        ? 'Notifications retrieved successfully.'
        : 'No notifications available.',
    notifications: formattedNotifications,
    };
  }

// ==========================================
// GET RECENT RECEPTIONIST NOTIFICATIONS
// ==========================================
async getRecentReceptionNotifications(
  receptionistId: string,
) {
  const notifications =
    await this.prisma.receptionistNotification.findMany({
      where: {
        receptionistId,
        hiddenAt: null,
      },
      orderBy: {
        notification: {
          createdAt: 'desc',
        },
      },
      take: 5,
      select: {
        id: true,
        readAt: true,
        notification: {
          select: {
            id: true,
            title: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });

  const unreadNotificationIds = notifications
    .filter((item) => item.readAt === null)
    .map((item) => item.id);

  if (unreadNotificationIds.length > 0) {
    await this.prisma.receptionistNotification.updateMany({
      where: {
        id: {
          in: unreadNotificationIds,
        },
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  return {
    message:
      notifications.length > 0
        ? 'Recent notifications retrieved successfully.'
        : 'No recent notifications available.',
    notifications: notifications.map((item) => ({
      ...item.notification,
      isRead: true,
    })),
  };
}

    // ==========================================
    // HIDE A RECEPTIONIST NOTIFICATION
    // ==========================================
    async hideNotification(
        notificationId: string,
        receptionistId: string,
    ) {
        const notification =
        await this.prisma.receptionistNotification.findFirst({
            where: {
            notificationId,
            receptionistId,
            hiddenAt: null,
            },
        });

        if (!notification) {
        throw new NotFoundException(
            'Notification not found.',
        );
        }

        await this.prisma.receptionistNotification.update({
        where: {
            id: notification.id,
        },
        data: {
            hiddenAt: new Date(),
        },
        });

        return {
        message: 'Notification hidden successfully.',
        };
    }

    
  // ==========================================
  // NOTIFY ALL ACTIVE ADMINS
  // ==========================================
  async notifyAdmins(
    notificationId: string,
  ): Promise<void> {
    const admins =
      await this.prisma.user.findMany({
        where: {
          role: 'ADMIN',
          isActive: true,
        },
        select: {
          id: true,
        },
      });

    if (admins.length === 0) {
      return;
    }

    await this.prisma.adminNotification.createMany({
      data: admins.map((admin) => ({
        notificationId,
        adminId: admin.id,
      })),
    });
  }

  // ==========================================
  // GET ALL ADMIN NOTIFICATIONS
  // ==========================================
  async getAdminNotifications(
    adminId: string,
  ) {
    const notifications =
      await this.prisma.adminNotification.findMany({
        where: {
          adminId,
          hiddenAt: null,
        },
        orderBy: {
          notification: {
            createdAt: 'desc',
          },
        },
        select: {
          notification: {
            select: {
              id: true,
              title: true,
              message: true,
              createdAt: true,
            },
          },
        },
      });

    await this.prisma.adminNotification.updateMany({
      where: {
        adminId,
        hiddenAt: null,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    const formattedNotifications =
      notifications.map(
        (item) => item.notification,
      );

    return {
      message:
        formattedNotifications.length > 0
          ? 'Notifications retrieved successfully.'
          : 'No notifications available.',
      notifications: formattedNotifications,
    };
  }

// ==========================================
// GET RECENT ADMIN NOTIFICATIONS
// ==========================================
async getRecentAdminNotifications(
  adminId: string,
) {
  const notifications =
    await this.prisma.adminNotification.findMany({
      where: {
        adminId,
        hiddenAt: null,
      },
      orderBy: {
        notification: {
          createdAt: 'desc',
        },
      },
      take: 5,
      select: {
        id: true,
        readAt: true,
        notification: {
          select: {
            id: true,
            title: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });

  const unreadNotificationIds = notifications
    .filter((item) => item.readAt === null)
    .map((item) => item.id);

  if (unreadNotificationIds.length > 0) {
    await this.prisma.adminNotification.updateMany({
      where: {
        id: {
          in: unreadNotificationIds,
        },
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  return {
    message:
      notifications.length > 0
        ? 'Recent notifications retrieved successfully.'
        : 'No recent notifications available.',
    notifications: notifications.map((item) => ({
      ...item.notification,
      isRead: true,
    })),
  };
}

  // ==========================================
  // HIDE AN ADMIN NOTIFICATION
  // ==========================================
  async hideAdminNotification(
    notificationId: string,
    adminId: string,
  ) {
    const notification =
      await this.prisma.adminNotification.findFirst({
        where: {
          notificationId,
          adminId,
          hiddenAt: null,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found.',
      );
    }

    await this.prisma.adminNotification.update({
      where: {
        id: notification.id,
      },
      data: {
        hiddenAt: new Date(),
      },
    });

    return {
      message: 'Notification hidden successfully.',
    };
  }

  // ==========================================
// NOTIFY A GUEST
// ==========================================
async notifyGuest(
  notificationId: string,
  guestId: string,
): Promise<void> {
  const guest = await this.prisma.user.findFirst({
    where: {
      id: guestId,
      role: 'GUEST',
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!guest) {
    return;
  }

  await this.prisma.guestNotification.create({
    data: {
      notificationId,
      guestId: guest.id,
    },
  });
}

// ==========================================
// GET ALL GUEST NOTIFICATIONS
// ==========================================
async getGuestNotifications(
  user: AuthenticatedUser,
) {
  const notifications =
    await this.prisma.guestNotification.findMany({
      where: {
        guestId: user.id,
        hiddenAt: null,
      },
      orderBy: {
        notification: {
          createdAt: 'desc',
        },
      },
      select: {
        notification: {
          select: {
            id: true,
            title: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });

  await this.prisma.guestNotification.updateMany({
    where: {
      guestId: user.id,
      hiddenAt: null,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  const formattedNotifications =
    notifications.map(
      (item) => item.notification,
    );

  return {
    message:
      formattedNotifications.length > 0
        ? 'Notifications retrieved successfully.'
        : 'No notifications available.',
    notifications: formattedNotifications,
  };
}

// ==========================================
// GET RECENT GUEST NOTIFICATIONS
// ==========================================
async getRecentGuestNotifications(
  user: AuthenticatedUser,
) {
  const notifications =
    await this.prisma.guestNotification.findMany({
      where: {
        guestId: user.id,
        hiddenAt: null,
      },
      orderBy: {
        notification: {
          createdAt: 'desc',
        },
      },
      take: 5,
      select: {
        id: true,
        readAt: true,
        notification: {
          select: {
            id: true,
            title: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });

  const unreadNotificationIds = notifications
    .filter((item) => item.readAt === null)
    .map((item) => item.id);

  if (unreadNotificationIds.length > 0) {
    await this.prisma.guestNotification.updateMany({
      where: {
        id: {
          in: unreadNotificationIds,
        },
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  return {
    message:
      notifications.length > 0
        ? 'Recent notifications retrieved successfully.'
        : 'No recent notifications available.',
    notifications: notifications.map((item) => ({
      ...item.notification,
      isRead: true,
    })),
  };
}

// ==========================================
// HIDE GUEST NOTIFICATION
// ==========================================
async hideGuestNotification(
  notificationId: string,
  user: AuthenticatedUser,
) {
  await this.prisma.guestNotification.updateMany({
    where: {
      notificationId,
      guestId: user.id,
      hiddenAt: null,
    },
    data: {
      hiddenAt: new Date(),
    },
  });

  return {
    message: 'Notification hidden successfully.',
  };
}

// ==========================================
// HIDE ACCESS PIN NOTIFICATION
// ==========================================
async hideAccessPinNotification(
  bookingId: string,
) {
  await this.prisma.guestNotification.updateMany({
    where: {
      hiddenAt: null,
      notification: {
        bookingId,
        title: 'Room Access PIN',
      },
    },
    data: {
      hiddenAt: new Date(),
    },
  });
}
}