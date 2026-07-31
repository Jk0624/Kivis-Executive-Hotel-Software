import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums.js";

export interface OrderItemInput {
  foodId: string | number;
  quantity: number;
  foodPackId?: string | number;
  addons?: OrderItemAddonInput[];
}

export interface OrderItemAddonInput {
  addonId: string | number;
  quantity: number;
}

export interface CreateOrderRequestBody {
  restaurantId: string | number;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryFee?: string | number;
  orderPaymentMethod?: "PREPAID" | "CASH_ON_DELIVERY" | "PAY_FOR_ME";
  restaurantNote?: string;
  riderNote?: string;
  items: OrderItemInput[];
  initializePayment?: boolean;
  paymentCallbackUrl?: string;
  couponCode?: string;
}

export interface UpdateOrderStatusRequestBody {
  status: OrderStatus;
}

export interface OrderItemResponse {
  id: string;
  orderId: string;
  foodId: string;
  quantity: number;
  price: string;
  food: {
    id: string;
    name: string;
    price: string;
  };
  addons: OrderItemAddonResponse[];
}

export interface OrderItemAddonResponse {
  id: string;
  orderItemId: string;
  addonId: string;
  quantity: number;
  price: string;
  addon: {
    id: string;
    name: string;
    price: string;
  };
}

export interface OrderResponse {
  id: string;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: string;
  deliveryAddress: string;
  deliveryLatitude: string | null;
  deliveryLongitude: string | null;
  deliveryFee: string;
  foodTotal: string;
  serviceFee: string;
  tax: string;
  discount: string;
  orderPaymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  restaurant?: {
    id: string;
    name: string;
  };
  items: OrderItemResponse[];
}
