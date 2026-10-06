import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/* ============================================================
   Constellation du Grand Chien — bloc « À propos ».

   Sept étoiles aux positions réelles, rendues comme des sphères
   lumineuses qui rayonnent (bloom). Pas de tracés entre elles :
   le relief se lit par la PARALLAXE — quand l'objet tourne, les
   étoiles proches défilent plus vite que les lointaines. D'où
   l'écartement en profondeur accentué (DEPTH_SPREAD).

   ÉTAPE 1 (faite) : forme, rayonnement, rotation, glissement.
   ÉTAPE 2 (à venir) : clic sur les étoiles actives, cartes en
   superposition, ralentissement du fond. La structure est prête :
   le champ `key` de NODES servira de lien vers le contenu.
   ============================================================ */

/* Positions relevées sur le ciel réel — x et y entre 0 et 1,
   `mag` est la magnitude apparente (plus elle est basse, plus
   l'étoile est brillante ; Sirius, à -1,46, est la plus brillante
   du ciel nocturne).

   7 étoiles retenues, en accord avec le nombre de nœuds du logo.
   Les trois écartées — Theta, Iota et Muliphein, de magnitude
   supérieure à 4, donc parmi les plus faibles — étaient les moins
   structurantes du dessin. Pour en réactiver une : la remettre ici
   avec ses coordonnées. */
const CANIS = {
  sirius: { x: 0.61, y: 0.23, mag: -1.46 },
  mirzam: { x: 0.96, y: 0.29, mag: 1.98 },
  omicron: { x: 0.47, y: 0.58, mag: 3.02 },
  wezen: { x: 0.25, y: 0.7, mag: 1.83 },
  adhara: { x: 0.4, y: 0.83, mag: 1.5, brand: true },
  aludra: { x: 0.0, y: 0.84, mag: 2.45 },
  furud: { x: 1.0, y: 0.88, mag: 3.02 },
};

/* ------------------------------------------------------------
   Affectation des contenus aux étoiles.

   RÈGLE — « jamais de nœud mort » : une étoile absente de cette
   liste n'est PAS cliquable et reste sobre. Elle fait partie du
   dessin, elle ne prétend pas être un bouton. Pour activer une
   étoile plus tard, il suffit de l'ajouter ici : le composant
   s'adapte, aucun autre fichier n'est à toucher.

   Adhara reçoit l'ambition, et non une biographie : c'est
   l'étoile qui donne son nom à l'entreprise.
   ------------------------------------------------------------ */
export const NODES = {
  adhara: { key: "ambition", label: "Notre ambition" },
  sirius: { key: "valeurs", label: "Nos valeurs" },
  wezen: { key: "nicolas", label: "Nicolas Scalais" },
  mirzam: { key: "maxime", label: "Maxime Cavallari" },
};

const SPREAD = 46;

/* Écartement en profondeur. À 1, les étoiles sont presque coplanaires
   et la rotation se lit mal ; à 2,6 la parallaxe devient nette. */
const DEPTH_SPREAD = 2.6;

/* Réglages du rayonnement : force, rayon, seuil. Un seuil bas fait
   rayonner aussi les petites étoiles, un seuil haut le réserve aux
   plus brillantes. */
const BLOOM = { strength: 1.1, radius: 0.75, threshold: 0.18 };

export default function AboutConstellation() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    /* Respect du réglage système « réduire les animations » : l'objet
       ne s'affiche alors pas du tout, le texte de la section reste. */
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    /* Certains navigateurs et machines n'ont pas de WebGL. On sort
       proprement plutôt que de laisser une erreur casser la page. */
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch {
      return;
    }

    /* Fond noir OPAQUE : le bloom ne sait pas gérer la transparence
       (il la remplace par du noir). C'est le CSS qui rend ce noir
       invisible — `mix-blend-mode: screen` sur le canvas, voir
       .constel__canvas dans website-styles.css. */
    renderer.setClearColor(0x000000, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
    camera.position.z = 72;

    const group = new THREE.Group();
    scene.add(group);

    /* Position 3D de chaque étoile. Le z est dérivé de la magnitude :
       les étoiles brillantes sont placées plus près. */
    const pos = {};
    for (const k in CANIS) {
      const s = CANIS[k];
      const depth = ((s.mag + 1.5) * 1.7 - 6) * DEPTH_SPREAD;
      pos[k] = new THREE.Vector3(
        (s.x - 0.5) * SPREAD,
        (0.5 - s.y) * SPREAD * 1.02,
        -depth
      );
    }

    /* --- Les étoiles : sphères lumineuses pures ---
       MeshBasicMaterial ne réagit pas à la lumière, c'est voulu : une
       étoile émet, elle ne reçoit pas. Le rayonnement vient du bloom. */
    const geo = new THREE.SphereGeometry(1, 24, 16);
    const stars = [];
    for (const k in CANIS) {
      const s = CANIS[k];
      const active = !!NODES[k];
      const brand = !!s.brand;
      const isSirius = k === "sirius";

      /* Adhara et Sirius à la même taille : ce sont les deux pôles de
         la constellation. Seule la teinte les distingue. */
      const radius = isSirius || brand
        ? 1.9
        : active
          ? 1.35
          : Math.max(0.45, Math.min(0.85, 0.95 - s.mag * 0.08));
      const tint = brand ? 0xff6a52 : isSirius ? 0xffffff : active ? 0xffe4e0 : 0x9a9ab2;

      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: tint }));
      mesh.position.copy(pos[k]);
      mesh.scale.setScalar(radius);
      mesh.userData = {
        name: k, active, radius,
        phase: Math.random() * 6.28,
        speed: 0.7 + Math.random() * 0.8,
      };
      group.add(mesh);
      stars.push(mesh);
    }

    /* --- Post-traitement : le bloom --- */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(1, 1), BLOOM.strength, BLOOM.radius, BLOOM.threshold
    );
    composer.addPass(bloom);
    let useBloom = true;

    /* --- Dimensionnement --- */
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(r.width, r.height);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* --- Mise en pause hors écran ---
       Tant que le bloc « À propos » n'est pas visible, on ne calcule
       rien : c'est ce qui rend acceptable une seconde scène 3D sur
       la page. */
    let visible = false;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) {
          last = performance.now();
          loop();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    /* --- Animation --- */
    let last = performance.now();
    let t = 0;    // temps continu : sert à la pulsation des étoiles
    let auto = 0; // temps de la rotation automatique, suspendu pendant le geste
    const slow = { v: 1 }; // facteur de ralentissement, utilisé à l'étape 2

    /* Mesure de charge : sur une machine faible, le bloom (trois passes
       de rendu) fait chuter la fluidité. On observe les 90 premières
       images ; si la moyenne dépasse 30 ms, le bloom est coupé et la
       scène revient à un rendu simple. */
    let sampled = 0;
    let sampledMs = 0;

    /* ---------- Glissement à la souris et au doigt ----------
       `drag` est l'angle ajouté par l'utilisateur, `inertia` la vitesse
       résiduelle après le relâchement. AXE VERTICAL : mécanique écrite
       mais désactivée (AXIS_Y) ; l'activer impose de passer
       `touch-action` sur `none` dans le CSS. */
    const AXIS_Y = false;
    let drag = 0, dragY = 0;
    let inertia = 0, inertiaY = 0;
    let dragging = false;
    let lastX = 0, lastY = 0;
    let moved = 0; // pixels parcourus : distinguera clic et glissement à l'étape 2

    const onDown = (e) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      drag += dx * 0.008;
      inertia = dx * 0.008;
      if (AXIS_Y) {
        dragY = Math.max(-0.6, Math.min(0.6, dragY + dy * 0.006));
        inertiaY = dy * 0.006;
      }
    };
    const onUp = (e) => {
      dragging = false;
      canvas.releasePointerCapture?.(e.pointerId);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    function loop() {
      if (!visible) { raf = 0; return; }
      raf = requestAnimationFrame(loop);

      const now = performance.now();
      const frameMs = now - last;
      const dt = Math.min(frameMs / 1000, 0.05);
      last = now;
      t += dt * slow.v;

      if (useBloom && sampled < 90) {
        sampled++;
        sampledMs += frameMs;
        if (sampled === 90 && sampledMs / sampled > 30) useBloom = false;
      }

      /* Inertie : 0.94 par image donne un arrêt en une seconde environ. */
      if (!dragging) {
        drag += inertia;
        inertia *= 0.94;
        if (Math.abs(inertia) < 0.00002) inertia = 0;
        if (AXIS_Y) {
          dragY = Math.max(-0.6, Math.min(0.6, dragY + inertiaY));
          inertiaY *= 0.94;
          if (Math.abs(inertiaY) < 0.00002) inertiaY = 0;
        }
        auto += dt * slow.v;
      }
      /* Pendant le geste, la rotation automatique est suspendue :
         l'objet ne suit que le curseur. Au relâchement elle reprend
         depuis sa position, sans saut. */

      group.rotation.y = Math.sin(auto * 0.16) * 0.55 + auto * 0.055 + drag;
      group.rotation.x = Math.sin(auto * 0.11) * 0.13 + dragY;

      /* Pulsation : seules les étoiles actives battent, ce qui distingue
         au premier regard ce qui est cliquable. */
      for (const m of stars) {
        const u = m.userData;
        const k = u.active ? 1 + Math.sin(t * u.speed + u.phase) * 0.07 : 1;
        m.scale.setScalar(u.radius * k);
      }

      if (useBloom) composer.render();
      else renderer.render(scene, camera);
    }

    /* --- Nettoyage --- */
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      geo.dispose();
      for (const m of stars) m.material.dispose();
      bloom.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="constel">
      <canvas ref={ref} className="constel__canvas" aria-hidden="true" />
    </div>
  );
}
