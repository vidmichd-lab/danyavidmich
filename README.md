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

## AI Content Generation

The site includes AI-powered content generation for consistent, professional descriptions across all projects. Supports both **Yandex GPT** and **OpenAI**.

### Quick Start

**Option 1: Yandex GPT (recommended for Russia)**

1. Get your API key and Folder ID from [Yandex Cloud Console](https://console.cloud.yandex.ru/):
```bash
export YANDEX_API_KEY="your-api-key-here"
export YANDEX_FOLDER_ID="your-folder-id-here"
```

**Option 2: OpenAI**

1. Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your-key-here"
```

2. Generate content for all projects:
```bash
npm run ai:generate
```

3. AI-generated content is automatically used in:
   - OG meta tags for social sharing
   - Project descriptions
   - Page subtitles

See [AI_INTEGRATION.md](./AI_INTEGRATION.md) for detailed documentation.

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
3. Verifies the build output.
4. Uploads the `dist/` contents to the Reg.ru `public_html` directory via FTP.

### Setup Instructions

#### Step 1: Add Repository Secrets

1. Go to your GitHub repository.
2. Navigate to **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret** and add the following:

   - **Name:** `FTP_HOST`  
     **Value:** `31.31.196.4`

   - **Name:** `FTP_USER`  
     **Value:** `u2034102`

   - **Name:** `FTP_PASSWORD`  
     **Value:** Your FTP password from Reg.ru (the one shown in the FTP access section, not the control panel password)

   - **Name:** `FTP_PORT` *(optional)*  
     **Value:** `21` (default, can be omitted)

#### Step 2: Test the Deployment

1. Push any change to the `main` branch, or
2. Go to **Actions** tab → **Deploy to Reg.ru** → **Run workflow** → **Run workflow** (manual trigger).

The workflow will:
- Build the site automatically
- Upload only changed files (incremental sync)
- Show detailed logs in the Actions tab

#### Step 3: Verify Deployment

After the workflow completes successfully:
- Check your site at `https://danyavidmich.com`
- Verify that new changes are live
- Check the Actions tab for any errors

### Troubleshooting

- **Build fails:** Check that `npm ci` completes without errors locally.
- **FTP connection fails:** Verify FTP credentials in Reg.ru panel and ensure the IP isn't blocked.
- **Files not updating:** Check the workflow logs for specific file upload errors.
- **Partial deployment:** The workflow uses incremental sync; deleted local files won't be removed from the server unless you manually clean `public_html`.

### Manual Deployment

If you need to deploy manually without GitHub Actions:

```bash
npm run build
# Then upload dist/ contents to public_html via FTP client
```

