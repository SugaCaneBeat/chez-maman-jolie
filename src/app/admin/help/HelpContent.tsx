"use client";

import { useState, type ReactNode } from "react";
import type { AdminRole } from "@/lib/roles";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";

type Tab = "client" | "caissier" | "tech" | "admin";

const TABS: { key: Tab; label: string; color: string; icon: ReactNode }[] = [
  {
    key: "client",
    label: "Client",
    color: "from-rose-500 to-pink-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    ),
  },
  {
    key: "caissier",
    label: "Caissier",
    color: "from-emerald-500 to-teal-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
      </svg>
    ),
  },
  {
    key: "tech",
    label: "Tech",
    color: "from-blue-500 to-indigo-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    key: "admin",
    label: "Admin",
    color: "from-[#C9922A] to-[#E0AD4A]",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/>
      </svg>
    ),
  },
];

export default function HelpContent({ currentRole }: { currentRole: AdminRole }) {
  /* Onglet par défaut : celui correspondant au rôle de l'utilisateur */
  const defaultTab: Tab = currentRole === "caissier" ? "caissier" : currentRole === "tech" ? "tech" : "admin";
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Documentation</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Guide d&apos;utilisation</h1>
          <p className="text-gray-500 text-sm mt-1">
            Comment utiliser le site et l&apos;admin selon votre rôle
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Votre rôle</p>
          <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-[5px] ${ROLE_COLORS[currentRole].bg} ${ROLE_COLORS[currentRole].text}`}>
            {ROLE_LABELS[currentRole]}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[5px] text-sm font-bold whitespace-nowrap transition-all ${
                active
                  ? `bg-gradient-to-r ${t.color} text-white shadow-md`
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === "client"   && <ClientGuide />}
      {tab === "caissier" && <CaissierGuide />}
      {tab === "tech"     && <TechGuide />}
      {tab === "admin"    && <AdminGuide />}
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTIONS PAR RÔLE
   ───────────────────────────────────────── */

function Section({
  number,
  title,
  description,
  children,
  accent,
}: {
  number: number;
  title: string;
  description?: string;
  children: ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-[5px] p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${accent} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          <div className="mt-3 text-sm text-gray-700 space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Key({ children }: { children: ReactNode }) {
  return (
    <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-mono">
      {children}
    </code>
  );
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#C9922A] underline underline-offset-2 hover:text-[#b8831f]">
      {children}
    </a>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 bg-amber-50 border-l-2 border-amber-300 px-3 py-2 rounded-[5px] text-xs text-amber-900">
      💡 {children}
    </div>
  );
}

/* ───── CLIENT ───── */

function ClientGuide() {
  const accent = "from-rose-500 to-pink-500";
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-[5px] p-5">
        <h2 className="font-heading text-xl font-bold text-rose-900">🛒 Parcours client public</h2>
        <p className="text-sm text-rose-800/70 mt-1">
          Le client n&apos;a pas de compte. Il arrive sur <Link href="/">chezmamanjolie.com</Link> et commande en quelques clics.
        </p>
      </div>

      <Section number={1} accent={accent} title="Choisir des plats" description="Sur la page d'accueil ou la carte">
        <p>Le client navigue parmi les sections : <strong>Formules · Notre Carte · Livraison · Contact</strong>.</p>
        <p>Il clique sur le bouton <Key>+</Key> de chaque plat ou formule pour l&apos;ajouter au panier. Un toast confirme l&apos;ajout.</p>
        <p>L&apos;icône panier en haut à droite (ou dans la tab bar mobile) affiche le nombre d&apos;articles.</p>
      </Section>

      <Section number={2} accent={accent} title="Remplir le panier" description="Champs obligatoires + paiement">
        <p>Click sur le panier → drawer latéral avec les articles.</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li><strong>Minimum 25 €</strong> pour commander (bandeau ambre si pas atteint, avec barre de progression)</li>
          <li>Champs requis : <strong>Prénom · Nom · Téléphone · Numéro+rue · Code postal · Ville</strong></li>
          <li>Complément optionnel (étage, code accès…)</li>
          <li><strong>Pourboire optionnel</strong> : 0/1/2/3 €</li>
          <li>Choix du <strong>mode de paiement</strong> : Carte · Lydia · PayLib · Wero</li>
        </ul>
        <Tip>L&apos;adresse est géocodée automatiquement (API BAN française). La zone et les frais s&apos;affichent en direct (Zone 1 = gratuit, Zone 2 = 2,50 €, Zone 3 = 4,50 €/6 €).</Tip>
      </Section>

      <Section number={3} accent={accent} title="Payer" description="Carte en ligne ou app mobile">
        <p><strong>Carte bancaire</strong> → redirige sur <Key>/checkout/[orderId]</Key> avec le widget SumUp sécurisé (PCI compliance). Le client saisit sa CB, 3D Secure si nécessaire, paiement validé.</p>
        <p><strong>Lydia / PayLib / Wero</strong> → modal avec le numéro à payer (<Key>+33 7 53 87 32 13</Key>) et un bouton pour ouvrir l&apos;app. Après paiement, le client clique &laquo; J&apos;ai payé &raquo;.</p>
      </Section>

      <Section number={4} accent={accent} title="Suivre la commande" description="Page de suivi unique avec auto-refresh">
        <p>Après paiement, redirection vers <Key>/commande/[id]</Key>. WhatsApp s&apos;ouvre auto avec le résumé de la commande.</p>
        <p>La page de suivi affiche :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>Numéro de commande <Key>#N</Key> en gros</li>
          <li>Statut actuel : Payée → Confirmée → Préparation → Prête → En livraison → Livrée</li>
          <li>Timeline visuelle avec étape active animée</li>
          <li><strong>ETA</strong> quand le livreur part : &laquo; ~ 18 min · vers 21h45 &raquo;</li>
          <li>Auto-refresh toutes les 20s</li>
          <li>Bouton WhatsApp pour contacter le restaurant</li>
        </ul>
        <Tip>Le client peut bookmarker le lien <Key>/commande/[id]</Key> pour revenir consulter son statut à tout moment.</Tip>
      </Section>
    </div>
  );
}

/* ───── CAISSIER ───── */

function CaissierGuide() {
  const accent = "from-emerald-500 to-teal-500";
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-[5px] p-5">
        <h2 className="font-heading text-xl font-bold text-emerald-900">💚 Gestion des commandes</h2>
        <p className="text-sm text-emerald-800/70 mt-1">
          Le caissier prend les commandes en cours et les fait avancer dans le tunnel jusqu&apos;à la livraison. Idéal pendant le service.
        </p>
      </div>

      <Section number={1} accent={accent} title="Se connecter" description="Identifiant 'caissier'">
        <p>URL : <Link href="/admin/login">/admin/login</Link></p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li><strong>Identifiant</strong> : <Key>caissier</Key></li>
          <li><strong>Mot de passe</strong> : celui défini par l&apos;admin</li>
        </ul>
        <p>Une fois connecté, la sidebar montre <strong>Dashboard</strong> + <strong>Commandes</strong> uniquement.</p>
      </Section>

      <Section number={2} accent={accent} title="Surveiller le Dashboard" description="Vue d'ensemble en temps réel">
        <p>4 KPIs en haut : commandes du jour, CA, panier moyen, CA 7 jours (avec comparaison vs hier en %).</p>
        <p><strong>Kanban</strong> des commandes actives : Payée(3) · Confirmée(2) · Préparation(4) · Prête(1) · Livraison(2). Click une colonne → filtre direct sur la page Commandes.</p>
        <p>Graph 7 jours + répartition des paiements + dernières commandes.</p>
      </Section>

      <Section number={3} accent={accent} title="Page Commandes — surveillance live" description="À garder ouverte pendant le service">
        <p>Polling automatique toutes les 15s. Quand une nouvelle commande arrive :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>🔔 Son de notification</li>
          <li>🍞 Toast vert &laquo; Nouvelle commande &raquo;</li>
          <li>La commande apparaît tout en haut de la liste</li>
        </ul>
        <p><strong>Filtres</strong> en haut : Toutes · Actives · En attente · Payées · Préparation · Livraison · Livrées.</p>
        <p><strong>Recherche</strong> live : numéro, nom, téléphone, adresse.</p>
      </Section>

      <Section number={4} accent={accent} title="Faire avancer les commandes" description="1-tap pour chaque étape">
        <p>Chaque ligne de commande affiche un <strong>bouton d&apos;action rapide</strong> qui mène au statut suivant logique :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li><Key>Payée</Key> → <Key>→ Préparation</Key> (bouton orange)</li>
          <li><Key>Préparation</Key> → <Key>→ Prête</Key> (bouton vert)</li>
          <li><Key>Prête</Key> → <Key>→ En livraison</Key> (bouton violet, demande l&apos;ETA en minutes)</li>
          <li><Key>En livraison</Key> → <Key>→ Livrée</Key> (bouton emerald)</li>
        </ul>
        <Tip>Quand tu passes une commande en &laquo; En livraison &raquo;, un prompt te demande la durée estimée (défaut 20 min). Le client voit immédiatement un countdown live sur sa page de suivi.</Tip>
      </Section>

      <Section number={5} accent={accent} title="Détail d'une commande" description="Modal avec actions rapides">
        <p>Click sur une commande (ou la flèche <Key>&gt;</Key>) → modal détail :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>📲 Bouton <strong>WhatsApp client</strong></li>
          <li>📞 Bouton <strong>Appeler client</strong></li>
          <li>🗺️ Bouton <strong>Ouvrir l&apos;itinéraire</strong> (Google Maps)</li>
          <li>Détail des articles + sous-total + livraison + pourboire + total</li>
          <li>Tous les boutons de changement de statut + bouton <strong>Annuler la commande</strong></li>
          <li>Lien <strong>Suivi client</strong> (la page que voit le client)</li>
        </ul>
      </Section>

      <Section number={6} accent={accent} title="Cas concrets" description="Situations du quotidien">
        <p><strong>&laquo; Le client appelle pour savoir où en est sa commande #42 &raquo;</strong> → tape <Key>42</Key> dans la recherche → tu vois tout immédiatement.</p>
        <p><strong>&laquo; Le livreur revient, livraison faite &raquo;</strong> → click <Key>→ Livrée</Key> sur la commande concernée.</p>
        <p><strong>&laquo; Le client veut annuler &raquo;</strong> → ouvre le détail → click <strong>Annuler la commande</strong> avec confirmation.</p>
        <p><strong>&laquo; Plat épuisé en cuisine &raquo;</strong> → tu n&apos;as pas accès au menu (rôle tech requis). Préviens le tech ou l&apos;admin pour masquer le plat.</p>
      </Section>
    </div>
  );
}

/* ───── TECH ───── */

function TechGuide() {
  const accent = "from-blue-500 to-indigo-500";
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[5px] p-5">
        <h2 className="font-heading text-xl font-bold text-blue-900">🔧 Gestion du contenu</h2>
        <p className="text-sm text-blue-800/70 mt-1">
          Le rôle Tech maintient le menu (plats, photos, catégories) et la médiathèque. Aucun accès aux commandes ni aux comptes.
        </p>
      </div>

      <Section number={1} accent={accent} title="Se connecter" description="Identifiant 'tech'">
        <p>URL : <Link href="/admin/login">/admin/login</Link></p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li><strong>Identifiant</strong> : <Key>tech</Key></li>
          <li><strong>Mot de passe</strong> : celui défini par l&apos;admin</li>
        </ul>
        <p>Sidebar : Dashboard · Menu · Médiathèque.</p>
      </Section>

      <Section number={2} accent={accent} title="Naviguer dans le menu" description="Sidebar des catégories">
        <p>Sur <Link href="/admin/menu">/admin/menu</Link> :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>Sidebar gauche : toutes les catégories (Entrées · Plats · Boissons · Formules · etc.)</li>
          <li>Selected en doré, type de catégorie en badge (Plats / Formules / Boissons)</li>
          <li>Hover sur une catégorie : toggle actif/inactif, renommer, supprimer (si vide)</li>
          <li>Bouton <strong>+ Nouvelle catégorie</strong> en bas avec sélecteur d&apos;icône</li>
        </ul>
      </Section>

      <Section number={3} accent={accent} title="Ajouter ou modifier un plat" description="2 modes : rapide ou complet">
        <p><strong>Ajout rapide</strong> (bouton doré en haut à droite) : modal 3 champs — <Key>Nom</Key> + <Key>Prix</Key> + <Key>Catégorie</Key>. Idéal pour saisir 10 plats en 2 minutes sans photo.</p>
        <p><strong>Avec photo</strong> (bouton gris) : formulaire complet avec image, accompagnement, badge.</p>
        <Tip>Pour la photo, le widget <strong>ImagePicker</strong> propose 2 onglets : <strong>Galerie</strong> (réutiliser une photo existante) ou <strong>Uploader</strong> (envoyer un nouveau fichier).</Tip>
      </Section>

      <Section number={4} accent={accent} title="Vue Grid (cartes visuelles)" description="Comme le client voit le menu">
        <p>Bascule en haut à droite : <Key>Grid</Key> / <Key>List</Key>.</p>
        <p>En Grid, chaque plat est une card avec :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>Photo plein cadre avec zoom au hover</li>
          <li>Badge ⭐ <strong>Spé</strong> (or) si spécialité</li>
          <li>Badge personnalisé (ex: &laquo; Nouveau &raquo;, &laquo; Promo &raquo;) en rouge</li>
          <li>Prix en bas avec fond blanc</li>
          <li>Overlay sombre si indisponible</li>
          <li>Boutons au hover : ✏️ Modifier · ⭐ Spé · 🗑️ Supprimer</li>
          <li>Toggle dispo en bas de la card</li>
        </ul>
      </Section>

      <Section number={5} accent={accent} title="Filtres et bulk actions" description="Productivité">
        <p>Sous le header, 4 chips de filtre : <Key>Tous</Key> · <Key>Dispo</Key> · <Key>Masqués</Key> · <Key>⭐ Spé.</Key></p>
        <p>Recherche dans la catégorie (nom, accompagnement, badge).</p>
        <p>Coche les checkboxes (haut à droite des cards) pour sélectionner plusieurs plats. Une barre apparaît :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li><strong>Rendre dispo</strong> en masse</li>
          <li><strong>Masquer</strong> en masse</li>
          <li><strong>Supprimer</strong> en masse</li>
        </ul>
      </Section>

      <Section number={6} accent={accent} title="Médiathèque" description="Centrale d'images">
        <p>Sur <Link href="/admin/media">/admin/media</Link> :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>Grille de toutes les images uploadées</li>
          <li>Recherche par nom de fichier</li>
          <li>Upload multiple (sélection de plusieurs fichiers d&apos;un coup)</li>
          <li>Hover : copier l&apos;URL · supprimer</li>
          <li>Stats : nombre d&apos;images, taille totale en Mo</li>
        </ul>
        <Tip>Les photos uploadées via le formulaire d&apos;un plat sont auto-ajoutées à la médiathèque. Et vice-versa : on peut piocher dans la galerie pour un autre plat.</Tip>
      </Section>

      <Section number={7} accent={accent} title="Cas concrets" description="Tâches courantes">
        <p><strong>&laquo; Mettre un plat en rupture pour ce soir &raquo;</strong> → toggle dispo de sa card. Masqué du site en 10s.</p>
        <p><strong>&laquo; Ajouter le plat du jour avec photo &raquo;</strong> → Click &laquo; Avec photo &raquo; → upload via galerie ou nouveau fichier → Save.</p>
        <p><strong>&laquo; Mettre une formule en avant &raquo;</strong> → catégorie Formules → ⭐ marque-la spécialité.</p>
        <p><strong>&laquo; Mettre à jour un prix &raquo;</strong> → Click sur la card → Modifier → change le prix → Save. Visible sur le site en 10s.</p>
      </Section>
    </div>
  );
}

/* ───── ADMIN ───── */

function AdminGuide() {
  const accent = "from-[#C9922A] to-[#E0AD4A]";
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-[5px] p-5">
        <h2 className="font-heading text-xl font-bold text-amber-900">🟡 Accès complet</h2>
        <p className="text-sm text-amber-800/70 mt-1">
          L&apos;admin a accès à tout : Dashboard · Commandes · Menu · Médiathèque · <strong>Admins</strong>.
          Il gère les comptes, la sécurité et la configuration.
        </p>
      </div>

      <Section number={1} accent={accent} title="Tout ce que Caissier et Tech savent faire" description="L'admin a accès à tout">
        <p>L&apos;admin peut tout faire : prendre les commandes, gérer le menu, uploader des photos, etc. Voir les onglets <strong>Caissier</strong> et <strong>Tech</strong> pour les workflows détaillés.</p>
        <p>En plus, accès à <Link href="/admin/users">/admin/users</Link>.</p>
      </Section>

      <Section number={2} accent={accent} title="Créer un compte" description="3 rôles disponibles">
        <p>Sur <Link href="/admin/users">/admin/users</Link>, formulaire en haut :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li><strong>Email</strong> (ou pseudo court — sera mappé automatiquement)</li>
          <li><strong>Mot de passe</strong> (min. 8 caractères)</li>
          <li><strong>Rôle</strong> : 3 boutons radio — <Key>Admin</Key> (or) · <Key>Caissier</Key> (vert) · <Key>Tech</Key> (bleu)</li>
        </ul>
        <Tip>Les pseudos courts <Key>caissier</Key> et <Key>tech</Key> sont mappés vers <Key>caissier@chezmamanjolie.com</Key> et <Key>tech@chezmamanjolie.com</Key>. L&apos;admin se connecte avec son email complet.</Tip>
      </Section>

      <Section number={3} accent={accent} title="Gérer les rôles existants" description="Changer ou révoquer">
        <p>Liste des comptes — pour chacun :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>Badge de rôle à côté du nom</li>
          <li>Dropdown <strong>Rôle :</strong> pour changer en live</li>
          <li>Bouton <strong>Réinitialiser</strong> mot de passe</li>
          <li>Bouton <strong>Supprimer</strong> le compte</li>
          <li>Date de création + dernière connexion</li>
        </ul>
      </Section>

      <Section number={4} accent={accent} title="Changer les mots de passe par défaut" description="À faire en priorité">
        <p>Les comptes <Key>caissier</Key> et <Key>tech</Key> ont un mot de passe par défaut <Key>pass12345</Key>. <strong>À changer immédiatement</strong> :</p>
        <ol className="list-decimal list-inside space-y-1 ml-1">
          <li>Va sur <Link href="/admin/users">/admin/users</Link></li>
          <li>Click <strong>Réinitialiser</strong> à côté de chaque compte</li>
          <li>Mets un mot de passe fort (12+ caractères, mélange)</li>
          <li>Communique le nouveau mot de passe à la personne concernée (par WhatsApp, jamais par email simple)</li>
        </ol>
      </Section>

      <Section number={5} accent={accent} title="Endpoints utiles" description="Pour diagnostic et webhook">
        <p><strong>Healthcheck SumUp</strong> : <Key>/api/sumup/status?token=&lt;ADMIN_HEALTHCHECK_TOKEN&gt;</Key> (récupère la valeur dans les env vars Vercel)</p>
        <p>Renvoie un JSON avec :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li><Key>ready: true/false</Key></li>
          <li><Key>mode: &quot;production&quot; | &quot;sandbox&quot;</Key></li>
          <li>Vérifie que la clé API + merchant code sont OK en créant un checkout test</li>
        </ul>
        <p><strong>Webhook SumUp</strong> : <Key>/api/sumup/webhook</Key> — à renseigner dans le dashboard SumUp pour confirmer automatiquement les paiements.</p>
      </Section>

      <Section number={6} accent={accent} title="Configuration sensible" description="Variables d'environnement Vercel">
        <p>Sur <Link href="https://vercel.com/dashboard">vercel.com/dashboard</Link> → ton projet → <strong>Settings → Environment Variables</strong> :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li><Key>SUMUP_API_KEY</Key> — clé secrète SumUp (live ou sandbox)</li>
          <li><Key>SUMUP_MERCHANT_CODE</Key> — code marchand SumUp</li>
          <li><Key>NEXT_PUBLIC_SITE_URL</Key> — <Key>https://chezmamanjolie.com</Key></li>
          <li><Key>NEXT_PUBLIC_SUPABASE_URL</Key> — URL de la base Supabase</li>
          <li><Key>SUPABASE_SERVICE_ROLE_KEY</Key> — clé admin Supabase</li>
        </ul>
        <Tip>Toute modif de variable nécessite un <strong>redeploy</strong> (Deployments → ⋯ → Redeploy).</Tip>
      </Section>

      <Section number={7} accent={accent} title="Accès direct aux données" description="Supabase">
        <p><Link href="https://supabase.com/dashboard">supabase.com/dashboard</Link> → ton projet :</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>Table <Key>orders</Key> : toutes les commandes (consultation, modification, exports)</li>
          <li>Table <Key>menu_items</Key> : tous les plats</li>
          <li>Table <Key>categories</Key> : catégories</li>
          <li>Storage <Key>menu-images</Key> : photos uploadées</li>
          <li>Auth Users : comptes admin avec leur rôle dans <Key>app_metadata</Key></li>
        </ul>
      </Section>

      <Section number={8} accent={accent} title="Tester en mode sandbox" description="Sans débiter de vraies cartes">
        <p>SumUp propose un compte sandbox sur <Link href="https://me.sumup.com/settings/developer?tab=sandboxes">me.sumup.com/settings/developer?tab=sandboxes</Link>.</p>
        <ol className="list-decimal list-inside space-y-1 ml-1">
          <li>Crée un sandbox merchant account</li>
          <li>Récupère sa clé API + son merchant code</li>
          <li>Mets-les temporairement dans Vercel à la place des clés live</li>
          <li>Redeploy</li>
          <li>Teste avec carte Visa <Key>4200 0000 0000 0091</Key> CVV <Key>123</Key> Exp. <Key>12/30</Key></li>
          <li>Remet les vraies clés ensuite</li>
        </ol>
        <Tip>Un paiement de <strong>11 € exactement</strong> échoue toujours par design (utile pour tester les erreurs).</Tip>
      </Section>
    </div>
  );
}
