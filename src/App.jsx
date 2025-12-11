import React, { useEffect, useMemo, useState } from 'react';

/**
 * App.jsx
 * Implementa:
 * - PASSO 1 Planetas: botões visíveis em ordem alfabética, preencher 3 slots, toggle para desmarcar, senha formada pelos valores quando 3 preenchidos.
 * - PASSO 2 Coordenadas de Marte: Sem alteração (não há UI específica).
 * - PASSO 3 Livros / Estruturas: "Statue" -> "Estrutura", imagem placeholder, 3 estruturas com 3 livros e checkboxes, mostra giros necessários.
 * - PASSO 4 Folhas Planetárias: Para Júpiter, Netuno, Marte botões NW/NE/SE/SW; só 1 direção por planeta; selecionada desabilita nas outras.
 * - PASSO 5 Símbolos: mostra 6 símbolos (5 reais + 1 '?'), detecta símbolo faltante e substitui o '?' pelo correto.
 *
 * Nota: usei placeholders SVG embutidos para imagens de estrutura e para os símbolos para evitar dependências externas.
 */

/* Fallback planet data (usado se não houver JSON externo). Se você tiver um arquivo JSON com os valores
   eu posso modificar para importar/fazer fetch desse arquivo. */
const FALLBACK_PLANETS = [
  { name: 'Júpiter', value: 7 },
  { name: 'Marte', value: 3 },
  { name: 'Mercúrio', value: 1 },
  { name: 'Netuno', value: 5 },
  { name: 'Saturno', value: 9 },
  { name: 'Urano', value: 2 },
  { name: 'Vênus', value: 4 },
  { name: 'Terra', value: 6 }
];

function StructureImagePlaceholder() {
  return (
    <svg width="72" height="48" viewBox="0 0 72 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="48" rx="6" fill="#223" />
      <text x="50%" y="50%" fill="#9fc" fontSize="10" textAnchor="middle" dominantBaseline="middle">Imagem</text>
    </svg>
  );
}

function SymbolSVG({ label }) {
  // simple circular icon with label (number or ?)
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#111827" stroke="#9CA3AF" strokeWidth="1"/>
      <text x="50%" y="50%" fill="#F3F4F6" fontSize="18" textAnchor="middle" dominantBaseline="middle">{label}</text>
    </svg>
  );
}

export default function App() {
  // planets (try to fetch external JSON or fallback)
  const [planets, setPlanets] = useState(FALLBACK_PLANETS);

  // selections for PASSO 1 (3 slots)
  const [selectedPlanets, setSelectedPlanets] = useState([]); // array of planet objects in order selected

  // PASSO 4 hojas: directions per planet (only for Júpiter, Netuno, Marte)
  const planetaryLeafPlanets = ['Júpiter', 'Netuno', 'Marte'];
  const directions = ['NW', 'NE', 'SE', 'SW'];
  // map planetName -> direction or null
  const [leafSelections, setLeafSelections] = useState({});

  // PASSO 3 structures: 3 estruturas, each with 3 books; rotationRequired provided in data or default
  const defaultStructures = [
    { id: 1, name: 'Estrutura 1', rotationRequired: 2, books: [false, false, false] },
    { id: 2, name: 'Estrutura 2', rotationRequired: 1, books: [false, false, false] },
    { id: 3, name: 'Estrutura 3', rotationRequired: 3, books: [false, false, false] }
  ];
  const [structures, setStructures] = useState(defaultStructures);

  // PASSO 5 symbols: build a display with one '?' and 5 real symbols, auto-detect and replace '?'
  // We'll create a random arrangement each load for demo (but deterministic alternatives possible)
  const [symbolSlots, setSymbolSlots] = useState([]); // each slot: number or '?'
  useEffect(() => {
    // initialize with 5 random symbols from 1..6 leaving one out, and place a '?' somewhere
    const all = [1,2,3,4,5,6];
    // shuffle and remove one to be the missing symbol
    const shuffled = all.slice().sort(() => Math.random() - 0.5);
    const missing = shuffled[0];
    const present = shuffled.slice(1); // length 5
    // build 6 slots with one '?' at random position
    const slots = [];
    const questionPos = Math.floor(Math.random() * 6);
    let presentIdx = 0;
    for (let i = 0; i < 6; i++) {
      if (i === questionPos) {
        slots.push('?');
      } else {
        slots.push(present[presentIdx++]);
      }
    }
    setSymbolSlots(slots);
  }, []);

  // effect: detect missing symbol and replace '?' automatically
  useEffect(() => {
    if (!symbolSlots || symbolSlots.length === 0) return;
    const presentNums = symbolSlots.filter(s => s !== '?');
    const all = [1,2,3,4,5,6];
    const missing = all.find(n => !presentNums.includes(n));
    if (missing === undefined) return; // nothing to replace
    const newSlots = symbolSlots.map(s => (s === '?' ? missing : s));
    // Update only if we still have a '?' present (so replacement happens once)
    if (symbolSlots.includes('?')) {
      setSymbolSlots(newSlots);
    }
  }, [symbolSlots]);

  // PLANETS: sort alphabetically (locale aware: assume português)
  const sortedPlanets = useMemo(() => {
    return planets.slice().sort((a, b) => a.name.localeCompare(b.name, 'pt'));
  }, [planets]);

  // handlers for PASSO 1 planet clicks
  function togglePlanetSelection(planet) {
    const existsIndex = selectedPlanets.findIndex(p => p.name === planet.name);
    if (existsIndex >= 0) {
      // deselect: remove from array and shift others left (keep order)
      const newSel = selectedPlanets.filter(p => p.name !== planet.name);
      setSelectedPlanets(newSel);
    } else {
      // select: if less than 3, append; if 3, ignore (or optionally rotate?)
      if (selectedPlanets.length >= 3) {
        // do nothing (or show feedback) — spec says clicking fills next empty; cannot exceed 3
        return;
      }
      setSelectedPlanets([...selectedPlanets, planet]);
    }
  }

  // compute password when 3 filled: concat numeric values
  const password = selectedPlanets.length === 3 ? selectedPlanets.map(p => String(p.value)).join('') : '';

  // PASSO 3 structures: toggle book checkbox
  function toggleBook(structId, bookIndex) {
    setStructures(prev => prev.map(s => {
      if (s.id !== structId) return s;
      const newBooks = s.books.slice();
      newBooks[bookIndex] = !newBooks[bookIndex];
      return { ...s, books: newBooks };
    }));
  }

  // compute giros necessários: show rotationRequired - selectedBooksCount, min 0
  function girosNecessarios(struct) {
    const selectedCount = struct.books.filter(Boolean).length;
    return Math.max(0, struct.rotationRequired - selectedCount);
  }

  // PASSO 4 leaf selection: select direction for a planet, disabling same on others
  function toggleLeafDirection(planetName, dir) {
    setLeafSelections(prev => {
      const current = prev[planetName] || null;
      if (current === dir) {
        // deselect
        const clone = { ...prev };
        delete clone[planetName];
        return clone;
      } else {
        return { ...prev, [planetName]: dir };
      }
    });
  }
  // helper to check if a direction is disabled for a given planet (already selected by other planet)
  function isDirectionDisabledFor(planetName, dir) {
    return Object.entries(leafSelections).some(([p, d]) => p !== planetName && d === dir);
  }

  // Try to fetch planet data (if there's a /data/planets.json hosted), but silently fallback
  useEffect(() => {
    // attempt fetch from /data/planets.json (non-blocking; if not present we keep FALLBACK_PLANETS)
    fetch('/data/planets.json').then(res => {
      if (!res.ok) throw new Error('no data');
      return res.json();
    }).then(json => {
      if (Array.isArray(json) && json.length > 0) {
        // expect array of { name, value }
        setPlanets(json);
      }
    }).catch(() => {
      // keep fallback
    });
  }, []);

  return (
    <div className="p-6 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1 className="text-2xl font-bold mb-3">COD Zombies EE Helper — Versão Editada</h1>

      {/* PASSO 1 — Planetas */}
      <section className="mb-6">
        <h2 className="font-semibold">Planetas (clique para selecionar — 3 slots)</h2>
        <div className="flex gap-3 mt-2 mb-2">
          {sortedPlanets.map(planet => {
            const selected = selectedPlanets.some(p => p.name === planet.name);
            return (
              <button
                key={planet.name}
                onClick={() => togglePlanetSelection(planet)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: selected ? '#2563eb' : '#111827',
                  border: '1px solid #374151',
                  cursor: 'pointer',
                }}
              >
                {planet.name}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {[0,1,2].map(i => {
            const p = selectedPlanets[i];
            return (
              <div key={i} style={{
                width: 140, height: 48, borderRadius: 8, background: '#0f172a', border: '1px solid #334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {p ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>Valor: {p.value}</div>
                  </div>
                ) : <span style={{ color: '#64748b' }}>Vazio</span>}
              </div>
            );
          })}
        </div>

        {password ? (
          <div style={{ marginTop: 12 }}>
            <strong>Senha formada:</strong> <span style={{ fontFamily: 'monospace', marginLeft: 8 }}>{password}</span>
          </div>
        ) : null}
      </section>

      {/* PASSO 2 — Coordenadas de Marte */}
      <section className="mb-6">
        <h2 className="font-semibold">Coordenadas de Marte</h2>
        <p className="text-sm text-gray-300">(Sem alterações — deixado exatamente como o original.)</p>
      </section>

      {/* PASSO 3 — Livros / Estruturas */}
      <section className="mb-6">
        <h2 className="font-semibold">Estruturas</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
          <div><StructureImagePlaceholder /></div>
          <div style={{ color: '#9CA3AF' }}>Imagem da Estrutura (placeholder)</div>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
          {structures.map(struct => (
            <div key={struct.id} style={{ padding: 12, background: '#0b1220', borderRadius: 8, border: '1px solid #263044' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>{struct.name}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Giros necessários: {girosNecessarios(struct)}</div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                {struct.books.map((checked, idx) => (
                  <label key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBook(struct.id, idx)}
                    />
                    <span>Livro {idx + 1}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PASSO 4 — Folhas Planetárias */}
      <section className="mb-6">
        <h2 className="font-semibold">Folhas Planetárias</h2>
        <div style={{ marginTop: 8 }}>
          {planetaryLeafPlanets.map(pName => (
            <div key={pName} style={{ marginBottom: 10, padding: 10, background: '#071022', borderRadius: 6 }}>
              <div style={{ fontWeight: 600 }}>{pName}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {directions.map(dir => {
                  const selected = leafSelections[pName] === dir;
                  const disabled = isDirectionDisabledFor(pName, dir);
                  return (
                    <button
                      key={dir}
                      onClick={() => toggleLeafDirection(pName, dir)}
                      disabled={disabled && !selected}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: selected ? '#10b981' : '#0b1220',
                        border: disabled && !selected ? '1px dashed #374151' : '1px solid #263044',
                        cursor: disabled && !selected ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {dir}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: '#9CA3AF' }}>
          Nota: cada direção só pode ser escolhida por um planeta — seleção é mutuamente exclusiva entre planetas.
        </div>
      </section>

      {/* PASSO 5 — Símbolos */}
      <section className="mb-6">
        <h2 className="font-semibold">Símbolos</h2>
        <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {symbolSlots.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SymbolSVG label={String(s)} />
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>Slot {idx + 1}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, color: '#9CA3AF', fontSize: 13 }}>
          O “?” é detectado e substituído automaticamente pelo símbolo faltante do conjunto.
        </div>
      </section>
    </div>
  );
}
