export type AddonTag = "main" | "sauce" | "sides" | "packaging";
export type FrontendComponent = "checkbox" | "slider" | "counter";

export interface AddAddonRequestBody {
  restaurantId: string | number;
  name: string;
  description?: string;
  price: string | number;
  tag: AddonTag;
  frontendComponent?: FrontendComponent;
  step?: string | number;
  minPrice?: string | number;
  maxPrice?: string | number;
  isActive?: boolean;
}

export interface UpdateAddonRequestBody {
  name?: string;
  description?: string;
  price?: string | number;
  tag?: AddonTag;
  frontendComponent?: FrontendComponent;
  step?: string | number;
  minPrice?: string | number;
  maxPrice?: string | number;
  isActive?: boolean;
}

export interface AddonResponse {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: string;
  tag: AddonTag;
  frontendComponent: FrontendComponent;
  step: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

