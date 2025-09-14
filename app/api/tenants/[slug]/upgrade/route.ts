import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';
import { requireAuth } from '@/lib/middleware';
import { handleCors, addCorsHeaders } from '@/app/api/options';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

// POST /api/tenants/[slug]/upgrade - Upgrade tenant subscription
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only admins can upgrade subscriptions
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can upgrade subscriptions' },
        { status: 403 }
      );
    }

    // Verify the user belongs to the tenant being upgraded
    if (user.tenant_slug !== params.slug) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update tenant subscription to pro
    const result = await dbHelpers.run(`
      UPDATE tenants 
      SET subscription_plan = 'pro'
      WHERE slug = ?
    `, [params.slug]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return addCorsHeaders(NextResponse.json({
      message: 'Subscription upgraded to Pro successfully',
      subscription_plan: 'pro',
      tenant_slug: params.slug,
      success: true
    }));
  } catch (error) {
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}
