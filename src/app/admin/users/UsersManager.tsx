"use client";

import { useState, useTransition } from "react";
import type { AdminUser } from "@/lib/actions/admin-users";
import {
  createAdminUser,
  deleteAdminUser,
  resetAdminPassword,
} from "@/lib/actions/admin-users";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function UsersManager({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();

  /* ── Create form state ── */
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ ok: boolean; text: string } | null>(null);

  /* ── Reset state ── */
  const [resetId, setResetId]     = useState<string | null>(null);
  const [resetPass, setResetPass] = useState("");
  const [resetMsg, setResetMsg]   = useState<{ ok: boolean; text: string } | null>(null);

  /* ── Delete confirm ── */
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ── Actions ── */
  const handleCreate = () => {
    setCreateMsg(null);
    startTransition(async () => {
      const res = await createAdminUser(email.trim(), password);
      if (res.success) {
        setCreateMsg({ ok: true, text: "Compte créé avec succès" });
        setEmail(""); setPassword("");
        // refresh list
        const { listAdminUsers } = await import("@/lib/actions/admin-users");
        setUsers(await listAdminUsers());
      } else {
        setCreateMsg({ ok: false, text: res.error ?? "Erreur" });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAdminUser(id);
      setUsers((u) => u.filter((x) => x.id !== id));
      setDeleteId(null);
    });
  };

  const handleReset = (id: string) => {
    setResetMsg(null);
    startTransition(async () => {
      const res = await resetAdminPassword(id, resetPass);
      if (res.success) {
        setResetMsg({ ok: true, text: "Mot de passe mis à jour" });
        setResetPass(""); setResetId(null);
      } else {
        setResetMsg({ ok: false, text: res.error ?? "Erreur" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Comptes administrateurs</h1>

      {/* ── Create form ── */}
      <div className="bg-white border border-gray-200 rounded-[5px] p-6 mb-8 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
          Ajouter un compte
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mot de passe (min. 8 car.)</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {createMsg && (
            <p className={`text-xs px-3 py-2 rounded-[5px] ${createMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {createMsg.text}
            </p>
          )}

          <button
            onClick={handleCreate}
            disabled={isPending || !email || !password}
            className="w-full bg-[#C9922A] hover:bg-[#b8831f] text-white font-bold py-2.5 rounded-[5px] text-sm transition-colors disabled:opacity-40"
          >
            {isPending ? "Création..." : "Créer le compte"}
          </button>
        </div>
      </div>

      {/* ── User list ── */}
      <div className="bg-white border border-gray-200 rounded-[5px] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Comptes existants ({users.length})
          </h2>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Aucun compte trouvé</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((u) => (
              <li key={u.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[5px] bg-[#C9922A]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#C9922A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{u.email}</p>
                    </div>
                    <div className="mt-1.5 pl-10 space-y-0.5">
                      <p className="text-xs text-gray-400">Créé le {formatDate(u.created_at)}</p>
                      <p className="text-xs text-gray-400">Dernière connexion : {formatDate(u.last_sign_in_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Reset password */}
                    <button
                      onClick={() => { setResetId(u.id); setResetMsg(null); setResetPass(""); }}
                      className="text-xs text-gray-500 hover:text-[#C9922A] px-2 py-1 rounded-[5px] border border-gray-200 hover:border-[#C9922A]/30 transition-colors"
                    >
                      Réinitialiser
                    </button>
                    {/* Delete */}
                    {users.length > 1 && (
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-[5px] border border-red-100 hover:border-red-300 transition-colors"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline reset form */}
                {resetId === u.id && (
                  <div className="mt-3 pl-10 flex gap-2">
                    <input
                      type="password"
                      value={resetPass}
                      onChange={(e) => setResetPass(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      className="flex-1 border border-gray-200 rounded-[5px] px-3 py-1.5 text-sm focus:outline-none focus:border-[#C9922A]"
                    />
                    <button
                      onClick={() => handleReset(u.id)}
                      disabled={isPending || resetPass.length < 8}
                      className="bg-[#C9922A] text-white text-xs font-bold px-3 py-1.5 rounded-[5px] disabled:opacity-40 hover:bg-[#b8831f] transition-colors"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => { setResetId(null); setResetMsg(null); }}
                      className="text-gray-400 text-xs px-2 py-1.5 rounded-[5px] hover:bg-gray-100"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {resetId === u.id && resetMsg && (
                  <p className={`mt-1.5 pl-10 text-xs ${resetMsg.ok ? "text-green-600" : "text-red-500"}`}>
                    {resetMsg.text}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[5px] p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-bold text-gray-800 mb-2">Supprimer ce compte ?</h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-[5px] text-sm transition-colors disabled:opacity-50"
              >
                {isPending ? "..." : "Supprimer"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-[5px] text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
