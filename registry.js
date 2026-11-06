// Registre des pages. Pour ajouter un outil : créer js/pages/<outil>.js (export render(root, ctx))
// puis passer son statut à "ready" ici. Les outils pas encore construits restent marqués "planned"
// et affichent une page d'état honnête (aucun faux bouton).

export const routes = [
  { id: "home", label: "Accueil", icon: "home", status: "ready", load: () => import("./home.js") },
  { id: "pokedex", label: "Bibliothèque Pokémon", icon: "library", status: "planned", step: 3, desc: "Pokémon générations 1 à 9 et Fakémon, filtres, recherche, évolutions et formes." },
  { id: "sprites", label: "Générateur de sprites", icon: "sprite", status: "planned", step: 4, desc: "Dos, shiny et icônes à partir d'un sprite, bandes multi-frames, export ZIP." },
  { id: "animations", label: "Éditeur d'animations", icon: "anim", status: "planned", step: 5, desc: "Animations pixel art frame par frame, parties du sprite séparables, annuler/rétablir." },
  { id: "cries", label: "Générateur de cris", icon: "sound", status: "planned", step: 6, desc: "Synthèse sonore originale (Web Audio), écoute, comparaison et export WAV." },
  { id: "battle", label: "Simulateur de combat", icon: "battle", status: "planned", step: 6, desc: "Aperçu visuel d'un combat, sans système de combat réel." },
  { id: "trainers", label: "Créateur de dresseurs", icon: "trainer", status: "planned", step: 9, desc: "Dresseurs, équipes de 6, dialogues et export vers Essentials v21.1." },
  { id: "cards", label: "Créateur de cartes", icon: "card", status: "planned", step: 10, desc: "Cartes de dresseurs horizontales, aperçu en direct, export PNG haute qualité." },
  { id: "badges", label: "Créateur de badges", icon: "badge", status: "planned", step: 8, desc: "Badges par formes et motifs combinables, éditeur pixel art, collection de 8." },
  { id: "items", label: "Gestionnaire d'objets", icon: "gem", status: "planned", step: 7, desc: "Objets officiels et personnalisés, Méga-Gemmes, import ZIP, code Ruby et PBS." },
  { id: "gyms", label: "Arènes et Ligue", icon: "gym", status: "planned", step: 12, desc: "Arènes, champions, Conseil 4, Maître de la Ligue et progression." },
  { id: "library", label: "Bibliothèque de créations", icon: "box", status: "ready", load: () => import("./library.js") },
  { id: "settings", label: "Paramètres", icon: "settings", status: "ready", load: () => import("./settings.js") },
];

export const stubPage = () => import("./stub.js");
