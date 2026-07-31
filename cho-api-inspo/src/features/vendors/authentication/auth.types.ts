export interface VendorRegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface VendorLoginBody {
  identifier: string;
  password: string;
}

export interface VendorRefreshTokenBody {
  refreshToken: string;
}

export interface VendorUpdateProfileBody {
  firstName?: string;
  lastName?: string;
}

export interface VendorChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface VendorDeleteAccountBody {
  confirmation?: string;
}

export const VENDOR_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  authProvider: true,
  isActive: true,
  deletionRequestedAt: true,
  emailVerifiedAt: true,
  phoneVerifiedAt: true,
  isPersonalInfoComplete: true,
  createdAt: true,
  updatedAt: true,
  restaurants: {
    select: {
      id: true,
      name: true,
      status: true,
      isInfoComplete: true,
      isPaymentInfoComplete: true,
      verificationStatus: true,
    },
  },
} as const;
