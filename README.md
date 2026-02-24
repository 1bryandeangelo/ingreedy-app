# 🥬 Ingreedy – Use What You Have, Waste Less

A Next.js web app that tracks your pantry ingredients (with expiration dates) and suggests recipes ranked by how many of your ingredients they use. Expiring items get prioritized.

## Features

- **Auth**: Sign up / log in / log out via Supabase Auth
- **Pantry**: Add ingredients with quantity, unit, and expiration date (auto-suggested based on ingredient type). Autocomplete for common ingredients.
- **Recipes**: Fetches from TheMealDB API, ranks by pantry match %, highlights recipes that use expiring items.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Auth + Postgres DB)
- **Tailwind CSS**
- **React Query** (data fetching)
- **TheMealDB API** (recipe data)

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/ingreedy-app.git
cd ingreedy-app
npm install
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Copy your **Project URL** and **anon public key** from Settings → API
3. Open SQL Editor in Supabase Dashboard
4. Paste and run the contents of `supabase-setup.sql`
5. In Authentication → Settings, make sure email auth is enabled

### 3. Environment Variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add the 3 environment variables above
4. Click Deploy
5. Done! You'll get a live URL

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home / landing page
│   ├── globals.css         # Tailwind + global styles
│   ├── auth/
│   │   ├── login/page.tsx  # Login page
│   │   └── signup/page.tsx # Signup page
│   ├── pantry/page.tsx     # Pantry management
│   └── recipes/page.tsx    # Recipe suggestions
├── components/
│   ├── Header.tsx
│   ├── SupabaseProvider.tsx
│   └── QueryClientProviderWrapper.tsx
├── lib/
│   ├── mealdb.ts           # TheMealDB API helpers
│   └── supabase-browser.ts # Supabase client helper
└── types/
    └── index.ts            # Shared types, constants, defaults
```
