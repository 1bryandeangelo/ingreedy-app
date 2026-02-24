/**
 * Quantity parsing, unit conversion, and deficit calculation.
 *
 * This is the foundation for:
 * - Quantity-aware recipe matching ("do I have ENOUGH, not just SOME")
 * - Shopping list generation (what's missing and how much)
 * - Surplus tracking (what's left over after cooking)
 * - Ingredient optimization (suggest recipes to use up surplus perishables)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedQuantity {
  amount: number;
  unit: string; // normalized unit key (e.g., 'g', 'ml', 'count')
  originalText: string;
}

export interface IngredientDeficit {
  ingredientName: string;
  needed: ParsedQuantity;
  have: ParsedQuantity | null;
  deficit: number; // how much more you need (0 = have enough, >0 = short)
  deficitUnit: string;
  sufficient: boolean;
}

export interface RecipeSurplus {
  ingredientName: string;
  surplus: number;
  unit: string;
  shelfLifeDays: number | null; // null = non-perishable / unknown
}

// ---------------------------------------------------------------------------
// Unit normalization map
// ---------------------------------------------------------------------------

// Maps every known alias → canonical unit
const UNIT_ALIASES: Record<string, string> = {
  // Weight
  g: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',

  // Volume
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  millilitre: 'ml',
  millilitres: 'ml',
  l: 'L',
  liter: 'L',
  liters: 'L',
  litre: 'L',
  litres: 'L',
  cup: 'cup',
  cups: 'cup',
  tbsp: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tbs: 'tbsp',
  tsp: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  'fl oz': 'fl_oz',
  'fluid ounce': 'fl_oz',
  'fluid ounces': 'fl_oz',
  gal: 'gal',
  gallon: 'gal',
  gallons: 'gal',
  pint: 'pint',
  pints: 'pint',
  quart: 'quart',
  quarts: 'quart',

  // Count / misc
  count: 'count',
  piece: 'count',
  pieces: 'count',
  whole: 'count',
  head: 'head',
  heads: 'head',
  bunch: 'bunch',
  bunches: 'bunch',
  clove: 'clove',
  cloves: 'clove',
  slice: 'slice',
  slices: 'slice',
  can: 'can',
  cans: 'can',
  bottle: 'bottle',
  bottles: 'bottle',
  bag: 'bag',
  bags: 'bag',
  box: 'box',
  boxes: 'box',
  package: 'package',
  packages: 'package',
  pinch: 'pinch',
  dash: 'pinch',
  sprig: 'sprig',
  sprigs: 'sprig',
  stalk: 'stalk',
  stalks: 'stalk',
  stick: 'stick',
  sticks: 'stick',
};

// ---------------------------------------------------------------------------
// Conversion factors — everything converts to a base unit within its category
// Weight base: grams | Volume base: ml | Count base: count
// ---------------------------------------------------------------------------

type UnitCategory = 'weight' | 'volume' | 'count' | 'other';

const UNIT_CATEGORY: Record<string, UnitCategory> = {
  g: 'weight',
  kg: 'weight',
  oz: 'weight',
  lb: 'weight',
  ml: 'volume',
  L: 'volume',
  cup: 'volume',
  tbsp: 'volume',
  tsp: 'volume',
  fl_oz: 'volume',
  gal: 'volume',
  pint: 'volume',
  quart: 'volume',
  count: 'count',
  head: 'count',
  bunch: 'count',
  clove: 'count',
  slice: 'count',
  can: 'count',
  bottle: 'count',
  bag: 'count',
  box: 'count',
  package: 'count',
  stick: 'count',
  stalk: 'count',
  sprig: 'count',
  pinch: 'other',
};

// To base unit (grams for weight, ml for volume)
const TO_BASE: Record<string, number> = {
  // Weight → grams
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,

  // Volume → ml
  ml: 1,
  L: 1000,
  cup: 236.588,
  tbsp: 14.787,
  tsp: 4.929,
  fl_oz: 29.5735,
  gal: 3785.41,
  pint: 473.176,
  quart: 946.353,

  // Count → count (1:1)
  count: 1,
  head: 1,
  bunch: 1,
  clove: 1,
  slice: 1,
  can: 1,
  bottle: 1,
  bag: 1,
  box: 1,
  package: 1,
  stick: 1,
  stalk: 1,
  sprig: 1,
  pinch: 1,
};

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

// Fraction map for common fractions in recipe text
const FRACTION_MAP: Record<string, number> = {
  '½': 0.5,
  '⅓': 0.333,
  '⅔': 0.667,
  '¼': 0.25,
  '¾': 0.75,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 0.167,
  '⅚': 0.833,
};

/**
 * Parse a fraction string like "1/2" or "3/4" into a number.
 */
function parseFraction(str: string): number | null {
  // Unicode fractions
  for (const [frac, val] of Object.entries(FRACTION_MAP)) {
    if (str.includes(frac)) {
      // Handle "1½" → 1.5
      const before = str.replace(frac, '').trim();
      const whole = before ? parseFloat(before) : 0;
      return isNaN(whole) ? val : whole + val;
    }
  }

  // Slash fractions: "1/2", "3/4"
  const slashMatch = str.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (slashMatch) {
    const num = parseInt(slashMatch[1]);
    const den = parseInt(slashMatch[2]);
    return den !== 0 ? num / den : null;
  }

  // Mixed: "1 1/2"
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const num = parseInt(mixedMatch[2]);
    const den = parseInt(mixedMatch[3]);
    return den !== 0 ? whole + num / den : null;
  }

  return null;
}

/**
 * Normalize a unit string to its canonical form.
 */
export function normalizeUnit(raw: string): string {
  const cleaned = raw.trim().toLowerCase().replace(/\.$/, '');
  return UNIT_ALIASES[cleaned] || cleaned;
}

/**
 * Parse a MealDB measure string like "1 cup", "200g", "2 1/2 tbsp", "1/4 tsp"
 * into a structured ParsedQuantity.
 */
export function parseMeasure(measureStr: string): ParsedQuantity {
  const original = measureStr.trim();
  if (!original) {
    return { amount: 1, unit: 'count', originalText: original };
  }

  let text = original;

  // Step 1: Try to extract the numeric part (handles decimals, fractions, mixed)
  let amount = 0;

  // Check for unicode fractions first
  for (const [frac, val] of Object.entries(FRACTION_MAP)) {
    if (text.includes(frac)) {
      const idx = text.indexOf(frac);
      const before = text.substring(0, idx).trim();
      const after = text.substring(idx + frac.length).trim();
      const whole = before ? parseFloat(before) : 0;
      amount = isNaN(whole) ? val : whole + val;
      text = after;
      break;
    }
  }

  if (amount === 0) {
    // Try "1 1/2 cup" or "1/2 cup" or "2.5 cups" or "200g"
    const numMatch = text.match(
      /^(\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+\.?\d*)\s*(.*)/
    );
    if (numMatch) {
      const numStr = numMatch[1].trim();
      const rest = numMatch[2].trim();

      const fracVal = parseFraction(numStr);
      if (fracVal !== null) {
        amount = fracVal;
      } else {
        amount = parseFloat(numStr);
        if (isNaN(amount)) amount = 1;
      }
      text = rest;
    } else {
      // No number found — assume 1
      amount = 1;
    }
  }

  // Step 2: Normalize the remaining text as a unit
  const unit = text ? normalizeUnit(text) : 'count';

  return { amount, unit, originalText: original };
}

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

/**
 * Convert an amount from one unit to another.
 * Returns null if units are incompatible (e.g., grams → cups without density).
 */
export function convertUnits(
  amount: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (from === to) return amount;

  const fromCat = UNIT_CATEGORY[from];
  const toCat = UNIT_CATEGORY[to];

  // Can only convert within the same category
  if (!fromCat || !toCat || fromCat !== toCat) return null;

  const fromFactor = TO_BASE[from];
  const toFactor = TO_BASE[to];

  if (!fromFactor || !toFactor) return null;

  // Convert: from → base → to
  const baseAmount = amount * fromFactor;
  return baseAmount / toFactor;
}

/**
 * Compare two quantities and determine if "have" is sufficient for "need".
 * Returns the deficit (positive = short, 0 = enough, negative = surplus).
 */
export function calculateDeficit(
  haveAmount: number,
  haveUnit: string,
  needAmount: number,
  needUnit: string
): { deficit: number; unit: string; sufficient: boolean } {
  const haveNorm = normalizeUnit(haveUnit);
  const needNorm = normalizeUnit(needUnit);

  // Try to convert "have" into "need" units for comparison
  const haveConverted = convertUnits(haveAmount, haveNorm, needNorm);

  if (haveConverted !== null) {
    const deficit = needAmount - haveConverted;
    return {
      deficit: Math.max(0, deficit),
      unit: needNorm,
      sufficient: deficit <= 0,
    };
  }

  // Units are incompatible — fall back to name-only match (have it = sufficient)
  // This handles cases like "1 pinch salt" vs "salt" in pantry as "500 g"
  // We can't convert pinch→g, so just say "you have it"
  return {
    deficit: 0,
    unit: needNorm,
    sufficient: true, // optimistic fallback when conversion impossible
  };
}

// ---------------------------------------------------------------------------
// Recipe analysis
// ---------------------------------------------------------------------------

import type { MealDBMeal, PantryItem } from '@/types';
import { DEFAULT_EXPIRATIONS } from '@/types';

export interface RecipeIngredient {
  name: string;
  quantity: ParsedQuantity;
}

/**
 * Extract ingredients WITH quantities from a MealDB meal.
 */
export function extractIngredientsWithQuantity(
  meal: MealDBMeal
): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim() !== '') {
      ingredients.push({
        name: name.trim().toLowerCase(),
        quantity: parseMeasure(measure || ''),
      });
    }
  }
  return ingredients;
}

/**
 * For a given recipe, compare each ingredient against the user's pantry
 * and return detailed deficit info for every ingredient.
 */
export function analyzeRecipeDeficits(
  meal: MealDBMeal,
  pantryItems: PantryItem[]
): IngredientDeficit[] {
  const recipeIngredients = extractIngredientsWithQuantity(meal);

  return recipeIngredients.map((ri) => {
    // Find matching pantry item (fuzzy name match)
    const pantryMatch = pantryItems.find((pi) => {
      const piName = pi.name.toLowerCase();
      return (
        piName === ri.name ||
        piName.includes(ri.name) ||
        ri.name.includes(piName)
      );
    });

    if (!pantryMatch) {
      // Don't have this ingredient at all
      return {
        ingredientName: ri.name,
        needed: ri.quantity,
        have: null,
        deficit: ri.quantity.amount,
        deficitUnit: ri.quantity.unit,
        sufficient: false,
      };
    }

    // Have it — check quantity
    const haveQuantity: ParsedQuantity = {
      amount: pantryMatch.quantity_amount,
      unit: normalizeUnit(pantryMatch.quantity_unit),
      originalText: `${pantryMatch.quantity_amount} ${pantryMatch.quantity_unit}`,
    };

    const result = calculateDeficit(
      haveQuantity.amount,
      haveQuantity.unit,
      ri.quantity.amount,
      ri.quantity.unit
    );

    return {
      ingredientName: ri.name,
      needed: ri.quantity,
      have: haveQuantity,
      deficit: result.deficit,
      deficitUnit: result.unit,
      sufficient: result.sufficient,
    };
  });
}

/**
 * Calculate what's LEFT in the pantry after making a recipe.
 * Returns surplus items with their remaining amounts and shelf life.
 */
export function calculateSurplus(
  meal: MealDBMeal,
  pantryItems: PantryItem[]
): RecipeSurplus[] {
  const deficits = analyzeRecipeDeficits(meal, pantryItems);
  const surplusList: RecipeSurplus[] = [];

  for (const d of deficits) {
    if (d.have && d.sufficient) {
      // We had enough — calculate what's left
      const usedInHaveUnits = convertUnits(
        d.needed.amount,
        d.needed.unit,
        d.have.unit
      );

      if (usedInHaveUnits !== null) {
        const remaining = d.have.amount - usedInHaveUnits;
        if (remaining > 0.01) {
          // Find shelf life for this ingredient
          const shelfLife =
            DEFAULT_EXPIRATIONS[d.ingredientName] || null;

          surplusList.push({
            ingredientName: d.ingredientName,
            surplus: Math.round(remaining * 100) / 100,
            unit: d.have.unit,
            shelfLifeDays: shelfLife,
          });
        }
      }
    }
  }

  return surplusList;
}

/**
 * Given a shopping list addition (e.g., buy 4 cups chicken broth, only need 2),
 * calculate the surplus after cooking and its shelf life.
 */
export function calculateShoppingListSurplus(
  buyAmount: number,
  buyUnit: string,
  useAmount: number,
  useUnit: string,
  ingredientName: string
): RecipeSurplus | null {
  const buyConverted = convertUnits(buyAmount, buyUnit, useUnit);
  if (buyConverted === null) return null;

  const surplus = buyConverted - useAmount;
  if (surplus <= 0.01) return null;

  const shelfLife = DEFAULT_EXPIRATIONS[ingredientName.toLowerCase()] || null;

  return {
    ingredientName,
    surplus: Math.round(surplus * 100) / 100,
    unit: normalizeUnit(useUnit),
    shelfLifeDays: shelfLife,
  };
}
