'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import {
  UNIT_OPTIONS,
  DEFAULT_EXPIRATIONS,
  COMMON_INGREDIENTS,
  type PantryItem,
} from '@/types';
import { STANDARD_PACKAGES } from '@/lib/packages';

// ──────────────────────────────────────────
// Inline Editable Cell
// ──────────────────────────────────────────
function EditableCell({
  value,
  onSave,
  type = 'text',
  options,
  className = '',
}: {
  value: string;
  onSave: (newValue: string) => void;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(value);
      setEditing(false);
    }
  };

  if (editing) {
    if (type === 'select' && options) {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          className="border border-green-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        step={type === 'number' ? '0.1' : undefined}
        min={type === 'number' ? '0.1' : undefined}
        className="border border-green-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
      />
    );
  }

  return (
    <span
      onClick={() => {
        setEditValue(value);
        setEditing(true);
      }}
      className={`cursor-pointer hover:bg-green-50 rounded px-1 py-0.5 transition ${className}`}
      title="Click to edit"
    >
      {value || '—'}
    </span>
  );
}

// ──────────────────────────────────────────
// Quick-add suggestions from standard packages
// ──────────────────────────────────────────
const STARTER_INGREDIENTS = [
  'Eggs', 'Milk', 'Butter', 'Chicken Breast', 'Rice', 'Onions',
  'Garlic', 'Olive Oil', 'Salt', 'Pasta', 'Tomatoes', 'Cheese',
  'Ground Beef', 'Bread', 'Potatoes', 'Carrots', 'Bell Pepper',
  'Sour Cream', 'Bacon', 'Flour', 'Sugar', 'Chicken Broth',
  'Soy Sauce', 'Lemons', 'Spinach', 'Mushrooms', 'Black Pepper',
  'Cheddar Cheese', 'Greek Yogurt', 'Tortillas',
].map((name) => {
  const pkg = STANDARD_PACKAGES[name.toLowerCase()];
  return {
    name,
    amount: pkg?.amount ?? 1,
    unit: pkg?.unit ?? 'count',
    packageLabel: pkg?.packageLabel ?? '',
  };
});

// ──────────────────────────────────────────
// Main Pantry Page
// ──────────────────────────────────────────
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
        .from('pantry_items' as any)
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

    const { data, error: insertError } = await (supabase as any)
      .from('pantry_items' as any)
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

  // Quick-add for onboarding
  const handleQuickAdd = async (starter: typeof STARTER_INGREDIENTS[0]) => {
    if (!session) return;

    const nameLower = starter.name.toLowerCase();
    const shelfDays = DEFAULT_EXPIRATIONS[nameLower] || 14;
    const expDate = format(addDays(new Date(), shelfDays), 'yyyy-MM-dd');

    const { data, error } = await (supabase as any)
      .from('pantry_items' as any)
      .insert({
        user_id: session.user.id,
        name: starter.name,
        quantity_amount: starter.amount,
        quantity_unit: starter.unit,
        expiration_date: expDate,
      })
      .select()
      .single();

    if (!error && data) {
      setItems((prev) => [data, ...prev]);
    }
  };

  // Inline edit handler
  const handleEdit = async (
    itemId: string,
    field: string,
    value: string
  ) => {
    let updateData: Record<string, any> = {};

    if (field === 'name') {
      updateData.name = value;
    } else if (field === 'quantity_amount') {
      updateData.quantity_amount = parseFloat(value) || 1;
    } else if (field === 'quantity_unit') {
      updateData.quantity_unit = value;
    } else if (field === 'expiration_date') {
      updateData.expiration_date = value || null;
    }

    const { error } = await (supabase as any)
      .from('pantry_items' as any)
      .update(updateData)
      .eq('id', itemId);

    if (!error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...updateData } : item
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('pantry_items' as any).delete().eq('id', id);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-6 sm:mb-8">Your Pantry</h1>

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
              {adding ? '...' : '+'}
            </button>
          </div>
        </div>
      </form>

      {/* Pantry Content */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading pantry...</div>
      ) : (
        <>
          {/* Empty state message */}
          {sortedItems.length === 0 && items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg mb-2">Your pantry is empty!</p>
              <p className="text-gray-400">
                Add what you have at home using the form above or the quick-add suggestions below.
              </p>
            </div>
          )}

          {/* Pantry items */}
          {sortedItems.length > 0 && (
            <div className="mb-8">
              <p className="text-xs text-gray-400 mb-2 text-right hidden sm:block">
                Click any value to edit it
              </p>

              {/* Desktop table */}
              <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
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
                          <EditableCell
                            value={item.name}
                            onSave={(v) => handleEdit(item.id, 'name', v)}
                          />
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <EditableCell
                              value={String(item.quantity_amount)}
                              type="number"
                              onSave={(v) => handleEdit(item.id, 'quantity_amount', v)}
                              className="w-16 inline-block"
                            />
                            <EditableCell
                              value={item.quantity_unit}
                              type="select"
                              options={UNIT_OPTIONS}
                              onSave={(v) => handleEdit(item.id, 'quantity_unit', v)}
                            />
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <EditableCell
                              value={item.expiration_date || ''}
                              type="date"
                              onSave={(v) => handleEdit(item.id, 'expiration_date', v)}
                              className="text-gray-500 text-sm"
                            />
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

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {sortedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-800 text-base">
                        <EditableCell
                          value={item.name}
                          onSave={(v) => handleEdit(item.id, 'name', v)}
                        />
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-300 hover:text-red-500 text-lg leading-none transition ml-2"
                      >
                        x
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <EditableCell
                          value={String(item.quantity_amount)}
                          type="number"
                          onSave={(v) => handleEdit(item.id, 'quantity_amount', v)}
                          className="w-12 inline-block"
                        />
                        <EditableCell
                          value={item.quantity_unit}
                          type="select"
                          options={UNIT_OPTIONS}
                          onSave={(v) => handleEdit(item.id, 'quantity_unit', v)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {getExpirationBadge(item.expiration_date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick-add suggested ingredients — collapsible, after pantry items */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <details open={items.length === 0}>
              <summary className="px-5 py-4 cursor-pointer select-none hover:bg-gray-50 rounded-xl transition">
                <span className="text-sm font-semibold text-gray-700">
                  Suggested ingredients
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  ({STARTER_INGREDIENTS.filter(s => !items.some(i => i.name.toLowerCase() === s.name.toLowerCase())).length} available)
                </span>
              </summary>
              <div className="px-5 pb-4 flex flex-wrap gap-2">
                {STARTER_INGREDIENTS.map((starter) => {
                  const alreadyAdded = items.some(
                    (i) => i.name.toLowerCase() === starter.name.toLowerCase()
                  );
                  return (
                    <button
                      key={starter.name}
                      onClick={() => !alreadyAdded && handleQuickAdd(starter)}
                      disabled={alreadyAdded}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        alreadyAdded
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300'
                      }`}
                    >
                      {alreadyAdded ? '✓ ' : '+ '}
                      {starter.name}
                      {!alreadyAdded && starter.packageLabel && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({starter.packageLabel})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </details>
          </div>
        </>
      )}

      <p className="text-center text-gray-400 text-sm mt-6">
        {items.length} item{items.length !== 1 ? 's' : ''} in your pantry
      </p>
    </div>
  );
}
