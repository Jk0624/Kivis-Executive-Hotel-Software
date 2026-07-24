-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "bookingId" TEXT;

-- CreateTable
CREATE TABLE "GuestNotification" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "hiddenAt" TIMESTAMP(3),

    CONSTRAINT "GuestNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestNotification_notificationId_idx" ON "GuestNotification"("notificationId");

-- CreateIndex
CREATE INDEX "GuestNotification_guestId_idx" ON "GuestNotification"("guestId");

-- CreateIndex
CREATE INDEX "GuestNotification_readAt_idx" ON "GuestNotification"("readAt");

-- CreateIndex
CREATE INDEX "GuestNotification_hiddenAt_idx" ON "GuestNotification"("hiddenAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuestNotification_notificationId_guestId_key" ON "GuestNotification"("notificationId", "guestId");

-- CreateIndex
CREATE INDEX "Notification_bookingId_idx" ON "Notification"("bookingId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestNotification" ADD CONSTRAINT "GuestNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestNotification" ADD CONSTRAINT "GuestNotification_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
