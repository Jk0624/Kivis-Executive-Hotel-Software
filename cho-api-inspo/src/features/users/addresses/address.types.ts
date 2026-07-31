export interface AddAddressRequestBody {
  label?: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface UpdateAddressRequestBody {
  label?: string;
  addressLine?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface AddressResponse {
  id: string;
  userId: string;
  label: string | null;
  addressLine: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: Date;
}