export interface PayForMeInitializeBody {
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
}

export interface PayForMeLinkResponse {
  url: string;
  token: string;
  expiresAt: string;
  isUsed: boolean;
}

export interface PayForMeStatusResponse {
  paymentStatus: string;
  orderNumber: string | null;
  totalAmount: string;
}
