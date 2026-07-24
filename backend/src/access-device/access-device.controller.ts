import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RegisterAccessDeviceDto } from './dto/register-access-device.dto';
import { AccessDeviceService } from './access-device.service';
import { UpdateAccessDeviceDto } from './dto/update-access-device.dto';
import { TestAccessDeviceDto } from './dto/test-access-device.dto';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('access-device')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AccessDeviceController {
  constructor(
    private readonly accessDeviceService: AccessDeviceService,
  ) {}

  // ==========================================
  // REGISTER ACCESS DEVICE
  // ==========================================
  @Post('register')
  registerAccessDevice(
    @Body()
    registerAccessDeviceDto: RegisterAccessDeviceDto,
  ) {
    return this.accessDeviceService.registerAccessDevice(
      registerAccessDeviceDto,
    );
  }

  // ==========================================
// GET ALL ACCESS DEVICES
// ==========================================
@Get()
getAllAccessDevices() {
  return this.accessDeviceService.getAllAccessDevices();
}

// ==========================================
// GET ACCESS DEVICE
// ==========================================
@Get(':id')
getAccessDevice(
  @Param('id')
  id: string,
) {
  return this.accessDeviceService.getAccessDevice(
    id,
  );
}

// ==========================================
// UPDATE ACCESS DEVICE
// ==========================================
@Patch(':id')
updateAccessDevice(
  @Param('id')
  id: string,

  @Body()
  updateAccessDeviceDto: UpdateAccessDeviceDto,
) {
  return this.accessDeviceService.updateAccessDevice(
    id,
    updateAccessDeviceDto,
  );
}

// ==========================================
// DELETE ACCESS DEVICE
// ==========================================
@Delete(':id')
deleteAccessDevice(
  @Param('id')
  id: string,
) {
  return this.accessDeviceService.deleteAccessDevice(
    id,
  );
}

// ==========================================
// TEST ACCESS DEVICE
// ==========================================
@Post('test')
testAccessDevice(
  @Body()
  testAccessDeviceDto: TestAccessDeviceDto,
) {
  return this.accessDeviceService.testAccessDevice(
    testAccessDeviceDto,
  );
}

}