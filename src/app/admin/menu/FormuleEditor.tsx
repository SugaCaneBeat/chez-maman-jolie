"use client";

import { useEffect, useState } from "react";
import {
  getFormules,
  getMenuItemsForPicker,
  saveFormule,
  deleteFormule,
  toggleFormuleAvailable,
  updateFormuleImage,
  type FormuleWithComponents,
  type PickerItem,
} from "@/lib/actions/formules";
import { uploadMenuImage } from "@/lib/actions/menu";

interface Props {
  categoryId: string;
  categoryName: string;
}

type ComponentKey = "entree" | "plat" | "accompagnement" | "dessert" | "boisson";

const COMPONENT_LABELS: Record<ComponentKey, string> = {
  entree:          "Entrée",
  plat:            "Plat",
  accompagnement:  "Accompagnement",
  dessert:         "Dessert",
  boisson:         "Boisson",
};

const COMPONENT_KEYS: ComponentKey[] = ["entree", "plat", "accompagnement", "dessert", "boisson"];

interface FormState {
  name: string;
  price: string;
  image: string;
  components: Partial<Record<ComponentKey, string>>; // key → menuItemId
}

const emptyForm = (): FormState => ({
  name: "",
  price: "",
  image: "",
  components: {},
});

/* ─── Canvas collage generator ─── */
async function generateCollageImage(imageUrls: string[]): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#111008";
  ctx.fillRect(0, 0, 800, 600);

  const urls = imageUrls.filter(Boolean);
  const count = Math.min(urls.length, 4);
  if (count === 0) return null;

  type Rect = [number, number, number, number];
  const positions: Rect[] =
    count === 1 ? [[0, 0, 800, 600]] :
    count === 2 ? [[0, 0, 400, 600], [400, 0, 400, 600]] :
    count === 3 ? [[0, 0, 400, 600], [400, 0, 400, 300], [400, 300, 400, 300]] :
                  [[0, 0, 400, 300], [400, 0, 400, 300], [0, 300, 400, 300], [400, 300, 400, 300]];

  await Promise.all(
    urls.slice(0, count).map(
      (url, i) =>
        new Promise<void>(resolve => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const [x, y, w, h] = positions[i];
            const ar  = img.width / img.height;
            const dar = w / h;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (ar > dar) { sw = sh * dar; sx = (img.width - sw) / 2; }
            else           { sh = sw / dar; sy = (img.height - sh) / 2; }
            ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url;
        })
    )
  );

  // Dark gradient overlay at bottom
  const grad = ctx.createLinearGradient(0, 300, 0, 600);
  grad.addColorStop(0, "rgba(17,16,8,0)");
  grad.addColorStop(1, "rgba(17,16,8,0.7)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  return new Promise(res => canvas.toBlob(blob => res(blob), "image/jpeg", 0.88));
}

/* ─── Mini image collage (preview in list) ─── */
function MiniCollage({ images, className = "" }: { images: string[]; className?: string }) {
  const count = Math.min(images.length, 4);
  if (count === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-300 text-xs ${className}`}>
        —
      </div>
    );
  }
  return (
    <div
      className={`grid gap-px overflow-hidden ${className}`}
      style={{ gridTemplateColumns: count <= 1 ? "1fr" : "1fr 1fr" }}
    >
      {images.slice(0, count).map((img, i) => (
        <div
          key={i}
          className={`relative overflow-hidden ${count === 3 && i === 0 ? "row-span-2" : ""}`}
        >
          <img src={img} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

export default function FormuleEditor({ categoryId, categoryName }: Props) {
  const [formules, setFormules] = useState<FormuleWithComponents[]>([]);
  const [pickerItems, setPickerItems] = useState<{
    entrees: PickerItem[];
    plats: PickerItem[];
    accompagnements: PickerItem[];
    desserts: PickerItem[];
    boissons: PickerItem[];
  }>({ entrees: [], plats: [], accompagnements: [], desserts: [], boissons: [] });
  const [loading, setLoading]           = useState(true);
  const [editingFormule, setEditingFormule] = useState<FormuleWithComponents | null | "new">(null);
  const [form, setForm]                 = useState<FormState>(emptyForm());
  const [generating, setGenerating]     = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  /* ── load on mount ── */
  useEffect(() => {
    Promise.all([getFormules(categoryId), getMenuItemsForPicker()]).then(
      ([f, p]) => {
        setFormules(f);
        setPickerItems(p);
        setLoading(false);
      }
    );
  }, [categoryId]);

  /* ── helpers ── */
  const pickerForKey = (key: ComponentKey): PickerItem[] => {
    if (key === "entree")         return pickerItems.entrees;
    if (key === "plat")           return pickerItems.plats;
    if (key === "accompagnement") return pickerItems.accompagnements;
    if (key === "dessert")        return pickerItems.desserts;
    return pickerItems.boissons;
  };

  const imageUrlForItem = (key: ComponentKey, itemId: string): string | null => {
    const list = pickerForKey(key);
    return list.find(it => it.id === itemId)?.image ?? null;
  };

  /* ── open form ── */
  const openNew = () => {
    setForm(emptyForm());
    setEditingFormule("new");
    setError(null);
  };

  const openEdit = (f: FormuleWithComponents) => {
    const components: Partial<Record<ComponentKey, string>> = {};
    for (const comp of f.components) {
      if (COMPONENT_KEYS.includes(comp.component_type as ComponentKey)) {
        components[comp.component_type as ComponentKey] = comp.menu_item_id;
      }
    }
    setForm({
      name: f.name,
      price: String(f.price),
      image: f.image || "",
      components,
    });
    setEditingFormule(f);
    setError(null);
  };

  const cancelEdit = () => { setEditingFormule(null); setError(null); };

  /* ── generate collage ── */
  const handleGenerate = async () => {
    const urls: string[] = COMPONENT_KEYS.flatMap(key => {
      const itemId = form.components[key];
      if (!itemId) return [];
      const url = imageUrlForItem(key, itemId);
      return url ? [url] : [];
    });

    setGenerating(true);
    try {
      const blob = await generateCollageImage(urls);
      if (!blob) { setGenerating(false); return; }

      const formData = new FormData();
      formData.append("file", blob, "formule-collage.jpg");
      formData.append("itemName", form.name || "formule");

      const result = await uploadMenuImage(formData);
      if (!result.success || !result.url) {
        setError(result.error || "Erreur upload");
        setGenerating(false);
        return;
      }

      setForm(prev => ({ ...prev, image: result.url! }));

      // If editing existing formule, persist image immediately
      if (editingFormule && editingFormule !== "new") {
        await updateFormuleImage(editingFormule.id, result.url!);
      }
    } catch (e) {
      setError(String(e));
    }
    setGenerating(false);
  };

  /* ── save ── */
  const handleSave = async () => {
    if (!form.name.trim()) { setError("Nom requis"); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) { setError("Prix invalide"); return; }

    setSaving(true);
    setError(null);

    const components = COMPONENT_KEYS.flatMap(key => {
      const menuItemId = form.components[key];
      if (!menuItemId) return [];
      return [{ menuItemId, componentType: key }];
    });

    const result = await saveFormule({
      formuleId: editingFormule !== "new" && editingFormule !== null ? editingFormule.id : undefined,
      categoryId,
      name: form.name.trim(),
      price,
      image: form.image || undefined,
      components,
    });

    if (!result.success) {
      setError(result.error || "Erreur");
      setSaving(false);
      return;
    }

    // Refresh list
    const updated = await getFormules(categoryId);
    setFormules(updated);
    setEditingFormule(null);
    setSaving(false);
  };

  /* ── delete ── */
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer la formule "${name}" ?`)) return;
    await deleteFormule(id);
    setFormules(prev => prev.filter(f => f.id !== id));
  };

  /* ── toggle available ── */
  const handleToggle = async (id: string, available: boolean) => {
    setFormules(prev => prev.map(f => f.id === id ? { ...f, available } : f));
    await toggleFormuleAvailable(id, available);
  };

  const fmt = (p: number) => p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`;

  /* ═══════ RENDER ═══════ */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        Chargement…
      </div>
    );
  }

  /* ── Edit form ── */
  if (editingFormule !== null) {
    const currentImageUrl = form.image || (
      editingFormule !== "new" ? (editingFormule.image || "") : ""
    );

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm">
            {categoryName} —{" "}
            {editingFormule === "new" ? "Nouvelle formule" : `Modifier "${editingFormule.name}"`}
          </h2>
          <button
            onClick={cancelEdit}
            className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-[5px] hover:bg-gray-100"
          >
            ✕ Annuler
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-[5px]">
              {error}
            </div>
          )}

          {/* Name + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nom</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Formule midi…"
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Prix (€)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="15"
                min="0"
                step="0.5"
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A] text-gray-900"
              />
            </div>
          </div>

          {/* Component selects */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Composition</p>
            <div className="space-y-2">
              {COMPONENT_KEYS.map(key => {
                const list = pickerForKey(key);
                const isAccomp = key === "accompagnement";
                return (
                  <div key={key} className={`flex items-center gap-3 ${isAccomp ? "pl-5 border-l-2 border-[#C9922A]/30" : ""}`}>
                    <label className={`text-xs flex-shrink-0 w-28 ${isAccomp ? "text-[#C9922A]/70" : "text-gray-500 font-semibold"}`}>
                      {isAccomp ? "└ Accompagnement" : COMPONENT_LABELS[key]}
                    </label>
                    <select
                      value={form.components[key] || ""}
                      onChange={e =>
                        setForm(p => ({
                          ...p,
                          components: { ...p.components, [key]: e.target.value || undefined },
                        }))
                      }
                      className="flex-1 border border-gray-200 rounded-[5px] px-2 py-2 text-sm focus:outline-none focus:border-[#C9922A] text-gray-900 bg-white"
                    >
                      <option value="">{isAccomp ? "— Aucun —" : "— Aucun —"}</option>
                      {list.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image section */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Image</p>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="w-20 h-20 flex-shrink-0 rounded-[5px] overflow-hidden border border-gray-200 bg-gray-100">
                {currentImageUrl ? (
                  <img src={currentImageUrl} alt="aperçu" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-[#111008] text-[#E0AD4A] text-xs font-bold rounded-[5px] hover:bg-[#1e1c0e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generating ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Génération…
                    </>
                  ) : (
                    <>&#127912; Générer l&apos;image</>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Crée un collage à partir<br />des images des composants.
                </p>
              </div>
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#C9922A] text-[#111008] text-sm font-bold py-2.5 rounded-[5px] hover:bg-[#E0AD4A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              onClick={cancelEdit}
              className="px-5 text-sm text-gray-500 py-2.5 rounded-[5px] hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-900 text-sm">{categoryName}</h2>
          <p className="text-gray-400 text-xs">{formules.length} formule{formules.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[5px] text-sm font-bold bg-[#C9922A] text-[#111008] hover:bg-[#E0AD4A] transition-colors"
        >
          + Nouvelle formule
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        {formules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Aucune formule</p>
            <button
              onClick={openNew}
              className="mt-3 text-xs text-[#C9922A] hover:underline"
            >
              + Créer la première
            </button>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {formules.map(f => {
              const componentImages = f.components
                .map(c => c.item.image)
                .filter((img): img is string => Boolean(img));

              return (
                <div
                  key={f.id}
                  className="bg-white border border-gray-100 rounded-[5px] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image area */}
                  <div className="h-36 overflow-hidden bg-gray-100 relative">
                    {f.image ? (
                      <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                    ) : componentImages.length > 0 ? (
                      <MiniCollage images={componentImages} className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        Pas d&apos;image
                      </div>
                    )}

                    {/* Availability badge */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleToggle(f.id, !f.available)}
                        title={f.available ? "Disponible — cliquer pour masquer" : "Indisponible — cliquer pour activer"}
                        className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${f.available ? "bg-green-400" : "bg-gray-300"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${f.available ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{f.name}</p>
                        <p className="text-[#C9922A] font-bold text-sm">{fmt(f.price)}</p>
                      </div>
                    </div>

                    {/* Components */}
                    {f.components.length > 0 && (
                      <ul className="space-y-0.5 mb-3">
                        {f.components.map((comp, i) => {
                          const label = COMPONENT_LABELS[comp.component_type as ComponentKey] ?? comp.component_type;
                          return (
                            <li key={i} className="flex gap-1 text-xs">
                              <span className="text-[#C9922A] font-semibold flex-shrink-0">{label} ·</span>
                              <span className="text-gray-600 truncate">{comp.item.name}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                      <button
                        onClick={() => openEdit(f)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-[5px] text-xs text-[#C9922A] border border-[#C9922A]/30 hover:bg-amber-50 transition-colors font-medium"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.name)}
                        className="p-1.5 rounded-[5px] text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
