// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /auth.config.ts
// Authentication configuration - securing democracy, one login at a time!

import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import Email from 'next-auth/providers/email';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedRoutes = [
        '/rides/request',
        '/rides/offer',
        '/profile',
        '/admin',
      ];
      
      const isProtectedRoute = protectedRoutes.some(route => 
        nextUrl.pathname.startsWith(route)
      );

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.isDriver = user.isDriver;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!;
        session.user.isDriver = token.isDriver as boolean;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
};