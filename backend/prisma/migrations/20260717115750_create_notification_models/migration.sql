-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceptionistNotification" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "receptionistId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "hiddenAt" TIMESTAMP(3),

    CONSTRAINT "ReceptionistNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "ReceptionistNotification_notificationId_idx" ON "ReceptionistNotification"("notificationId");

-- CreateIndex
CREATE INDEX "ReceptionistNotification_receptionistId_idx" ON "ReceptionistNotification"("receptionistId");

-- CreateIndex
CREATE INDEX "ReceptionistNotification_readAt_idx" ON "ReceptionistNotification"("readAt");

-- CreateIndex
CREATE INDEX "ReceptionistNotification_hiddenAt_idx" ON "ReceptionistNotification"("hiddenAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReceptionistNotification_notificationId_receptionistId_key" ON "ReceptionistNotification"("notificationId", "receptionistId");

-- AddForeignKey
ALTER TABLE "ReceptionistNotification" ADD CONSTRAINT "ReceptionistNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceptionistNotification" ADD CONSTRAINT "ReceptionistNotification_receptionistId_fkey" FOREIGN KEY ("receptionistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
