"use client";

import { useEffect, useState, useTransition } from "react";
import {
  listBoissonSubcategories,
  createBoissonSubcategory,
  updateBoissonSubcategory,
  deleteBoissonSubcategory,
  createBoissonItem,
  updateBoissonItem,
  deleteBoissonItem,
  toggleBoissonItemAvailable,
  type BoissonSubcategoryAdmin,
} from "@/lib/actions/boissons";
import { uploadMenuImage } from "@/lib/actions/menu";

interface Props {
  categoryId: string;
  categoryName: string;
}

const fmt = (p: number) => (p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`);

export default function BoissonsEditor({ categoryId, categoryName }: Props) {
  const [subs, setSubs] = useState<BoissonSubcategoryAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  /* subcategory edit state */
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName]   = useState("");

  /* new subcategory state */
  const [showNewSub, setShowNewSub] = useState(false);
  const [newSubName, setNewSubName] = useState("");

  /* item edit state: { subId, itemId | "new", name, price } */
  const [editingItem, setEditingItem] = useState<{
    subId: string; itemId: string | null; name: string; price: string;
  } | null>(null);

  /* upload state */
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const reload = async () => {
    const data = await listBoissonSubcategories(categoryId);
    setSubs(data);
  };

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  /* ── Subcategory actions ── */
  const handleCreateSub = () => {
    const name = newSubName.trim();
    if (!name) return;
    startTransition(async () => {
      await createBoissonSubcategory(categoryId, name);
      setNewSubName(""); setShowNewSub(false);
      await reload();
    });
  };

  const handleRenameSub = (id: string) => {
    const name = editSubName.trim();
    if (!name) return;
    startTransition(async () => {
      await updateBoissonSubcategory(id, { name });
      setEditingSubId(null);
      await reload();
    });
  };

  const handleDeleteSub = (s: BoissonSubcategoryAdmin) => {
    const count = s.items.length;
    const msg = count > 0
      ? `Supprimer "${s.name}" et ses ${count} boisson${count > 1 ? "s" : ""} ?`
      : `Supprimer "${s.name}" ?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      await deleteBoissonSubcategory(s.id);
      await reload();
    });
  };

  const handleUploadSubImage = async (subId: string, file: File) => {
    setUploadingFor(subId);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await uploadMenuImage(form);
      if (res.success && res.url) {
        await updateBoissonSubcategory(subId, { image: res.url });
        await reload();
      }
    } finally {
      setUploadingFor(null);
    }
  };

  /* ── Item actions ── */
  const handleSaveItem = async () => {
    if (!editingItem) return;
    const price = parseFloat(editingItem.price.replace(",", "."));
    if (!editingItem.name.trim() || !(price > 0)) return;
    startTransition(async () => {
      if (editingItem.itemId) {
        await updateBoissonItem(editingItem.itemId, { name: editingItem.name, price });
      } else {
        await createBoissonItem(editingItem.subId, categoryId, editingItem.name, price);
      }
      setEditingItem(null);
      await reload();
    });
  };

  const handleToggleItem = (itemId: string, available: boolean) => {
    /* optimistic */
    setSubs(prev => prev.map(s => ({
      ...s, items: s.items.map(i => i.id === itemId ? { ...i, available } : i)
    })));
    startTransition(async () => { await toggleBoissonItemAvailable(itemId, available); });
  };

  const handleDeleteItem = (itemId: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    startTransition(async () => {
      await deleteBoissonItem(itemId);
      await reload();
    });
  };

  /* ── Render ── */
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Chargement…
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-900 text-sm">🥤 {categoryName}</h2>
          <p className="text-gray-400 text-xs">
            {subs.length} sous-catégorie{subs.length !== 1 ? "s" : ""} · {subs.reduce((n, s) => n + s.items.length, 0)} boisson{subs.reduce((n, s) => n + s.items.length, 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowNewSub(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[5px] text-sm font-bold bg-[#C9922A] text-[#111008] hover:bg-[#E0AD4A] transition-colors"
        >
          + Sous-catégorie
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
        {/* New subcategory form */}
        {showNewSub && (
          <div className="bg-white rounded-[5px] border-2 border-[#C9922A] p-4">
            <div className="flex items-center gap-2">
              <input
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                autoFocus
                placeholder="Nouvelle sous-catégorie (ex: Bières)"
                className="flex-1 border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
                onKeyDown={e => e.key === "Enter" && handleCreateSub()}
              />
              <button
                onClick={handleCreateSub}
                className="px-4 py-2 bg-[#C9922A] text-white text-sm font-bold rounded-[5px] hover:bg-[#b8831f]"
              >Créer</button>
              <button
                onClick={() => { setShowNewSub(false); setNewSubName(""); }}
                className="px-3 py-2 text-gray-400 text-sm rounded-[5px] hover:bg-gray-100"
              >✕</button>
            </div>
          </div>
        )}

        {subs.length === 0 && !showNewSub && (
          <div className="bg-white rounded-[5px] border border-gray-100 p-10 text-center text-gray-400">
            <p className="text-sm mb-2">Aucune sous-catégorie</p>
            <button
              onClick={() => setShowNewSub(true)}
              className="text-xs text-[#C9922A] hover:underline"
            >+ Créer la première (ex: Sodas, Bières, Vins…)</button>
          </div>
        )}

        {/* Subcategories */}
        {subs.map(sub => (
          <div key={sub.id} className="bg-white rounded-[5px] border border-gray-100 overflow-hidden shadow-sm">
            {/* Sub header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              {/* Image */}
              <label className="w-12 h-12 flex-shrink-0 rounded-[5px] overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group relative block">
                {sub.image ? (
                  <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📷</div>
                )}
                <span className={`absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${uploadingFor === sub.id ? "opacity-100" : ""}`}>
                  {uploadingFor === sub.id ? "…" : "MODIFIER"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadSubImage(sub.id, f);
                  }}
                />
              </label>

              {/* Name */}
              <div className="flex-1 min-w-0">
                {editingSubId === sub.id ? (
                  <div className="flex gap-1">
                    <input
                      value={editSubName}
                      onChange={e => setEditSubName(e.target.value)}
                      autoFocus
                      className="flex-1 border border-gray-200 rounded-[5px] px-2 py-1 text-sm focus:outline-none focus:border-[#C9922A]"
                      onKeyDown={e => e.key === "Enter" && handleRenameSub(sub.id)}
                    />
                    <button
                      onClick={() => handleRenameSub(sub.id)}
                      className="px-2 py-1 bg-[#C9922A] text-white text-xs font-bold rounded-[5px]"
                    >✓</button>
                    <button
                      onClick={() => setEditingSubId(null)}
                      className="px-2 py-1 text-gray-400 text-xs rounded-[5px] hover:bg-gray-100"
                    >✕</button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-gray-900 text-sm truncate">{sub.name}</h3>
                    <p className="text-gray-400 text-xs">
                      {sub.items.length} boisson{sub.items.length !== 1 ? "s" : ""}
                      {" · "}{sub.items.filter(i => i.available).length} disponible{sub.items.filter(i => i.available).length !== 1 ? "s" : ""}
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => { setEditingSubId(sub.id); setEditSubName(sub.name); }}
                  title="Renommer"
                  className="p-1.5 rounded-[5px] text-gray-400 hover:text-[#C9922A] hover:bg-amber-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button
                  onClick={() => handleDeleteSub(sub)}
                  title="Supprimer"
                  className="p-1.5 rounded-[5px] text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50">
              {sub.items.map(item => {
                const isEditing = editingItem?.itemId === item.id;
                if (isEditing) {
                  return (
                    <div key={item.id} className="px-4 py-2.5 flex items-center gap-2 bg-amber-50">
                      <input
                        value={editingItem!.name}
                        onChange={e => setEditingItem(p => p ? { ...p, name: e.target.value } : p)}
                        autoFocus
                        className="flex-1 border border-gray-200 rounded-[5px] px-2 py-1 text-sm focus:outline-none focus:border-[#C9922A]"
                      />
                      <input
                        value={editingItem!.price}
                        onChange={e => setEditingItem(p => p ? { ...p, price: e.target.value } : p)}
                        inputMode="decimal"
                        placeholder="0,00"
                        className="w-20 border border-gray-200 rounded-[5px] px-2 py-1 text-sm text-right focus:outline-none focus:border-[#C9922A]"
                      />
                      <span className="text-gray-500 text-sm">€</span>
                      <button onClick={handleSaveItem} className="px-2 py-1 bg-[#C9922A] text-white text-xs font-bold rounded-[5px]">✓</button>
                      <button onClick={() => setEditingItem(null)} className="px-2 py-1 text-gray-400 text-xs rounded-[5px] hover:bg-white">✕</button>
                    </div>
                  );
                }
                return (
                  <div key={item.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                    <span className={`flex-1 text-sm ${item.available ? "text-gray-800" : "text-gray-400 line-through"}`}>
                      {item.name}
                    </span>
                    <span className={`text-sm font-bold w-16 text-right ${item.available ? "text-[#C9922A]" : "text-gray-300"}`}>
                      {fmt(item.price)}
                    </span>
                    <button
                      onClick={() => handleToggleItem(item.id, !item.available)}
                      title={item.available ? "Cliquer pour masquer" : "Cliquer pour afficher"}
                      className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${item.available ? "bg-green-400" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.available ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingItem({ subId: sub.id, itemId: item.id, name: item.name, price: String(item.price) })}
                        title="Modifier"
                        className="p-1 rounded-[5px] text-gray-400 hover:text-[#C9922A] hover:bg-amber-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        title="Supprimer"
                        className="p-1 rounded-[5px] text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add new item */}
              {editingItem?.subId === sub.id && editingItem.itemId === null ? (
                <div className="px-4 py-2.5 flex items-center gap-2 bg-amber-50">
                  <input
                    value={editingItem.name}
                    onChange={e => setEditingItem(p => p ? { ...p, name: e.target.value } : p)}
                    autoFocus
                    placeholder="Nom de la boisson"
                    className="flex-1 border border-gray-200 rounded-[5px] px-2 py-1 text-sm focus:outline-none focus:border-[#C9922A]"
                  />
                  <input
                    value={editingItem.price}
                    onChange={e => setEditingItem(p => p ? { ...p, price: e.target.value } : p)}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="w-20 border border-gray-200 rounded-[5px] px-2 py-1 text-sm text-right focus:outline-none focus:border-[#C9922A]"
                  />
                  <span className="text-gray-500 text-sm">€</span>
                  <button onClick={handleSaveItem} className="px-2 py-1 bg-[#C9922A] text-white text-xs font-bold rounded-[5px]">✓</button>
                  <button onClick={() => setEditingItem(null)} className="px-2 py-1 text-gray-400 text-xs rounded-[5px] hover:bg-white">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingItem({ subId: sub.id, itemId: null, name: "", price: "" })}
                  className="w-full px-4 py-2.5 text-left text-xs text-gray-400 hover:text-[#C9922A] hover:bg-amber-50 transition-colors border-t border-gray-50"
                >
                  + Ajouter une boisson dans &laquo; {sub.name} &raquo;
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
