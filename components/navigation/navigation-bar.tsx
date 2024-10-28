// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /components/navigation/navigation-bar.tsx
// Navigation bar component - guiding users through the digital democracy highway!

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

/**
 * Navigation bar component that provides the main navigation for the application
 */
export function NavigationBar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  // Array of navigation items
  const navItems = [
    { href: '/', label: t('home') },
    { href: '/rides', label: t('rides') },
    { href: '/profile', label: t('profile') },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and site title */}
          <Link href="/" className="font-bold text-xl">
            Voter Rideshare
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/auth/signin">{t('signIn')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}