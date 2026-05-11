"use client";

import { useState } from "react";
import ImagePicker from "../components/ImagePicker";

interface Item {
  name: string;
  price: number;
  image?: string | null;
  accompagnement?: string | null;
  badge?: string | null;
  category_id?: string;
}

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
}

export default function ItemForm({
  item,
  categories,
  currentCategoryId,
  onSave,
  onCancel,
}: {
  item: Item | null;
  categories: CategoryOption[];
  currentCategoryId: string;
  onSave: (data: { name: string; price: number; image?: string; accompagnement?: string; badge?: string; categoryId: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [image, setImage] = useState(item?.image || "");
  const [accompagnement, setAccompagnement] = useState(item?.accompagnement || "");
  const [badge, setBadge] = useState(item?.badge || "");
  const [categoryId, setCategoryId] = useState(item?.category_id || currentCategoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      price: parseFloat(price),
      image: image || undefined,
      accompagnement: accompagnement || undefined,
      badge: badge || undefined,
      categoryId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-gray-900">{item ? "Modifier" : "Ajouter"} un article</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Nom *</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} required
            className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Prix (€) *</label>
          <input
            type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required
            className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Categorie *</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A] bg-white"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Photo */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Photo</label>
        <div className="flex items-start gap-4">
          <ImagePicker
            value={image}
            onChange={setImage}
            label={name || "item"}
          />
          <p className="text-xs text-gray-400 leading-relaxed flex-1">
            Cliquez sur la zone pour <span className="text-gray-600 font-semibold">choisir dans la galerie</span> ou <span className="text-gray-600 font-semibold">uploader une nouvelle image</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Accompagnement</label>
          <input
            type="text" value={accompagnement} onChange={e => setAccompagnement(e.target.value)}
            className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
            placeholder="Riz, banane plantain..."
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Badge</label>
          <input
            type="text" value={badge} onChange={e => setBadge(e.target.value)}
            className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
            placeholder="Sam. & Dim."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-[#C9922A] text-[#111008] font-bold px-5 py-2 rounded-[5px] text-sm hover:bg-[#E0AD4A] transition-colors disabled:opacity-50"
        >
          {item ? "Enregistrer" : "Ajouter"}
        </button>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
          Annuler
        </button>
      </div>
    </form>
  );
}
