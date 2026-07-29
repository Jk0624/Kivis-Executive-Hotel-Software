export interface InitializePaymentRequestBody {
  orderId: string | number;
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  orderId: string;
}

export interface VerifyPaymentResponse {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  paidAt: string | null;
  orderId: string;
  transactionId: string;
}

