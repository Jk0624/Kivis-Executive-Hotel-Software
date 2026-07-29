export interface RiderRegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  nationality?: string;
  dob: string;
}

export interface RiderLoginBody {
  identifier: string;
  password: string;
}

export interface RiderRefreshTokenBody {
  refreshToken: string;
}

export interface RiderUpdateProfileBody {
  firstName?: string;
  lastName?: string;
  gender?: string;
  nationality?: string;
  dob: string;
}

export interface RiderChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface RiderUpdateStatusBody {
  isOnline: boolean;
}

export interface RiderDeleteAccountBody {
  confirmation?: string;
}

export const RIDER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  gender: true,
  nationality: true,
  dob: true,
  authProvider: true,
  isActive: true,
  isOnline: true,
  deletionRequestedAt: true,
  emailVerifiedAt: true,
  phoneVerifiedAt: true,
  isPersonalInfoComplete: true,
  isPaymentInfoComplete: true,
  verificationStatus: true,
  createdAt: true,
  updatedAt: true,
  vehicleInfo: {
    select: {
      id: true,
      idFrontKey: true,
      idBackKey: true,
      vehicleType: true,
      vehicleBrand: true,
      numberPlate: true,
      isInfoComplete: true,
    },
  },
  paymentDetails: {
    select: {
      id: true,
      method: true,
      bankName: true,
      network: true,
      phone: true,
      accountName: true,
      accountNumber: true,
      isDefault: true,
    },
  },
} as const;
