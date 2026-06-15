/* ENSECNET CiscoParserWeb docs — sidebar navigation + EN/SK switcher. */
const NAV = [
  { key: "nav.getting", items: [
    { en: "Overview",     sk: "Prehľad",       path: "index.html" },
    { en: "Why a parser", sk: "Načo parser",   path: "pages/why.html" },
  ]},
  { key: "nav.reference", items: [
    { en: "How it works", sk: "Ako to funguje", path: "pages/how.html" },
    { en: "Privacy",      sk: "Súkromie",       path: "pages/privacy.html" },
  ]},
  { key: "nav.deploy", items: [
    { en: "Deploy on Cloudflare", sk: "Nasadenie na Cloudflare", path: "pages/deploy.html" },
    { en: "On-prem edition",      sk: "On-prem edícia",          path: "pages/onprem.html" },
  ]},
];
(function () {
  const root = document.body.getAttribute("data-root") || "";
  const current = document.body.getAttribute("data-page") || "";
  const sb = document.querySelector(".nav"); if (!sb) return;
  const lang = (window.ENSECNET_I18N && window.ENSECNET_I18N.current()) || "en";
  const D = (window.ENSECNET_I18N && window.ENSECNET_I18N.DICT) || {};
  const gt = (k) => (D[k] && D[k][lang]) || k;
  let html = "";
  NAV.forEach((g) => {
    html += `<div class="nav-group"><div class="nav-group-title" data-i18n="${g.key}">${gt(g.key)}</div>`;
    g.items.forEach((it) => {
      const cls = it.path === current ? "active" : "";
      const label = `<span data-lang="en">${it.en}</span><span data-lang="sk">${it.sk}</span>`;
      html += `<a class="${cls}" href="${root}${it.path}">${label}</a>`;
    });
    html += `</div>`;
  });
  sb.innerHTML = html;
  const sw = document.querySelector(".lang-switch");
  if (sw) {
    sw.innerHTML = `<button class="lang-btn" data-set="en">EN</button><button class="lang-btn" data-set="sk">SK</button>`;
    sw.querySelectorAll(".lang-btn").forEach((b) => {
      b.addEventListener("click", () => window.ENSECNET_I18N.set(b.getAttribute("data-set")));
    });
  }
  if (window.ENSECNET_I18N) window.ENSECNET_I18N.apply(window.ENSECNET_I18N.current());
})();
