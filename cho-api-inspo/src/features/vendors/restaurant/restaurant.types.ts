export interface CreateRestaurantBody {
  name: string;
  type?: string;
  description?: string;
  phone?: string;
  email?: string;
  addressLine: string;
  latitude: string | number;
  longitude: string | number;
}

export interface UpdateRestaurantBody extends Partial<CreateRestaurantBody> {
  status?: string;
}

export interface OperatingHourInput {
  day: string;
  openingTime: string;
  closingTime: string;
  isClosed?: boolean;
}
