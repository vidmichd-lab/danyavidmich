// Image error handling
(function() {
  const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23eaebec'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial' font-size='16'%3EImage not available%3C/text%3E%3C/svg%3E";
  
  function handleImageError(img) {
    if (img.src !== PLACEHOLDER_IMAGE && !img.dataset.errorHandled) {
      img.dataset.errorHandled = 'true';
      img.src = PLACEHOLDER_IMAGE;
      img.alt = img.alt || 'Image not available';
      img.style.opacity = '0.7';
    }
  }
  
  function initImageErrorHandling() {
    // Handle existing images
    document.querySelectorAll('img').forEach(function(img) {
      if (!img.complete || img.naturalHeight === 0) {
        img.addEventListener('error', function() {
          handleImageError(this);
        });
      }
    });
    
    // Handle dynamically added images
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG') {
              node.addEventListener('error', function() {
                handleImageError(this);
              });
            }
            node.querySelectorAll('img').forEach(function(img) {
              img.addEventListener('error', function() {
                handleImageError(this);
              });
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageErrorHandling);
  } else {
    initImageErrorHandling();
  }
})();

