import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';
import { requireAuth } from '@/lib/middleware';
import { handleCors, addCorsHeaders } from '@/app/api/options';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

// GET /api/notes/[id] - Retrieve a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    const note = await dbHelpers.get(`
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE id = ? AND tenant_id = ?
    `, [params.id, user.tenant_id]);

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return addCorsHeaders(NextResponse.json(note));
  } catch (error) {
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if note exists and belongs to tenant
    const existingNote = await dbHelpers.get(`
      SELECT id FROM notes WHERE id = ? AND tenant_id = ?
    `, [params.id, user.tenant_id]);

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    await dbHelpers.run(`
      UPDATE notes 
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND tenant_id = ?
    `, [title, content, params.id, user.tenant_id]);

    const updatedNote = await dbHelpers.get(`
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE id = ?
    `, [params.id]);

    return addCorsHeaders(NextResponse.json(updatedNote));
  } catch (error) {
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Check if note exists and belongs to tenant
    const existingNote = await dbHelpers.get(`
      SELECT id FROM notes WHERE id = ? AND tenant_id = ?
    `, [params.id, user.tenant_id]);

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    await dbHelpers.run('DELETE FROM notes WHERE id = ? AND tenant_id = ?', [params.id, user.tenant_id]);

    return addCorsHeaders(NextResponse.json({ message: 'Note deleted successfully' }));
  } catch (error) {
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}
