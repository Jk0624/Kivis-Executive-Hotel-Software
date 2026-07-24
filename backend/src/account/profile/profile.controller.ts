import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  async getProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.profileService.getProfile(currentUser);
  }

  @Patch()
async updateProfile(
  @CurrentUser() currentUser: AuthenticatedUser,
  @Body() updateProfileDto: UpdateProfileDto,
) {
  return this.profileService.updateProfile(
    currentUser,
    updateProfileDto,
  );
}

@Post('complete')
async completeProfile(
  @CurrentUser() currentUser: AuthenticatedUser,
  @Body() completeProfileDto: CompleteProfileDto,
) {
  return this.profileService.completeProfile(
    currentUser,
    completeProfileDto,
  );
}
}