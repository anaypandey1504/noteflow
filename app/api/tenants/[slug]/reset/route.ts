import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';
import { requireAuth } from '@/lib/middleware';
import { handleCors, addCorsHeaders } from '@/app/api/options';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

// POST /api/tenants/[slug]/reset - Reset tenant subscription to free (for testing)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only admins can reset subscriptions
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can reset subscriptions' },
        { status: 403 }
      );
    }

    // Verify the user belongs to the tenant being reset
    if (user.tenant_slug !== params.slug) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Reset tenant subscription to free
    const result = await dbHelpers.run(`
      UPDATE tenants 
      SET subscription_plan = 'free'
      WHERE slug = ?
    `, [params.slug]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return addCorsHeaders(NextResponse.json({
      message: 'Subscription reset to Free successfully',
      subscription_plan: 'free'
    }));
  } catch (error) {
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}
