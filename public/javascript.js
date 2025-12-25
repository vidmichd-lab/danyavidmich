(function () {
  // Placeholder not needed - using native lazy loading with CSS blur effect
  var EAGER_THRESHOLD = 4;

  var scrollTrigger = null;

  function markLoaded(target) {
    target.classList.add("lazy-loaded");
    target.classList.remove("lazy-media");
  }

  function applyLoadingStyles(target) {
    target.classList.add("lazy-media");

    if ("complete" in target && target.complete) {
      markLoaded(target);
    } else {
      target.classList.remove("lazy-loaded");
    }
  }

  function toggleScrollTriggerVisibility() {
    if (!scrollTrigger) {
      return;
    }

    var shouldShow = window.scrollY > 20;
    scrollTrigger.style.display = shouldShow ? "block" : "none";
  }

  function hydrateScrollTrigger() {
    scrollTrigger = document.getElementById("title1");

    if (!scrollTrigger) {
      return;
    }

    toggleScrollTriggerVisibility();
    window.addEventListener("scroll", toggleScrollTriggerVisibility, { passive: true });

    // Handle click for scroll to top
    scrollTrigger.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function hydrateImages() {
    try {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          var img = entry.target;
            if (img && observer) {
          observer.unobserve(img);
            }
          // Image is in viewport - native lazy loading will handle it
          // CSS blur effect will be removed when image loads via 'load' event
        });
      },
      { rootMargin: "300px 0px", threshold: 0.01 }
    );

      var images = document.querySelectorAll("img");
      if (!images || images.length === 0) return;

      images.forEach(function (image, index) {
      var shouldKeepEager =
        index < EAGER_THRESHOLD ||
        image.loading === "eager" ||
        image.getAttribute("fetchpriority") === "high" ||
        image.dataset.skipLazy === "true";

      if (!image.hasAttribute("decoding")) {
        image.decoding = "async";
      }

      applyLoadingStyles(image);
      image.addEventListener(
        "load",
        function () {
          markLoaded(image);
        },
        { once: true }
      );

      if (shouldKeepEager) {
        image.loading = "eager";
        return;
      }

      // Use native lazy loading - don't override src with placeholder
      // The browser will handle lazy loading automatically
      image.loading = "lazy";
      
      // Only observe for IntersectionObserver if we need to track loading state
      // Native lazy loading handles the actual loading
      try {
      observer.observe(image);
      } catch (error) {
        // Silently fail if observer can't observe image
      }
    });
    } catch (error) {
      // Silently fail if IntersectionObserver is not supported
    }
  }

  function hydrateIframes() {
    document.querySelectorAll("iframe").forEach(function (frame) {
      if (!frame.hasAttribute("loading")) {
        frame.loading = "lazy";
      }

      applyLoadingStyles(frame);
      frame.addEventListener(
        "load",
        function () {
          markLoaded(frame);
        },
        { once: true }
      );
    });
  }

  function hydrateButtons() {
    // Handle button clicks using data-action attribute instead of onclick
    document.querySelectorAll('.circle-button[data-action]').forEach(function(button) {
      var action = button.getAttribute('data-action');
      if (!action) return;
      
      button.addEventListener('click', function(e) {
        e.preventDefault();
        try {
          if (action === 'cv') {
            window.location.href = '/cv/';
          } else if (action.startsWith('mailto:')) {
            window.location.href = action;
          } else if (action.startsWith('/') || action.startsWith('http')) {
            window.location.href = action;
          }
        } catch (error) {
          // Silently fail if there's an error
        }
      });
    });
  }

  function hydrateReveal() {
    try {
    var selectors = [
      ".portfolio__hero",
      ".portfolio__columns .bigcard",
      ".portfolio__columns .card",
      ".graphic .bigcard",
      ".graphic .card",
      ".graphic .gallery-item",
      ".cv-entry",
      ".cv-duo-group",
      ".tag-collection.cv-duo__row"
    ];

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
            // Remove .reveal class after animation completes using transitionend event
            // This ensures cards stay visible and don't re-trigger animations
            var handleTransitionEnd = function(e) {
              // Only handle transitions on the target element itself, not children
              if (e.target === entry.target) {
                entry.target.classList.remove("reveal");
                entry.target.removeEventListener("transitionend", handleTransitionEnd);
              }
            };
            entry.target.addEventListener("transitionend", handleTransitionEnd, { once: true });
            // Fallback: remove after timeout if transitionend doesn't fire
            setTimeout(function() {
              if (entry.target.classList.contains("reveal")) {
                entry.target.classList.remove("reveal");
                entry.target.removeEventListener("transitionend", handleTransitionEnd);
              }
            }, 700); // Slightly longer than transition duration
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    selectors.forEach(function (selector) {
        try {
          var elements = document.querySelectorAll(selector);
          if (elements && elements.length > 0) {
            elements.forEach(function (element) {
              if (element) {
        element.classList.add("reveal");
        observer.observe(element);
              }
      });
          }
        } catch (error) {
          // Silently fail if selector fails
        }
      });
    } catch (error) {
      // Silently fail if IntersectionObserver is not supported
    }
  }

  function hydrateMobileFiltersSticky() {
    var mobileFilters = document.querySelector(".mobile-filters-actions");
    if (!mobileFilters) return;

    var header = document.querySelector(".header");
    if (!header) return;

    function getFiltersInitialTop() {
      // Get the initial top position relative to document
      var rect = mobileFilters.getBoundingClientRect();
      return rect.top + window.scrollY;
    }

    function updateStickyState() {
      var headerHeight = header.offsetHeight; // 64px on mobile
      var scrollY = window.scrollY;
      var filtersInitialTop = getFiltersInitialTop();
      
      // When scrolled past the initial position of filters, make them stick to header
      if (scrollY >= filtersInitialTop - headerHeight) {
        mobileFilters.classList.add("is-stuck");
      } else {
        mobileFilters.classList.remove("is-stuck");
      }
    }

    // Wait for layout to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function() {
        setTimeout(updateStickyState, 100);
      });
    } else {
      setTimeout(updateStickyState, 100);
    }

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState, { passive: true });
  }

  function hydrateScrollUpButton() {
    var scrollUpButton = document.getElementById("scroll-up-button");
    if (!scrollUpButton) return;

    function toggleScrollUpVisibility() {
      var shouldShow = window.scrollY > 300; // Show after scrolling 300px
      if (shouldShow) {
        scrollUpButton.classList.add("visible");
      } else {
        scrollUpButton.classList.remove("visible");
      }
    }

    toggleScrollUpVisibility();
    window.addEventListener("scroll", toggleScrollUpVisibility, { passive: true });

    // Handle click - check if it's email button or scroll to top
    scrollUpButton.addEventListener("click", function (e) {
      e.preventDefault();
      var action = scrollUpButton.getAttribute("data-action");
      if (action && action.startsWith("mailto:")) {
        window.location.href = action;
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function hydrate() {
    hydrateScrollTrigger();
    hydrateImages();
    hydrateIframes();
    hydrateReveal();
    hydrateButtons();
    hydrateMobileFiltersSticky();
    hydrateScrollUpButton();

    // Handle all scroll-to-top buttons
    document.querySelectorAll("[data-scroll-to-top]").forEach(function (button) {
      button.addEventListener("click", function (e) {
        e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        hydrate();
        initAnalytics();
      },
      { once: true }
    );
  } else {
    hydrate();
    initAnalytics();
  }
  
  // Yandex Metrika tracking
  function trackEvent(category, action, label) {
    if (typeof ym !== "undefined") {
      ym(93372850, "reachGoal", category + "_" + action, { label: label });
    }
  }
  
  function initAnalytics() {
    // Track project clicks
    document.querySelectorAll("a[href*='/']").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
      
      link.addEventListener("click", function () {
        var card = link.closest(".bigcard");
        var projectName = card ? (card.querySelector("p")?.textContent || "Unknown") : link.textContent?.trim() || "Unknown";
        trackEvent("Project", "Click", projectName);
      });
    });
    
    // Track filter usage
    var filterButtons = document.querySelectorAll(".filter-button");
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.dataset.filter || "all";
        trackEvent("Filter", "Use", filter);
      });
    });
  }
})();

