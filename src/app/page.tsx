'use client';

import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';

export default function HomePage() {
  const { session } = useSupabase();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold text-green-800 mb-4">
          Ingreedie
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Use What You Have. Waste Less.
        </p>
        <p className="text-lg text-gray-500 mb-10">
          Track your pantry ingredients, get smart recipe suggestions based on
          what you already own, and prioritize items before they expire.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          {session ? (
            <>
              <Link
                href="/pantry"
                className="bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-green-800 transition shadow-lg"
              >
                Open Pantry
              </Link>
              <Link
                href="/recipes"
                className="bg-white border-2 border-green-700 text-green-700 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-green-50 transition shadow-lg"
              >
                Find Recipes
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-green-800 transition shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="bg-white border-2 border-green-700 text-green-700 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-green-50 transition shadow-lg"
              >
                Log In
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Track Your Pantry
            </h3>
            <p className="text-gray-500">
              Add ingredients with quantities, units, and expiration dates.
              Autocomplete makes it fast.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl mb-3">🍳</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Smart Recipes
            </h3>
            <p className="text-gray-500">
              Get recipe suggestions ranked by how many of your ingredients they
              use. No more guessing.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl mb-3">⏰</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Reduce Waste
            </h3>
            <p className="text-gray-500">
              Expiring items get flagged. Recipes using those items are
              prioritized so nothing goes to waste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
