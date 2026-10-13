export type PaymentStatus = 'IDLE' | 'PROCESSING' | 'PENDING' | 'SUCCESS' | 'FAILED';

export type PaymentMethodType = 'upi' | 'card';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  pricePaise: number; // in paise
}

export interface Order {
  id: string;
  merchantName: string;
  merchantLogo?: string;
  items: OrderItem[];
  subtotalPaise: number;
  taxPaise: number;
  deliveryPaise: number;
  totalPaise: number; // in paise
  currency: 'INR';
  createdAt: string;
  latestPayment?: PaymentRecord;
}

export interface UPIPaymentDetails {
  upiId: string;
}

export interface CardPaymentDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  nameOnCard?: string;
}

export interface PaymentRequestPayload {
  orderId: string;
  method: PaymentMethodType;
  upiDetails?: UPIPaymentDetails;
  cardDetails?: {
    cardNumberLast4: string;
    cardNetwork: string;
    expiry: string;
  };
  forceStatus?: 'SUCCESS' | 'FAILED' | 'PENDING'; // For testing / demo convenience
}

export interface PaymentRecord {
  paymentId: string;
  idempotencyKey: string;
  orderId: string;
  method: PaymentMethodType;
  amountPaise: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  finalStatus?: 'SUCCESS' | 'FAILED'; // The status it resolves to after pending duration
  reason?: string;
  createdAt: number;
  completedAt?: number;
}

export interface PaymentResponse {
  paymentId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  reason?: string;
  message?: string;
}
