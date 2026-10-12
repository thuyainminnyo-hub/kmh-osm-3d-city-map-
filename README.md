# KMH OpenStreetMap → 3D City Map

Mobile-first starter project for loading a bounded OpenStreetMap area and rendering buildings/roads in a 3D scene.

## Status

- [x] Dedicated GitHub repository created
- [x] Netlify Function proxy starter added
- [ ] Add the deployed frontend source as `index.html`
- [ ] Update frontend to call `/.netlify/functions/osm?south=...&west=...&north=...&east=...`
- [ ] Deploy from the GitHub repository in Netlify
- [ ] Verify OSM fetch and 3D scene on mobile

## OSM proxy

The Netlify Function at `netlify/functions/osm.js` accepts a small bounding box using `south`, `west`, `north`, and `east` query parameters. It constructs a fixed Overpass query for building and highway ways, validates coordinates and area size, applies a timeout, and tries two Overpass endpoints.

Example:

```
/.netlify/functions/osm?south=16.770&west=96.150&north=16.780&east=96.160
```

The function returns Overpass JSON. It does not itself render the 3D scene.

## Important

The frontend source is not yet committed here. The existing Netlify Drop deployment is separate until Netlify is explicitly connected to this GitHub repository. A proxy can avoid browser CORS restrictions, but it cannot guarantee upstream Overpass availability.
