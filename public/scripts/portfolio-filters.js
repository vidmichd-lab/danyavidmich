(function() {
  function setupFilterLogic(filtersContainer) {
    if (!filtersContainer) return;
    
    var buttons = filtersContainer.querySelectorAll('.filter-button');
    var cards = document.querySelectorAll('.portfolio__column .bigcard');
    var columnsContainer = document.querySelector('.portfolio__columns');
    
    for (var i = 0; i < buttons.length; i++) {
      (function(button) {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          var filter = button.dataset.filter;
          
          // Update active state for all filter containers
          var allFilterContainers = document.querySelectorAll('.portfolio-filters');
          allFilterContainers.forEach(function(container) {
            var containerButtons = container.querySelectorAll('.filter-button');
            for (var j = 0; j < containerButtons.length; j++) {
              containerButtons[j].classList.remove('filter-button--active');
              if (containerButtons[j].dataset.filter === filter) {
                containerButtons[j].classList.add('filter-button--active');
              }
            }
          });
          
          if (filter === 'all') {
            if (columnsContainer) {
              columnsContainer.classList.remove('portfolio__columns--filtered');
            }
          } else {
            if (columnsContainer) {
              columnsContainer.classList.add('portfolio__columns--filtered');
            }
          }
          
          for (var k = 0; k < cards.length; k++) {
            (function(card) {
              var cardTag = card.dataset.tag || '';
              var shouldShow = filter === 'all' || cardTag === filter;
              
              if (shouldShow) {
                card.style.display = '';
                setTimeout(function() {
                  card.style.opacity = '1';
                  card.style.transform = 'scale(1)';
                }, 10);
              } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(function() {
                  card.style.display = 'none';
                }, 200);
              }
            })(cards[k]);
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
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilters);
  } else {
    initFilters();
  }
})();

