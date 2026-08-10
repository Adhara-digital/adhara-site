import { useEffect } from "react";

/* Fondu d'apparition/disparition au scroll : bascule .in sur les
   éléments .reveal selon qu'ils sont à l'écran ou non (dans les deux
   sens — contrairement à une révélation "une seule fois", l'élément
   se refond dans le décor en sortant du cadre, puis en émerge à
   nouveau s'il revient à l'écran). */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle("in", e.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
