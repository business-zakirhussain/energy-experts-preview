# Energy Experts BV — Horizon concept

Open `deploy/design-5.html` directly in your browser. No install, framework, API key, or server is required. `deploy/index.html` compares all five design directions; the original four designs are retained.

For a local HTTP preview, run this from the project folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory deploy
```

Visit `http://127.0.0.1:8765/design-5.html`. Add `?lang=fr` or `?lang=es` to share a specific language. Stop the server with Ctrl+C.

## What works

- Responsive navigation and layouts, with keyboard focus handling and reduced-motion support.
- English, French, and Spanish copy, including project dialogs and form messages. Translations are drafts for client review.
- Project category filters and detail dialogs, with three explicitly illustrative projects.
- Expandable service descriptions and service selection from enquiry links.
- A validated preview form. It sends and saves nothing; email and phone links are real outgoing actions.
- Privacy, cookie, and legal information dialogs explaining the preview’s limits.
- All images, fonts, CSS, and JavaScript load locally. No trackers, cookies, maps, or CDN dependencies in Horizon.
- Light and dark modes. The theme follows the operating system until the visitor picks one with the header toggle.
- A storage notice with equally weighted accept and decline. Nothing is written to the browser until the visitor accepts; declining keeps the session in memory only. The only values stored are the chosen language and theme.
- A preview-only design switcher links designs 1-5. Remove it before any client-facing deployment.

## Editing

- Page: `src/design-5.html`.
- Styling: `deploy/horizon/style.css`.
- Translations and sample projects: `deploy/horizon/content.js`.
- Interactions: `deploy/horizon/app.js`. Theme, storage notice, and language persistence are a separate module appended at the end of that file.
- Gallery: `src/index.html`.
- Photography attribution: `deploy/horizon/credits.html`.

After changing files in `src`, run `python3 build.py` to regenerate the HTML in `deploy`. The existing build includes all five designs. The Horizon CSS and scripts are independent of the older prototypes.

## Sharing and launch

For a private design review, share the deploy folder as a ZIP or put it on an approved preview host. `noindex` discourages indexing but does not restrict access; use host-level password protection if the preview must be private. There is no public deployment from this task.

This is a working design prototype, not the final production site. The project editor and form delivery still need to be connected after hosting is confirmed. All marketing copy, translations, service scopes, and company details require client approval. Projects must be replaced with actual authorised work. See `PROJECT-NOTES.md` for scope, timing, client questions, hosting findings, and privacy/security decisions.
