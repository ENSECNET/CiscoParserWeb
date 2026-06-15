<div align="center">

# CiscoParser Web

**Public, in-browser Cisco → NetBox converter**

Paste a Cisco IOS-XE `running-config`, get a NetBox-ready model. Nothing stored, no credentials leave your machine.

[![Docs](https://img.shields.io/badge/📖_Documentation-View_full_docs-0bb3a0?style=for-the-badge)](https://ensecnet.github.io/CiscoParserWeb/)
[![License](https://img.shields.io/badge/License-Apache_2.0-131c2b?style=for-the-badge)](LICENSE)
[![On-prem edition](https://img.shields.io/badge/On--prem-CiscoParser-2ea043?style=for-the-badge)](https://github.com/ensecnet/CiscoParser)

</div>

---

> ### 📖 [**Read the full documentation →**](https://ensecnet.github.io/CiscoParserWeb/)
>
> How it works, privacy model, deployment — published as a documentation site with
> sidebar navigation. This README is the summary.

---

Runs entirely on a **Cloudflare Worker**. The parser is pure JavaScript (V8) — no
backend, no database. The web edition **never pushes to NetBox and never sees your
token**.

```
paste config ──► parse (Worker) ──► model JSON
                                  ├─► Download JSON
                                  └─► Download import.py (run it yourself)
```

Companion to the on-prem [CiscoParser](https://github.com/ensecnet/CiscoParser)
(FastAPI + Docker, live NetBox push) and to a standalone NetBox deployment.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | the converter UI |
| POST | `/api/parse` | `{config}` → NetBox model JSON |
| POST | `/api/snippet` | `{model}` → `import.py` text |

## Deploy

1. Upload this repo to GitHub (`ensecnet/CiscoParserWeb`).
2. Cloudflare → Workers & Pages → **Import a repository** → select the repo.
3. Deploy command: `npx wrangler deploy`. Build command: empty.

`wrangler.jsonc` binds the custom domain `cisco.ensecnet.net`. Push to `main` →
auto-deploy.

## Parser parity

Same model shape as the Python on-prem edition (`name, platform, interfaces[],
vlans[], vrfs[], config_context{}`), so the JSON and the generated `import.py` are
interchangeable between editions.

## License

Apache License 2.0 — see [LICENSE](LICENSE).

---

<div align="center">
ENSECNET · <em>dobrá infraštruktúra nie je vidieť — jej absencia áno.</em>
</div>
