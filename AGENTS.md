Checklist 5.0 — Agent Working Rules

Scope: Entire repository (this folder and subfolders).

Do this when making any change:

- Edit source files only. Do NOT edit generated artifacts such as `index-combined.html`.
- Typical source locations: `index.html`, files in `js/` and `css/` (and any other non‑generated assets).
- Keep diffs minimal and focused. Do not reformat unrelated code or change filenames unless required by the task.
- Use `apply_patch` for all edits.
- Follow any existing style and structure; do not introduce new tooling unless asked.

Build and verification:

- After edits, regenerate the bundled file by running: `./build.sh`
- Output target: `index-combined.html` (generated). Never hand‑edit this file.
- If you cannot run the build here, clearly tell the user to run `./build.sh` locally and summarize expected changes.

Communication back to user:

- Summarize which files were changed and why. Do not paste entire large files unless requested.
- If targets are ambiguous (e.g., multiple candidate files), ask before editing.
- If there are tests or linters added in the future, suggest the exact commands to run, but only run them when appropriate.

Ambiguity and safety:

- If there are multiple valid approaches, propose options and ask the user to choose before proceeding.
- Do not perform destructive operations (deletes, large refactors) unless explicitly requested.

Cheat Sheet — What Lives Where (keep it short)

- index.html
  - Entry template (source). Build pulls this + js/css into the bundle.

- css/styles.css
  - Global styles. BP input styles live around ~line 474.

- js/config.js
  - Constants: custom field IDs (FIELDS), tags (TAGS), prices (MEMBERSHIP_PRICES), TERMS_LIBRARY, manualOverrideMap. Exposed on window.*.

- js/api.js
  - GHL proxy helpers: updateFieldsBatch, add/remove tags, fetchContact, addNoteToContact. Exposed on window.*.

- js/utils.js
  - DOM helpers (safeSetHTML, safeRemove), date/format utils, burst, getContactIdFromURL. Exposed on window.*.

- js/blood-pressure.js
  - BP logic: getBPFeedback, bpInputHandler, bpSubmit. Exposed on window.*.

- js/checklist.js
  - Main UI controller.
  - Renderers: renderEnquiry, renderInitial, renderTrial.
  - Stage logic: computeStageStatus (locks/progress), derivePrompt (banner), setActiveTab.
  - Intro booking: INTRO_BOOKING_BASE_URL, handleIntroBooking.
  - App init + fetch: init() mounts everything and calls fetchContact.

- js/modals/
  - terms.js: T&Cs modal flow (openTermsModal, termsSubmitSignature).
  - membership.js: Full‑screen membership UI, plan finder, compare table, gym drop‑ins.
  - trial-week.js: Trial modal (timeline, membership selection form, billing preview).
  - info-modals.js: FAQs, Blueprint, Onboarding Works, Intro “What to expect”.

- js/consultation/
  - wizard.js: PAR‑Q modal wizard (openParqModal), Q&A flow, validation, saves fields/tags/notes.
  - fields.js: Placeholder for additional step config.

- js/consultation.js, js/manual-override.js, js/dev-mode.js
  - Shell, 10‑click override tagger, local dev/test helpers.

- index-combined.html
  - Generated output. Never edit. Regenerate via ./build.sh.

Edit Hotspots (common tasks → where to change)

- Move or add checklist items
  - Edit js/checklist.js: renderEnquiry, renderInitial, renderTrial.

- Change stage unlock rules
  - Edit js/checklist.js: computeStageStatus.

- Change the alert banner behaviour/copy
  - Edit js/checklist.js: derivePrompt.

- Intro booking target URL or behaviour
  - Edit INTRO_BOOKING_BASE_URL and handleIntroBooking in js/checklist.js.

- BP behaviour or validation
  - Edit js/blood-pressure.js; styles in css/styles.css.

- T&Cs content or signatures
  - Edit TERMS_LIBRARY and related IDs in js/config.js; UI flow in js/modals/terms.js.

- Membership / plan finder / pricing table UI
  - Edit js/modals/membership.js. Prices also referenced from js/config.js if needed.

- Trial-week membership selection + billing preview
  - Edit js/modals/trial-week.js (form handlers and preview math).

Code Search Anchors (use rg)

- "renderEnquiry", "renderInitial", "renderTrial"
- "computeStageStatus", "derivePrompt", "INTRO_BOOKING_BASE_URL"
- "bp-input", "bpSubmit", "getBPFeedback"
- "openTermsModal", "TERMS_LIBRARY"
- "startPlanFinder", "showPricingTable"

IDE Tip (to reduce context bloat)

- Do not select or paste `index-combined.html` in prompts; it’s generated and large.
- Keep the cursor in a small source file (e.g., js/checklist.js or AGENTS.md) when prompting.
- If your IDE supports it, disable “include active selection” or add an ignore pattern for `index-combined.html`.
