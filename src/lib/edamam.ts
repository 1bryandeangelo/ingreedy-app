/**
 * Edamam Recipe Search API Adapter
 *
 * This module wraps the Edamam API and maps its response to our existing
 * MealDBMeal interface so the rest of the app (recipes page, optimizer,
 * surplus calculator, shopping list) works without changes.
 *
 * Edamam provides:
 * - 2.3M+ recipes from real food blogs
 * - Structured ingredient data (food, quantity, measure, weight)
 * - Nutrition info, diet labels, health labels
 * - Images in multiple sizes
 * - Source URL (no cooking instructions directly — links to original recipe)
 *
 * Free tier: 10,000 requests/month
 */

import type { MealDBMeal, PantryItem, RankedMeal } from '@/types';
import { analyzeRecipeDeficits } from '@/lib/quantity';

// ---------------------------------------------------------------------------
// Edamam API Types
// ---------------------------------------------------------------------------

interface EdamamIngredient {
  text: string;        // "1 cup chicken broth"
  quantity: number;    // 1
  measure: string;     // "cup"
  food: string;        // "chicken broth"
  weight: number;      // weight in grams
  foodCategory: string;
  foodId: string;
  image: string | null;
}

interface EdamamRecipe {
  uri: string;
  label: string;       // recipe name
  image: string;
  images: {
    THUMBNAIL?: { url: string; width: number; height: number };
    SMALL?: { url: string; width: number; height: number };
    REGULAR?: { url: string; width: number; height: number };
    LARGE?: { url: string; width: number; height: number };
  };
  source: string;      // "Food Network", "AllRecipes", etc.
  url: string;         // link to original recipe
  yield: number;       // servings
  dietLabels: string[];
  healthLabels: string[];
  cautions: string[];
  ingredientLines: string[];  // human-readable ingredient strings
  ingredients: EdamamIngredient[];
  calories: number;
  totalWeight: number;
  totalTime: number;   // minutes
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  totalNutrients: Record<string, { label: string; quantity: number; unit: string }>;
}

interface EdamamSearchResponse {
  from: number;
  to: number;
  count: number;
  _links: {
    next?: { href: string; title: string };
  };
  hits: {
    recipe: EdamamRecipe;
    _links: { self: { href: string; title: string } };
  }[];
}

// ---------------------------------------------------------------------------
// API Configuration
// ---------------------------------------------------------------------------

const EDAMAM_APP_ID = process.env.NEXT_PUBLIC_EDAMAM_APP_ID || '';
const EDAMAM_APP_KEY = process.env.NEXT_PUBLIC_EDAMAM_APP_KEY || '';
const EDAMAM_BASE_URL = 'https://api.edamam.com/api/recipes/v2';

// ---------------------------------------------------------------------------
// Unit mapping: Edamam measure → our normalized units
// ---------------------------------------------------------------------------

const MEASURE_MAP: Record<string, string> = {
  'cup': 'cup',
  'tablespoon': 'tbsp',
  'teaspoon': 'tsp',
  'ounce': 'oz',
  'pound': 'lb',
  'gram': 'g',
  'kilogram': 'kg',
  'milliliter': 'ml',
  'liter': 'L',
  'fluid ounce': 'fl_oz',
  'gallon': 'gal',
  'pinch': 'pinch',
  'clove': 'count',
  'slice': 'count',
  'piece': 'count',
  'whole': 'count',
  'large': 'count',
  'medium': 'count',
  'small': 'count',
  'can': 'can',
  'bunch': 'bunch',
  'head': 'count',
  'stalk': 'count',
  'sprig': 'count',
  'leaf': 'count',
  'strip': 'count',
  '<unit>': 'count',     // Edamam uses <unit> for unitless items
  '': 'count',
};

function normalizeEdamamMeasure(measure: string | null): string {
  if (!measure) return 'count';
  const lower = measure.toLowerCase().trim();
  return MEASURE_MAP[lower] || lower;
}

// ---------------------------------------------------------------------------
// Convert Edamam recipe → MealDBMeal format
// ---------------------------------------------------------------------------

/**
 * Maps an Edamam recipe to our MealDBMeal interface.
 * This allows the entire existing UI and logic to work unchanged.
 */
function edamamToMealDB(recipe: EdamamRecipe): MealDBMeal {
  // Extract a unique ID from the Edamam URI
  // URI format: "http://www.edamam.com/ontologies/edamam.owl#recipe_abc123"
  const idMatch = recipe.uri.match(/#recipe_(.+)$/);
  const id = idMatch ? idMatch[1] : recipe.uri;

  const meal: any = {
    idMeal: id,
    strMeal: recipe.label,
    strMealThumb: recipe.images?.REGULAR?.url || recipe.image,
    strCategory: recipe.dishType?.[0] || '',
    strArea: recipe.cuisineType?.[0] || '',
    strInstructions: '', // Edamam doesn't provide instructions
    strYoutube: '',
    strSource: recipe.url,
    // Edamam-specific extras
    _edamam: {
      source: recipe.source,
      sourceUrl: recipe.url,
      yield: recipe.yield,
      totalTime: recipe.totalTime,
      calories: Math.round(recipe.calories),
      caloriesPerServing: Math.round(recipe.calories / (recipe.yield || 1)),
      dietLabels: recipe.dietLabels,
      healthLabels: recipe.healthLabels,
      ingredientLines: recipe.ingredientLines,
      ingredients: recipe.ingredients,
    },
  };

  // Map ingredients to strIngredient1..20 and strMeasure1..20
  // This preserves compatibility with our quantity parser
  recipe.ingredients.forEach((ing, i) => {
    if (i >= 20) return; // MealDB only supports 20 ingredients
    const idx = i + 1;
    meal[`strIngredient${idx}`] = ing.food;

    // Build a measure string our parser can handle
    if (ing.quantity && ing.quantity > 0) {
      const unit = normalizeEdamamMeasure(ing.measure);
      meal[`strMeasure${idx}`] = `${ing.quantity} ${unit}`;
    } else {
      meal[`strMeasure${idx}`] = '';
    }
  });

  // Fill remaining slots with empty strings
  for (let i = recipe.ingredients.length + 1; i <= 20; i++) {
    meal[`strIngredient${i}`] = '';
    meal[`strMeasure${i}`] = '';
  }

  return meal as MealDBMeal;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Search recipes by query string (e.g., ingredient names, recipe names).
 */
export async function searchEdamamRecipes(
  query: string,
  options: {
    from?: number;
    to?: number;
    diet?: string;
    health?: string;
    cuisineType?: string;
    mealType?: string;
    dishType?: string;
  } = {}
): Promise<{ meals: MealDBMeal[]; totalResults: number; nextPage: string | null }> {
  const params = new URLSearchParams({
    type: 'public',
    q: query,
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
  });

  if (options.diet) params.set('diet', options.diet);
  if (options.health) params.set('health', options.health);
  if (options.cuisineType) params.set('cuisineType', options.cuisineType);
  if (options.mealType) params.set('mealType', options.mealType);
  if (options.dishType) params.set('dishType', options.dishType);

  const res = await fetch(`${EDAMAM_BASE_URL}?${params.toString()}`);

  if (!res.ok) {
    console.error('Edamam API error:', res.status, await res.text());
    return { meals: [], totalResults: 0, nextPage: null };
  }

  const data: EdamamSearchResponse = await res.json();

  return {
    meals: data.hits.map((hit) => edamamToMealDB(hit.recipe)),
    totalResults: data.count,
    nextPage: data._links.next?.href || null,
  };
}

/**
 * Search by specific ingredients (comma-separated).
 * This is the primary search for Ingreedy — "what can I make with these?"
 */
export async function searchByIngredients(
  ingredients: string[]
): Promise<MealDBMeal[]> {
  // Edamam handles multi-ingredient search via the q parameter
  const query = ingredients.join(' ');
  const { meals } = await searchEdamamRecipes(query);
  return meals;
}

/**
 * Fetch a single recipe by its Edamam URI or ID.
 */
export async function getEdamamRecipeById(
  id: string
): Promise<MealDBMeal | null> {
  const uri = id.startsWith('http')
    ? id
    : `http://www.edamam.com/ontologies/edamam.owl#recipe_${id}`;

  const params = new URLSearchParams({
    type: 'public',
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
  });

  const res = await fetch(
    `${EDAMAM_BASE_URL}/by-uri?${params.toString()}&uri=${encodeURIComponent(uri)}`
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.hits || data.hits.length === 0) return null;

  return edamamToMealDB(data.hits[0].recipe);
}

/**
 * Fetch next page of results from Edamam pagination.
 */
export async function fetchNextPage(
  nextPageUrl: string
): Promise<{ meals: MealDBMeal[]; totalResults: number; nextPage: string | null }> {
  const res = await fetch(nextPageUrl);

  if (!res.ok) {
    return { meals: [], totalResults: 0, nextPage: null };
  }

  const data: EdamamSearchResponse = await res.json();

  return {
    meals: data.hits.map((hit) => edamamToMealDB(hit.recipe)),
    totalResults: data.count,
    nextPage: data._links.next?.href || null,
  };
}

// ---------------------------------------------------------------------------
// Ranking (same logic as mealdb.ts but using Edamam structured data)
// ---------------------------------------------------------------------------

/**
 * Rank Edamam recipes by pantry match with quantity awareness.
 * Uses the same deficit analysis as MealDB recipes since we mapped
 * to the same MealDBMeal interface.
 */
export function rankEdamamMeals(
  meals: MealDBMeal[],
  pantryItems: PantryItem[],
  expiringNames: string[]
): RankedMeal[] {
  const pantryNames = pantryItems.map((p) => p.name.toLowerCase());

  return meals
    .map((meal) => {
      // Extract ingredients from the meal
      const totalIngredients: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        if (ing && ing.trim() !== '') {
          totalIngredients.push(ing.trim().toLowerCase());
        }
      }

      // Simple name matching (same as before)
      const matchedIngredients = totalIngredients.filter((ing) =>
        pantryNames.some(
          (p) => p.includes(ing) || ing.includes(p)
        )
      );

      const hasExpiringMatch = matchedIngredients.some((ing) =>
        expiringNames.some(
          (e) =>
            e.toLowerCase().includes(ing) ||
            ing.includes(e.toLowerCase())
        )
      );

      const matchPercent =
        totalIngredients.length > 0
          ? Math.round((matchedIngredients.length / totalIngredients.length) * 100)
          : 0;

      // Quantity-aware analysis
      const deficits = analyzeRecipeDeficits(meal, pantryItems);
      const sufficientIngredients = deficits
        .filter((d) => d.sufficient)
        .map((d) => d.ingredientName);
      const insufficientIngredients = deficits
        .filter((d) => d.have && !d.sufficient)
        .map((d) => ({
          name: d.ingredientName,
          deficit: d.deficit,
          unit: d.deficitUnit,
        }));
      const missingIngredients = deficits
        .filter((d) => !d.have)
        .map((d) => d.ingredientName);

      const quantityMatchPercent =
        totalIngredients.length > 0
          ? Math.round(
              (sufficientIngredients.length / totalIngredients.length) * 100
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
      } as RankedMeal;
    })
    .sort((a, b) => {
      // Expiring matches first
      if (a.hasExpiringMatch !== b.hasExpiringMatch) {
        return a.hasExpiringMatch ? -1 : 1;
      }
      // Then by quantity match
      if (b.quantityMatchPercent !== a.quantityMatchPercent) {
        return b.quantityMatchPercent - a.quantityMatchPercent;
      }
      // Then by simple match
      return b.matchPercent - a.matchPercent;
    });
}

// ---------------------------------------------------------------------------
// Helper: Get Edamam extras from a MealDBMeal
// ---------------------------------------------------------------------------

export function getEdamamExtras(meal: MealDBMeal): {
  source: string;
  sourceUrl: string;
  yield: number;
  totalTime: number;
  calories: number;
  caloriesPerServing: number;
  dietLabels: string[];
  healthLabels: string[];
  ingredientLines: string[];
} | null {
  const extras = (meal as any)._edamam;
  return extras || null;
}
