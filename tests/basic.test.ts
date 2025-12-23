import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Build output verification', () => {
  it('should have index.html in dist', () => {
    const distPath = join(process.cwd(), 'dist', 'index.html');
    expect(existsSync(distPath)).toBe(true);
    const content = readFileSync(distPath, 'utf-8');
    expect(content).toBeTruthy();
    expect(content).toContain('<!DOCTYPE html>');
  });

  it('should have CV page', () => {
    const cvPath = join(process.cwd(), 'dist', 'cv', 'index.html');
    expect(existsSync(cvPath)).toBe(true);
    const content = readFileSync(cvPath, 'utf-8');
    expect(content).toBeTruthy();
    expect(content).toContain('Danya Vidmich');
  });

  it('should have sitemap.xml', () => {
    const sitemapPath = join(process.cwd(), 'dist', 'sitemap.xml');
    expect(existsSync(sitemapPath)).toBe(true);
    const content = readFileSync(sitemapPath, 'utf-8');
    expect(content).toBeTruthy();
    expect(content).toContain('<?xml');
    expect(content).toContain('<urlset');
  });

  it('should have robots.txt', () => {
    const robotsPath = join(process.cwd(), 'dist', 'robots.txt');
    expect(existsSync(robotsPath)).toBe(true);
    const content = readFileSync(robotsPath, 'utf-8');
    expect(content).toBeTruthy();
    expect(content).toContain('User-agent');
  });

  it('should have service worker', () => {
    const swPath = join(process.cwd(), 'dist', 'sw.js');
    expect(existsSync(swPath)).toBe(true);
    const content = readFileSync(swPath, 'utf-8');
    expect(content).toBeTruthy();
    expect(content).toContain('Service Worker');
  });
});

describe('SEO verification', () => {
  it('should have OG tags in index.html', () => {
    const indexPath = join(process.cwd(), 'dist', 'index.html');
    expect(existsSync(indexPath)).toBe(true);
    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toContain('og:title');
    expect(content).toContain('og:description');
    expect(content).toContain('og:image');
  });

  it('should have canonical URLs', () => {
    const indexPath = join(process.cwd(), 'dist', 'index.html');
    expect(existsSync(indexPath)).toBe(true);
    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toContain('rel="canonical"');
  });
});

describe('Security headers', () => {
  it('should have web.config with security headers', () => {
    const configPath = join(process.cwd(), 'dist', 'web.config');
    expect(existsSync(configPath)).toBe(true);
    const content = readFileSync(configPath, 'utf-8');
    expect(content).toContain('X-Content-Type-Options');
    expect(content).toContain('Content-Security-Policy');
  });
});

