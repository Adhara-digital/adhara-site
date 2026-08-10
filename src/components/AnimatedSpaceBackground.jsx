import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ============================================================
   ÆTHER / ADHARA — « La Traversée »
   Le scroll propulse la caméra à travers l'univers.

   Architecture des profondeurs :
     · constellation du Grand Chien  → à l'infini (phare, ne se rattrape pas)
     · jalons de voyage              → croisés une fois (planètes, galaxie…)
     · nébuleuses volumétriques      → traversées de part en part
     · champ d'étoiles infini        → recyclé en Z (voyage sans fin)
     · poussière                     → premier plan, vitesse maximale

   DA : noir profond, rouge sang #8F1717, Adhara néon blanche.
   ============================================================ */

/* ---------- Constellation (positions réelles) ---------- */
const CANIS = {
  theta: { x: 0.47, y: 0.0, mag: 4.07 },
  muliphein: { x: 0.32, y: 0.18, mag: 4.11 },
  sirius: { x: 0.61, y: 0.23, mag: -1.46 },
  iota: { x: 0.44, y: 0.24, mag: 4.37 },
  mirzam: { x: 0.96, y: 0.29, mag: 1.98 },
  omicron: { x: 0.47, y: 0.58, mag: 3.02 },
  wezen: { x: 0.25, y: 0.7, mag: 1.83 },
  adhara: { x: 0.4, y: 0.83, mag: 1.5, brand: true },
  aludra: { x: 0.0, y: 0.84, mag: 2.45 },
  furud: { x: 1.0, y: 0.88, mag: 3.02 },
};
const EDGES = [
  ["sirius", "mirzam"],
  ["sirius", "theta"],
  ["sirius", "iota"],
  ["iota", "omicron"],
  ["omicron", "wezen"],
  ["wezen", "aludra"],
  ["wezen", "adhara"],
  ["adhara", "furud"],
  ["muliphein", "theta"],
];

const SPREAD = 46;
const DEPTH = 1500; // distance totale parcourue sur toute la page
const SLAB = 700; // longueur du pavé d'étoiles recyclé
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- Fabriques de textures ---------- */
function radialTex(stops, size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  stops.forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
function nebulaTex() {
  // nuage organique : plusieurs taches douces superposées
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  for (let i = 0; i < 22; i++) {
    const x = rand(60, 196),
      y = rand(60, 196),
      r = rand(22, 78);
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, `rgba(255,255,255,${rand(0.05, 0.13)})`);
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, 7);
    g.fill();
  }
  // atténuation des bords pour éviter le carré visible
  const vg = g.createRadialGradient(128, 128, 40, 128, 128, 128);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out";
  g.fillStyle = vg;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
function galaxyTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.translate(128, 128);
  const core = g.createRadialGradient(0, 0, 0, 0, 0, 120);
  core.addColorStop(0, "rgba(255,246,240,0.95)");
  core.addColorStop(0.12, "rgba(255,190,175,0.45)");
  core.addColorStop(0.45, "rgba(170,120,190,0.16)");
  core.addColorStop(1, "rgba(90,60,130,0)");
  g.save();
  g.scale(1, 0.4);
  g.fillStyle = core;
  g.beginPath();
  g.arc(0, 0, 122, 0, 7);
  g.fill();
  g.restore();
  g.rotate(0.4);
  g.lineCap = "round";
  for (let a = 0; a < 2; a++) {
    g.strokeStyle = `rgba(230,200,220,${0.1 - a * 0.02})`;
    g.lineWidth = 9 - a * 3;
    g.beginPath();
    for (let i = 0; i < 70; i++) {
      const r = i * 1.62,
        an = i * 0.155 + a * Math.PI;
      const x = Math.cos(an) * r,
        y = Math.sin(an) * r * 0.4;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }
  return new THREE.CanvasTexture(c);
}
function planetTex(a, b, c2, bands) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(42, 40, 4, 64, 64, 63);
  grd.addColorStop(0, a);
  grd.addColorStop(0.45, b);
  grd.addColorStop(0.86, c2);
  grd.addColorStop(1, "rgba(8,4,6,0)");
  g.fillStyle = grd;
  g.beginPath();
  g.arc(64, 64, 63, 0, 7);
  g.fill();
  if (bands) {
    g.globalCompositeOperation = "source-atop";
    g.globalAlpha = 0.18;
    for (let i = 0; i < 7; i++) {
      g.fillStyle = i % 2 ? "#3a1a18" : "#e0a882";
      g.fillRect(0, 12 + i * 15, 128, rand(4, 9));
    }
  }
  return new THREE.CanvasTexture(c);
}

export default function AnimatedSpaceBackground() {
  const ref = useRef(null);
  const veilRef = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060b, 0.0019); // dissout les lointains → profondeur
    const camera = new THREE.PerspectiveCamera(58, 1, 0.5, 4000);

    /* ---------- Textures ---------- */
    const dotTex = radialTex(
      [
        [0, "rgba(255,255,255,1)"],
        [0.35, "rgba(255,255,255,0.55)"],
        [1, "rgba(255,255,255,0)"],
      ],
      64,
    );
    const starTex = radialTex([
      [0, "rgba(255,255,255,1)"],
      [0.26, "rgba(255,226,220,0.88)"],
      [0.55, "rgba(200,44,40,0.42)"],
      [1, "rgba(143,23,23,0)"],
    ]);
    const adharaTex = radialTex([
      [0, "rgba(255,255,255,1)"],
      [0.22, "rgba(255,238,232,0.96)"],
      [0.48, "rgba(226,64,52,0.55)"],
      [1, "rgba(143,23,23,0)"],
    ]);
    const nebTex = nebulaTex();
    const galTex = galaxyTex();

    /* ============================================================
       1. CHAMP D'ÉTOILES INFINI (3 strates + traînées de vitesse)
       ============================================================ */
    const strata = [];
    function makeStrata(count, spread, size, opacity) {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = rand(-spread, spread);
        pos[i * 3 + 1] = rand(-spread * 0.7, spread * 0.7);
        pos[i * 3 + 2] = rand(-SLAB, 40);
        // typage stellaire : majorité blanc-chaud, tirée vers le rouge ; quelques bleues (O/B)
        const r = Math.random();
        if (r < 0.42) {
          col[i * 3] = 0.78;
          col[i * 3 + 1] = 0.22;
          col[i * 3 + 2] = 0.2;
        } // rouge
        else if (r < 0.9) {
          col[i * 3] = 0.96;
          col[i * 3 + 1] = 0.9;
          col[i * 3 + 2] = 0.88;
        } // blanc chaud
        else {
          col[i * 3] = 0.66;
          col[i * 3 + 1] = 0.76;
          col[i * 3 + 2] = 1.0;
        } // bleue
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          size,
          map: dotTex,
          sizeAttenuation: true,
          vertexColors: true,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: true,
        }),
      );
      scene.add(pts);
      strata.push({ pts, pos, count, spread });
      return pts;
    }
    // comptes allégés : ces strates sont recalculées individuellement
    // à CHAQUE frame (recyclage infini) — garder ce budget raisonnable
    // évite le jank pendant le scroll, surtout combiné au voile de texte.
    makeStrata(1300, 300, 1.6, 0.85); // lointaines
    makeStrata(800, 190, 2.5, 0.9); // moyennes
    makeStrata(400, 120, 3.7, 0.95); // proches

    // Traînées : dessinées seulement en vitesse (effet warp)
    const TRAIL_N = 650; // n'est calculé que pendant les phases de vitesse (warp > 0.02)
    const trailPos = new Float32Array(TRAIL_N * 6);
    const trailCol = new Float32Array(TRAIL_N * 6);
    const trailSrc = [];
    for (let i = 0; i < TRAIL_N; i++) {
      trailSrc.push({
        x: rand(-220, 220),
        y: rand(-150, 150),
        z: rand(-SLAB, 40),
        w: rand(0.45, 1),
      });
      const c = Math.random() < 0.45 ? [1, 0.34, 0.28] : [1, 0.92, 0.9];
      trailCol.set([c[0], c[1], c[2], 0, 0, 0], i * 6);
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
    const trailMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.LineSegments(trailGeo, trailMat));

    /* ============================================================
       2. NÉBULEUSES VOLUMÉTRIQUES (on les traverse)
       ============================================================ */
    const nebulae = [];
    const NEB_DEF = [
      { z: -120, c: 0x8f1717, s: 340, o: 0.34 },
      { z: -300, c: 0x6d1030, s: 300, o: 0.3 },
      { z: -520, c: 0x8f1717, s: 400, o: 0.32 },
      { z: -700, c: 0x3a1c62, s: 320, o: 0.24 },
      { z: -900, c: 0xa01c1c, s: 380, o: 0.34 },
      { z: -1120, c: 0x5d1230, s: 340, o: 0.28 },
      { z: -1340, c: 0x8f1717, s: 420, o: 0.32 },
    ];
    NEB_DEF.forEach((n) => {
      // 3 calques décalés par nébuleuse → volume réel quand on la traverse
      for (let k = 0; k < 3; k++) {
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: nebTex,
            color: n.c,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        sp.position.set(rand(-70, 70), rand(-50, 50), n.z + k * 42 - 42);
        const s = n.s * rand(0.7, 1.15);
        sp.scale.set(s, s, 1);
        sp.material.rotation = rand(0, 6.28);
        scene.add(sp);
        nebulae.push({ sp, base: n.o * rand(0.6, 1), spin: rand(-0.02, 0.02) });
      }
    });

    /* ============================================================
       3. JALONS DE VOYAGE (croisés une seule fois)
       ============================================================ */
    const landmarks = [];

    // — Planète à anneau (rouille)
    // Positionnée pour tomber dans la zone vide du hero : le titre
    // occupe jusqu'à 91% de la largeur mais seulement entre 30-61% de
    // la hauteur ; l'accroche et les boutons ne dépassent pas 54% de
    // largeur. Cette position (bas-droite, ~78% x / ~80% y à l'écran)
    // garde une marge confortable avec chacun de ces blocs de texte.
    // {
    //   const g = new THREE.Group();
    //   g.position.set(82, -70, -150);
    //   const p = new THREE.Sprite(
    //     new THREE.SpriteMaterial({
    //       map: planetTex("#d59a72", "#944c38", "#331319", false),
    //       transparent: true,
    //       depthWrite: false,
    //     }),
    //   );
    //   p.scale.set(52, 52, 1);
    //   g.add(p);
    //   const rp = [];
    //   for (let i = 0; i <= 96; i++) {
    //     const a = (i / 96) * 6.283;
    //     rp.push(Math.cos(a) * 40, Math.sin(a) * 40 * 0.3, 0);
    //   }
    //   const rg = new THREE.BufferGeometry();
    //   rg.setAttribute(
    //     "position",
    //     new THREE.BufferAttribute(new Float32Array(rp), 3),
    //   );
    //   const ring = new THREE.Line(
    //     rg,
    //     new THREE.LineBasicMaterial({
    //       color: 0xd8a882,
    //       transparent: true,
    //       opacity: 0.55,
    //     }),
    //   );
    //   ring.rotation.z = -0.42;
    //   g.add(ring);
    //   const rp2 = [];
    //   for (let i = 0; i <= 96; i++) {
    //     const a = (i / 96) * 6.283;
    //     rp2.push(Math.cos(a) * 47, Math.sin(a) * 47 * 0.3, 0);
    //   }
    //   const rg2 = new THREE.BufferGeometry();
    //   rg2.setAttribute(
    //     "position",
    //     new THREE.BufferAttribute(new Float32Array(rp2), 3),
    //   );
    //   const ring2 = new THREE.Line(
    //     rg2,
    //     new THREE.LineBasicMaterial({
    //       color: 0xc78a6a,
    //       transparent: true,
    //       opacity: 0.3,
    //     }),
    //   );
    //   ring2.rotation.z = -0.42;
    //   g.add(ring2);
    //   scene.add(g);
    //   landmarks.push({ g, kind: "planet", spin: 0.05 });
    // }

    // — Champ d'astéroïdes (on le traverse)
    {
      const N = 420,
        pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const a = rand(0, 6.283),
          r = rand(30, 150);
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = Math.sin(a) * r * 0.45 + rand(-14, 14);
        pos[i * 3 + 2] = rand(-70, 70);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const belt = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          size: 2.4,
          map: dotTex,
          color: 0xbf9a86,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.75,
          depthWrite: false,
          fog: true,
        }),
      );
      belt.position.set(20, -10, -560);
      scene.add(belt);
      landmarks.push({ g: belt, kind: "belt", spin: 0.03 });
    }

    // — Galaxie (accent froid : fait vibrer le rouge)
    {
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: galTex,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      sp.position.set(96, 46, -820);
      sp.scale.set(190, 190, 1);
      scene.add(sp);
      landmarks.push({ g: sp, kind: "galaxy", spin: 0.012 });
    }

    // — Pulsar (phare rythmique + ondes)
    const pulsarRings = [];
    {
      const g = new THREE.Group();
      g.position.set(-40, -26, -1060);
      const core = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: adharaTex,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      core.scale.set(26, 26, 1);
      g.add(core);
      for (let i = 0; i < 3; i++) {
        const pts = [];
        for (let j = 0; j <= 64; j++) {
          const a = (j / 64) * 6.283;
          pts.push(Math.cos(a), Math.sin(a), 0);
        }
        const rg = new THREE.BufferGeometry();
        rg.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(pts), 3),
        );
        const ln = new THREE.Line(
          rg,
          new THREE.LineBasicMaterial({
            color: 0xff9a88,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
          }),
        );
        g.add(ln);
        pulsarRings.push({ ln, t: i * 1.3 });
      }
      scene.add(g);
      landmarks.push({ g, kind: "pulsar", core });
    }

    // — Duo planète + lune (fin de traversée)
    // {
    //   const g = new THREE.Group();
    //   g.position.set(64, 22, -1300);
    //   const p = new THREE.Sprite(
    //     new THREE.SpriteMaterial({
    //       map: planetTex("#e8b48a", "#a8563c", "#2c1016", true),
    //       transparent: true,
    //       depthWrite: false,
    //     }),
    //   );
    //   p.scale.set(66, 66, 1);
    //   g.add(p);
    //   const m = new THREE.Sprite(
    //     new THREE.SpriteMaterial({
    //       map: planetTex("#cfc6c0", "#7a6f6a", "#241d1c", false),
    //       transparent: true,
    //       depthWrite: false,
    //     }),
    //   );
    //   m.scale.set(17, 17, 1);
    //   m.position.set(52, -16, 12);
    //   g.add(m);
    //   scene.add(g);
    //   landmarks.push({ g, kind: "duo", moon: m });
    // }

    /* ============================================================
       4. CONSTELLATION À L'INFINI (le phare Adhara)
       ============================================================ */
    const nodes = {};
    let ni = 0;
    for (const k in CANIS) {
      const s = CANIS[k];
      nodes[k] = new THREE.Vector3(
        (s.x - 0.5) * SPREAD,
        (0.5 - s.y) * SPREAD * 1.02,
        (((ni++ * 53) % 13) - 6) * 0.6,
      );
    }
    const sky = new THREE.Group(); // suit la caméra → jamais rattrapée
    scene.add(sky);
    const constel = new THREE.Group();
    sky.add(constel);

    const stars = [];
    const sizeFor = (mag) => Math.max(3.4, Math.min(11, 8 - mag * 1.6));
    for (const k in nodes) {
      const s = CANIS[k],
        brand = !!s.brand;
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: brand ? adharaTex : starTex,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: false,
        }),
      );
      sp.position.copy(nodes[k]);
      const sz = brand ? 17 : sizeFor(s.mag);
      sp.scale.set(sz, sz, 1);
      sp.userData = { brand, sz, ph: rand(0, 7), tw: rand(0.8, 2.2) };
      constel.add(sp);
      stars.push(sp);
    }
    const lp = [];
    for (const [a, b] of EDGES)
      lp.push(
        nodes[a].x,
        nodes[a].y,
        nodes[a].z,
        nodes[b].x,
        nodes[b].y,
        nodes[b].z,
      );
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(lp), 3),
    );
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xb52a2a,
      transparent: true,
      opacity: 0.3,
      fog: false,
    });
    constel.add(new THREE.LineSegments(lineGeo, lineMat));

    // télémétrie orbitale autour d'Adhara
    const ringGroup = new THREE.Group();
    ringGroup.position.copy(nodes.adhara);
    ringGroup.rotation.set(1.15, 0.25, 0);
    constel.add(ringGroup);
    const R = 9,
      rp = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * 6.283;
      rp.push(Math.cos(a) * R, Math.sin(a) * R, 0);
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(rp), 3),
    );
    ringGroup.add(
      new THREE.Line(
        ringGeo,
        new THREE.LineBasicMaterial({
          color: 0xff8a80,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending,
          fog: false,
        }),
      ),
    );
    const tp = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * 6.283,
        r0 = i % 6 === 0 ? R - 1.6 : R - 0.8;
      tp.push(
        Math.cos(a) * r0,
        Math.sin(a) * r0,
        0,
        Math.cos(a) * (R + 0.5),
        Math.sin(a) * (R + 0.5),
        0,
      );
    }
    const tickGeo = new THREE.BufferGeometry();
    tickGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(tp), 3),
    );
    ringGroup.add(
      new THREE.LineSegments(
        tickGeo,
        new THREE.LineBasicMaterial({
          color: 0xc73030,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          fog: false,
        }),
      ),
    );
    const marker = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: dotTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    );
    marker.scale.set(3, 3, 1);
    ringGroup.add(marker);

    /* ============================================================
       5. POUSSIÈRE DE PREMIER PLAN
       ============================================================ */
    const dN = 420,
      dPos = new Float32Array(dN * 3);
    for (let i = 0; i < dN; i++) {
      dPos[i * 3] = rand(-80, 80);
      dPos[i * 3 + 1] = rand(-55, 55);
      dPos[i * 3 + 2] = rand(-160, 20);
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    const dust = new THREE.Points(
      dGeo,
      new THREE.PointsMaterial({
        size: 1.1,
        map: dotTex,
        color: 0xffb4a2,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(dust);

    /* ============================================================
       Pilotage : scroll → avancée, vitesse → warp
       ============================================================ */
    let target = 0,
      prog = 0,
      speed = 0,
      warp = 0;
    const pointer = { x: 0, y: 0 },
      look = { x: 0, y: 0 };

    function readScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      target = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    }
    const onScroll = readScroll;
    const onMove = (e) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    };
    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const small = window.innerWidth < 760;
      constel.position.set(small ? 0 : 17, small ? 14 : 3, 0);
      constel.scale.setScalar(small ? 0.82 : 1);
    };

    /* ---------- Boucle ---------- */
    const clock = new THREE.Clock();
    let t = 0,
      raf;
    function animate() {
      const dt = Math.min(0.05, clock.getDelta());
      t += dt;

      // avancée lissée + vitesse instantanée
      const prev = prog;
      prog += (target - prog) * (reduce ? 1 : 0.062);
      const inst = Math.abs(prog - prev) / Math.max(dt, 0.001);
      speed += (inst - speed) * 0.18;
      warp += (Math.min(1, speed * 2.6) - warp) * 0.1;
      if (reduce) {
        warp = 0;
      }

      // caméra : plongée le long de -Z + regard libre à la souris
      const camZ = 60 - prog * DEPTH;
      look.x += (pointer.x - look.x) * 0.045;
      look.y += (pointer.y - look.y) * 0.045;
      camera.position.set(look.x * 26, -look.y * 18, camZ);
      const fov = 58 + warp * 13; // le champ s'ouvre dans la vitesse
      if (Math.abs(camera.fov - fov) > 0.05) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(
        look.x * 26 + look.x * 40,
        -look.y * 18 - look.y * 30,
        camZ - 100,
      );
      camera.rotation.z = -look.x * 0.07 - warp * 0.03; // roulis APRÈS lookAt (sinon écrasé)

      // ---- étoiles : recyclage infini autour de la caméra ----
      for (const s of strata) {
        const p = s.pos;
        for (let i = 0; i < s.count; i++) {
          const zi = i * 3 + 2;
          const dz = p[zi] - camZ;
          if (dz > 60) {
            p[zi] -= SLAB;
            p[i * 3] = rand(-s.spread, s.spread);
            p[i * 3 + 1] = rand(-s.spread * 0.7, s.spread * 0.7);
          } else if (dz < 60 - SLAB) {
            p[zi] += SLAB;
          }
        }
        s.pts.geometry.attributes.position.needsUpdate = true;
      }

      // ---- traînées de vitesse ----
      trailMat.opacity = warp * 0.55;
      if (warp > 0.02) {
        const len = 6 + warp * 130;
        for (let i = 0; i < TRAIL_N; i++) {
          const s = trailSrc[i];
          let dz = s.z - camZ;
          if (dz > 40) {
            s.z -= SLAB;
            s.x = rand(-220, 220);
            s.y = rand(-150, 150);
            dz = s.z - camZ;
          } else if (dz < 40 - SLAB) {
            s.z += SLAB;
            dz = s.z - camZ;
          }
          const o = i * 6;
          trailPos[o] = s.x;
          trailPos[o + 1] = s.y;
          trailPos[o + 2] = s.z;
          trailPos[o + 3] = s.x;
          trailPos[o + 4] = s.y;
          trailPos[o + 5] = s.z + len * s.w;
        }
        trailGeo.attributes.position.needsUpdate = true;
      }

      // ---- nébuleuses : intensité selon la distance (traversée douce) ----
      for (const n of nebulae) {
        const d = Math.abs(n.sp.position.z - camZ);
        // pic à mi-distance, s'efface quand on est dedans ou trop loin
        const f =
          Math.max(0, Math.min(1, (d - 8) / 150)) *
          Math.max(0, 1 - (d - 150) / 520);
        n.sp.material.opacity = n.base * f;
        if (!reduce) n.sp.material.rotation += n.spin * dt;
      }

      // ---- jalons ----
      for (const L of landmarks) {
        if (reduce) break;
        if (L.kind === "planet") {
          L.g.children[0].material.rotation += 0.04 * dt;
          L.g.rotation.z += 0.006 * dt;
        } else if (L.kind === "belt") {
          L.g.rotation.z += L.spin * dt;
        } else if (L.kind === "galaxy") {
          L.g.material.rotation += L.spin * dt;
        } else if (L.kind === "duo") {
          const a = t * 0.25;
          L.moon.position.set(
            Math.cos(a) * 54,
            Math.sin(a) * 20 - 6,
            Math.sin(a) * 22,
          );
        } else if (L.kind === "pulsar") {
          const flare =
            0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(t * 2.4)), 10);
          L.core.scale.setScalar(26 * (0.85 + flare * 0.45));
          L.core.material.opacity = 0.55 + flare * 0.45;
          for (const rg of pulsarRings) {
            rg.t += dt;
            if (rg.t > 3.9) rg.t = 0;
            const s = rg.t * 46;
            rg.ln.scale.set(s, s, 1);
            rg.ln.material.opacity = Math.max(0, 0.45 * (1 - rg.t / 3.9));
          }
        }
      }

      // ---- ciel : la constellation reste à l'infini devant nous ----
      sky.position.z = camZ - 300;
      sky.rotation.y = -look.x * 0.1 + prog * 0.22; // le point de vue tourne au fil du voyage
      sky.rotation.x = look.y * 0.05;
      for (const sp of stars) {
        const u = sp.userData;
        if (u.brand) {
          const p2 = reduce ? 1 : 1 + Math.sin(t * 3) * 0.14;
          sp.scale.set(u.sz * p2, u.sz * p2, 1);
          sp.material.opacity = 1 - warp * 0.25;
        } else {
          const tw = reduce ? 1 : 0.7 + 0.3 * Math.sin(t * u.tw + u.ph);
          sp.material.opacity = tw * (1 - warp * 0.45);
        }
      }
      lineMat.opacity = 0.3 * (1 - warp * 0.85);
      if (!reduce) {
        ringGroup.rotation.z += 0.13 * dt;
        const a = t * 0.6;
        marker.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      }

      // ---- poussière : accrochée devant la caméra ----
      dust.position.z = camZ - 60;
      if (!reduce) dust.rotation.z += 0.05 * dt;
      dust.material.opacity = 0.5 * (1 - warp * 0.5);

      // voile de vitesse (CSS)
      if (veilRef.current) veilRef.current.style.opacity = String(warp * 0.55);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }

    readScroll();
    prog = target;
    resize();
    animate();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="starfield" aria-hidden="true" />
      <div ref={veilRef} className="warpveil" aria-hidden="true" />
    </>
  );
}
