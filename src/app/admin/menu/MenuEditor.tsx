"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createMenuItem, updateMenuItem, deleteMenuItem,
  toggleItemAvailability, toggleIsSpecialite,
  createCategory, updateCategory, toggleCategoryActive, deleteCategory,
} from "@/lib/actions/menu";
import { useToast } from "../components/Toast";
import ItemForm from "./ItemForm";
import FormuleEditor from "./FormuleEditor";
import BoissonsEditor from "./BoissonsEditor";
import ItemsView from "./ItemsView";
import CategorySidebar from "./CategorySidebar";
import QuickAddItem from "./QuickAddItem";

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  type: string;
  active?: boolean;
}

export interface Item {
  id: string;
  category_id: string;
  name: string;
  price: number;
  image: string | null;
  accompagnement: string | null;
  badge: string | null;
  available: boolean;
  is_specialite?: boolean;
  display_order?: number;
}

export type ViewMode = "grid" | "list";

interface Props {
  initialCategories: Category[];
  initialItems: Item[];
  globalStats: {
    totalItems: number;
    availableItems: number;
    withImage: number;
    specialites: number;
    avgPrice: number;
  };
}

export default function MenuEditor({ initialCategories, initialItems }: Props) {
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.map((c) => ({ ...c, active: c.active ?? true }))
  );
  const [items, setItems] = useState(initialItems);
  const [selectedCat, setSelectedCat] = useState(
    initialCategories.find((c) => c.type === "standard")?.id ||
    initialCategories[0]?.id || ""
  );

  /* UI state */
  const [view, setView]             = useState<ViewMode>("grid");
  const [search, setSearch]         = useState("");
  const [showOnly, setShowOnly]     = useState<"all" | "available" | "unavailable" | "speciality">("all");
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);

  /* Selection state pour bulk actions */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [, startTransition] = useTransition();
  const toast = useToast();

  const selectedCategory = categories.find((c) => c.id === selectedCat);

  const categoryItems = useMemo(
    () => items.filter((i) => i.category_id === selectedCat),
    [items, selectedCat]
  );

  const filteredItems = useMemo(() => {
    let res = categoryItems;
    if (showOnly === "available") res = res.filter((i) => i.available);
    else if (showOnly === "unavailable") res = res.filter((i) => !i.available);
    else if (showOnly === "speciality") res = res.filter((i) => i.is_specialite);
    const q = search.trim().toLowerCase();
    if (q) {
      res = res.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.accompagnement ?? "").toLowerCase().includes(q) ||
          (i.badge ?? "").toLowerCase().includes(q)
      );
    }
    return res;
  }, [categoryItems, showOnly, search]);

  /* Stats catégorie */
  const catStats = useMemo(() => {
    const total = categoryItems.length;
    const available = categoryItems.filter((i) => i.available).length;
    const speciality = categoryItems.filter((i) => i.is_specialite).length;
    const withImg = categoryItems.filter((i) => i.image).length;
    const avg = total > 0
      ? categoryItems.reduce((s, i) => s + Number(i.price), 0) / total
      : 0;
    return { total, available, speciality, withImg, avg };
  }, [categoryItems]);

  /* ── Item actions ── */
  const handleToggleAvail = (id: string, available: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, available } : i)));
    startTransition(async () => {
      const r = await toggleItemAvailability(id, available);
      if (r.success) {
        toast.success(available ? "Plat disponible" : "Plat masqué");
      } else {
        toast.error("Erreur", "Impossible de modifier");
      }
    });
  };

  const handleToggleSpe = (id: string, is_specialite: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_specialite } : i)));
    startTransition(async () => {
      await toggleIsSpecialite(id, is_specialite);
      toast.success(is_specialite ? "Marqué spécialité" : "Retiré des spécialités");
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ? Cette action est définitive.`)) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      const r = await deleteMenuItem(id);
      if (r.success) toast.success("Plat supprimé", name);
      else toast.error("Erreur", "Suppression échouée");
    });
  };

  const handleSaveItem = async (data: {
    name: string; price: number; image?: string;
    accompagnement?: string; badge?: string; categoryId: string;
  }) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? {
          ...i, name: data.name, price: data.price,
          image: data.image || null, accompagnement: data.accompagnement || null,
          badge: data.badge || null, category_id: data.categoryId,
        } : i))
      );
      startTransition(async () => {
        const r = await updateMenuItem(editingItem.id, data);
        if (r.success) toast.success("Plat modifié", data.name);
        else toast.error("Erreur", "Modification échouée");
      });
    } else {
      startTransition(async () => {
        const r = await createMenuItem({
          categoryId: data.categoryId,
          name: data.name, price: data.price,
          image: data.image, accompagnement: data.accompagnement, badge: data.badge,
        });
        if (r.success && r.item) {
          setItems((prev) => [...prev, r.item as Item]);
          toast.success("Plat ajouté", data.name);
        } else {
          toast.error("Erreur", "Création échouée");
        }
      });
    }
    setShowFullForm(false);
    setEditingItem(null);
  };

  const handleQuickAdd = async (data: { name: string; price: number; categoryId: string }) => {
    startTransition(async () => {
      const r = await createMenuItem({
        categoryId: data.categoryId,
        name: data.name,
        price: data.price,
      });
      if (r.success && r.item) {
        setItems((prev) => [...prev, r.item as Item]);
        toast.success("Plat ajouté", `${data.name} — ${data.price} €`);
      } else {
        toast.error("Erreur", "Création échouée");
      }
    });
    setShowQuickAdd(false);
  };

  /* ── Bulk actions ── */
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const bulkSetAvailable = (available: boolean) => {
    const ids = Array.from(selectedIds);
    setItems((prev) => prev.map((i) => (selectedIds.has(i.id) ? { ...i, available } : i)));
    startTransition(async () => {
      await Promise.all(ids.map((id) => toggleItemAvailability(id, available)));
      toast.success(`${ids.length} plats ${available ? "rendus disponibles" : "masqués"}`);
    });
    setSelectedIds(new Set());
  };

  const bulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (!confirm(`Supprimer ${ids.length} plats sélectionnés ?`)) return;
    setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    startTransition(async () => {
      await Promise.all(ids.map((id) => deleteMenuItem(id)));
      toast.success(`${ids.length} plats supprimés`);
    });
    setSelectedIds(new Set());
  };

  /* ── Category actions ── */
  const handleToggleCat = (id: string, active: boolean) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, active } : c)));
    startTransition(async () => {
      await toggleCategoryActive(id, active);
      toast.success(active ? "Catégorie activée" : "Catégorie désactivée");
    });
  };

  const handleSaveCategory = async (id: string, data: { name: string; icon: string }) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    startTransition(async () => {
      await updateCategory(id, data);
      toast.success("Catégorie modifiée");
    });
  };

  const handleDeleteCat = async (cat: Category) => {
    if (!confirm(`Supprimer "${cat.name}" ?`)) return;
    const r = await deleteCategory(cat.id);
    if (!r.success) {
      toast.error("Erreur", r.error || "Suppression échouée");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    if (selectedCat === cat.id) {
      setSelectedCat(categories.filter((c) => c.id !== cat.id)[0]?.id || "");
    }
    toast.success("Catégorie supprimée");
  };

  const handleCreateCat = async (data: { name: string; icon: string }) => {
    const r = await createCategory(data);
    if (!r.success || !r.category) {
      toast.error("Erreur", r.error || "Création échouée");
      return false;
    }
    setCategories((prev) => [...prev, { ...(r.category as Category), active: true }]);
    setSelectedCat((r.category as Category).id);
    toast.success("Catégorie créée", data.name);
    return true;
  };

  return (
    <div className="bg-white rounded-[5px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
      {/* SIDEBAR CATÉGORIES */}
      <CategorySidebar
        categories={categories}
        items={items}
        selectedId={selectedCat}
        onSelect={(id) => { setSelectedCat(id); setSelectedIds(new Set()); setSearch(""); }}
        onToggle={handleToggleCat}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCat}
        onCreate={handleCreateCat}
      />

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
        {selectedCategory?.type === "formules" && (
          <FormuleEditor categoryId={selectedCategory.id} categoryName={selectedCategory.name} />
        )}
        {selectedCategory?.type === "boissons" && (
          <BoissonsEditor categoryId={selectedCategory.id} categoryName={selectedCategory.name} />
        )}
        {(!selectedCategory || selectedCategory.type === "standard") && selectedCategory && (
          <>
            {/* Header catégorie */}
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl">{selectedCategory.icon || "🍽️"}</span>
                  <div className="min-w-0">
                    <h2 className="font-heading text-xl font-bold text-gray-900 truncate">{selectedCategory.name}</h2>
                    <p className="text-xs text-gray-400">
                      {catStats.total} plat{catStats.total !== 1 ? "s" : ""}
                      {" · "}{catStats.available} dispo
                      {catStats.speciality > 0 && ` · ${catStats.speciality} spécialité${catStats.speciality !== 1 ? "s" : ""}`}
                      {catStats.total > 0 && ` · ${catStats.avg.toFixed(0)} € moyen`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View toggle */}
                  <div className="bg-gray-100 rounded-[5px] p-0.5 flex">
                    <button
                      onClick={() => setView("grid")}
                      title="Vue cartes"
                      className={`px-2 py-1.5 rounded-[5px] text-xs transition-colors ${view === "grid" ? "bg-white text-[#C9922A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                    </button>
                    <button
                      onClick={() => setView("list")}
                      title="Vue liste"
                      className={`px-2 py-1.5 rounded-[5px] text-xs transition-colors ${view === "list" ? "bg-white text-[#C9922A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                    </button>
                  </div>

                  {/* Add buttons */}
                  <button
                    onClick={() => setShowQuickAdd(true)}
                    className="px-3 py-2 bg-[#C9922A] hover:bg-[#b8831f] text-white text-xs font-bold rounded-[5px] flex items-center gap-1.5 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    Ajout rapide
                  </button>
                  <button
                    onClick={() => { setEditingItem(null); setShowFullForm(true); }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-[5px] transition-colors"
                  >
                    Avec photo
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[180px]">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher dans cette catégorie…"
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-[5px] text-xs focus:outline-none focus:border-[#C9922A] focus:ring-2 focus:ring-[#C9922A]/10"
                  />
                </div>
                {(["all", "available", "unavailable", "speciality"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setShowOnly(f)}
                    className={`px-2.5 py-1.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      showOnly === f
                        ? "bg-[#C9922A] text-[#111008]"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {f === "all" ? "Tous" : f === "available" ? "Dispo" : f === "unavailable" ? "Masqués" : "⭐ Spé."}
                  </button>
                ))}
              </div>

              {/* Bulk actions bar */}
              {selectedIds.size > 0 && (
                <div className="mt-3 flex items-center gap-2 bg-[#C9922A]/10 border border-[#C9922A]/30 rounded-[5px] px-3 py-2 flex-wrap">
                  <span className="text-xs font-bold text-[#C9922A]">
                    {selectedIds.size} sélectionné{selectedIds.size !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => bulkSetAvailable(true)}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-[5px]"
                  >
                    Rendre dispo
                  </button>
                  <button
                    onClick={() => bulkSetAvailable(false)}
                    className="px-2.5 py-1 bg-gray-500 hover:bg-gray-600 text-white text-[10px] font-bold uppercase rounded-[5px]"
                  >
                    Masquer
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-[5px]"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="px-2.5 py-1 text-gray-500 hover:text-gray-700 text-[10px] font-bold uppercase"
                  >
                    Désélectionner
                  </button>
                </div>
              )}
            </div>

            {/* Formulaire complet inline */}
            {showFullForm && (
              <div className="px-5 py-4 border-b border-gray-100 bg-amber-50/30">
                <ItemForm
                  item={editingItem}
                  categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
                  currentCategoryId={selectedCat}
                  onSave={handleSaveItem}
                  onCancel={() => { setShowFullForm(false); setEditingItem(null); }}
                />
              </div>
            )}

            {/* Items view (grid ou list) */}
            <ItemsView
              items={filteredItems}
              view={view}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelectAll={toggleSelectAll}
              onToggleAvail={handleToggleAvail}
              onToggleSpe={handleToggleSpe}
              onEdit={(item) => { setEditingItem(item); setShowFullForm(true); }}
              onDelete={(item) => handleDelete(item.id, item.name)}
              hasSearch={!!search || showOnly !== "all"}
              onResetFilters={() => { setSearch(""); setShowOnly("all"); }}
            />
          </>
        )}

        {!selectedCategory && (
          <div className="flex-1 flex items-center justify-center p-10 text-gray-300 text-sm">
            Sélectionnez une catégorie
          </div>
        )}
      </main>

      {/* QUICK ADD MODAL */}
      {showQuickAdd && selectedCategory && (
        <QuickAddItem
          defaultCategoryId={selectedCat}
          categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
          onAdd={handleQuickAdd}
          onClose={() => setShowQuickAdd(false)}
        />
      )}
    </div>
  );
}
