// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/page.tsx
// Homepage component - where democracy meets the road!

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

/**
 * Homepage component that serves as the landing page for the application
 */
export default function HomePage() {
  // Initialize translations
  const t = useTranslations('Index');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600 mb-8">{t('description')}</p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/request-ride">{t('requestRide')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/offer-ride">{t('offerRide')}</Link>
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">{t('howItWorks')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Request a Ride</CardTitle>
              <CardDescription>Need transportation to vote?</CardDescription>
            </CardHeader>
            <CardContent>
              Submit your details and we'll connect you with a volunteer driver.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Get Matched</CardTitle>
              <CardDescription>We'll find the perfect match</CardDescription>
            </CardHeader>
            <CardContent>
              Our system matches you with nearby drivers based on your location and schedule.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Exercise Your Right</CardTitle>
              <CardDescription>Make your voice heard</CardDescription>
            </CardHeader>
            <CardContent>
              Get to your polling location safely and exercise your right to vote.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}