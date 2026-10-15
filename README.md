# KMH OpenStreetMap → 3D City Map

A mobile-first Three.js web app that loads a bounded OpenStreetMap area and renders roads and buildings in an interactive 3D scene.

## Live project

- **Production site:** https://cosmic-otter-956085.netlify.app/
- **GitHub repository:** https://github.com/thuyainminnyo-hub/kmh-osm-3d-city-map-
- **Netlify deploy history:** https://app.netlify.com/projects/cosmic-otter-956085/deploys

## Current capabilities

- City presets: Yangon, Mandalay, Taunggyi, Naypyidaw, and Bagan, plus a custom bounding box.
- Two presentation modes: Realistic 3D City and City Planning Model.
- OpenStreetMap building and road loading through a Netlify Function proxy.
- Bounded-area validation to keep requests small (maximum 0.03° per side).
- Overpass endpoint fallback and a synthetic demo-city fallback when live OSM data cannot be loaded.
- Exact-bounding-box client cache using localStorage.
- Road-width strips, road-class styling, and labels for named major roads.
- Status text reports the loaded OSM counts and the number of road labels created.

## Current deployment status (2026-10-12)

The latest road-label update is followed by a GitHub source improvement, `874c3aefdbc80b346f01f1e21ad069818e07c00e` ("Batch OSM road geometry to improve mobile rendering performance"). It batches road segments by highway class to reduce individual mesh/draw-call overhead. This source improvement has **not** been verified on the live production site because Netlify production deploys were paused for exhausted credits.

The currently known published production version is commit `b18d9a26d2ffbff5158af8156df7a76ba40c5cd8` ("Add readable labels for named main roads in 3D scenes"). The live site remains published, but the latest label-size/status-count change is not live yet.

**Do not assume a GitHub commit is deployed.** After the Netlify billing cycle resets or credits are otherwise restored:
1. Open the Netlify deploy dashboard.
2. Confirm the latest `main` commit is eligible for production deploy.
3. Trigger a deploy only after credits are available.
4. Wait for the deploy status to say **Published**.
5. Open the production URL on a phone and test a Yangon area.
6. Confirm the status reports OSM buildings, roads, and road-label count.
7. Switch between both visual styles and verify labels are readable.
8. Test demo fallback if the Overpass service is unavailable.

## OSM proxy

The Netlify Function at `netlify/functions/osm.js` accepts `south`, `west`, `north`, and `east` query parameters. It validates the requested area, builds a bounded Overpass query for building and highway ways, applies a timeout, and tries alternate Overpass endpoints.

Example:

```
/.netlify/functions/osm?south=16.770&west=96.150&north=16.780&east=96.160
```

The function returns Overpass JSON; the browser frontend converts the returned data into the 3D scene. Overpass availability and the presence of named roads vary by area.

## Development principle

While Netlify production deploys are paused, continue reviewing and improving the source on GitHub without repeatedly attempting production deploys. Batch changes and run the verification checklist after credits return.


### Recent source-side reliability improvement

The Netlify OSM proxy now aborts slower Overpass mirror requests after the first valid response succeeds, reducing unnecessary outbound work. This change is in GitHub source only until a production deploy is successfully published; it has not yet been verified on the live site.
