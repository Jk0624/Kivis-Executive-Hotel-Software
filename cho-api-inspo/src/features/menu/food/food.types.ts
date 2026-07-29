import { AddonTag } from "../addons/addon.types.js";

export interface AddFoodRequestBody {
  restaurantId: string | number;
  name: string;
  description?: string;
  price: string | number;

  category?: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  categoryId?: string | number;
  requiredAddonTags?: AddonTag[];
}

export interface UpdateFoodRequestBody {
  name?: string;
  description?: string;
  price?: string | number;

  category?: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  categoryId?: string | number;
  requiredAddonTags?: AddonTag[];
}

