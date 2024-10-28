// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/layout.tsx
// Root layout component - the foundation of our UI kingdom!

import { Inter } from 'next/font/google';
import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { SITE_CONFIG } from '@/config';
import { NavigationBar } from '@/components/navigation/navigation-bar';
import { Footer } from '@/components/navigation/footer';

// Initialize the Inter font
const inter = Inter({ subsets: ['latin'] });

// Define the props interface for the RootLayout component
interface RootLayoutProps {
  /** The child components to render */
  children: ReactNode;
  /** The current locale from the dynamic route */
  params: { locale: string };
}

/**
 * Root layout component that wraps all pages
 * Provides the basic HTML structure and common UI elements
 */
export default function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  // Set the locale for the current request
  unstable_setRequestLocale(locale);

  return (
    <html lang={locale}>
      <head>
        <title>{SITE_CONFIG.title}</title>
        <meta name="description" content={SITE_CONFIG.description} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <NavigationBar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

/**
 * Generate metadata for the layout
 */
export function generateMetadata({ params: { locale } }: RootLayoutProps) {
  return {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    alternates: {
      canonical: SITE_CONFIG.baseUrl,
      languages: {
        [locale]: `/${locale}`,
      },
    },
  };
}