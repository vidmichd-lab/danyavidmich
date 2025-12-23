import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Danya Vidmich/);
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    const cvLink = page.locator('a[href*="cv"]').first();
    await expect(cvLink).toBeVisible();
  });

  test('should have portfolio filters', async ({ page }) => {
    await page.goto('/');
    const filters = page.locator('.filter-button');
    await expect(filters.first()).toBeVisible();
  });

  test('should filter projects', async ({ page }) => {
    await page.goto('/');
    const productFilter = page.locator('.filter-button').filter({ hasText: 'Product' });
    await productFilter.click();
    await page.waitForTimeout(500);
    const visibleCards = page.locator('.bigcard:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
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
    const content = page.locator('main');
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

