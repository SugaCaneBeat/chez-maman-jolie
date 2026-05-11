"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { listMediaImages, uploadMediaImage, type MediaImage } from "@/lib/actions/media";

interface Props {
  /** Image URL actuellement sélectionnée (preview) */
  value?: string;
  /** Callback avec la nouvelle URL */
  onChange: (url: string) => void;
  /** Label pour nommer le fichier uploadé (ex: nom du plat) */
  label?: string;
  /** Hauteur de la preview (défaut: 128 = h-32) */
  previewClassName?: string;
}

/**
 * Champ de sélection d'image avec deux options:
 *   1. Choisir dans la galerie existante
 *   2. Uploader un nouveau fichier
 *
 * Affiche une preview cliquable; click ouvre le modal avec onglets.
 */
export default function ImagePicker({
  value,
  onChange,
  label = "image",
  previewClassName = "w-32 h-32",
}: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState<"gallery" | "upload">("gallery");
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  /* Charger la galerie quand le modal s'ouvre */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listMediaImages()
      .then(setImages)
      .finally(() => setLoading(false));
  }, [open]);

  /* Fermer avec ESC */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const filtered = search.trim()
    ? images.filter((img) => img.name.toLowerCase().includes(search.toLowerCase()))
    : images;

  const handleSelect = (url: string) => {
    onChange(url);
    setOpen(false);
  };

  const handleUpload = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Fichier non image"); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image trop lourde (max 5MB)"); return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("label", label);
    startTransition(async () => {
      const res = await uploadMediaImage(form);
      setUploading(false);
      if (res.success && res.url) {
        onChange(res.url);
        setOpen(false);
      } else {
        setUploadError(res.error ?? "Erreur");
      }
    });
  };

  return (
    <>
      {/* Preview cliquable */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => { setOpen(true); setTab("gallery"); }}
          className={`relative ${previewClassName} rounded-[5px] overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-[#C9922A] transition-colors group block`}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="preview" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  CHANGER
                </span>
              </span>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1.5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/>
              </svg>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Ajouter</span>
            </div>
          )}
        </button>

        {/* Lien clear */}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Retirer l&apos;image
          </button>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[5px] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-900 text-sm">Choisir une image</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-[5px] hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setTab("gallery")}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  tab === "gallery"
                    ? "text-[#C9922A] border-b-2 border-[#C9922A] -mb-px"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Galerie ({images.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTab("upload")}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  tab === "upload"
                    ? "text-[#C9922A] border-b-2 border-[#C9922A] -mb-px"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  Uploader
                </span>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === "gallery" && (
                <>
                  {/* Search */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Rechercher une image…"
                      className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
                    />
                  </div>

                  {loading ? (
                    <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
                  ) : filtered.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-12">
                      {search ? "Aucune image trouvée" : "La galerie est vide — uploadez votre première image"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {filtered.map((img) => {
                        const selected = img.url === value;
                        return (
                          <button
                            key={img.name}
                            type="button"
                            onClick={() => handleSelect(img.url)}
                            className={`relative aspect-square rounded-[5px] overflow-hidden border-2 transition-all ${
                              selected
                                ? "border-[#C9922A] ring-2 ring-[#C9922A]/30"
                                : "border-transparent hover:border-[#C9922A]/50"
                            }`}
                            title={img.name}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            {selected && (
                              <span className="absolute top-1 right-1 w-5 h-5 bg-[#C9922A] rounded-[5px] flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {tab === "upload" && (
                <div className="py-6">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-[#C9922A] rounded-[5px] py-12 flex flex-col items-center gap-3 text-gray-500 hover:text-[#C9922A] transition-colors disabled:opacity-50"
                  >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                    </svg>
                    <div className="text-center">
                      <p className="text-sm font-bold">
                        {uploading ? "Upload en cours…" : "Cliquez pour choisir une image"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5 Mo</p>
                    </div>
                  </button>
                  {uploadError && (
                    <p className="mt-3 text-center text-sm text-red-500">{uploadError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              <a
                href="/admin/media"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-[#C9922A] transition-colors flex items-center gap-1"
              >
                Gérer la galerie
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
