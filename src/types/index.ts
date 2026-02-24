export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  quantity_amount: number;
  quantity_unit: string;
  expiration_date: string | null;
  created_at: string;
}

export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube: string;
  strSource: string;
  [key: string]: any;
}

export interface RankedMeal extends MealDBMeal {
  matchedIngredients: string[];
  totalIngredients: string[];
  matchPercent: number;
  hasExpiringMatch: boolean;
  // Quantity-aware fields
  sufficientIngredients: string[]; // ingredients you have ENOUGH of
  insufficientIngredients: { name: string; deficit: number; unit: string }[];
  missingIngredients: string[]; // ingredients you don't have at all
  quantityMatchPercent: number; // % of ingredients you have enough of
}

export interface ShoppingListItem {
  ingredientName: string;
  neededAmount: number;
  neededUnit: string;
  forRecipe: string; // meal name
  forMealId: string;
}

export interface SurplusAlert {
  ingredientName: string;
  surplusAmount: number;
  surplusUnit: string;
  shelfLifeDays: number | null;
  suggestedRecipes: { idMeal: string; strMeal: string; usesAmount: number; usesUnit: string }[];
}

export const UNIT_OPTIONS = [
  { value: 'count', label: 'count' },
  { value: 'oz', label: 'oz' },
  { value: 'lb', label: 'lb' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'cup', label: 'cup' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'tsp', label: 'tsp' },
  { value: 'ml', label: 'ml' },
  { value: 'L', label: 'L' },
  { value: 'gal', label: 'gal' },
  { value: 'bunch', label: 'bunch' },
  { value: 'can', label: 'can' },
  { value: 'bottle', label: 'bottle' },
  { value: 'bag', label: 'bag' },
  { value: 'box', label: 'box' },
  { value: 'package', label: 'package' },
  { value: 'slice', label: 'slice' },
];

// Default expiration days by category
export const DEFAULT_EXPIRATIONS: Record<string, number> = {
  // Dairy
  milk: 7,
  cream: 10,
  yogurt: 14,
  butter: 30,
  cheese: 21,
  'sour cream': 14,
  'cream cheese': 14,
  eggs: 21,
  // Produce
  lettuce: 5,
  spinach: 5,
  tomato: 7,
  tomatoes: 7,
  onion: 30,
  onions: 30,
  garlic: 60,
  potato: 21,
  potatoes: 21,
  carrot: 21,
  carrots: 21,
  celery: 14,
  'bell pepper': 7,
  mushrooms: 5,
  avocado: 4,
  banana: 5,
  bananas: 5,
  apple: 21,
  apples: 21,
  lemon: 21,
  lemons: 21,
  lime: 14,
  limes: 14,
  berries: 4,
  strawberries: 4,
  blueberries: 5,
  // Meat
  chicken: 3,
  'chicken breast': 3,
  'ground beef': 3,
  beef: 5,
  pork: 5,
  fish: 2,
  salmon: 2,
  shrimp: 2,
  bacon: 7,
  'deli meat': 5,
  sausage: 5,
  // Pantry staples (long shelf life)
  rice: 365,
  pasta: 365,
  flour: 180,
  sugar: 730,
  salt: 1825,
  'olive oil': 365,
  'vegetable oil': 365,
  'soy sauce': 365,
  vinegar: 730,
  'canned tomatoes': 365,
  'canned beans': 365,
  'peanut butter': 180,
  honey: 730,
  // Bread & baked
  bread: 5,
  tortillas: 14,
};

// Common ingredient names for autocomplete
export const COMMON_INGREDIENTS = [
  'Chicken Breast', 'Ground Beef', 'Salmon', 'Shrimp', 'Bacon', 'Eggs',
  'Milk', 'Butter', 'Cheese', 'Cream Cheese', 'Sour Cream', 'Yogurt',
  'Rice', 'Pasta', 'Bread', 'Flour', 'Sugar', 'Salt', 'Pepper',
  'Olive Oil', 'Vegetable Oil', 'Soy Sauce', 'Vinegar',
  'Tomatoes', 'Onions', 'Garlic', 'Potatoes', 'Carrots', 'Celery',
  'Bell Pepper', 'Mushrooms', 'Spinach', 'Lettuce', 'Broccoli', 'Corn',
  'Avocado', 'Lemon', 'Lime', 'Bananas', 'Apples', 'Berries',
  'Canned Tomatoes', 'Canned Beans', 'Chicken Broth', 'Peanut Butter',
  'Honey', 'Tortillas', 'Salsa', 'Hot Sauce', 'Mustard', 'Ketchup', 'Mayo',
  'Cumin', 'Paprika', 'Oregano', 'Basil', 'Thyme', 'Cinnamon',
  'Chili Powder', 'Parsley', 'Ginger', 'Turmeric',
];
