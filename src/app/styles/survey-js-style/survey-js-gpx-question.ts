/**
 * GPX custom SurveyJS question widget — Angular/Capacitor mobile port.
 *
 * Mirrors the runtime behaviour of `7_gpxQuestionWidget.js` from the
 * sh-shp-survey_js plugin (CMS v1.4.11, UX polish v1.5.0). The mobile
 * app is client-only — no SurveyJS Creator / admin — so everything
 * that touched the Creator has been intentionally dropped:
 *   - toolbox icon registration (`SvgRegistry`)
 *   - Creator localization (`SurveyCreator.editorLocalization`)
 *   - the design-mode local-only upload branch
 *   - the `sampledPointCount` property-panel no-op hook
 *
 * The participant-facing surface is identical: pick a `.gpx`, parse it
 * locally, show a Leaflet/OSM preview with Start/End markers, eagerly
 * upload the raw file, and persist both the parsed payload and the
 * sibling `<answer>_file` metadata.
 *
 * Question type
 * -------------
 *   - registered class name: `gpx` (lowercased — SurveyJS lowercases
 *     every class name internally, so `getType()` returns `"gpx"`)
 *   - inherits from `empty`, NOT `file`. Extending `file` renders
 *     SurveyJS' native upload UI on top of the widget and routes the
 *     file through the generic "upload on complete" path — exactly the
 *     flow this question bypasses. Same reasoning as the `video`
 *     question; see `survey-js-video-question.ts`.
 *
 * Value contract (unchanged from the plugin, so the dashboard and the
 * `gpxMap` style consume mobile answers without special-casing)
 * -------------------------------------------------------------
 *   main value:
 *     {
 *       name, time, totalDistanceKm, elevationGainM, elevationLossM,
 *       estimatedHikingTimeHours, estimatedBikingTimeHours,
 *       start: { lat, lon, ele, distanceFromStartM },
 *       end:   { lat, lon, ele, distanceFromStartM },
 *       pointCountOriginal, sampledPointCount,
 *       sampledPoints: [[lat, lon, ele, distFromStartM], ...]
 *     }
 *
 *   "<effectiveName>_file" value (single-item array, matching the shape
 *   the generic upload path produces):
 *     [{ name, type: "application/gpx+xml", content: "?file_path=..." }]
 *
 * Upload endpoint
 * ---------------
 * The plugin POSTs to `window.location.href` because the survey runs
 * on the SelfHelp page itself. Mobile has no such page, so the widget
 * takes a `getUploadUrl()` resolver — called lazily so a server switch
 * from the dev menu is picked up without re-registering the widget —
 * and posts with `credentials: 'include'`, matching the existing
 * `uploadFiles()` path in `SurveyJSStyleComponent`.
 */

import * as SurveyCore from 'survey-core';
import { destroyRoute, renderRoute, GpxSamplePoint } from './gpx-leaflet';

const COMPONENT_NAME = 'gpx';
const COMPONENT_TITLE = 'GPX Route';

/** Great-circle radius used by the haversine distance. */
const EARTH_RADIUS_M = 6371000;

/** Fallback when `sampledPointCount` is unset or nonsensical. */
const DEFAULT_SAMPLED_POINT_COUNT = 100;

/** One parsed `<trkpt>`, with cumulative distance filled in afterwards. */
interface GpxTrackPoint {
    lat: number;
    lon: number;
    ele: number;
    distanceFromStartM?: number;
}

/** Intermediate result of `parseGpx` — pre-downsampling. */
interface ParsedGpx {
    name: string | null;
    time: string | null;
    points: GpxTrackPoint[];
    totalDistanceM: number;
    elevationGainM: number;
    elevationLossM: number;
}

/** An endpoint of the route as persisted in the answer. */
interface GpxEndpoint {
    lat: number;
    lon: number;
    ele: number;
    distanceFromStartM: number;
}

/** The question's main answer value. */
interface GpxQuestionValue {
    name: string | null;
    time: string | null;
    totalDistanceKm: number;
    elevationGainM: number;
    elevationLossM: number;
    estimatedHikingTimeHours: number;
    estimatedBikingTimeHours: number;
    start: GpxEndpoint;
    end: GpxEndpoint;
    pointCountOriginal: number;
    sampledPointCount: number;
    sampledPoints: GpxSamplePoint[];
}

/** The sibling `<name>_file` metadata entry. */
interface GpxFileMeta {
    name: string;
    type: string;
    content: string;
}

/**
 * Built-in localized fallbacks for the action-button labels, used when
 * the designer hasn't filled in `chooseFileButtonText` /
 * `clearButtonText` for the active locale via the Creator's
 * Translation tab. Keys are SurveyJS locale codes; add an entry to
 * extend the list — no other code change required.
 */
const DEFAULT_BUTTON_LABELS: Record<string, { choose: string; clear: string }> = {
    'default': { choose: 'Choose GPX file', clear: 'Clear' },
    'en': { choose: 'Choose GPX file', clear: 'Clear' },
    'de': { choose: 'GPX-Datei wählen', clear: 'Löschen' },
    'fr': { choose: 'Choisir un fichier GPX', clear: 'Effacer' },
    'it': { choose: 'Scegli file GPX', clear: 'Cancella' }
};

/**
 * Localized status / error strings. The plugin hardcodes these in
 * English; mobile surveys are routinely multilingual, so the same
 * locale table the buttons use is applied to the messages too.
 */
const DEFAULT_MESSAGES: Record<string, Record<string, string>> = {
    'default': {
        parsing: 'Parsing GPX…',
        uploading: 'Uploading GPX…',
        wrongType: 'Only .gpx files are accepted.',
        unreadable: 'Could not read the file.',
        invalid: 'The file is not a valid GPX track (no track points found).',
        uploadFailed: 'Upload failed',
        route: 'GPX route'
    },
    'de': {
        parsing: 'GPX wird gelesen…',
        uploading: 'GPX wird hochgeladen…',
        wrongType: 'Es werden nur .gpx-Dateien akzeptiert.',
        unreadable: 'Die Datei konnte nicht gelesen werden.',
        invalid: 'Die Datei ist kein gültiger GPX-Track (keine Trackpunkte gefunden).',
        uploadFailed: 'Hochladen fehlgeschlagen',
        route: 'GPX-Route'
    },
    'fr': {
        parsing: 'Analyse du GPX…',
        uploading: 'Téléversement du GPX…',
        wrongType: 'Seuls les fichiers .gpx sont acceptés.',
        unreadable: 'Impossible de lire le fichier.',
        invalid: "Le fichier n'est pas une trace GPX valide (aucun point trouvé).",
        uploadFailed: 'Échec du téléversement',
        route: 'Itinéraire GPX'
    },
    'it': {
        parsing: 'Analisi del GPX…',
        uploading: 'Caricamento del GPX…',
        wrongType: 'Sono accettati solo file .gpx.',
        unreadable: 'Impossibile leggere il file.',
        invalid: 'Il file non è una traccia GPX valida (nessun punto trovato).',
        uploadFailed: 'Caricamento non riuscito',
        route: 'Percorso GPX'
    }
};

/**
 * Inline button icons. Shipped inline rather than through the
 * Creator's SvgRegistry (which only exists in the Creator) so they
 * render in the app with no extra asset request, and inherit the
 * button's text colour via `currentColor`.
 */
const GPX_UPLOAD_ICON_SVG =
    '<svg class="sjs-gpx__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M12 3a1 1 0 0 1 .707.293l5 5a1 1 0 0 1-1.414 1.414L13 6.414V15a1 1 0 1 1-2 0V6.414L7.707 9.707a1 1 0 0 1-1.414-1.414l5-5A1 1 0 0 1 12 3zM5 17a1 1 0 0 1 1 1v1c0 .551.449 1 1 1h10c.551 0 1-.449 1-1v-1a1 1 0 1 1 2 0v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1a1 1 0 0 1 1-1z"/>' +
    '</svg>';

const GPX_CLEAR_ICON_SVG =
    '<svg class="sjs-gpx__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M9 3a1 1 0 0 0-1 1v1H5a1 1 0 1 0 0 2h.094l.852 12.142A2 2 0 0 0 7.94 21h8.118a2 2 0 0 0 1.994-1.858L18.906 7H19a1 1 0 1 0 0-2h-3V4a1 1 0 0 0-1-1H9zm1 2h4v0h-4V5zM7.099 7h9.802l-.842 12H7.941L7.099 7zM10 9a1 1 0 0 0-1 1v7a1 1 0 1 0 2 0v-7a1 1 0 0 0-1-1zm4 0a1 1 0 0 0-1 1v7a1 1 0 1 0 2 0v-7a1 1 0 0 0-1-1z"/>' +
    '</svg>';

/* -------------------------------------------------------------------
 * Localization helpers
 * ---------------------------------------------------------------- */

/**
 * Resolve the visible label / tooltip for one of the action buttons.
 *
 * Resolution order:
 *   1. SurveyJS-resolved per-locale string (the properties are
 *      registered `isLocalizable: true`, so the getter already returns
 *      the entry for `survey.locale`).
 *   2. Built-in `DEFAULT_BUTTON_LABELS[survey.locale]` backstop.
 *   3. English default.
 */
function getButtonLabel(question: any, kind: 'choose' | 'clear'): string {
    const propName = kind === 'clear' ? 'clearButtonText' : 'chooseFileButtonText';
    const custom = question && question[propName];
    if (typeof custom === 'string' && custom.trim()) {
        return custom;
    }
    const locale = (question && question.survey && question.survey.locale) || '';
    const byLocale = locale ? DEFAULT_BUTTON_LABELS[locale] : undefined;
    if (byLocale && byLocale[kind]) return byLocale[kind];
    return DEFAULT_BUTTON_LABELS['default'][kind];
}

/** Resolve a status/error message for the question's active locale. */
function getMessage(question: any, key: string): string {
    const locale = (question && question.survey && question.survey.locale) || '';
    const table = (locale && DEFAULT_MESSAGES[locale]) || DEFAULT_MESSAGES['default'];
    return table[key] ?? DEFAULT_MESSAGES['default'][key] ?? '';
}

/* -------------------------------------------------------------------
 * GPX parsing
 * ---------------------------------------------------------------- */

function toRadians(deg: number): number {
    return (deg * Math.PI) / 180;
}

/** Haversine distance in metres between two (lat, lon) pairs. */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_M * c;
}

/**
 * Parse a GPX XML string into track points, flattening across every
 * `<trk>` / `<trkseg>` in document order.
 *
 * Returns null when the file is structurally invalid (unparseable, a
 * `<parsererror>` root, a non-`gpx` document element) or carries no
 * usable `<trkpt>` — the caller surfaces that as a question error.
 */
function parseGpx(xmlString: string): ParsedGpx | null {
    if (typeof xmlString !== 'string' || !xmlString.trim()) return null;

    let doc: Document;
    try {
        doc = new DOMParser().parseFromString(xmlString, 'application/xml');
    } catch (e) {
        return null;
    }
    if (!doc) return null;
    // DOMParser signals XML errors as a <parsererror> element.
    if (doc.getElementsByTagName('parsererror').length > 0) return null;

    const root = doc.documentElement;
    if (!root || root.nodeName.toLowerCase() !== 'gpx') return null;

    const trkpts = doc.getElementsByTagName('trkpt');
    if (!trkpts || trkpts.length === 0) return null;

    const points: GpxTrackPoint[] = [];
    for (let i = 0; i < trkpts.length; i++) {
        const pt = trkpts[i];
        const lat = parseFloat(pt.getAttribute('lat') || '');
        const lon = parseFloat(pt.getAttribute('lon') || '');
        if (!isFinite(lat) || !isFinite(lon)) continue;
        const eleNode = pt.getElementsByTagName('ele')[0];
        let ele = eleNode ? parseFloat(eleNode.textContent || '') : NaN;
        if (!isFinite(ele)) ele = 0;
        points.push({ lat, lon, ele });
    }
    if (points.length === 0) return null;

    const nameNode = doc.querySelector('gpx > metadata > name') ||
        doc.querySelector('gpx > trk > name');
    const timeNode = doc.querySelector('gpx > metadata > time');
    const name = nameNode ? (nameNode.textContent || '').trim() || null : null;
    const time = timeNode ? (timeNode.textContent || '').trim() || null : null;

    // Cumulative distance + elevation gain / loss.
    let totalDistanceM = 0;
    let elevationGainM = 0;
    let elevationLossM = 0;
    points[0].distanceFromStartM = 0;
    for (let j = 1; j < points.length; j++) {
        totalDistanceM += haversine(
            points[j - 1].lat, points[j - 1].lon,
            points[j].lat, points[j].lon
        );
        points[j].distanceFromStartM = totalDistanceM;

        const dEle = points[j].ele - points[j - 1].ele;
        if (dEle > 0) elevationGainM += dEle;
        else if (dEle < 0) elevationLossM += -dEle;
    }

    return { name, time, points, totalDistanceM, elevationGainM, elevationLossM };
}

/**
 * Evenly-spaced index sampling. Index `k` in `[0, n-1]` maps to
 * `round(k * (total-1) / (n-1))`, which always includes the first and
 * last point. `n` is clamped to `[2, total]`.
 */
function sampleIndices(total: number, n: number): number[] {
    if (n < 2) n = 2;
    if (n > total) n = total;
    if (total <= n) {
        const all: number[] = [];
        for (let i = 0; i < total; i++) all.push(i);
        return all;
    }
    const indices: number[] = [];
    for (let k = 0; k < n; k++) {
        indices.push(Math.round((k * (total - 1)) / (n - 1)));
    }
    return indices;
}

/** Round to 6 decimals (lat/lon). */
function r6(v: number): number {
    return isFinite(v) ? Math.round(v * 1e6) / 1e6 : 0;
}

/** Round to 2 decimals (kilometres). */
function r2(v: number): number {
    return isFinite(v) ? Math.round(v * 100) / 100 : 0;
}

/** Round to 1 decimal (hour estimates). */
function r1(v: number): number {
    return isFinite(v) ? Math.round(v * 10) / 10 : 0;
}

/** Round to an integer (metres). */
function ri(v: number): number {
    return isFinite(v) ? Math.round(v) : 0;
}

/**
 * Build the persisted payload for a parsed GPX.
 *
 * Hiking time uses a Naismith-style estimate — 5 km/h on the flat plus
 * one hour per 600 m climbed. Biking assumes a flat 15 km/h. Both
 * match the plugin so mobile and web answers stay comparable.
 */
function buildPayload(parsed: ParsedGpx, sampledCount: number): GpxQuestionValue {
    const pts = parsed.points;
    const totalKm = parsed.totalDistanceM / 1000;
    const estimatedHikingTimeHours = totalKm / 5.0 + parsed.elevationGainM / 600;
    const estimatedBikingTimeHours = totalKm / 15.0;

    const sampledPoints = sampleIndices(pts.length, sampledCount).map((i) => {
        const p = pts[i];
        return [r6(p.lat), r6(p.lon), ri(p.ele), ri(p.distanceFromStartM ?? 0)] as GpxSamplePoint;
    });

    const first = pts[0];
    const last = pts[pts.length - 1];

    return {
        name: parsed.name,
        time: parsed.time,
        totalDistanceKm: r2(totalKm),
        elevationGainM: ri(parsed.elevationGainM),
        elevationLossM: ri(parsed.elevationLossM),
        estimatedHikingTimeHours: r1(estimatedHikingTimeHours),
        estimatedBikingTimeHours: r1(estimatedBikingTimeHours),
        start: {
            lat: r6(first.lat),
            lon: r6(first.lon),
            ele: ri(first.ele),
            distanceFromStartM: 0
        },
        end: {
            lat: r6(last.lat),
            lon: r6(last.lon),
            ele: ri(last.ele),
            distanceFromStartM: ri(last.distanceFromStartM ?? 0)
        },
        pointCountOriginal: pts.length,
        sampledPointCount: sampledPoints.length,
        sampledPoints
    };
}

/* -------------------------------------------------------------------
 * Answer-field addressing
 * ---------------------------------------------------------------- */

/**
 * The field name SurveyJS stores the answer under: `valueName` when
 * set, otherwise `name`.
 */
function getEffectiveName(question: any): string {
    if (!question) return '';
    if (typeof question.valueName === 'string' && question.valueName) {
        return question.valueName;
    }
    return question.name || '';
}

/** The sibling file-metadata field, always `<effectiveName>_file`. */
function getFileFieldName(question: any): string {
    const base = getEffectiveName(question);
    return base ? base + '_file' : '';
}

/**
 * Write the file metadata to the sibling question when the survey JSON
 * declares one, otherwise straight into the survey's data hash so the
 * value still survives the next save.
 */
function setFileFieldValue(question: any, value: GpxFileMeta[] | undefined): void {
    const fileField = getFileFieldName(question);
    if (!fileField) return;
    const survey = question.survey;
    if (!survey) return;

    const siblingQ = typeof survey.getQuestionByName === 'function'
        ? survey.getQuestionByName(fileField) : null;
    if (siblingQ) {
        siblingQ.value = value;
        return;
    }
    if (value === undefined || value === null) {
        if (typeof survey.clearValue === 'function') survey.clearValue(fileField);
    } else if (typeof survey.setValue === 'function') {
        survey.setValue(fileField, value);
    }
}

/** Read the sibling file-metadata value, wherever it lives. */
function getFileFieldValue(question: any): GpxFileMeta[] | null {
    const fileField = getFileFieldName(question);
    if (!fileField) return null;
    const survey = question.survey;
    if (!survey) return null;

    const siblingQ = typeof survey.getQuestionByName === 'function'
        ? survey.getQuestionByName(fileField) : null;
    if (siblingQ) return siblingQ.value;
    if (typeof survey.getValue === 'function') return survey.getValue(fileField);
    return null;
}

/* -------------------------------------------------------------------
 * Server upload / delete
 * ---------------------------------------------------------------- */

/**
 * POST the raw `.gpx` to the SelfHelp survey runtime controller.
 * Resolves to the saved `?file_path=…` URL.
 *
 * Unlike the plugin (which posts to `window.location.href`), mobile
 * posts to the resolved API endpoint with `credentials: 'include'`,
 * matching `SurveyJSStyleComponent.uploadFiles()`.
 */
function uploadGpxToServer(file: File, question: any, uploadUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const survey = question && question.survey;
        const responseId = survey && survey.data ? survey.data.response_id : null;
        const effectiveName = getEffectiveName(question);
        if (!responseId || !effectiveName) {
            reject(new Error('Survey response not initialised yet'));
            return;
        }
        if (!uploadUrl) {
            reject(new Error('Upload endpoint is not configured'));
            return;
        }

        const fd = new FormData();
        fd.append('upload_gpx', '1');
        fd.append('response_id', responseId);
        fd.append('question_name', effectiveName);
        fd.append(file.name, file, file.name);

        fetch(uploadUrl, { method: 'POST', body: fd, credentials: 'include' })
            .then((res) => res.json())
            .then((data: any) => {
                if (!data || data.status === 'error') {
                    reject(new Error((data && data.error) || 'Upload failed'));
                    return;
                }
                const path = data[file.name];
                if (typeof path !== 'string' || !path) {
                    reject(new Error('Upload returned no file path'));
                    return;
                }
                resolve(path);
            })
            .catch(reject);
    });
}

/**
 * Ask the server to delete a previously-uploaded `.gpx`. Best-effort —
 * a failure here must never block the participant, so the promise
 * always resolves.
 */
function deleteGpxOnServer(filePath: string, uploadUrl: string): Promise<void> {
    if (!filePath || typeof filePath !== 'string' || !uploadUrl) return Promise.resolve();
    const marker = '?file_path=';
    const rel = filePath.indexOf(marker) === 0 ? filePath.substring(marker.length) : filePath;
    try {
        const fd = new FormData();
        fd.append('delete_gpx', '1');
        fd.append('file_path', rel);
        return fetch(uploadUrl, { method: 'POST', body: fd, credentials: 'include' })
            .then(() => { /* body ignored */ })
            .catch(() => { /* best-effort */ });
    } catch (e) {
        return Promise.resolve();
    }
}

/* -------------------------------------------------------------------
 * Stats panel
 * ---------------------------------------------------------------- */

function formatHours(h: number): string {
    if (!isFinite(h) || h <= 0) return '—';
    let whole = Math.floor(h);
    let mins = Math.round((h - whole) * 60);
    if (mins === 60) { whole += 1; mins = 0; }
    return whole + 'h ' + mins + 'min';
}

/**
 * Render a GPX metadata `<time>` as `DD-MM-YYYY` for display only —
 * the persisted `value.time` keeps the full ISO string so analysts
 * retain time-of-day and timezone.
 *
 * Falls back to an ISO-prefix match, then to the raw string, so a
 * malformed-but-recognisable timestamp still shows something the
 * participant can compare against their file.
 */
function formatGpxDate(value: string | null): string | null {
    if (value === null || value === undefined) return null;
    const str = String(value).trim();
    if (!str) return null;

    const date = new Date(str);
    if (!isNaN(date.getTime())) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        return dd + '-' + mm + '-' + String(date.getFullYear());
    }
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[3] + '-' + match[2] + '-' + match[1];
    return str;
}

function escapeHtml(s: unknown): string {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Draw the per-route summary table below the map. */
function renderStats(statsEl: HTMLElement | null, payload: GpxQuestionValue | null): void {
    if (!statsEl) return;
    if (!payload) { statsEl.innerHTML = ''; return; }

    const rows: { label: string; value: string }[] = [
        { label: 'Name', value: payload.name || '—' },
        { label: 'Time', value: formatGpxDate(payload.time) || '—' },
        { label: 'Distance', value: payload.totalDistanceKm + ' km' },
        { label: 'Elevation +', value: payload.elevationGainM + ' m' },
        { label: 'Elevation −', value: payload.elevationLossM + ' m' },
        { label: 'Hiking (est.)', value: formatHours(payload.estimatedHikingTimeHours) },
        { label: 'Biking (est.)', value: formatHours(payload.estimatedBikingTimeHours) },
        { label: 'Original pts.', value: String(payload.pointCountOriginal) },
        { label: 'Sampled pts.', value: String(payload.sampledPointCount) }
    ];

    let html = '<table class="sjs-gpx__stats-table"><tbody>';
    for (const row of rows) {
        html += '<tr><th>' + escapeHtml(row.label) + '</th><td>' + escapeHtml(row.value) + '</td></tr>';
    }
    statsEl.innerHTML = html + '</tbody></table>';
}

/* -------------------------------------------------------------------
 * Question-level errors
 * ---------------------------------------------------------------- */

/**
 * Attach a question-level error, tagged so we only ever clear our own
 * and leave errors set by other code paths intact.
 */
function setQuestionError(question: any, message: string): void {
    if (!question) return;
    clearQuestionError(question);
    const Survey: any = SurveyCore as any;
    try {
        if (typeof Survey.SurveyError === 'function' && typeof question.addError === 'function') {
            const err: any = new Survey.SurveyError(message, question);
            err.__fromGpxQuestion = true;
            question.addError(err);
        }
    } catch (e) { /* older builds may signal differently */ }
}

function clearQuestionError(question: any): void {
    if (!question || !Array.isArray(question.errors)) return;
    for (let i = question.errors.length - 1; i >= 0; i--) {
        if (question.errors[i] && question.errors[i].__fromGpxQuestion) {
            question.errors.splice(i, 1);
        }
    }
}

/* -------------------------------------------------------------------
 * Registration
 * ---------------------------------------------------------------- */

/**
 * Register the `gpx` SurveyJS question type and its custom widget on
 * the global `survey-core` singletons. Call once at app startup
 * (currently from `SurveyJSStyleComponent`'s constructor).
 *
 * @param getUploadUrl Function returning the absolute URL to POST the
 *                     `upload_gpx` / `delete_gpx` actions to. Resolved
 *                     lazily so a dev-menu server switch is picked up
 *                     without re-registering the widget.
 */
export function addGpxQuestionWidget(getUploadUrl: () => string): void {
    const Survey: any = SurveyCore as any;
    if (!Survey || !Survey.Serializer) return;

    if (!Survey.Serializer.findClass(COMPONENT_NAME)) {
        Survey.Serializer.addClass(
            COMPONENT_NAME,
            [
                {
                    name: 'sampledPointCount:number',
                    default: DEFAULT_SAMPLED_POINT_COUNT,
                    minValue: 2,
                    category: 'general',
                    displayName: 'Sampled point count'
                },
                {
                    // `isLocalizable: true` makes SurveyJS resolve the
                    // property against `survey.locale`, so a
                    // Translation-tab JSON authored in the CMS
                    // ({ default: "Choose…", de: "GPX-Datei…" })
                    // produces the right per-locale value on mobile.
                    name: 'chooseFileButtonText',
                    isLocalizable: true,
                    category: 'general',
                    displayName: '"Choose file" button label (optional, falls back to localized default)'
                },
                {
                    name: 'clearButtonText',
                    isLocalizable: true,
                    category: 'general',
                    displayName: '"Clear" button label (optional, falls back to localized default)'
                }
            ],
            null,
            'empty'
        );

        if (Survey.ElementFactory && Survey.ElementFactory.Instance &&
            typeof Survey.ElementFactory.Instance.registerCustomQuestion === 'function') {
            Survey.ElementFactory.Instance.registerCustomQuestion(COMPONENT_NAME);
        }
    }

    if (!Survey.CustomWidgetCollection ||
        !Survey.CustomWidgetCollection.Instance ||
        Survey.CustomWidgetCollection.Instance.getCustomWidgetByName(COMPONENT_NAME)) {
        return;
    }

    Survey.CustomWidgetCollection.Instance.addCustomWidget({
        name: COMPONENT_NAME,
        title: COMPONENT_TITLE,
        widgetIsLoaded: () => true,
        isFit: (question: any) => question.getType() === COMPONENT_NAME,
        activatedByChanged: () => { /* class registered above; nothing to do */ },

        htmlTemplate:
            '<div class="sjs-gpx">' +
                '<div class="sjs-gpx__controls">' +
                    '<label class="sjs-gpx__file-label">' +
                        '<span class="sjs-gpx__file-button" role="button" tabindex="0">' +
                            GPX_UPLOAD_ICON_SVG +
                            '<span class="sjs-gpx__btn-text"></span>' +
                        '</span>' +
                        '<input type="file" accept=".gpx,application/gpx+xml" class="sjs-gpx__input" />' +
                    '</label>' +
                    '<span class="sjs-gpx__current"></span>' +
                    '<button type="button" class="sjs-gpx__clear" hidden>' +
                        GPX_CLEAR_ICON_SVG +
                        '<span class="sjs-gpx__btn-text"></span>' +
                    '</button>' +
                '</div>' +
                '<div class="sjs-gpx__error" role="alert" hidden></div>' +
                '<div class="sjs-gpx__status" role="status" hidden></div>' +
                '<div class="sjs-gpx__preview">' +
                    '<div class="sjs-gpx__map"></div>' +
                    '<div class="sjs-gpx__stats"></div>' +
                '</div>' +
            '</div>',

        afterRender: (question: any, el: HTMLElement) => {
            const input = el.querySelector<HTMLInputElement>('.sjs-gpx__input');
            const current = el.querySelector<HTMLElement>('.sjs-gpx__current');
            const clearBtn = el.querySelector<HTMLButtonElement>('.sjs-gpx__clear');
            const fileBtn = el.querySelector<HTMLElement>('.sjs-gpx__file-button');
            const errorEl = el.querySelector<HTMLElement>('.sjs-gpx__error');
            const statusEl = el.querySelector<HTMLElement>('.sjs-gpx__status');
            const mapEl = el.querySelector<HTMLElement>('.sjs-gpx__map');
            const statsEl = el.querySelector<HTMLElement>('.sjs-gpx__stats');
            if (!input || !current || !clearBtn || !fileBtn || !errorEl || !statusEl) return;

            const fileBtnText = fileBtn.querySelector<HTMLElement>('.sjs-gpx__btn-text');
            const clearBtnText = clearBtn.querySelector<HTMLElement>('.sjs-gpx__btn-text');

            /** Apply localized labels + tooltips to the action buttons. */
            const applyButtonLabels = (): void => {
                const chooseLabel = getButtonLabel(question, 'choose');
                const clearLabel = getButtonLabel(question, 'clear');
                if (fileBtnText) fileBtnText.textContent = chooseLabel;
                if (clearBtnText) clearBtnText.textContent = clearLabel;
                fileBtn.setAttribute('title', chooseLabel);
                fileBtn.setAttribute('aria-label', chooseLabel);
                clearBtn.setAttribute('title', clearLabel);
                clearBtn.setAttribute('aria-label', clearLabel);
            };
            applyButtonLabels();

            // Re-apply on runtime locale changes (multilingual surveys
            // with a language switcher).
            const survey = question.survey;
            let localeHandler: (() => void) | null = null;
            if (survey && survey.onLocaleChanged && typeof survey.onLocaleChanged.add === 'function') {
                localeHandler = () => applyButtonLabels();
                survey.onLocaleChanged.add(localeHandler);
            }
            (el as any).__gpxLocaleHandler = localeHandler;

            // Enter / Space on the "choose" pseudo-button. The
            // label-wrapped <span> is tabbable but native click
            // synthesis only fires for <button> / <a>.
            const onFileBtnKeydown = (ev: KeyboardEvent): void => {
                if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
                    ev.preventDefault();
                    input.click();
                }
            };
            fileBtn.addEventListener('keydown', onFileBtnKeydown);

            const showError = (msg: string | null): void => {
                errorEl.textContent = msg || '';
                errorEl.hidden = !msg;
                if (msg) setQuestionError(question, msg);
                else clearQuestionError(question);
            };
            const showStatus = (msg: string | null): void => {
                statusEl.textContent = msg || '';
                statusEl.hidden = !msg;
            };

            /** Draw (or tear down) the map + stats + current-file label. */
            const renderFromPayload = (
                payload: GpxQuestionValue | null,
                fileMeta: { name?: string } | null
            ): void => {
                if (!payload) {
                    destroyRoute(mapEl);
                    if (statsEl) statsEl.innerHTML = '';
                    current.textContent = '';
                    clearBtn.hidden = true;
                    return;
                }
                renderRoute(mapEl, payload.sampledPoints);
                renderStats(statsEl, payload);
                if (fileMeta && fileMeta.name) {
                    current.textContent = fileMeta.name;
                } else if (payload.name) {
                    current.textContent = payload.name + ' (.gpx)';
                } else {
                    current.textContent = getMessage(question, 'route');
                }
                clearBtn.hidden = false;
            };

            /**
             * Render from the question's persisted value. Covers the
             * restore paths: a survey resumed from `last_response`, a
             * page change, or a logic action rewriting the answer.
             */
            const restoreFromValue = (): void => {
                const v = question.value as GpxQuestionValue | undefined;
                if (v && typeof v === 'object' && Array.isArray(v.sampledPoints) && v.sampledPoints.length > 0) {
                    const fileField = getFileFieldValue(question);
                    const fileMeta = Array.isArray(fileField) && fileField.length > 0 ? fileField[0] : null;
                    renderFromPayload(v, fileMeta);
                    showError(null);
                } else {
                    renderFromPayload(null, null);
                }
            };
            restoreFromValue();

            // File selection: validate extension, read, parse, upload,
            // then persist both fields and draw the preview.
            const onInputChange = (): void => {
                showError(null);
                showStatus(null);

                const file = input.files && input.files[0];
                if (!file) return;

                if (!/\.gpx$/.test((file.name || '').toLowerCase())) {
                    showError(getMessage(question, 'wrongType'));
                    input.value = '';
                    return;
                }

                showStatus(getMessage(question, 'parsing'));
                const reader = new FileReader();

                reader.onerror = () => {
                    showError(getMessage(question, 'unreadable'));
                    showStatus(null);
                    input.value = '';
                };

                reader.onload = () => {
                    const parsed = parseGpx(String(reader.result || ''));
                    if (!parsed) {
                        showError(getMessage(question, 'invalid'));
                        showStatus(null);
                        input.value = '';
                        return;
                    }

                    let n = parseInt(question.sampledPointCount, 10);
                    if (!isFinite(n) || n < 2) n = DEFAULT_SAMPLED_POINT_COUNT;
                    const payload = buildPayload(parsed, n);

                    const uploadUrl = getUploadUrl();

                    // Replace flow: drop the previous upload before
                    // sending the new one so disk usage doesn't grow
                    // with every replacement.
                    const prev = getFileFieldValue(question);
                    if (Array.isArray(prev) && prev.length > 0 && prev[0] && prev[0].content) {
                        deleteGpxOnServer(prev[0].content, uploadUrl);
                    }

                    showStatus(getMessage(question, 'uploading'));
                    uploadGpxToServer(file, question, uploadUrl)
                        .then((savedPath) => {
                            question.value = payload;
                            setFileFieldValue(question, [{
                                name: file.name,
                                type: file.type || 'application/gpx+xml',
                                content: savedPath
                            }]);
                            renderFromPayload(payload, { name: file.name });
                            showStatus(null);
                            input.value = '';
                        })
                        .catch((err: any) => {
                            const detail = err && err.message ? err.message : 'unknown error';
                            showError(getMessage(question, 'uploadFailed') + ': ' + detail);
                            showStatus(null);
                            input.value = '';
                        });
                };

                reader.readAsText(file);
            };
            input.addEventListener('change', onInputChange);

            // Clear: wipe both fields and delete the uploaded file.
            const onClearClick = (e: Event): void => {
                e.preventDefault();
                const prev = getFileFieldValue(question);
                if (Array.isArray(prev) && prev.length > 0 && prev[0] && prev[0].content) {
                    deleteGpxOnServer(prev[0].content, getUploadUrl());
                }
                question.clearValue();
                setFileFieldValue(question, undefined);
                renderFromPayload(null, null);
                showError(null);
                showStatus(null);
                input.value = '';
            };
            clearBtn.addEventListener('click', onClearClick);

            // Read-only surveys must not offer the actions.
            const applyReadOnly = (): void => {
                const ro = !!question.isReadOnly;
                input.disabled = ro;
                fileBtn.style.display = ro ? 'none' : '';
                if (ro) clearBtn.hidden = true;
                else if (question.value) clearBtn.hidden = false;
            };
            applyReadOnly();
            question.readOnlyChangedCallback = applyReadOnly;

            // External value changes refresh the preview.
            question.valueChangedCallback = () => restoreFromValue();

            // Keep the listeners so willUnmount can detach them.
            (el as any).__gpxDetach = () => {
                fileBtn.removeEventListener('keydown', onFileBtnKeydown);
                input.removeEventListener('change', onInputChange);
                clearBtn.removeEventListener('click', onClearClick);
            };
        },

        willUnmount: (question: any, el: HTMLElement) => {
            if (!el || typeof el.querySelector !== 'function') return;

            destroyRoute(el.querySelector<HTMLElement>('.sjs-gpx__map'));

            try {
                const detach = (el as any).__gpxDetach;
                if (typeof detach === 'function') detach();
                (el as any).__gpxDetach = null;
            } catch (e) { /* best-effort cleanup */ }

            // Drop the survey-level locale listener so we don't leak
            // callbacks across page changes / question rebuilds.
            try {
                const survey = question && question.survey;
                const handler = (el as any).__gpxLocaleHandler;
                if (handler && survey && survey.onLocaleChanged &&
                    typeof survey.onLocaleChanged.remove === 'function') {
                    survey.onLocaleChanged.remove(handler);
                }
                (el as any).__gpxLocaleHandler = null;
            } catch (e) { /* ignore */ }

            if (question) {
                try {
                    question.valueChangedCallback = null;
                    question.readOnlyChangedCallback = null;
                } catch (e) { /* ignore */ }
            }
        }
    }, 'customtype');
}
