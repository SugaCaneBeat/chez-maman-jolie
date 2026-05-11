"use client";

import type { Item, ViewMode } from "./MenuEditor";

interface Props {
  items: Item[];
  view: ViewMode;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onToggleAvail: (id: string, available: boolean) => void;
  onToggleSpe: (id: string, is_specialite: boolean) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  hasSearch: boolean;
  onResetFilters: () => void;
}

const fmt = (p: number) => (p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`);

export default function ItemsView({
  items, view, selectedIds, onToggleSelect, onSelectAll,
  onToggleAvail, onToggleSpe, onEdit, onDelete, hasSearch, onResetFilters,
}: Props) {

  /* Empty state */
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-5">
        <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p className="text-gray-500 text-sm font-semibold">
          {hasSearch ? "Aucun plat ne correspond à vos filtres" : "Aucun plat dans cette catégorie"}
        </p>
        {hasSearch ? (
          <button
            onClick={onResetFilters}
            className="mt-3 text-xs text-[#C9922A] hover:underline font-semibold"
          >
            Réinitialiser les filtres
          </button>
        ) : (
          <p className="text-xs text-gray-400 mt-1">Cliquez sur &laquo; Ajout rapide &raquo; pour commencer</p>
        )}
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="flex-1 overflow-y-auto">
        {/* Table header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center px-5 py-2 gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 z-10">
          <div className="w-5 flex-shrink-0">
            <input
              type="checkbox"
              checked={selectedIds.size === items.length && items.length > 0}
              onChange={onSelectAll}
              className="w-3.5 h-3.5 accent-[#C9922A] cursor-pointer"
            />
          </div>
          <div className="w-12 flex-shrink-0" />
          <div className="flex-1">Plat</div>
          <div className="w-20 text-right">Prix</div>
          <div className="w-20 text-center">Spé.</div>
          <div className="w-16 text-center">Dispo</div>
          <div className="w-16" />
        </div>

        <div className="divide-y divide-gray-50 bg-white">
          {items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${isSelected ? "bg-[#C9922A]/5" : "hover:bg-gray-50"} ${!item.available ? "opacity-60" : ""}`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(item.id)}
                  className="w-3.5 h-3.5 accent-[#C9922A] cursor-pointer flex-shrink-0"
                />

                {/* Image */}
                <div className="w-12 h-12 flex-shrink-0 rounded-[5px] overflow-hidden bg-gray-100 border border-gray-200">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>
                  )}
                </div>

                {/* Name + badges + accompagnement */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-semibold text-sm truncate ${item.available ? "text-gray-900" : "text-gray-400"}`}>{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold bg-red-50 text-red-500 uppercase tracking-wide flex-shrink-0">{item.badge}</span>
                    )}
                  </div>
                  {item.accompagnement && (
                    <p className="text-gray-400 text-xs truncate mt-0.5">{item.accompagnement}</p>
                  )}
                </div>

                {/* Price */}
                <span className="font-bold text-[#C9922A] text-sm w-20 text-right flex-shrink-0">
                  {fmt(Number(item.price))}
                </span>

                {/* Spécialité */}
                <div className="w-20 flex justify-center flex-shrink-0">
                  <button
                    onClick={() => onToggleSpe(item.id, !item.is_specialite)}
                    title={item.is_specialite ? "Retirer des spécialités" : "Marquer spécialité"}
                    className={`text-base transition-all hover:scale-110 ${item.is_specialite ? "text-amber-400" : "text-gray-200 hover:text-amber-300"}`}
                  >
                    ⭐
                  </button>
                </div>

                {/* Dispo */}
                <div className="w-16 flex justify-center flex-shrink-0">
                  <button
                    onClick={() => onToggleAvail(item.id, !item.available)}
                    title={item.available ? "Masquer" : "Rendre disponible"}
                    className={`w-10 h-5 rounded-full relative transition-colors ${item.available ? "bg-emerald-400" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.available ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Actions */}
                <div className="w-16 flex items-center justify-end gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEdit(item)}
                    title="Modifier"
                    className="p-1.5 rounded-[5px] text-gray-400 hover:text-[#C9922A] hover:bg-amber-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    title="Supprimer"
                    className="p-1.5 rounded-[5px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* GRID VIEW — cards */
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <div
              key={item.id}
              className={`group bg-white rounded-[5px] border overflow-hidden transition-all hover:shadow-md ${
                isSelected ? "border-[#C9922A] ring-2 ring-[#C9922A]/20" : "border-gray-100 hover:border-gray-200"
              } ${!item.available ? "opacity-60" : ""}`}
            >
              {/* Image / placeholder */}
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                )}

                {/* Indisponible overlay */}
                {!item.available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white/90 text-gray-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-[5px]">
                      Indisponible
                    </span>
                  </div>
                )}

                {/* Badges top-left */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.is_specialite && (
                    <span className="bg-amber-400 text-amber-900 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[5px] flex items-center gap-0.5">
                      ⭐ Spé
                    </span>
                  )}
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[5px]">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Checkbox top-right */}
                <label className="absolute top-2 right-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    className="w-4 h-4 accent-[#C9922A] cursor-pointer"
                  />
                </label>

                {/* Price overlay bottom-right */}
                <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-[5px] shadow-sm">
                  <span className="text-sm font-bold text-[#C9922A]">{fmt(Number(item.price))}</span>
                </div>

                {/* Quick actions on hover */}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(item)}
                    title="Modifier"
                    className="bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded-[5px] shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button
                    onClick={() => onToggleSpe(item.id, !item.is_specialite)}
                    title={item.is_specialite ? "Retirer Spé" : "Marquer Spé"}
                    className={`p-1.5 rounded-[5px] shadow-sm ${item.is_specialite ? "bg-amber-400 text-amber-900" : "bg-white/90 hover:bg-white text-gray-700"}`}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    title="Supprimer"
                    className="bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 p-1.5 rounded-[5px] shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-3">
                <h3 className="font-bold text-sm text-gray-900 truncate" title={item.name}>{item.name}</h3>
                {item.accompagnement && (
                  <p className="text-xs text-gray-400 truncate mt-0.5" title={item.accompagnement}>
                    {item.accompagnement}
                  </p>
                )}
                {/* Toggle dispo */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Dispo</span>
                  <button
                    onClick={() => onToggleAvail(item.id, !item.available)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${item.available ? "bg-emerald-400" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.available ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
