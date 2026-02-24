import type { MealDBMeal, RankedMeal, PantryItem } from '@/types';
import {
  analyzeRecipeDeficits,
} from '@/lib/quantity';

const BASE_URL =
  process.env.NEXT_PUBLIC_MEALDB_BASE_URL ||
  'https://www.themealdb.com/api/json/v1/1';

export async function searchMealsByIngredient(
  ingredient: string
): Promise<MealDBMeal[]> {
  const res = await fetch(
    `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`
  );
  const data = await res.json();
  return data.meals || [];
}

export async function getMealById(id: string): Promise<MealDBMeal | null> {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals?.[0] || null;
}

export async function searchMealsByName(name: string): Promise<MealDBMeal[]> {
  const res = await fetch(
    `${BASE_URL}/search.php?s=${encodeURIComponent(name)}`
  );
  const data = await res.json();
  return data.meals || [];
}

export function extractIngredients(meal: MealDBMeal): string[] {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient && ingredient.trim() !== '') {
      ingredients.push(ingredient.trim().toLowerCase());
    }
  }
  return ingredients;
}

/**
 * QUANTITY-AWARE ranking.
 *
 * Instead of just "do you have chicken?" (binary),
 * this checks "do you have ENOUGH chicken for this recipe?"
 *
 * Returns detailed info per recipe:
 * - sufficientIngredients: have enough of
 * - insufficientIngredients: have but not enough (with deficit amount)
 * - missingIngredients: don't have at all
 * - quantityMatchPercent: % of ingredients you have ENOUGH of
 */
export function rankMealsByPantryQuantity(
  meals: MealDBMeal[],
  pantryItems: PantryItem[],
  expiringNames: string[]
): RankedMeal[] {
  const expiringLower = expiringNames.map((n) => n.toLowerCase());

  return meals
    .map((meal) => {
      const totalIngredients = extractIngredients(meal);
      const deficits = analyzeRecipeDeficits(meal, pantryItems);

      const sufficientIngredients: string[] = [];
      const insufficientIngredients: {
        name: string;
        deficit: number;
        unit: string;
      }[] = [];
      const missingIngredients: string[] = [];
      const matchedIngredients: string[] = [];

      for (const d of deficits) {
        if (d.have === null) {
          missingIngredients.push(d.ingredientName);
        } else if (d.sufficient) {
          sufficientIngredients.push(d.ingredientName);
          matchedIngredients.push(d.ingredientName);
        } else {
          insufficientIngredients.push({
            name: d.ingredientName,
            deficit: d.deficit,
            unit: d.deficitUnit,
          });
          matchedIngredients.push(d.ingredientName);
        }
      }

      const hasExpiringMatch = matchedIngredients.some((ing) =>
        expiringLower.some((e) => ing.includes(e) || e.includes(ing))
      );

      const matchPercent =
        totalIngredients.length > 0
          ? Math.round(
              (matchedIngredients.length / totalIngredients.length) * 100
            )
          : 0;

      const quantityMatchPercent =
        deficits.length > 0
          ? Math.round(
              (sufficientIngredients.length / deficits.length) * 100
            )
          : 0;

      return {
        ...meal,
        matchedIngredients,
        totalIngredients,
        matchPercent,
        hasExpiringMatch,
        sufficientIngredients,
        insufficientIngredients,
        missingIngredients,
        quantityMatchPercent,
      };
    })
    .filter((m) => m.matchPercent > 0)
    .sort((a, b) => {
      if (a.hasExpiringMatch && !b.hasExpiringMatch) return -1;
      if (!a.hasExpiringMatch && b.hasExpiringMatch) return 1;
      if (b.quantityMatchPercent !== a.quantityMatchPercent) {
        return b.quantityMatchPercent - a.quantityMatchPercent;
      }
      return b.matchPercent - a.matchPercent;
    });
}

/**
 * Legacy ranking (name-only, no quantity awareness).
 */
export function rankMealsByPantry(
  meals: MealDBMeal[],
  pantryNames: string[],
  expiringNames: string[]
): RankedMeal[] {
  const pantryLower = pantryNames.map((n) => n.toLowerCase());
  const expiringLower = expiringNames.map((n) => n.toLowerCase());

  return meals
    .map((meal) => {
      const totalIngredients = extractIngredients(meal);
      const matchedIngredients = totalIngredients.filter((ing) =>
        pantryLower.some((p) => ing.includes(p) || p.includes(ing))
      );
      const hasExpiringMatch = matchedIngredients.some((ing) =>
        expiringLower.some((e) => ing.includes(e) || e.includes(ing))
      );
      const matchPercent =
        totalIngredients.length > 0
          ? Math.round(
              (matchedIngredients.length / totalIngredients.length) * 100
            )
          : 0;

      return {
        ...meal,
        matchedIngredients,
        totalIngredients,
        matchPercent,
        hasExpiringMatch,
        sufficientIngredients: [],
        insufficientIngredients: [],
        missingIngredients: [],
        quantityMatchPercent: 0,
      };
    })
    .filter((m) => m.matchPercent > 0)
    .sort((a, b) => {
      if (a.hasExpiringMatch && !b.hasExpiringMatch) return -1;
      if (!a.hasExpiringMatch && b.hasExpiringMatch) return 1;
      return b.matchPercent - a.matchPercent;
    });
}
