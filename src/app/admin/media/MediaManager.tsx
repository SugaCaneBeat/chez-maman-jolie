"use client";

import { useRef, useState, useTransition } from "react";
import {
  listMediaImages,
  uploadMediaImage,
  deleteMediaImage,
  type MediaImage,
} from "@/lib/actions/media";

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export default function MediaManager({ initialImages }: { initialImages: MediaImage[] }) {
  const [images, setImages] = useState(initialImages);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? images.filter((img) => img.name.toLowerCase().includes(search.toLowerCase()))
    : images;

  const totalSize = images.reduce((s, i) => s + i.size, 0);

  const reload = async () => {
    const fresh = await listMediaImages();
    setImages(fresh);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setUploadError(`${file.name}: pas une image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`${file.name}: trop lourde (max 5MB)`);
        continue;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("label", file.name.split(".")[0]);
      const res = await uploadMediaImage(form);
      if (!res.success) {
        setUploadError(`${file.name}: ${res.error}`);
      }
    }

    await reload();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = (img: MediaImage) => {
    if (!confirm(`Supprimer définitivement "${img.name}" ?\n\nL'image disparaîtra des plats qui l'utilisent.`)) return;
    setDeleting(img.name);
    startTransition(async () => {
      const res = await deleteMediaImage(img.name);
      setDeleting(null);
      if (res.success) {
        setImages((prev) => prev.filter((i) => i.name !== img.name));
      } else {
        alert(res.error ?? "Erreur");
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Médiathèque</h1>
          <p className="text-gray-500 text-sm mt-1">
            {images.length} image{images.length !== 1 ? "s" : ""} · {formatSize(totalSize)} au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="bg-[#C9922A] hover:bg-[#b8831f] text-white font-bold px-4 py-2 rounded-[5px] text-sm transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none"/>
                </svg>
                Upload…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Uploader
              </>
            )}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-[5px] px-4 py-2 mb-4">
          {uploadError}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-[5px] py-20 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p className="text-gray-500 text-sm mb-1">
            {search ? "Aucune image ne correspond à votre recherche." : "La galerie est vide."}
          </p>
          {!search && (
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-[#C9922A] hover:underline mt-2"
            >
              + Uploader la première image
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((img) => (
            <div
              key={img.name}
              className="bg-white rounded-[5px] border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative aspect-square bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleCopy(img.url)}
                    title="Copier l'URL"
                    className="w-9 h-9 bg-white text-gray-700 rounded-[5px] hover:bg-[#C9922A] hover:text-white transition-colors flex items-center justify-center"
                  >
                    {copied === img.url ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={deleting === img.name}
                    title="Supprimer"
                    className="w-9 h-9 bg-white text-red-500 rounded-[5px] hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-2.5 py-1.5">
                <p className="text-[11px] text-gray-700 truncate font-medium" title={img.name}>{img.name}</p>
                <p className="text-[10px] text-gray-400 flex items-center justify-between">
                  <span>{formatSize(img.size)}</span>
                  <span>{formatDate(img.createdAt)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
