# 🌺 Pièce Fenua

**Le moteur de recherche des pièces détachées disponibles à Tahiti et dans les îles.**
Les fournisseurs, casses et revendeurs publient leur stock ; le client trouve la pièce, compare les prix et contacte le vendeur (WhatsApp, appel, réservation).

> Version de démonstration : tout fonctionne dans le navigateur, les données restent sur l'appareil. Vendeurs et prix fictifs.

## Catégories
🚗 Voiture · 🚚 Camion · 🏗️ Drague / pelle · 🚜 Engins Case / tracteur · 🏍️ Moto · 🛵 Scooter · 🚲 Vélo électrique · 🚤 Bateau / hors-bord · 🌊 Jet-ski

## Fonctions
- **Recherche** par nom, référence, marque ou modèle, avec filtres : catégorie, neuf / occasion, île, en stock, tri par prix.
- **Demande groupée** : la demande d'une pièce introuvable part chez tous les fournisseurs de la catégorie.
- **Vendre** : mise en ligne d'une pièce (magasin pro, casse ou particulier).
- **🛡 Anti-vol (version allégée)** pour toute pièce d'**occasion / revente** :
  - **toujours obligatoire** : la **pièce d'identité** du vendeur (CNI, passeport, permis) et une **déclaration sur l'honneur** ;
  - **facultatif sous 50 000 F** : le n° de série / VIN et un justificatif (la **carte grise**, le **ticket / la facture d'achat**, ou pour une casse le certificat de destruction). Avec justificatif, l'annonce reçoit le badge **✔ Provenance vérifiée**. Sans justificatif, elle reçoit le badge **Vendeur identifié** ;
  - **à partir de 50 000 F** (moteurs, hors-bord, jet-ski…) : le n° de série et le justificatif sont **obligatoires**. Le seuil se règle dans `app.js` (`SEUIL`).
  
  L'annonce reste **en vérification** jusqu'à ce qu'un modérateur valide la pièce d'identité. Un particulier ne peut publier que de l'occasion.
- **🚨 Signaler un vol** : le n° de série / VIN volé entre dans une liste de surveillance. Toute annonce correspondante est retirée des résultats et bloquée.
- **Vérification** : l'espace modérateur où l'on contrôle les documents, puis valide ou refuse.
- **PWA** : installable sur le téléphone et utilisable hors ligne.

## Mettre en ligne avec GitHub Pages
1. Crée un dépôt `piece-fenua` sur ton compte GitHub.
2. Envoie tous les fichiers du dossier (bouton **Add file → Upload files**).
3. **Settings → Pages → Branch : `main` / `(root)` → Save.**
4. L'app sera disponible à l'adresse `https://<ton-compte>.github.io/piece-fenua/`.

## Structure
```
index.html      page et écrans
style.css       styles (couleurs lagon, motif tapa)
app.js          logique (recherche, vente, anti-vol, vérification)
data.js         catégories, îles, annonces de démo
manifest.json   installation sur téléphone
sw.js           fonctionnement hors ligne
assets/         logo (engrenage + tiare), honu, va'a
```

## Pour passer en version réelle
- Un serveur et une base de données partagée (par exemple Supabase ou Firebase), avec des comptes fournisseurs.
- Un **stockage chiffré et à accès restreint des pièces d'identité**, conservées le moins longtemps possible (loi Informatique et Libertés). Les documents ne doivent jamais être publics.
- Import Excel / CSV du stock, puis une synchronisation automatique avec les logiciels de caisse.
- La liste des vols alimentée en lien avec la gendarmerie / la police (sur accord de leur part).
- Les notifications des demandes groupées aux fournisseurs.
