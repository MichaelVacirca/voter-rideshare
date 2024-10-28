// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /middleware.ts
// Middleware configuration - because every request deserves a proper welcome!

import createMiddleware from 'next-intl/middleware';
import { SITE_CONFIG } from './config';

/** 
 * Create the internationalization middleware
 * This handles locale detection and routing
 */
export default createMiddleware({
  // List of all locales that are supported
  locales: SITE_CONFIG.locales,
  
  // Used when no locale matches
  defaultLocale: SITE_CONFIG.defaultLocale,
  
  // Locale prefix strategy
  localePrefix: 'always'
});

export const config = {
  // Match all pathnames except for
  // - Files with extensions (e.g. images)
  // - API routes
  // - _next
  // - Public files
  matcher: ['/((?!api|_next|.*\\..*).*)']
};