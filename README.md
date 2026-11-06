# 🌺 Pièce Fenua

**Le moteur de recherche des pièces détachées disponibles à Tahiti et dans les îles.**
Les fournisseurs, les casses et les revendeurs publient leur stock. Le client trouve la pièce, compare les prix et contacte le vendeur par WhatsApp ou par téléphone.

L'app fonctionne de deux façons :
- **Mode démo** (par défaut) : tout reste sur le téléphone, avec des vendeurs fictifs. C'est pratique pour montrer l'app.
- **Mode réel** : les comptes, les annonces et les documents sont partagés par tous les utilisateurs, grâce à **Supabase** (offre gratuite).

## Catégories
Voiture · Camion · Drague / pelle · Engins Case / tracteur · Moto · Scooter · Vélo électrique · Bateau / hors-bord · Jet-ski

## Fonctions
- **Recherche** avec les filtres catégorie, neuf / occasion, île et en stock. Les annonces s'affichent **avec la photo de la pièce**.
- **Comptes** : inscription par e-mail et mot de passe, profil (acheteur, particulier, professionnel avec N° Tahiti, ou casse), mot de passe oublié, suppression du compte.
- **Pièce d'identité** : on l'envoie une seule fois dans le compte, et seulement pour revendre. Un modérateur la vérifie, puis **le document est effacé**. Le compte reçoit alors le badge « Vendeur identifié ✔ ».
- **Vendre** : une photo de la pièce (réduite automatiquement à 1000 px, données GPS retirées), le prix, la quantité et la compatibilité.
- **🛡 Anti-vol** pour l'occasion :
  - sous 50 000 F : la pièce d'identité suffit. Avec la carte grise ou le ticket d'achat, l'annonce reçoit le badge « Provenance vérifiée » ;
  - à partir de 50 000 F : le n° de série et le justificatif sont obligatoires, et l'annonce est toujours contrôlée.
- **🚨 Signaler un vol** : toute annonce qui porte le même n° de série est **bloquée automatiquement**.
- **Demande groupée** : une pièce introuvable est demandée à tous les fournisseurs. Les comptes professionnels voient les demandes et y répondent par WhatsApp.
- **⚑ Signaler une annonce** (photo inappropriée, pièce probablement volée, arnaque…). Il faut être connecté pour signaler, ce qui évite les signalements gratuits.
- **⛔ Suspension de compte** : le modérateur peut suspendre le compte d'un vendeur qui abuse.
  - Toutes ses annonces disparaissent immédiatement.
  - La personne ne peut plus vendre, signaler ni faire de demande, et voit le motif de la suspension dans son compte.
  - En cas de réactivation, ses annonces repassent par la vérification avant de revenir en ligne.
  - Le modérateur peut aussi seulement **retirer une photo** ou **retirer une annonce**.
- **⭐ Offres pros** (`offres.html`) : trois formules, Gratuite (30 pièces), Partenaire et Premium, avec un formulaire de contact par WhatsApp ou par e-mail. Ton numéro et ton e-mail se règlent dans `config.js`. Une fois le paiement reçu, le modérateur choisit l'offre du fournisseur dans **Vérification**. Le badge « Fournisseur partenaire » s'affiche alors, et les annonces Premium passent « À la une ». Les tarifs sont à ajuster directement dans `offres.html`. La limite de 30 pièces se règle dans `backend.js` et dans `schema.sql`.
- **Reo Tahiti (bêta)** : le bouton en haut à droite passe l'app en tahitien. Les traductions sont dans `lang/ty.js` : modifie le texte à droite, et une ligne vide garde le français. **À faire relire par une personne qui parle couramment le tahitien.**
- **🛡 Vérification** : l'espace modérateur, avec les signalements, les comptes à vérifier, les annonces en attente et les comptes suspendus.

Les règles importantes (qui peut publier, le blocage des pièces volées, qui peut voir les documents) sont appliquées **par le serveur**. Elles ne peuvent pas être contournées depuis le téléphone.

---

## 1. Mettre l'app sur GitHub Pages
1. Sur GitHub, crée un dépôt public **`piece-fenua`**.
2. **Add file → Upload files**. Glisse **tout le contenu** du dossier (avec les dossiers `assets` et `supabase`), puis **Commit changes**.
3. **Settings → Pages → Branch : `main` / `(root)` → Save.**
4. Au bout d'une minute ou deux, l'app est en ligne sur `https://piece-fenua.github.io`, en mode démo.

## 2. Passer en mode réel avec Supabase (environ 15 minutes)
1. Crée un compte sur **supabase.com**, puis **New project**. Choisis un nom, un mot de passe de base de données (garde-le) et une région.
2. Va dans **SQL Editor → New query**. Colle tout le fichier `supabase/schema.sql`, puis clique sur **Run**. Tu dois voir « Success ».
   *(Facultatif : fais de même avec `supabase/demo-data.sql` pour avoir quelques annonces d'exemple.)*
3. Va dans **Authentication → URL Configuration** :
   - **Site URL** : `https://piece-fenua.github.io`
   - **Redirect URLs** : ajoute la même adresse.
4. Va dans **Project Settings → API**. Copie la **Project URL** et la clé **anon public**.
5. Sur GitHub, ouvre **`config.js`**, clique sur le crayon ✏️ et colle les deux valeurs :
   ```js
   SUPABASE_URL: "https://xxxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOi..."
   ```
   ⚠ Ne mets **jamais** la clé `service_role` : elle donnerait tous les droits à n'importe qui.
6. Ouvre l'app et **crée ton compte**. Valide l'e-mail de confirmation.
7. Deviens modérateur : retourne dans **SQL Editor** et exécute :
   ```sql
   update public.profiles set role = 'moderateur'
    where id = (select id from auth.users where email = 'TON_EMAIL');
   ```
   Recharge l'app : l'onglet **🛡 Vérification** apparaît.

## 3. Avant le vrai lancement
- Complète `confidentialite.html`, aux endroits entre [crochets].
- Les e-mails gratuits de Supabase sont limités à quelques-uns par heure. Pour un vrai lancement, branche un service d'envoi d'e-mails (SMTP) dans **Authentication → Emails**.
- Supprime les annonces de démo : `delete from public.annonces where owner is null;`
- Note le nom des comptes suspendus pour vol. Si la même personne crée un nouveau compte, tu la reconnaîtras au moment de vérifier sa pièce d'identité.
- Pour en parler avec la gendarmerie : la liste des pièces signalées volées et le « vendeur identifié » sont tes meilleurs arguments.

## Structure
```
index.html            écrans de l'app
style.css             styles (fond tiare / honu / niho mano)
icons.js              icônes des véhicules
app.js                interface
backend.js            mode démo + mode Supabase (même interface)
config.js             ← tes clés Supabase
i18n.js, lang/ty.js   bascule FR / Reo Tahiti (traductions à relire)
data.js               catégories, îles, données de démo
offres.html           page des offres pour les professionnels
confidentialite.html  politique de confidentialité (modèle)
supabase/schema.sql   base de données, règles d'accès, stockage privé
supabase/demo-data.sql annonces d'exemple
manifest.json, sw.js  installation sur le téléphone + hors ligne
assets/               logo (engrenage + tiare), honu, va'a
```
