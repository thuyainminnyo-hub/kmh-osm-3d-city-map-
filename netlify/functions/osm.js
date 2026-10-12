const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
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

  // Stay within serverless function execution limits: each upstream gets a short timeout.
  const startedAt = Date.now();
  const totalBudgetMs = 18500;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    if (Date.now() - startedAt >= totalBudgetMs) {
      errors.push("Remaining upstream attempts skipped to stay within the function time budget");
      break;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
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
        errors.push(`${new URL(endpoint).hostname}: HTTP ${response.status}`);
        continue;
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.elements)) {
        errors.push(`${new URL(endpoint).hostname}: invalid response`);
        continue;
      }
      return json(200, data);
    } catch (error) {
      errors.push(`${new URL(endpoint).hostname}: ${error.name === "AbortError" ? "timed out after 6 seconds" : `network/JSON error (${error.message || "unknown"})`}`);
    } finally {
      clearTimeout(timer);
    }
  }

  return json(502, {
    error: "All Overpass endpoints failed. Retry later or choose a smaller area.",
    details: errors
  });
};
