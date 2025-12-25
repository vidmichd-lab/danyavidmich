const selectors = [
  ".portfolio__hero",
  ".portfolio__columns .bigcard",
  ".portfolio__columns .card",
  ".graphic .bigcard",
  ".graphic .card",
  ".graphic .gallery-item",
  ".cv-entry",
  ".cv-duo-group",
  ".tag-collection.cv-duo__row",
];

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
        // Remove .reveal class after animation completes to prevent conflicts
        // This ensures cards stay visible and don't re-trigger animations
        setTimeout(() => {
          entry.target.classList.remove("reveal");
        }, 600); // Match transition duration (0.6s)
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
  }
);

selectors.forEach((selector) => {
  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
});

