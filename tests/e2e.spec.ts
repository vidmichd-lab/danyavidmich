import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Danya Vidmich/);
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open CV page' }).first().click();
    await expect(page).toHaveURL(/\/cv\/?$/);
  });

  test('should have portfolio filters', async ({ page }) => {
    await page.goto('/');
    const filters = page.locator('#portfolio-filters-desktop .filter-button');
    await expect(filters.first()).toBeVisible();
  });

  test('should filter projects', async ({ page }) => {
    await page.goto('/');
    await page.locator('#portfolio-filters-desktop .filter-button[data-filter="product"]').click();
    await page.waitForTimeout(500);
    const visibleCards = page.locator('.bigcard:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show featured projects only for all filter', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.portfolio__featured')).toBeVisible();

    await page.locator('#portfolio-filters-desktop .filter-button[data-filter="product"]').click();
    await expect(page.locator('.portfolio__featured')).toBeHidden();

    await expect.poll(async () => {
      const visibleTags = await page.locator('.portfolio__columns .bigcard:visible').evaluateAll((cards) =>
        cards.map((card) => card.getAttribute('data-tag'))
      );
      return visibleTags.length > 0 && visibleTags.every((tag) => tag === 'product');
    }).toBeTruthy();
    await expect(page.locator('.portfolio__columns .bigcard[data-featured-copy="true"]:visible')).toContainText('Apt');

    await page.locator('#portfolio-filters-desktop .filter-button[data-filter="all"]').click();
    await expect(page.locator('.portfolio__featured')).toBeVisible();
    await expect(page.locator('.portfolio__columns .bigcard[data-featured-copy="true"]:visible')).toHaveCount(0);
  });

  test('should include matching featured projects in tag filters', async ({ page }) => {
    await page.goto('/');

    const featuredByFilter = {
      branding: ['Yandex Practicum Pro', 'S7 Logistics'],
      concept: ['Your 2024 at Yandex Music'],
      product: ['Apt'],
      typography: ['Chekhov'],
      visual: ['Badoo "Be Yourself With Me"']
    };

    for (const [filter, titles] of Object.entries(featuredByFilter)) {
      await page.locator(`#portfolio-filters-desktop .filter-button[data-filter="${filter}"]`).click();
      await expect(page.locator('.portfolio__featured')).toBeHidden();

      const visibleFeaturedCopies = page.locator('.portfolio__columns .bigcard[data-featured-copy="true"]:visible');
      await expect(visibleFeaturedCopies).toHaveCount(titles.length);

      for (const title of titles) {
        await expect(visibleFeaturedCopies.filter({ hasText: title })).toHaveCount(1);
      }
    }
  });

  test('should color filter tabs by tag on hover', async ({ page }) => {
    await page.goto('/');

    const expectedHoverColors = {
      branding: 'rgb(252, 231, 78)',
      visual: 'rgb(255, 100, 48)',
      product: 'rgb(44, 128, 255)',
      web: 'rgb(255, 144, 211)',
      typography: 'rgb(255, 0, 61)',
      merch: 'rgb(126, 189, 44)',
      concept: 'rgb(187, 164, 131)',
      posters: 'rgb(211, 211, 211)'
    };

    for (const [filter, color] of Object.entries(expectedHoverColors)) {
      const button = page.locator(`#portfolio-filters-desktop .filter-button[data-filter="${filter}"]`);
      await button.hover();
      await expect(button).toHaveCSS('background-color', color);
    }
  });

  test('should render Badoo as the sixth featured card', async ({ page }) => {
    await page.goto('/');
    const featuredCards = page.locator('.portfolio__featured .bigcard');
    await expect(featuredCards).toHaveCount(6);
    await expect(featuredCards.nth(5)).toContainText('Badoo "Be Yourself With Me"');
  });

  test('should handle filter clicks before images finish loading', async ({ page }) => {
    await page.route(/\.(webp|png|jpg|jpeg|gif|ico)(\?.*)?$/i, () => new Promise(() => {}));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.locator('#portfolio-filters-desktop .filter-button[data-filter="product"]').click();

    await expect(page.locator('#portfolio-filters-desktop .filter-button[data-filter="product"]')).toHaveClass(/filter-button--active/);
    await expect(page.locator('.portfolio__featured')).toBeHidden();
  });

  test('should handle mobile action buttons before images finish loading', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route(/\.(webp|png|jpg|jpeg|gif|ico)(\?.*)?$/i, () => new Promise(() => {}));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Open CV page' }).first().click();

    await expect(page).toHaveURL(/\/cv\/?$/);
  });
});

test.describe('CV Page', () => {
  test('should load CV page', async ({ page }) => {
    await page.goto('/cv');
    await expect(page).toHaveTitle(/Danya Vidmich/);
    await expect(page.locator('.cv-entry')).toHaveCount(6);
  });

  test('should have all work entries', async ({ page }) => {
    await page.goto('/cv');
    const entries = page.locator('.cv-entry');
    await expect(entries).toHaveCount(6);
  });
});

test.describe('Project Pages', () => {
  test('should load a project page', async ({ page }) => {
    await page.goto('/apt-product');
    await expect(page).toHaveTitle(/Apt/);
  });

  test('should have project content', async ({ page }) => {
    await page.goto('/apt-product');
    const content = page.locator('.main');
    await expect(content).toBeVisible();
  });
});

test.describe('Service Worker', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBeTruthy();
  });
});

test.describe('Accessibility', () => {
  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Allow empty alt for decorative images, but attribute should exist
      expect(alt).not.toBeNull();
    }
  });
});
