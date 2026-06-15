// parser.js — Cisco IOS-XE running-config parser (pure JS, no dependencies).
// Port of the ENSECNET CiscoParser logic to run on Cloudflare Workers (V8).
//
// Reads the hierarchical IOS-XE config (parent line + indented children) and
// returns the same NetBox-ready model the on-prem Python edition produces:
//
//   { name, platform, domain_name, interfaces[], vlans[], vrfs[], config_context{} }

function maskToPrefix(mask) {
  try {
    return mask.split(".").reduce((acc, o) => acc + ((parseInt(o, 10) >>> 0).toString(2).split("1").length - 1), 0);
  } catch {
    return 32;
  }
}

function interfaceType(name) {
  const n = name.toLowerCase();
  if (n.startsWith("te") || n.includes("tengig")) return "10gbase-x-sfpp";
  if (n.startsWith("gi") || n.includes("gig")) return "1000base-t";
  if (n.startsWith("lo") || n.includes("loopback")) return "virtual";
  if (n.includes("vlan")) return "virtual";
  if (n.includes("tunnel")) return "virtual";
  if (n.startsWith("po") || n.includes("port-channel")) return "lag";
  return "other";
}

// Build a list of { text, children: [lines] } blocks from raw config.
function blocks(configText) {
  const lines = configText.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let current = null;
  for (const raw of lines) {
    if (!raw.trim() || raw.trim() === "!") {
      current = null;
      continue;
    }
    const indented = /^\s+/.test(raw);
    if (!indented) {
      current = { text: raw.trim(), children: [] };
      out.push(current);
    } else if (current) {
      current.children.push(raw.trim());
    }
  }
  return out;
}

export function parseConfig(configText) {
  const blks = blocks(configText);
  const top = blks.map((b) => b.text);

  // ── identity ──────────────────────────────────────────────────────────
  const identity = {};
  for (const b of blks) {
    if (b.text.startsWith("hostname ")) identity.hostname = b.text.split(/\s+/)[1];
    if (/^ip domain.?name /.test(b.text)) identity.domain_name = b.text.split(/\s+/).pop();
    if (b.text.startsWith("version ")) identity.ios_version = b.text.split(/\s+/).pop();
  }

  // ── vrfs ──────────────────────────────────────────────────────────────
  const vrfs = [];
  for (const b of blks) {
    if (/^(ip\s+)?vrf\s+(definition\s+)?\S+/.test(b.text) && /vrf/.test(b.text)) {
      const name = b.text.split(/\s+/).pop();
      let rd = null;
      for (const c of b.children) if (c.startsWith("rd ")) rd = c.split(/\s+/).pop();
      vrfs.push({ name, rd });
    }
  }

  // ── vlans ─────────────────────────────────────────────────────────────
  const vlans = [];
  for (const b of blks) {
    const m = b.text.match(/^vlan\s+(\d+)\s*$/);
    if (m) {
      let name = null;
      for (const c of b.children) if (c.startsWith("name ")) name = c.slice(5).trim();
      vlans.push({ vid: m[1], name: name || `VLAN${m[1]}` });
    }
  }

  // ── interfaces ────────────────────────────────────────────────────────
  const interfaces = [];
  for (const b of blks) {
    if (!/^interface\s+/.test(b.text)) continue;
    const name = b.text.replace(/^interface\s+/, "");
    const entry = {
      name,
      type: interfaceType(name),
      enabled: true,
      description: null,
      address: null,
      mode: null,
      access_vlan: null,
    };
    for (const c of b.children) {
      if (c.startsWith("description ")) entry.description = c.slice(12).trim();
      else if (/^ip address /.test(c) && !c.includes("dhcp")) {
        const p = c.split(/\s+/);
        if (p.length >= 4) entry.address = `${p[2]}/${maskToPrefix(p[3])}`;
      } else if (c === "shutdown") entry.enabled = false;
      else if (c.startsWith("switchport mode ")) entry.mode = c.split(/\s+/).pop();
      else if (c.startsWith("switchport access vlan ")) entry.access_vlan = c.split(/\s+/).pop();
    }
    interfaces.push(entry);
  }

  // ── config-context (textual) groups ───────────────────────────────────
  function rawBlocks(re) {
    return blks
      .filter((b) => re.test(b.text))
      .map((b) => [b.text, ...b.children].join("\n"));
  }
  const ctxDefs = {
    routing: /^router\s+(ospf|eigrp|bgp|rip)|^ip\s+route\s+/,
    dhcp: /^ip\s+dhcp\s+/,
    acls: /^(ip\s+)?access-list|^access-list\s+/,
    nat: /^ip\s+nat\s+/,
    snmp: /^snmp-server\s+/,
    ntp: /^ntp\s+/,
    logging: /^logging\s+/,
    aaa: /^aaa\s+|^tacacs.?server|^radius.?server|^username\s+/,
    crypto: /^crypto\s+/,
    qos: /^(class-map|policy-map)\s+/,
    lines: /^line\s+/,
  };
  const config_context = {};
  for (const [k, re] of Object.entries(ctxDefs)) {
    const v = rawBlocks(re);
    if (v.length) config_context[k] = v;
  }

  // ── transform → NetBox-ready model ────────────────────────────────────
  return {
    name: identity.hostname || "unknown-device",
    platform: identity.ios_version || null,
    domain_name: identity.domain_name || null,
    interfaces,
    vlans,
    vrfs,
    config_context,
  };
}
