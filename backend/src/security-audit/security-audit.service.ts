import { Injectable } from '@nestjs/common';

import {
  SecurityAction,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityAuditService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
// LOG SECURITY ACTION
// ==========================================
async log({
  employeeUserId,
  bookingId,
  action,
  details,
}: {
  employeeUserId: string;
  bookingId?: string;
  action: SecurityAction;
  details?: string;
}) {
return this.prisma.securityAuditLog.create({
  data: {
    employeeUserId,
    ...(bookingId && {
      bookingId,
    }),
    action,
    details,
  },
});
}

// ==========================================
// GET SECURITY AUDIT LOGS
// ==========================================
async getSecurityAuditLogs() {
  const auditLogs =
    await this.prisma.securityAuditLog.findMany({
      include: {
        employee: {
          select: {
            employeeId: true,
            name: true,
            role: true,
          },
        },
        booking: {
          select: {
            bookingId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message:
        'Security audit logs retrieved successfully.',
      auditLogs: auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        details: log.details,
        createdAt: log.createdAt,

        employeeId:
          log.employee.employeeId,

        employeeName:
          log.employee.name,

        employeeRole:
          log.employee.role,

        bookingReference:
          log.booking?.bookingId ?? null,
      })),
    };

}

}