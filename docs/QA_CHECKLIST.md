# KMH OSM 3D City Map — QA Checklist

Use this checklist after a source change and again after a successful production deploy. A GitHub commit alone does not mean the live site has changed.

## A. Production safety

- [ ] Check the Netlify deploy dashboard before triggering a production deploy.
- [ ] If the dashboard says credits are exhausted, do not repeatedly retry deploys.
- [ ] Confirm the published production URL is still reachable.
- [ ] Confirm the intended commit is marked **Published** before calling a change live.

## B. Mobile launch

- [ ] Open https://cosmic-otter-956085.netlify.app/ on a phone.
- [ ] Confirm the page title and controls render without horizontal overflow.
- [ ] Confirm the 3D canvas appears and can be rotated by dragging.
- [ ] Confirm pinch/scroll zoom works and Reset camera restores a useful view.
- [ ] Confirm JavaScript/module errors are reported in the status panel if the engine fails.

## C. Live OpenStreetMap data

- [ ] Select Yangon and tap **Load OSM data & build 3D**.
- [ ] Confirm the status distinguishes a live OSM scene from a cached scene or demo fallback.
- [ ] Confirm building and road counts are non-zero for a suitable sample area.
- [ ] Confirm road segments are batched by highway class and mobile orbit/zoom remains responsive.
- [ ] Confirm the status reports the number of named street labels actually created.
- [ ] Check whether street labels are readable and do not obscure the entire scene.
- [ ] Switch between **Realistic 3D City** and **City Planning Model** without reloading data.
- [ ] Repeat with Mandalay or another preset.
- [ ] Change one coordinate and confirm the preset changes to **Custom bounding box**.

## D. Bounds and invalid inputs

- [ ] Try south greater than north; expect an invalid-area message.
- [ ] Try west greater than east; expect an invalid-area message.
- [ ] Try a box wider than 0.03°; expect an area-too-large message.
- [ ] Confirm ordinary preset boxes stay within the supported bounds.

## E. Cache and fallback

- [ ] Load an area successfully once, then reload the same area while the OSM proxy is unavailable if this can be tested safely.
- [ ] Confirm the exact-area cache is identified as cached data and its approximate age is shown.
- [ ] Confirm a failed live request with no cache switches to the synthetic demo.
- [ ] Confirm the UI clearly states that demo buildings and roads are synthetic, not real OSM data.
- [ ] Confirm **Load Offline Demo City** works independently of the live data service.

## F. Serverless proxy

- [ ] Verify a valid small GET request returns JSON containing an `elements` array.
- [ ] Verify an invalid or reversed bounding box returns HTTP 400.
- [ ] Verify an oversized box returns HTTP 413.
- [ ] Verify non-GET requests return HTTP 405.
- [ ] If all Overpass mirrors fail, verify the proxy returns HTTP 502 with a readable error.
- [ ] Do not treat a temporary Overpass outage as proof the frontend is broken.

## G. Release record

Record after testing:

- Tested commit:
- Production deploy URL:
- Device/browser:
- Area tested:
- OSM elements returned:
- Buildings rendered:
- Road ways rendered:
- Street labels rendered:
- Style switching:
- Cache/fallback:
- Issues found:
- Final result: PASS / FAIL / NOT TESTED

## Current known deployment state (2026-10-12)

- Latest verified source update at the time of this record: `874c3aefdbc80b346f01f1e21ad069818e07c00e` (road geometry batching for mobile performance).
- Netlify skipped that deploy because account credits were exhausted.
- Production remained on `b18d9a26d2ffbff5158af8156df7a76ba40c5cd8`.
- The latest street-label size and label-count status update must be verified after credits resume.
