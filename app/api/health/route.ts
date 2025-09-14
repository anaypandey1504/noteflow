import { NextRequest, NextResponse } from 'next/server';
import { handleCors, addCorsHeaders } from '@/app/api/options';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

export async function GET() {
  return addCorsHeaders(NextResponse.json({ status: 'ok' }));
}
