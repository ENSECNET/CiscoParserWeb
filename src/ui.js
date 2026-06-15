// ui.js — single-page UI served by the Worker, exported as a template string.
// Bilingual EN/SK (primary EN); choice persists in localStorage.
export const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ENSECNET · CiscoParser</title>
<meta name="description" content="Convert a Cisco IOS-XE running-config into a NetBox-ready model. Free, in-browser, nothing stored.">
<style>
  :root{
    --bg:#0d1117; --panel:#161b22; --line:#283039;
    --ink:#e6edf3; --muted:#8b949e; --accent:#2ea043; --warn:#d29922; --err:#f85149;
    --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--mono);font-size:14px;line-height:1.5}
  header{border-bottom:1px solid var(--line);padding:14px 20px;display:flex;align-items:center;gap:12px}
  header .dot{width:9px;height:9px;border-radius:50%;background:var(--accent)}
  header h1{font-size:15px;margin:0;letter-spacing:.5px;font-weight:600}
  header .ver{color:var(--muted);font-size:12px}
  header .spacer{flex:1}
  .lang-switch{display:flex;gap:4px}
  .lang-btn{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.5px;
    padding:3px 10px;border:1px solid var(--line);background:var(--bg);color:var(--muted);
    border-radius:5px;cursor:pointer}
  .lang-btn:hover{background:var(--panel)}
  .lang-btn.active{background:var(--accent);color:#02160a;border-color:var(--accent)}
  .lede{max-width:1000px;margin:0 auto;padding:22px 20px 0}
  .lede p{color:var(--muted);margin:0}
  main{max-width:1000px;margin:0 auto;padding:18px 20px 48px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .full{grid-column:1/-1}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:18px}
  .card h2{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin:0 0 12px;font-weight:600}
  label{display:block;font-size:12px;color:var(--muted);margin:10px 0 4px}
  input[type=file],textarea{width:100%;background:var(--bg);border:1px solid var(--line);color:var(--ink);border-radius:6px;padding:8px 10px;font-family:var(--mono);font-size:13px}
  textarea{min-height:240px;resize:vertical}
  button{background:var(--accent);color:#02160a;border:0;border-radius:6px;padding:9px 16px;font-family:var(--mono);font-weight:600;font-size:13px;cursor:pointer;margin-top:12px}
  button.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
  button:disabled{opacity:.45;cursor:not-allowed}
  .btnrow{display:flex;gap:10px;flex-wrap:wrap}
  pre{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:12px;overflow:auto;font-size:12px;max-height:400px;margin:0}
  .status{font-size:12px;margin-top:8px;min-height:16px}
  .ok{color:var(--accent)} .bad{color:var(--err)} .pending{color:var(--warn)}
  .kpi{display:flex;gap:14px;margin-bottom:12px;flex-wrap:wrap}
  .kpi div{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:8px 12px;min-width:74px}
  .kpi b{display:block;font-size:18px;color:var(--accent)} .kpi span{font-size:11px;color:var(--muted)}
  .note{font-size:12px;color:var(--muted);margin-top:10px;border-top:1px solid var(--line);padding-top:10px}
  footer{max-width:1000px;margin:0 auto;padding:0 20px 40px;color:var(--muted);font-size:12px}
  [data-lang]{display:none}
  @media(max-width:760px){main{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <span class="dot"></span>
  <h1>ENSECNET&nbsp;·&nbsp;CISCOPARSER</h1>
  <span class="ver">Cisco IOS-XE → NetBox model · web</span>
  <span class="spacer"></span>
  <span class="lang-switch">
    <button class="lang-btn" data-set="en">EN</button>
    <button class="lang-btn" data-set="sk">SK</button>
  </span>
</header>

<div class="lede">
  <p data-lang="en">Paste a Cisco <code>running-config</code> and get a structured NetBox-ready
  model — interfaces, IPs, VLANs, VRFs, plus routing/AAA/SNMP/etc. as config
  context. Everything runs in your browser session. Nothing is stored, no
  credentials leave your machine.</p>
  <p data-lang="sk">Vlož Cisco <code>running-config</code> a dostaneš štruktúrovaný model
  pripravený pre NetBox — rozhrania, IP, VLAN-y, VRF-y, plus routing/AAA/SNMP/atď. ako config
  context. Všetko beží v relácii tvojho prehliadača. Nič sa neukladá, žiadne prihlasovacie
  údaje neopustia tvoj stroj.</p>
</div>

<main>
  <section class="card">
    <h2><span data-lang="en">Config input</span><span data-lang="sk">Vstup configu</span></h2>
    <label><span data-lang="en">Upload running-config (.cfg / .txt)</span><span data-lang="sk">Nahraj running-config (.cfg / .txt)</span></label>
    <input type="file" id="cfgFile" accept=".cfg,.txt,.conf">
    <label><span data-lang="en">…or paste config text</span><span data-lang="sk">…alebo vlož text configu</span></label>
    <textarea id="cfgText" placeholder="hostname CORE-RTR-01&#10;!&#10;interface GigabitEthernet0/0/0&#10; ip address 198.51.100.2 255.255.255.0"></textarea>
    <div class="btnrow">
      <button onclick="parseCfg()"><span data-lang="en">Convert</span><span data-lang="sk">Konvertuj</span></button>
      <button class="ghost" onclick="loadSample()"><span data-lang="en">Load sample</span><span data-lang="sk">Načítaj vzorku</span></button>
    </div>
    <div class="status" id="st"></div>
  </section>

  <section class="card">
    <h2><span data-lang="en">NetBox model</span><span data-lang="sk">NetBox model</span></h2>
    <div class="kpi" id="kpi" style="display:none">
      <div><b id="kIf">0</b><span data-lang="en">interfaces</span><span data-lang="sk">rozhrania</span></div>
      <div><b id="kVlan">0</b><span data-lang="en">vlans</span><span data-lang="sk">vlan-y</span></div>
      <div><b id="kVrf">0</b><span data-lang="en">vrfs</span><span data-lang="sk">vrf-y</span></div>
      <div><b id="kCtx">0</b><span data-lang="en">context</span><span data-lang="sk">context</span></div>
    </div>
    <pre id="out">—</pre>
    <div class="btnrow">
      <button id="dlJson" onclick="dlModel()" disabled><span data-lang="en">Download JSON</span><span data-lang="sk">Stiahni JSON</span></button>
      <button id="dlPy" class="ghost" onclick="dlSnippet()" disabled>Download import.py</button>
    </div>
    <div class="note">
      <span data-lang="en">The import script is generated for you to run against your own
      NetBox (<code>NETBOX_URL</code> + <code>NETBOX_TOKEN</code> as env vars). This
      site never connects to NetBox and never sees your token.</span>
      <span data-lang="sk">Import skript sa vygeneruje, aby si ho spustil proti svojmu vlastnému
      NetBoxu (<code>NETBOX_URL</code> + <code>NETBOX_TOKEN</code> ako env premenné). Táto
      stránka sa nikdy nepripája na NetBox a nikdy nevidí tvoj token.</span>
    </div>
  </section>
</main>

<footer>
  <span data-lang="en">ENSECNET · open-source · companion to a standalone NetBox deployment ·
  <em>Great infrastructure is invisible — its absence is not.</em></span>
  <span data-lang="sk">ENSECNET · open-source · doplnok k samostatnému NetBox nasadeniu ·
  <em>dobrá infraštruktúra nie je vidieť — jej absencia áno.</em></span>
</footer>

<script>
let model = null;

// ── i18n ──────────────────────────────────────────────────────────────
const STR = {
  conv:    { en: "converting…",                  sk: "konvertujem…" },
  need:    { en: "provide a file or paste config", sk: "nahraj súbor alebo vlož config" },
  failp:   { en: "parse failed",                 sk: "parsovanie zlyhalo" },
  done:    { en: "converted: ",                  sk: "skonvertované: " },
  sample:  { en: "sample loaded — press Convert", sk: "vzorka načítaná — stlač Konvertuj" },
};
function lang(){ return localStorage.getItem("ensecnet-lang") || "en"; }
function T(k){ return (STR[k] && STR[k][lang()]) || k; }
function applyLang(l){
  document.documentElement.setAttribute("lang", l);
  document.querySelectorAll("[data-lang]").forEach(function(el){
    const on = el.getAttribute("data-lang") === l;
    const inline = el.tagName === "SPAN";
    el.style.display = on ? (inline ? "inline" : "block") : "none";
  });
  document.querySelectorAll(".lang-btn").forEach(function(b){
    b.classList.toggle("active", b.getAttribute("data-set") === l);
  });
}
function setLang(l){ localStorage.setItem("ensecnet-lang", l); applyLang(l); }
document.querySelectorAll(".lang-btn").forEach(function(b){
  b.addEventListener("click", function(){ setLang(b.getAttribute("data-set")); });
});
applyLang(lang());

// ── app ───────────────────────────────────────────────────────────────
function setSt(msg,cls){ const e=document.getElementById('st'); e.textContent=msg; e.className='status '+(cls||''); }

async function parseCfg(){
  setSt(T('conv'),'pending');
  let config = document.getElementById('cfgText').value;
  const f = document.getElementById('cfgFile').files[0];
  if(f) config = await f.text();
  if(!config || !config.trim()){ setSt(T('need'),'bad'); return; }
  try{
    const r = await fetch('/api/parse',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({config})});
    const d = await r.json();
    if(!r.ok){ setSt(d.error||T('failp'),'bad'); return; }
    model = d; render();
    setSt(T('done')+d.name,'ok');
  }catch(e){ setSt(String(e),'bad'); }
}

function render(){
  document.getElementById('out').textContent = JSON.stringify(model,null,2);
  document.getElementById('kpi').style.display='flex';
  document.getElementById('kIf').textContent=(model.interfaces||[]).length;
  document.getElementById('kVlan').textContent=(model.vlans||[]).length;
  document.getElementById('kVrf').textContent=(model.vrfs||[]).length;
  document.getElementById('kCtx').textContent=Object.keys(model.config_context||{}).length;
  document.getElementById('dlJson').disabled=false;
  document.getElementById('dlPy').disabled=false;
}

function download(name,text,type){
  const b=new Blob([text],{type:type||'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(b); a.download=name; a.click();
  URL.revokeObjectURL(a.href);
}

function dlModel(){ if(model) download((model.name||'device')+'.json', JSON.stringify(model,null,2),'application/json'); }

async function dlSnippet(){
  if(!model) return;
  const r = await fetch('/api/snippet',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model})});
  download('import.py', await r.text());
}

function loadSample(){
  document.getElementById('cfgText').value =
\`hostname CORE-RTR-01
!
ip domain-name corp.example
!
vlan 10
 name USERS
!
ip vrf MGMT
 rd 65000:1
!
interface Loopback0
 ip address 10.255.0.1 255.255.255.255
!
interface GigabitEthernet0/0/0
 description WAN-UPLINK
 ip address 198.51.100.2 255.255.255.0
 no shutdown
!
interface GigabitEthernet0/0/1
 switchport mode access
 switchport access vlan 10
!
router ospf 1
 router-id 10.255.0.1
!
snmp-server community CORP-RO RO
ntp server 10.0.0.10
!
end\`;
  setSt(T('sample'),'');
}
</script>
</body>
</html>`;
