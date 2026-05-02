import type { APIRoute } from "astro";
import { reverseGeocode, writeLocation } from "@/lib/location";

export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const POST: APIRoute = async ({ request }) => {
  const secret = process.env.LOCATION_INGEST_SECRET;
  if (!secret) return json(500, { error: "ingest disabled" });

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (token !== secret) return json(401, { error: "unauthorized" });

  let body: { lat?: unknown; lng?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid json" });
  }
  const lat = typeof body.lat === "number" ? body.lat : Number(body.lat);
  const lng = typeof body.lng === "number" ? body.lng : Number(body.lng);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return json(400, { error: "invalid coordinates" });
  }

  const geo = await reverseGeocode(lat, lng);
  if (!geo) return json(502, { error: "geocode failed" });

  const ok = await writeLocation({ ...geo, ts: Date.now() });
  if (!ok) return json(503, { error: "store failed" });

  return json(200, {
    ok: true,
    city: geo.city,
    region: geo.region,
    country: geo.country,
  });
};
