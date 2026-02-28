'use client';

import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';

export default function HomePage() {
  const { session } = useSupabase();

  return (
    <div className="overflow-hidden">
      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
          <p className="text-green-200 text-sm sm:text-base font-medium tracking-widest uppercase mb-4">
            Smart pantry management
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Cook what you have.
            <br />
            <span className="text-green-300">Waste nothing.</span>
          </h1>
          <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ingreedie matches your pantry to 2.3 million recipes, tracks
            expiration dates, and suggests meals that use up every last
            ingredient.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            {session ? (
              <>
                <Link
                  href="/pantry"
                  className="bg-white text-green-800 px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-green-50 transition shadow-lg shadow-green-900/20"
                >
                  Open Pantry
                </Link>
                <Link
                  href="/recipes"
                  className="border-2 border-white/40 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-white/10 transition"
                >
                  Find Recipes
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="bg-white text-green-800 px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-green-50 transition shadow-lg shadow-green-900/20"
                >
                  Get Started — Free
                </Link>
                <Link
                  href="/auth/login"
                  className="border-2 border-white/40 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-white/10 transition"
                >
                  Log In
                </Link>
              </>
            )}
          </div>

          {/* Stats bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold">2.3M+</div>
              <div className="text-green-200 text-sm mt-1">Recipes</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">200+</div>
              <div className="text-green-200 text-sm mt-1">Smart ingredients</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">Zero</div>
              <div className="text-green-200 text-sm mt-1">Food wasted</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-green-700 font-semibold text-sm uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Three steps to zero waste
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl font-bold mx-auto mb-5">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Stock your pantry
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Add what you have at home. Quick-add buttons for common
                ingredients with automatic package sizes and expiration dates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl font-bold mx-auto mb-5">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Get matched recipes
              </h3>
              <p className="text-gray-500 leading-relaxed">
                We search 2.3 million real recipes and rank them by how much of
                your pantry they use. Expiring items get priority.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl font-bold mx-auto mb-5">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Use every last bit
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Our optimization engine suggests companion recipes for
                leftovers, so surplus ingredients never go to waste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-green-700 font-semibold text-sm uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              More than just recipes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎯"
              title="Quantity-Aware Matching"
              description="Not just 'do you have chicken' — we check if you have enough. See exact match percentages for every recipe."
            />
            <FeatureCard
              icon="⏰"
              title="Expiration Tracking"
              description="Items nearing their date get flagged. Recipes using those ingredients are automatically prioritized."
            />
            <FeatureCard
              icon="♻️"
              title="Surplus Optimization"
              description="Cooked a recipe and have leftover broth? We find companion recipes to use every last drop."
            />
            <FeatureCard
              icon="🛒"
              title="Smart Shopping List"
              description="Know exactly what you need to buy. Items auto-calculate based on recipe deficits and standard package sizes."
            />
            <FeatureCard
              icon="📦"
              title="Standard Package Sizes"
              description="We know eggs come by the dozen and broth by the carton. Shopping lists match how you actually buy."
            />
            <FeatureCard
              icon="🍳"
              title="Real Recipes"
              description="2.3 million recipes from AllRecipes, Food Network, and top food blogs. Not AI-generated slop."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BOTTOM CTA
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Stop throwing away groceries
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            The average American household wastes $1,500 in food per year.
            Ingreedie helps you use what you buy.
          </p>

          {session ? (
            <Link
              href="/pantry"
              className="inline-block bg-green-700 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-green-800 transition shadow-lg"
            >
              Open Your Pantry
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="inline-block bg-green-700 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-green-800 transition shadow-lg"
            >
              Get Started — It is Free
            </Link>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Ingreedie. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/pantry" className="hover:text-gray-600 transition">
              Pantry
            </Link>
            <Link href="/recipes" className="hover:text-gray-600 transition">
              Recipes
            </Link>
            <Link href="/shopping" className="hover:text-gray-600 transition">
              Shopping List
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
