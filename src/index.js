// index.js — Cloudflare Worker entry for CiscoParserWeb.
//
// Public, zero-install Cisco IOS-XE → NetBox-model converter.
// - GET  /                serves the single-page UI
// - POST /api/parse       { config: "..." } → NetBox-ready model JSON
// - POST /api/snippet     { model: {...} }  → NetBox import python snippet (text)
//
// No data is stored. No credentials are handled server-side. The model and the
// import snippet are generated and returned; the user runs the snippet against
// their own NetBox, on their own machine.

import { parseConfig } from "./parser.js";
import { PAGE } from "./ui.js";
import { buildSnippet } from "./snippet.js";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(PAGE, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    if (request.method === "POST" && url.pathname === "/api/parse") {
      try {
        const { config } = await request.json();
        if (!config || !config.trim()) {
          return json({ error: "empty config" }, 400);
        }
        return json(parseConfig(config));
      } catch (e) {
        return json({ error: String(e) }, 400);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/snippet") {
      try {
        const { model } = await request.json();
        return new Response(buildSnippet(model), {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      } catch (e) {
        return json({ error: String(e) }, 400);
      }
    }

    return new Response("Not found", { status: 404 });
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: JSON_HEADERS });
}
