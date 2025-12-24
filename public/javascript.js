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
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          var img = entry.target;
          observer.unobserve(img);
          // Image is in viewport - native lazy loading will handle it
          // CSS blur effect will be removed when image loads via 'load' event
        });
      },
      { rootMargin: "300px 0px", threshold: 0.01 }
    );

    document.querySelectorAll("img").forEach(function (image, index) {
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
      observer.observe(image);
    });
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

  function hydrateReveal() {
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
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        element.classList.add("reveal");
        observer.observe(element);
      });
    });
  }

  function hydrate() {
    hydrateScrollTrigger();
    hydrateImages();
    hydrateIframes();
    hydrateReveal();

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
  
  // Analytics tracking
  function trackEvent(category, action, label) {
    if (typeof gtag !== "undefined") {
      gtag("event", action, {
        event_category: category,
        event_label: label
      });
    }
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

