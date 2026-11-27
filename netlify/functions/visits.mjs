// Visitor counter: GET returns the total, POST adds one and returns the new total.
// Stored in Netlify Blobs. Deploy previews and branch deploys use a separate store,
// so testing never inflates the production number. No IPs or personal data are kept.
import { getStore } from "@netlify/blobs";

const HEADERS = { "content-type": "application/json", "cache-control": "no-store" };

export default async (req, context) => {
    if (req.method !== "GET" && req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: HEADERS });
    }
    const isProd = context?.deploy?.context === "production";
    const store = getStore({ name: isProd ? "visits" : "visits-preview", consistency: "strong" });

    let count = Number(await store.get("total")) || 0;
    if (req.method === "POST") {
        count += 1;
        await store.set("total", String(count));
    }
    return new Response(JSON.stringify({ count }), { status: 200, headers: HEADERS });
};

export const config = { path: "/api/visits" };
