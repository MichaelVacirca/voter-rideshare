// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /middleware/security.ts
// Security middleware - protecting our democracy one header at a time!

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://voterrideshare.org',
  'https://staging.voterrideshare.org',
  process.env.NEXT_PUBLIC_APP_URL,
];

export function SecurityHeaders(request: NextRequest, response: NextResponse) {
  // Validate origin for CORS
  const origin = request.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  // Security Headers
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com https://maps.googleapis.com",
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com",
    "connect-src 'self' https://*.googleapis.com https://sentry.io https://api.voterrideshare.org",
    "frame-src 'none'",
    "media-src 'none'",
    "object-src 'none'",
    `base-uri 'self'`,
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  const headers = {
    // Content Security Policy
    'Content-Security-Policy': cspDirectives.join('; '),
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Frame Options
    'X-Frame-Options': 'DENY',
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // HSTS (Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Permissions Policy
    'Permissions-Policy': [
      'accelerometer=()',
      'camera=()',
      'geolocation=(self)',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', '),
  };

  // Apply all security headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}