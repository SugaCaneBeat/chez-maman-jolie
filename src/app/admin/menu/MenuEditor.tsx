"use client";

import { useState } from "react";
import {
  createMenuItem, updateMenuItem, deleteMenuItem,
  toggleItemAvailability, toggleIsSpecialite,
  createCategory, updateCategory, toggleCategoryActive, deleteCategory,
} from "@/lib/actions/menu";
import ItemForm from "./ItemForm";

interface Category {
  id: string; slug: string; name: string; icon: string; type: string; active?: boolean;
}
interface Item {
  id: string; category_id: string; name: string; price: number;
  image: string | null; accompagnement: string | null; badge: string | null;
  available: boolean; is_specialite?: boolean;
}

export default function MenuEditor({
  initialCategories, initialItems,
}: {
  initialCategories: Category[];
  initialItems: Item[];
}) {
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.map(c => ({ ...c, active: c.active ?? true }))
  );
  const [selectedCat, setSelectedCat] = useState(initialCategories[0]?.id || "");
  const [items, setItems]             = useState(initialItems);
  const [showForm, setShowForm]       = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Cat inline edit
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName]   = useState("");
  const [editCatIcon, setEditCatIcon]   = useState("");

  // New cat
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");

  /* ── helpers ── */
  const itemCount = (catId: string) => items.filter(i => i.category_id === catId).length;
  const filteredItems = items.filter(i => i.category_id === selectedCat);
  const fmt = (p: number) => p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`;

  /* ── item actions ── */
  const handleToggle = async (id: string, available: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available } : i));
    await toggleItemAvailability(id, available);
  };
  const handleToggleSpe = async (id: string, is_specialite: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_specialite } : i));
    await toggleIsSpecialite(id, is_specialite);
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
        ...i, name: data.name, price: data.price,
        image: data.image || null, accompagnement: data.accompagnement || null,
        badge: data.badge || null, category_id: data.categoryId,
      } : i));
    } else {
      const r = await createMenuItem({ categoryId: data.categoryId, name: data.name, price: data.price, image: data.image, accompagnement: data.accompagnement, badge: data.badge });
      if (r.success) window.location.reload();
    }
    setShowForm(false); setEditingItem(null);
  };

  /* ── category actions ── */
  const handleToggleCat = async (id: string, active: boolean) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active } : c));
    await toggleCategoryActive(id, active);
  };
  const startEditCat = (cat: Category) => {
    setEditingCatId(cat.id); setEditCatName(cat.name); setEditCatIcon(cat.icon);
  };
  const cancelEditCat = () => { setEditingCatId(null); setEditCatName(""); setEditCatIcon(""); };
  const saveEditCat = async (id: string) => {
    const name = editCatName.trim(); if (!name) return;
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, icon: editCatIcon } : c));
    await updateCategory(id, { name, icon: editCatIcon });
    cancelEditCat();
  };
  const handleDeleteCat = async (cat: Category) => {
    if (!confirm(`Supprimer "${cat.name}" ?`)) return;
    const r = await deleteCategory(cat.id);
    if (!r.success) { alert(r.error || "Erreur"); return; }
    setCategories(prev => prev.filter(c => c.id !== cat.id));
    if (selectedCat === cat.id) setSelectedCat(categories.filter(c => c.id !== cat.id)[0]?.id || "");
  };
  const handleCreateCat = async () => {
    const name = newCatName.trim(); if (!name) return;
    const r = await createCategory({ name, icon: newCatIcon });
    if (!r.success || !r.category) { alert(r.error || "Erreur"); return; }
    const cat = r.category as Category;
    setCategories(prev => [...prev, { ...cat, active: true }]);
    setSelectedCat(cat.id);
    setNewCatName(""); setNewCatIcon(""); setShowNewCat(false);
  };

  return (
    <div className="flex gap-0 min-h-[600px] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

      {/* ═══════════════════════════════════
          SIDEBAR CATÉGORIES
          ═══════════════════════════════════ */}
      <aside className="w-56 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="px-3 py-3 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Catégories</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {categories.map(cat => {
            const isSelected = selectedCat === cat.id;
            const isEditing  = editingCatId === cat.id;
            const count      = itemCount(cat.id);

            if (isEditing) return (
              <div key={cat.id} className="rounded-xl border border-[#C9922A] bg-amber-50 p-2 space-y-1.5">
                <div className="flex gap-1">
                  <input value={editCatIcon} onChange={e => setEditCatIcon(e.target.value)}
                    placeholder="🍽️" className="w-10 border border-gray-200 rounded-lg px-1.5 py-1 text-sm text-center focus:outline-none focus:border-[#C9922A]" />
                  <input value={editCatName} onChange={e => setEditCatName(e.target.value)}
                    placeholder="Nom" autoFocus
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#C9922A]" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => saveEditCat(cat.id)}
                    className="flex-1 bg-[#C9922A] text-white text-xs font-bold py-1 rounded-lg hover:bg-[#b8831f]">✓</button>
                  <button onClick={cancelEditCat}
                    className="flex-1 text-gray-400 text-xs py-1 rounded-lg hover:bg-gray-100">✕</button>
                </div>
              </div>
            );

            return (
              <div key={cat.id}
                className={`group flex items-center gap-1.5 rounded-xl px-2 py-1.5 cursor-pointer transition-colors ${
                  isSelected ? "bg-[#C9922A] text-[#111008]" : "hover:bg-gray-50 text-gray-700"
                } ${!cat.active ? "opacity-50" : ""}`}
                onClick={() => { setSelectedCat(cat.id); setShowForm(false); }}
              >
                {/* Icône + nom */}
                <span className="text-base leading-none">{cat.icon}</span>
                <span className={`flex-1 text-xs font-medium truncate ${isSelected ? "font-bold" : ""}`}>{cat.name}</span>

                {/* Compteur articles */}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected ? "bg-black/10 text-[#111008]" : "bg-gray-100 text-gray-400"
                }`}>{count}</span>

                {/* Actions au hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  {/* Toggle actif */}
                  <button onClick={() => handleToggleCat(cat.id, !cat.active)}
                    title={cat.active ? "Désactiver" : "Activer"}
                    className={`w-5 h-3 rounded-full relative flex-shrink-0 transition-colors ${cat.active ? "bg-green-400" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 w-2 h-2 bg-white rounded-full shadow transition-all ${cat.active ? "left-2.5" : "left-0.5"}`} />
                  </button>
                  {/* Éditer */}
                  <button onClick={() => startEditCat(cat)} title="Renommer"
                    className={`p-0.5 rounded ${isSelected ? "text-[#111008]/60 hover:text-[#111008]" : "text-gray-400 hover:text-[#C9922A]"}`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  {/* Supprimer */}
                  {count === 0 && (
                    <button onClick={() => handleDeleteCat(cat)} title="Supprimer"
                      className="p-0.5 rounded text-gray-400 hover:text-red-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Nouvelle catégorie */}
        <div className="px-2 py-2 border-t border-gray-100">
          {showNewCat ? (
            <div className="rounded-xl border border-[#C9922A] bg-amber-50 p-2 space-y-1.5">
              <div className="flex gap-1">
                <input value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)}
                  placeholder="🍽️" className="w-10 border border-gray-200 rounded-lg px-1.5 py-1 text-sm text-center focus:outline-none focus:border-[#C9922A]" />
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="Nom…" autoFocus
                  onKeyDown={e => e.key === "Enter" && handleCreateCat()}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#C9922A]" />
              </div>
              <div className="flex gap-1">
                <button onClick={handleCreateCat}
                  className="flex-1 bg-[#C9922A] text-white text-xs font-bold py-1 rounded-lg hover:bg-[#b8831f]">Créer</button>
                <button onClick={() => { setShowNewCat(false); setNewCatName(""); setNewCatIcon(""); }}
                  className="flex-1 text-gray-400 text-xs py-1 rounded-lg hover:bg-gray-100">Annuler</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewCat(true)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-dashed border-gray-200 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nouvelle catégorie
            </button>
          )}
        </div>
      </aside>

      {/* ═══════════════════════════════════
          ZONE ARTICLES
          ═══════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">
              {categories.find(c => c.id === selectedCat)?.icon}{" "}
              {categories.find(c => c.id === selectedCat)?.name}
            </h2>
            <p className="text-gray-400 text-xs">{filteredItems.length} article{filteredItems.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setShowForm(v => !v); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              showForm ? "bg-gray-100 text-gray-600" : "bg-[#C9922A] text-[#111008] hover:bg-[#E0AD4A]"
            }`}
          >
            {showForm ? "✕ Fermer" : "+ Ajouter"}
          </button>
        </div>

        {/* Formulaire inline */}
        {showForm && (
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <ItemForm
              item={editingItem}
              categories={categories.map(c => ({ id: c.id, name: c.name, icon: c.icon }))}
              currentCategoryId={selectedCat}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingItem(null); }}
            />
          </div>
        )}

        {/* Légende colonnes */}
        <div className="flex items-center gap-3 px-5 py-2 border-b border-gray-50 bg-gray-50/50">
          <div className="w-12 flex-shrink-0" />
          <div className="flex-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Article</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-16 text-right">Prix</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-20 text-center">Spécialité</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-16 text-center">Dispo</div>
          <div className="w-14" />
        </div>

        {/* Liste articles */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-sm">Aucun article</p>
              <button onClick={() => { setEditingItem(null); setShowForm(true); }}
                className="mt-3 text-xs text-[#C9922A] hover:underline">+ Ajouter le premier</button>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group">

                {/* Photo */}
                <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>
                  }
                </div>

                {/* Nom + badge + accompagnement */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm truncate">{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-500 uppercase tracking-wide flex-shrink-0">{item.badge}</span>
                    )}
                  </div>
                  {item.accompagnement && (
                    <p className="text-gray-400 text-xs truncate">{item.accompagnement}</p>
                  )}
                </div>

                {/* Prix */}
                <span className="font-bold text-[#C9922A] text-sm w-16 text-right flex-shrink-0">{fmt(Number(item.price))}</span>

                {/* ⭐ Spécialité — toujours visible, coloré si actif */}
                <div className="w-20 flex justify-center flex-shrink-0">
                  <button
                    onClick={() => handleToggleSpe(item.id, !item.is_specialite)}
                    title={item.is_specialite ? "Retirer des Spécialités" : "Marquer comme Spécialité"}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                      item.is_specialite
                        ? "bg-amber-50 text-amber-500 border border-amber-200"
                        : "bg-gray-50 text-gray-300 border border-gray-100 hover:text-amber-400 hover:border-amber-200"
                    }`}
                  >
                    ⭐
                  </button>
                </div>

                {/* Dispo toggle */}
                <div className="w-16 flex justify-center flex-shrink-0">
                  <button
                    onClick={() => handleToggle(item.id, !item.available)}
                    title={item.available ? "Disponible — cliquer pour masquer" : "Indisponible — cliquer pour activer"}
                    className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${item.available ? "bg-green-400" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${item.available ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Éditer + Supprimer */}
                <div className="w-14 flex items-center justify-end gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditingItem(item); setShowForm(true); }}
                    title="Modifier"
                    className="p-1.5 rounded-lg text-gray-300 hover:text-[#C9922A] hover:bg-amber-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Supprimer"
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
