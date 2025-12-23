// Image loading indicator
export function initImageLoader() {
  const images = document.querySelectorAll('img[loading="lazy"], img:not([loading="eager"])');
  
  images.forEach((img) => {
    if (img instanceof HTMLImageElement) {
      const container = img.closest('.image-container') || img.parentElement;
      if (!container) return;
      
      // Create loading indicator
      const loading = document.createElement('div');
      loading.className = 'image-loading';
      container.classList.add('image-container');
      container.insertBefore(loading, img);
      
      // Handle load
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => {
          img.classList.add('loaded');
        });
        
        img.addEventListener('error', () => {
          loading.remove();
        });
      }
    }
  });
}

// Initialize on page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageLoader);
  } else {
    initImageLoader();
  }
}

