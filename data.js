/* Pièce Fenua — données de démonstration (vendeurs et prix fictifs) */
const CATEGORIES = [
  { id: "voiture",  nom: "Voiture",            ico: "🚗" },
  { id: "camion",   nom: "Camion",             ico: "🚚" },
  { id: "drague",   nom: "Drague / pelle",     ico: "🏗️" },
  { id: "case",     nom: "Engins Case / tracteur", ico: "🚜" },
  { id: "moto",     nom: "Moto",               ico: "🏍️" },
  { id: "scooter",  nom: "Scooter",            ico: "🛵" },
  { id: "velo",     nom: "Vélo électrique",    ico: "🚲" },
  { id: "bateau",   nom: "Bateau / hors-bord", ico: "🚤" },
  { id: "jetski",   nom: "Jet-ski",            ico: "🌊" }
];

const ILES = ["Tahiti", "Moorea", "Raiatea", "Tahaa", "Huahine", "Bora Bora",
  "Rangiroa", "Tikehau", "Fakarava", "Nuku Hiva", "Hiva Oa", "Tubuai", "Rurutu"];

const H = 3600 * 1000;
const now = Date.now();

/* statut : "publie" | "attente" | "refuse"
   etat   : "neuf" | "occasion"
   type   : "pro" | "casse" | "particulier" */
const DEMO_ANNONCES = [
  { id:"d1", nom:"Plaquettes de frein avant", cat:"voiture", compat:"Toyota Hilux 2015-2023", ref:"04465-0K290",
    etat:"neuf", prix:6900, qte:7, vendeur:"Auto Pièces Fare Ute", type:"pro", offre:"partenaire", commune:"Papeete", ile:"Tahiti", tel:"87000001", maj:now-2*H, statut:"publie" },
  { id:"d2", nom:"Plaquettes de frein avant", cat:"voiture", compat:"Toyota Hilux 2015-2023", ref:"04465-0K290",
    etat:"neuf", prix:7450, qte:1, vendeur:"Garage Pirae Motors", type:"pro", commune:"Pirae", ile:"Tahiti", tel:"87000002", maj:now-26*H, statut:"publie" },
  { id:"d3", nom:"Plaquettes de frein avant", cat:"voiture", compat:"Toyota Hilux 2016", ref:"04465-0K290",
    etat:"occasion", prix:5200, qte:2, vendeur:"Casse Auto Faa'a", type:"casse", commune:"Faa'a", ile:"Tahiti", tel:"87000003", maj:now-5*H, statut:"publie",
    serie:"MR0FZ29G601234567", justif_type:"pv_casse" },
  { id:"d4", nom:"Alternateur", cat:"voiture", compat:"Kia Picanto 2015-2019", ref:"37300-04700",
    etat:"occasion", prix:14000, qte:1, vendeur:"Casse Auto Faa'a", type:"casse", commune:"Faa'a", ile:"Tahiti", tel:"87000003", maj:now-30*H, statut:"publie",
    serie:"KNABE511AFT000111", justif_type:"carte_grise" },
  { id:"d5", nom:"Filtre à gasoil", cat:"camion", compat:"Isuzu NPR / NQR", ref:"8-98037-011",
    etat:"neuf", prix:3200, qte:12, vendeur:"Moana Poids Lourds", type:"pro", offre:"partenaire", commune:"Punaauia", ile:"Tahiti", tel:"87000004", maj:now-8*H, statut:"publie" },
  { id:"d6", nom:"Kit d'embrayage", cat:"camion", compat:"Mitsubishi Canter 2012-2020", ref:"ME-500900",
    etat:"neuf", prix:68000, qte:0, vendeur:"Moana Poids Lourds", type:"pro", offre:"partenaire", commune:"Punaauia", ile:"Tahiti", tel:"87000004", maj:now-50*H, statut:"publie", commande:"10 jours" },
  { id:"d7", nom:"Dent de godet", cat:"drague", compat:"Pelles 20 t (série standard)", ref:"1U3352",
    etat:"neuf", prix:9500, qte:24, vendeur:"Fenua TP Équipements", type:"pro", commune:"Papeete", ile:"Tahiti", tel:"87000005", maj:now-12*H, statut:"publie" },
  { id:"d8", nom:"Flexible hydraulique 1/2\"", cat:"drague", compat:"Drague / pelle — sur mesure", ref:"",
    etat:"neuf", prix:12500, qte:6, vendeur:"Fenua TP Équipements", type:"pro", commune:"Papeete", ile:"Tahiti", tel:"87000005", maj:now-3*H, statut:"publie" },
  { id:"d9", nom:"Filtre à huile moteur", cat:"case", compat:"Case 580 SN / 590", ref:"84475542",
    etat:"neuf", prix:4800, qte:9, vendeur:"Fenua TP Équipements", type:"pro", commune:"Papeete", ile:"Tahiti", tel:"87000005", maj:now-20*H, statut:"publie" },
  { id:"d10", nom:"Démarreur", cat:"case", compat:"Tracteur Case IH JX", ref:"",
    etat:"occasion", prix:35000, qte:1, vendeur:"Teva (particulier)", type:"particulier", commune:"Taravao", ile:"Tahiti", tel:"87000006", maj:now-40*H, statut:"publie",
    serie:"CASEJX0099887", justif_type:"ticket" },
  { id:"d11", nom:"Chaîne + pignons", cat:"moto", compat:"Yamaha YBR 125", ref:"",
    etat:"neuf", prix:11900, qte:4, vendeur:"Moto Center Arue", type:"pro", commune:"Arue", ile:"Tahiti", tel:"87000007", maj:now-6*H, statut:"publie" },
  { id:"d12", nom:"Courroie de transmission", cat:"scooter", compat:"Vespa Primavera 125", ref:"1A000387",
    etat:"neuf", prix:5600, qte:3, vendeur:"Moto Center Arue", type:"pro", commune:"Arue", ile:"Tahiti", tel:"87000007", maj:now-6*H, statut:"publie" },
  { id:"d13", nom:"Courroie de transmission", cat:"scooter", compat:"Vespa Primavera 125", ref:"1A000387",
    etat:"neuf", prix:5900, qte:2, vendeur:"Moorea Scoot", type:"pro", commune:"Maharepa", ile:"Moorea", tel:"87000008", maj:now-15*H, statut:"publie" },
  { id:"d14", nom:"Batterie 48 V 13 Ah", cat:"velo", compat:"Vélos électriques cadre bas", ref:"",
    etat:"neuf", prix:42000, qte:2, vendeur:"E-Bike Tahiti", type:"pro", commune:"Pirae", ile:"Tahiti", tel:"87000009", maj:now-4*H, statut:"publie" },
  { id:"d15", nom:"Contrôleur moteur 36/48 V", cat:"velo", compat:"Moteur moyeu 250-500 W", ref:"",
    etat:"neuf", prix:8900, qte:5, vendeur:"E-Bike Tahiti", type:"pro", commune:"Pirae", ile:"Tahiti", tel:"87000009", maj:now-4*H, statut:"publie" },
  { id:"d16", nom:"Pompe à eau (turbine)", cat:"bateau", compat:"Yamaha F40 / F50", ref:"63D-44352-01",
    etat:"neuf", prix:16900, qte:3, vendeur:"Nautisme Fenua", type:"pro", commune:"Uturoa", ile:"Raiatea", tel:"87000010", maj:now-9*H, statut:"publie" },
  { id:"d17", nom:"Hélice inox 13 x 19", cat:"bateau", compat:"Yamaha 60-115 CV", ref:"",
    etat:"occasion", prix:28000, qte:1, vendeur:"Marine Shop Taravao", type:"pro", offre:"premium", commune:"Taravao", ile:"Tahiti", tel:"87000011", maj:now-22*H, statut:"publie",
    serie:"HEL-1319-55621", justif_type:"ticket" },
  { id:"d18", nom:"Turbine de jet", cat:"jetski", compat:"Sea-Doo GTI 130", ref:"267000617",
    etat:"neuf", prix:39000, qte:1, vendeur:"Marine Shop Taravao", type:"pro", offre:"premium", commune:"Taravao", ile:"Tahiti", tel:"87000011", maj:now-22*H, statut:"publie" },
  { id:"d19", nom:"Bougies (lot de 3)", cat:"jetski", compat:"Yamaha WaveRunner VX", ref:"",
    etat:"neuf", prix:4500, qte:10, vendeur:"Bora Nautic", type:"pro", commune:"Vaitape", ile:"Bora Bora", tel:"87000012", maj:now-60*H, statut:"publie" },
  { id:"d21", nom:"Rétroviseur gauche", cat:"scooter", compat:"Yamaha NMax 125", ref:"",
    etat:"occasion", prix:2500, qte:1, vendeur:"Hina (particulier)", type:"particulier", commune:"Pirae", ile:"Tahiti", tel:"87000014", maj:now-3*H, statut:"publie",
    serie:"", justif_type:"" },
  /* annonce en attente de vérification (visible seulement dans l'onglet Vérification) */
  { id:"d20", nom:"Moteur hors-bord 40 CV complet", cat:"bateau", compat:"Yamaha F40", ref:"",
    etat:"occasion", prix:250000, qte:1, vendeur:"Vendeur particulier", type:"particulier", commune:"Mahina", ile:"Tahiti", tel:"87000013", maj:now-1*H, statut:"attente",
    serie:"6BG-1045522", justif_type:"ticket", doc_id_nom:"cni.jpg", doc_justif_nom:"facture.jpg" }
];

/* liste de surveillance (exemple) */
const DEMO_VOLS = [
  { serie:"6BG-1045522", desc:"Moteur Yamaha F40 volé sur un poti marara à Mahina", date:"2026-10-28", plainte:"PV 2026/1187", tel:"87000099" }
];
