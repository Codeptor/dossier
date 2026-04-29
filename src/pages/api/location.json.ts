import type { APIRoute } from "astro";

export const prerender = false;

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=0, s-maxage=60",
};

export const GET: APIRoute = ({ request }) => {
  const h = request.headers;
  const cityRaw = h.get("x-vercel-ip-city") ?? "";
  const country = h.get("x-vercel-ip-country") ?? "";
  const region = h.get("x-vercel-ip-country-region") ?? "";

  const city = decodeURIComponent(cityRaw).trim();
  const payload = city || country
    ? {
        city: city || null,
        country: country || null,
        region: region || null,
        label: city && country ? `${city}, ${country}` : country || city || null,
      }
    : { city: null, country: null, region: null, label: null };

  return new Response(JSON.stringify(payload), { headers });
};
