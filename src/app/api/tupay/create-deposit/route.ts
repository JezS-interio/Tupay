export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createDeposit } from '@/lib/tupay';
import { createOrder } from '@/lib/firebase/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      document,
      documentType,
      address,
      city,
      items,
      subtotal,
      shipping,
      tax,
      total,
      userId,
      userEmail,
      userName,
      notes,
      shippingAddress,
    } = body;

    // Create order in Firestore first (pending payment)
    const orderId = await createOrder({
      userId,
      userEmail,
      userName,
      items,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'Tupay',
      notes: notes || '',
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://intitech-tupay.vercel.app';

    const payload = {
      country: process.env.TUPAY_COUNTRY || 'PE',
      currency: process.env.TUPAY_CURRENCY || 'PEN',
      amount: Number(total.toFixed(2)),
      payment_method: process.env.TUPAY_PAYMENT_METHOD || 'XA',
      invoice_id: orderId,
      payer: {
        email: email,
        document: document,
        document_type: documentType || 'DNI',
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        address: address ? {
          street: address,
          city: city || undefined,
        } : undefined,
      },
      success_url: `${baseUrl}/pago-exitoso?order=${orderId}`,
      error_url: `${baseUrl}/pago-error?order=${orderId}`,
      back_url: `${baseUrl}/checkout`,
      notification_url: `${baseUrl}/api/tupay/webhook`,
      expiration: 30,
      test: true,
      mobile: false,
    };

    const tupayResponse = await createDeposit(payload);

    return NextResponse.json({
      redirect_url: tupayResponse.redirect_url,
      deposit_id: tupayResponse.deposit_id,
      order_id: orderId,
    });
  } catch (error: unknown) {
    console.error('Tupay create-deposit error:', error);
    const message = error instanceof Error ? error.message : 'Error al crear el pago';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
