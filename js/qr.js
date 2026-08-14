/* ============================================================
   qr.js — Encodeur QR autonome
   Mode octet, correction niveau M, versions 1 à 6.

   Écrit à la main plutôt qu'emprunté à une bibliothèque : l'application
   ne charge aucune dépendance externe, et le code doit être réellement
   scannable puisqu'il sert à la prise de présence. Un motif décoratif
   qui « ressemble » à un QR ne servirait à rien devant une caméra.

   La sortie est vérifiée par décodage (voir README, section Carte de
   membre) : chaque motif produit ici est relu par un décodeur tiers.
   ============================================================ */

/* ---------------------------------------------- Corps de Galois GF(256)
   Polynôme primitif 0x11D, celui que la norme QR impose. */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x; GF_LOG[x] = i;
    x <<= 1; if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();
const gfMul = (a, b) => (a === 0 || b === 0) ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];

/* ---------------------------------------------- Capacités, niveau M
   `data` : codewords de données · `ec` : codewords de correction par
   bloc · `blocks` : [nombre de blocs, codewords de données par bloc]. */
const QR_SPEC = {
  1: { data: 16,  ec: 10, blocks: [[1, 16]] },
  2: { data: 28,  ec: 16, blocks: [[1, 28]] },
  3: { data: 44,  ec: 26, blocks: [[1, 44]] },
  4: { data: 64,  ec: 18, blocks: [[2, 32]] },
  5: { data: 86,  ec: 24, blocks: [[2, 43]] },
  6: { data: 108, ec: 16, blocks: [[4, 27]] }
};
/* Centres des motifs d'alignement. La version 1 n'en porte aucun. */
const QR_ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };

/* ---------------------------------------------- Reed-Solomon */
function rsGenerator(degree) {
  let g = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      next[j] ^= g[j];
      next[j + 1] ^= gfMul(g[j], GF_EXP[i]);
    }
    g = next;
  }
  return g;
}

function rsRemainder(data, ecLen) {
  const g = rsGenerator(ecLen);
  const buf = data.concat(new Array(ecLen).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = buf[i];
    if (coef === 0) continue;
    for (let j = 0; j < g.length; j++) buf[i + j] ^= gfMul(g[j], coef);
  }
  return buf.slice(data.length);
}

/* ---------------------------------------------- Encodage
   Retourne une matrice carrée de 0/1, ou lève si le texte dépasse la
   capacité de la version 6. */
function qrEncode(text) {
  const bytes = [...new TextEncoder().encode(text)];

  /* Deux octets d'en-tête : indicateur de mode + longueur. */
  const version = [1, 2, 3, 4, 5, 6].find((v) => bytes.length + 2 <= QR_SPEC[v].data);
  if (!version) throw new Error(`QR : ${bytes.length} octets dépassent la version 6`);
  const spec = QR_SPEC[version];
  const size = 17 + 4 * version;

  /* --- Flux binaire : mode 0100, longueur sur 8 bits, données --- */
  const bits = [];
  const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  push(0b0100, 4);
  push(bytes.length, 8);
  bytes.forEach((b) => push(b, 8));

  /* Terminateur, alignement sur l'octet, puis remplissage alterné. */
  const capacity = spec.data * 8;
  for (let i = 0; i < 4 && bits.length < capacity; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const dataCw = [];
  for (let i = 0; i < bits.length; i += 8) {
    dataCw.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  }
  for (let i = 0; dataCw.length < spec.data; i++) dataCw.push(i % 2 ? 0x11 : 0xec);

  /* --- Découpage en blocs, correction, entrelacement --- */
  const blocks = [];
  let offset = 0;
  spec.blocks.forEach(([count, len]) => {
    for (let i = 0; i < count; i++) {
      const d = dataCw.slice(offset, offset + len);
      offset += len;
      blocks.push({ data: d, ec: rsRemainder(d, spec.ec) });
    }
  });

  const finalCw = [];
  const maxData = Math.max(...blocks.map((b) => b.data.length));
  for (let i = 0; i < maxData; i++) {
    blocks.forEach((b) => { if (i < b.data.length) finalCw.push(b.data[i]); });
  }
  for (let i = 0; i < spec.ec; i++) blocks.forEach((b) => finalCw.push(b.ec[i]));

  const finalBits = [];
  finalCw.forEach((c) => { for (let i = 7; i >= 0; i--) finalBits.push((c >>> i) & 1); });

  /* --- Motifs fixes --- */
  const modules = Array.from({ length: size }, () => new Array(size).fill(0));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
  const setFn = (col, row, dark) => {
    modules[row][col] = dark ? 1 : 0;
    reserved[row][col] = true;
  };

  const finder = (col0, row0) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = row0 + dr, c = col0 + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const d = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        setFn(c, r, d !== 2 && d !== 4);   /* anneau clair aux distances 2 et 4 */
      }
    }
  };
  finder(0, 0); finder(size - 7, 0); finder(0, size - 7);

  /* Lignes de synchronisation */
  for (let i = 8; i < size - 8; i++) {
    setFn(6, i, i % 2 === 0);
    setFn(i, 6, i % 2 === 0);
  }

  /* Motifs d'alignement, sauf ceux qui empiètent sur les repères */
  const al = QR_ALIGN[version];
  al.forEach((r) => al.forEach((c) => {
    if ((r === 6 && c === 6) || (r === 6 && c === al[al.length - 1])
        || (c === 6 && r === al[al.length - 1])) return;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        setFn(c + dc, r + dr, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
      }
    }
  }));

  /* Zones réservées au format, et module sombre obligatoire */
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) { setFn(8, i, false); setFn(i, 8, false); }
  }
  for (let i = 0; i < 8; i++) {
    setFn(size - 1 - i, 8, false);
    setFn(8, size - 8 + i, false);
  }
  setFn(8, size - 8, true);

  /* --- Placement des données en zigzag, depuis le coin bas-droit --- */
  let bitIdx = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;            /* la colonne 6 est une synchro */
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((right + 1) & 2) === 0;
        const row = upward ? size - 1 - vert : vert;
        if (reserved[row][col]) continue;
        modules[row][col] = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
      }
    }
  }

  /* --- Masquage : les huit motifs sont évalués, le moins pénalisé gagne --- */
  const maskFn = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
    (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
    (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0
  ];

  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    const m = modules.map((row) => row.slice());
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!reserved[r][c] && maskFn[mask](r, c)) m[r][c] ^= 1;
      }
    }
    applyFormat(m, size, mask);
    const score = penalty(m, size);
    if (!best || score < best.score) best = { score, m };
  }
  return best.m;
}

/* Information de format : 2 bits de niveau (M = 00) + 3 bits de masque,
   protégés par un BCH(15,5) puis masqués par 0x5412. */
function applyFormat(m, size, mask) {
  const data = (0b00 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const bit = (i) => (bits >>> i) & 1;

  for (let i = 0; i <= 5; i++) m[i][8] = bit(i);
  m[7][8] = bit(6);
  m[8][8] = bit(7);
  m[8][7] = bit(8);
  for (let i = 9; i < 15; i++) m[8][14 - i] = bit(i);

  for (let i = 0; i < 8; i++) m[8][size - 1 - i] = bit(i);
  for (let i = 8; i < 15; i++) m[size - 15 + i][8] = bit(i);
  m[size - 8][8] = 1;
}

/* Pénalités de la norme : séries, blocs 2×2, faux repères, déséquilibre. */
function penalty(m, size) {
  let score = 0;

  const runScore = (line) => {
    let s = 0, run = 1;
    for (let i = 1; i < line.length; i++) {
      if (line[i] === line[i - 1]) { run++; }
      else { if (run >= 5) s += 3 + (run - 5); run = 1; }
    }
    if (run >= 5) s += 3 + (run - 5);
    return s;
  };
  for (let i = 0; i < size; i++) {
    score += runScore(m[i]);
    score += runScore(m.map((row) => row[i]));
  }

  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = m[r][c];
      if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
    }
  }

  const pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  const hasAt = (line, i, pat) => pat.every((p, k) => line[i + k] === p);
  const scanLine = (line) => {
    let s = 0;
    for (let i = 0; i + 11 <= line.length; i++) {
      if (hasAt(line, i, pat1) || hasAt(line, i, pat2)) s += 40;
    }
    return s;
  };
  for (let i = 0; i < size; i++) {
    score += scanLine(m[i]);
    score += scanLine(m.map((row) => row[i]));
  }

  let dark = 0;
  m.forEach((row) => row.forEach((v) => { if (v) dark++; }));
  const ratio = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(ratio - 50) / 5) * 10;

  return score;
}

/* ---------------------------------------------- Rendu SVG
   Les modules sombres d'une même ligne sont fusionnés en un seul
   rectangle : une carte affiche ainsi une centaine de nœuds au lieu
   de plusieurs centaines. La marge blanche de 4 modules est exigée par
   la norme — sans elle, beaucoup de lecteurs échouent. */
function qrSVG(text, { size = 120, quiet = 4, dark = '#171717', light = '#ffffff' } = {}) {
  const m = qrEncode(text);
  const n = m.length;
  const total = n + quiet * 2;
  const rects = [];
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!m[r][c]) { c++; continue; }
      let len = 1;
      while (c + len < n && m[r][c + len]) len++;
      rects.push(`<rect x="${c + quiet}" y="${r + quiet}" width="${len}" height="1"/>`);
      c += len;
    }
  }
  return `<svg class="qr" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}"
       shape-rendering="crispEdges" role="img" aria-label="Code de membre">
    <rect width="${total}" height="${total}" fill="${light}"/>
    <g fill="${dark}">${rects.join('')}</g>
  </svg>`;
}

/* ---------------------------------------------- Jeton de membre
   Format : VM|<identifiant>|<année>|<contrôle>. Le contrôle est une
   somme non cryptographique : il repère une saisie erronée ou une carte
   modifiée à la main, il n'empêche pas une contrefaçon délibérée.
   Une signature côté serveur serait nécessaire pour cela. */
function memberToken(p, year = 2026) {
  const id = memberNumber(p);
  const base = `VM|${id}|${year}`;
  let h = 0;
  for (const ch of base) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `${base}|${h.toString(16).toUpperCase().padStart(8, '0').slice(-4)}`;
}

/** Numéro de membre lisible, dérivé de l'identifiant interne. */
function memberNumber(p) {
  return 'VM-' + String(parseInt(p.id.replace(/\D/g, ''), 10)).padStart(4, '0');
}
