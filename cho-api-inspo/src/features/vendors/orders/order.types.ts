import { OrderStatus } from "../../../generated/prisma/enums.js";

export interface VendorOrdersQuery {
  status?: string;
  restaurantId?: string;
  page?: string;
  limit?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface VendorOrderResponse {
  id: string;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: string;
  deliveryAddress: string;
  deliveryLatitude: string | null;
  deliveryLongitude: string | null;
  deliveryFee: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  restaurant: {
    id: string;
    name: string;
    address: string | null;
  };
  items: VendorOrderItemResponse[];
}

export interface VendorOrderItemResponse {
  id: string;
  foodId: string;
  quantity: number;
  price: string;
  food: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: string;
  };
  foodPack: {
    id: string;
    name: string;
    price: string;
  } | null;
  addons: VendorOrderItemAddonResponse[];
}

export interface VendorOrderItemAddonResponse {
  id: string;
  addonId: string;
  quantity: number;
  price: string;
  addon: {
    id: string;
    name: string;
    price: string;
  };
}
