import { RestaurantStatus } from "../../../generated/prisma/enums.js";

export interface AddRestaurantRequestBody {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  addressLine: string;
  latitude: string | number;
  longitude: string | number;
  imageUrl?: string;
  rating?: string | number;
  status?: RestaurantStatus;

  isPopular?: boolean;
}

export interface UpdateRestaurantRequestBody {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  addressLine?: string;
  latitude?: string | number;
  longitude?: string | number;
  imageUrl?: string;
  rating?: string | number;
  status?: RestaurantStatus;

  isPopular?: boolean;
}

