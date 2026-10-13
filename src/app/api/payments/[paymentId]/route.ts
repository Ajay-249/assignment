import { NextRequest, NextResponse } from 'next/server';
import { getUpdatedPaymentStatus } from '@/lib/mock-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  if (!paymentId) {
    return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
  }

  const payment = getUpdatedPaymentStatus(paymentId);

  if (!payment) {
    return NextResponse.json(
      { error: `Payment record with ID ${paymentId} not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    paymentId: payment.paymentId,
    orderId: payment.orderId,
    method: payment.method,
    amountPaise: payment.amountPaise,
    status: payment.status,
    reason: payment.reason,
    createdAt: payment.createdAt,
    completedAt: payment.completedAt,
    elapsedMs: Date.now() - payment.createdAt,
  });
}
