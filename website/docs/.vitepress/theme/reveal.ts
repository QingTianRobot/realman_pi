// Scroll-reveal for documentation blocks: elements marked with v-reveal fade/slide in once, the first time
// they enter the viewport. Without IntersectionObserver or with reduced motion they are simply visible.
import type { Directive } from "vue";

let observer: IntersectionObserver | undefined;

function getObserver(): IntersectionObserver | undefined {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return undefined;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  return observer;
}

export const vReveal: Directive<HTMLElement> = {
  mounted(element) {
    element.classList.add("doc-reveal");
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const active = getObserver();
    if (!active || reduced) {
      element.classList.add("is-visible");
      return;
    }
    active.observe(element);
  },
  unmounted(element) {
    observer?.unobserve(element);
  },
};
