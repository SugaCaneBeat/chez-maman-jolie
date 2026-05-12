# 🔧 Procédure Tech — Chez Maman Jolie

> **Mission** : maintenir le menu à jour (plats, photos, prix, disponibilités), gérer la médiathèque, assurer que le site public est toujours impeccable.

---

## 🔐 Connexion

- URL : `https://chezmamanjolie.com/admin/login`
- Identifiant : `tech`
- Mot de passe : `pass12345` *(à changer à la première connexion)*

Après connexion, tu accèdes à : **Dashboard**, **Commandes**, **Menu**, **Médiathèque**, **Aide**.

---

## 📅 Routine quotidienne (~5 min)

1. **Ouvre `/admin/menu`**.
2. **Filtre `Masqués`** → vérifie que chaque plat masqué doit toujours l'être.
3. **Filtre `Dispo`** → confirme rapidement avec la cuisine si un plat doit être retiré du jour.
4. Si rupture annoncée → bascule l'interrupteur sur la carte du plat pour le masquer.

---

## 🗓️ Routine hebdomadaire (~15 min)

### Médiathèque
- Va dans `/admin/media`.
- Repère les images orphelines (non utilisées par un plat) → supprime celles inutiles.
- Vérifie qu'aucune image ne pèse plus de 2 Mo (sinon recompresse).

### Plats vedettes
- Ouvre `/admin/menu`.
- Marque ⭐ les 3–5 spécialités à mettre en avant cette semaine.
- Le ⭐ remonte le plat en tête de sa catégorie sur le site public.

### Ordre des catégories
- Si besoin, glisse-dépose les catégories dans la sidebar pour réorganiser.

---

## 🛠️ Tâches courantes

### Ajouter un nouveau plat — version rapide
1. `/admin/menu` → choisis la catégorie.
2. Clique sur **➕ Ajout rapide** en haut.
3. Saisis nom + prix → **Entrée**.
4. Le plat est créé, **disponible**, sans image.

### Ajouter un nouveau plat — version complète
1. `/admin/menu` → catégorie → **➕ Nouveau plat**.
2. Remplis :
   - **Nom** (obligatoire)
   - **Prix** (obligatoire, en euros)
   - **Description** (1–2 phrases)
   - **Image** : upload ou choisis dans la médiathèque
   - **Disponible** : ON
   - **⭐ Vedette** : si c'est une spécialité
3. **Enregistrer**.

### Ajouter une photo à un plat existant
1. Ouvre le plat dans `/admin/menu`.
2. Section **Image** → clique sur la zone.
3. Soit **Upload** un fichier (JPG/PNG/WebP, < 2 Mo idéalement).
4. Soit choisis dans la **Médiathèque**.
5. **Enregistrer**.

### Modifier un prix
1. Ouvre le plat → champ **Prix**.
2. Mets le nouveau montant (format `8.50`, pas `8,50`).
3. **Enregistrer**.

### Marquer un plat indisponible
- Sur la carte du plat, bascule l'interrupteur **Disponible** → OFF.
- Le plat reste dans la base mais disparaît du site public en quelques secondes.

### Masquer plusieurs plats d'un coup
1. `/admin/menu` → catégorie.
2. Coche les cases sur chaque carte.
3. Barre d'action en haut → **Masquer la sélection**.

### Supprimer un plat
1. Ouvre le plat → bouton **🗑️ Supprimer** en bas.
2. Confirme.
3. ⚠️ Supprime définitivement — l'historique des commandes reste intact (référence au nom au moment de la vente).

### Créer une nouvelle catégorie
1. `/admin/menu` → sidebar → **➕ Nouvelle catégorie**.
2. Nom (ex: `Desserts`) + ordre d'affichage (1 = en haut).
3. **Enregistrer**.
4. Ajoute des plats dedans.

---

## 🚨 Incidents

### Une image Unsplash ne charge plus
- Va dans `/admin/menu` → trouve le plat concerné.
- Re-upload une image locale depuis `/admin/media`.

### Plat affiché sur le site mais en rupture
- Coordonne avec le **caissier** : lui prévient le client en cours, toi tu masques le plat.

### Une modification ne s'affiche pas sur le site public
- Attends 30 secondes (cache Next.js).
- Force le rafraîchissement avec `Ctrl+Shift+R` sur le site public.
- Si toujours rien après 2 min, préviens l'**admin** (peut-être un build à relancer).

### Catégorie créée mais invisible côté public
- Vérifie qu'au moins 1 plat **disponible** est dedans (une catégorie vide n'apparaît pas).

### Plus grave (paiement, panne site, base de données)
- Préviens immédiatement l'**admin**.
- Ne touche pas à Supabase ou Vercel sans accord.

---

## 📋 URLs utiles

| Page | URL |
|------|-----|
| Menu | `/admin/menu` |
| Médiathèque | `/admin/media` |
| Aide intégrée | `/admin/help` |
| Site public | `/` |

---

## ✅ Checklist hebdo (à imprimer ou à cocher mentalement)

- [ ] Tous les plats indisponibles ont une raison valide
- [ ] Aucun plat avec prix à 0 ou nom vide
- [ ] Toutes les spécialités de la semaine sont marquées ⭐
- [ ] Photos cohérentes (pas de placeholder oublié)
- [ ] Médiathèque < 100 images orphelines
- [ ] Aucune catégorie vide visible côté public
