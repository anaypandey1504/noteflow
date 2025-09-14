import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from './auth';

export function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return getUserFromToken(token);
}

export function requireAuth(request: NextRequest) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  return user;
}

export function requireRole(user: any, allowedRoles: string[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
}
