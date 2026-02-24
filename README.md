# Ingreedy — Quantity-Aware Update

## What Changed

This update adds **3 new/modified files** that make recipe matching quantity-aware.
Instead of just "do you have chicken?" it now checks "do you have ENOUGH chicken?"

### Files in this zip:

```
ingreedy-app/
├── src/
│   ├── lib/
│   │   ├── quantity.ts          ← NEW FILE (the brain — parsing, conversion, deficit calc)
│   │   └── mealdb.ts            ← REPLACED (now uses quantity-aware ranking)
│   ├── types/
│   │   └── index.ts             ← REPLACED (new types for quantity matching)
│   └── app/
│       └── recipes/
│           └── page.tsx          ← REPLACED (new UI with quantity badges & surplus alerts)
└── ... (all other files unchanged)
```

---

## HOW TO UPDATE YOUR LOCAL PROJECT

### Option A: Full Replace (Recommended — Simplest)

If you still have your working project folder from last time:

1. **Download and unzip** this file
2. **Copy these 4 files** from the unzipped folder into your existing project, replacing the old versions:

```
# From the unzipped folder → Into your project (replace existing files)

src/lib/quantity.ts       →  your-project/src/lib/quantity.ts        (NEW - just copy in)
src/lib/mealdb.ts         →  your-project/src/lib/mealdb.ts          (REPLACE old file)
src/types/index.ts        →  your-project/src/types/index.ts         (REPLACE old file)
src/app/recipes/page.tsx  →  your-project/src/app/recipes/page.tsx   (REPLACE old file)
```

3. That's it. Run `npm run dev` and test.

### Option B: Terminal Commands

Open Terminal, `cd` into your project folder, then:

```bash
# Make sure you're in the right place
pwd
# Should show something like: /Users/yourname/Desktop/ingreedy-app
ls package.json
# Should show: package.json

# If you unzipped to Downloads:
cp ~/Downloads/ingreedy-app/src/lib/quantity.ts src/lib/quantity.ts
cp ~/Downloads/ingreedy-app/src/lib/mealdb.ts src/lib/mealdb.ts
cp ~/Downloads/ingreedy-app/src/types/index.ts src/types/index.ts
cp ~/Downloads/ingreedy-app/src/app/recipes/page.tsx src/app/recipes/page.tsx
```

### Option C: Start Fresh

If your local project is gone or broken, just use the entire zip as your project:

```bash
cd ~/Desktop
unzip ~/Downloads/ingreedy-app.zip
cd ingreedy-app
npm install
```

Then create your `.env.local` with your Supabase keys and run `npm run dev`.

---

## What You'll See

### Recipe Cards Now Show:
- **"X% ready"** badge — based on having ENOUGH of each ingredient (not just having some)
- **"X% have some"** — the old match %, shown smaller for comparison
- **✓ Have enough (N)** — green pills for ingredients you have sufficient quantity
- **⚠ Need more (N)** — yellow pills showing exactly how much more you need (e.g. "+2 cup")
- **✗ Missing (N)** — gray pills for ingredients not in your pantry at all
- **Summary line** — "5 ready · 2 need more · 1 missing — out of 8 total"

### Surplus Alerts (when you expand a recipe):
- **📦 Leftover Alert** — warns about perishable ingredients you'll have leftover
- Shows each surplus item with amount remaining and shelf life
- Items with ≤3 days shelf life are highlighted in red
- Non-perishable surplus shown in a collapsible section (less urgent)
- Placeholder for upcoming optimization feature that suggests additional recipes

---

## What's Coming Next

The surplus alerts currently show "Recipe optimization coming soon." The next update will:
1. Take those surplus perishables and search for recipes that use them
2. Suggest 1-2 additional recipes to add to your weekly plan
3. Show a combined view: "Make these 3 recipes this week → zero waste"
