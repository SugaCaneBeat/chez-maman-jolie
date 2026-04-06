"use client";

import { useState } from "react";

interface Item {
  name: string;
  price: number;
  image?: string | null;
  accompagnement?: string | null;
  badge?: string | null;
}

export default function ItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: Item | null;
  onSave: (data: { name: string; price: number; image?: string; accompagnement?: string; badge?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [image, setImage] = useState(item?.image || "");
  const [accompagnement, setAccompagnement] = useState(item?.accompagnement || "");
  const [badge, setBadge] = useState(item?.badge || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      price: parseFloat(price),
      image: image || undefined,
      accompagnement: accompagnement || undefined,
      badge: badge || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-gray-900">{item ? "Modifier" : "Ajouter"} un article</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Nom *</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Prix (€) *</label>
          <input
            type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Image URL</label>
        <input
          type="url" value={image} onChange={e => setImage(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Accompagnement</label>
          <input
            type="text" value={accompagnement} onChange={e => setAccompagnement(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
            placeholder="Riz, banane plantain..."
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Badge</label>
          <input
            type="text" value={badge} onChange={e => setBadge(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
            placeholder="Sam. & Dim."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-[#C9922A] text-[#111008] font-bold px-5 py-2 rounded-xl text-sm hover:bg-[#E0AD4A] transition-colors">
          {item ? "Enregistrer" : "Ajouter"}
        </button>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
          Annuler
        </button>
      </div>
    </form>
  );
}
