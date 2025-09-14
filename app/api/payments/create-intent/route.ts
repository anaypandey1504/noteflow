import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { requireAuth } from '@/lib/middleware';
import { addCorsHeaders } from '@/app/api/options';

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Both admins and members can initiate payments

    const { amount } = await request.json();
    
    if (!amount || amount !== 2000) {
      return NextResponse.json(
        { error: 'Invalid amount. Pro plan costs $2000.' },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(amount);
    
    return addCorsHeaders(NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id
    }));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
