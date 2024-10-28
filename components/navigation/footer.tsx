// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /components/navigation/footer.tsx
// Footer component - where all good journeys come to rest!

import Link from 'next/link';

/**
 * Footer component that provides the footer navigation and information
 */
export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About section */}
          <div>
            <h3 className="font-bold mb-4">About Us</h3>
            <p className="text-sm text-gray-600">
              Voter Rideshare connects voters with volunteer drivers to ensure everyone can exercise their right to vote.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Follow us on social media for updates and news.
              </p>
              {/* Add social media links here */}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Voter Rideshare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}