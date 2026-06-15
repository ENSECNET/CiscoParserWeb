# ENSECNET · CiscoParser Web

A public, zero-install converter: paste a Cisco IOS-XE `running-config`, get a
structured **NetBox-ready model** — interfaces, IPs, VLANs, VRFs, plus
routing / AAA / SNMP / etc. captured as config context.

Runs entirely on a **Cloudflare Worker**. The parser is pure JavaScript (V8), no
backend, no database. **Nothing is stored, and no NetBox credentials ever touch
this service.**

Companion to the on-prem [`CiscoParser`](https://github.com/TencoNemaStrach/CiscoParser)
(FastAPI + Docker, live NetBox push) and to a standalone NetBox deployment.

> Why a parser helps you document a network: see
> [`docs/why-and-what.md`](docs/why-and-what.md).

## How it works

```
paste config ──► /api/parse (Worker, JS) ──► NetBox model JSON
                                              ├─► Download JSON
                                              └─► Download import.py  (run it yourself)
```

Because NetBox lives on a private network and a token is sensitive, the web edition
does **not** push. Instead it returns:

- the **model as JSON** (drop into automation, diff, or archive), and
- a self-contained **`import.py`** (pynetbox) you run on a host that can reach your
  own NetBox, with your own `NETBOX_URL` / `NETBOX_TOKEN`. The token never leaves
  your machine.

## Repo layout

```
CiscoParserWeb/
├── wrangler.jsonc          Worker config (custom domain cisco.ensecnet.net)
├── src/
│   ├── index.js            Worker entry — UI + /api/parse + /api/snippet
│   ├── parser.js           pure-JS IOS-XE parser (port of the Python edition)
│   ├── snippet.js          generates the pynetbox import.py
│   └── ui.js               single-page UI
└── docs/
    └── why-and-what.md
```

## Endpoints

| Method | Path           | Purpose                          |
|--------|----------------|----------------------------------|
| GET    | `/`            | the converter UI                 |
| POST   | `/api/parse`   | `{config}` → NetBox model JSON   |
| POST   | `/api/snippet` | `{model}` → `import.py` text     |

## Deploy (ENSECNET workflow)

1. Upload this repo to GitHub (`TencoNemaStrach/CiscoParserWeb`).
2. Cloudflare → Workers & Pages → **Import a repository** → select the repo.
3. Deploy command: `npx wrangler deploy`. Build command: empty.
4. `wrangler.jsonc` binds the custom domain `cisco.ensecnet.net`.

Push to `main` → Cloudflare auto-deploys.

## Parser parity

The JS parser produces the same model shape as the Python on-prem edition
(`name, platform, interfaces[], vlans[], vrfs[], config_context{}`), so the JSON and
the generated `import.py` are interchangeable with the on-prem tool.

---

ENSECNET · open-source · *dobrá infraštruktúra nie je vidieť — jej absencia áno.*
