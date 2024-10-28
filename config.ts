// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /config.ts
// Configuration constants - because magic numbers are for magicians, not developers!

export const SITE_CONFIG = {
  /** Title of the application */
  title: 'Voter Rideshare',
  
  /** Description for SEO */
  description: 'Connecting voters with volunteer drivers for election day transportation',
  
  /** Available locales for the application */
  locales: ['en'],
  
  /** Default locale */
  defaultLocale: 'en',
  
  /** Base URL for the application */
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
} as const;

/** Redis cache configuration */
export const REDIS_CONFIG = {
  /** Time to live for cached items in seconds */
  defaultTTL: 3600, // 1 hour
  
  /** Prefix for all cache keys */
  keyPrefix: 'vrs:', // voter-rideshare
} as const;

/** MongoDB configuration */
export const MONGODB_CONFIG = {
  /** Database name */
  dbName: 'voter_rideshare',
  
  /** Collection names */
  collections: {
    users: 'users',
    rides: 'rides',
    locations: 'locations',
  },
} as const;

/** Authentication configuration */
export const AUTH_CONFIG = {
  /** Session token cookie name */
  cookieName: 'vrs_session',
  
  /** Maximum age of session in seconds */
  maxAge: 60 * 60 * 24 * 7, // 1 week
} as const;