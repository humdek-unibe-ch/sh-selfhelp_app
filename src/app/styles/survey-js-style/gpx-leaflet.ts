/**
 * Shared Leaflet helpers for the GPX features — Angular/Capacitor port.
 *
 * Two consumers share this module:
 *   - `survey-js-gpx-question.ts` — the `gpx` SurveyJS question's live
 *     preview (plugin `7_gpxQuestionWidget.js`).
 *   - `gpx-map-style` — the standalone `gpxMap` SelfHelp style
 *     (plugin `gpxMap/js/gpx-map.js`).
 *
 * Both draw the SAME visual contract (OSM basemap, blue polyline,
 * Start/End markers, fitBounds with 20px padding), so the drawing code
 * lives here once rather than being duplicated the way the plugin has
 * to duplicate it across two script tags.
 *
 * Marker icons
 * ------------
 * The plugin vendors `leaflet.css` next to a sibling `images/` folder
 * so Leaflet's default `url(images/marker-icon.png)` references resolve
 * on disk. Here the CSS comes from node_modules via angular.json, so
 * that relative lookup misses and markers render blank. The PNGs are
 * copied to `assets/leaflet/` by the same angular.json assets block,
 * and pinned onto `L.Icon.Default` below.
 */

import * as L from 'leaflet';

/** Where angular.json copies Leaflet's marker images. */
const MARKER_ASSET_PATH = 'assets/leaflet/';

/** Polyline appearance — matches the plugin's preview exactly. */
const ROUTE_COLOR = '#2563eb';
const ROUTE_WEIGHT = 4;
const ROUTE_OPACITY = 0.85;

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

let iconDefaultsPatched = false;

/**
 * Point Leaflet's default marker icon at the bundled PNGs. Idempotent —
 * safe to call from every map creation.
 */
function ensureDefaultIcon(): void {
    if (iconDefaultsPatched) return;
    iconDefaultsPatched = true;
    try {
        // `_getIconUrl` derives paths from the CSS; deleting it stops
        // Leaflet second-guessing the explicit URLs we set below.
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: MARKER_ASSET_PATH + 'marker-icon-2x.png',
            iconUrl: MARKER_ASSET_PATH + 'marker-icon.png',
            shadowUrl: MARKER_ASSET_PATH + 'marker-shadow.png'
        });
    } catch (e) { /* fall back to Leaflet's own resolution */ }
}

/**
 * A single route point. Index 0/1 are latitude/longitude; the optional
 * 2/3 slots carry elevation (m) and cumulative distance from the start
 * (m). Only lat/lon are needed for drawing.
 */
export type GpxSamplePoint = [number, number, number?, number?];

/**
 * Coerce whatever a caller hands us into a well-formed point array.
 *
 * Mirrors `extractSampledPoints()` from the plugin's `gpx-map.js` and
 * accepts the same three shapes, because the `gpxMap` style's
 * `sample_points` field is documented to allow all of them:
 *
 *   1. Bare array:  [[lat, lon], [lat, lon, ele, distM], …]
 *   2. Answer object: { name, time, sampledPoints: [...], … } — the
 *      persisted shape of a `gpx` question answer, so a designer can
 *      interpolate a whole answer row via {{gpx_route}}.
 *   3. A JSON string of either of the above, null, or empty.
 *
 * Malformed entries (nulls, short tuples, non-finite coordinates) are
 * dropped rather than thrown on, so one bad row cannot break the map.
 */
export function extractSampledPoints(raw: any): GpxSamplePoint[] {
    if (raw === null || raw === undefined || raw === '') return [];

    let value = raw;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
            value = JSON.parse(trimmed);
        } catch (e) {
            return [];
        }
    }

    const isPoint = (p: any): boolean =>
        Array.isArray(p) && p.length >= 2 && isFinite(p[0]) && isFinite(p[1]);

    if (Array.isArray(value)) {
        return value.filter(isPoint) as GpxSamplePoint[];
    }
    if (value && typeof value === 'object' && Array.isArray(value.sampledPoints)) {
        return value.sampledPoints.filter(isPoint) as GpxSamplePoint[];
    }
    return [];
}

/**
 * Tear down a Leaflet map previously created by `renderRoute` on this
 * element. Safe to call on an element that never had one.
 */
export function destroyRoute(mapEl: HTMLElement | null): void {
    if (!mapEl) return;
    const existing = (mapEl as any).__gpxLeafletMap;
    if (existing && typeof existing.remove === 'function') {
        try { existing.remove(); } catch (e) { /* already detached */ }
    }
    (mapEl as any).__gpxLeafletMap = null;
}

/**
 * Draw a route on `mapEl`: OSM basemap, blue polyline through every
 * point, Start / End markers, framed with `fitBounds`.
 *
 * Any map previously mounted on the element is removed first, so this
 * is safe to call repeatedly (value changes, locale switches, a logic
 * action swapping the data).
 *
 * @param mapEl  Container element. Must be in the DOM.
 * @param points Route points; nothing is drawn when empty.
 */
export function renderRoute(mapEl: HTMLElement | null, points: GpxSamplePoint[]): void {
    if (!mapEl) return;

    destroyRoute(mapEl);
    if (!points || points.length === 0) return;

    ensureDefaultIcon();

    // Leaflet refuses to mount on a zero-height element. The CSS pins a
    // height, but be defensive in case a host override stripped it.
    if (!mapEl.style.height && !mapEl.offsetHeight) {
        mapEl.style.height = '300px';
    }

    const coords: L.LatLngExpression[] = points.map((p) => [p[0], p[1]] as [number, number]);

    const map = L.map(mapEl, {
        scrollWheelZoom: false,
        // Touch devices: let a one-finger drag scroll the page instead
        // of panning the map, which would otherwise trap the gesture
        // mid-survey. Two-finger drag still pans.
        dragging: !L.Browser.mobile
    });

    L.tileLayer(OSM_TILE_URL, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(map);

    const polyline = L.polyline(coords, {
        color: ROUTE_COLOR,
        weight: ROUTE_WEIGHT,
        opacity: ROUTE_OPACITY
    }).addTo(map);

    L.marker(coords[0]).addTo(map).bindTooltip('Start');
    L.marker(coords[coords.length - 1]).addTo(map).bindTooltip('End');

    try {
        map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    } catch (e) {
        map.setView(coords[0], 13);
    }

    (mapEl as any).__gpxLeafletMap = map;

    // Leaflet mis-measures when the container becomes visible after
    // construction (inside an Ionic page transition, an accordion, or a
    // survey page change). One deferred invalidate catches that.
    setTimeout(() => {
        try { map.invalidateSize(); } catch (e) { /* removed already */ }
    }, 100);
}
