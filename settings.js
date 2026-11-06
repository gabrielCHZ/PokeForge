import { el, icon, toast, confirmDialog, download, pickFile, readText, fmtBytes } from "../core/ui.js";
import { db } from "../core/db.js";

export async function render(root) {
  const storageLine = el("p", { class: "muted" }, "Calcul de l'espace utilisé…");
  const persistLine = el("p", { class: "muted" });

  async function refreshStorage() {
    if (navigator.storage?.estimate) {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      storageLine.textContent = `Espace utilisé : ${fmtBytes(usage)}${quota ? ` sur ${fmtBytes(quota)} disponibles` : ""}.`;
    } else storageLine.textContent = "Estimation de l'espace indisponible sur ce navigateur.";
    if (navigator.storage?.persisted) {
      persistLine.textContent = (await navigator.storage.persisted())
        ? "Stockage protégé : le navigateur ne l'effacera pas automatiquement."
        : "Stockage non protégé : le navigateur peut l'effacer s'il manque de place. Pensez à exporter régulièrement.";
    }
  }

  const exportBtn = el("button", { class: "btn btn-primary", onclick: async () => {
    const data = await db.exportProject();
    const stamp = new Date().toISOString().slice(0, 10);
    download(new Blob([JSON.stringify(data)], { type: "application/json" }), `pokeforge-projet-${stamp}.json`);
    toast(`${data.creations.length} création(s) exportée(s).`, "ok");
  } }, icon("download", 16), "Exporter le projet");

  async function doImport(mode) {
    const file = await pickFile(".json,application/json");
    if (!file) return;
    try {
      if (mode === "replace" && !(await confirmDialog("Remplacer toutes vos créations actuelles par celles du fichier ?", "Remplacer"))) return;
      const n = await db.importProject(JSON.parse(await readText(file)), mode);
      toast(`${n} création(s) importée(s).`, "ok");
      refreshStorage();
    } catch (e) {
      toast(e instanceof SyntaxError ? "Fichier JSON illisible." : e.message, "error");
    }
  }

  root.append(
    el("div", { class: "card" },
      el("h3", {}, "Sauvegarde du projet"),
      el("p", { class: "muted" }, "Vos créations sont enregistrées dans ce navigateur (IndexedDB). Elles survivent à la fermeture, mais pas à un effacement des données du site : exportez régulièrement."),
      el("div", { class: "row" },
        exportBtn,
        el("button", { class: "btn", onclick: () => doImport("merge") }, icon("upload", 16), "Importer (fusionner)"),
        el("button", { class: "btn", onclick: () => doImport("replace") }, "Importer (remplacer tout)"))
    ),
    el("div", { class: "card" },
      el("h3", {}, "Stockage"),
      storageLine, persistLine,
      el("button", { class: "btn", onclick: async () => {
        if (!navigator.storage?.persist) return toast("Non pris en charge par ce navigateur.", "error");
        toast((await navigator.storage.persist()) ? "Stockage protégé." : "Le navigateur a refusé la demande.");
        refreshStorage();
      } }, "Demander la protection du stockage")
    ),
    el("div", { class: "card" },
      el("h3", {}, "Zone sensible"),
      el("p", { class: "muted" }, "Supprime définitivement toutes les créations et tous les réglages de cet appareil."),
      el("button", { class: "btn btn-danger", onclick: async () => {
        if (await confirmDialog("Tout effacer ? Pensez à exporter le projet avant.", "Tout effacer")) {
          await db.wipe(); toast("Données effacées."); refreshStorage();
        }
      } }, "Tout effacer")
    )
  );
  refreshStorage();
}
