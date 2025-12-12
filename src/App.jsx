import React, { useEffect, useMemo, useState } from 'react';

/*
  App.jsx — aplica os PASSOS 1 a 5 solicitados e preserva layout básico.
  Usa SVGs embutidos como placeholders e mantém uma lista fallback de planetas,
  além de tentar carregar /data/planets.json se você adicionar esse arquivo.
*/

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
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="26" fill="#0f172a" stroke="#374151" strokeWidth="1"/>
      <text x="50%" y="50%" fill="#e5e7eb" fontSize="18" textAnchor="middle" dominantBaseline="middle">{label}</text>
    </svg>
  );
}

export default function App() {
  // Planets data
  const [planets, setPlanets] = useState(FALLBACK_PLANETS);

  // PASSO 1 — selections: up to 3 slots
  const [selectedPlanets, setSelectedPlanets] = useState([]);

  // PASSO 3 — estantes (was estruturas): include bookTitles
  const [estantes, setEstantes] = useState([
    {
      id: 1,
      name: 'Estante #1',
      rotationRequired: 2,
      books: [false, false, false],
      bookTitles: ['The Musica Universalis', 'The Black Veil', 'The Moon Directive']
    },
    {
      id: 2,
      name: 'Estante #2',
      rotationRequired: 1,
      books: [false, false, false],
      bookTitles: ['Ashes and Bones', 'Echoes of Andromeda', 'The Unknowable Void']
    },
    {
      id: 3,
      name: 'Estante #3',
      rotationRequired: 3,
      books: [false, false, false],
      bookTitles: ['Pyramids of Cydonia', 'Silence at Singularity', 'Witchlight Codex']
    }
  ]);

  // PASSO 4 — planetary leaves (Júpiter, Netuno, Marte)
  const leafPlanets = ['Júpiter', 'Netuno', 'Marte'];
  const dirs = ['NW', 'NE', 'SE', 'SW'];
  const [leafSelections, setLeafSelections] = useState({});

  // PASSO 5 — symbols
  const [symbolSlots, setSymbolSlots] = useState([]);

  useEffect(() => {
    // tenta carregar /data/planets.json se você colocar em public/data/planets.json
    fetch('/data/planets.json').then(r => {
      if (!r.ok) throw new Error('no data');
      return r.json();
    }).then(json => {
      if (Array.isArray(json) && json.length > 0) setPlanets(json);
    }).catch(() => {/* uso fallback */});

    // inicia símbolos: 1..6, remove 1 (falta), mostra 5 números + '?' e depois substitui
    const all = [1,2,3,4,5,6];
    const shuffled = all.slice().sort(() => Math.random() - 0.5);
    const present = shuffled.slice(1); // 5 números
    const slots = [];
    const qpos = Math.floor(Math.random() * 6);
    let pi = 0;
    for (let i=0;i<6;i++) {
      if (i === qpos) slots.push('?'); else slots.push(present[pi++]);
    }
    setSymbolSlots(slots);
  }, []);

  // substitui '?' pelo símbolo que falta
  useEffect(() => {
    if (!symbolSlots || symbolSlots.length === 0) return;
    const present = symbolSlots.filter(s => s !== '?');
    const all = [1,2,3,4,5,6];
    const missing = all.find(n => !present.includes(n));
    if (missing !== undefined && symbolSlots.includes('?')) {
      setSymbolSlots(symbolSlots.map(s => s === '?' ? missing : s));
    }
  }, [symbolSlots]);

  // sorted planets (pt)
  const sortedPlanets = useMemo(() => planets.slice().sort((a,b) => a.name.localeCompare(b.name, 'pt')), [planets]);

  // PASSO 1 handlers
  function onPlanetClick(planet) {
    const exists = selectedPlanets.findIndex(p => p.name === planet.name);
    if (exists >= 0) {
      setSelectedPlanets(selectedPlanets.filter(p => p.name !== planet.name));
    } else {
      if (selectedPlanets.length >= 3) return;
      setSelectedPlanets([...selectedPlanets, planet]);
    }
  }

  const password = selectedPlanets.length === 3 ? selectedPlanets.map(p => String(p.value)).join('') : '';

  // PASSO 3 book toggle
  function toggleBook(estanteId, idx) {
    setEstantes(prev => prev.map(es => {
      if (es.id !== estanteId) return es;
      const nb = es.books.slice(); nb[idx] = !nb[idx];
      return { ...es, books: nb };
    }));
  }
  function giros(es) {
    const sel = es.books.filter(Boolean).length;
    return Math.max(0, es.rotationRequired - sel);
  }

  // PASSO 4 leaf selection (mutually exclusive)
  function toggleLeaf(planetName, dir) {
    setLeafSelections(prev => {
      const cur = prev[planetName] || null;
      // If clicking the same selected direction -> deselect
      if (cur === dir) {
        const clone = { ...prev };
        delete clone[planetName];
        return clone;
      }
      // Otherwise, select dir for this planet and ensure no other planet holds the same dir
      const clone = { ...prev };
      // Remove this dir from any other planet (keeps state consistent)
      for (const p of Object.keys(clone)) {
        if (p !== planetName && clone[p] === dir) {
          delete clone[p];
        }
      }
      clone[planetName] = dir;
      return clone;
    });
  }
  function isDirDisabled(planetName, dir) {
    // disabled if another planet already selected this dir
    return Object.entries(leafSelections).some(([p,d]) => p !== planetName && d === dir);
  }

  return (
    <div style={{Padding:20, fontFamily: 'Inter, sans-serif', color: '#e5e7eb'}}>
      <h1 style={{fontSize:20, fontWeight:700}}>COD Zombies EE Helper</h1>
      <p style={{color:'#9ca3af'}}>Aplicação com as alterações pedidas.</p>

      {/* PASSO 1 — Planetas como botões */}
      <section style={{marginTop:18}}>
        <h2 style={{fontWeight:600}}>Planetas (clique para selecionar — até 3)</h2>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
          {sortedPlanets.map(pl => {
            const sel = selectedPlanets.some(s => s.name === pl.name);
            return (
              <button key={pl.name} onClick={() => onPlanetClick(pl)}
                style={{padding:'8px 10px', borderRadius:8, background: sel ? '#2563eb' : '#0b1220', border:'1px solid #374151', cursor:'pointer'}}>
                {pl.name}
              </button>
            );
          })}
        </div>

        <div style={{display:'flex', gap:10, marginTop:10}}>
          {[0,1,2].map(i => {
            const p = selectedPlanets[i];
            return (
              <div key={i} style={{width:160, height:54, borderRadius:8, background:'#071022', border:'1px solid #263044', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {p ? (
                  <div style={{textAlign:'center'}}>
                    <div style={{fontWeight:600}}>{p.name}</div>
                    <div style={{fontSize:12, color:'#9ca3af'}}>Valor: {p.value}</div>
                  </div>
                ) : <div style={{color:'#64748b'}}>Vazio</div>}
              </div>
            );
          })}
        </div>

        {password && (
          <div style={{marginTop:10}}><strong>Senha formada:</strong> <span style={{fontFamily:'monospace', marginLeft:8}}>{password}</span></div>
        )}
      </section>

      {/* PASSO 2 — Coordenadas de Marte (sem alteração) */}
      <section style={{marginTop:18}}>
        <h2 style={{fontWeight:600}}>Coordenadas de Marte</h2>
        <div style={{color:'#9ca3af'}}>Sem alterações — deixado como estava.</div>
      </section>

      {/* PASSO 3 — Livros / Estantes */}
      <section style={{marginTop:18}}>
        <h2 style={{fontWeight:600}}>Estantes</h2>
        <div style={{display:'flex', alignItems:'center', gap:12, marginTop:8}}>
          <StructureImagePlaceholder />
          <div style={{color:'#9ca3af'}}>Imagem da Estante (placeholder)</div>
        </div>

        <div style={{display:'grid', gap:12, marginTop:12}}>
          {estantes.map(es => (
            <div key={es.id} style={{padding:12, background:'#071022', borderRadius:8, border:'1px solid #263044'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{fontWeight:600}}>{es.name}</div>
                <div style={{fontSize:12, color:'#9ca3af'}}>Giros necessários: {giros(es)}</div>
              </div>
              <div style={{marginTop:8, display:'flex', gap:10, flexDirection:'column'}}>
                {es.bookTitles.map((title,idx) => (
                  <label key={idx} style={{display:'flex', alignItems:'center', gap:8}}>
                    <input type="checkbox" checked={es.books[idx]} onChange={() => toggleBook(es.id, idx)} />
                    <span>{title}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PASSO 4 — Folhas Planetárias */}
      <section style={{marginTop:18}}>
        <h2 style={{fontWeight:600}}>Folhas Planetárias</h2>
        <div style={{marginTop:8}}>
          {leafPlanets.map(pn => (
            <div key={pn} style={{marginBottom:10, padding:10, background:'#061226', borderRadius:8}}>
              <div style={{fontWeight:600}}>{pn}</div>
              <div style={{marginTop:8, display:'flex', gap:8}}>
                {dirs.map(d => {
                  const selected = leafSelections[pn] === d;
                  const disabled = isDirDisabled(pn, d);
                  return (
                    <button key={d} onClick={() => toggleLeaf(pn, d)} disabled={disabled && !selected}
                      title={disabled && !selected ? 'Direção já selecionada por outro planeta' : ''}
                      style={{padding:'6px 8px', borderRadius:6, background: selected ? '#10b981' : '#0b1220', border: disabled && !selected ? '1px dashed #374151' : '1px solid #263044', opacity: disabled && !selected ? 0.5 : 1, cursor: disabled && !selected ? 'not-allowed' : 'pointer'}}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{fontSize:13, color:'#9ca3af'}}>Cada direção só pode ser escolhida por um planeta (mutuamente exclusiva).</div>
      </section>

      {/* PASSO 5 — Símbolos */}
      <section style={{marginTop:18}}>
        <h2 style={{fontWeight:600}}>Símbolos</h2>
        <div style={{display:'flex', gap:12, flexWrap:'wrap', marginTop:8}}>
          {symbolSlots.map((s, i) => (
            <div key={i} style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
              <SymbolSVG label={String(s)} />
              <div style={{fontSize:12, color:'#9ca3af', marginTop:6}}>Slot {i+1}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:8, color:'#9ca3af'}}>O '?' é detectado e substituído automaticamente pelo símbolo que falta.</div>
      </section>
    </div>
  );
}
