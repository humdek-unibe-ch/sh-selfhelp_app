/**
 * Video custom SurveyJS question widget — Angular/Capacitor mobile port.
 *
 * Mirrors the runtime behaviour of `5_videoSegmentWidget.js` from the
 * sh-shp-survey_js plugin (CMS v1.4.8). The mobile app is client-only —
 * no SurveyJS Creator / admin — so anything that touched the Creator
 * (toolbox icon registration, Creator localization, live property-panel
 * preview hooks) has been intentionally dropped. The runtime
 * surface — segment-clamped playback, watch tracking, required-watch
 * gating, root-relative URL resolution, autoStart and the localized
 * required-watch alert — is identical.
 *
 * Question type
 * -------------
 *   - registered class name: `video` (lowercased — SurveyJS lowercases
 *     every class name internally; `Question.getType()` therefore
 *     returns `"video"`)
 *   - inherits from `empty`, NOT `image`. Extending `image` made the
 *     image renderer take over and bypass our custom widget — see the
 *     header of the plugin file for the gory details. The custom
 *     widget's `htmlTemplate` is the sole renderer.
 *
 * URL resolution
 * --------------
 *   - http:// / https:// / data: / blob: / //cdn.example.com → unchanged
 *   - /assets/foo.mp4 → "<API_ENDPOINT_NATIVE>/assets/foo.mp4"
 *   - assets/foo.mp4 (page-relative) → unchanged
 *
 *   The API endpoint is resolved lazily through the function passed to
 *   `addVideoQuestionWidget(getApiEndpoint)` — calling it lazily means
 *   server switches done from the dev menu after the widget has been
 *   registered are picked up automatically.
 *
 * Question value snapshot
 * -----------------------
 *   {
 *     watched, currentTime, startTimestamp, endTimestamp, duration,
 *     watchedSeconds, percentWatched, startedAt, lastUpdatedAt,
 *     lastEvent, completedAt
 *   }
 *
 *   `watched` only flips to `true` once `currentTime >= end - 0.05`,
 *   where `end` is the configured `endTimestamp` (capped at the file's
 *   real duration on `loadedmetadata`) or the file's natural duration
 *   when `endTimestamp` is unset. Required questions block survey
 *   navigation/completion until `watched === true`.
 */

import * as SurveyCore from 'survey-core';

const COMPONENT_NAME = 'video';
const COMPONENT_TITLE = 'Video';

interface VideoQuestionValue {
    watched: boolean;
    currentTime: number;
    startTimestamp: number;
    endTimestamp: number | null;
    duration: number | null;
    watchedSeconds: number;
    percentWatched: number;
    startedAt: string | null;
    lastUpdatedAt: string | null;
    lastEvent: 'play' | 'pause' | 'seek' | 'ended' | 'clamp';
    completedAt: string | null;
}

/**
 * Built-in localized fallbacks for the required-watch alert. Used when
 * the survey designer hasn't filled in `requiredWatchMessage` for the
 * active locale via the Creator's Translation tab. Keys are SurveyJS
 * locale codes; add a new entry to extend the supported locale list —
 * no other code change required.
 */
const DEFAULT_REQUIRED_WATCH_MESSAGES: Record<string, string> = {
    'default': 'Please watch the video to the end before continuing.',
    'en': 'Please watch the video to the end before continuing.',
    'de': 'Bitte sehen Sie sich das Video bis zum Ende an, bevor Sie fortfahren.',
    'fr': 'Veuillez regarder la vidéo jusqu\'à la fin avant de continuer.',
    'it': 'Si prega di guardare il video fino alla fine prima di continuare.'
};

/**
 * Coerce arbitrary input into a finite non-negative number, or null.
 * Used to normalize the `startTimestamp` / `endTimestamp` properties
 * which the property panel may store as numbers, strings or empty.
 */
function parseSeconds(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return isFinite(value) ? value : null;
    const parsed = parseFloat(String(value));
    return isFinite(parsed) ? parsed : null;
}

/**
 * Resolve a (possibly relative) videoUrl against the mobile app's API
 * endpoint. Mirrors `resolveVideoUrl()` from the plugin but uses the
 * Angular/Capacitor `getApiEndpoint()` instead of `window.SELFHELP_BASE_PATH`.
 */
function resolveVideoUrl(rawUrl: string, getApiEndpoint: () => string): string {
    if (typeof rawUrl !== 'string') return rawUrl;
    const url = rawUrl.trim();
    if (!url) return url;
    // Absolute URL ("http:", "https:", "data:", "blob:", "file:", ...)
    if (/^[a-z][a-z0-9+.\-]*:/i.test(url)) return url;
    // Protocol-relative ("//cdn.example.com/...")
    if (url.indexOf('//') === 0) return url;
    // Root-relative — prefix with API endpoint (e.g. "https://cms.example.com")
    if (url.charAt(0) === '/') {
        const basePath = (getApiEndpoint() || '').replace(/\/+$/, '');
        if (!basePath) return url;
        if (url === basePath || url.indexOf(basePath + '/') === 0) {
            return url;
        }
        return basePath + url;
    }
    // Page-relative — leave alone, browser resolves against the document URL.
    return url;
}

/**
 * Validate the configuration of a video question. URL is the only
 * mandatory field. Both timestamps are optional; an unset (or 0)
 * `endTimestamp` means "play the full file"; an unset (or 0)
 * `startTimestamp` means "start at 0". Cross-field rule
 * `start < end` only applies when BOTH are concrete numbers > 0.
 */
function getConfigError(question: any): string | null {
    const url = question.videoUrl;
    if (!url || (typeof url === 'string' && !url.trim())) {
        return 'Video URL is required';
    }
    const start = parseSeconds(question.startTimestamp);
    const end = parseSeconds(question.endTimestamp);
    if (start !== null && start < 0) {
        return 'startTimestamp must be greater than or equal to 0';
    }
    if (end !== null && end < 0) {
        return 'endTimestamp must be greater than or equal to 0';
    }
    const isMeaningful = (n: number | null) => n !== null && n > 0;
    if (isMeaningful(start) && isMeaningful(end) && (start as number) >= (end as number)) {
        return 'startTimestamp must be strictly less than endTimestamp';
    }
    return null;
}

/**
 * Resolve the required-watch alert message for a video question.
 *
 * Resolution order:
 *   1. SurveyJS-resolved per-locale string (the property is registered
 *      with `isLocalizable: true`, so `question.requiredWatchMessage`
 *      returns the entry for `survey.locale`, falling back to the
 *      `default` locale entry, or `""` when neither is set).
 *   2. Built-in `DEFAULT_REQUIRED_WATCH_MESSAGES[survey.locale]`
 *      backstop (en/de/fr/it bundled).
 *   3. English default.
 */
function getRequiredWatchMessage(question: any): string {
    const custom = question && question.requiredWatchMessage;
    if (typeof custom === 'string' && custom.trim()) {
        return custom;
    }
    const locale = (question && question.survey && question.survey.locale) || '';
    if (locale && DEFAULT_REQUIRED_WATCH_MESSAGES[locale]) {
        return DEFAULT_REQUIRED_WATCH_MESSAGES[locale];
    }
    return DEFAULT_REQUIRED_WATCH_MESSAGES['default'];
}

/**
 * Apply the videoFit / videoHeight / videoWidth properties to the DOM.
 */
function applyLayout(video: HTMLVideoElement, question: any): void {
    const fit = (question.videoFit || 'contain').toString();
    const allowed: Record<string, true> = { none: true, contain: true, cover: true, fill: true };
    video.style.objectFit = allowed[fit] ? fit : 'contain';
    if (question.videoHeight) {
        video.style.height = String(question.videoHeight);
    } else {
        video.style.removeProperty('height');
    }
    if (question.videoWidth) {
        video.style.width = String(question.videoWidth);
    } else {
        video.style.removeProperty('width');
    }
}

/**
 * Lazy-attach a survey-level validator that requires the user to watch
 * the video to the end (or to the configured segment end) before a
 * `video` question with `isRequired: true` can satisfy
 * `survey.tryComplete()` / `survey.nextPage()`.
 *
 * SurveyJS' built-in `isRequired` check counts any non-empty value as
 * "answered". Our widget continuously persists playback state to
 * `question.value` from `loadedmetadata` onwards — so by the time the
 * user sees the player there is already a value object and the stock
 * `isRequired` check is vacuously true. We therefore add a stricter
 * `watched === true` check that fires AFTER the standard required
 * validation and can `addError()` to block submission.
 *
 * Idempotent — tagged on the survey instance so we attach once even if
 * multiple video questions share a survey.
 */
function attachRequiredWatchValidator(question: any): void {
    const survey = question && question.survey;
    if (!survey || !survey.onValidateQuestion ||
        typeof survey.onValidateQuestion.add !== 'function') return;
    if (survey.__videoQuestionRequiredHookAttached) return;
    survey.__videoQuestionRequiredHookAttached = true;
    survey.onValidateQuestion.add((_: any, options: any) => {
        const q = options && options.question;
        if (!q || typeof q.getType !== 'function') return;
        if (q.getType() !== COMPONENT_NAME) return;
        if (!q.isRequired) return;
        const v = q.value as VideoQuestionValue | undefined;
        if (!v || v.watched !== true) {
            options.error = getRequiredWatchMessage(q);
        }
    });
}

/**
 * Wire up an HTML5 <video> element so it strictly enforces the
 * [start, end] playback window AND records the current playback state
 * on the question's value. Returns a cleanup function.
 *
 * Bound resolution: `start` defaults to 0; `end` is set lazily from
 * `video.duration` on `loadedmetadata` when `endTimestamp` is unset
 * (or 0, which we treat as "not configured"). An explicit
 * `endTimestamp` greater than the actual file length is capped to the
 * real duration so `watched` stays reachable for required questions.
 */
function attachPlaybackEnforcement(video: HTMLVideoElement, question: any): () => void {
    const startRaw = parseSeconds(question.startTimestamp);
    const start = (startRaw === null || startRaw < 0) ? 0 : startRaw;
    const endRaw = parseSeconds(question.endTimestamp);
    const hasExplicitEnd = endRaw !== null && endRaw > 0 && endRaw > start;
    let end: number = hasExplicitEnd ? (endRaw as number) : Infinity;
    let duration: number = isFinite(end) ? (end - start) : Infinity;

    let enforcing = false;
    let watchedSeconds = 0;
    let lastTickAt: number | null = null;
    let startedAt: string | null = null;
    let completedAt: string | null = null;

    const safeISO = (): string | null => {
        try { return new Date().toISOString(); } catch (e) { return null; }
    };

    const persistState = (eventType: VideoQuestionValue['lastEvent']): void => {
        try {
            const t = video.currentTime;
            const watched = isFinite(end) ? (t >= end - 0.05) : false;
            if (watched && !completedAt) completedAt = safeISO();
            const clampedTime = Math.max(start, isFinite(end) ? Math.min(end, t) : t);
            const value: VideoQuestionValue = {
                watched: watched,
                currentTime: clampedTime,
                startTimestamp: start,
                endTimestamp: isFinite(end) ? end : null,
                duration: isFinite(duration) ? duration : null,
                watchedSeconds: Math.round(watchedSeconds * 1000) / 1000,
                percentWatched: (isFinite(duration) && duration > 0)
                    ? Math.min(1, watchedSeconds / duration)
                    : 0,
                startedAt: startedAt,
                lastUpdatedAt: safeISO(),
                lastEvent: eventType,
                completedAt: completedAt
            };
            question.value = value;
        } catch (e) { /* ignore */ }
    };

    const onLoadedMetadata = (): void => {
        // Promote unset endTimestamp to the real video duration so
        // segment-clamping and the saved value have a meaningful end.
        if (!hasExplicitEnd && isFinite(video.duration) && video.duration > start) {
            end = video.duration;
            duration = end - start;
        }
        // Cap an explicit endTimestamp at the file's real duration.
        // Without this, a misconfigured `endTimestamp` greater than the
        // file length makes `watched` unreachable and a required
        // question would never satisfy validation.
        if (hasExplicitEnd && isFinite(video.duration) && end > video.duration) {
            end = video.duration;
            duration = Math.max(0, end - start);
        }
        // Snap to the segment start so the timeline thumb is in the
        // right place from the get-go. NOT recorded as an event.
        enforcing = true;
        video.currentTime = start;
        enforcing = false;
        // Auto-start playback when opted in via `autoStart`. Suppressed
        // in read-only mode (the participant is just reviewing) and in
        // the (mobile-irrelevant) Creator Designer tab. Browsers may
        // reject the play() promise when there has been no recent user
        // gesture; we silently swallow the rejection — the user simply
        // sees a paused player and presses play themselves.
        const survey = question && question.survey;
        const inDesignMode = !!(survey && survey.isDesignMode);
        if (question.autoStart && !question.isReadOnly && !inDesignMode) {
            try {
                const p = video.play();
                if (p && typeof (p as Promise<void>).then === 'function') {
                    (p as Promise<void>).catch(() => { /* blocked by autoplay policy */ });
                }
            } catch (e) { /* older browsers without a play() promise */ }
        }
    };

    const onTimeUpdate = (): void => {
        if (enforcing) return;
        if (!video.paused && !video.ended) {
            const now = Date.now();
            if (lastTickAt) {
                const deltaSeconds = (now - lastTickAt) / 1000;
                if (deltaSeconds > 0 && deltaSeconds < 1.0) {
                    watchedSeconds += deltaSeconds;
                    if (isFinite(duration) && watchedSeconds > duration) {
                        watchedSeconds = duration;
                    }
                }
            }
            lastTickAt = now;
        } else {
            lastTickAt = null;
        }
        if (isFinite(end) && video.currentTime >= end) {
            enforcing = true;
            video.currentTime = end;
            video.pause();
            enforcing = false;
            persistState('ended');
        }
    };

    const onSeek = (): void => {
        if (enforcing) return;
        const t = video.currentTime;
        lastTickAt = null;
        if (t < start) {
            enforcing = true;
            video.currentTime = start;
            enforcing = false;
            persistState('seek');
            return;
        }
        if (isFinite(end) && t > end) {
            enforcing = true;
            video.currentTime = end;
            if (!video.paused) video.pause();
            enforcing = false;
            persistState('clamp');
            return;
        }
        persistState('seek');
    };

    const onPlay = (): void => {
        if (enforcing) return;
        const atOrPastEnd = isFinite(end) && video.currentTime >= end - 0.05;
        if (atOrPastEnd || video.currentTime < start) {
            enforcing = true;
            video.currentTime = start;
            enforcing = false;
        }
        if (!startedAt) startedAt = safeISO();
        lastTickAt = Date.now();
        persistState('play');
    };

    const onPause = (): void => {
        if (enforcing) return;
        // Skip if we're at/past the end — the browser fires "pause"
        // right before "ended" and we don't want to overwrite the
        // ended event with a noisy pause event.
        if (isFinite(end) && video.currentTime >= end - 0.05) return;
        lastTickAt = null;
        persistState('pause');
    };

    const onEnded = (): void => {
        enforcing = true;
        video.currentTime = start;
        enforcing = false;
        persistState('ended');
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('seeking', onSeek);
    video.addEventListener('seeked', onSeek);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return function detach(): void {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('seeking', onSeek);
        video.removeEventListener('seeked', onSeek);
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('ended', onEnded);
    };
}

/**
 * Register the `video` SurveyJS question type and its custom widget on
 * the global `survey-core` singletons. Must be called once at app
 * startup (currently from `SurveyJSStyleComponent`'s constructor).
 *
 * @param getApiEndpoint  Function returning the current API endpoint
 *                         (e.g. SelfhelpService.getApiEndPointNative()).
 *                         Resolved lazily so a server switch via the
 *                         dev menu is picked up automatically without
 *                         needing to re-register the widget.
 */
export function addVideoQuestionWidget(getApiEndpoint: () => string): void {
    const Survey: any = SurveyCore as any;
    if (!Survey || !Survey.Serializer) return;

    if (!Survey.Serializer.findClass(COMPONENT_NAME)) {
        Survey.Serializer.addClass(
            COMPONENT_NAME,
            [
                {
                    name: 'videoUrl:string',
                    isRequired: true,
                    category: 'general',
                    displayName: 'Video URL'
                },
                {
                    // No default — leaving the property absent from saved
                    // JSON is the "play from 0" signal. See the plugin's
                    // file header for why `default: 0` is harmful here.
                    name: 'startTimestamp:number',
                    minValue: 0,
                    category: 'general',
                    displayName: 'Start timestamp (seconds, optional)'
                },
                {
                    // No default — absence means "play to natural end".
                    name: 'endTimestamp:number',
                    minValue: 0,
                    category: 'general',
                    displayName: 'End timestamp (seconds, optional)'
                },
                {
                    name: 'autoStart:boolean',
                    default: false,
                    category: 'general',
                    displayName: 'Auto-start playback when the question is shown'
                },
                {
                    name: 'videoFit',
                    default: 'contain',
                    choices: ['none', 'contain', 'cover', 'fill'],
                    category: 'layout',
                    displayName: 'Video fit'
                },
                {
                    name: 'videoHeight:string',
                    default: '',
                    category: 'layout',
                    displayName: 'Video height (CSS-accepted values)'
                },
                {
                    name: 'videoWidth:string',
                    default: '',
                    category: 'layout',
                    displayName: 'Video width (CSS-accepted values)'
                },
                {
                    // `isLocalizable: true` makes SurveyJS resolve this
                    // property against `survey.locale` automatically, so
                    // a Translation-tab JSON like
                    //   { default: "Please…", de: "Bitte…" }
                    // produces the right per-locale value at runtime.
                    name: 'requiredWatchMessage:text',
                    isLocalizable: true,
                    category: 'general',
                    displayName: 'Required-watch alert (optional, falls back to localized default)'
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
            '<div class="sjs-video">' +
                '<video class="sjs-video__player" preload="metadata" controls playsinline></video>' +
                '<div class="sjs-video__error" role="alert"></div>' +
            '</div>',
        afterRender: (question: any, el: HTMLElement) => {
            const video = el.querySelector<HTMLVideoElement>('.sjs-video__player');
            const errorEl = el.querySelector<HTMLDivElement>('.sjs-video__error');
            if (!video || !errorEl) return;

            applyLayout(video, question);

            // Drop our own previously-attached errors before re-evaluating
            // — without this, accumulated errors from previous renders
            // can latch even after the configuration becomes valid. We
            // tag with `__fromVideoQuestion` so unrelated errors set by
            // other code paths survive.
            if (question && Array.isArray(question.errors)) {
                for (let i = question.errors.length - 1; i >= 0; i--) {
                    if (question.errors[i] && question.errors[i].__fromVideoQuestion) {
                        question.errors.splice(i, 1);
                    }
                }
            }
            errorEl.textContent = '';
            errorEl.classList.remove('is-visible');
            video.style.display = '';

            const configError = getConfigError(question);
            if (configError) {
                errorEl.textContent = 'Video question configuration error: ' + configError;
                errorEl.classList.add('is-visible');
                video.style.display = 'none';
                const Survey: any = SurveyCore as any;
                if (typeof question.addError === 'function' && typeof Survey.SurveyError === 'function') {
                    try {
                        const err: any = new Survey.SurveyError(configError, question);
                        err.__fromVideoQuestion = true;
                        question.addError(err);
                    } catch (e) { /* older builds may signal differently */ }
                }
                return;
            }

            video.src = resolveVideoUrl(question.videoUrl, getApiEndpoint);
            (video as any).__videoQuestionDetach = attachPlaybackEnforcement(video, question);
            attachRequiredWatchValidator(question);

            if (question.isReadOnly) {
                video.controls = false;
            }
            question.readOnlyChangedCallback = () => {
                video.controls = !question.isReadOnly;
            };
        },
        willUnmount: (_question: any, el: HTMLElement) => {
            if (!el || typeof el.querySelector !== 'function') return;
            const video = el.querySelector<HTMLVideoElement>('.sjs-video__player');
            if (!video) return;
            try {
                const detach = (video as any).__videoQuestionDetach;
                if (typeof detach === 'function') {
                    detach();
                    (video as any).__videoQuestionDetach = null;
                }
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch (e) { /* best-effort cleanup */ }
        }
    }, 'customtype');
}
