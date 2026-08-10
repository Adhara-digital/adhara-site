import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ============================================================
   Constellation du Grand Chien, en volume — bloc « À propos ».

   ÉTAPE 1 : la forme et son mouvement. Aucune interaction ici ;
   le clic sur les nœuds et les cartes d'information arrivent à
   l'étape 2. La structure est déjà prévue pour les accueillir —
   voir NODES ci-dessous, dont le champ `key` servira de lien
   vers le contenu.

   Les coordonnées et les liens sont repris à l'identique du fond
   spatial (AnimatedSpaceBackground.jsx) : les deux constellations
   doivent coïncider, sans quoi le visiteur verrait deux dessins
   différents pour une même chose.
   ============================================================ */

/* Positions relevées sur le ciel réel — x et y entre 0 et 1,
   `mag` est la magnitude apparente (plus elle est basse, plus
   l'étoile est brillante ; Sirius, à -1,46, est la plus brillante
   du ciel nocturne).

   7 étoiles retenues, en accord avec le nombre de nœuds du logo.
   Un tracé de constellation ne montre jamais toutes les étoiles
   d'une région du ciel : il retient celles qui portent la figure.
   Les trois écartées ici — Theta, Iota et Muliphein, toutes de
   magnitude supérieure à 4 donc parmi les plus faibles — étaient
   les moins structurantes du dessin.

   Pour en réactiver une : la remettre ici avec ses coordonnées,
   puis rétablir ses liaisons dans EDGES. */
const CANIS = {
  sirius: { x: 0.61, y: 0.23, mag: -1.46 },
  mirzam: { x: 0.96, y: 0.29, mag: 1.98 },
  omicron: { x: 0.47, y: 0.58, mag: 3.02 },
  wezen: { x: 0.25, y: 0.7, mag: 1.83 },
  adhara: { x: 0.4, y: 0.83, mag: 1.5, brand: true },
  aludra: { x: 0.0, y: 0.84, mag: 2.45 },
  furud: { x: 1.0, y: 0.88, mag: 3.02 },
};

/* Liaisons ajustées au retrait de Theta et Iota : le chemin
   Sirius → Iota → Omicron devient Sirius → Omicron, ce qui
   préserve la continuité du tracé sans laisser d'étoile isolée. */
const EDGES = [
  ["sirius", "mirzam"], ["sirius", "omicron"],
  ["omicron", "wezen"], ["wezen", "aludra"],
  ["wezen", "adhara"], ["adhara", "furud"],
];

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

/* Texture d'étoile : un dégradé radial peint sur un petit canvas,
   puis appliqué sur chaque point. Bien moins coûteux que de
   modéliser des sphères, et le rendu est plus doux. */
function starTexture(core, mid, edge) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, core);
  grd.addColorStop(0.28, mid);
  grd.addColorStop(1, edge);
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export default function AboutConstellation() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    /* Respect du réglage système « réduire les animations ». Le
       composant ne s'affiche alors pas du tout : un objet 3D figé
       n'apporte rien et coûte quand même. Le texte de la section
       reste évidemment en place. */
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    /* Certains navigateurs et machines n'ont pas de WebGL. On sort
       proprement plutôt que de laisser une erreur casser la page. */
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas, antialias: true, alpha: true, powerPreference: "low-power",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /* Avec des matériaux physiques, ces deux réglages ne sont pas
       cosmétiques. Sans le mappage de tons, les zones lumineuses
       saturent en aplats blancs ; sans l'espace colorimétrique sRGB,
       l'ensemble paraît délavé. `toneMappingExposure` au-dessus de 1
       compense le fond sombre du site. */
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
    camera.position.z = 92;

    const group = new THREE.Group();
    scene.add(group);

    /* ---------- ÉCLAIRAGE ----------
       Sans lumière, un matériau physique reste noir. Trois sources,
       volontairement contrastées : c'est l'écart entre elles qui
       révèle le volume quand l'objet tourne.

       La lumière froide en contre-jour est ce qui donne l'aspect
       « instrument » plutôt que « ciel » : elle dessine un liseré
       bleuté sur le bord des sphères, comme un objet éclairé en
       studio. */
    scene.add(new THREE.AmbientLight(0x2a2a38, 1.4));

    const keyLight = new THREE.DirectionalLight(0xfff0ec, 2.1);
    keyLight.position.set(30, 40, 60);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6f8cff, 1.5);
    rimLight.position.set(-45, -20, -30);
    scene.add(rimLight);

    /* Une lumière rouge placée sur Adhara : la marque éclaire
       réellement la structure autour d'elle. Portée limitée pour
       que l'effet reste local. */
    const adharaLight = new THREE.PointLight(0xc82222, 26, 60, 2);
    scene.add(adharaLight);

    /* Position 3D de chaque étoile. Le z est dérivé de la magnitude :
       les étoiles brillantes sont placées plus près, ce qui donne du
       relief au survol de la rotation sans inventer de profondeur. */
    const pos = {};
    for (const k in CANIS) {
      const s = CANIS[k];
      const depth = (s.mag + 1.5) * 1.7 - 6;
      pos[k] = new THREE.Vector3(
        (s.x - 0.5) * SPREAD,
        (0.5 - s.y) * SPREAD * 1.02,
        -depth
      );
    }

    /* ---------- LES NŒUDS ----------
       Registre technologique : des icosaèdres, pas des sphères
       lisses. Les facettes accrochent la lumière différemment selon
       leur orientation, ce qui produit un scintillement géométrique
       quand l'objet tourne — un scintillement dû à la forme, non à
       une animation d'opacité. C'est ce qui distingue un objet
       construit d'un point lumineux.

       Chaque nœud actif est un assemblage de trois éléments :
         - le noyau facetté, en matériau physique (métal + émission)
         - une cage en fil de fer, légèrement plus grande
         - un halo additif, qui remplace le bloom (voir plus bas)   */

    /* Géométries partagées : une seule instance réutilisée par tous
       les nœuds. Les créer dans la boucle multiplierait la mémoire
       graphique par sept sans aucun bénéfice. */
    const coreGeo = new THREE.IcosahedronGeometry(1, 1);
    const cageGeo = new THREE.IcosahedronGeometry(1, 0);
    const haloGeo = new THREE.PlaneGeometry(1, 1);

    /* Le halo est une image plate tournée vers la caméra. C'est le
       remplacement du bloom : un vrai post-traitement demanderait
       de recalculer l'image deux à trois fois par frame, coûteux
       alors qu'une seconde scène 3D tourne déjà en fond de page.
       Un halo par géométrie coûte presque rien et suffit dès lors
       qu'il reste discret — ce qui est le registre visé. */
    const haloTex = starTexture(
      "rgba(255,255,255,0.55)", "rgba(255,160,150,0.20)", "rgba(200,34,34,0)"
    );

    const nodes3d = [];
    for (const k in CANIS) {
      const s = CANIS[k];
      const active = !!NODES[k];
      const brand = !!s.brand;
      const isSirius = k === "sirius";

      /* Adhara et Sirius : mêmes dimensions, seule la teinte diffère. */
      const radius = isSirius || brand ? 3.1 : active ? 2.3 : Math.max(0.75, Math.min(1.5, 1.7 - s.mag * 0.18));
      const tint = brand ? 0xc82222 : isSirius ? 0xffffff : active ? 0xffd8d4 : 0x8a8aa0;

      const holder = new THREE.Group();
      holder.position.copy(pos[k]);

      /* Noyau : MeshStandardMaterial réagit réellement à la lumière.
         `metalness` élevé et `roughness` bas donnent des reflets nets
         plutôt qu'un éclairage diffus — l'aspect métallique voulu.
         `emissive` fait que l'étoile brille d'elle-même en plus de
         recevoir la lumière. */
      const core = new THREE.Mesh(
        coreGeo,
        new THREE.MeshStandardMaterial({
          color: tint,
          emissive: tint,
          emissiveIntensity: active ? 0.85 : 0.25,
          metalness: 0.85,
          roughness: 0.22,
          flatShading: true, // facettes visibles : chaque face a sa teinte
        })
      );
      core.scale.setScalar(radius);
      holder.add(core);

      /* Cage filaire : l'arête technique. Elle tourne à contresens du
         noyau, ce qui crée un décalage visible sans rien animer
         d'autre. Réservée aux nœuds actifs — c'est un signal. */
      let cage = null;
      if (active) {
        cage = new THREE.Mesh(
          cageGeo,
          new THREE.MeshBasicMaterial({
            color: tint, wireframe: true,
            transparent: true, opacity: 0.34, depthWrite: false,
          })
        );
        cage.scale.setScalar(radius * 1.75);
        holder.add(cage);
      }

      /* Halo : plan additif, réorienté vers la caméra à chaque image. */
      const halo = new THREE.Mesh(
        haloGeo,
        new THREE.MeshBasicMaterial({
          map: haloTex, color: tint,
          transparent: true, depthWrite: false, depthTest: false,
          blending: THREE.AdditiveBlending,
          opacity: active ? 0.9 : 0.35,
        })
      );
      halo.scale.setScalar(radius * (active ? 7 : 4.5));
      holder.add(halo);

      group.add(holder);
      nodes3d.push({
        holder, core, cage, halo, name: k, active, brand, radius,
        phase: Math.random() * 6.28,
        speed: 0.7 + Math.random() * 0.8,
      });
    }

    /* ---------- LES LIAISONS ----------
       Des tubes, à l'intérieur du groupe qui tourne.

       C'est le changement décisif pour la cohésion 3D. Les bandes
       précédentes étaient réorientées face à la caméra à chaque
       image : elles gardaient une épaisseur constante, donc ne
       s'amincissaient jamais en perspective et ne passaient jamais
       derrière un nœud. L'œil y lisait un dessin plat.

       Un cylindre, lui, tourne avec la structure : il raccourcit
       quand il pointe vers le fond, s'épaissit quand il vient vers
       nous, et le tampon de profondeur le fait passer devant ou
       derrière les nœuds selon sa position réelle. C'est exactement
       ce qui manquait.

       radialSegments à 6 : suffisant à cette échelle, et l'arête
       reste perceptible — cohérent avec le registre technologique. */
    const links = [];
    const LINK_RADIUS = 0.16;
    const linkGeo = new THREE.CylinderGeometry(LINK_RADIUS, LINK_RADIUS, 1, 6, 1, true);
    const linkMat = new THREE.MeshStandardMaterial({
      color: 0xc82222,
      emissive: 0xc82222,
      emissiveIntensity: 0.55,
      metalness: 0.9,
      roughness: 0.35,
      transparent: true,
      opacity: 0.88,
    });

    /* Orientation d'un cylindre entre deux points : la géométrie de
       Three.js est alignée sur l'axe Y, on la fait donc pivoter du
       vecteur Y vers la direction voulue avec un quaternion. */
    const UP = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    for (const [a, b] of EDGES) {
      const va = pos[a], vb = pos[b];
      const mesh = new THREE.Mesh(linkGeo, linkMat);
      mesh.position.copy(va).add(vb).multiplyScalar(0.5);
      dir.subVectors(vb, va);
      mesh.scale.set(1, dir.length(), 1);
      mesh.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
      group.add(mesh);
      links.push(mesh);
    }

    /* --- Dimensionnement --- */
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* --- Mise en pause hors écran ---
       C'est ce qui rend acceptable d'avoir une seconde scène 3D sur
       la page : tant que le bloc « À propos » n'est pas visible, on
       ne calcule rien du tout. */
    let visible = false;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) loop();
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    /* --- Animation ---
       Rotation lente sur l'axe vertical, plus une oscillation douce
       sur l'horizontale : sans elle, le mouvement paraît mécanique.
       `slow` est le facteur de ralentissement que l'étape 2 mettra
       à profit quand une carte sera ouverte. */
    let raf = 0;
    let last = performance.now();
    let t = 0;    // temps continu : sert au scintillement des étoiles
    let auto = 0; // temps de la rotation automatique, suspendu pendant le geste
    const slow = { v: 1 };

    /* ---------- Glissement à la souris et au doigt ----------
       `drag` est l'angle ajouté par l'utilisateur, `inertia` la
       vitesse résiduelle après le relâchement — sans elle, l'objet
       s'arrête net et le geste paraît sec.

       AXE VERTICAL : la mécanique est déjà en place (dragY, sur
       l'axe X de rotation) mais neutralisée, comme convenu. Pour
       activer le multidirectionnel, passer AXIS_Y à true. */
    const AXIS_Y = false;

    let drag = 0, dragY = 0;
    let inertia = 0, inertiaY = 0;
    let dragging = false;
    let lastX = 0, lastY = 0;
    let moved = 0;

    const onDown = (e) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
      if (!raf && visible) loop();
    };

    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);

      /* Le facteur convertit des pixels en radians. Réglé pour qu'un
         glissement sur toute la largeur du canvas fasse un peu plus
         d'un demi-tour — assez pour explorer, pas au point de perdre
         ses repères. */
      drag += dx * 0.008;
      inertia = dx * 0.008;
      if (AXIS_Y) {
        dragY += dy * 0.006;
        /* Bornage vertical : au-delà, on regarderait la constellation
           par la tranche puis à l'envers, ce qui la rend illisible. */
        dragY = Math.max(-0.6, Math.min(0.6, dragY));
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
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt * slow.v;

      /* Inertie : la vitesse résiduelle décroît après le relâchement.
         0.94 par image donne un arrêt en une seconde environ. */
      if (!dragging) {
        drag += inertia;
        inertia *= 0.94;
        if (Math.abs(inertia) < 0.00002) inertia = 0;
        if (AXIS_Y) {
          dragY = Math.max(-0.6, Math.min(0.6, dragY + inertiaY));
          inertiaY *= 0.94;
          if (Math.abs(inertiaY) < 0.00002) inertiaY = 0;
        }
      }

      /* Pendant que le curseur est maintenu, l'objet ne suit QUE le
         geste : la rotation automatique est suspendue. `auto` cesse
         d'avancer, ce qui la fige à sa valeur courante — au relâchement
         elle reprend depuis cette position, sans saut. */
      if (!dragging) auto += dt * slow.v;

      group.rotation.y = Math.sin(auto * 0.16) * 0.55 + auto * 0.055 + drag;
      group.rotation.x = Math.sin(auto * 0.11) * 0.13 + dragY;

      group.updateMatrixWorld();

      /* La lampe rouge suit Adhara dans sa rotation, pour que la
         structure reste éclairée depuis la bonne étoile. */
      const adhara = nodes3d.find((n) => n.brand);
      if (adhara) adharaLight.position.setFromMatrixPosition(adhara.holder.matrixWorld);

      for (const n of nodes3d) {
        /* Rotation propre du noyau : c'est elle qui fait accrocher la
           lumière différemment sur chaque facette. Le scintillement
           vient de la géométrie, pas d'une variation d'opacité. */
        n.core.rotation.y += dt * (n.active ? 0.42 : 0.18);
        n.core.rotation.x += dt * (n.active ? 0.23 : 0.09);

        /* La cage tourne à contresens : le décalage entre les deux
           donne l'impression d'un mécanisme. */
        if (n.cage) {
          n.cage.rotation.y -= dt * 0.3;
          n.cage.rotation.z += dt * 0.17;
        }

        /* Le halo est un plan : sans réorientation il se verrait par
           la tranche. On le maintient face à la caméra, et on module
           sa taille pour la pulsation. */
        n.halo.quaternion.copy(camera.quaternion);
        const puls = n.active
          ? 1 + Math.sin(t * n.speed + n.phase) * 0.12
          : 1 + Math.sin(t * n.speed * 0.5 + n.phase) * 0.05;
        const hs = n.radius * (n.active ? 7 : 4.5) * puls;
        n.halo.scale.setScalar(hs);
      }

      renderer.render(scene, camera);
    }

    /* --- Nettoyage ---
       React exécute cette fonction quand le composant disparaît.
       Sans elle, la mémoire graphique ne serait jamais rendue. */
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      linkGeo.dispose();
      linkMat.dispose();
      coreGeo.dispose();
      cageGeo.dispose();
      haloGeo.dispose();
      haloTex.dispose();
      for (const n of nodes3d) {
        n.core.material.dispose();
        n.cage?.material.dispose();
        n.halo.material.dispose();
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="constel">
      <canvas ref={ref} className="constel__canvas" aria-hidden="true" />
    </div>
  );
}
