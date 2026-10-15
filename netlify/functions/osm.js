const OVERPASS_ENDPOINTS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter"
];

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=30",
    "X-Content-Type-Options": "nosniff"
  },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed. Use GET." });
  }

  const params = event.queryStringParameters || {};
  const south = Number(params.south);
  const west = Number(params.west);
  const north = Number(params.north);
  const east = Number(params.east);

  if (![south, west, north, east].every(Number.isFinite) ||
      south < -90 || north > 90 || west < -180 || east > 180 ||
      south >= north || west >= east) {
    return json(400, { error: "Invalid bounding box. Provide south, west, north, east." });
  }

  // Keep public requests bounded to small map areas.
  if ((north - south) > 0.03 || (east - west) > 0.03 ||
      (north - south) * (east - west) > 0.0009) {
    return json(413, { error: "Area too large. Select a smaller map area (maximum 0.03° per side)." });
  }

  const bbox = `${south},${west},${north},${east}`;
  const query = `[out:json][timeout:15];(way["building"](${bbox});way["highway"](${bbox}););out geom qt;`;
  const errors = [];
  const timeoutMs = 8000;
  const controllers = [];

  // Query mirrors in parallel so one slow public endpoint does not consume
  // the time needed to try the others within a serverless function.
  const attempts = OVERPASS_ENDPOINTS.map(async (endpoint) => {
    const controller = new AbortController();
    controllers.push(controller);
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "Accept": "application/json",
          "User-Agent": "KMH-OSM-3D-City-Map/1.0 (bounded-area preview)"
        },
        body: new URLSearchParams({ data: query }).toString(),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`${new URL(endpoint).hostname}: HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.elements)) {
        throw new Error(`${new URL(endpoint).hostname}: invalid response`);
      }
      return data;
    } catch (error) {
      const hostname = new URL(endpoint).hostname;
      const message = error.name === "AbortError"
        ? `timed out after ${timeoutMs / 1000} seconds`
        : (error.message || "network/JSON error");
      errors.push(`${hostname}: ${message}`);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  });

  try {
    const data = await Promise.any(attempts);
    // Stop slower mirrors as soon as one valid response wins. This avoids
    // leaving unnecessary outbound requests running after the function can respond.
    controllers.forEach((controller) => controller.abort());
    return json(200, data);
  } catch {
    return json(502, {
      error: "All Overpass endpoints failed. Public OSM servers may be busy; retry later or select a smaller area.",
      details: errors
    });
  }
};
