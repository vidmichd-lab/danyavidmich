(function() {
  function initFilters() {
    var filters = document.getElementById('portfolio-filters') || document.getElementById('portfolio-filters-desktop');
    if (!filters) return;
    
    var buttons = filters.querySelectorAll('.filter-button');
    var cards = document.querySelectorAll('.portfolio__column .bigcard');
    var columnsContainer = document.querySelector('.portfolio__columns');
    
    for (var i = 0; i < buttons.length; i++) {
      (function(button) {
        button.addEventListener('click', function() {
          var filter = button.dataset.filter;
          
          for (var j = 0; j < buttons.length; j++) {
            buttons[j].classList.remove('filter-button--active');
          }
          button.classList.add('filter-button--active');
          
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
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilters);
  } else {
    initFilters();
  }
})();

