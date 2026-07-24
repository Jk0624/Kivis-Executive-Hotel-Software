import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// ==========================================
// JWT AUTH GUARD
// ==========================================
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}