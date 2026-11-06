import { routes, stubPage } from "./pages/registry.js";
import { el, icon, toast } from "./core/ui.js";

const nav = document.getElementById("nav");
const main = document.getElementById("main");
const title = document.getElementById("page-title");
const shell = document.getElementById("shell");

routes.forEach((r) => {
  nav.append(
    el("a", { class: "nav-item", href: `#/${r.id}`, "data-id": r.id },
      icon(r.icon), el("span", {}, r.label),
      r.status === "planned" ? el("small", { class: "pill" }, "bientôt") : null)
  );
});

document.getElementById("menu-btn").addEventListener("click", () => shell.classList.toggle("nav-open"));
document.getElementById("scrim").addEventListener("click", () => shell.classList.remove("nav-open"));

let token = 0;
async function navigate() {
  const id = location.hash.replace(/^#\//, "") || "home";
  const route = routes.find((r) => r.id === id) || routes[0];
  const mine = ++token;
  shell.classList.remove("nav-open");
  nav.querySelectorAll(".nav-item").forEach((a) => a.classList.toggle("active", a.dataset.id === route.id));
  title.textContent = route.label;
  document.title = `${route.label} · PokéForge`;
  main.replaceChildren(el("div", { class: "loading" }, "Chargement…"));
  try {
    const mod = await (route.load ? route.load() : stubPage());
    if (mine !== token) return;
    const view = el("div", { class: "view" });
    await mod.render(view, { route, routes });
    if (mine !== token) return;
    main.replaceChildren(view);
    main.scrollTop = 0;
  } catch (err) {
    console.error(err);
    if (mine !== token) return;
    main.replaceChildren(el("div", { class: "card" }, el("h2", {}, "Erreur"), el("p", {}, err.message || String(err))));
    toast("Une erreur est survenue : " + (err.message || err), "error");
  }
}

window.addEventListener("hashchange", navigate);
window.addEventListener("error", (e) => toast("Erreur : " + e.message, "error"));
window.addEventListener("unhandledrejection", (e) => toast("Erreur : " + (e.reason?.message || e.reason), "error"));
navigate();
