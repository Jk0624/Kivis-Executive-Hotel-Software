export interface AddPackRequestBody {
  foodId: string | number;
  name: string;
  price: string | number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdatePackRequestBody {
  name?: string;
  price?: string | number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface PackResponse {
  id: string;
  foodId: string;
  name: string;
  price: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  food?: {
    id: string;
    name: string;
    price: string;
  };
}



