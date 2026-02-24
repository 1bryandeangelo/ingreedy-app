'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { differenceInDays, parseISO } from 'date-fns';
import {
  searchMealsByIngredient,
  getMealById,
  rankMealsByPantry,
  extractIngredients,
} from '@/lib/mealdb';
import type { PantryItem, RankedMeal, MealDBMeal } from '@/types';

export default function RecipesPage() {
  const { supabase, session } = useSupabase();
  const router = useRouter();

  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [rankedMeals, setRankedMeals] = useState<RankedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [mealDetails, setMealDetails] = useState<Record<string, MealDBMeal>>({});
  const [filterExpiring, setFilterExpiring] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, router]);

  // Fetch pantry items
  useEffect(() => {
    if (!session) return;

    const fetchPantry = async () => {
      const { data } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', session.user.id);

      if (data) {
        setPantryItems(data);
      }
      setLoading(false);
    };

    fetchPantry();
  }, [session, supabase]);

  // Get expiring item names (within 5 days)
  const expiringNames = pantryItems
    .filter((item) => {
      if (!item.expiration_date) return false;
      const days = differenceInDays(parseISO(item.expiration_date), new Date());
      return days >= 0 && days <= 5;
    })
    .map((item) => item.name);

  const pantryNames = pantryItems.map((item) => item.name);

  // Search recipes
  const searchRecipes = useCallback(async () => {
    if (pantryNames.length === 0) return;
    setSearching(true);
    setError('');

    try {
      // Search by up to 5 pantry ingredients to get a good variety
      const searchTerms = pantryNames.slice(0, 5);
      const allMealPreviews: MealDBMeal[] = [];
      const seenIds = new Set<string>();

      for (const term of searchTerms) {
        const meals = await searchMealsByIngredient(term);
        for (const meal of meals) {
          if (!seenIds.has(meal.idMeal)) {
            seenIds.add(meal.idMeal);
            allMealPreviews.push(meal);
          }
        }
      }

      // Fetch full details for each meal to get all ingredients
      const fullMeals: MealDBMeal[] = [];
      // Limit to 30 to avoid too many API calls
      const toFetch = allMealPreviews.slice(0, 30);

      const results = await Promise.allSettled(
        toFetch.map((m) => getMealById(m.idMeal))
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          fullMeals.push(result.value);
        }
      }

      // Rank them
      const ranked = rankMealsByPantry(fullMeals, pantryNames, expiringNames);
      setRankedMeals(ranked);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error(err);
    }

    setSearching(false);
  }, [pantryNames, expiringNames]);

  // Auto-search when pantry loads
  useEffect(() => {
    if (!loading && pantryItems.length > 0 && rankedMeals.length === 0) {
      searchRecipes();
    }
  }, [loading, pantryItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMealDetails = async (mealId: string) => {
    if (expandedMeal === mealId) {
      setExpandedMeal(null);
      return;
    }

    setExpandedMeal(mealId);

    if (!mealDetails[mealId]) {
      const detail = await getMealById(mealId);
      if (detail) {
        setMealDetails((prev) => ({ ...prev, [mealId]: detail }));
      }
    }
  };

  const displayedMeals = filterExpiring
    ? rankedMeals.filter((m) => m.hasExpiringMatch)
    : rankedMeals;

  if (!session) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-800">
            Recipe Suggestions
          </h1>
          <p className="text-gray-500 mt-1">
            Ranked by how well they match your pantry
          </p>
        </div>

        <div className="flex items-center gap-4">
          {expiringNames.length > 0 && (
            <button
              onClick={() => setFilterExpiring(!filterExpiring)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterExpiring
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              ⏰ Uses Expiring ({expiringNames.length})
            </button>
          )}
          <button
            onClick={searchRecipes}
            disabled={searching || pantryItems.length === 0}
            className="bg-green-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-800 disabled:opacity-50 transition"
          >
            {searching ? 'Searching…' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading || searching ? (
        <div className="text-center text-gray-500 py-20">
          <div className="text-4xl mb-3">🍳</div>
          <p>{loading ? 'Loading your pantry…' : 'Finding recipes…'}</p>
        </div>
      ) : pantryItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-600 text-lg mb-2">Your pantry is empty!</p>
          <p className="text-gray-400 mb-6">
            Add some ingredients first, then come back for recipe ideas.
          </p>
          <button
            onClick={() => router.push('/pantry')}
            className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
          >
            Go to Pantry
          </button>
        </div>
      ) : displayedMeals.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🤷</div>
          <p className="text-gray-600 text-lg mb-2">
            {filterExpiring
              ? 'No recipes found using your expiring items.'
              : 'No matching recipes found.'}
          </p>
          {filterExpiring && (
            <button
              onClick={() => setFilterExpiring(false)}
              className="text-green-700 font-medium hover:underline mt-2"
            >
              Show all recipes instead
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedMeals.map((meal) => (
            <div
              key={meal.idMeal}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition"
            >
              {/* Meal Image & Info */}
              <div className="relative">
                <Image
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
                {/* Match % badge */}
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold ${
                    meal.matchPercent >= 75
                      ? 'bg-green-600 text-white'
                      : meal.matchPercent >= 50
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {meal.matchPercent}% match
                </div>
                {/* Expiring badge */}
                {meal.hasExpiringMatch && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ⏰ Uses expiring
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {meal.strMeal}
                </h3>
                <div className="flex gap-2 mb-3 text-sm text-gray-500">
                  {meal.strCategory && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {meal.strCategory}
                    </span>
                  )}
                  {meal.strArea && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {meal.strArea}
                    </span>
                  )}
                </div>

                {/* Matched ingredients */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-green-700">
                      {meal.matchedIngredients.length}
                    </span>{' '}
                    of {meal.totalIngredients.length} ingredients in your pantry:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.matchedIngredients.map((ing) => (
                      <span
                        key={ing}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          expiringNames.some(
                            (e) =>
                              e.toLowerCase().includes(ing) ||
                              ing.includes(e.toLowerCase())
                          )
                            ? 'bg-orange-100 text-orange-700 font-semibold'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing ingredients */}
                {meal.totalIngredients.length > meal.matchedIngredients.length && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">Missing:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.totalIngredients
                        .filter((ing) => !meal.matchedIngredients.includes(ing))
                        .map((ing) => (
                          <span
                            key={ing}
                            className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                          >
                            {ing}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Expand for instructions */}
                <button
                  onClick={() => toggleMealDetails(meal.idMeal)}
                  className="text-green-700 text-sm font-medium hover:underline mt-1"
                >
                  {expandedMeal === meal.idMeal
                    ? 'Hide Instructions ▲'
                    : 'View Instructions ▼'}
                </button>

                {expandedMeal === meal.idMeal && mealDetails[meal.idMeal] && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {mealDetails[meal.idMeal].strInstructions}
                    </p>
                    {mealDetails[meal.idMeal].strYoutube && (
                      <a
                        href={mealDetails[meal.idMeal].strYoutube!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-sm text-red-600 hover:underline font-medium"
                      >
                        📺 Watch on YouTube
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {displayedMeals.length > 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">
          Showing {displayedMeals.length} recipe
          {displayedMeals.length !== 1 ? 's' : ''}
          {filterExpiring ? ' using expiring items' : ''}
        </p>
      )}
    </div>
  );
}
