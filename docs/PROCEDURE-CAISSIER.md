# 💚 Procédure Caissier — Chez Maman Jolie

> **Mission** : prendre en charge toutes les commandes payées et les faire avancer jusqu'à la livraison, sans erreur, en gardant le client informé.

---

## 🔐 Connexion

- URL : `https://chezmamanjolie.com/admin/login`
- Identifiant : `caissier`
- Mot de passe : `pass12345` *(à changer à la première connexion)*

Après connexion, tu arrives sur le **Dashboard**.

---

## 🌅 Avant le service (5 min)

1. **Ouvre le Dashboard** — vérifie les chiffres du jour (commandes, CA, ticket moyen).
2. **Onglet Commandes** — passe en revue les commandes encore en cours (`Payée`, `En préparation`, `Prête`, `En livraison`).
3. **Vérifie le son** — clique n'importe où sur la page pour activer la notification sonore (les navigateurs bloquent le son tant qu'il n'y a pas eu d'interaction).
4. **Garde l'onglet Commandes ouvert** — il se rafraîchit tout seul toutes les 15 secondes.

---

## 🍽️ Pendant le service — workflow par commande

Chaque commande passe par **5 statuts** dans cet ordre :

```
Payée → En préparation → Prête → En livraison → Livrée
```

### 1️⃣ Nouvelle commande payée (🔔 son)

- Une carte rouge apparaît en haut.
- Clique dessus pour ouvrir le détail.
- **Vérifie** :
  - Le téléphone du client
  - L'adresse complète + code postal + ville
  - Le complément d'adresse (étage, code, interphone)
  - Les articles + total
- Si l'adresse semble douteuse → clique sur **📍 Maps** pour vérifier.
- Clique sur **✅ Marquer en préparation** → le statut passe à **En préparation**.

### 2️⃣ Cuisine en cours

- Transmets la commande à la cuisine (papier, vocal, ou cri).
- Tu peux laisser plusieurs commandes en `En préparation` en parallèle.

### 3️⃣ Commande prête

- Cuisine te confirme → ouvre la commande → clique sur **✅ Marquer prête**.
- Statut passe à **Prête**.

### 4️⃣ Départ livreur

- Le livreur prend la commande.
- Ouvre la commande → clique sur **🛵 En livraison**.
- Une popup demande l'**ETA en minutes** (10, 20, 30…). Mets une estimation réaliste.
- Statut passe à **En livraison**. Le client est notifié automatiquement par WhatsApp avec l'ETA.

### 5️⃣ Commande livrée

- Le livreur confirme la livraison.
- Ouvre la commande → clique sur **✓ Livrée**.
- C'est terminé. La commande disparaît du Kanban du dashboard.

---

## 📞 Situations courantes

### Le client appelle pour savoir où en est sa commande
- Ouvre `/admin/orders`, cherche son numéro de commande ou son téléphone.
- Lis-lui le statut actuel.
- Si **En livraison** : donne-lui l'ETA affiché.
- Bouton **📞 Appeler** : appelle directement.
- Bouton **💬 WhatsApp** : envoie un message pré-rempli.

### Le client veut modifier sa commande
- Si la commande est encore en **Payée** ou **En préparation** : possible en interne (préviens la cuisine). Ne modifie **pas** les articles dans le système — l'historique doit rester intact.
- Si la commande est **Prête** ou **En livraison** : trop tard, refuse poliment.

### Annulation
- Ouvre la commande → bouton **❌ Annuler**.
- Préviens la cuisine immédiatement si déjà en préparation.
- Pour un remboursement, contacte le **tech** ou l'**admin**.

### Problème livreur (panne, accident, retard >30 min)
- Préviens le client par **💬 WhatsApp** avec un nouvel ETA.
- Si livreur indisponible : envoies-en un autre, ou propose le retrait si possible.

### Plat en rupture après commande
- Préviens le client immédiatement par téléphone.
- Propose un plat équivalent ou un remboursement partiel.
- Demande au **tech** de marquer le plat indisponible dans le menu.

---

## 🌙 Fin de service

1. **Vérifie** qu'aucune commande n'est restée en `En préparation`, `Prête` ou `En livraison`.
2. **Dashboard** : note le CA du jour si demandé.
3. **Déconnecte-toi** (menu en bas à gauche → **Se déconnecter**).

---

## 🆘 Si ça plante

- Site lent / page blanche → recharge avec `Ctrl+Shift+R`.
- Son qui ne marche pas → clique une fois sur la page.
- Connexion impossible → préviens l'**admin**.
- Erreur de paiement / SumUp → préviens le **tech**.

---

## 📋 Raccourcis utiles

| Action | Où |
|--------|----|
| Voir toutes les commandes | `/admin/orders` |
| Voir les commandes actives uniquement | Dashboard `/admin` |
| Filtrer par statut | Onglets en haut de la table |
| Rechercher un client | Barre de recherche (nom, téléphone, n° commande) |
| Action groupée (changer statut de plusieurs commandes) | Cocher les cases → menu en haut |
