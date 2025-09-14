import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbHelpers } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'member';
  tenant_id: number;
  tenant_slug: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'member';
  tenantId: number;
  tenantSlug: string;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await dbHelpers.get(`
    SELECT u.id, u.email, u.password_hash, u.role, u.tenant_id, t.slug as tenant_slug
    FROM users u
    JOIN tenants t ON u.tenant_id = t.id
    WHERE u.email = ?
  `, [email]) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    tenant_id: user.tenant_id,
    tenant_slug: user.tenant_slug,
  };
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id,
    tenantSlug: user.tenant_slug,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getUserFromToken(token: string): User | null {
  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    tenant_id: payload.tenantId,
    tenant_slug: payload.tenantSlug,
  };
}
