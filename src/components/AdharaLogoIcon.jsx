/* Logo Adhara — vecteur fidèle au logo fourni (positions et rayons
   relevés par analyse de pixels sur D:\Photoshop\logo.png, pas par
   estimation visuelle). Structure et tracé du symbole respectés à
   l'identique ; seule différence assumée : le nœud central (le plus
   grand du réseau d'origine) devient l'étoile Adhara, avec une lueur. */
export default function AdharaLogoIcon({ height = 40 }) {
  return (
    <span className="logo" style={{ "--logo-h": `${height}px` }}>
      <svg className="logo__icon" viewBox="0 0 190 190" fill="none" aria-hidden="true">
        <defs>
          <filter id="adhara-star-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* anneau extérieur */}
        <circle cx="95" cy="95" r="84" stroke="#FFFFFF" strokeWidth="4" />

        {/* liens du réseau — tracé exact : Haut-Gauche, Haut-Milieu,
            Gauche-Milieu (triangle), Milieu-Centre, Centre-Bas1,
            Bas1-Droite, Bas1-Bas2 */}
        <g stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round">
          <line x1="87" y1="30" x2="50" y2="61" />
          <line x1="87" y1="30" x2="66" y2="78" />
          <line x1="50" y1="61" x2="66" y2="78" />
          <line x1="66" y1="78" x2="95" y2="89" />
          <line x1="95" y1="89" x2="104" y2="120" />
          <line x1="104" y1="120" x2="143" y2="122" />
          <line x1="104" y1="120" x2="95" y2="159" />
        </g>

        {/* nœuds creux (fond = couleur de page, pour "trouer" les liens) */}
        <circle cx="87" cy="30" r="5.3" fill="var(--bg,#0A0A0D)" stroke="#FFFFFF" strokeWidth="4" />
        <circle cx="50" cy="61" r="4.4" fill="var(--bg,#0A0A0D)" stroke="#FFFFFF" strokeWidth="4" />
        <circle cx="66" cy="78" r="3.5" fill="var(--bg,#0A0A0D)" stroke="#FFFFFF" strokeWidth="4" />
        <circle cx="104" cy="120" r="3.5" fill="var(--bg,#0A0A0D)" stroke="#FFFFFF" strokeWidth="4" />
        <circle cx="143" cy="122" r="4.4" fill="var(--bg,#0A0A0D)" stroke="#FFFFFF" strokeWidth="4" />
        <circle cx="95" cy="159" r="3.5" fill="var(--bg,#0A0A0D)" stroke="#FFFFFF" strokeWidth="4" />

        {/* l'étoile Adhara — nœud central du réseau d'origine (le plus
            grand), transformé en point lumineux avec lueur */}
        <circle cx="95" cy="89" r="11" fill="#A81E1E" filter="url(#adhara-star-glow)" />
        <circle cx="95" cy="89" r="11" fill="#C82222" />
        <circle cx="91.5" cy="85.5" r="3.4" fill="#FFD9D9" />
      </svg>
      <span className="logo__word">ADHARA</span>
    </span>
  );
}
