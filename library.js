import { el, icon, toast, confirmDialog, download } from "../core/ui.js";
import { db, TYPES } from "../core/db.js";

export async function render(root) {
  let filter = "all";
  let query = "";
  const listHost = el("div", { class: "list" });

  async function refresh() {
    const items = (await db.list(filter === "all" ? null : filter)).filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()));
    if (!items.length) {
      listHost.replaceChildren(el("div", { class: "card muted" },
        "Aucune création ici pour le moment. Les outils (sprites, badges, dresseurs…) y enregistreront leurs résultats au fur et à mesure de leur construction."));
      return;
    }
    listHost.replaceChildren(...items.map(row));
  }

  const row = (c) =>
    el("div", { class: "card row-item" },
      el("div", { class: "grow" },
        el("b", {}, c.name),
        el("div", { class: "muted small" }, `${TYPES[c.type]} · modifié le ${new Date(c.updatedAt).toLocaleString("fr-FR")}`)),
      el("button", { class: "btn", onclick: () => rename(c) }, "Renommer"),
      el("button", { class: "btn", onclick: async () => { await db.duplicate(c.id); toast("Création dupliquée."); refresh(); } }, "Dupliquer"),
      el("button", { class: "btn", onclick: () => download(new Blob([JSON.stringify(c, null, 2)], { type: "application/json" }), `${c.name}.json`) }, "Exporter"),
      el("button", { class: "btn btn-danger", "aria-label": "Supprimer", onclick: () => remove(c) }, icon("trash", 16))
    );

  async function rename(c) {
    const name = prompt("Nouveau nom :", c.name);
    if (name && name.trim()) { await db.rename(c.id, name.trim()); refresh(); }
  }
  async function remove(c) {
    if (await confirmDialog(`Supprimer « ${c.name} » ? Cette action est définitive.`, "Supprimer")) {
      await db.remove(c.id); toast("Création supprimée."); refresh();
    }
  }

  const select = el("select", { class: "input", onchange: (e) => { filter = e.target.value; refresh(); } },
    el("option", { value: "all" }, "Toutes les catégories"),
    Object.entries(TYPES).map(([k, v]) => el("option", { value: k }, v)));
  const search = el("input", { class: "input", type: "search", placeholder: "Rechercher…", oninput: (e) => { query = e.target.value; refresh(); } });

  root.append(el("div", { class: "toolbar" }, search, select), listHost);
  await refresh();
}
