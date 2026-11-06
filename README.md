# PokéForge

Application web (HTML/CSS/JavaScript natif, sans build ni dépendance) pour créer des ressources Pokémon
destinées à RPG Maker XP + Pokémon Essentials v21.1. Gratuite, sans API.

## Publier sur GitHub Pages
1. Créer un dépôt, y déposer le contenu de ce dossier à la racine.
2. Settings → Pages → Branch `main` / dossier `/ (root)`.
3. L'application est servie sur `https://<utilisateur>.github.io/<dépôt>/`.

En local, il faut un petit serveur (les modules ES ne marchent pas en `file://`) :
`python3 -m http.server` puis ouvrir http://localhost:8000

## Architecture
- `index.html` : coquille (menu, en-tête, zone principale)
- `css/style.css` : design bleu nuit
- `js/main.js` : routeur par hash (`#/home`), gestion d'erreurs globale
- `js/core/db.js` : IndexedDB (créations par type, réglages, export/import du projet)
- `js/core/zip.js` : écriture de ZIP sans dépendance (testé)
- `js/core/ui.js` : DOM sûr, icônes, toasts, dialogues, téléchargement
- `js/pages/registry.js` : liste des outils ; un nouvel outil = un fichier `js/pages/<outil>.js` exportant `render(root, ctx)`
