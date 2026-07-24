import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SmsModule } from '../sms/sms.module';
import { SecurityAuditModule } from '../security-audit/security-audit.module';

@Module({
  imports: [
    ConfigModule,
    SmsModule,
    SecurityAuditModule,
    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
  AuthService,
  JwtStrategy,
  ],

  exports: [JwtModule],
})
export class AuthModule {}