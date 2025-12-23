(function () {
  var PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%23F4F5F6'/%3E%3C/svg%3E";
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

          if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }

          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            delete img.dataset.srcset;
          }
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

      image.loading = "lazy";

      if (!image.dataset.src) {
        image.dataset.src = image.currentSrc || image.src;
      }

      if (!image.dataset.srcset && image.srcset) {
        image.dataset.srcset = image.srcset;
        image.removeAttribute("srcset");
      }

      if (image.dataset.src) {
        image.src = PLACEHOLDER;
      }

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

    window.topFunction = function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        hydrate();
      },
      { once: true }
    );
  } else {
    hydrate();
  }
})();

