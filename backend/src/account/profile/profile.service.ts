import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';


@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
// GET PROFILE
// ==========================================
async getProfile(
  currentUser: AuthenticatedUser,
) {
  const user = await this.findCurrentUser(
    currentUser.id,
    );

    return {
        message: 'Profile retrieved successfully.',
        user: this.buildProfileResponse(user),
    };
    }

// ==========================================
// UPDATE PROFILE
// ==========================================
async updateProfile(
  currentUser: AuthenticatedUser,
  updateProfileDto: UpdateProfileDto,
) {

  const { name, email } = updateProfileDto;

  // ==========================================
  // ENSURE AT LEAST ONE FIELD IS PROVIDED
  // ==========================================
  if (name === undefined && email === undefined) {
    throw new BadRequestException(
      'At least one field must be provided.',
    );
  }

    // ==========================================
    // CHECK FOR DUPLICATE EMAIL
    // ==========================================
    if (email) {
    await this.validateEmailUniqueness(
        email,
        currentUser.id,
    );
    }

  // ==========================================
  // UPDATE PROFILE
  // ==========================================
  const user =
    await this.prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
        email,
      },
    });

  return {
    message: 'Profile updated successfully.',
    user: this.buildProfileResponse(user),
  };
}

// ==========================================
// COMPLETE PROFILE
// ==========================================
async completeProfile(
  currentUser: AuthenticatedUser,
  completeProfileDto: CompleteProfileDto,
) {

  // ==========================================
  // GET CURRENT USER
  // ==========================================
  const existingUser =
  await this.findCurrentUser(
    currentUser.id,
  );

  // ==========================================
  // PROFILE ALREADY COMPLETED
  // ==========================================
  if (
    existingUser.name &&
    existingUser.email
  ) {
    throw new BadRequestException(
      'Your profile has already been completed.',
    );
  }

// ==========================================
// CHECK FOR DUPLICATE EMAIL
// ==========================================
await this.validateEmailUniqueness(
  completeProfileDto.email,
  currentUser.id,
);

  // ==========================================
  // COMPLETE PROFILE
  // ==========================================
  const user =
    await this.prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: completeProfileDto.name,
        email: completeProfileDto.email,
      },
    });

  return {
    message: 'Profile completed successfully.',
    user: this.buildProfileResponse(user),
  };
}

// ==========================================
// FIND CURRENT USER
// ==========================================
private async findCurrentUser(
  userId: string,
): Promise<User> {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new BadRequestException(
      'User not found.',
    );
  }

  return user;
}

  private buildProfileResponse(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }

  // ==========================================
// VALIDATE EMAIL UNIQUENESS
// ==========================================
private async validateEmailUniqueness(
  email: string,
  currentUserId: string,
): Promise<void> {
  const existingUser =
    await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (
    existingUser &&
    existingUser.id !== currentUserId
  ) {
    throw new BadRequestException(
      'An account with this email address already exists.',
    );
  }
}
}