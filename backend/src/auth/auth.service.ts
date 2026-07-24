import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Otp, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateOtp, hashOtp, verifyOtpHash} from './utils/otp.util';
import { SmsService } from '../sms/sms.service';
import { JwtService } from '@nestjs/jwt';
import { Role, SecurityAction } from '@prisma/client';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import { RequestOtpDto } from './dto/request-otp.dto';
import { AuthMode } from './enums/auth-mode.enum';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SecurityAuditService } from '../security-audit/security-audit.service';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
  private readonly prisma: PrismaService,
  private readonly smsService: SmsService,
  private readonly jwtService: JwtService,
  private readonly securityAuditService: SecurityAuditService,
  ) {}

  // ==========================================
  // OTP REQUEST
  // ==========================================
  async requestOtp(
    requestOtpDto: RequestOtpDto,
  ) {

    const {
      name,
      phone,
      email,
      mode,
    } = requestOtpDto;

    // ==========================================
    // VALIDATE AUTHENTICATION MODE
    // ==========================================
    if (mode === AuthMode.SIGN_UP) {

      const existingUser =
        await this.prisma.user.findUnique({
          where: {
            phone,
          },
        });

      if (existingUser) {
        throw new BadRequestException(
          'An account with this phone number already exists.',
        );
      }

      if (email) {
        const existingEmail =
          await this.prisma.user.findUnique({
            where: {
              email,
            },
          });

        if (existingEmail) {
          throw new BadRequestException(
            'An account with this email address already exists.',
          );
        }
      }

    } else {

      const existingUser =
        await this.prisma.user.findUnique({
          where: {
            phone,
          },
        });

      if (!existingUser) {
        throw new BadRequestException(
          'No account found with this phone number.',
        );
      }

    }

    await this.prisma.otp.updateMany({
      where: {
        phone,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });
    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    // ==========================================
    // LOG OTP (DEVELOPMENT ONLY)
    // ==========================================
    if (
      process.env.NODE_ENV !==
      'production'
    ) {
      this.logger.log(`
    ======================================

    OTP GENERATED

    Phone: ${phone}

    OTP: ${otp}

    ======================================
    `);
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.prisma.otp.create({
      data: {
        phone,
        codeHash: otpHash,
        expiresAt,
      },
    });

  // ==========================================
  // SEND OTP
  // ==========================================
  await this.smsService.sendOtp({
    recipient: phone,
    otp,
  });

    return {
      message: 'OTP sent successfully',
    };
  }

  // ==========================================
  // OTP VERIFICATION
  // ==========================================
  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ) {

    const {
      name,
      phone,
      otp,
      email,
      mode,
    } = verifyOtpDto;

    // ==========================================
    // VALIDATE SIGN-UP DATA
    // ==========================================
    if (
      mode === AuthMode.SIGN_UP &&
      !email
    ) {
      throw new BadRequestException(
        'Email is required for sign up.',
      );
    }

    // STEP 1: Find the latest unused OTP
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        phone,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // STEP 2-4: Validate OTP record
    const validatedOtp = this.validateOtpRecord(
      otpRecord,
      otp,
    );

    // STEP 5: Mark OTP as used
    await this.prisma.otp.update({
      where: {
        id: validatedOtp.id,
      },
      data: {
        isUsed: true,
      },
    });
    
    // ==========================================
    // COMPLETE AUTHENTICATION
    // ==========================================

    const user =
      mode === AuthMode.SIGN_UP
        ? await this.completeSignUp(
            name!,
            phone,
            email!,
          )
        : await this.completeSignIn(
            phone,
          );

    return this.authenticateUser(user);
  }

  // ==========================================
  // BOOTSTRAP ADMIN
  // ==========================================
  async bootstrapAdmin() {
    const phone = '0202722344';

  // ==========================================
  // CHECK IF ADMIN EXISTS
  // ==========================================
  const existingAdmin =
    await this.prisma.user.findUnique({
      where: {
        phone,
      },
    });

  if (existingAdmin) {
    return {
      message: 'Administrator already exists.',
      user: existingAdmin,
    };
  }

    // ==========================================
    // CREATE ADMIN
    // ==========================================
    const admin =
      await this.prisma.user.create({
        data: {
          phone,
          name: 'System Administrator',
          email: 'admin@kiviz.com',
          employeeId: 'ADM001',
          isActive: true,
          role: Role.ADMIN,
        },
      });

    return {
      message: 'Administrator created successfully.',
      user: admin,
    };
    }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  // ==========================================
  // VALIDATE OTP RECORD
  // ==========================================
  private validateOtpRecord(
  otpRecord: Otp | null,
  otp: string,
  ): Otp {
    // STEP 2: Ensure an OTP exists
    if (!otpRecord) {
      throw new UnauthorizedException(
        'Invalid or expired OTP.',
      );
    }

    // STEP 3: Check OTP expiration
    const now = new Date();

    if (otpRecord.expiresAt < now) {
      throw new UnauthorizedException(
        'OTP has expired.',
      );
    }

    // STEP 4: Compare OTP hash
    const isValidOtp = verifyOtpHash(
      otp,
      otpRecord.codeHash,
    );

    if (!isValidOtp) {
      throw new UnauthorizedException(
        'Invalid OTP.',
      );
    }

    return otpRecord;
  }

  // ==========================================
  // COMPLETE SIGN-UP
  // ==========================================
  private async completeSignUp(
    name: string,
    phone: string,
    email: string,
  ) {
    return this.prisma.user.create({
      data: {
        name,
        phone,
        email,
        isVerified: true,
      },
    });
  }

  // ==========================================
  // COMPLETE SIGN-IN
  // ==========================================
  private async completeSignIn(
    phone: string,
  ) {
    return this.prisma.user.update({
      where: {
        phone,
      },
      data: {
        isVerified: true,
      },
    });
  }

  // ==========================================
  // GENERATE ACCESS TOKEN
  // ==========================================
  private async generateAccessToken(
    user: User,
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });
  }

  // ==========================================
  // AUTHENTICATE USER
  // ==========================================
  private async authenticateUser(
    user: User,
  ) {
    const accessToken =
      await this.generateAccessToken(user);

    return this.buildAuthenticationResponse(
      user,
      accessToken,
    );
  }

  // ==========================================
  // BUILD AUTHENTICATION RESPONSE
  // ==========================================
  private buildAuthenticationResponse(
    user: User,
    accessToken: string,
  ) {
    return {
      message: 'Authentication successful.',
      isNewUser: !user.name,
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    };
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async logout(user: AuthenticatedUser) {
    this.logger.log(
      `${user.role} (${user.phone}) logged out successfully.`,
    );

  // ==========================================
  // SECURITY AUDIT
  // ==========================================
  await this.securityAuditService.log({
    employeeUserId: user.id,
    action: SecurityAction.LOGOUT,
    details: `${user.role} (${user.phone}) logged out successfully.`,
  });

    return {
      message: 'Logged out successfully.',
    };
  }
}