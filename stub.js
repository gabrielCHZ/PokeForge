import { el, icon } from "../core/ui.js";

export async function render(root, { route }) {
  root.append(
    el("div", { class: "card stub" },
      el("div", { class: "tool-icon big" }, icon(route.icon, 30)),
      el("h2", {}, route.label),
      el("p", { class: "muted" }, route.desc),
      el("p", {}, `Cet outil n'est pas encore construit : il sera réalisé à l'étape ${route.step} du plan. Aucune fonction factice n'est affichée en attendant.`),
      el("a", { class: "btn", href: "#/home" }, "Retour à l'accueil")
    )
  );
}
