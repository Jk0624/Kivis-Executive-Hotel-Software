import { Body, Controller, HttpCode, Post, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user.type';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
// ==========================================
// REQUEST OTP
// ==========================================
@Post('request-otp')
async requestOtp(
  @Body() requestOtpDto: RequestOtpDto,
) {
  return this.authService.requestOtp(
    requestOtpDto,
  );
}

  // ===================================
  // VERIFY OTP METHOD
  // ==================================
  @Post('verify-otp')
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ) {
    return this.authService.verifyOtp(
      verifyOtpDto,
    );
  }

  // ==========================================
  // LOGOUT
  // ==========================================
  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  logout(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.logout(user);
  }

  // ==========================================
  // BOOTSTRAP ADMIN
  // ==========================================
  @Post('bootstrap/admin')
  @HttpCode(201)
  async bootstrapAdmin() {
    return this.authService.bootstrapAdmin();
  }
}