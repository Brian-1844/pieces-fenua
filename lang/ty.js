/* =====================================================================
   Pièce Fenua — Reo Tahiti (version bêta, À FAIRE RELIRE)
   ---------------------------------------------------------------------
   Gauche : le texte français exact affiché dans l'app.
   Droite : la traduction en reo tahiti.
   Si la droite est vide "", l'app garde le français.
   Pour corriger : modifie seulement le texte à droite, entre guillemets.
   (Les emoji placés devant un texte sont conservés automatiquement.)
   ===================================================================== */
window.PF_TY = {
  exact: {
    // ---- en-tête & onglets ----
    "Ia ora na ! Trouve ta pièce au fenua": "Ia ora na ! ʻImi i tō ʻoe tuhaʻa i te fenua",
    "Chercher": "ʻImi",
    "Demande": "Aniraa",
    "Vendre": "Hoʻo atu",
    "Signaler un vol": "Faʻaʻite i te ʻeiā",
    "Compte": "",
    "Vérification": "Hiʻopoʻaraa",
    "Connexion": "Tomo",

    // ---- recherche ----
    "Nom de pièce, référence, marque, modèle…": "Iʻoa o te tuhaʻa, nūmera, mareka…",
    "Voiture": "Pereʻoʻo",
    "Camion": "Pereʻoʻo uta taʻoʻa",
    "Drague / pelle": "",
    "Engins Case / tracteur": "",
    "Moto": "Moto",
    "Scooter": "",
    "Vélo électrique": "Pereʻoʻo taʻahi uira",
    "Bateau / hors-bord": "Poti / mātini poti",
    "Jet-ski": "",
    "Neuf + occasion": "ʻĀpī + tahito",
    "Neuf": "ʻĀpī",
    "Occasion": "Tahito",
    "Toutes les îles": "Te mau motu atoʻa",
    "En stock": "E vai nei",
    "Prix ↑": "Hoʻo ↑",
    "Mise à jour récente": "",
    "Appeler": "Niuniu",
    "Aucune pièce trouvée.": "ʻAita e tuhaʻa i itehia.",
    "Lancer une demande à tous les fournisseurs": "",
    "Signaler cette annonce": "",

    // ---- demande ----
    "Pièce introuvable ?": "ʻAita i itehia te tuhaʻa ?",
    "Pièce recherchée *": "Te tuhaʻa e ʻimihia ra *",
    "Catégorie *": "",
    "Véhicule (marque, modèle, année)": "Pereʻoʻo (mareka, matahiti)",
    "Île *": "Motu *",
    "Ton téléphone *": "Tō ʻoe niuniu *",
    "Envoyer la demande": "Hapono i te aniraa",

    // ---- compte ----
    "Mon compte": "",
    "Se connecter": "Tomo mai",
    "Créer un compte": "",
    "E-mail": "Rata uira",
    "Mot de passe": "Parau huna",
    "Mot de passe oublié ?": "Ua moʻe te parau huna ?",
    "Nom et prénom *": "Iʻoa *",
    "Téléphone / WhatsApp *": "Niuniu / WhatsApp *",
    "Commune *": "ʻOire *",
    "Enregistrer": "Faʻaherehere",
    "Se déconnecter": "Haere i rāpae",
    "Supprimer mon compte": "",

    // ---- vendre ----
    "Mettre une pièce en ligne": "",
    "Nom de la pièce *": "Iʻoa o te tuhaʻa *",
    "Photo de la pièce": "Hōhoʻa o te tuhaʻa",
    "Prix (F CFP) *": "Hoʻo (F CFP) *",
    "Quantité *": "",
    "Publier": "",
    "Mes annonces": "",

    // ---- divers ----
    "Confidentialité": ""
  },

  // Textes qui contiennent un nombre
  patterns: [
    [/^(\d+) pièces? trouvées?$/, "$1 tuhaʻa i itehia"]
  ]
};
