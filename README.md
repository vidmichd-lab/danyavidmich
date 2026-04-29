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
- **E2E checks**: `npm run test:e2e` (builds first, then runs Playwright)

CI lives in `.github/workflows/ci.yml` and verifies lint, type check, build, and unit tests. Optional Playwright checks can be run locally with `npm run test:e2e`.

## Visual Parity

- Global layout rendered via `BaseLayout.astro`; per-page content stays 1:1 with the original markup.
- Shared header (`Header.astro`) preserves home vs. detail behaviour.
- Fonts and resets are loaded globally with deterministic ordering to match the legacy rendering exactly.

## Performance Notes

- Fonts preloaded and served from `/fonts`.
- Lazy loading with blur placeholders handled by `src/scripts/lazy-media.ts`, surfaced globally and exposed as plain JS fallback (`public/javascript.js`).
- Images remain in `public/img`, keeping URLs unchanged.
- To compare performance with the legacy build, run Lighthouse/WebPageTest against both the historical deployment and the Astro build (`npm run preview`)—capture metrics for FCP, LCP, CLS, and total transfer.

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

## Project Structure

- `src/pages/*.astro` – Astro routes for portfolio pages.
- `src/components` – shared UI fragments.
- `src/styles/reset.css` – Meyer reset for consistency.
- `src/styles/base.css` – global fonts, color tokens, and shared type helpers.
- `src/styles/global.css` – legacy layout rules and shared project styles.
- `src/styles/home.css` – Masonry layout for the homepage (two-column Pinterest-style grid).
- `src/scripts` – hydrated browser modules authored in TypeScript.
- `src/utils` – reusable logic + unit tests.
- `public/` – static assets (images, fonts, PDFs, icons, legacy JS entrypoint).

## Automated Deployment (Cloudflare Pages)

Continuous deployment is configured through GitHub Actions. Every push to the `main` branch triggers `.github/workflows/deploy-cloudflare-pages.yml`, which:

1. Installs dependencies with `npm ci`.
2. Generates `public/sitemap.xml`.
3. Builds the static bundle (`npm run build` → `dist/`).
4. Runs unit tests.
5. Deploys `dist/` to Cloudflare Pages with Wrangler.

### Setup Instructions

#### Step 1: Add Repository Secrets

1. Go to your GitHub repository.
2. Navigate to **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret** and add the following:

   - **Name:** `CLOUDFLARE_API_TOKEN`  
     **Value:** Cloudflare API token with Pages deploy access

   - **Name:** `CLOUDFLARE_ACCOUNT_ID`  
     **Value:** Cloudflare account ID

#### Step 2: Test the Deployment

1. Push any change to the `main` branch, or
2. Go to **Actions** tab → **Deploy to Cloudflare Pages** → **Run workflow** → **Run workflow**.

The workflow will:
- Build the site automatically.
- Publish the current `dist/` output to the `danyavidmich-com` Cloudflare Pages project.
- Show detailed logs in the Actions tab.

#### Step 3: Verify Deployment

After the workflow completes successfully:
- Check your site at `https://danyavidmich.com`
- Verify that new changes are live
- Check the Actions tab for any errors

### Troubleshooting

- **Build fails:** Check that `npm ci` completes without errors locally.
- **Deploy fails:** Verify the Cloudflare token, account ID, and Pages project name.
- **Files not updating:** Check the Cloudflare Pages deployment logs and browser cache headers in `public/_headers`.
- **Redirects or headers fail:** Check `public/_redirects`, `public/_headers`, `public/_routes.json`, and `functions/_middleware.js`.

### Manual Deployment

If you need to deploy manually without GitHub Actions:

```bash
npm run build
npx wrangler@4 pages deploy dist --project-name=danyavidmich-com --branch=main
```
