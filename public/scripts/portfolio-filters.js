(function() {
  function setupFilterLogic(filtersContainer) {
    if (!filtersContainer) return;
    
    var buttons = filtersContainer.querySelectorAll('.filter-button');
    if (!buttons || buttons.length === 0) return;

    for (var i = 0; i < buttons.length; i++) {
      (function(button) {
        button.addEventListener('click', function(e) {
          if (e.defaultPrevented) return;
          e.preventDefault();
          e.stopPropagation();
          
          var filter = button.dataset.filter;
          
          // Update active state for all filter containers
          try {
          var allFilterContainers = document.querySelectorAll('.portfolio-filters');
            if (allFilterContainers && allFilterContainers.length > 0) {
          allFilterContainers.forEach(function(container) {
                if (!container) return;
            var containerButtons = container.querySelectorAll('.filter-button');
            for (var j = 0; j < containerButtons.length; j++) {
                  if (containerButtons[j]) {
              containerButtons[j].classList.remove('filter-button--active');
              if (containerButtons[j].dataset.filter === filter) {
                containerButtons[j].classList.add('filter-button--active');
                    }
              }
            }
          });
            }
          } catch (error) {
            // Silently fail if there's an error updating filter states
          }
          
          if (window.__applyPortfolioFilter) {
            window.__applyPortfolioFilter(filter);
          }
        });
      })(buttons[i]);
    }
  }
  
  function initFilters() {
    // Initialize both mobile and desktop filter containers
    var mobileFilters = document.getElementById('portfolio-filters');
    var desktopFilters = document.getElementById('portfolio-filters-desktop');
    
    setupFilterLogic(mobileFilters);
    setupFilterLogic(desktopFilters);

    if (window.__pendingPortfolioFilter) {
      window.__applyPortfolioFilter(window.__pendingPortfolioFilter);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilters);
  } else {
    initFilters();
  }
})();
