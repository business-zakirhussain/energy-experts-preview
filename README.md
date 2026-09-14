# Energy Experts BV — website

A static one-page site for Energy Experts BV (Grimbergen, Belgium) in
**English, French and Dutch**.

## Look at it

Open `deploy/index.html`, or serve the folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory deploy
```

## What it does

- Three languages, switched in the header, remembered in the browser.
- **Projects** and **News** are data-driven collections — the two parts the
  client will edit himself.
- Light and dark mode, following the system setting until the visitor chooses.
- A storage notice with equally weighted accept and decline. Nothing is
  written to the browser unless the visitor accepts.
- **No third-party requests at all.** Fonts are self-hosted, the office map is
  a bundled image, there are no cookies, analytics, embeds or CDNs.
- `noindex` and `robots.txt` while it is a preview.

## Editing

| What | Where |
|---|---|
| Copy, projects, news (all 3 languages) | `deploy/shared/content.js` |
| Page structure | `src/index.html` |
| Shared styling | `deploy/shared/base.css` |
| Behaviour | `deploy/shared/app.js` |

After editing anything in `src/`, run `python3 build.py` to regenerate
`deploy/index.html`.

## Still to do before launch

- Replace the placeholder client names on the partner wall with real,
  permitted clients.
- Replace the sample projects and news with real, approved content.
- Replace the stock photography with the client's own (credits:
  `deploy/img/CREDITS.txt`).
- Confirm the registered company name, enterprise number and VAT for the
  footer, and have a lawyer approve the privacy, cookie and terms pages.
- Connect the enquiry form to a real endpoint and remove the demo notice.
- Remove the concept ribbon and the `noindex` tag.

Earlier design directions are kept in `archive/` and in the git history.
