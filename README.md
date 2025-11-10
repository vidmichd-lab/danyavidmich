# Danya Vidmich Portfolio

Modernised Astro + TypeScript build of the Danya Vidmich portfolio. The site preserves the exact pixel-perfect visuals of the legacy static HTML while dramatically improving maintainability, performance tooling, and test coverage.

## Getting Started

```bash
npm install
npm run dev
```

- Development server: `http://localhost:4321`
- Static build: `npm run build` (outputs to `dist/`)
- Preview production build: `npm run preview`

## Quality Tooling

- **Linting**: `npm run lint`
- **Type checking**: `npm run check`
- **Unit tests**: `npm run test:unit`
- **Visual regression**: `npm run test:visual` (builds first, then runs Playwright)

> The first Playwright run requires a baseline. Capture it with:
>
> ```bash
> npm run test:visual -- --update-snapshots
> ```

CI lives in `.github/workflows/ci.yml` and verifies lint, type, unit tests, optional visual tests (enable with `ENABLE_VISUAL_TESTS=true`), and build.

## Visual Parity

- Global layout rendered via `BaseLayout.astro`; per-page content stays 1:1 with the original markup.
- Shared header (`Header.astro`) preserves home vs. detail behaviour.
- Fonts and resets are loaded globally with deterministic ordering to match the legacy rendering exactly.

## Performance Notes

- Fonts preloaded and served from `/fonts`.
- Lazy loading with blur placeholders handled by `src/scripts/lazy-media.ts`, surfaced globally and exposed as plain JS fallback (`public/javascript.js`).
- Images remain in `public/img`, keeping URLs unchanged.
- To compare performance with the legacy build, run Lighthouse/WebPageTest against both the historical deployment and the Astro build (`npm run preview`)—capture metrics for FCP, LCP, CLS, and total transfer.

## Visual Baseline Checklist

1. `npm install`
2. `npm run test:visual -- --update-snapshots`
3. Commit the generated files under `tests/visual/__snapshots__/`

Repeat after any visual change to guarantee pixel-perfect parity.

## Homepage Layout Notes

- The main portfolio feed now uses a CSS masonry (`column-count`) layout defined in `src/styles/home.css`. Each card inherits existing classes (`.bigcard`, `.cards`) plus new aliases (`.gallery-item`, `.gallery-pair`) for clearer naming. The layout gracefully collapses to a single column under 800px.
- Sidebar content (`.about`, `.aboutzero`) remains fixed to preserve the original pixel grid while the masonry grid flows underneath.

## Project Structure

- `src/pages/*.html.astro` – page templates mirroring legacy routes (e.g. `aptproduct.html`).
- `src/components` – shared UI fragments (`Header.astro`).
- `src/styles/reset.css` – Meyer reset for consistency.
- `src/styles/base.css` – global fonts, color tokens, and shared type helpers.
- `src/styles/style.css` – legacy layout rules (now with new alias classes such as `.gallery-item`, `.gallery-pair`, and `.tag--*` for clearer semantics).
- `src/styles/home.css` – Masonry layout for the homepage (two-column Pinterest-style grid).
- `src/scripts` – hydrated browser modules authored in TypeScript.
- `src/utils` – reusable logic + unit tests.
- `public/` – static assets (images, fonts, PDFs, icons, legacy JS entrypoint).

## Automated Deployment (Reg.ru)

Continuous deployment is configured through GitHub Actions. Every push to the `main` branch triggers `.github/workflows/deploy.yml`, which:

1. Installs dependencies with `npm ci`.
2. Builds the static bundle (`npm run build` → `dist/`).
3. Uploads the `dist/` contents to the Reg.ru `public_html` directory via FTP.

### Required repository secrets

Set the following secrets in **Settings → Secrets and variables → Actions**:

- `FTP_HOST` – `31.31.196.4`
- `FTP_USER` – `u2034102`
- `FTP_PASSWORD` – password from the Reg.ru FTP section
- `FTP_PORT` *(optional)* – defaults to `21` when omitted

After the secrets are configured, pushing to `main` (or running the workflow manually through “Run workflow”) will deploy automatically. To prevent partial uploads, each run cancels any in-progress deployment.

