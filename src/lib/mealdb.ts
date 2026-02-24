import type { MealDBMeal, RankedMeal } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_MEALDB_BASE_URL || 'https://www.themealdb.com/api/json/v1/1';

export async function searchMealsByIngredient(ingredient: string): Promise<MealDBMeal[]> {
  const res = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
  const data = await res.json();
  return data.meals || [];
}

export async function getMealById(id: string): Promise<MealDBMeal | null> {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals?.[0] || null;
}

export async function searchMealsByName(name: string): Promise<MealDBMeal[]> {
  const res = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
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
        pantryLower.some(
          (p) => ing.includes(p) || p.includes(ing)
        )
      );
      const hasExpiringMatch = matchedIngredients.some((ing) =>
        expiringLower.some(
          (e) => ing.includes(e) || e.includes(ing)
        )
      );
      const matchPercent =
        totalIngredients.length > 0
          ? Math.round((matchedIngredients.length / totalIngredients.length) * 100)
          : 0;

      return {
        ...meal,
        matchedIngredients,
        totalIngredients,
        matchPercent,
        hasExpiringMatch,
      };
    })
    .filter((m) => m.matchPercent > 0)
    .sort((a, b) => {
      // Prioritize expiring ingredient matches, then by match %
      if (a.hasExpiringMatch && !b.hasExpiringMatch) return -1;
      if (!a.hasExpiringMatch && b.hasExpiringMatch) return 1;
      return b.matchPercent - a.matchPercent;
    });
}
