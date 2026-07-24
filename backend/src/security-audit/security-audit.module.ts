import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { SecurityAuditService } from './security-audit.service';
import { SecurityAuditController } from './security-audit.controller';


@Module({
  imports: [
    PrismaModule,
  ],
  providers: [
    SecurityAuditService,
  ],
  exports: [
    SecurityAuditService,
  ],
  controllers: [SecurityAuditController],
})
export class SecurityAuditModule {}