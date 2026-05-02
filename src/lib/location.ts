import { Redis } from "@upstash/redis";

export type LiveLocation = {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  ts: number;
};

export const LOCATION_KEY = "now:location";

let _redis: Redis | null = null;
export function redis(): Redis | null {
  if (_redis) return _redis;
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

export async function readLocation(): Promise<LiveLocation | null> {
  const r = redis();
  if (!r) return null;
  try {
    return await r.get<LiveLocation>(LOCATION_KEY);
  } catch {
    return null;
  }
}

export async function writeLocation(loc: LiveLocation): Promise<boolean> {
  const r = redis();
  if (!r) return false;
  try {
    await r.set(LOCATION_KEY, loc);
    return true;
  } catch {
    return false;
  }
}

export type GeocodeResult = {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
};

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeocodeResult | null> {
  const url =
    `https://api.bigdatacloud.net/data/reverse-geocode-client` +
    `?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return null;
    const d = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
      countryCode?: string;
    };
    return {
      city: d.city || d.locality || null,
      region: d.principalSubdivision || null,
      country: d.countryName || null,
      countryCode: d.countryCode || null,
    };
  } catch {
    return null;
  }
}

export function relativeAge(ts: number, now = Date.now()): string {
  const sec = Math.max(0, Math.floor((now - ts) / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return `${Math.floor(day / 7)}w ago`;
}
