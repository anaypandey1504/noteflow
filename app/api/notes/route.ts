import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/middleware';
import { handleCors, addCorsHeaders } from '@/app/api/options';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

// GET /api/notes - List all notes for the current tenant
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    const notes = await dbHelpers.all(`
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE tenant_id = ?
      ORDER BY updated_at DESC
    `, [user.tenant_id]);

    return addCorsHeaders(NextResponse.json(notes));
  } catch (error) {
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return addCorsHeaders(NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      ));
    }
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Check subscription limits
    const tenant = await dbHelpers.get('SELECT subscription_plan FROM tenants WHERE id = ?', [user.tenant_id]) as any;
    
    if (tenant.subscription_plan === 'free') {
      const noteCount = await dbHelpers.get('SELECT COUNT(*) as count FROM notes WHERE tenant_id = ?', [user.tenant_id]) as any;
      if (noteCount.count >= 3) {
        return NextResponse.json(
          { error: 'Free plan limited to 3 notes. Please upgrade to Pro.' },
          { status: 403 }
        );
      }
    }

    const result = await dbHelpers.run(`
      INSERT INTO notes (title, content, tenant_id, user_id)
      VALUES (?, ?, ?, ?)
    `, [title, content, user.tenant_id, user.id]);

    const newNote = await dbHelpers.get(`
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE id = ?
    `, [result.lastID]);

    return addCorsHeaders(NextResponse.json(newNote, { status: 201 }));
  } catch (error) {
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return addCorsHeaders(NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      ));
    }
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}
