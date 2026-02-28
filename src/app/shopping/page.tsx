'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { DEFAULT_EXPIRATIONS } from '@/types';
import { useToast } from '@/components/Toast';
import { ShoppingListSkeleton } from '@/components/Skeletons';

interface ShoppingItem {
  id: string;
  user_id: string;
  ingredient_name: string;
  amount: number;
  unit: string;
  for_recipe: string | null;
  for_meal_id: string | null;
  checked: boolean;
  created_at: string;
}

export default function ShoppingPage() {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const { addToast } = useToast();

  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToPantry, setAddingToPantry] = useState<string | null>(null);

  // Manual add form
  const [manualName, setManualName] = useState('');
  const [manualAmount, setManualAmount] = useState('1');
  const [manualUnit, setManualUnit] = useState('count');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, router]);

  // Fetch shopping list
  useEffect(() => {
    if (!session) return;
    fetchItems();
  }, [session, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchItems = async () => {
    if (!session) return;
    const { data } = await (supabase as any)
      .from('shopping_list')
      .select('*')
      .eq('user_id', session.user.id)
      .order('checked', { ascending: true })
      .order('created_at', { ascending: false });

    if (data) setItems(data);
    setLoading(false);
  };

  // Toggle checked
  const toggleChecked = async (id: string, current: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !current } : i))
    );
    await (supabase as any)
      .from('shopping_list')
      .update({ checked: !current })
      .eq('id', id);
  };

  // Delete single item
  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await (supabase as any).from('shopping_list').delete().eq('id', id);
  };

  // Clear all checked items
  const clearChecked = async () => {
    const checkedIds = items.filter((i) => i.checked).map((i) => i.id);
    if (checkedIds.length === 0) return;

    setItems((prev) => prev.filter((i) => !i.checked));
    await (supabase as any)
      .from('shopping_list')
      .delete()
      .in('id', checkedIds);
  };

  // Clear entire list
  const clearAll = async () => {
    if (!session) return;
    if (!confirm('Clear your entire shopping list?')) return;
    setItems([]);
    await (supabase as any)
      .from('shopping_list')
      .delete()
      .eq('user_id', session.user.id);
  };

  // Add item to pantry after buying it
  const addToPantry = async (item: ShoppingItem) => {
    if (!session) return;
    setAddingToPantry(item.id);

    // Calculate expiration date
    const nameLower = item.ingredient_name.toLowerCase();
    const shelfDays = DEFAULT_EXPIRATIONS[nameLower] || 7;
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + shelfDays);

    const { error } = await (supabase as any).from('pantry_items').insert({
      user_id: session.user.id,
      name: item.ingredient_name,
      quantity_amount: item.amount,
      quantity_unit: item.unit,
      expiration_date: expDate.toISOString().split('T')[0],
    } as any);

    if (!error) {
      // Mark as checked and remove from list
      await (supabase as any).from('shopping_list').delete().eq('id', item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      addToast(`${item.ingredient_name} added to pantry`);
    }

    setAddingToPantry(null);
  };

  // Manual add
  const handleManualAdd = async () => {
    if (!session || !manualName.trim()) return;
    setAdding(true);

    const { data, error } = await (supabase as any)
      .from('shopping_list')
      .insert({
        user_id: session.user.id,
        ingredient_name: manualName.trim(),
        amount: parseFloat(manualAmount) || 1,
        unit: manualUnit,
        for_recipe: null,
        for_meal_id: null,
        checked: false,
      } as any)
      .select()
      .single();

    if (data && !error) {
      setItems((prev) => [data, ...prev]);
      setManualName('');
      setManualAmount('1');
      setManualUnit('count');
    }
    setAdding(false);
  };

  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);

  // Group unchecked by recipe
  const groupedByRecipe: Record<string, ShoppingItem[]> = {};
  for (const item of uncheckedItems) {
    const key = item.for_recipe || 'Other';
    if (!groupedByRecipe[key]) groupedByRecipe[key] = [];
    groupedByRecipe[key].push(item);
  }

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800">Shopping List</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {uncheckedItems.length} item{uncheckedItems.length !== 1 ? 's' : ''} to buy
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex gap-2">
            {checkedItems.length > 0 && (
              <button
                onClick={clearChecked}
                className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Clear checked ({checkedItems.length})
              </button>
            )}
            <button
              onClick={clearAll}
              className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Manual add form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
        <p className="text-sm font-medium text-gray-700 mb-3">Add item manually</p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
            placeholder="Ingredient name..."
            className="flex-1 min-w-[180px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            min="0"
            step="0.25"
          />
          <select
            value={manualUnit}
            onChange={(e) => setManualUnit(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="count">count</option>
            <option value="oz">oz</option>
            <option value="lb">lb</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="cup">cup</option>
            <option value="tbsp">tbsp</option>
            <option value="tsp">tsp</option>
            <option value="ml">ml</option>
            <option value="L">L</option>
            <option value="can">can</option>
            <option value="bottle">bottle</option>
            <option value="bag">bag</option>
            <option value="box">box</option>
            <option value="bunch">bunch</option>
          </select>
          <button
            onClick={handleManualAdd}
            disabled={adding || !manualName.trim()}
            className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition"
          >
            {adding ? 'Adding…' : '+ Add'}
          </button>
        </div>
      </div>

      {loading ? (
        <ShoppingListSkeleton />
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-600 text-lg mb-2">Your shopping list is empty!</p>
          <p className="text-gray-400 mb-6">
            Go to Recipes and click &ldquo;Add to Shopping List&rdquo; on a recipe to get started.
          </p>
          <button
            onClick={() => router.push('/recipes')}
            className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
          >
            Find Recipes
          </button>
        </div>
      ) : (
        <div>
          {/* Unchecked items grouped by recipe */}
          {Object.entries(groupedByRecipe).map(([recipe, recipeItems]) => (
            <div key={recipe} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {recipe === 'Other' ? '📝 Manual items' : `🍳 ${recipe}`}
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
                {recipeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleChecked(item.id, item.checked)}
                      className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center hover:border-green-500 transition flex-shrink-0"
                    >
                      {item.checked && (
                        <span className="text-green-600 text-sm">✓</span>
                      )}
                    </button>

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-800 font-medium">
                        {item.ingredient_name}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {item.amount} {item.unit}
                      </span>
                    </div>

                    {/* Add to pantry button */}
                    <button
                      onClick={() => addToPantry(item)}
                      disabled={addingToPantry === item.id}
                      className="text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition font-medium flex-shrink-0"
                      title="Bought it — add to pantry"
                    >
                      {addingToPantry === item.id ? '…' : '✓ Bought → Pantry'}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Checked items */}
          {checkedItems.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                ✓ Checked off ({checkedItems.length})
              </h3>
              <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
                {checkedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <button
                      onClick={() => toggleChecked(item.id, item.checked)}
                      className="w-5 h-5 rounded border-2 border-green-400 bg-green-100 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-green-600 text-sm">✓</span>
                    </button>
                    <span className="text-sm text-gray-400 line-through flex-1">
                      {item.ingredient_name}
                      <span className="text-xs ml-2">
                        {item.amount} {item.unit}
                      </span>
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
