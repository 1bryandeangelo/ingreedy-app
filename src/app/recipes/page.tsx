'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { differenceInDays, parseISO } from 'date-fns';
import {
  searchEdamamRecipes,
  getEdamamRecipeById,
  rankEdamamMeals,
  getEdamamExtras,
} from '@/lib/edamam';
import { calculateSurplus, analyzeRecipeDeficits, type RecipeSurplus } from '@/lib/quantity';
import { findCompanionRecipes, findOptimalCombo, type CompanionRecipe, type OptimizationResult } from '@/lib/optimizer';
import type { PantryItem, RankedMeal, MealDBMeal } from '@/types';

// ──────────────────────────────────────────
// Surplus Popup Component with Optimization
// ──────────────────────────────────────────
function SurplusPopup({
  surplus,
  meal,
  pantryItems,
  onClose,
  onAddToShoppingList,
}: {
  surplus: RecipeSurplus[];
  meal: MealDBMeal;
  pantryItems: PantryItem[];
  onClose: () => void;
  onAddToShoppingList: (companionMeal: MealDBMeal) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [companions, setCompanions] = useState<CompanionRecipe[]>([]);
  const [loadingCompanions, setLoadingCompanions] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const perishable = surplus.filter(
    (s) => s.shelfLifeDays !== null && s.shelfLifeDays <= 7
  );
  const nonPerishable = surplus.filter(
    (s) => s.shelfLifeDays === null || s.shelfLifeDays > 7
  );

  const findCompanions = async () => {
    setLoadingCompanions(true);
    try {
      const result = await findCompanionRecipes(meal, pantryItems, 10);
      const optimal = findOptimalCombo(
        [...result.companions],
        result.perishableSurplus,
        3
      );
      setCompanions(optimal);
    } catch (err) {
      console.error('Optimization error:', err);
    }
    setLoadingCompanions(false);
    setSearched(true);
  };

  return (
    <div
      ref={ref}
      className="absolute z-50 bottom-full mb-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4"
      style={{ width: companions.length > 0 ? '360px' : '288px' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-amber-800">
          Leftover Alert
        </p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          x
        </button>
      </div>
      <p className="text-xs text-amber-700 mb-3">
        After making this recipe, you&apos;ll have these perishables left over.
      </p>

      {perishable.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {perishable.map((s) => (
            <div
              key={s.ingredientName}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-amber-900 font-medium">
                {s.ingredientName}
              </span>
              <span className="text-amber-700">
                {s.surplus} {s.unit} left ·{' '}
                <span
                  className={
                    s.shelfLifeDays !== null && s.shelfLifeDays <= 3
                      ? 'text-red-600 font-bold'
                      : 'text-amber-600'
                  }
                >
                  {s.shelfLifeDays}d shelf life
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {nonPerishable.length > 0 && (
        <details className="mb-3">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
            Non-perishable surplus ({nonPerishable.length} items)
          </summary>
          <div className="mt-1.5 space-y-1 pl-2">
            {nonPerishable.map((s) => (
              <div key={s.ingredientName} className="text-xs text-gray-500">
                {s.ingredientName}: {s.surplus} {s.unit}
                {s.shelfLifeDays ? ` (${s.shelfLifeDays}d)` : ''}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Companion recipes section */}
      {!searched && perishable.length > 0 && (
        <button
          onClick={findCompanions}
          disabled={loadingCompanions}
          className="w-full mt-1 px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition disabled:opacity-50"
        >
          {loadingCompanions
            ? 'Finding recipes to use up leftovers...'
            : 'Find recipes to use up leftovers'}
        </button>
      )}

      {loadingCompanions && (
        <div className="text-center py-3">
          <p className="text-xs text-gray-400">Searching recipes...</p>
        </div>
      )}

      {searched && companions.length === 0 && !loadingCompanions && (
        <p className="text-xs text-gray-400 mt-2 italic">
          No companion recipes found for these leftovers.
        </p>
      )}

      {companions.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-green-800 mb-2">
            Suggested recipes to use up leftovers:
          </p>
          <div className="space-y-2.5">
            {companions.map((c) => (
              <div
                key={c.meal.idMeal}
                className="bg-green-50 rounded-lg p-2.5"
              >
                <p className="text-sm font-medium text-gray-800">
                  {c.meal.strMeal}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.surplusUsed.map((s) => (
                    <span
                      key={s.ingredientName}
                      className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded"
                    >
                      Uses {s.amountUsed} {s.unit} {s.ingredientName}
                    </span>
                  ))}
                </div>
                {c.additionalIngredientsNeeded.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Also needs: {c.additionalIngredientsNeeded.slice(0, 3).join(', ')}
                    {c.additionalIngredientsNeeded.length > 3 &&
                      ` +${c.additionalIngredientsNeeded.length - 3} more`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// Recipe Details Component (expanded view)
// ──────────────────────────────────────────
function RecipeDetails({ meal }: { meal: MealDBMeal }) {
  const extras = getEdamamExtras(meal);

  if (extras) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500">
          {extras.caloriesPerServing > 0 && (
            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
              {extras.caloriesPerServing} cal/serving
            </span>
          )}
          {extras.totalTime > 0 && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              {extras.totalTime} min
            </span>
          )}
          {extras.yield > 0 && (
            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
              {extras.yield} servings
            </span>
          )}
        </div>

        {/* Diet labels */}
        {extras.dietLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {extras.dietLabels.map((label: string) => (
              <span
                key={label}
                className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Full ingredient list */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-600 mb-1.5">
            Full ingredient list:
          </p>
          <ul className="text-sm text-gray-700 space-y-1 pl-4">
            {extras.ingredientLines.map((line: string, idx: number) => (
              <li key={idx} className="list-disc">
                {line}
              </li>
            ))}
          </ul>
        </div>

        {/* Source link */}
        <a
          href={extras.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 text-sm text-green-700 hover:underline font-medium"
        >
          View full instructions on {extras.source} &rarr;
        </a>
      </div>
    );
  }

  // Fallback for MealDB recipes
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
        {meal.strInstructions}
      </p>
      {meal.strYoutube && (
        <a
          href={meal.strYoutube!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm text-red-600 hover:underline font-medium"
        >
          Watch on YouTube
        </a>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// Main Recipes Page
// ──────────────────────────────────────────
export default function RecipesPage() {
  const { supabase, session } = useSupabase();
  const router = useRouter();

  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [rankedMeals, setRankedMeals] = useState<RankedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [mealDetails, setMealDetails] = useState<Record<string, MealDBMeal>>(
    {}
  );
  const [filterExpiring, setFilterExpiring] = useState(false);
  const [error, setError] = useState('');

  // Surplus state — keyed by meal ID
  const [surplusMap, setSurplusMap] = useState<
    Record<string, RecipeSurplus[]>
  >({});
  const [surplusPopupOpen, setSurplusPopupOpen] = useState<string | null>(null);
  const [addedToShoppingList, setAddedToShoppingList] = useState<Set<string>>(new Set());
  const [addingToList, setAddingToList] = useState<string | null>(null);

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
      const days = differenceInDays(
        parseISO(item.expiration_date),
        new Date()
      );
      return days >= 0 && days <= 5;
    })
    .map((item) => item.name);

  // Search recipes using Edamam + quantity-aware ranking
  const searchRecipes = useCallback(async () => {
    if (pantryItems.length === 0) return;
    setSearching(true);
    setError('');

    try {
      // Build search query from pantry items (top ingredients)
      const searchTerms = pantryItems.slice(0, 5).map((i) => i.name);
      const query = searchTerms.join(' ');

      const { meals } = await searchEdamamRecipes(query);

      // Edamam returns full details already — no need for separate fetch
      // Quantity-aware ranking
      const ranked = rankEdamamMeals(meals, pantryItems, expiringNames);
      setRankedMeals(ranked);

      // Pre-calculate surplus for all ranked meals
      const newSurplusMap: Record<string, RecipeSurplus[]> = {};
      for (const meal of meals) {
        const surplus = calculateSurplus(meal, pantryItems);
        if (surplus.length > 0) {
          newSurplusMap[meal.idMeal] = surplus;
        }
      }
      setSurplusMap(newSurplusMap);

      // Store full details (already have them from Edamam)
      const detailsMap: Record<string, MealDBMeal> = {};
      for (const meal of meals) {
        detailsMap[meal.idMeal] = meal;
      }
      setMealDetails(detailsMap);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error(err);
    }

    setSearching(false);
  }, [pantryItems, expiringNames]);

  // Auto-search when pantry loads
  useEffect(() => {
    if (!loading && pantryItems.length > 0 && rankedMeals.length === 0) {
      searchRecipes();
    }
  }, [loading, pantryItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle instructions (separate from surplus)
  const toggleInstructions = async (mealId: string) => {
    if (expandedMeal === mealId) {
      setExpandedMeal(null);
      return;
    }

    setExpandedMeal(mealId);

    // Details are already cached from the search (Edamam returns full data)
    if (!mealDetails[mealId]) {
      const detail = await getEdamamRecipeById(mealId);
      if (detail) {
        setMealDetails((prev) => ({ ...prev, [mealId]: detail }));
      }
    }
  };

  // Get surplus urgency level for a meal
  const getSurplusUrgency = (
    mealId: string
  ): 'none' | 'green' | 'orange' | 'red' => {
    const surplus = surplusMap[mealId];
    if (!surplus || surplus.length === 0) return 'none';

    const perishable = surplus.filter(
      (s) => s.shelfLifeDays !== null && s.shelfLifeDays <= 7
    );
    if (perishable.length === 0) return 'green';

    const hasUrgent = perishable.some(
      (s) => s.shelfLifeDays !== null && s.shelfLifeDays <= 3
    );
    return hasUrgent ? 'red' : 'orange';
  };

  // Add missing + insufficient ingredients to shopping list
  const addToShoppingList = async (meal: RankedMeal) => {
    if (!session) return;
    setAddingToList(meal.idMeal);

    // Get full meal details for quantity info
    let detail = mealDetails[meal.idMeal];
    if (!detail) {
      detail = (await getEdamamRecipeById(meal.idMeal)) as MealDBMeal;
      if (detail) {
        setMealDetails((prev) => ({ ...prev, [meal.idMeal]: detail }));
      }
    }

    if (!detail) {
      setAddingToList(null);
      return;
    }

    const deficits = analyzeRecipeDeficits(detail, pantryItems);
    const itemsToAdd = deficits
      .filter((d) => !d.sufficient)
      .map((d) => ({
        user_id: session.user.id,
        ingredient_name: d.ingredientName,
        amount: d.have ? d.deficit : d.needed.amount,
        unit: d.deficitUnit,
        for_recipe: meal.strMeal,
        for_meal_id: meal.idMeal,
        checked: false,
      }));

    if (itemsToAdd.length > 0) {
      await supabase.from('shopping_list').insert(itemsToAdd as any);
    }

    setAddedToShoppingList((prev) => new Set(Array.from(prev).concat(meal.idMeal)));
    setAddingToList(null);
  };

  const displayedMeals = filterExpiring
    ? rankedMeals.filter((m) => m.hasExpiringMatch)
    : rankedMeals;

  if (!session) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-800">
            Recipe Suggestions
          </h1>
          <p className="text-gray-500 mt-1">
            Ranked by ingredient match — quantities verified
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

      {/* Legend */}
      {rankedMeals.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
            Have enough
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />
            Have it, need more
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
            Missing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-400" />
            Expiring soon
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-base">📦</span>
            Leftover surplus (click for details)
          </span>
        </div>
      )}

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
          {displayedMeals.map((meal) => {
            const isExpanded = expandedMeal === meal.idMeal;
            const surplusUrgency = getSurplusUrgency(meal.idMeal);
            const isSurplusOpen = surplusPopupOpen === meal.idMeal;

            return (
              <div
                key={meal.idMeal}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition"
              >
                {/* Meal Image & Badges */}
                <div className="relative">
                  <Image
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                  />

                  {/* Quantity match badge (top-right) */}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold ${
                      meal.quantityMatchPercent >= 75
                        ? 'bg-green-600 text-white'
                        : meal.quantityMatchPercent >= 50
                        ? 'bg-yellow-500 text-white'
                        : meal.quantityMatchPercent > 0
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {meal.quantityMatchPercent}% ready
                  </div>

                  {/* Old match % (smaller, below) */}
                  {meal.matchPercent !== meal.quantityMatchPercent && (
                    <div className="absolute top-12 right-3 px-2 py-0.5 rounded-full text-xs font-medium bg-black/40 text-white/90">
                      {meal.matchPercent}% have some
                    </div>
                  )}

                  {/* Expiring badge (top-left) */}
                  {meal.hasExpiringMatch && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ⏰ Uses expiring
                    </div>
                  )}

                  {/* Surplus badge (bottom-left on image) */}
                  {surplusUrgency !== 'none' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (isSurplusOpen) {
                          setSurplusPopupOpen(null);
                        } else {
                          // Ensure we have full meal details for the optimizer
                          if (!mealDetails[meal.idMeal]) {
                            const detail = await getEdamamRecipeById(meal.idMeal);
                            if (detail) {
                              setMealDetails((prev) => ({ ...prev, [meal.idMeal]: detail }));
                            }
                          }
                          setSurplusPopupOpen(meal.idMeal);
                        }
                      }}
                      className={`absolute bottom-3 left-3 w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-lg border-2 transition hover:scale-110 ${
                        surplusUrgency === 'red'
                          ? 'bg-red-100 border-red-400 animate-pulse'
                          : surplusUrgency === 'orange'
                          ? 'bg-amber-100 border-amber-400'
                          : 'bg-green-100 border-green-300'
                      }`}
                      title="View leftover surplus"
                    >
                      📦
                    </button>
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

                  {/* ==========================================
                      QUANTITY-AWARE INGREDIENT BREAKDOWN
                      ========================================== */}

                  {/* Sufficient — you have enough */}
                  {meal.sufficientIngredients.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-green-700 font-medium mb-1">
                        ✓ Have enough ({meal.sufficientIngredients.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {meal.sufficientIngredients.map((ing) => (
                          <span
                            key={ing}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              expiringNames.some(
                                (e) =>
                                  e.toLowerCase().includes(ing) ||
                                  ing.includes(e.toLowerCase())
                              )
                                ? 'bg-orange-100 text-orange-700 font-semibold ring-1 ring-orange-300'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insufficient — have it but not enough */}
                  {meal.insufficientIngredients.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-yellow-700 font-medium mb-1">
                        ⚠ Need more ({meal.insufficientIngredients.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {meal.insufficientIngredients.map((ing) => (
                          <span
                            key={ing.name}
                            className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800"
                            title={`Need ${ing.deficit} more ${ing.unit}`}
                          >
                            {ing.name}
                            <span className="ml-1 text-yellow-600 font-medium">
                              +{ing.deficit.toFixed(ing.deficit < 1 ? 1 : 0)}{' '}
                              {ing.unit}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing — don't have at all */}
                  {meal.missingIngredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 font-medium mb-1">
                        ✗ Missing ({meal.missingIngredients.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {meal.missingIngredients.map((ing) => (
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

                  {/* Summary line */}
                  <div className="text-xs text-gray-400 mb-3 border-t border-gray-50 pt-2">
                    {meal.sufficientIngredients.length} ready ·{' '}
                    {meal.insufficientIngredients.length} need more ·{' '}
                    {meal.missingIngredients.length} missing — out of{' '}
                    {meal.totalIngredients.length} total
                  </div>

                  {/* Action buttons row */}
                  <div className="flex items-center gap-3 relative flex-wrap">
                    {/* View Instructions button */}
                    <button
                      onClick={() => toggleInstructions(meal.idMeal)}
                      className="text-green-700 text-sm font-medium hover:underline"
                    >
                      {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                    </button>

                    {/* Add to Shopping List button */}
                    {(meal.missingIngredients.length > 0 ||
                      meal.insufficientIngredients.length > 0) && (
                      <button
                        onClick={() => addToShoppingList(meal)}
                        disabled={
                          addingToList === meal.idMeal ||
                          addedToShoppingList.has(meal.idMeal)
                        }
                        className={`text-sm px-3 py-1 rounded-lg font-medium transition ${
                          addedToShoppingList.has(meal.idMeal)
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {addingToList === meal.idMeal
                          ? 'Adding…'
                          : addedToShoppingList.has(meal.idMeal)
                          ? '✓ Added to list'
                          : `🛒 Add ${
                              meal.missingIngredients.length +
                              meal.insufficientIngredients.length
                            } to shopping list`}
                      </button>
                    )}

                    {/* Surplus popup (anchored to this row) */}
                    {isSurplusOpen && surplusMap[meal.idMeal] && (
                      <SurplusPopup
                        surplus={surplusMap[meal.idMeal]}
                        meal={mealDetails[meal.idMeal] || meal}
                        pantryItems={pantryItems}
                        onClose={() => setSurplusPopupOpen(null)}
                        onAddToShoppingList={() => {}}
                      />
                    )}
                  </div>

                  {/* ==========================================
                      EXPANDED VIEW: Recipe Details
                      ========================================== */}
                  {isExpanded && mealDetails[meal.idMeal] && (
                    <RecipeDetails meal={mealDetails[meal.idMeal]} />
                  )}
                </div>
              </div>
            );
          })}
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
