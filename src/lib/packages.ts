/**
 * Standard Purchase Sizes Database
 *
 * Maps common grocery ingredients to their most typical store-bought
 * package size. Used for:
 *
 * 1. Shopping list: "need 2 cups broth" → "buy 1 carton (4 cups)"
 * 2. Surplus calculation: bought 1 carton → used 2 cups → 2 cups left
 * 3. Quick-add: auto-fills realistic pantry amounts
 * 4. Recipe optimization: knows how much surplus a purchase creates
 *
 * Each entry has:
 *   - amount: typical quantity in the package
 *   - unit: the unit that amount is in
 *   - packageLabel: human-readable label ("1 dozen", "1 can", etc.)
 *   - shelfDays: estimated shelf life after purchase (fridge/pantry)
 *   - category: for grouping in shopping lists
 */

export interface StandardPackage {
  amount: number;
  unit: string;
  packageLabel: string;
  shelfDays: number;
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'bakery' | 'spices' | 'condiments' | 'beverages' | 'canned';
}

export const STANDARD_PACKAGES: Record<string, StandardPackage> = {
  // ─── DAIRY & EGGS ──────────────────────────────
  'eggs':               { amount: 12,   unit: 'count',  packageLabel: '1 dozen',         shelfDays: 28,  category: 'dairy' },
  'milk':               { amount: 1,    unit: 'gal',    packageLabel: '1 gallon',         shelfDays: 10,  category: 'dairy' },
  'whole milk':         { amount: 1,    unit: 'gal',    packageLabel: '1 gallon',         shelfDays: 10,  category: 'dairy' },
  'skim milk':          { amount: 1,    unit: 'gal',    packageLabel: '1 gallon',         shelfDays: 10,  category: 'dairy' },
  '2% milk':            { amount: 1,    unit: 'gal',    packageLabel: '1 gallon',         shelfDays: 10,  category: 'dairy' },
  'heavy cream':        { amount: 16,   unit: 'fl_oz',  packageLabel: '1 pint',           shelfDays: 14,  category: 'dairy' },
  'half and half':      { amount: 16,   unit: 'fl_oz',  packageLabel: '1 pint',           shelfDays: 10,  category: 'dairy' },
  'sour cream':         { amount: 16,   unit: 'oz',     packageLabel: '16 oz container',  shelfDays: 21,  category: 'dairy' },
  'cream cheese':       { amount: 8,    unit: 'oz',     packageLabel: '8 oz block',       shelfDays: 21,  category: 'dairy' },
  'butter':             { amount: 1,    unit: 'lb',     packageLabel: '1 lb (4 sticks)',  shelfDays: 30,  category: 'dairy' },
  'unsalted butter':    { amount: 1,    unit: 'lb',     packageLabel: '1 lb (4 sticks)',  shelfDays: 30,  category: 'dairy' },
  'yogurt':             { amount: 32,   unit: 'oz',     packageLabel: '32 oz tub',        shelfDays: 14,  category: 'dairy' },
  'greek yogurt':       { amount: 32,   unit: 'oz',     packageLabel: '32 oz tub',        shelfDays: 14,  category: 'dairy' },
  'cheddar cheese':     { amount: 8,    unit: 'oz',     packageLabel: '8 oz block',       shelfDays: 28,  category: 'dairy' },
  'mozzarella cheese':  { amount: 8,    unit: 'oz',     packageLabel: '8 oz bag',         shelfDays: 21,  category: 'dairy' },
  'parmesan cheese':    { amount: 6,    unit: 'oz',     packageLabel: '6 oz wedge',       shelfDays: 42,  category: 'dairy' },
  'cheese':             { amount: 8,    unit: 'oz',     packageLabel: '8 oz block',       shelfDays: 28,  category: 'dairy' },
  'shredded cheese':    { amount: 8,    unit: 'oz',     packageLabel: '8 oz bag',         shelfDays: 28,  category: 'dairy' },
  'ricotta cheese':     { amount: 15,   unit: 'oz',     packageLabel: '15 oz container',  shelfDays: 14,  category: 'dairy' },
  'cottage cheese':     { amount: 16,   unit: 'oz',     packageLabel: '16 oz container',  shelfDays: 14,  category: 'dairy' },
  'whipped cream':      { amount: 8,    unit: 'oz',     packageLabel: '8 oz can',         shelfDays: 60,  category: 'dairy' },

  // ─── MEAT & PROTEIN ────────────────────────────
  'chicken breast':     { amount: 2,    unit: 'lb',     packageLabel: '2 lb pack',        shelfDays: 3,   category: 'meat' },
  'chicken thighs':     { amount: 2,    unit: 'lb',     packageLabel: '2 lb pack',        shelfDays: 3,   category: 'meat' },
  'chicken':            { amount: 2,    unit: 'lb',     packageLabel: '2 lb pack',        shelfDays: 3,   category: 'meat' },
  'ground beef':        { amount: 1,    unit: 'lb',     packageLabel: '1 lb pack',        shelfDays: 3,   category: 'meat' },
  'ground turkey':      { amount: 1,    unit: 'lb',     packageLabel: '1 lb pack',        shelfDays: 3,   category: 'meat' },
  'ground pork':        { amount: 1,    unit: 'lb',     packageLabel: '1 lb pack',        shelfDays: 3,   category: 'meat' },
  'steak':              { amount: 1,    unit: 'lb',     packageLabel: '1 lb',             shelfDays: 3,   category: 'meat' },
  'pork chops':         { amount: 1.5,  unit: 'lb',     packageLabel: '1.5 lb pack',      shelfDays: 3,   category: 'meat' },
  'bacon':              { amount: 12,   unit: 'oz',     packageLabel: '12 oz pack',       shelfDays: 7,   category: 'meat' },
  'sausage':            { amount: 1,    unit: 'lb',     packageLabel: '1 lb pack',        shelfDays: 5,   category: 'meat' },
  'italian sausage':    { amount: 1,    unit: 'lb',     packageLabel: '1 lb pack',        shelfDays: 5,   category: 'meat' },
  'ham':                { amount: 1,    unit: 'lb',     packageLabel: '1 lb',             shelfDays: 5,   category: 'meat' },
  'salmon':             { amount: 1,    unit: 'lb',     packageLabel: '1 lb fillet',      shelfDays: 2,   category: 'meat' },
  'shrimp':             { amount: 1,    unit: 'lb',     packageLabel: '1 lb bag',         shelfDays: 2,   category: 'meat' },
  'tuna':               { amount: 5,    unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'tofu':               { amount: 14,   unit: 'oz',     packageLabel: '14 oz block',      shelfDays: 7,   category: 'meat' },

  // ─── PRODUCE: VEGETABLES ───────────────────────
  'onions':             { amount: 3,    unit: 'count',  packageLabel: '3 lb bag',         shelfDays: 30,  category: 'produce' },
  'onion':              { amount: 1,    unit: 'count',  packageLabel: '1 onion',          shelfDays: 30,  category: 'produce' },
  'yellow onion':       { amount: 1,    unit: 'count',  packageLabel: '1 onion',          shelfDays: 30,  category: 'produce' },
  'red onion':          { amount: 1,    unit: 'count',  packageLabel: '1 onion',          shelfDays: 14,  category: 'produce' },
  'garlic':             { amount: 1,    unit: 'count',  packageLabel: '1 head',           shelfDays: 30,  category: 'produce' },
  'potatoes':           { amount: 5,    unit: 'lb',     packageLabel: '5 lb bag',         shelfDays: 21,  category: 'produce' },
  'potato':             { amount: 1,    unit: 'count',  packageLabel: '1 potato',         shelfDays: 21,  category: 'produce' },
  'sweet potatoes':     { amount: 2,    unit: 'count',  packageLabel: '2 sweet potatoes', shelfDays: 14,  category: 'produce' },
  'carrots':            { amount: 1,    unit: 'lb',     packageLabel: '1 lb bag',         shelfDays: 21,  category: 'produce' },
  'celery':             { amount: 1,    unit: 'count',  packageLabel: '1 bunch',          shelfDays: 14,  category: 'produce' },
  'broccoli':           { amount: 1,    unit: 'count',  packageLabel: '1 head',           shelfDays: 5,   category: 'produce' },
  'cauliflower':        { amount: 1,    unit: 'count',  packageLabel: '1 head',           shelfDays: 7,   category: 'produce' },
  'bell pepper':        { amount: 1,    unit: 'count',  packageLabel: '1 pepper',         shelfDays: 7,   category: 'produce' },
  'bell peppers':       { amount: 3,    unit: 'count',  packageLabel: '3 pack',           shelfDays: 7,   category: 'produce' },
  'tomatoes':           { amount: 4,    unit: 'count',  packageLabel: '4 tomatoes',       shelfDays: 7,   category: 'produce' },
  'tomato':             { amount: 1,    unit: 'count',  packageLabel: '1 tomato',         shelfDays: 7,   category: 'produce' },
  'lettuce':            { amount: 1,    unit: 'count',  packageLabel: '1 head',           shelfDays: 7,   category: 'produce' },
  'spinach':            { amount: 5,    unit: 'oz',     packageLabel: '5 oz bag',         shelfDays: 5,   category: 'produce' },
  'kale':               { amount: 5,    unit: 'oz',     packageLabel: '1 bunch',          shelfDays: 5,   category: 'produce' },
  'mushrooms':          { amount: 8,    unit: 'oz',     packageLabel: '8 oz package',     shelfDays: 7,   category: 'produce' },
  'zucchini':           { amount: 2,    unit: 'count',  packageLabel: '2 zucchini',       shelfDays: 7,   category: 'produce' },
  'cucumber':           { amount: 1,    unit: 'count',  packageLabel: '1 cucumber',       shelfDays: 7,   category: 'produce' },
  'corn':               { amount: 4,    unit: 'count',  packageLabel: '4 ears',           shelfDays: 5,   category: 'produce' },
  'green beans':        { amount: 12,   unit: 'oz',     packageLabel: '12 oz bag',        shelfDays: 5,   category: 'produce' },
  'asparagus':          { amount: 1,    unit: 'lb',     packageLabel: '1 lb bunch',       shelfDays: 4,   category: 'produce' },
  'green onions':       { amount: 6,    unit: 'count',  packageLabel: '1 bunch',          shelfDays: 7,   category: 'produce' },
  'scallions':          { amount: 6,    unit: 'count',  packageLabel: '1 bunch',          shelfDays: 7,   category: 'produce' },
  'cilantro':           { amount: 1,    unit: 'bunch',  packageLabel: '1 bunch',          shelfDays: 7,   category: 'produce' },
  'parsley':            { amount: 1,    unit: 'bunch',  packageLabel: '1 bunch',          shelfDays: 7,   category: 'produce' },
  'basil':              { amount: 1,    unit: 'bunch',  packageLabel: '1 bunch',          shelfDays: 5,   category: 'produce' },
  'ginger':             { amount: 4,    unit: 'oz',     packageLabel: '1 knob',           shelfDays: 21,  category: 'produce' },
  'jalapeño':           { amount: 3,    unit: 'count',  packageLabel: '3 peppers',        shelfDays: 7,   category: 'produce' },
  'cabbage':            { amount: 1,    unit: 'count',  packageLabel: '1 head',           shelfDays: 14,  category: 'produce' },
  'eggplant':           { amount: 1,    unit: 'count',  packageLabel: '1 eggplant',       shelfDays: 7,   category: 'produce' },

  // ─── PRODUCE: FRUITS ───────────────────────────
  'lemons':             { amount: 4,    unit: 'count',  packageLabel: '4 lemons',         shelfDays: 21,  category: 'produce' },
  'lemon':              { amount: 1,    unit: 'count',  packageLabel: '1 lemon',          shelfDays: 21,  category: 'produce' },
  'limes':              { amount: 4,    unit: 'count',  packageLabel: '4 limes',          shelfDays: 21,  category: 'produce' },
  'lime':               { amount: 1,    unit: 'count',  packageLabel: '1 lime',           shelfDays: 21,  category: 'produce' },
  'bananas':            { amount: 6,    unit: 'count',  packageLabel: '1 bunch',          shelfDays: 5,   category: 'produce' },
  'apples':             { amount: 6,    unit: 'count',  packageLabel: '3 lb bag',         shelfDays: 21,  category: 'produce' },
  'oranges':            { amount: 6,    unit: 'count',  packageLabel: '4 lb bag',         shelfDays: 14,  category: 'produce' },
  'avocado':            { amount: 1,    unit: 'count',  packageLabel: '1 avocado',        shelfDays: 4,   category: 'produce' },
  'avocados':           { amount: 4,    unit: 'count',  packageLabel: '4 pack',           shelfDays: 4,   category: 'produce' },
  'berries':            { amount: 6,    unit: 'oz',     packageLabel: '6 oz container',   shelfDays: 5,   category: 'produce' },
  'strawberries':       { amount: 16,   unit: 'oz',     packageLabel: '1 lb container',   shelfDays: 5,   category: 'produce' },
  'blueberries':        { amount: 6,    unit: 'oz',     packageLabel: '6 oz container',   shelfDays: 7,   category: 'produce' },

  // ─── GRAINS & PASTA ────────────────────────────
  'rice':               { amount: 2,    unit: 'lb',     packageLabel: '2 lb bag',         shelfDays: 365, category: 'pantry' },
  'white rice':         { amount: 2,    unit: 'lb',     packageLabel: '2 lb bag',         shelfDays: 365, category: 'pantry' },
  'brown rice':         { amount: 2,    unit: 'lb',     packageLabel: '2 lb bag',         shelfDays: 180, category: 'pantry' },
  'pasta':              { amount: 1,    unit: 'lb',     packageLabel: '1 lb box',         shelfDays: 730, category: 'pantry' },
  'spaghetti':          { amount: 1,    unit: 'lb',     packageLabel: '1 lb box',         shelfDays: 730, category: 'pantry' },
  'penne':              { amount: 1,    unit: 'lb',     packageLabel: '1 lb box',         shelfDays: 730, category: 'pantry' },
  'macaroni':           { amount: 1,    unit: 'lb',     packageLabel: '1 lb box',         shelfDays: 730, category: 'pantry' },
  'egg noodles':        { amount: 12,   unit: 'oz',     packageLabel: '12 oz bag',        shelfDays: 365, category: 'pantry' },
  'bread':              { amount: 20,   unit: 'count',  packageLabel: '1 loaf',           shelfDays: 7,   category: 'bakery' },
  'tortillas':          { amount: 10,   unit: 'count',  packageLabel: '10 pack',          shelfDays: 14,  category: 'bakery' },
  'flour tortillas':    { amount: 10,   unit: 'count',  packageLabel: '10 pack',          shelfDays: 14,  category: 'bakery' },
  'corn tortillas':     { amount: 30,   unit: 'count',  packageLabel: '30 pack',          shelfDays: 14,  category: 'bakery' },
  'pita bread':         { amount: 6,    unit: 'count',  packageLabel: '6 pack',           shelfDays: 7,   category: 'bakery' },
  'hamburger buns':     { amount: 8,    unit: 'count',  packageLabel: '8 pack',           shelfDays: 7,   category: 'bakery' },
  'flour':              { amount: 5,    unit: 'lb',     packageLabel: '5 lb bag',         shelfDays: 365, category: 'pantry' },
  'all-purpose flour':  { amount: 5,    unit: 'lb',     packageLabel: '5 lb bag',         shelfDays: 365, category: 'pantry' },
  'bread flour':        { amount: 5,    unit: 'lb',     packageLabel: '5 lb bag',         shelfDays: 365, category: 'pantry' },
  'oats':               { amount: 18,   unit: 'oz',     packageLabel: '18 oz canister',   shelfDays: 365, category: 'pantry' },
  'quinoa':             { amount: 12,   unit: 'oz',     packageLabel: '12 oz bag',        shelfDays: 365, category: 'pantry' },
  'couscous':           { amount: 10,   unit: 'oz',     packageLabel: '10 oz box',        shelfDays: 365, category: 'pantry' },
  'breadcrumbs':        { amount: 15,   unit: 'oz',     packageLabel: '15 oz canister',   shelfDays: 180, category: 'pantry' },
  'panko':              { amount: 8,    unit: 'oz',     packageLabel: '8 oz bag',         shelfDays: 180, category: 'pantry' },

  // ─── CANNED GOODS ──────────────────────────────
  'canned tomatoes':    { amount: 14.5, unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'diced tomatoes':     { amount: 14.5, unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'crushed tomatoes':   { amount: 28,   unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'tomato paste':       { amount: 6,    unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'tomato sauce':       { amount: 15,   unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'black beans':        { amount: 15,   unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'kidney beans':       { amount: 15,   unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'chickpeas':          { amount: 15,   unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'pinto beans':        { amount: 15,   unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'cannellini beans':   { amount: 15,   unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'lentils':            { amount: 1,    unit: 'lb',     packageLabel: '1 lb bag',         shelfDays: 365, category: 'pantry' },
  'coconut milk':       { amount: 13.5, unit: 'fl_oz',  packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'chicken broth':      { amount: 32,   unit: 'fl_oz',  packageLabel: '1 carton (4 cups)',shelfDays: 10,  category: 'canned' },
  'beef broth':         { amount: 32,   unit: 'fl_oz',  packageLabel: '1 carton (4 cups)',shelfDays: 10,  category: 'canned' },
  'vegetable broth':    { amount: 32,   unit: 'fl_oz',  packageLabel: '1 carton (4 cups)',shelfDays: 10,  category: 'canned' },
  'canned corn':        { amount: 15,   unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },
  'green peas':         { amount: 15,   unit: 'oz',     packageLabel: '1 can',            shelfDays: 730, category: 'canned' },

  // ─── OILS & VINEGARS ───────────────────────────
  'olive oil':          { amount: 16.9, unit: 'fl_oz',  packageLabel: '500ml bottle',     shelfDays: 365, category: 'condiments' },
  'vegetable oil':      { amount: 48,   unit: 'fl_oz',  packageLabel: '48 oz bottle',     shelfDays: 365, category: 'condiments' },
  'canola oil':         { amount: 48,   unit: 'fl_oz',  packageLabel: '48 oz bottle',     shelfDays: 365, category: 'condiments' },
  'sesame oil':         { amount: 8.4,  unit: 'fl_oz',  packageLabel: '250ml bottle',     shelfDays: 365, category: 'condiments' },
  'coconut oil':        { amount: 14,   unit: 'fl_oz',  packageLabel: '14 oz jar',        shelfDays: 365, category: 'condiments' },
  'balsamic vinegar':   { amount: 16.9, unit: 'fl_oz',  packageLabel: '500ml bottle',     shelfDays: 730, category: 'condiments' },
  'red wine vinegar':   { amount: 16,   unit: 'fl_oz',  packageLabel: '16 oz bottle',     shelfDays: 730, category: 'condiments' },
  'apple cider vinegar':{ amount: 16,   unit: 'fl_oz',  packageLabel: '16 oz bottle',     shelfDays: 730, category: 'condiments' },
  'white vinegar':      { amount: 16,   unit: 'fl_oz',  packageLabel: '16 oz bottle',     shelfDays: 730, category: 'condiments' },
  'rice vinegar':       { amount: 12,   unit: 'fl_oz',  packageLabel: '12 oz bottle',     shelfDays: 730, category: 'condiments' },

  // ─── CONDIMENTS & SAUCES ───────────────────────
  'soy sauce':          { amount: 15,   unit: 'fl_oz',  packageLabel: '15 oz bottle',     shelfDays: 730, category: 'condiments' },
  'worcestershire sauce': { amount: 10, unit: 'fl_oz',  packageLabel: '10 oz bottle',     shelfDays: 730, category: 'condiments' },
  'hot sauce':          { amount: 5,    unit: 'fl_oz',  packageLabel: '5 oz bottle',      shelfDays: 730, category: 'condiments' },
  'ketchup':            { amount: 20,   unit: 'oz',     packageLabel: '20 oz bottle',     shelfDays: 180, category: 'condiments' },
  'mustard':            { amount: 12,   unit: 'oz',     packageLabel: '12 oz bottle',     shelfDays: 365, category: 'condiments' },
  'dijon mustard':      { amount: 12,   unit: 'oz',     packageLabel: '12 oz jar',        shelfDays: 365, category: 'condiments' },
  'mayonnaise':         { amount: 30,   unit: 'fl_oz',  packageLabel: '30 oz jar',        shelfDays: 60,  category: 'condiments' },
  'salsa':              { amount: 16,   unit: 'oz',     packageLabel: '16 oz jar',        shelfDays: 14,  category: 'condiments' },
  'marinara sauce':     { amount: 24,   unit: 'oz',     packageLabel: '24 oz jar',        shelfDays: 7,   category: 'condiments' },
  'pasta sauce':        { amount: 24,   unit: 'oz',     packageLabel: '24 oz jar',        shelfDays: 7,   category: 'condiments' },
  'bbq sauce':          { amount: 18,   unit: 'oz',     packageLabel: '18 oz bottle',     shelfDays: 120, category: 'condiments' },
  'teriyaki sauce':     { amount: 10,   unit: 'fl_oz',  packageLabel: '10 oz bottle',     shelfDays: 365, category: 'condiments' },
  'fish sauce':         { amount: 6.76, unit: 'fl_oz',  packageLabel: '200ml bottle',     shelfDays: 730, category: 'condiments' },
  'peanut butter':      { amount: 16,   unit: 'oz',     packageLabel: '16 oz jar',        shelfDays: 180, category: 'condiments' },
  'honey':              { amount: 12,   unit: 'oz',     packageLabel: '12 oz bottle',     shelfDays: 730, category: 'condiments' },
  'maple syrup':        { amount: 12,   unit: 'fl_oz',  packageLabel: '12 oz bottle',     shelfDays: 365, category: 'condiments' },

  // ─── SPICES & SEASONINGS ───────────────────────
  'salt':               { amount: 26,   unit: 'oz',     packageLabel: '26 oz canister',   shelfDays: 1825, category: 'spices' },
  'black pepper':       { amount: 4,    unit: 'oz',     packageLabel: '4 oz tin',         shelfDays: 730, category: 'spices' },
  'garlic powder':      { amount: 3.12, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'onion powder':       { amount: 2.62, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'paprika':            { amount: 2.12, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'smoked paprika':     { amount: 2.12, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'cumin':              { amount: 1.68, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'chili powder':       { amount: 2.5,  unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'cayenne pepper':     { amount: 1.75, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'cinnamon':           { amount: 2.37, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'nutmeg':             { amount: 1.1,  unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'oregano':            { amount: 0.75, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'dried oregano':      { amount: 0.75, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'thyme':              { amount: 0.62, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'dried thyme':        { amount: 0.62, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'rosemary':           { amount: 0.75, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'dried rosemary':     { amount: 0.75, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'bay leaves':         { amount: 0.5,  unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'italian seasoning':  { amount: 0.87, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'red pepper flakes':  { amount: 1.5,  unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'curry powder':       { amount: 2,    unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'turmeric':           { amount: 1.75, unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'coriander':          { amount: 1.5,  unit: 'oz',     packageLabel: '1 jar',            shelfDays: 730, category: 'spices' },
  'vanilla extract':    { amount: 2,    unit: 'fl_oz',  packageLabel: '2 oz bottle',      shelfDays: 730, category: 'spices' },

  // ─── BAKING ────────────────────────────────────
  'sugar':              { amount: 4,    unit: 'lb',     packageLabel: '4 lb bag',         shelfDays: 730, category: 'pantry' },
  'brown sugar':        { amount: 2,    unit: 'lb',     packageLabel: '2 lb bag',         shelfDays: 365, category: 'pantry' },
  'powdered sugar':     { amount: 2,    unit: 'lb',     packageLabel: '2 lb bag',         shelfDays: 730, category: 'pantry' },
  'baking soda':        { amount: 16,   unit: 'oz',     packageLabel: '1 lb box',         shelfDays: 730, category: 'pantry' },
  'baking powder':      { amount: 8.1,  unit: 'oz',     packageLabel: '8.1 oz can',       shelfDays: 365, category: 'pantry' },
  'cocoa powder':       { amount: 8,    unit: 'oz',     packageLabel: '8 oz can',         shelfDays: 730, category: 'pantry' },
  'chocolate chips':    { amount: 12,   unit: 'oz',     packageLabel: '12 oz bag',        shelfDays: 365, category: 'pantry' },
  'cornstarch':         { amount: 16,   unit: 'oz',     packageLabel: '1 lb box',         shelfDays: 730, category: 'pantry' },
  'yeast':              { amount: 0.75, unit: 'oz',     packageLabel: '3 packets',        shelfDays: 120, category: 'pantry' },

  // ─── NUTS & DRIED ──────────────────────────────
  'almonds':            { amount: 6,    unit: 'oz',     packageLabel: '6 oz bag',         shelfDays: 180, category: 'pantry' },
  'walnuts':            { amount: 6,    unit: 'oz',     packageLabel: '6 oz bag',         shelfDays: 180, category: 'pantry' },
  'pecans':             { amount: 6,    unit: 'oz',     packageLabel: '6 oz bag',         shelfDays: 180, category: 'pantry' },
  'peanuts':            { amount: 16,   unit: 'oz',     packageLabel: '1 lb jar',         shelfDays: 180, category: 'pantry' },
  'pine nuts':          { amount: 2,    unit: 'oz',     packageLabel: '2 oz bag',         shelfDays: 90,  category: 'pantry' },
  'raisins':            { amount: 12,   unit: 'oz',     packageLabel: '12 oz box',        shelfDays: 180, category: 'pantry' },
  'dried cranberries':  { amount: 6,    unit: 'oz',     packageLabel: '6 oz bag',         shelfDays: 365, category: 'pantry' },

  // ─── FROZEN ────────────────────────────────────
  'frozen peas':        { amount: 16,   unit: 'oz',     packageLabel: '1 lb bag',         shelfDays: 365, category: 'frozen' },
  'frozen corn':        { amount: 16,   unit: 'oz',     packageLabel: '1 lb bag',         shelfDays: 365, category: 'frozen' },
  'frozen spinach':     { amount: 10,   unit: 'oz',     packageLabel: '10 oz box',        shelfDays: 365, category: 'frozen' },
  'frozen berries':     { amount: 12,   unit: 'oz',     packageLabel: '12 oz bag',        shelfDays: 365, category: 'frozen' },
  'ice cream':          { amount: 48,   unit: 'fl_oz',  packageLabel: '1.5 qt container', shelfDays: 60,  category: 'frozen' },
  'frozen pizza':       { amount: 1,    unit: 'count',  packageLabel: '1 pizza',          shelfDays: 180, category: 'frozen' },

  // ─── BEVERAGES ─────────────────────────────────
  'orange juice':       { amount: 52,   unit: 'fl_oz',  packageLabel: '52 oz carton',     shelfDays: 10,  category: 'beverages' },
  'apple juice':        { amount: 64,   unit: 'fl_oz',  packageLabel: '64 oz bottle',     shelfDays: 10,  category: 'beverages' },
  'coffee':             { amount: 12,   unit: 'oz',     packageLabel: '12 oz bag',        shelfDays: 30,  category: 'beverages' },
  'tea':                { amount: 20,   unit: 'count',  packageLabel: '20 tea bags',      shelfDays: 365, category: 'beverages' },
};

/**
 * Look up the standard purchase size for an ingredient.
 * Tries exact match first, then partial match.
 */
export function getStandardPackage(ingredientName: string): StandardPackage | null {
  const lower = ingredientName.toLowerCase().trim();

  // Exact match
  if (STANDARD_PACKAGES[lower]) {
    return STANDARD_PACKAGES[lower];
  }

  // Partial match — find the best one
  for (const [key, pkg] of Object.entries(STANDARD_PACKAGES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return pkg;
    }
  }

  return null;
}

/**
 * Given a recipe's required amount, calculate what you'd actually buy
 * and what surplus that creates.
 *
 * Example: recipe needs 2 cups chicken broth
 *   → Standard package: 32 fl_oz (4 cups)
 *   → Buy: 1 carton
 *   → Surplus: 2 cups
 */
export function calculatePurchaseSurplus(
  neededAmount: number,
  neededUnit: string,
  ingredientName: string
): {
  buyPackages: number;
  buyLabel: string;
  buyAmount: number;
  buyUnit: string;
  surplusAmount: number;
  surplusUnit: string;
} | null {
  const pkg = getStandardPackage(ingredientName);
  if (!pkg) return null;

  // For now, use simple division — enhancement: use unit conversion
  // If units match or are compatible
  const packagesNeeded = Math.ceil(neededAmount / pkg.amount);

  return {
    buyPackages: packagesNeeded,
    buyLabel: packagesNeeded === 1 ? pkg.packageLabel : `${packagesNeeded}x ${pkg.packageLabel}`,
    buyAmount: packagesNeeded * pkg.amount,
    buyUnit: pkg.unit,
    surplusAmount: Math.round(((packagesNeeded * pkg.amount) - neededAmount) * 100) / 100,
    surplusUnit: pkg.unit,
  };
}
