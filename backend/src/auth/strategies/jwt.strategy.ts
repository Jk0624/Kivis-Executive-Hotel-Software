import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
  ) {
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: {
  sub: string;
  phone: string;
  role: Role;
  }): Promise<AuthenticatedUser> {
    return {
      id: payload.sub,
      phone: payload.phone,
      role: payload.role,
    };
  }
}