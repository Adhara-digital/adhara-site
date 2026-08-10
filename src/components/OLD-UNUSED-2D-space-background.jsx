import { useEffect, useRef } from "react";

/* ============================================================
   Fond spatial VIVANT — carmin / rouge sang
   · champ d'étoiles très dense, en couches (parallax au scroll)
   · nébuleuses carmin qui dérivent
   · pluie de météorites (étoiles filantes)
   · constellation du Grand Chien (positions réelles), Adhara dominante
   ============================================================ */

const CANIS = {
  theta:     { x: 0.47, y: 0.00, mag: 4.07 },
  muliphein: { x: 0.32, y: 0.18, mag: 4.11 },
  sirius:    { x: 0.61, y: 0.23, mag: -1.46 },
  iota:      { x: 0.44, y: 0.24, mag: 4.37 },
  mirzam:    { x: 0.96, y: 0.29, mag: 1.98 },
  omicron:   { x: 0.47, y: 0.58, mag: 3.02 },
  wezen:     { x: 0.25, y: 0.70, mag: 1.83 },
  adhara:    { x: 0.40, y: 0.83, mag: 1.50, brand: true },
  aludra:    { x: 0.00, y: 0.84, mag: 2.45 },
  furud:     { x: 1.00, y: 0.88, mag: 3.02 }
};
const EDGES = [
  ["sirius", "mirzam"], ["sirius", "theta"], ["sirius", "iota"],
  ["iota", "omicron"], ["omicron", "wezen"], ["wezen", "aludra"],
  ["wezen", "adhara"], ["adhara", "furud"], ["muliphein", "theta"]
];

export default function OldUnused2DSpaceBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W, H, dpr, stars = [], nebulae = [], meteors = [], t = 0, nextMeteor = 60, raf;
    let scrollY = window.scrollY || 0;
    const pointer = { x: 0.5, y: 0.5 };
    const cs = {};

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildField(); buildNebulae(); placeConstellation();
    }

    function buildField() {
      const count = Math.round((W * H) / 300); // mosaïque dense
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 0.85 + 0.18,
          a: Math.random() * 0.4 + 0.1,
          red: Math.random() < 0.5,
          tw: Math.random() * Math.PI * 2,
          tws: Math.random() * 0.012 + 0.003,
          depth: Math.random() * 0.85 + 0.15   // couche de profondeur (parallax)
        });
      }
    }

    function buildNebulae() {
      nebulae = [
        { x: W * 0.72, y: H * 0.28, r: Math.max(W, H) * 0.42, phase: 0, col: [143, 23, 23] },
        { x: W * 0.15, y: H * 0.75, r: Math.max(W, H) * 0.36, phase: 2.1, col: [110, 16, 16] },
        { x: W * 0.50, y: H * 1.05, r: Math.max(W, H) * 0.40, phase: 4.0, col: [130, 20, 20] }
      ];
    }

    function placeConstellation() {
      const small = W < 760;
      const bw = small ? Math.min(W * 0.72, 420) : Math.min(W * 0.42, 600);
      const bh = bw * 1.02;
      const ox = small ? (W - bw) / 2 : W * 0.50;
      const oy = small ? H * 0.10 : H * 0.13;
      for (const k in CANIS) {
        const s = CANIS[k];
        cs[k] = { x: ox + s.x * bw, y: oy + s.y * bh, mag: s.mag, brand: s.brand };
      }
    }

    const coreRadius = (mag) => Math.max(1.05, 1.3 + (2.5 - mag) * 0.5);
    const wrap = (v, m) => ((v % m) + m) % m;

    // Adhara — étoile NÉON : blanc incandescent + bloom rouge additif + éclat en croix
    function neonAdhara(x, y) {
      const pulse = reduce ? 1 : 1 + Math.sin(t * 0.06) * 0.16;
      const R = 50 * pulse;
      ctx.save();
      ctx.globalCompositeOperation = "lighter"; // additif → effet néon lumineux

      // 1) grand halo rouge néon
      let g1 = ctx.createRadialGradient(x, y, 0, x, y, R);
      g1.addColorStop(0, "rgba(255,150,130,0.55)");
      g1.addColorStop(0.28, "rgba(199,48,42,0.38)");
      g1.addColorStop(1, "rgba(143,23,23,0)");
      ctx.fillStyle = g1;
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();

      // 2) cœur blanc incandescent (blanc → rouge)
      let g2 = ctx.createRadialGradient(x, y, 0, x, y, 15 * pulse);
      g2.addColorStop(0, "rgba(255,255,255,1)");
      g2.addColorStop(0.35, "rgba(255,240,236,0.95)");
      g2.addColorStop(0.7, "rgba(255,120,95,0.5)");
      g2.addColorStop(1, "rgba(255,60,50,0)");
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(x, y, 15 * pulse, 0, Math.PI * 2); ctx.fill();

      // 3) pointes de diffraction (starburst néon)
      const spike = R * 1.05;
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        const sg = ctx.createLinearGradient(x - dx * spike, y - dy * spike, x + dx * spike, y + dy * spike);
        sg.addColorStop(0, "rgba(255,255,255,0)");
        sg.addColorStop(0.5, "rgba(255,235,230,0.55)");
        sg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = sg; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x - dx * spike, y - dy * spike);
        ctx.lineTo(x + dx * spike, y + dy * spike);
        ctx.stroke();
      }
      ctx.restore();

      // 4) cœur blanc pur net (par-dessus)
      ctx.beginPath(); ctx.arc(x, y, 4.8 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
    }

    function spawnMeteor() {
      const depth = 0.4 + Math.random() * 0.6;
      const speed = 5 + depth * 11;
      const dir = Math.random() < 0.5 ? -1 : 1;                 // vers la gauche ou la droite
      const ax = dir * (0.55 + Math.random() * 0.35);
      const ay = 0.6 + Math.random() * 0.35;
      const norm = Math.hypot(ax, ay);
      meteors.push({
        x: dir < 0 ? Math.random() * W * 0.6 + W * 0.4 : Math.random() * W * 0.6,
        y: -30 + Math.random() * H * 0.25,
        vx: (ax / norm) * speed, vy: (ay / norm) * speed,
        len: 60 + speed * 7, depth
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const ox = (pointer.x - 0.5) * 16;
      const oy = (pointer.y - 0.5) * 12;
      const sc = reduce ? 0 : scrollY;

      // 1) nébuleuses carmin (dérive lente + parallax lointain)
      for (const n of nebulae) {
        const dx = reduce ? 0 : Math.sin(t * 0.004 + n.phase) * 40;
        const dy = reduce ? 0 : Math.cos(t * 0.003 + n.phase) * 30;
        const ny = n.y + dy - sc * 0.03;
        const g = ctx.createRadialGradient(n.x + dx, ny, 0, n.x + dx, ny, n.r);
        g.addColorStop(0, `rgba(${n.col[0]},${n.col[1]},${n.col[2]},0.16)`);
        g.addColorStop(0.5, `rgba(${n.col[0]},${n.col[1]},${n.col[2]},0.05)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // 2) champ d'étoiles très dense — parallax par profondeur
      for (const s of stars) {
        if (!reduce) s.tw += s.tws;
        const flick = reduce ? 1 : 0.6 + Math.sin(s.tw) * 0.4;
        const px = s.x + ox * s.depth;
        const py = wrap(s.y - sc * s.depth * 0.18 + oy * s.depth, H);
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.red
          ? `rgba(175,34,34,${s.a * flick})`      // rouge sang (#8F1717 éclairci pour rester visible)
          : `rgba(232,224,224,${s.a * flick})`;
        ctx.fill();
      }

      // 3) météorites (étoiles filantes)
      if (!reduce) {
        if (t >= nextMeteor && meteors.length < 3) {
          spawnMeteor();
          nextMeteor = t + 90 + Math.random() * 200;
        }
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.x += m.vx; m.y += m.vy;
          const sp = Math.hypot(m.vx, m.vy);
          const ux = m.vx / sp, uy = m.vy / sp;
          const tx = m.x - ux * m.len, ty = m.y - uy * m.len;
          const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
          grad.addColorStop(0, `rgba(255,235,232,${0.9 * m.depth})`);
          grad.addColorStop(0.25, `rgba(199,48,42,${0.55 * m.depth})`);
          grad.addColorStop(1, "rgba(143,23,23,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4 * m.depth + 0.4;
          ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
          // tête lumineuse
          ctx.beginPath(); ctx.arc(m.x, m.y, 1.3 * m.depth + 0.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,240,240,0.95)"; ctx.fill();
          if (m.x < -80 || m.x > W + 80 || m.y > H + 80) meteors.splice(i, 1);
        }
      }

      // 4) constellation — parallax léger (couche intermédiaire)
      const cpx = (p) => p.x + ox * 1.15;
      const cpy = (p) => p.y - sc * 0.05 + oy * 1.15;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(160,28,28,0.18)";
      for (const [a, b] of EDGES) {
        ctx.beginPath();
        ctx.moveTo(cpx(cs[a]), cpy(cs[a]));
        ctx.lineTo(cpx(cs[b]), cpy(cs[b]));
        ctx.stroke();
      }
      for (const k in cs) {
        const s = cs[k];
        const x = cpx(s), y = cpy(s);
        if (s.brand) { neonAdhara(x, y); continue; }        // Adhara : rendu néon dédié
        const cr = coreRadius(s.mag);
        const glowR = cr * 6;
        const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
        g.addColorStop(0, "rgba(255,225,223,0.55)");
        g.addColorStop(0.4, "rgba(160,30,30,0.16)");
        g.addColorStop(1, "rgba(143,23,23,0)");
        ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
      }

      t++;
      raf = requestAnimationFrame(draw);
    }

    const onMove = (e) => { pointer.x = e.clientX / W; pointer.y = e.clientY / H; };
    const onScroll = () => { scrollY = window.scrollY || 0; };

    size();
    draw();
    let rt;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(size, 150); };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
