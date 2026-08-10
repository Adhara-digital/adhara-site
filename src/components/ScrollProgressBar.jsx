import { useEffect, useState } from "react";

/* Petit trait rouge sur le côté, glisse selon la progression du scroll
   (remplace la scrollbar native masquée). */
export default function ScrollProgressBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scrollrail" aria-hidden="true">
      <span className="scrollrail__thumb" style={{ top: `calc(${p} * (100% - 64px))` }} />
    </div>
  );
}
