/* ENSECNET CiscoParserWeb docs — sidebar navigation. */
const NAV = [
  { group: "Getting Started", items: [
    { title: "Overview",     path: "index.html" },
    { title: "Why a parser", path: "pages/why.html" },
  ]},
  { group: "Reference", items: [
    { title: "How it works", path: "pages/how.html" },
    { title: "Privacy",      path: "pages/privacy.html" },
  ]},
  { group: "Deployment", items: [
    { title: "Deploy on Cloudflare", path: "pages/deploy.html" },
    { title: "On-prem edition",      path: "pages/onprem.html" },
  ]},
];
(function () {
  const root = document.body.getAttribute("data-root") || "";
  const current = document.body.getAttribute("data-page") || "";
  const sb = document.querySelector(".nav"); if (!sb) return;
  let html = "";
  NAV.forEach((g) => {
    html += `<div class="nav-group"><div class="nav-group-title">${g.group}</div>`;
    g.items.forEach((it) => {
      const cls = it.path === current ? "active" : "";
      html += `<a class="${cls}" href="${root}${it.path}">${it.title}</a>`;
    });
    html += `</div>`;
  });
  sb.innerHTML = html;
})();
