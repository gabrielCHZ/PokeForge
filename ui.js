// Utilitaires d'interface : création de DOM sans innerHTML (pas d'injection), toasts, dialogues, téléchargement.

export function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, "");
    else n.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return n;
}

const ICONS = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  library: "M4 4h4v16H4zM10 4h4v16h-4zM16 6l4-1 3 15-4 1z",
  sprite: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  anim: "M4 5h16v14H4zM9 9l6 3-6 3z",
  sound: "M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11",
  battle: "M5 19l8-8M13 11l5-5V3h-3l-5 5M19 19l-8-8M11 11L6 6V3h3l5 5",
  trainer: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  badge: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z",
  box: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  card: "M3 6h18v12H3zM7 10h4v4H7zM14 10h4M14 14h4",
  gem: "M6 4h12l4 6-10 11L2 10zM2 10h20M9 4l3 6 3-6M12 10v11",
  gym: "M3 21h18M5 21V10l7-6 7 6v11M10 21v-6h4v6",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14 3h-4l-.6 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 002 1.2L10 21h4l.6-2.6a7 7 0 002-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
  menu: "M4 6h16M4 12h16M4 18h16",
  download: "M12 4v12m0 0l-4-4m4 4l4-4M5 20h14",
  upload: "M12 16V4m0 0L8 8m4-4l4 4M5 20h14",
  trash: "M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  check: "M5 12l5 5 9-10",
};

export function icon(name, size = 20) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", ICONS[name] || ICONS.box);
  svg.append(p);
  return svg;
}

export function toast(message, kind = "info") {
  let host = document.getElementById("toasts");
  if (!host) {
    host = el("div", { id: "toasts", "aria-live": "polite" });
    document.body.append(host);
  }
  const t = el("div", { class: `toast toast-${kind}` }, message);
  host.append(t);
  setTimeout(() => t.classList.add("out"), 3600);
  setTimeout(() => t.remove(), 4000);
}

export function confirmDialog(message, okLabel = "Confirmer") {
  return new Promise((resolve) => {
    const dlg = el("dialog", { class: "dialog" });
    const done = (v) => { dlg.close(); dlg.remove(); resolve(v); };
    dlg.append(
      el("p", {}, message),
      el("div", { class: "row end" },
        el("button", { class: "btn", onclick: () => done(false) }, "Annuler"),
        el("button", { class: "btn btn-primary", onclick: () => done(true) }, okLabel))
    );
    dlg.addEventListener("cancel", () => done(false));
    document.body.append(dlg);
    dlg.showModal();
  });
}

export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function pickFile(accept) {
  return new Promise((resolve) => {
    const input = el("input", { type: "file", accept });
    input.addEventListener("change", () => resolve(input.files[0] || null));
    input.click();
  });
}

export const readText = (file) => file.text();

export function fmtBytes(n) {
  if (n < 1024) return `${n} o`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} Ko`;
  return `${(n / 1048576).toFixed(1)} Mo`;
}
