import { getCurrentUser } from "@/lib/supabase/user";
import HelpContent from "./HelpContent";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const user = await getCurrentUser();
  return <HelpContent currentRole={user?.role ?? "admin"} />;
}

export const metadata = {
  title: "Aide · Chez Maman Jolie Admin",
};
