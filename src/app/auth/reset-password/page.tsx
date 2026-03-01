'use client';

import { useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-green-800 mb-3">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We sent a password reset link to <strong>{email}</strong>. Click it to set a new password.
          </p>
          <Link href="/auth/login" className="text-green-700 font-medium hover:underline">
            Back to Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-800 mb-3 text-center">Reset Password</h1>
        <p className="text-gray-500 text-center mb-8">
          Enter your email and we will send you a link to reset your password.
        </p>

        <form onSubmit={handleReset} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-800 disabled:opacity-50 transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          <Link href="/auth/login" className="text-green-700 font-medium hover:underline">
            Back to Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
