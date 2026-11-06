// Stockage persistant (IndexedDB) : créations de toute nature + réglages.
// Les images/sons sont stockés en data URL pour que l'export du projet reste un simple JSON.

const DB_NAME = "pokeforge";
const DB_VERSION = 1;
let dbPromise = null;

export const TYPES = {
  pokemon: "Pokémon",
  fakemon: "Fakémon",
  sprite: "Sprites",
  animation: "Animations",
  cry: "Cris",
  trainer: "Dresseurs",
  card: "Cartes",
  badge: "Badges",
  team: "Équipes",
  gym: "Arènes",
  item: "Objets",
  megagem: "Méga-Gemmes",
};

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB indisponible dans ce navigateur."));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("creations")) {
        db.createObjectStore("creations", { keyPath: "id" }).createIndex("type", "type");
      }
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function run(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

export const db = {
  /** Crée ou met à jour une création. Retourne l'objet enregistré. */
  async save(item) {
    const now = Date.now();
    const rec = { ...item, id: item.id || uid(), createdAt: item.createdAt || now, updatedAt: now };
    if (!TYPES[rec.type]) throw new Error(`Type de création inconnu : ${rec.type}`);
    await run("creations", "readwrite", (s) => s.put(rec));
    return rec;
  },
  get: (id) => run("creations", "readonly", (s) => s.get(id)),
  async list(type) {
    const all = await run("creations", "readonly", (s) => s.getAll());
    return (type ? all.filter((c) => c.type === type) : all).sort((a, b) => b.updatedAt - a.updatedAt);
  },
  remove: (id) => run("creations", "readwrite", (s) => s.delete(id)),
  async rename(id, name) {
    const c = await this.get(id);
    if (!c) throw new Error("Création introuvable.");
    return this.save({ ...c, name });
  },
  async duplicate(id) {
    const c = await this.get(id);
    if (!c) throw new Error("Création introuvable.");
    const { id: _i, createdAt: _c, ...rest } = c;
    return this.save({ ...rest, name: `${c.name} (copie)` });
  },
  async counts() {
    const all = await this.list();
    const out = Object.fromEntries(Object.keys(TYPES).map((k) => [k, 0]));
    for (const c of all) out[c.type] = (out[c.type] || 0) + 1;
    return out;
  },

  getSetting: (k) => run("settings", "readonly", (s) => s.get(k)),
  setSetting: (k, v) => run("settings", "readwrite", (s) => s.put(v, k)),

  /** Export complet du projet (JSON sérialisable). */
  async exportProject() {
    const creations = await this.list();
    const settings = {};
    const db_ = await open();
    await new Promise((res, rej) => {
      const tx = db_.transaction("settings", "readonly");
      const st = tx.objectStore("settings");
      const rq = st.openCursor();
      rq.onsuccess = () => {
        const c = rq.result;
        if (c) { settings[c.key] = c.value; c.continue(); }
      };
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
    return { app: "pokeforge", schema: 1, exportedAt: new Date().toISOString(), creations, settings };
  },

  /** Import : mode "merge" (ajoute/écrase par id) ou "replace" (vide d'abord). */
  async importProject(data, mode = "merge") {
    if (!data || data.app !== "pokeforge" || !Array.isArray(data.creations)) {
      throw new Error("Ce fichier n'est pas une sauvegarde PokéForge valide.");
    }
    if (mode === "replace") await run("creations", "readwrite", (s) => s.clear());
    for (const c of data.creations) {
      if (!c || !c.id || !TYPES[c.type]) continue;
      await run("creations", "readwrite", (s) => s.put(c));
    }
    for (const [k, v] of Object.entries(data.settings || {})) await this.setSetting(k, v);
    return data.creations.length;
  },

  async wipe() {
    await run("creations", "readwrite", (s) => s.clear());
    await run("settings", "readwrite", (s) => s.clear());
  },
};
