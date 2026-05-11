"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  defaultCategoryId: string;
  categories: { id: string; name: string; icon: string }[];
  onAdd: (data: { name: string; price: number; categoryId: string }) => void;
  onClose: () => void;
}

export default function QuickAddItem({ defaultCategoryId, categories, onAdd, onClose }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price.replace(",", "."));
    if (!name.trim() || isNaN(p) || p <= 0) return;
    setBusy(true);
    onAdd({ name: name.trim(), price: p, categoryId });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[5px] shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Ajout rapide</h3>
            <p className="text-xs text-gray-400 mt-0.5">Ajoutez les détails (photo, etc.) plus tard</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[5px] hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Nom */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
              Nom du plat <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Poulet Muamba"
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A] focus:ring-2 focus:ring-[#C9922A]/10"
              required
            />
          </div>

          {/* Prix + Catégorie */}
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
                Prix € <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="14"
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A] focus:ring-2 focus:ring-[#C9922A]/10"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
                Catégorie
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A] bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={busy || !name.trim() || !price}
            className="px-4 py-2 bg-[#C9922A] hover:bg-[#b8831f] text-white text-sm font-bold rounded-[5px] disabled:opacity-40 transition-colors"
          >
            Ajouter au menu
          </button>
        </div>
      </form>
    </div>
  );
}
