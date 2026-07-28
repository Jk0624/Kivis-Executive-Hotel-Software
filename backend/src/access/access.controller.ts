import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { AccessService } from './access.service';
import { VerifyAccessDto } from './dto/verify-access.dto';

@Controller('access')
export class AccessController {
  constructor(
    private readonly accessService: AccessService,
  ) {}


  // ==========================================
  // CONNECTION TEST
  // ==========================================
  @Get('ping')
  ping() {
    return {
      message:
        'ESP32 connection successful.',
    };
  }

  // ==========================================
  // VERIFY ACCESS
  // ==========================================
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verifyAccess(
    @Headers('x-device-key')
    deviceKey: string,

    @Body()
    verifyAccessDto: VerifyAccessDto,
  ) {
    return this.accessService.verifyAccess(
      deviceKey,
      verifyAccessDto,
    );
  }

  // ==========================================
  // RECORD BUTTON ACCESS
  // ==========================================
  @Post('button')
  @HttpCode(HttpStatus.OK)
  recordButtonAccess(
    @Headers('x-device-key')
    deviceKey: string,
  ) {
    return this.accessService.recordButtonAccess(
      deviceKey,
    );
  }
}