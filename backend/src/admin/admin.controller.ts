import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Body, Post, Delete } from '@nestjs/common';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { MarkRoomMaintenanceDto } from './dto/mark-room-maintenance.dto';
import { UpdateReceptionistDto } from './dto/update-receptionist.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { Request } from 'express';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { RegisterAccessDeviceDto } from '../access-device/dto/register-access-device.dto';
import { UpdateAccessDeviceDto } from '../access-device/dto/update-access-device.dto';
import {
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  roomImageMulterOptions,
} from '../common/multer/multer.config';
import {
  ROOM_IMAGE_ALLOWED_TYPES,
  ROOM_IMAGE_MAX_COUNT,
  ROOM_IMAGE_MAX_SIZE,
} from '../common/constants/upload.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';


@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  // ==========================================
  // DASHBOARD HEADER
  // ==========================================
  @Get('dashboard/header')
  getDashboardHeader(
    @Req()
    request: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.adminService.getDashboardHeader(
      request.user.id,
    );
  }

// ==========================================
// DASHBOARD SUMMARY
// ==========================================
@Get('dashboard/summary')
getDashboardSummary() {
  return this.adminService.getDashboardSummary();
}

// ==========================================
// RECENT ACTIVITY
// ==========================================
@Get('dashboard/recent-activity')
getRecentActivity() {
  return this.adminService.getRecentActivity();
}

// ==========================================
// OCCUPANCY SUMMARY
// ==========================================
@Get('dashboard/occupancy')
getOccupancySummary() {
  return this.adminService.getOccupancySummary();
}

// ==========================================
// UPLOAD ROOM IMAGES
// ==========================================
@Post('rooms/upload-images')
@UseInterceptors(
  FilesInterceptor(
    'images',
    ROOM_IMAGE_MAX_COUNT,
    roomImageMulterOptions,
  ),
)
uploadRoomImages(
  @UploadedFiles()
  files: Express.Multer.File[],
) {
  return this.adminService.uploadRoomImages(
    files,
  );
}

// ==========================================
// CREATE ROOM
// ==========================================
@Post('rooms')
createRoom(
  @Body()
  createRoomDto: CreateRoomDto,
) {
  return this.adminService.createRoom(
    createRoomDto,
  );
}

// ==========================================
// GET ALL ROOMS
// ==========================================
@Get('rooms')
getAllRooms() {
  return this.adminService.getAllRooms();
}

// ==========================================
// GET ROOM
// ==========================================
@Get('rooms/:roomId')
getRoom(
  @Param('roomId')
  roomId: string,
) {
  return this.adminService.getRoom(
    roomId,
  );
}

// ==========================================
// DELETE ROOM IMAGE
// ==========================================
@Delete('rooms/images')
deleteRoomImage(
  @Body('publicId')
  publicId: string,
) {
  return this.adminService.deleteRoomImage(
    publicId,
  );
}

// ==========================================
// UPDATE ROOM
// ==========================================
@Patch('rooms/:roomId')
updateRoom(
  @Param('roomId')
  roomId: string,

  @Body()
  updateRoomDto: UpdateRoomDto,
) {
  return this.adminService.updateRoom(
    roomId,
    updateRoomDto,
  );
}

// ==========================================
// MARK ROOM UNDER MAINTENANCE
// ==========================================
@Patch('rooms/:roomId/maintenance')
markRoomUnderMaintenance(
  @Param('roomId')
  roomId: string,

  @Body()
  markRoomMaintenanceDto: MarkRoomMaintenanceDto,
) {
  return this.adminService.markRoomUnderMaintenance(
    roomId,
    markRoomMaintenanceDto,
  );
}

// ==========================================
// COMPLETE MAINTENANCE
// ==========================================
@Patch('rooms/:roomId/maintenance/complete')
completeMaintenance(
  @Param('roomId')
  roomId: string,
) {
  return this.adminService.completeMaintenance(
    roomId,
  );
}

  // ==========================================
// CREATE RECEPTIONIST
// ==========================================
@Post('receptionists')
createReceptionist(
  @Body()
  createReceptionistDto: CreateReceptionistDto,
) {
  return this.adminService.createReceptionist(
    createReceptionistDto,
  );
}

// ==========================================
// GET ALL RECEPTIONISTS
// ==========================================
@Get('receptionists')
getAllReceptionists() {
  return this.adminService.getAllReceptionists();
}

// ==========================================
// GET RECEPTIONIST
// ==========================================
@Get('receptionists/:receptionistId')
getReceptionist(
  @Param('receptionistId')
  receptionistId: string,
) {
  return this.adminService.getReceptionist(
    receptionistId,
  );
}

// ==========================================
// UPDATE RECEPTIONIST
// ==========================================
@Patch('receptionists/:receptionistId')
updateReceptionist(
  @Param('receptionistId')
  receptionistId: string,

  @Body()
  updateReceptionistDto: UpdateReceptionistDto,
) {
  return this.adminService.updateReceptionist(
    receptionistId,
    updateReceptionistDto,
  );
}

// ==========================================
// TOGGLE RECEPTIONIST STATUS
// ==========================================
@Patch('receptionists/:receptionistId/status')
toggleReceptionistStatus(
  @Param('receptionistId')
  receptionistId: string,
) {
  return this.adminService.toggleReceptionistStatus(
    receptionistId,
  );
}

// ==========================================
// GET ALL GUESTS
// ==========================================
@Get('guests')
getAllGuests() {
  return this.adminService.getAllGuests();
}

// ==========================================
// GET GUEST
// ==========================================
@Get('guests/:guestId')
getGuest(
  @Param('guestId')
  guestId: string,
) {
  return this.adminService.getGuest(
    guestId,
  );
}

// ==========================================
// GET GUEST BOOKING HISTORY
// ==========================================
@Get('guests/:guestId/bookings')
getGuestBookingHistory(
  @Param('guestId')
  guestId: string,
) {
  return this.adminService.getGuestBookingHistory(
    guestId,
  );
}

// ==========================================
// BOOKING STATISTICS
// ==========================================
@Get('bookings/statistics')
getBookingStatistics() {
  return this.adminService.getBookingStatistics();
}

// ==========================================
// GET ALL BOOKINGS
// ==========================================
@Get('bookings')
getAllBookings() {
  return this.adminService.getAllBookings();
}

// ==========================================
// SEARCH BOOKINGS
// ==========================================
@Get('bookings/search')
searchBookings(
  @Query('search')
  search: string,
) {
  return this.adminService.searchBookings(
    search,
  );
}

// ==========================================
// GET BOOKING
// ==========================================
@Get('bookings/:bookingId')
getBooking(
  @Param('bookingId')
  bookingId: string,
) {
  return this.adminService.getBooking(
    bookingId,
  );
}

// ==========================================
// GET BOOKING TIMELINE
// ==========================================
@Get('bookings/:bookingId/timeline')
getBookingTimeline(
  @Param('bookingId')
  bookingId: string,
) {
  return this.adminService.getBookingTimeline(
    bookingId,
  );
}

// ==========================================
// CANCEL BOOKING
// ==========================================
@Patch('bookings/:bookingId/cancel')
cancelBooking(
  @Req()
  request: Request & {
    user: AuthenticatedUser;
  },

  @Param('bookingId')
  bookingId: string,

  @Body()
  cancelBookingDto: CancelBookingDto,
) {
  return this.adminService.cancelBooking(
    request.user.id,
    bookingId,
    cancelBookingDto,
  );
}

// ==========================================
// REVENUE SUMMARY
// ==========================================
@Get('payments/revenue-summary')
revenueSummary() {
  return this.adminService.revenueSummary();
}

// ==========================================
// LIST PAYMENTS
// ==========================================
@Get('payments')
listPayments() {
  return this.adminService.listPayments();
}

// ==========================================
// PAYMENT DETAILS
// ==========================================
@Get('payments/:paymentId')
getPayment(
  @Param('paymentId')
  paymentId: string,
) {
  return this.adminService.getPayment(
    paymentId,
  );
}

// ==========================================
// LIST ACCESS DEVICES
// ==========================================
@Get('access-devices')
listAccessDevices() {
  return this.adminService.listAccessDevices();
}

// ==========================================
// ACCESS DEVICE DETAILS
// ==========================================
@Get('access-devices/:id')
getAccessDevice(
  @Param('id')
  id: string,
) {
  return this.adminService.getAccessDevice(
    id,
  );
}

// ==========================================
// REGISTER ACCESS DEVICE
// ==========================================
@Post('access-devices')
registerAccessDevice(
  @Body()
  registerAccessDeviceDto: RegisterAccessDeviceDto,
) {
  return this.adminService.registerAccessDevice(
    registerAccessDeviceDto,
  );
}

// ==========================================
// UPDATE ACCESS DEVICE
// ==========================================
@Patch('access-devices/:id')
updateAccessDevice(
  @Param('id')
  id: string,

  @Body()
  updateAccessDeviceDto: UpdateAccessDeviceDto,
) {
  return this.adminService.updateAccessDevice(
    id,
    updateAccessDeviceDto,
  );
}

// ==========================================
// DISABLE ACCESS DEVICE
// ==========================================
@Patch('access-devices/:id/disable')
disableAccessDevice(
  @Param('id')
  id: string,
) {
  return this.adminService.disableAccessDevice(
    id,
  );
}

// ==========================================
// ENABLE ACCESS DEVICE
// ==========================================
@Patch('access-devices/:id/enable')
enableAccessDevice(
  @Param('id')
  id: string,
) {
  return this.adminService.enableAccessDevice(
    id,
  );
}

// ==========================================
// OCCUPANCY REPORT
// ==========================================
@Get('reports/occupancy')
occupancyReport() {
  return this.adminService.occupancyReport();
}

// ==========================================
// REVENUE REPORT
// ==========================================
@Get('reports/revenue')
revenueReport() {
  return this.adminService.revenueReport();
}

// ==========================================
// ACCESS LOG REPORT
// ==========================================
@Get('reports/access-logs')
accessLogReport() {
  return this.adminService.accessLogReport();
}

// ==========================================
// SECURITY AUDIT REPORT
// ==========================================
@Get('reports/security-audit')
securityAuditReport() {
  return this.adminService.securityAuditReport();
}

// ==========================================
// GET RECENT NOTIFICATIONS
// ==========================================
@Get('notifications/recent')
getRecentNotifications(
  @CurrentUser() user: AuthenticatedUser,
) {
  return this.adminService.getRecentNotifications(
    user.id,
  );
}

// ==========================================
// HIDE NOTIFICATION
// ==========================================
@Patch('notifications/:notificationId/hide')
hideNotification(
  @Param('notificationId')
  notificationId: string,

  @CurrentUser()
  user: AuthenticatedUser,
) {
  return this.adminService.hideNotification(
    notificationId,
    user.id,
  );
}
}