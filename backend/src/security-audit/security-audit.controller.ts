import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { SecurityAuditService } from './security-audit.service';

@Controller('security-audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SecurityAuditController {
  constructor(
    private readonly securityAuditService: SecurityAuditService,
  ) {}

  // ==========================================
  // GET SECURITY AUDIT LOGS
  // ==========================================
  @Get()
  getSecurityAuditLogs() {
    return this.securityAuditService.getSecurityAuditLogs();
  }
}