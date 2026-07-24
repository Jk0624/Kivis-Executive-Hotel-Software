import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

    // ==========================================
    // GET RECEPTIONIST NOTIFICATIONS
    // ============================================ 
    @Get('reception')
    async getReceptionNotifications(
      @CurrentUser() user: AuthenticatedUser,
    ) {
      return this.notificationService.getReceptionNotifications(
        user.id,
      );
    }

    // ==========================================
    // GET RECENT RECEPTIONIST NOTIFICATIONS
    // ============================================
    @Get('reception/recent')
    async getRecentReceptionNotifications(
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.notificationService.getRecentReceptionNotifications(
        user.id,
        );
    }

    // ==========================================
    // HIDE A RECEPTIONIST NOTIFICATION
    // ==========================================
    @Patch(':id/hide')
    async hideNotification(
        @Param('id') notificationId: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.notificationService.hideNotification(
        notificationId,
        user.id,
        );
    }

    // ==========================================
    // GET ADMIN NOTIFICATIONS
    // ==========================================
    @Get('admin')
    async getAdminNotifications(
      @CurrentUser() user: AuthenticatedUser,
    ) {
      return this.notificationService.getAdminNotifications(
        user.id,
      );
    }
}