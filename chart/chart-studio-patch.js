/* Chord Chart Studio - parche v1
   Uso: agregar esta línea justo antes de </body> en tu HTML:
   <script src="chart-studio-patch.js"></script>                                  */
(function () {
  'use strict';
  const W = window, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wrap = $('#sheetsContainer');
  const FX = '.section-badge-container,.song2-subtitle-wrapper,.volta-bracket,.custom-tie-overlay,.measure-dynamics-container,.band-annotation';
  const HANDLES = '.fx-ui,.drag-handle,.volta-drag,.tie-drag,.dyn-drag';

  /* ---------- CSS ---------- */
  const st = document.createElement('style');
  st.textContent = `
  .sheets-container{background:#2a2a2d}
  .chart-paper{background:#fffef9;background-image:radial-gradient(rgba(120,100,60,.05) 1px,transparent 1px);background-size:4px 4px;border:1px solid #e4dcc8;box-shadow:0 1px 1px rgba(0,0,0,.2),0 20px 45px rgba(0,0,0,.55)}
  body.landscape .chart-paper{width:1123px;height:794px;max-height:794px}
  .paper-inner{height:auto!important;flex:1;min-height:0}
  .chord-input,.chord-display{font-family:'Montserrat','Inter',sans-serif;font-weight:800;font-size:1.3em;letter-spacing:.2px}
  .chord-input:not(:focus){color:transparent}
  .chord-display{position:absolute;left:0;top:14px;white-space:nowrap;pointer-events:none;color:#0f172a;line-height:1.25}
  .chord-input:focus+.chord-display{display:none}
  .chord-display sup{font-size:.58em;position:relative;top:-.5em;vertical-align:baseline;font-weight:800}
  .fx-ui{font:700 11px Inter,sans-serif;color:#64748b;padding:0 3px;user-select:none;cursor:pointer}
  .fx-move{cursor:grab;touch-action:none}
  .fx-del{opacity:0}
  *:hover>.fx-del{opacity:1}
  .fx-resize{position:absolute;right:-3px;top:0;bottom:0;width:7px;cursor:ew-resize;background:rgba(100,116,139,.45);border-radius:3px;padding:0;touch-action:none}
  .band-annotation{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
  .exporting .fx-ui,.exporting .drag-handle,.exporting .volta-drag,.exporting .tie-drag,.exporting .dyn-drag{display:none!important}
  .exporting .custom-tie-overlay,.exporting .measure-dynamics-container,.exporting .band-annotation,.exporting .section-badge-container,.exporting .song2-subtitle-wrapper{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
  .chord-row{display:flex;height:26px;position:absolute;left:0;right:0;top:-30px}
  .chord-cell{position:relative;flex:1 1 0;min-width:0;transform:translate(calc(var(--dx,0px) + var(--push,0px)),var(--dy,0px))}
  .chord-cell .chord-input{position:absolute;left:0;top:0;width:100%}
  .chord-cell .chord-display{top:0}
  .chord-cell:focus-within{z-index:5}
  .chord-cell .chord-input:focus{width:84px;background:#fffef9;box-shadow:0 0 0 1px #94a3b8;border-radius:3px}
  .chord-beat::placeholder{color:transparent}
  .measure-box:hover .chord-beat::placeholder{color:#cbd5e1}
  .exporting .chord-input::placeholder{color:transparent!important}
  .measure-grip{position:absolute;right:-5px;top:0;bottom:0;width:10px;cursor:col-resize;z-index:8;touch-action:none}
  .measure-grip:hover{background:rgba(100,116,139,.35)}
  .exporting .measure-grip{display:none}
  :root{--staff:linear-gradient(#0f172a,#0f172a) 0 25%/100% 1.2px no-repeat,linear-gradient(#0f172a,#0f172a) 0 50%/100% 1.2px no-repeat,linear-gradient(#0f172a,#0f172a) 0 75%/100% 1.2px no-repeat}
  .measures-grid{border-left:0!important}
  .chart-paper .measure-box{height:46px;margin-top:36px;padding:0 6px;background:var(--staff);border-left:0}
  .chart-paper .measure-box.rf{border-left:1.5px solid #0f172a}
  body .measure-box.selected{background:var(--staff),#e8eef6!important}
  .measure-main{padding:0!important}
  .rhythm-beats-container{height:100%!important}
  .section-block{margin-top:44px!important}
  .measure-box.repeat-start::before,.measure-box.repeat-end::before{top:14px;box-shadow:0 14px 0 0 #0f172a}
  .chord-nudge{position:absolute;top:-9px;left:0;font:700 9px Inter,sans-serif;color:#64748b;cursor:grab;opacity:0;user-select:none;touch-action:none;z-index:6}
  .chord-cell.has:hover>.chord-nudge,.chord-nudge:hover{opacity:1}
  .exporting .chord-nudge{display:none}
  .tie-layer{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:20;overflow:visible}
  .measure-num{position:absolute;left:-17px;top:-11px;width:14px;text-align:right;font:italic 700 9px Inter,sans-serif;color:#0f172a;pointer-events:none}
  `;
  document.head.appendChild(st);

  /* ---------- Utilidades: undo con valores de inputs ---------- */
  const sync = () => $$('#sheetsContainer input').forEach(i => i.setAttribute('value', i.value));
  const _save = W.saveStateForUndo, _undo = W.undoAction, _redo = W.redoAction;
  W.saveStateForUndo = () => { sync(); _save(); };
  W.undoAction = () => { sync(); _undo(); };
  W.redoAction = () => { sync(); _redo(); };
  window.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') sync(); }, true);

  /* ---------- Acordes: normalización, superíndices y transposición ---------- */
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function chordPart(s) {
    const m = s.match(/^([A-G])([♯♭#b]?)(.*)$/);
    if (!m) return esc(s);
    const q = m[3].match(/^(maj|min|dim|aug|sus|add|m|M|°|ø|\+|-)?(.*)$/);
    return m[1] + (m[2] ? '<sup>' + m[2] + '</sup>' : '') + esc(q[1] || '') + (q[2] ? '<sup>' + esc(q[2]) + '</sup>' : '');
  }
  function chordHTML(v) {
    v = v.trim(); if (!v) return '';
    const k = v.lastIndexOf('/');
    return k > 0 ? chordPart(v.slice(0, k)) + '/' + chordPart(v.slice(k + 1)) : chordPart(v);
  }
  function refreshChords() {
    $$('.chord-input').forEach(inp => {
      let d = inp.nextElementSibling;
      if (!d || !d.classList.contains('chord-display')) { d = document.createElement('div'); d.className = 'chord-display'; inp.after(d); }
      d.innerHTML = chordHTML(inp.value);
    });
    spaceChords();
  }
  W.formatChordInput = inp => {
    inp.value = inp.value.trim().replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭').replace(/dim/gi, '°');
    refreshChords();
  };
  const BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const SH = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'], FL = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  W.transposeChord = (ch, s) => ch.replace(/[A-G][#b♯♭]?/g, m => {
    const a = m[1] || '', flat = a === 'b' || a === '♭', n = (BASE[m[0]] + (a === '#' || a === '♯' ? 1 : flat ? -1 : 0) + s + 120) % 12;
    return (flat || (!a && s < 0) ? FL : SH)[n];
  });
  W.transposeAll = s => {
    saveStateForUndo();
    $$('.chord-input').forEach(i => { if (i.value.trim()) i.value = transposeChord(i.value, s); });
    refreshChords();
  };
  const _cmc = W.clearMeasureContent;
  W.clearMeasureContent = m => { _cmc(m); $$('.chord-input', m).forEach(i => i.value = ''); refreshChords(); };

  /* ---------- Símbolos flotantes: arrastre libre X/Y, ancho, borrar ---------- */
  function deco(el) {
    if (el.querySelector(':scope>.fx-ui')) return;
    const add = (cls, txt, title) => { const s = document.createElement('span'); s.className = 'fx-ui ' + cls; s.contentEditable = 'false'; s.textContent = txt; if (title) s.title = title; el.appendChild(s); };
    if (el.classList.contains('band-annotation')) { const h = document.createElement('span'); h.className = 'fx-ui fx-move'; h.contentEditable = 'false'; h.textContent = '⠿'; el.prepend(h); }
    if (/volta-bracket|custom-tie|measure-dynamics/.test(el.className)) add('fx-resize', '', 'Ancho');
    add('fx-del', '×', 'Quitar');
  }
  document.addEventListener('pointerdown', e => {
    const u = e.target.closest && e.target.closest(HANDLES);
    if (!u) return;
    const el = u.closest(FX); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    if (u.classList.contains('fx-del')) return;
    const sx = e.clientX, sy = e.clientY, cs = getComputedStyle(el), resize = u.classList.contains('fx-resize');
    const t0 = parseFloat(cs.top) || 0, l0 = parseFloat(cs.left) || 0, w0 = el.offsetWidth;
    let saved = false;
    const mv = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!saved && Math.hypot(dx, dy) > 3) { saveStateForUndo(); saved = true; }
      if (!saved) return;
      if (resize) { el.style.width = Math.max(24, w0 + dx) + 'px'; return; }
      el.style.top = (t0 + dy) + 'px'; el.style.left = (l0 + dx) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
    };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); if (saved) tick(); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  }, true);
  document.addEventListener('click', e => {
    const u = e.target.closest && e.target.closest('.fx-del'); if (!u) return;
    e.stopPropagation(); saveStateForUndo(); u.closest(FX).remove();
  }, true);

  /* Varias dinámicas / anotaciones por compás (antes se pisaban) */
  function addFx(cls, html, left, extra) {
    if (!selectedMeasures.length) return;
    saveStateForUndo();
    const m = selectedMeasures[0], d = document.createElement('div');
    d.className = cls; d.style.left = left(m) + 'px'; d.innerHTML = html;
    if (extra) extra(d);
    m.appendChild(d);
  }
  const count = (m, c) => m.querySelectorAll('.' + c).length;
  W.applyDynamicText = t => addFx('measure-dynamics-container', `<span class="dyn-drag">⠿</span><span style="font-size:1.1em;margin:0 auto">${esc(t)}</span>`, m => count(m, 'measure-dynamics-container') * 46, d => d.style.width = '56px');
  W.applyHairpin = type => addFx('measure-dynamics-container', `<span class="dyn-drag">⠿</span><div style="flex:1;height:100%;display:flex;align-items:center"><svg width="100%" height="14" viewBox="0 0 100 14" preserveAspectRatio="none"><path d="${type === 'crescendo' ? 'M 0 7 L 100 0 M 0 7 L 100 14' : 'M 0 0 L 100 7 M 0 14 L 100 7'}" stroke="#0f172a" stroke-width="1.5" fill="none"/></svg></div>`, m => count(m, 'measure-dynamics-container') * 46, d => d.style.width = '100px');
  W.setDynamicFontSize = size => selectedMeasures.forEach(m => $$('.measure-dynamics-container span:not(.dyn-drag)', m).forEach(s => s.style.fontSize = size));
  W.addAnnotation = (text, editable) => {
    if (!selectedMeasures.length) return;
    saveStateForUndo();
    const m = selectedMeasures[0], b = document.createElement('span');
    b.className = 'band-annotation'; b.contentEditable = 'true';
    b.style.top = (-46 - count(m, 'band-annotation') * 18) + 'px'; b.style.left = '4px'; b.style.right = 'auto';
    b.appendChild(document.createTextNode(text)); m.appendChild(b);
  };

  /* Funciones que el HTML llamaba y no existían / fallaban */
  W.toggleSystemBreak = () => {
    const m = selectedMeasures[selectedMeasures.length - 1]; if (!m) return;
    saveStateForUndo();
    const n = m.nextElementSibling;
    if (n && n.classList.contains('break-system')) n.remove();
    else { const b = document.createElement('div'); b.className = 'measure-box break-system'; m.after(b); }
  };
  W.formatStrict4BarsPerSystem = () => {
    saveStateForUndo();
    $$('.measures-grid').forEach(g => {
      $$('.break-system', g).forEach(b => b.remove());
      const ms = $$('.measure-box', g);
      ms.forEach((m, i) => {
        m.style.flex = '0 0 25%';
        if ((i + 1) % 4 === 0 && i < ms.length - 1) { const b = document.createElement('div'); b.className = 'measure-box break-system'; m.after(b); }
      });
    });
  };

  /* ---------- Rítmica: duraciones en semicorcheas (1 pulso = 4) ---------- */
  const DUR = { slash: 4, q: 4, h: 4, w: 4, '8': 2, '16': 1 };
  const norm = it => {
    if (it.dur) return it;
    const r = it.type[0] === 'r' && it.type !== 'rq' ? true : it.type[0] === 'r', b = r ? it.type.slice(1) : it.type;
    it.rest = r; it.dur = Math.round((DUR[b] || 4) * (it.dot && DUR[b] < 4 ? 1.5 : 1)); return it;
  };
  const retype = it => {
    if (/^r?[hw]$/.test(it.type)) return it;
    const d = it.dur, r = it.rest; it.dot = d === 3 || !!it.dotq;
    it.type = d === 4 ? (r ? 'rq' : it.type === 'slash' ? 'slash' : 'q') : d === 1 ? (r ? 'r16' : '16') : (r ? 'r8' : '8');
    return it;
  };
  const mkItem = (dur, rest) => ({ type: 'slash', dot: false, tie: false, articulation: '', scale: 1.4, dur, rest: !!rest });
  function resize(a, i, nd) {
    let need = nd - a[i].dur;
    if (need < 0) { a[i].dur = nd; a.splice(i + 1, 0, mkItem(-need)); return i; }
    let j = i + 1;
    while (need > 0 && j < a.length) { if (a[j].dur <= need) { need -= a[j].dur; a.splice(j, 1); } else { a[j].dur -= need; need = 0; } }
    for (j = i - 1; need > 0 && j >= 0; j--) { if (a[j].dur <= need) { need -= a[j].dur; a.splice(j, 1); i--; } else { a[j].dur -= need; need = 0; } }
    a[i].dur = nd; return i;
  }
  const newSlot = (items, flex) => {
    const s = document.createElement('div'); s.className = 'beat-slot'; s.style.flex = flex || '1';
    s.onclick = function (e) { selectBeatSlot(this, e, 0); }; setBeatData(s, items); return s;
  };
  const focusSlot = (s, i) => { $$('.beat-slot.active-beat').forEach(b => b.classList.remove('active-beat')); s.classList.add('active-beat'); activeBeatSlot = s; activeSubIndex = i || 0; renderBeatSlot(s); };

  W.applySubdivisionRhythm = type => {
    if (!activeBeatSlot) return;
    saveStateForUndo();
    const rest = type[0] === 'r' && type !== 'rw' && type !== 'rh' ? true : type[0] === 'r', t = rest ? type.slice(1) : type;
    let slot = activeBeatSlot; const cont = slot.parentNode;
    const reset4 = () => { cont.innerHTML = ''; for (let k = 0; k < 4; k++) cont.appendChild(newSlot([mkItem(4)])); slot = cont.firstChild; };
    if (t === 'w') { cont.innerHTML = ''; slot = newSlot([{ type, dot: false, tie: false, articulation: '', dur: 4, rest }]); cont.appendChild(slot); focusSlot(slot); return; }
    if (t === 'h') {
      if (slot.style.flex !== '2') {
        if (cont.children.length < 4) reset4();
        const nb = slot.nextElementSibling || slot.previousElementSibling;
        if (!nb || nb.style.flex === '2') return;
        nb.remove(); slot.style.flex = '2';
      }
      setBeatData(slot, [{ type, dot: false, tie: false, articulation: '', dur: 4, rest }]); focusSlot(slot); return;
    }
    const first = getBeatData(slot)[0];
    if (cont.children.length < 4 && first && /^r?w$/.test(first.type)) { reset4(); }
    else if (slot.style.flex === '2') { slot.style.flex = '1'; setBeatData(slot, [mkItem(4)]); slot.after(newSlot([mkItem(4)])); }
    const items = getBeatData(slot).map(norm);
    let i = Math.min(activeSubIndex, items.length - 1);
    const nd = t === '16' ? 1 : t === '8' ? 2 : 4;
    i = resize(items, i, nd); items[i].rest = rest;
    if (t === 'q') items[i].type = 'q'; else if (t === 'slash') items[i].type = 'slash';
    items.forEach(retype); setBeatData(slot, items); focusSlot(slot, i);
  };
  W.toggleSubdivisionDot = () => {
    if (!activeBeatSlot) return;
    const items = getBeatData(activeBeatSlot).map(norm), i = Math.min(activeSubIndex, items.length - 1);
    if (items[i].dur !== 2 && items[i].dur !== 3) return;
    saveStateForUndo();
    const ni = resize(items, i, items[i].dur === 2 ? 3 : 2);
    items.forEach(retype); setBeatData(activeBeatSlot, items); focusSlot(activeBeatSlot, ni);
  };

  W.renderBeatSlot = slot => {
    const items = getBeatData(slot).map(norm); items.forEach(retype);
    const K = '#0f172a', on = slot.classList.contains('active-beat');
    let t = 0; const xs = items.map(it => { const x = items.length === 1 ? 20 : 7 + t * 8.5; t += it.dur; return x; });
    const groups = []; let cur = [];
    items.forEach((it, i) => { if (!it.rest && !it.cont && it.dur < 4 && !/[hw]$/.test(it.type)) cur.push(i); else { if (cur.length) groups.push(cur); cur = []; } });
    if (cur.length) groups.push(cur);
    const beamed = new Set(groups.filter(g => g.length > 1).flat());
    let s = '<svg viewBox="0 0 40 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">';
    items.forEach((it, i) => {
      const x = xs[i], ty = it.type.replace(/^r/, '');
      s += `<g class="sub-item-target" onclick="handleSubItemClick(this.closest('.beat-slot'),${i},event)"><rect x="${x - 6}" y="0" width="12" height="40" fill="transparent"/>`;
      if (on && i === activeSubIndex) s += `<rect x="${x - 6}" y="2" width="12" height="36" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="2,2" rx="2"/>`;
      if (it.cont) { s += '</g>'; return; }
      if (it.rest) {
        if (ty === 'w') s += `<line x1="10" y1="14" x2="30" y2="14" stroke="${K}" stroke-width="1"/><rect x="14" y="14" width="12" height="5" fill="${K}"/>`;
        else if (ty === 'h') s += `<line x1="10" y1="24" x2="30" y2="24" stroke="${K}" stroke-width="1"/><rect x="14" y="19" width="12" height="5" fill="${K}"/>`;
        else if (ty === 'q') s += `<path d="M ${x - 2} 8 L ${x + 3} 14 L ${x - 3} 20 L ${x + 2} 26 C ${x - 4} 28 ${x - 4} 31 ${x + 1} 31" fill="none" stroke="${K}" stroke-width="2" stroke-linecap="round"/>`;
        else if (ty === '8') s += `<circle cx="${x - 2}" cy="14" r="1.7" fill="${K}"/><path d="M ${x - 2} 14 Q ${x + 2} 12 ${x + 1} 18 L ${x - 3} 28" fill="none" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/>`;
        else s += `<circle cx="${x - 2}" cy="12" r="1.5" fill="${K}"/><circle cx="${x - 3}" cy="18" r="1.5" fill="${K}"/><path d="M ${x - 2} 12 Q ${x + 2} 10 ${x + 1} 16 L ${x - 3} 28" fill="none" stroke="${K}" stroke-width="1.4" stroke-linecap="round"/>`;
      } else {
        if (ty === 'w') s += `<ellipse cx="20" cy="20" rx="8" ry="5.5" fill="none" stroke="${K}" stroke-width="3" transform="rotate(-15 20 20)"/>`;
        else {
          const hollow = ty === 'h', p = `${x - 4.5},24 ${x - 1.5},24 ${x + 4.5},11 ${x + 1.5},11`;
          s += hollow ? `<polygon points="${p}" fill="#fffef9" stroke="${K}" stroke-width="1.3"/>` : `<polygon points="${p}" fill="${K}"/>`;
          if (ty !== 'slash') s += `<line x1="${x - 3}" y1="24" x2="${x - 3}" y2="34" stroke="${K}" stroke-width="1.6"/>`;
          if ((ty === '8' || ty === '16') && !beamed.has(i)) for (let f = 0; f < (ty === '16' ? 2 : 1); f++) s += `<path d="M ${x - 3} ${34 - f * 4.5} Q ${x + 4} ${31 - f * 4.5} ${x + 3.5} ${24 - f * 4.5}" fill="none" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/>`;
        }
        const a = it.articulation, ay = 5;
        if (a === 'staccato') s += `<circle cx="${x}" cy="${ay}" r="1.3" fill="${K}"/>`;
        else if (a === 'staccatissimo') s += `<polygon points="${x - 1.4},${ay - 2} ${x + 1.4},${ay - 2} ${x},${ay + 3}" fill="${K}"/>`;
        else if (a === 'accent') s += `<path d="M ${x - 3.5} ${ay - 2} L ${x + 3.5} ${ay + 0.5} L ${x - 3.5} ${ay + 3}" fill="none" stroke="${K}" stroke-width="1.3"/>`;
        else if (a === 'tenuto') s += `<line x1="${x - 3.5}" y1="${ay}" x2="${x + 3.5}" y2="${ay}" stroke="${K}" stroke-width="1.5"/>`;
        else if (a === 'marcato') s += `<path d="M ${x - 3} ${ay + 3} L ${x} ${ay - 2} L ${x + 3} ${ay + 3}" fill="none" stroke="${K}" stroke-width="1.3"/>`;
        else if (a === 'fermata') s += `<path d="M ${x - 4.5} ${ay + 3} Q ${x} ${ay - 5} ${x + 4.5} ${ay + 3}" fill="none" stroke="${K}" stroke-width="1.3"/><circle cx="${x}" cy="${ay + 1}" r="1" fill="${K}"/>`;
      }
      if (it.dot) s += `<circle cx="${x + 6.5}" cy="${it.rest ? 19 : 16.5}" r="1.5" fill="${K}"/>`;
      s += '</g>';
    });
    groups.filter(g => g.length > 1).forEach(g => {
      const ln = (a, b, y) => `<line x1="${a}" y1="${y}" x2="${b}" y2="${y}" stroke="${K}" stroke-width="2.6"/>`;
      s += ln(xs[g[0]] - 3, xs[g[g.length - 1]] - 3, 34);
      g.forEach((idx, k) => {
        if (items[idx].dur !== 1) return;
        const x = xs[idx] - 3, n = items[g[k + 1]], p = items[g[k - 1]];
        if (n && n.dur === 1) s += ln(x, xs[g[k + 1]] - 3, 29.5);
        else if (!(p && p.dur === 1)) s += ln(x, x + (n ? 4.5 : -4.5), 29.5);
      });
    });
    slot.innerHTML = s + '</svg>';
  };

  /* ---------- Paginación A4 (vertical / horizontal) ---------- */
  let busy = false;
  const limitOf = paper => $('.chart-footer', paper).getBoundingClientRect().top - 12;
  function flatten() {
    const pages = $$('.chart-paper', wrap); if (pages.length < 2) return;
    const c0 = $('.chart-content', pages[0]);
    pages.slice(1).forEach(pg => {
      [...$('.chart-content', pg).children].forEach(k => {
        const prev = c0.lastElementChild, pg2 = prev && $('.measures-grid', prev);
        if (k.classList.contains('cont') && pg2) [...$('.measures-grid', k).children].forEach(m => pg2.appendChild(m));
        else c0.appendChild(k);
      });
      pg.remove();
    });
  }
  function paginate() {
    for (let p = 0; p < $$('.chart-paper', wrap).length; p++) {
      for (let guard = 0; guard < 300; guard++) {
        const pages = $$('.chart-paper', wrap), paper = pages[p], content = $('.chart-content', paper), limit = limitOf(paper), kids = [...content.children];
        let moved = null;
        for (let ci = 0; ci < kids.length && !moved; ci++) {
          const k = kids[ci]; if (k.getBoundingClientRect().bottom <= limit) continue;
          const grid = $('.measures-grid', k); let idx = 0;
          if (grid) {
            const it = [...grid.children];
            idx = it.findIndex(m => !m.classList.contains('break-system') && m.getBoundingClientRect().bottom > limit);
            while (idx > 0 && !it[idx - 1].classList.contains('break-system') && it[idx - 1].offsetTop === it[idx].offsetTop) idx--;
            if (idx > 0) {
              const nb = document.createElement('div'), ng = document.createElement('div');
              nb.className = 'section-block cont'; ng.className = 'measures-grid';
              it.slice(idx).forEach(m => ng.appendChild(m)); nb.appendChild(ng); k.after(nb);
              moved = [nb, ...kids.slice(ci + 1)]; continue;
            }
          }
          if (ci > 0) moved = kids.slice(ci);
        }
        if (!moved) break;
        let next = pages[p + 1];
        if (!next) { next = createNewPageElement(pages.length + 1); wrap.appendChild(next); }
        const nc = $('.chart-content', next);
        moved.slice().reverse().forEach(n => nc.insertBefore(n, nc.firstChild));
      }
    }
    updateTotalPagesCounter();
  }
  const sig = () => $$('.measure-box', wrap).length + ':' + $$('.break-system', wrap).length;
  let lastSig = '';
  function layout(force) {
    if (busy) return; busy = true;
    try { const s = sig(); if (force || s !== lastSig) flatten(); paginate(); lastSig = sig(); } finally { busy = false; }
  }
  function setOrientation(land) {
    document.body.classList.toggle('landscape', land);
    RENDER_OPTIONS.width = land ? 1123 : 794; RENDER_OPTIONS.height = land ? 794 : 1123;
    try { localStorage.setItem('ccs_orient', land ? 'l' : 'p'); } catch (e) {}
    layout(true);
  }

  /* ---------- Exportación (orientación + sin ayudas visuales) ---------- */
  const _prep = W.prepareForRender, _rest = W.restoreAfterRender;
  W.prepareForRender = () => { document.body.classList.add('exporting'); _prep(); };
  W.restoreAfterRender = () => { document.body.classList.remove('exporting'); _rest(); };
  const slug = () => ($('#songTitleInput').value || 'chart').toLowerCase().replace(/\s+/g, '-');
  W.exportAllPagesToPNG = () => {
    prepareForRender();
    document.fonts.ready.then(async () => {
      const ps = $$('.chart-paper', wrap);
      for (let i = 0; i < ps.length; i++) {
        const c = await html2canvas(ps[i], RENDER_OPTIONS), a = document.createElement('a');
        a.download = `${slug()}-page-${i + 1}.png`; a.href = c.toDataURL('image/png'); a.click();
      }
      restoreAfterRender();
    });
  };
  W.exportAllPagesToPDF = () => {
    prepareForRender();
    document.fonts.ready.then(async () => {
      const L = document.body.classList.contains('landscape'), pdf = new window.jspdf.jsPDF(L ? 'l' : 'p', 'mm', 'a4'), ps = $$('.chart-paper', wrap);
      for (let i = 0; i < ps.length; i++) {
        const c = await html2canvas(ps[i], RENDER_OPTIONS);
        if (i) pdf.addPage();
        pdf.addImage(c.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, L ? 297 : 210, L ? 210 : 297);
      }
      pdf.save(slug() + '.pdf'); restoreAfterRender();
    });
  };

  /* ---------- Autoguardado ---------- */
  const KEY = 'ccs_autosave_v1';
  const save = () => { try { sync(); localStorage.setItem(KEY, wrap.innerHTML); } catch (e) {} };
  const _rb = W.rebindAllEvents;
  W.rebindAllEvents = () => { _rb(); ensureRows(); refreshChords(); $$(FX).forEach(deco); };

  /* ---------- Acordes por pulso + compases de ancho variable ---------- */
  function ensureRows() {
    $$('.measure-box:not(.break-system)', wrap).forEach(m => {
      const main = $('.measure-main', m); if (!main) return;
      if (!$('.chord-row', main)) {
        const first = $('.chord-input', main); if (!first) return;
        const disp = first.nextElementSibling && first.nextElementSibling.classList.contains('chord-display') ? first.nextElementSibling : null;
        const row = document.createElement('div'), cell = () => { const c = document.createElement('div'); c.className = 'chord-cell'; return c; };
        row.className = 'chord-row'; main.insertBefore(row, first);
        const c0 = cell(); c0.appendChild(first); if (disp) c0.appendChild(disp); row.appendChild(c0);
        for (let b = 1; b < 4; b++) {
          const c = cell(), i = document.createElement('input');
          i.type = 'text'; i.className = 'chord-input chord-beat'; i.placeholder = '+'; i.setAttribute('onblur', 'formatChordInput(this)');
          c.appendChild(i); row.appendChild(c);
        }
      }
      $$('.chord-cell', m).forEach(c => {
        if ($(':scope>.chord-nudge', c)) return;
        const h = document.createElement('span'); h.className = 'chord-nudge'; h.textContent = '⠿'; h.title = 'Mover acorde · doble clic: volver'; c.appendChild(h);
      });
      if (!$('.measure-grip', m)) { const g = document.createElement('span'); g.className = 'measure-grip'; g.title = 'Arrastrar: ancho del compás · doble clic: igualar'; m.appendChild(g); }
    });
  }
  const rowOf = m => [...m.parentNode.children].filter(x => !x.classList.contains('break-system') && x.offsetTop === m.offsetTop);
  document.addEventListener('pointerdown', e => {
    const g = e.target.closest && e.target.closest('.measure-grip'); if (!g) return;
    e.preventDefault(); e.stopPropagation();
    const m = g.parentNode, n = m.nextElementSibling;
    if (!n || n.classList.contains('break-system') || n.offsetTop !== m.offsetTop) return;
    const gw = m.parentNode.clientWidth, w0 = m.offsetWidth / gw * 100, T = w0 + n.offsetWidth / gw * 100, sx = e.clientX;
    let saved = false;
    const mv = ev => {
      const dx = ev.clientX - sx;
      if (!saved && Math.abs(dx) > 3) { saveStateForUndo(); saved = true; }
      if (!saved) return;
      const w = Math.round(Math.min(T - 12, Math.max(12, w0 + dx / gw * 100)) * 100) / 100;
      m.style.flex = '0 0 ' + w + '%'; n.style.flex = '0 0 ' + Math.floor((T - w) * 100) / 100 + '%';
    };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); if (saved) tick(); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  }, true);
  document.addEventListener('dblclick', e => {
    const g = e.target.closest && e.target.closest('.measure-grip'); if (!g) return;
    saveStateForUndo();
    const r = rowOf(g.parentNode), w = Math.floor(10000 / r.length) / 100;
    r.forEach(x => x.style.flex = '0 0 ' + w + '%'); tick();
  }, true);

  /* ---------- Pentagrama de slashes: barras por sistema y numeración ---------- */
  const _av = W.applyVolta;
  W.applyVolta = n => { _av(n); if (selectedMeasures[0]) $$('.volta-bracket', selectedMeasures[0]).forEach(v => v.style.top = '-58px'); };
  function markRows() {
    let idx = 0;
    $$('.measures-grid', wrap).forEach(g => {
      let prev = null;
      [...g.children].forEach(m => {
        if (!m.classList.contains('measure-box') || m.classList.contains('break-system')) return;
        idx++;
        const rf = !prev || m.offsetTop !== prev.offsetTop; prev = m;
        m.classList.toggle('rf', rf);
        let n = $(':scope>.measure-num', m);
        if (!rf) { if (n) n.remove(); }
        else if (!n) { n = document.createElement('span'); n.className = 'measure-num'; n.textContent = idx; m.appendChild(n); }
        else if (n.textContent !== String(idx)) n.textContent = idx;
      });
    });
  }

  /* ---------- Ligaduras reales (entre figuras, pulsos y compases) y silencios ---------- */
  W.toggleSubdivisionTie = () => {
    if (!activeBeatSlot) return;
    const items = getBeatData(activeBeatSlot).map(norm), i = Math.min(activeSubIndex, items.length - 1);
    if (items[i].rest) return;
    saveStateForUndo(); items[i].tie = !items[i].tie;
    setBeatData(activeBeatSlot, items); focusSlot(activeBeatSlot, i);
  };
  W.toggleRest = () => {
    if (!activeBeatSlot) return;
    saveStateForUndo();
    const items = getBeatData(activeBeatSlot).map(norm), i = Math.min(activeSubIndex, items.length - 1), it = items[i];
    it.rest = !it.rest; it.tie = false;
    if (/^r?[hw]$/.test(it.type)) it.type = (it.rest ? 'r' : '') + it.type.replace(/^r/, ''); else retype(it);
    setBeatData(activeBeatSlot, items); focusSlot(activeBeatSlot, i);
  };
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 'r') return;
    const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.isContentEditable)) return;
    toggleRest();
  });
  function tieEvents() {
    const ev = [];
    $$('.measure-box:not(.break-system)', wrap).forEach(m => $$('.beat-slot', m).forEach(slot => {
      const items = getBeatData(slot).map(norm); let t = 0;
      items.forEach(it => { ev.push({ slot, it, m, x: items.length === 1 ? 20 : 7 + t * 8.5 }); t += it.dur; });
    }));
    return ev;
  }
  const tiePt = (e, dx) => {
    const sv = $('svg', e.slot); if (!sv) return null;
    const b = sv.getBoundingClientRect();
    return { x: b.left + (e.x + dx) / 40 * b.width, y: b.top + b.height * 0.22, paper: e.slot.closest('.chart-paper') };
  };
  function tieArc(paper, x1, y1, x2, y2) {
    const pr = paper.getBoundingClientRect(), r = v => Math.round(v * 2) / 2;
    const a = r(x1 - pr.left), b = r(y1 - pr.top), c = r(x2 - pr.left), d = r(y2 - pr.top), h = Math.min(16, Math.abs(c - a) * 0.3 + 5) * 1.3;
    return `<path d="M ${a} ${b} C ${r(a + (c - a) * .2)} ${r(b - h)} ${r(c - (c - a) * .2)} ${r(d - h)} ${c} ${d}" fill="none" stroke="#0f172a" stroke-width="1.7" stroke-linecap="round"/>`;
  }
  function drawTies() {
    const ev = tieEvents(), out = new Map(), add = (p, s) => out.set(p, (out.get(p) || '') + s);
    ev.forEach((e, i) => {
      let n = ev[i + 1]; if (n && n.it.cont) n = ev[i + 2];
      if (!e.it.tie || e.it.rest || e.it.cont || !n || n.it.rest) return;
      const A = tiePt(e, 3), B = tiePt(n, -3); if (!A || !B) return;
      if (A.paper === B.paper && Math.abs(A.y - B.y) < 20 && B.x > A.x) add(A.paper, tieArc(A.paper, A.x, A.y, B.x, B.y));
      else {
        add(A.paper, tieArc(A.paper, A.x, A.y, e.m.getBoundingClientRect().right, A.y));
        add(B.paper, tieArc(B.paper, n.m.getBoundingClientRect().left, B.y, B.x, B.y));
      }
    });
    $$('.chart-paper', wrap).forEach(p => {
      const html = out.get(p) || '';
      let L = $(':scope>.tie-layer', p);
      if (!L) { if (!html) return; p.insertAdjacentHTML('beforeend', '<svg class="tie-layer" xmlns="http://www.w3.org/2000/svg"></svg>'); L = $(':scope>.tie-layer', p); }
      if (L.dataset.s !== html) { L.innerHTML = html; L.dataset.s = html; }
    });
  }

  /* ---------- Separación de acordes (automática + manual) ---------- */
  function spaceChords() {
    $$('.measures-grid', wrap).forEach(g => {
      let prevRight = -1e9, prevTop = null;
      [...g.children].forEach(m => {
        if (!m.classList.contains('measure-box') || m.classList.contains('break-system')) return;
        if (prevTop !== null && m.offsetTop !== prevTop) prevRight = -1e9;
        prevTop = m.offsetTop;
        $$('.chord-cell', m).forEach(c => {
          const d = $(':scope>.chord-display', c), inp = $(':scope>.chord-input', c), has = !!(inp && inp.value.trim() && d);
          c.classList.toggle('has', has);
          if (!has) { c.style.setProperty('--push', '0px'); return; }
          const dx = parseFloat(c.style.getPropertyValue('--dx')) || 0, cur = (parseFloat(c.style.getPropertyValue('--push')) || 0) + dx;
          const left = c.getBoundingClientRect().left - cur + dx;
          const push = dx ? 0 : Math.round(Math.max(0, prevRight + 6 - left) * 2) / 2;
          c.style.setProperty('--push', push + 'px');
          prevRight = left + push + d.offsetWidth;
        });
      });
    });
  }
  document.addEventListener('pointerdown', e => {
    const h = e.target.closest && e.target.closest('.chord-nudge'); if (!h) return;
    e.preventDefault(); e.stopPropagation();
    const c = h.parentNode, sx = e.clientX, sy = e.clientY, x0 = parseFloat(c.style.getPropertyValue('--dx')) || 0, y0 = parseFloat(c.style.getPropertyValue('--dy')) || 0;
    let saved = false;
    const mv = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!saved && Math.hypot(dx, dy) > 3) { saveStateForUndo(); saved = true; }
      if (!saved) return;
      c.style.setProperty('--dx', (x0 + dx) + 'px'); c.style.setProperty('--dy', (y0 + dy) + 'px'); spaceChords();
    };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); if (saved) tick(); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  }, true);
  document.addEventListener('dblclick', e => {
    const h = e.target.closest && e.target.closest('.chord-nudge'); if (!h) return;
    saveStateForUndo(); h.parentNode.style.removeProperty('--dx'); h.parentNode.style.removeProperty('--dy'); spaceChords(); tick();
  }, true);

  /* ---------- Negra con puntillo (ocupa el pulso y la mitad del siguiente) ---------- */
  function releaseDotq(slot) {
    const items = getBeatData(slot);
    if (items[0] && items[0].dotq) {
      items[0].dotq = false; items[0].dot = false; setBeatData(slot, items);
      const nx = slot.nextElementSibling;
      if (nx) { const n = getBeatData(nx); if (n[0] && n[0].cont) { n[0].cont = false; setBeatData(nx, n); } }
    } else if (items[0] && items[0].cont) {
      items[0].cont = false; setBeatData(slot, items);
      const pv = slot.previousElementSibling;
      if (pv) { const p = getBeatData(pv); if (p[0] && p[0].dotq) { p[0].dotq = false; p[0].dot = false; setBeatData(pv, p); } }
    }
  }
  const _dot = W.toggleSubdivisionDot, _asr = W.applySubdivisionRhythm, _tgr = W.toggleRest;
  W.toggleSubdivisionDot = () => {
    if (!activeBeatSlot) return;
    const slot = activeBeatSlot, items = getBeatData(slot).map(norm), i = Math.min(activeSubIndex, items.length - 1), it = items[i];
    if (it.dotq || it.cont) { saveStateForUndo(); releaseDotq(slot); focusSlot(slot, 0); return; }
    if (it.dur === 4 && items.length === 1 && !/^r?[hw]$/.test(it.type)) {
      const nx = slot.nextElementSibling; if (!nx || nx.style.flex === '2') return;
      const n = getBeatData(nx).map(norm); if (n[0].dur < 2 || /^r?[hw]$/.test(n[0].type)) return;
      saveStateForUndo();
      resize(n, 0, 2); n[0].cont = true; n[0].rest = false; n[0].tie = false; n.forEach(retype); setBeatData(nx, n);
      it.dotq = true; it.dot = true; setBeatData(slot, items); focusSlot(slot, 0); return;
    }
    _dot();
  };
  W.applySubdivisionRhythm = t => {
    if (activeBeatSlot && getBeatData(activeBeatSlot).some(x => x.dotq || x.cont)) { saveStateForUndo(); releaseDotq(activeBeatSlot); }
    _asr(t);
  };
  W.toggleRest = () => {
    if (activeBeatSlot && getBeatData(activeBeatSlot).some(x => x.cont)) { saveStateForUndo(); releaseDotq(activeBeatSlot); }
    _tgr();
  };

  /* ---------- Guardar y abrir charts como archivo (.chart.json) ---------- */
  function saveFile() {
    sync();
    const c = wrap.cloneNode(true);
    $$('.selected,.active-beat', c).forEach(n => n.classList.remove('selected', 'active-beat'));
    const data = { app: 'chord-chart-studio', v: 1, saved: new Date().toISOString(), orient: document.body.classList.contains('landscape') ? 'l' : 'p', title: ($('#songTitleInput') || {}).value || '', html: c.innerHTML };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    a.download = (slug() || 'chart') + '.chart.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  // Un archivo ajeno no debe poder ejecutar código: se quitan scripts, manejadores on* y URLs peligrosas.
  function sanitize(html) {
    const doc = new DOMParser().parseFromString('<div id="r">' + html + '</div>', 'text/html'), root = doc.getElementById('r');
    root.querySelectorAll('script,iframe,object,embed,link,meta,style,base,form,foreignObject,animate,set,animateTransform,animateMotion').forEach(n => n.remove());
    root.querySelectorAll('*').forEach(el => [...el.attributes].forEach(a => {
      const n = a.name.toLowerCase();
      if (n.startsWith('on') || (/^(href|src|xlink:href|action|formaction)$/.test(n) && /^\s*(javascript|data|vbscript):/i.test(a.value))) el.removeAttribute(a.name);
    }));
    return root.innerHTML;
  }
  function openFile(f) {
    const r = new FileReader();
    r.onload = () => {
      let d;
      try { d = JSON.parse(r.result); if (d.app !== 'chord-chart-studio' || typeof d.html !== 'string' || d.html.length > 5e6) throw 0; }
      catch (e) { alert('No se pudo abrir: el archivo no es un chart válido de esta app.'); return; }
      if (!confirm('Esto reemplaza el chart actual (podés deshacer con Ctrl+Z). ¿Abrir "' + f.name + '"?')) return;
      try {
        saveStateForUndo();
        wrap.innerHTML = sanitize(d.html);
        $$('.beat-slot', wrap).forEach(sl => renderBeatSlot(sl));
        rebindAllEvents();
        const ti = $('#songTitleInput'); if (ti) ti.oninput = function () { updateFooterTitle(this.value); };
        $$('.volta-input', wrap).forEach(i => i.onclick = ev => ev.stopPropagation());
        clearSelections();
        const land = d.orient === 'l'; if ($('#orientSel')) $('#orientSel').value = land ? 'l' : 'p';
        setOrientation(land); updateFooterTitle(ti ? ti.value : ''); tick();
      } catch (e) { alert('Hubo un problema al cargar el chart: ' + e.message); }
    };
    r.readAsText(f);
  }
  function addFileButtons(box) {
    const mk = (t, fn) => { const b = document.createElement('button'); b.className = 'tool-btn'; b.style.cssText = 'margin-top:6px;width:100%'; b.textContent = t; b.onclick = fn; return b; };
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json'; inp.style.display = 'none';
    inp.onchange = () => { if (inp.files[0]) openFile(inp.files[0]); inp.value = ''; };
    box.before(mk('Guardar chart (archivo) · Ctrl+S', saveFile), mk('Abrir chart (archivo)', () => inp.click()), inp);
  }
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveFile(); } });

  /* ---------- Arranque ---------- */
  let timer = 0;
  const tick = () => { clearTimeout(timer); timer = setTimeout(() => { ensureRows(); layout(false); markRows(); drawTies(); refreshChords(); $$(FX).forEach(deco); save(); }, 150); };
  function init() {
    try { const h = localStorage.getItem(KEY); if (h) { wrap.innerHTML = h; clearSelections(); rebindAllEvents(); } } catch (e) {}
    const body = $('#modMainActions + .collapsible-body');
    if (body) {
      $('#modMainActions').classList.remove('collapsed'); body.classList.remove('hidden');
      const box = document.createElement('div');
      box.innerHTML = '<select class="select-input" id="orientSel"><option value="p">Hoja A4 vertical</option><option value="l">Hoja A4 horizontal</option></select><button class="tool-btn" id="btnNewChart" style="margin-top:6px;width:100%">Nuevo chart (borrar guardado)</button>';
      body.appendChild(box);
      addFileButtons(box);
      $('#orientSel').onchange = e => setOrientation(e.target.value === 'l');
      $('#btnNewChart').onclick = () => { if (confirm('¿Borrar el chart guardado y empezar de cero?')) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } };
      $('#btnAddPage').style.display = 'none';
    }
    const rb = $('.rhythm-buttons');
    if (rb) { const b = document.createElement('button'); b.className = 'rhythm-btn'; b.title = 'Slash simple'; b.textContent = '/'; b.onclick = () => applySubdivisionRhythm('slash'); rb.appendChild(b); }
    $$('.rest-btn .key-badge').forEach(b => b.style.display = 'none');
    const hint = 'Teclas 7,6,5,4,3 | R: silencio | L: ligadura | .: puntillo | Shift+Clic: rango | Ctrl+Z';
    i18n.es.lblRhythmShortcuts = hint; i18n.en.lblRhythmShortcuts = hint.replace('Teclas', 'Keys').replace('silencio', 'rest').replace('ligadura', 'tie').replace('puntillo', 'dot').replace('rango', 'range');
    applyLanguage(currentLang);
    let land = false; try { land = localStorage.getItem('ccs_orient') === 'l'; } catch (e) {}
    if (land && $('#orientSel')) $('#orientSel').value = 'l';
    document.fonts.ready.then(() => { ensureRows(); setOrientation(land); markRows(); drawTies(); refreshChords(); $$(FX).forEach(deco); });
    new MutationObserver(tick).observe(wrap, { childList: true, subtree: true });
    wrap.addEventListener('input', tick);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init); else init();
})();
