// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /middleware/auth.ts
// Authentication middleware - because we don't let just anyone drive our democracy!

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AUTH_CONFIG } from '@/config';

/**
 * Authentication middleware for protected routes
 * @param request - The incoming request
 * @returns NextResponse
 */
export async function authMiddleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token) {
    // Redirect to login if no token is present
    const loginUrl = new URL('/auth/signin', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Configuration for which routes require authentication
 */
export const config = {
  matcher: [
    '/rides/:path*',
    '/profile/:path*',
    '/api/rides/:path*',
  ],
};