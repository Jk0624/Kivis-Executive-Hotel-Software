export interface CreatePaymentDetailBody {
  method: "BANK" | "MOMO";
  bankName?: string;
  network?: string;
  phone?: string;
  accountName: string;
  accountNumber?: string;
}

export interface UpdatePaymentDetailBody
  extends Partial<CreatePaymentDetailBody> {}
