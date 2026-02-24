'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import {
  UNIT_OPTIONS,
  DEFAULT_EXPIRATIONS,
  COMMON_INGREDIENTS,
  type PantryItem,
} from '@/types';

export default function PantryPage() {
  const { supabase, session } = useSupabase();
  const router = useRouter();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('count');
  const [expirationDate, setExpirationDate] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, router]);

  // Fetch pantry items
  useEffect(() => {
    if (!session) return;

    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };

    fetchItems();
  }, [session, supabase]);

  // Auto-set expiration when ingredient name changes
  useEffect(() => {
    const lower = name.toLowerCase().trim();
    if (lower && DEFAULT_EXPIRATIONS[lower]) {
      const days = DEFAULT_EXPIRATIONS[lower];
      const date = addDays(new Date(), days);
      setExpirationDate(format(date, 'yyyy-MM-dd'));
    }
  }, [name]);

  // Autocomplete filtering
  useEffect(() => {
    if (name.length >= 1) {
      const filtered = COMMON_INGREDIENTS.filter((i) =>
        i.toLowerCase().includes(name.toLowerCase())
      ).slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [name]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !name.trim()) return;

    setError('');
    setAdding(true);

    const newItem = {
      user_id: session.user.id,
      name: name.trim(),
      quantity_amount: parseFloat(amount) || 1,
      quantity_unit: unit,
      expiration_date: expirationDate || null,
    };

    const { data, error: insertError } = await supabase
      .from('pantry_items')
      .insert(newItem)
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      setItems((prev) => [data, ...prev]);
      setName('');
      setAmount('1');
      setUnit('count');
      setExpirationDate('');
    }

    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('pantry_items').delete().eq('id', id);
    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const getExpirationBadge = (dateStr: string | null) => {
    if (!dateStr) return null;
    const days = differenceInDays(parseISO(dateStr), new Date());

    if (days < 0) {
      return (
        <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          Expired
        </span>
      );
    }
    if (days <= 3) {
      return (
        <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {days === 0 ? 'Today' : `${days}d left`}
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {days}d left
        </span>
      );
    }
    return (
      <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
        {days}d left
      </span>
    );
  };

  // Sort: expired/expiring first
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (!a.expiration_date && !b.expiration_date) return 0;
      if (!a.expiration_date) return 1;
      if (!b.expiration_date) return -1;
      return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
    });
  }, [items]);

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Your Pantry</h1>

      {/* Add Item Form */}
      <form
        onSubmit={handleAddItem}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Add Ingredient
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Name with autocomplete */}
          <div className="md:col-span-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredient
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => name.length >= 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. Chicken Breast"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {showSuggestions && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    onMouseDown={() => {
                      setName(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="px-3 py-2 hover:bg-green-50 cursor-pointer text-gray-800 text-sm"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Amount */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Unit */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Expiration */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={adding}
              className="w-full bg-green-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 transition"
            >
              {adding ? '…' : '+'}
            </button>
          </div>
        </div>
      </form>

      {/* Pantry Table */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading pantry…</div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 text-lg">Your pantry is empty.</p>
          <p className="text-gray-400">Add some ingredients above to get started!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                  Ingredient
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                  Quantity
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                  Expires
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.quantity_amount} {item.quantity_unit}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.expiration_date && (
                        <span className="text-gray-500 text-sm">
                          {format(parseISO(item.expiration_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {getExpirationBadge(item.expiration_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-center text-gray-400 text-sm mt-6">
        {items.length} item{items.length !== 1 ? 's' : ''} in your pantry
      </p>
    </div>
  );
}
