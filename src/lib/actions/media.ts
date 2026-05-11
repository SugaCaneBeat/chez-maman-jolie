"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BUCKET = "menu-images";

export interface MediaImage {
  name: string;          // file name in bucket
  url: string;           // public URL
  size: number;          // bytes
  createdAt: string;     // ISO
}

/* ─── List all images in the bucket ─── */
export async function listMediaImages(): Promise<MediaImage[]> {
  const supabase = createServerClient();

  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list("", {
      limit: 1000,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error || !files) return [];

  return files
    .filter((f) => f.name && !f.name.startsWith(".") && !f.id?.endsWith("/")) // skip folders / hidden
    .map((f) => {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
      return {
        name: f.name,
        url: data.publicUrl,
        size: f.metadata?.size ?? 0,
        createdAt: f.created_at ?? "",
      };
    });
}

/* ─── Delete an image from the bucket ─── */
export async function deleteMediaImage(
  name: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase.storage.from(BUCKET).remove([name]);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/media");
  revalidatePath("/admin/menu");
  return { success: true };
}

/* ─── Upload (used by ImagePicker) ─── */
export async function uploadMediaImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  const label = (formData.get("label") as string) || "image";

  if (!file) return { success: false, error: "Aucun fichier" };
  if (!file.type.startsWith("image/")) return { success: false, error: "Fichier non image" };
  if (file.size > 5 * 1024 * 1024) return { success: false, error: "Image trop lourde (max 5MB)" };

  const supabase = createServerClient();

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safe = label.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "image";
  const fileName = `${safe}-${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, bytes, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) return { success: false, error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  revalidatePath("/admin/media");
  return { success: true, url: data.publicUrl, name: fileName };
}
