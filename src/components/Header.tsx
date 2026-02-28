'use client';

import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/pantry', label: 'Pantry' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/shopping', label: 'Shop' },
  ];

  return (
    <header className="bg-green-700 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl sm:text-2xl font-bold tracking-tight hover:opacity-90"
          onClick={() => setMenuOpen(false)}
        >
          Ingreedie
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-lg hover:underline underline-offset-4 ${
                isActive(link.href) ? 'underline font-semibold' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-5 py-2 rounded-lg text-lg font-medium transition"
            >
              {loggingOut ? 'Logging out...' : 'Log Out'}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="bg-white text-green-700 px-5 py-2 rounded-lg text-lg font-medium hover:bg-green-50 transition"
            >
              Log In
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-green-600 transition"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span
              className={`block h-0.5 w-6 bg-white transition-transform ${
                menuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-opacity ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-transform ${
                menuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-green-600 bg-green-700">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition ${
                  isActive(link.href)
                    ? 'bg-green-600 text-white'
                    : 'text-green-100 hover:bg-green-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-green-600 mt-2">
              {session ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={loggingOut}
                  className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-200 hover:bg-green-600 transition"
                >
                  {loggingOut ? 'Logging out...' : 'Log Out'}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-green-100 hover:bg-green-600 transition"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
