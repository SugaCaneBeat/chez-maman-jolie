"use client";

import { useState, useRef } from "react";
import { uploadMenuImage } from "@/lib/actions/menu";

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setUploadError("Merci de selectionner une image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image trop lourde (max 5MB)");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemName", name || "item");

      const result = await uploadMenuImage(formData);
      if (!result.success || !result.url) {
        throw new Error(result.error || "Echec du telechargement");
      }
      setImage(result.url);
    } catch (err) {
      setUploadError("Erreur : " + (err instanceof Error ? err.message : "inconnue"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Categorie *</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A] bg-white"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Photo</label>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-dashed border-gray-200">
            {image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Telechargement...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  {image ? "Changer la photo" : "Uploader une photo"}
                </>
              )}
            </button>

            <div className="text-xs text-gray-400">Ou coller une URL :</div>
            <input
              type="url"
              value={image}
              onChange={e => setImage(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C9922A]"
              placeholder="https://..."
            />
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          </div>
        </div>
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
        <button
          type="submit"
          disabled={uploading}
          className="bg-[#C9922A] text-[#111008] font-bold px-5 py-2 rounded-xl text-sm hover:bg-[#E0AD4A] transition-colors disabled:opacity-50"
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
