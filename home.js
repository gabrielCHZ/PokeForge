import { el, icon } from "../core/ui.js";
import { db, TYPES } from "../core/db.js";

export async function render(root, { routes }) {
  const counts = await db.counts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  root.append(
    el("section", { class: "hero card" },
      el("h2", {}, "Vos ressources Pokémon, au même endroit"),
      el("p", { class: "muted" }, "Outils de création pour RPG Maker XP et Pokémon Essentials v21.1. Tout fonctionne dans le navigateur ; vos créations sont enregistrées sur cet appareil."),
      el("p", { class: "muted" }, total === 0 ? "Aucune création pour l'instant." : `${total} création${total > 1 ? "s" : ""} enregistrée${total > 1 ? "s" : ""}.`)
    ),
    el("h3", { class: "section-title" }, "Outils"),
    el("div", { class: "grid" },
      routes.filter((r) => r.id !== "home").map((r) =>
        el("a", { class: "card tool", href: `#/${r.id}` },
          el("div", { class: "tool-icon" }, icon(r.icon, 22)),
          el("h4", {}, r.label),
          el("p", { class: "muted" }, r.desc || (r.id === "library" ? "Retrouver, renommer, dupliquer, exporter vos créations." : "Sauvegarde, import/export du projet, stockage.")),
          el("span", { class: `pill ${r.status === "ready" ? "ok" : ""}` }, r.status === "ready" ? "disponible" : `étape ${r.step}`)
        ))
    ),
    el("h3", { class: "section-title" }, "Mes créations"),
    el("div", { class: "stats" },
      Object.entries(TYPES).map(([k, label]) =>
        el("a", { class: "stat", href: `#/library` }, el("b", {}, counts[k] || 0), el("span", {}, label)))
    )
  );
}
