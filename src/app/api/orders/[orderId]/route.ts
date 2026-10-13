import { NextRequest, NextResponse } from 'next/server';
import { getOrder, findLatestPaymentForOrder, resetPaymentsForOrder } from '@/lib/mock-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  const url = new URL(request.url);
  const shouldReset = url.searchParams.get('reset') === 'true';

  if (shouldReset) {
    resetPaymentsForOrder(orderId);
  }

  const order = getOrder(orderId);
  const latestPayment = shouldReset ? undefined : findLatestPaymentForOrder(orderId);

  return NextResponse.json({
    ...order,
    latestPayment,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  resetPaymentsForOrder(orderId);
  return NextResponse.json({ success: true, message: `Payments reset for order ${orderId}` });
}
