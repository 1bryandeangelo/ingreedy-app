import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SupabaseProvider from '@/components/SupabaseProvider';
import QueryClientProviderWrapper from '@/components/QueryClientProviderWrapper';
import Header from '@/components/Header';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ingreedy – Use What You Have, Waste Less',
  description:
    'Smart recipes from your pantry ingredients – reduce waste with expiration tracking & optimization.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component can't set cookies on initial render
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider initialSession={session}>
          <Header />
          <QueryClientProviderWrapper>
            <main className="min-h-[calc(100vh-72px)]">{children}</main>
          </QueryClientProviderWrapper>
        </SupabaseProvider>
      </body>
    </html>
  );
}
