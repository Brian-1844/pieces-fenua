/* Pièce Fenua — icônes des véhicules (dessin au trait, couleur = currentColor) */
(() => {
  const svg = inner => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const vagues = `<path d="M4 43q4-3 8 0t8 0t8 0t8 0t8 0" stroke-width="2"/>`;
  window.ICONS = {
    voiture: svg(`
      <path d="M5 31v-6q0-2 2-2.5l6-1.5 5-7q1-1.5 3-1.5h10q2 0 3 1.5l5 7 3 .8q2 .7 2 2.7V31"/>
      <path d="M5 31h4M19 31h10M39 31h4"/>
      <path d="M20 15.5l-4 5.5h8v-5.5zM27 15.5V21h8l-4-5.5z"/>
      <circle cx="14" cy="31" r="4.5"/><circle cx="34" cy="31" r="4.5"/>`),
    camion: svg(`
      <rect x="3" y="11" width="25" height="19" rx="1.5"/>
      <path d="M28 17h8l7 7v6h-15"/><path d="M31 20h4.5l3.5 4h-8z"/>
      <circle cx="12" cy="33" r="4"/><circle cx="35" cy="33" r="4"/>`),
    drague: svg(`
      <rect x="3" y="33" width="27" height="8" rx="4"/>
      <circle cx="8" cy="37" r="1.3"/><circle cx="16.5" cy="37" r="1.3"/><circle cx="25" cy="37" r="1.3"/>
      <path d="M7 33V21h13l2 12"/><rect x="10" y="23.5" width="7" height="5"/>
      <path d="M21 25l12-15 9 9"/><path d="M42 19l2 8h-8z"/>`),
    case: svg(`
      <circle cx="14" cy="32" r="9"/><circle cx="14" cy="32" r="3"/>
      <circle cx="38" cy="35" r="5"/>
      <path d="M8 23V10h13l3 12"/><path d="M11 13h8l1.5 7H11z"/>
      <path d="M23 26h18l2 7M33 26V16"/><path d="M31 16h4"/>`),
    moto: svg(`
      <circle cx="10" cy="33" r="7"/><circle cx="38" cy="33" r="7"/>
      <path d="M10 33l9-10h10l9 10"/><path d="M19 23l4-6h8"/>
      <path d="M29 23l3-9h5"/><path d="M15 19h9"/>`),
    scooter: svg(`
      <circle cx="12" cy="35" r="5"/><circle cx="37" cy="35" r="5"/>
      <path d="M7 30q1-8 9-8h8l2 8h9"/><path d="M17 35h15"/>
      <path d="M37 35l-5-21h4.5"/><path d="M12 19h11"/>`),
    velo: svg(`
      <circle cx="11" cy="33" r="8"/><circle cx="37" cy="33" r="8"/>
      <path d="M11 33l8-14h13l5 14"/><path d="M19 19l6 14 7-14"/>
      <path d="M32 19l-1.5-6h5"/><path d="M16 16h6"/>
      <path d="M26 3l-4 6h5l-3 6" stroke-width="2.2"/>`),
    bateau: svg(`
      <path d="M3 27h36l-4 9H9z"/>
      <path d="M12 27v-7h12l4 7"/>
      <path d="M39 22h4v11l-2 4"/>
      ${vagues}`),
    jetski: svg(`
      <path d="M5 32h31q7 0 8-5l-4-2H17l-6-4-6 2z"/>
      <path d="M14 25q5-5 11-2"/>
      <path d="M31 25l-2-9 5-2"/>
      ${vagues}`)
  };
})();
