import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/middleware';
import { addCorsHeaders } from '@/app/api/options';
import bcrypt from 'bcryptjs';

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only admins can invite users
    requireRole(user, ['admin']);

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either admin or member' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await dbHelpers.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    // Create new user
    const result = await dbHelpers.run(`
      INSERT INTO users (email, password_hash, role, tenant_id)
      VALUES (?, ?, ?, ?)
    `, [email, passwordHash, role, user.tenant_id]);

    return addCorsHeaders(NextResponse.json({
      message: 'User invited successfully',
      user: {
        id: result.lastID,
        email,
        role,
        tempPassword
      }
    }, { status: 201 }));
  } catch (error) {
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Only admins can invite users' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
