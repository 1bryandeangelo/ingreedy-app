/**
 * Recipe Optimization Engine
 *
 * Given a primary recipe the user wants to make, this engine:
 * 1. Calculates what perishable surplus will remain after cooking
 * 2. Searches for companion recipes that use up those surplus ingredients
 * 3. Ranks companions by how much surplus they consume before expiration
 * 4. Returns optimized recipe combos that minimize total waste
 *
 * This is the "killer feature" — turning Ingreedie from "what can I cook"
 * into "here's your zero-waste weekly plan."
 */

import type { MealDBMeal, PantryItem } from '@/types';
import {
  calculateSurplus,
  extractIngredientsWithQuantity,
  convertUnits,
  normalizeUnit,
  type RecipeSurplus,
} from '@/lib/quantity';
import {
  searchMealsByIngredient,
  getMealById,
  extractIngredients,
} from '@/lib/mealdb';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CompanionRecipe {
  meal: MealDBMeal;
  surplusUsed: {
    ingredientName: string;
    amountUsed: number;
    unit: string;
    percentOfSurplus: number; // 0-100, how much of the surplus this recipe uses
  }[];
  totalSurplusConsumed: number; // sum of percentOfSurplus across all ingredients
  additionalIngredientsNeeded: string[]; // what else you'd need to buy
}

export interface OptimizationResult {
  primaryMeal: MealDBMeal;
  surplus: RecipeSurplus[];
  perishableSurplus: RecipeSurplus[]; // only items with shelfLife <= 7d
  companions: CompanionRecipe[];
}

// ---------------------------------------------------------------------------
// Core optimization logic
// ---------------------------------------------------------------------------

/**
 * Given a primary recipe and the user's pantry, find companion recipes
 * that use up the perishable surplus.
 */
export async function findCompanionRecipes(
  primaryMeal: MealDBMeal,
  pantryItems: PantryItem[],
  maxCompanions: number = 5
): Promise<OptimizationResult> {
  // Step 1: Calculate surplus after making the primary recipe
  const surplus = calculateSurplus(primaryMeal, pantryItems);
  const perishableSurplus = surplus.filter(
    (s) => s.shelfLifeDays !== null && s.shelfLifeDays <= 7
  );

  // If no perishable surplus, no optimization needed
  if (perishableSurplus.length === 0) {
    return {
      primaryMeal,
      surplus,
      perishableSurplus: [],
      companions: [],
    };
  }

  // Step 2: Search for recipes that use the surplus ingredients
  const candidateMeals = new Map<string, MealDBMeal>();

  for (const s of perishableSurplus) {
    // Search by the surplus ingredient name
    const searchResults = await searchMealsByIngredient(s.ingredientName);

    // Fetch full details for each (limited to avoid API hammering)
    const toFetch = searchResults.slice(0, 10);
    const details = await Promise.allSettled(
      toFetch.map((m) => getMealById(m.idMeal))
    );

    for (const result of details) {
      if (result.status === 'fulfilled' && result.value) {
        const meal = result.value;
        // Don't suggest the same recipe as the primary
        if (meal.idMeal !== primaryMeal.idMeal) {
          candidateMeals.set(meal.idMeal, meal);
        }
      }
    }
  }

  // Step 3: Score each candidate by how much surplus it consumes
  const scored: CompanionRecipe[] = [];

  for (const meal of Array.from(candidateMeals.values())) {
    const recipeIngredients = extractIngredientsWithQuantity(meal);
    const surplusUsed: CompanionRecipe['surplusUsed'] = [];

    for (const s of perishableSurplus) {
      // Find if this recipe uses the surplus ingredient
      const match = recipeIngredients.find((ri) => {
        const riName = ri.name.toLowerCase();
        const sName = s.ingredientName.toLowerCase();
        return riName === sName || riName.includes(sName) || sName.includes(riName);
      });

      if (match) {
        // Calculate how much of the surplus this recipe would consume
        const neededInSurplusUnits = convertUnits(
          match.quantity.amount,
          match.quantity.unit,
          s.unit
        );

        if (neededInSurplusUnits !== null) {
          const actualUsed = Math.min(neededInSurplusUnits, s.surplus);
          const percentUsed = Math.round((actualUsed / s.surplus) * 100);

          surplusUsed.push({
            ingredientName: s.ingredientName,
            amountUsed: Math.round(actualUsed * 100) / 100,
            unit: s.unit,
            percentOfSurplus: percentUsed,
          });
        } else {
          // Can't convert units — assume it uses some
          surplusUsed.push({
            ingredientName: s.ingredientName,
            amountUsed: 0,
            unit: s.unit,
            percentOfSurplus: 50, // optimistic estimate
          });
        }
      }
    }

    if (surplusUsed.length === 0) continue;

    // Calculate what else you'd need beyond what's in pantry + surplus
    const allRecipeIngredients = extractIngredients(meal);
    const pantryNames = pantryItems.map((p) => p.name.toLowerCase());
    const surplusNames = surplus.map((s) => s.ingredientName.toLowerCase());
    const haveNames = [...pantryNames, ...surplusNames];

    const additionalIngredientsNeeded = allRecipeIngredients.filter(
      (ing) => !haveNames.some((h) => h.includes(ing) || ing.includes(h))
    );

    const totalSurplusConsumed = surplusUsed.reduce(
      (sum, s) => sum + s.percentOfSurplus,
      0
    );

    scored.push({
      meal,
      surplusUsed,
      totalSurplusConsumed,
      additionalIngredientsNeeded,
    });
  }

  // Step 4: Rank — prioritize recipes that:
  // 1. Use the most surplus (highest totalSurplusConsumed)
  // 2. Require the fewest additional ingredients
  scored.sort((a, b) => {
    // Primary: more surplus consumed is better
    if (b.totalSurplusConsumed !== a.totalSurplusConsumed) {
      return b.totalSurplusConsumed - a.totalSurplusConsumed;
    }
    // Secondary: fewer additional ingredients needed
    return a.additionalIngredientsNeeded.length - b.additionalIngredientsNeeded.length;
  });

  return {
    primaryMeal,
    surplus,
    perishableSurplus,
    companions: scored.slice(0, maxCompanions),
  };
}

/**
 * Quick check: does a recipe have perishable surplus?
 * Used for showing the optimization badge without running full analysis.
 */
export function hasPerishableSurplus(
  meal: MealDBMeal,
  pantryItems: PantryItem[]
): boolean {
  const surplus = calculateSurplus(meal, pantryItems);
  return surplus.some(
    (s) => s.shelfLifeDays !== null && s.shelfLifeDays <= 7
  );
}

/**
 * Given multiple companion options, find the best combo of N recipes
 * that together maximize total surplus consumption.
 *
 * This is a greedy approach — pick the best single recipe first,
 * recalculate remaining surplus, then pick the next best, etc.
 */
export function findOptimalCombo(
  companions: CompanionRecipe[],
  perishableSurplus: RecipeSurplus[],
  maxRecipes: number = 3
): CompanionRecipe[] {
  if (companions.length === 0) return [];

  const combo: CompanionRecipe[] = [];
  const remainingSurplus = perishableSurplus.map((s) => ({
    ...s,
    remaining: s.surplus,
  }));

  for (let i = 0; i < maxRecipes && companions.length > 0; i++) {
    // Re-score based on remaining surplus
    let bestIdx = 0;
    let bestScore = -1;

    for (let j = 0; j < companions.length; j++) {
      const c = companions[j];
      let score = 0;

      for (const used of c.surplusUsed) {
        const rem = remainingSurplus.find(
          (s) => s.ingredientName.toLowerCase() === used.ingredientName.toLowerCase()
        );
        if (rem && rem.remaining > 0) {
          const actualUse = Math.min(used.amountUsed, rem.remaining);
          score += (actualUse / rem.remaining) * 100;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestIdx = j;
      }
    }

    if (bestScore <= 0) break;

    const picked = companions[bestIdx];
    combo.push(picked);

    // Deduct from remaining surplus
    for (const used of picked.surplusUsed) {
      const rem = remainingSurplus.find(
        (s) => s.ingredientName.toLowerCase() === used.ingredientName.toLowerCase()
      );
      if (rem) {
        rem.remaining = Math.max(0, rem.remaining - used.amountUsed);
      }
    }

    // Remove picked from candidates
    companions = companions.filter((_, idx) => idx !== bestIdx);
  }

  return combo;
}
