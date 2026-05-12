"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

/* Pseudos courts → emails de Supabase. Permet de se connecter avec
 * "caissier" ou "tech" au lieu de l'email complet. */
const SHORT_LOGINS: Record<string, string> = {
  caissier: "caissier@chezmamanjolie.com",
  tech:     "tech@chezmamanjolie.com",
};

export default function AdminLogin() {
  const [login, setLogin]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  /* Convertit le champ saisi en email Supabase */
  const resolveEmail = (raw: string): string => {
    const v = raw.trim().toLowerCase();
    if (!v) return "";
    if (v.includes("@")) return v;
    /* Pseudo court connu */
    if (SHORT_LOGINS[v]) return SHORT_LOGINS[v];
    /* Sinon, fallback: on tente d'ajouter le domaine par défaut */
    return `${v}@chezmamanjolie.com`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = resolveEmail(login);
    if (!email) {
      setError("Renseignez votre identifiant");
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Identifiant ou mot de passe incorrect");
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#111008] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#C9922A]">Chez Maman Jolie</h1>
          <p className="text-white/40 text-sm mt-1">Administration</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[5px] p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[5px] px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Identifiant</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Votre identifiant"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-white/5 border border-white/10 rounded-[5px] px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9922A]/50 placeholder:text-white/20"
              required
            />
          </div>

          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[5px] px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:border-[#C9922A]/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                aria-label={showPass ? "Masquer" : "Afficher"}
              >
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9922A] hover:bg-[#E0AD4A] text-[#111008] font-bold py-3 rounded-[5px] text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

      </div>
    </main>
  );
}
