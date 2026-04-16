export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDepositStatus } from '@/lib/tupay';
import { updateOrderStatus, updatePaymentStatus } from '@/lib/firebase/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deposit_id } = body;

    if (!deposit_id) {
      return NextResponse.json({ error: 'deposit_id requerido' }, { status: 400 });
    }

    // Query Tupay for current deposit status
    const depositData = await getDepositStatus(Number(deposit_id));
    const { status, invoice_id } = depositData;

    if (!invoice_id) {
      console.error('Tupay webhook: invoice_id missing in deposit', deposit_id);
      return NextResponse.json({ ok: true });
    }

    // Map Tupay status to our order statuses
    switch (status) {
      case 'COMPLETED':
        await updatePaymentStatus(invoice_id, 'paid');
        await updateOrderStatus(invoice_id, 'processing');
        break;
      case 'CANCELLED':
      case 'EXPIRED':
        await updatePaymentStatus(invoice_id, 'failed');
        await updateOrderStatus(invoice_id, 'cancelled');
        break;
      case 'PENDING':
      case 'WAITING':
      case 'IN_PROGRESS':
        // No action needed, order remains pending
        break;
      default:
        console.log(`Tupay webhook: unhandled status ${status} for order ${invoice_id}`);
    }

    // Tupay expects 2XX to stop retries
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Tupay webhook error:', error);
    // Return 500 so Tupay retries the notification
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
