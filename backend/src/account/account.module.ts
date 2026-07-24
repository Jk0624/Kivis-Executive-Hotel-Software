import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';

@Module({
  controllers: [AccountController, ProfileController],
  providers: [AccountService, ProfileService]
})
export class AccountModule {}
