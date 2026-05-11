"use client";

import { useState } from "react";
import type { Category, Item } from "./MenuEditor";

interface Props {
  categories: Category[];
  items: Item[];
  selectedId: string;
  onSelect: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onSave: (id: string, data: { name: string; icon: string }) => void;
  onDelete: (cat: Category) => void;
  onCreate: (data: { name: string; icon: string }) => Promise<boolean>;
}

const TYPE_BADGES: Record<string, { label: string; tone: string }> = {
  standard: { label: "Plats",    tone: "bg-amber-50 text-amber-700" },
  formules: { label: "Formules", tone: "bg-blue-50 text-blue-700" },
  boissons: { label: "Boissons", tone: "bg-cyan-50 text-cyan-700" },
};

export default function CategorySidebar({
  categories, items, selectedId, onSelect, onToggle, onSave, onDelete, onCreate,
}: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🍽️");

  const itemCount = (catId: string) => items.filter((i) => i.category_id === catId).length;

  const startEdit = (cat: Category) => {
    setEditId(cat.id); setEditName(cat.name); setEditIcon(cat.icon);
  };
  const cancelEdit = () => { setEditId(null); setEditName(""); setEditIcon(""); };
  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    onSave(id, { name: editName.trim(), icon: editIcon });
    cancelEdit();
  };

  const createCat = async () => {
    if (!newName.trim()) return;
    const ok = await onCreate({ name: newName.trim(), icon: newIcon });
    if (ok) {
      setNewName(""); setNewIcon("🍽️"); setShowNew(false);
    }
  };

  return (
    <aside className="lg:w-72 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Catégories</p>
        <p className="text-xs text-gray-500 mt-0.5">{categories.length} au total</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          const isEditing = editId === cat.id;
          const count = itemCount(cat.id);
          const badge = TYPE_BADGES[cat.type] ?? { label: cat.type, tone: "bg-gray-100 text-gray-600" };

          if (isEditing) {
            return (
              <div key={cat.id} className="rounded-[5px] border-2 border-[#C9922A] bg-amber-50/50 p-2 space-y-2">
                <div className="flex gap-1.5">
                  <input
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    placeholder="🍽️"
                    className="w-12 text-center border border-gray-200 rounded-[5px] px-1 py-1.5 text-sm focus:outline-none focus:border-[#C9922A]"
                  />
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nom"
                    autoFocus
                    className="flex-1 border border-gray-200 rounded-[5px] px-2 py-1.5 text-xs focus:outline-none focus:border-[#C9922A]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(cat.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => saveEdit(cat.id)}
                    className="flex-1 bg-[#C9922A] text-white text-xs font-bold py-1 rounded-[5px] hover:bg-[#b8831f]"
                  >
                    ✓ Enregistrer
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-2 text-gray-400 text-xs py-1 rounded-[5px] hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`group cursor-pointer rounded-[5px] transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-[#C9922A] to-[#E0AD4A] shadow-md shadow-[#C9922A]/20"
                  : "hover:bg-gray-50 border border-transparent"
              } ${!cat.active ? "opacity-50" : ""}`}
            >
              <div className="p-2.5 flex items-center gap-2.5">
                <span className="text-xl leading-none flex-shrink-0">{cat.icon || "📂"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-bold truncate ${isSelected ? "text-[#111008]" : "text-gray-800"}`}>
                      {cat.name}
                    </p>
                    {!cat.active && (
                      <span className="text-[8px] uppercase font-bold tracking-wider text-gray-500">
                        Masquée
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-[5px] font-bold uppercase tracking-wider ${
                      isSelected ? "bg-black/15 text-[#111008]" : badge.tone
                    }`}>
                      {badge.label}
                    </span>
                    {count > 0 && (
                      <span className={`text-[10px] ${isSelected ? "text-[#111008]/70" : "text-gray-400"}`}>
                        {count} {count > 1 ? "plats" : "plat"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions hover */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {/* Toggle active */}
                  <button
                    onClick={() => onToggle(cat.id, !cat.active)}
                    title={cat.active ? "Désactiver" : "Activer"}
                    className={`w-7 h-3.5 rounded-full relative transition-colors ${cat.active ? "bg-green-400" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-all ${cat.active ? "left-3.5" : "left-0.5"}`} />
                  </button>
                  {/* Edit */}
                  <button
                    onClick={() => startEdit(cat)}
                    title="Renommer"
                    className={`p-1 rounded ${isSelected ? "text-[#111008]/60 hover:text-[#111008]" : "text-gray-400 hover:text-[#C9922A]"}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  {/* Delete (only if empty) */}
                  {count === 0 && (
                    <button
                      onClick={() => onDelete(cat)}
                      title="Supprimer"
                      className="p-1 rounded text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Nouvelle catégorie */}
      <div className="p-2 border-t border-gray-100">
        {showNew ? (
          <div className="rounded-[5px] border-2 border-[#C9922A] bg-amber-50/50 p-2 space-y-2">
            <div className="flex gap-1.5">
              <input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="🍽️"
                className="w-12 text-center border border-gray-200 rounded-[5px] px-1 py-1.5 text-sm focus:outline-none focus:border-[#C9922A]"
              />
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom de la catégorie"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && createCat()}
                className="flex-1 border border-gray-200 rounded-[5px] px-2 py-1.5 text-xs focus:outline-none focus:border-[#C9922A]"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={createCat}
                className="flex-1 bg-[#C9922A] text-white text-xs font-bold py-1 rounded-[5px] hover:bg-[#b8831f]"
              >
                Créer
              </button>
              <button
                onClick={() => { setShowNew(false); setNewName(""); }}
                className="px-2 text-gray-400 text-xs py-1 rounded-[5px] hover:bg-gray-100"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[5px] text-xs text-gray-500 hover:text-[#C9922A] hover:bg-amber-50 border border-dashed border-gray-200 hover:border-[#C9922A]/50 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Nouvelle catégorie
          </button>
        )}
      </div>
    </aside>
  );
}
