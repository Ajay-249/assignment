import { NextRequest, NextResponse } from 'next/server';
import {
  findPaymentByIdempotencyKey,
  savePayment,
  getOrder,
  getAllPayments,
} from '@/lib/mock-db';
import { PaymentRecord, PaymentRequestPayload } from '@/types/checkout';

export async function GET() {
  const payments = getAllPayments();
  return NextResponse.json({ payments, count: payments.length });
}

const FAILURE_REASONS = [
  'Card declined by issuing bank (Insufficient funds).',
  'UPI PIN entry timed out by customer bank.',
  'Transaction rejected due to risk threshold policy.',
  'Incorrect CVV or authentication credentials.',
  'Bank server is temporarily undergoing maintenance.',
];

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get('Idempotency-Key');

  if (!idempotencyKey || idempotencyKey.trim() === '') {
    return NextResponse.json(
      { error: 'Header "Idempotency-Key" is required to prevent double payments.' },
      { status: 400 }
    );
  }

  // Idempotency check: if this key has already been processed, return the exact same payment!
  const existingPayment = findPaymentByIdempotencyKey(idempotencyKey);
  if (existingPayment) {
    return NextResponse.json({
      paymentId: existingPayment.paymentId,
      status: existingPayment.status,
      reason: existingPayment.reason,
      isReplay: true,
      message: 'Idempotency key matched existing transaction.',
    });
  }

  let body: PaymentRequestPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { orderId, method, forceStatus } = body;
  if (!orderId || !method) {
    return NextResponse.json(
      { error: 'Fields "orderId" and "method" are required.' },
      { status: 400 }
    );
  }

  // Artificial network/gateway processing delay: ~1.5s
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Determine initial status:
  // Randomly distribute across SUCCESS, FAILED, PENDING unless forced for testing/demo
  let selectedStatus: 'SUCCESS' | 'FAILED' | 'PENDING';

  if (forceStatus && ['SUCCESS', 'FAILED', 'PENDING'].includes(forceStatus)) {
    selectedStatus = forceStatus;
  } else {
    const random = Math.random();
    if (random < 0.45) {
      selectedStatus = 'SUCCESS';
    } else if (random < 0.75) {
      selectedStatus = 'PENDING';
    } else {
      selectedStatus = 'FAILED';
    }
  }

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const order = getOrder(orderId);

  // If status is PENDING, pre-determine its eventual outcome after ~5s
  let finalStatus: 'SUCCESS' | 'FAILED' | undefined;
  if (selectedStatus === 'PENDING') {
    finalStatus = Math.random() < 0.8 ? 'SUCCESS' : 'FAILED';
  }

  const reason =
    selectedStatus === 'FAILED'
      ? FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)]
      : undefined;

  const newPayment: PaymentRecord = {
    paymentId,
    idempotencyKey,
    orderId,
    method,
    amountPaise: order.totalPaise,
    status: selectedStatus,
    finalStatus,
    reason,
    createdAt: Date.now(),
  };

  savePayment(newPayment);

  return NextResponse.json({
    paymentId: newPayment.paymentId,
    status: newPayment.status,
    reason: newPayment.reason,
  });
}
