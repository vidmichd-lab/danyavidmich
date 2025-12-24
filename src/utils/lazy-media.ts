// Blur hash placeholder - low quality base64 encoded image with blur effect
export const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Cdefs%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='800' height='450' fill='%23eaebec' filter='url(%23blur)'/%3E%3C/svg%3E";

export const EAGER_THRESHOLD = 4;

export type LoadableElement = HTMLImageElement | HTMLIFrameElement;

export const markLoaded = (target: LoadableElement): void => {
  target.classList.add("lazy-loaded");
  target.classList.remove("lazy-media");
};

export const applyLoadingStyles = (target: LoadableElement): void => {
  target.classList.add("lazy-media");

  if ("complete" in target && target.complete) {
    markLoaded(target);
  } else {
    target.classList.remove("lazy-loaded");
  }
};

export const shouldKeepEager = (index: number, image: HTMLImageElement): boolean =>
  index < EAGER_THRESHOLD ||
  image.loading === "eager" ||
  image.getAttribute("fetchpriority") === "high" ||
  image.dataset.skipLazy === "true";

