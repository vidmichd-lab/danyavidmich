## Inventory & Baseline Notes (Pre-Astro Migration)

- **Pages**: 30 standalone HTML documents with duplicated head/boilerplate.
- **Assets**: `img/` (~200 assets) + fonts located alongside CSS, no cache busting.
- **Scripts**: Single `javascript.js` file for scroll-to-top and lazy loading; no module system.
- **Build/Tooling**: Served as raw static files, no linting, testing, or bundler.
- **Performance Baseline**: Quantitative metrics (Lighthouse/WebPageTest) still outstanding because measurements couldn't be captured in this offline workspace. Run against the legacy deployment before switching DNS to the Astro build.

## Post-Migration Checklist

- [x] Astro + TypeScript architecture with shared layout/components.
- [x] Assets moved under `public/` while preserving URLs.
- [x] Fonts preloaded and lazy-loading script modularised for testing.
- [x] Unit tests (Vitest) and Playwright visual regression harness in place.
- [ ] Capture and document Lighthouse metrics (run locally before launch).

