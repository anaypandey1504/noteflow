import { NextRequest, NextResponse } from 'next/server';
import { confirmPaymentIntent } from '@/lib/stripe';
import { dbHelpers } from '@/lib/database';
import { requireAuth } from '@/lib/middleware';
import { addCorsHeaders } from '@/app/api/options';

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Both admins and members can confirm payments

    const { paymentIntentId } = await request.json();
    
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    const paymentResult = await confirmPaymentIntent(paymentIntentId);
    
    if (paymentResult.success) {
      // Update tenant subscription to pro
      const result = await dbHelpers.run(`
        UPDATE tenants 
        SET subscription_plan = 'pro'
        WHERE id = ?
      `, [user.tenant_id]);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Failed to upgrade subscription' },
          { status: 500 }
        );
      }

      return addCorsHeaders(NextResponse.json({
        success: true,
        message: 'Subscription upgraded to Pro successfully!',
        subscription_plan: 'pro'
      }));
    } else {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
