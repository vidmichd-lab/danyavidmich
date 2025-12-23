// Analytics tracking
export function trackEvent(category: string, action: string, label?: string) {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
  
  // Yandex Metrika
  if (typeof ym !== 'undefined') {
    ym(93372850, 'reachGoal', `${category}_${action}`, { label });
  }
  
  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics:', { category, action, label });
  }
}

// Track project clicks
export function initProjectTracking() {
  document.querySelectorAll('a[href*="/"]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
    
    link.addEventListener('click', () => {
      const projectName = link.closest('.bigcard')?.querySelector('p')?.textContent || 
                         link.textContent?.trim() || 
                         'Unknown';
      trackEvent('Project', 'Click', projectName);
    });
  });
}

// Track filter usage
export function trackFilter(filter: string) {
  trackEvent('Filter', 'Use', filter);
}

// Initialize on page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectTracking);
  } else {
    initProjectTracking();
  }
}

