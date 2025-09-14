import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';
import { requireAuth } from '@/lib/middleware';
import { handleCors, addCorsHeaders } from '@/app/api/options';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    const tenant = await dbHelpers.get(`
      SELECT id, slug, name, subscription_plan, created_at
      FROM tenants
      WHERE slug = ?
    `, [params.slug]);

    if (!tenant) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      ));
    }

    // Ensure user belongs to this tenant
    if (user.tenant_slug !== params.slug) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      ));
    }

    return addCorsHeaders(NextResponse.json(tenant));
  } catch (error) {
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}
