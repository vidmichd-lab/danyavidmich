import {
  applyLoadingStyles,
  markLoaded,
  PLACEHOLDER,
  shouldKeepEager
} from "@utils/lazy-media";

declare global {
  interface Window {
    topFunction?: () => void;
  }
}

let scrollTrigger: HTMLElement | null = null;

const toggleScrollTriggerVisibility = () => {
  if (!scrollTrigger) {
    return;
  }

  const shouldShow = window.scrollY > 20;
  scrollTrigger.style.display = shouldShow ? "block" : "none";
};

const hydrateScrollTrigger = () => {
  scrollTrigger = document.getElementById("title1");

  if (!scrollTrigger) {
    return;
  }

  toggleScrollTriggerVisibility();
  window.addEventListener("scroll", toggleScrollTriggerVisibility, { passive: true });
};

const hydrateImages = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const img = entry.target as HTMLImageElement;
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

  const images = document.querySelectorAll<HTMLImageElement>("img");

  images.forEach((image, index) => {
    const keepEager = shouldKeepEager(index, image);
    if (!image.hasAttribute("decoding")) {
      image.decoding = "async";
    }

    applyLoadingStyles(image);
    image.addEventListener("load", () => markLoaded(image), { once: true });

    if (keepEager) {
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
};

const hydrateIframes = () => {
  const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");

  iframes.forEach((frame) => {
    if (!frame.hasAttribute("loading")) {
      frame.loading = "lazy";
    }

    applyLoadingStyles(frame);
    frame.addEventListener("load", () => markLoaded(frame), { once: true });
  });
};

const hydrate = () => {
  hydrateScrollTrigger();
  hydrateImages();
  hydrateIframes();

  window.topFunction = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", hydrate, { once: true });
} else {
  hydrate();
}

export {};

