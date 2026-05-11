import { listMediaImages } from "@/lib/actions/media";
import MediaManager from "./MediaManager";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const images = await listMediaImages();
  return <MediaManager initialImages={images} />;
}
