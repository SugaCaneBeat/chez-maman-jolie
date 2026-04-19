"use client";

import { useState } from "react";
import { createMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } from "@/lib/actions/menu";
import ItemForm from "./ItemForm";

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  type: string;
}

interface Item {
  id: string;
  category_id: string;
  name: string;
  price: number;
  image: string | null;
  accompagnement: string | null;
  badge: string | null;
  available: boolean;
}

export default function MenuEditor({ initialCategories, initialItems }: { initialCategories: Category[]; initialItems: Item[] }) {
  const [selectedCat, setSelectedCat] = useState(initialCategories[0]?.id || "");
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const filteredItems = items.filter(i => i.category_id === selectedCat);

  const handleToggle = async (id: string, available: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available } : i));
    await toggleItemAvailability(id, available);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    await deleteMenuItem(id);
  };

  const handleSave = async (data: { name: string; price: number; image?: string; accompagnement?: string; badge?: string; categoryId: string }) => {
    if (editingItem) {
      await updateMenuItem(editingItem.id, data);
      setItems(prev => prev.map(i => i.id === editingItem.id ? {
        ...i,
        name: data.name,
        price: data.price,
        image: data.image || null,
        accompagnement: data.accompagnement || null,
        badge: data.badge || null,
        category_id: data.categoryId,
      } : i));
    } else {
      const result = await createMenuItem({
        categoryId: data.categoryId,
        name: data.name,
        price: data.price,
        image: data.image,
        accompagnement: data.accompagnement,
        badge: data.badge,
      });
      if (result.success) {
        window.location.reload();
      }
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const formatPrice = (p: number) => (p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`);

  return (
    <div className="flex gap-6">
      {/* Category sidebar */}
      <div className="w-48 flex-shrink-0 space-y-1">
        {initialCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCat(cat.id); setShowForm(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
              selectedCat === cat.id ? "bg-[#C9922A] text-[#111008] font-bold" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">
            {initialCategories.find(c => c.id === selectedCat)?.name || ""}
          </h2>
          <button
            onClick={() => { setEditingItem(null); setShowForm(true); }}
            className="bg-[#C9922A] text-[#111008] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#E0AD4A] transition-colors"
          >
            + Ajouter
          </button>
        </div>

        {showForm && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6">
            <ItemForm
              item={editingItem}
              categories={initialCategories.map(c => ({ id: c.id, name: c.name, icon: c.icon }))}
              currentCategoryId={selectedCat}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingItem(null); }}
            />
          </div>
        )}

        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun article dans cette catégorie</p>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-600 uppercase">{item.badge}</span>
                    )}
                  </div>
                  {item.accompagnement && <p className="text-gray-400 text-xs">{item.accompagnement}</p>}
                </div>
                <span className="font-bold text-[#C9922A] text-sm">{formatPrice(Number(item.price))}</span>

                {/* Toggle availability */}
                <button
                  onClick={() => handleToggle(item.id, !item.available)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${item.available ? "bg-green-400" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.available ? "left-4" : "left-0.5"}`} />
                </button>

                {/* Edit */}
                <button
                  onClick={() => { setEditingItem(item); setShowForm(true); }}
                  className="text-gray-400 hover:text-[#C9922A] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
