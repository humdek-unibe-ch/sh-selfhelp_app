# Compatibility

Which version of SelfHelp and of each plugin the mobile app was last brought up to.
"Synced to" means: every change up to that version was checked, and what has a mobile side is
either implemented or listed under *Open*.

Last full check: 2026-11-11, app version 4.0.6.

| Repo | Synced to | Checked | Mobile side |
|---|---|---|---|
| sh-selfhelp (core) | 7.13.2 | 2026-11-11 | `formUserInputLogList` (7.12.0), `languagePicker` (7.10.0). Video tracking (7.9.0) is on branch `fixs/video` (PR open) |
| sh-shp-llm | 1.9.0 | 2026-11-11 | `llmChat`, `llmFormRecord`, `llmFormLog`, `llmFormLogList`, `llmResponse` |
| sh-shp-survey_js | 1.8.0 | 2026-11-11 | SurveyJS 3.0.2, themes, `update_based_on`, url params, GPX question, `gpxMap`. `auto_session_key` (1.8.0) is on branch `fixs/surveyjs-auto-session-key` (PR open) |
| sh-shp-lab_js | 1.3.0 | 2026-11-11 | `labJS` with `url_params`, `update_based_on`, `redirect_at_end` templates |
| sh-shp-llm_agentic_chat | not needed | 2026-11-11 | web only (FoReST project, no app) |
| sh-shp-qualtrics | 2.3.5 | 2026-11-11 | `qualtricsSurvey` rendered, no change since 2025-02 |
| sh-shp-r_serve | 1.2.4 | 2026-11-11 | server only, no change since 2024-07 |
| sh-shp-plotly_graphs | 1.3.3 | 2026-11-11 | `graph` rendered; changes since 1.0.0 are server side |
| sh-shp-api | 1.1.1 | 2026-11-11 | nothing to render |
| sh-shp-auth_external | 1.0.2 | 2026-11-11 | nothing to render (login hooks only) |

## Open

Things the web has and the app does not.

- **`slider`** (core): no mobile component.

## How to update this file

When core or a plugin gets a new version:

1. Read its changelog from the version in the table up to the new one.
2. For every entry, check if it changes what the server sends to the app
   (`output_content_mobile()`), adds a style, or adds a field the web client reads.
3. Check `git log --all` first, it may already be on a branch waiting for its PR.
   Then implement it, or add it under *Open*.
4. Set the new version and date in the table, and add the work to `CHANGELOG.md`.

To find styles the app does not render, compare the `styles` table of an install with the
`isStyle('…')` cases in `src/app/styles/basic-style/basic-style.component.html`.
