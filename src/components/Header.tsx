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

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-green-700 text-white shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-90">
          🥬 Ingreedy
        </Link>

        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/pantry"
            className={`text-base md:text-lg hover:underline underline-offset-4 ${
              isActive('/pantry') ? 'underline font-semibold' : ''
            }`}
          >
            Pantry
          </Link>
          <Link
            href="/recipes"
            className={`text-base md:text-lg hover:underline underline-offset-4 ${
              isActive('/recipes') ? 'underline font-semibold' : ''
            }`}
          >
            Recipes
          </Link>
          <Link
            href="/shopping"
            className={`text-base md:text-lg hover:underline underline-offset-4 ${
              isActive('/shopping') ? 'underline font-semibold' : ''
            }`}
          >
            🛒 Shop
          </Link>

          {session ? (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 md:px-5 py-2 rounded-lg text-base md:text-lg font-medium transition"
            >
              {loggingOut ? 'Logging out…' : 'Log Out'}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="bg-white text-green-700 px-4 md:px-5 py-2 rounded-lg text-base md:text-lg font-medium hover:bg-green-50 transition"
            >
              Log In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
