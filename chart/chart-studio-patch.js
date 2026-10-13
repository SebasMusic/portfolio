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
  .chord-input,.chord-display{font-family:var(--chord-font,'Montserrat'),'Inter',sans-serif;font-weight:var(--chord-weight,800);font-size:var(--chord-size,1.3em);letter-spacing:.2px}
  .chord-input:not(:focus){color:transparent}
  .chord-display{position:absolute;left:0;top:14px;white-space:nowrap;pointer-events:none;color:#0f172a;line-height:1.25}
  .chord-input:focus+.chord-display{display:none}
  .chord-display sup{font-size:.58em;position:relative;top:-.5em;vertical-align:baseline;font-weight:inherit}
  .fx-ui{font:700 11px Inter,sans-serif;color:#64748b;padding:0 3px;user-select:none;cursor:pointer}
  .fx-move{cursor:grab;touch-action:none}
  .fx-del{opacity:0}
  *:hover>.fx-del{opacity:1}
  .fx-resize{position:absolute;right:-3px;top:0;bottom:0;width:7px;cursor:ew-resize;background:rgba(100,116,139,.45);border-radius:3px;padding:0;touch-action:none}
  .band-annotation{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
  .exporting .fx-ui,.exporting .drag-handle,.exporting .volta-drag,.exporting .tie-drag,.exporting .dyn-drag{display:none!important}
  .exporting .custom-tie-overlay,.exporting .measure-dynamics-container,.exporting .band-annotation,.exporting .song2-subtitle-wrapper{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
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
  .chart-paper .measure-box{height:46px;margin-top:50px;padding:0 6px;background:var(--staff),var(--hl,transparent);border-left:0}
  .chart-paper .measure-box.rf{border-left:1.5px solid #0f172a}
  body .measure-box.selected{background:var(--staff),linear-gradient(rgba(76,194,255,.2),rgba(76,194,255,.2)),var(--hl,transparent)!important}
  .measure-main{padding:0!important}
  .rhythm-beats-container{height:100%!important}
  .section-block{margin-top:44px!important}
  .measure-box.repeat-start::before,.measure-box.repeat-end::before{top:14px;box-shadow:0 14px 0 0 #0f172a}
  .chord-nudge{position:absolute;top:-9px;left:0;font:700 9px Inter,sans-serif;color:#64748b;cursor:grab;opacity:0;user-select:none;touch-action:none;z-index:6}
  .chord-cell.has:hover>.chord-nudge,.chord-nudge:hover{opacity:1}
  .exporting .chord-nudge{display:none}
  .exporting input::placeholder{color:transparent!important}
  .section-badge-container{background:#fff;border:1.5px solid #0f172a;border-radius:0;padding:0 4px;gap:2px}
  .section-badge{background:transparent;color:#0f172a;font-weight:800;font-size:.8em;letter-spacing:.6px;padding:1px 4px}
  .drag-handle{color:#94a3b8}
  .band-annotation{background:transparent;border:1px dashed #cbd5e1;font-style:italic;font-weight:700;font-size:.78em;color:#0f172a}
  .chart-header{border-bottom:1px solid #cbd5e1;gap:6px}
  .song-title-editable,.song-title-print{font-family:var(--title-font,'Montserrat'),'Montserrat',sans-serif;font-size:2.1em;letter-spacing:2px;font-weight:var(--title-weight,800)}
  .subtitle-input{width:100%;text-align:center;border:0;outline:0;background:transparent;font:600 .85em 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.6px;color:#334155}
  .subtitle-input::placeholder{color:#cbd5e1}
  .chord-input::placeholder{color:transparent}
  .measure-box:hover .chord-input::placeholder{color:#cbd5e1}
  .sel{display:none}
  .beat-slot svg{overflow:visible}
  .measure-box{-webkit-user-select:none;user-select:none}
  .measure-box input{-webkit-user-select:text;user-select:text}
  .chart-paper .measure-box.hh{padding-left:calc(6px + var(--sysw,0px))}
  .sys-head{position:absolute;left:3px;top:-1.5px;pointer-events:none}
  .sys-head svg{display:block;overflow:visible}
  .hl-sw{width:26px;height:26px;border-radius:50%;border:1px solid rgba(255,255,255,.35);cursor:pointer;background:var(--c);transition:box-shadow .2s,transform .2s;padding:0}
  .hl-sw:hover{box-shadow:0 0 12px 2px var(--c);transform:scale(1.12)}
  .studio-layout{grid-template-columns:268px 1fr!important}
  .toolbox-panel{padding:10px 8px!important;gap:2px!important;border-radius:14px}
  .toolbox-section{padding:0 8px}
  .toolbox-section:hover{border-color:rgba(76,194,255,.14);box-shadow:0 0 12px rgba(76,194,255,.07);background:rgba(76,194,255,.02)}
  .toolbox-section:has(>.collapsible-header:not(.collapsed)){border-color:rgba(76,194,255,.22);box-shadow:0 0 16px rgba(76,194,255,.10),inset 0 0 12px rgba(76,194,255,.03);padding-bottom:10px;margin:2px 0}
  .collapsible-header{font-size:.66em;font-weight:600;letter-spacing:.16em;color:#8ea3b6;border-bottom:1px solid rgba(255,255,255,.045);padding:11px 2px 9px}
  .collapsible-header::after,.collapsible-header.collapsed::after{content:'›';font-size:1.5em;font-weight:300;line-height:.6;opacity:.55;transform:rotate(90deg);transition:transform .2s}
  .collapsible-header.collapsed::after{transform:rotate(0)}
  .collapsible-header:not(.collapsed){color:#9fdcff;text-shadow:0 0 8px rgba(76,194,255,.3);border-bottom-color:rgba(76,194,255,.12)}
  .collapsible-body{gap:6px;padding-top:8px}
  .tool-btn{font-size:.72em;font-weight:500;padding:6px 9px;border-radius:8px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);color:#cdd6df}
  .tool-btn:hover{background:rgba(76,194,255,.07);border-color:rgba(76,194,255,.45);box-shadow:0 0 10px rgba(76,194,255,.2);color:#fff}
  .tool-btn.primary{background:rgba(76,194,255,.14);border-color:rgba(76,194,255,.45);color:#e4f5ff;box-shadow:0 0 10px rgba(76,194,255,.18)}
  .tool-btn.primary:hover{background:rgba(76,194,255,.22);box-shadow:0 0 16px rgba(76,194,255,.4)}
  .tool-btn.custom-btn{border-style:solid}
  .rhythm-btn{padding:4px 8px;border-radius:8px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)}
  .select-input{font-size:.74em;padding:6px 9px;border-radius:8px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.09);color:#d5dde5}
  input[type=range]{accent-color:#4cc2ff}
  .download-option{font-size:.72em;font-weight:500}
  @keyframes dp{0%,100%{box-shadow:0 0 6px rgba(255,90,90,.3)}50%{box-shadow:0 0 18px rgba(255,90,90,.65)}}
  .dict-on{border-color:#ff6b6b!important;color:#ffe0e0!important;background:rgba(255,90,90,.14)!important;animation:dp 1.6s ease-in-out infinite}
  @media print{
    *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html,body{background:#fff!important;padding:0!important;margin:0!important;min-height:0!important}
    body>*:not(.studio-layout){display:none!important}
    .studio-layout{display:block!important;max-width:none!important}
    .toolbox-panel,.rhythm-toolbar{display:none!important}
    .right-main-column{gap:0!important}
    .sheets-container{background:#fff!important;padding:0!important;border:0!important;gap:0!important;display:block!important}
    .chart-paper{width:210mm!important;height:296.6mm!important;max-height:296.6mm!important;box-shadow:none!important;border:0!important;border-radius:0!important;margin:0!important;break-after:page;page-break-after:always;overflow:hidden}
    body.landscape .chart-paper{width:297mm!important;height:209.6mm!important;max-height:209.6mm!important}
    .chart-paper:last-child{break-after:auto;page-break-after:auto}
  }
  .beat-slot.active-beat[data-sub="0"] .sel0,.beat-slot.active-beat[data-sub="1"] .sel1,.beat-slot.active-beat[data-sub="2"] .sel2,.beat-slot.active-beat[data-sub="3"] .sel3{display:inline}
  .exporting .sel{display:none!important}
  .volta-bracket{background:transparent;box-shadow:none;border-right:none;height:16px}
  .volta-bracket::before,.volta-bracket::after{display:none}
  :root{--accent:#4cc2ff}
  body{background:radial-gradient(1200px 600px at 20% -10%,#12202e 0%,#0b0f14 55%,#07090c 100%) fixed}
  .toolbox-panel{background:linear-gradient(180deg,#14181d,#101317);border:1px solid #1f2a35;max-height:calc(100vh - 48px);overflow-y:auto;scrollbar-width:thin;scrollbar-color:#2a3b4b transparent}
  .toolbox-section{border:1px solid transparent;border-radius:10px;padding:8px 10px;transition:border-color .25s,box-shadow .25s,background .25s}
  .toolbox-section:hover{border-color:rgba(76,194,255,.4);box-shadow:0 0 16px rgba(76,194,255,.22),inset 0 0 14px rgba(76,194,255,.05);background:rgba(76,194,255,.025)}
  .toolbox-section:has(>.collapsible-header:not(.collapsed)){border-color:rgba(76,194,255,.55);box-shadow:0 0 20px rgba(76,194,255,.28),inset 0 0 16px rgba(76,194,255,.07)}
  .collapsible-header{color:#8fb7d6;border-bottom-color:#22303c;transition:color .25s,text-shadow .25s}
  .collapsible-header:not(.collapsed){color:var(--accent);text-shadow:0 0 10px rgba(76,194,255,.6)}
  .tool-btn,.rhythm-btn,.select-input{transition:border-color .2s,box-shadow .2s,background .2s,color .2s}
  .tool-btn:hover,.rhythm-btn:hover{border-color:var(--accent);box-shadow:0 0 10px rgba(76,194,255,.4);color:#fff}
  .tool-btn.primary{background:linear-gradient(180deg,#1f5f8f,#164a72);border-color:var(--accent);color:#e8f6ff;box-shadow:0 0 12px rgba(76,194,255,.35)}
  .tool-btn.primary:hover{background:linear-gradient(180deg,#2670a6,#1b5a8a);box-shadow:0 0 22px rgba(76,194,255,.65)}
  .select-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px rgba(76,194,255,.25)}
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
      inp.placeholder = '+';
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
  const focusSlot = (s, i) => { $$('.beat-slot.active-beat').forEach(b => b.classList.remove('active-beat')); s.classList.add('active-beat'); activeBeatSlot = s; activeSubIndex = i || 0; s.dataset.sub = activeSubIndex; renderBeatSlot(s); };

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
    const ups = items.map(it => !!it.up);
    groups.filter(g => g.length > 1).forEach(g => g.forEach(i => { ups[i] = !!items[g[0]].up; }));
    let s = '<svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">';
    items.forEach((it, i) => {
      const x = xs[i], ty = it.type.replace(/^r/, ''), up = ups[i];
      s += `<g class="sub-item-target" onclick="handleSubItemClick(this.closest('.beat-slot'),${i},event)"><rect x="${x - 6}" y="0" width="12" height="40" fill="transparent"/>`;
      s += `<rect class="sel sel${i}" x="${x - 6}" y="2" width="12" height="36" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="2,2" rx="2"/>`;
      if (it.cont) { s += '</g>'; return; }
      if (it.rest) {
        if (ty === 'w') s += `<line x1="10" y1="14" x2="30" y2="14" stroke="${K}" stroke-width="1"/><rect x="14" y="14" width="12" height="5" fill="${K}"/>`;
        else if (ty === 'h') s += `<line x1="10" y1="24" x2="30" y2="24" stroke="${K}" stroke-width="1"/><rect x="14" y="19" width="12" height="5" fill="${K}"/>`;
        else if (ty === 'q') s += `<path d="M ${x - 2} 8 L ${x + 3} 14 L ${x - 3} 20 L ${x + 2} 26 C ${x - 4} 28 ${x - 4} 31 ${x + 1} 31" fill="none" stroke="${K}" stroke-width="2" stroke-linecap="round"/>`;
        else if (ty === '8') s += `<circle cx="${x - 2}" cy="14" r="1.7" fill="${K}"/><path d="M ${x - 2} 14 Q ${x + 2} 12 ${x + 1} 18 L ${x - 3} 28" fill="none" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/>`;
        else s += `<circle cx="${x - 2}" cy="12" r="1.5" fill="${K}"/><circle cx="${x - 3}" cy="18" r="1.5" fill="${K}"/><path d="M ${x - 2} 12 Q ${x + 2} 10 ${x + 1} 16 L ${x - 3} 28" fill="none" stroke="${K}" stroke-width="1.4" stroke-linecap="round"/>`;
      } else {
        if (ty === 'w') s += `<path fill-rule="evenodd" fill="${K}" d="${wholeD(20, 20)}"/>`;
        else {
          const hollow = ty === 'h', p = up ? `${x - 4.5},29 ${x - 1.5},29 ${x + 4.5},17 ${x + 1.5},17` : `${x - 4.5},24 ${x - 1.5},24 ${x + 4.5},11 ${x + 1.5},11`;
          s += hollow ? `<polygon points="${p}" fill="#fffef9" stroke="${K}" stroke-width="1.3"/>` : `<polygon points="${p}" fill="${K}"/>`;
          if (ty !== 'slash') s += up ? `<line x1="${x + 3.2}" y1="17" x2="${x + 3.2}" y2="-2" stroke="${K}" stroke-width="1.6"/>` : `<line x1="${x - 3}" y1="24" x2="${x - 3}" y2="42" stroke="${K}" stroke-width="1.6"/>`;
          if ((ty === '8' || ty === '16') && !beamed.has(i)) for (let f = 0; f < (ty === '16' ? 2 : 1); f++) s += up ? `<path d="M ${x + 3.2} ${-2 + f * 4.5} Q ${x + 9} ${1 + f * 4.5} ${x + 7.5} ${8 + f * 4.5}" fill="none" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/>` : `<path d="M ${x - 3} ${42 - f * 4.5} Q ${x + 4} ${39 - f * 4.5} ${x + 3.5} ${32 - f * 4.5}" fill="none" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/>`;
        }
        const a = it.articulation, ay = a === 'fermata' ? 6 : (up ? 36 : 5);
        if (a === 'staccato') s += `<circle cx="${x}" cy="${ay}" r="1.3" fill="${K}"/>`;
        else if (a === 'staccatissimo') s += `<polygon points="${x - 1.4},${ay - 2} ${x + 1.4},${ay - 2} ${x},${ay + 3}" fill="${K}"/>`;
        else if (a === 'accent') s += `<path d="M ${x - 3.5} ${ay - 2} L ${x + 3.5} ${ay + 0.5} L ${x - 3.5} ${ay + 3}" fill="none" stroke="${K}" stroke-width="1.3"/>`;
        else if (a === 'tenuto') s += `<line x1="${x - 3.5}" y1="${ay}" x2="${x + 3.5}" y2="${ay}" stroke="${K}" stroke-width="1.5"/>`;
        else if (a === 'marcato') s += `<path d="M ${x - 3} ${ay + 3} L ${x} ${ay - 2} L ${x + 3} ${ay + 3}" fill="none" stroke="${K}" stroke-width="1.3"/>`;
        else if (a === 'fermata') s += `<path d="M ${x - 4.5} ${ay + 3} Q ${x} ${ay - 5} ${x + 4.5} ${ay + 3}" fill="none" stroke="${K}" stroke-width="1.3"/><circle cx="${x}" cy="${ay + 1}" r="1" fill="${K}"/>`;
      }
      if (it.dot) s += `<circle cx="${x + (it.rest ? 6.5 : up ? 7.5 : 7)}" cy="${it.rest ? 19 : up ? 25 : 16.5}" r="1.5" fill="${K}"/>`;
      s += '</g>';
    });
    groups.filter(g => g.length > 1).forEach(g => {
      const ln = (a, b, y) => `<line x1="${a}" y1="${y}" x2="${b}" y2="${y}" stroke="${K}" stroke-width="2.6"/>`;
      const U = !!items[g[0]].up, ox = U ? 3.2 : -3, y1 = U ? -2 : 42, y2 = U ? 2.5 : 37.5;
      s += ln(xs[g[0]] + ox, xs[g[g.length - 1]] + ox, y1);
      g.forEach((idx, k) => {
        if (items[idx].dur !== 1) return;
        const x = xs[idx] + ox, n = items[g[k + 1]], p = items[g[k - 1]];
        if (n && n.dur === 1) s += ln(x, xs[g[k + 1]] + ox, y2);
        else if (!(p && p.dur === 1)) s += ln(x, x + (n ? 4.5 : -4.5), y2);
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
    document.body.classList.toggle('landscape', land); setPageStyle(land);
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
  W.applyVolta = n => { _av(n); if (selectedMeasures[0]) $$('.volta-bracket', selectedMeasures[0]).forEach(v => v.style.top = '-48px'); };
  function markRows() {
    let idx = 0; const base = sigState(), cur = { clef: base.clef, key: base.key }, hc = {}, headFor = st => { const k = st.clef + '|' + st.key; if (!(k in hc)) hc[k] = sysHead(st); return hc[k]; };
    $$('.measures-grid', wrap).forEach(g => {
      let prev = null;
      [...g.children].forEach(m => {
        if (!m.classList.contains('measure-box') || m.classList.contains('break-system')) return;
        idx++;
        const rf = !prev || m.offsetTop !== prev.offsetTop; prev = m;
        m.classList.toggle('rf', rf);
        if (m.dataset.clef !== undefined && m.dataset.clef !== '~') cur.clef = m.dataset.clef;
        if (m.dataset.key !== undefined && m.dataset.key !== '~') cur.key = m.dataset.key;
        const chg = (m.dataset.clef !== undefined && m.dataset.clef !== '~') || (m.dataset.key !== undefined && m.dataset.key !== '~');
        const head = (rf || chg) ? headFor(cur) : null;
        m.classList.toggle('hh', !!head);
        let h = $(':scope>.sys-head', m);
        if (!head) { if (h) h.remove(); m.style.removeProperty('--sysw'); }
        else {
          if (!h) { h = document.createElement('div'); h.className = 'sys-head'; m.appendChild(h); }
          if (h.dataset.s !== head.sig) { h.innerHTML = head.html; h.dataset.s = head.sig; }
          m.style.setProperty('--sysw', head.w + 'px');
        }
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
    const k = Math.min(b.width, b.height) / 40;
    return { x: b.left + b.width / 2 + (e.x + dx - 20) * k, y: b.top + b.height / 2 + (e.it.up ? 9.6 : -10) * k, paper: e.slot.closest('.chart-paper') };
  };
  function tieArc(paper, x1, y1, x2, y2, dir) {
    const pr = paper.getBoundingClientRect(), r = v => Math.round(v * 2) / 2;
    const a = r(x1 - pr.left), b = r(y1 - pr.top), c = r(x2 - pr.left), d = r(y2 - pr.top), h = Math.min(16, Math.abs(c - a) * 0.3 + 5) * 1.3 * (dir || 1);
    return `<path d="M ${a} ${b} C ${r(a + (c - a) * .2)} ${r(b + h)} ${r(c - (c - a) * .2)} ${r(d + h)} ${c} ${d}" fill="none" stroke="#0f172a" stroke-width="1.7" stroke-linecap="round"/>`;
  }
  function drawTies() {
    const ev = tieEvents(), out = new Map(), add = (p, s) => out.set(p, (out.get(p) || '') + s);
    ev.forEach((e, i) => {
      let n = ev[i + 1]; if (n && n.it.cont) n = ev[i + 2];
      if (!e.it.tie || e.it.rest || e.it.cont || !n || n.it.rest) return;
      const A = tiePt(e, 3), B = tiePt(n, -3); if (!A || !B) return;
      if (A.paper === B.paper && Math.abs(A.y - B.y) < 20 && B.x > A.x) add(A.paper, tieArc(A.paper, A.x, A.y, B.x, B.y, e.it.up ? 1 : -1));
      else {
        add(A.paper, tieArc(A.paper, A.x, A.y, e.m.getBoundingClientRect().right, A.y, e.it.up ? 1 : -1));
        add(B.paper, tieArc(B.paper, n.m.getBoundingClientRect().left, B.y, B.x, B.y, n.it.up ? 1 : -1));
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
      if (n.startsWith('on') || (n === 'style' && /url\s*\(|expression|@import/i.test(a.value)) || (/^(href|src|xlink:href|action|formaction)$/.test(n) && /^\s*(javascript|data|vbscript):/i.test(a.value))) el.removeAttribute(a.name);
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

  /* ---------- Estilo: tipografías, subtítulo y escritura rápida de acordes ---------- */
  const FONT_Q = { Montserrat: 'Montserrat:wght@700;800', 'Patrick Hand': 'Patrick+Hand', Kalam: 'Kalam:wght@400;700', 'Space Grotesk': 'Space+Grotesk:wght@500;700', Bungee: 'Bungee', Bangers: 'Bangers', 'Archivo Black': 'Archivo+Black', 'Caveat Brush': 'Caveat+Brush', 'Gochi Hand': 'Gochi+Hand', 'Permanent Marker': 'Permanent+Marker', 'Architects Daughter': 'Architects+Daughter', 'Covered By Your Grace': 'Covered+By+Your+Grace', 'Noto Music': 'Noto+Music' };
  const BOLD = { Montserrat: 800, 'Space Grotesk': 700, Kalam: 700 };
  const CHORD_FONTS = ['Montserrat', 'Patrick Hand', 'Kalam', 'Space Grotesk', 'Caveat Brush', 'Gochi Hand', 'Architects Daughter', 'Covered By Your Grace', 'Permanent Marker'], TITLE_FONTS = ['Montserrat', 'Bungee', 'Bangers', 'Archivo Black', 'Permanent Marker', 'Caveat Brush', 'Gochi Hand', 'Covered By Your Grace'];
  const DEF_STYLE = { chord: 'Montserrat', title: 'Montserrat', size: 1.3 };
  function readStyle() { try { return Object.assign({}, DEF_STYLE, JSON.parse(localStorage.getItem('ccs_style') || '{}')); } catch (e) { return Object.assign({}, DEF_STYLE); } }
  function loadFont(n) {
    const id = 'gf-' + n.replace(/\W/g, ''); if (!FONT_Q[n] || document.getElementById(id)) return;
    const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + FONT_Q[n] + '&display=swap'; document.head.appendChild(l);
  }
  function applyStyle(st) {
    if (!CHORD_FONTS.includes(st.chord)) st.chord = DEF_STYLE.chord;
    if (!TITLE_FONTS.includes(st.title)) st.title = DEF_STYLE.title;
    st.size = Math.min(1.6, Math.max(1.0, +st.size || DEF_STYLE.size));
    const r = document.documentElement.style;
    loadFont(st.chord); loadFont(st.title);
    r.setProperty('--chord-font', "'" + st.chord + "'"); r.setProperty('--title-font', "'" + st.title + "'"); r.setProperty('--chord-size', st.size + 'em'); r.setProperty('--chord-weight', BOLD[st.chord] || 400); r.setProperty('--title-weight', BOLD[st.title] || 400);
    try { localStorage.setItem('ccs_style', JSON.stringify(st)); } catch (e) {}
    try { Promise.all([document.fonts.load((BOLD[st.chord] || 400) + ' 1em "' + st.chord + '"'), document.fonts.load((BOLD[st.title] || 400) + ' 1em "' + st.title + '"')]).then(() => { refreshChords(); drawTies(); }); } catch (e) {}
  }
  function addStylePanel() {
    const panel = $('.toolbox-panel'); if (!panel || $('#fontChord')) return;
    const st = readStyle(), opt = (list, cur) => list.map(f => `<option value="${f}"${f === cur ? ' selected' : ''}>${f}</option>`).join('');
    const lb = t => `<div style="font-size:0.75em;color:var(--text-muted);margin-top:4px">${t}</div>`;
    const sec = document.createElement('div'); sec.className = 'toolbox-section';
    sec.innerHTML = `<div class="collapsible-header collapsed" onclick="toggleModule(this)">Estilo</div><div class="collapsible-body hidden">${lb('Tipografía de acordes')}<select class="select-input" id="fontChord">${opt(CHORD_FONTS, st.chord)}</select>${lb('Tipografía del título')}<select class="select-input" id="fontTitle">${opt(TITLE_FONTS, st.title)}</select>${lb('Tamaño de acordes')}<input type="range" id="sizeChord" min="1" max="1.6" step="0.05" value="${st.size}" style="width:100%"><button class="tool-btn custom-btn" id="btnHand" style="margin-top:8px">✎ Look manuscrito</button></div>`;
    panel.children[0].after(sec);
    const upd = () => applyStyle({ chord: $('#fontChord').value, title: $('#fontTitle').value, size: $('#sizeChord').value });
    ['fontChord', 'fontTitle'].forEach(id => $('#' + id).onchange = upd); $('#sizeChord').oninput = upd;
    $('#btnHand').onclick = () => { $('#fontChord').value = 'Caveat Brush'; $('#fontTitle').value = 'Permanent Marker'; $('#sizeChord').value = 1.5; upd(); };
  }
  function ensureHeader() {
    const tc = $('.title-container'); if (!tc || $('#subtitleInput')) return;
    const i = document.createElement('input'); i.type = 'text'; i.id = 'subtitleInput'; i.className = 'subtitle-input'; i.placeholder = 'Subtítulo · álbum · grabación'; tc.after(i);
  }
  // Escritura rápida: Espacio/Enter = siguiente compás, flechas = moverse entre casillas, Retroceso en vacío = compás anterior, Esc = salir.
  document.addEventListener('keydown', e => {
    const t = e.target; if (!t || !t.classList || !t.classList.contains('chord-input') || e.ctrlKey || e.metaKey || e.altKey) return;
    const cells = () => $$('.chord-input', wrap), go = el => { if (el) { el.focus(); el.select(); } };
    const measures = () => $$('.measure-box:not(.break-system)', wrap), m = t.closest('.measure-box');
    if (e.key === 'Escape') { t.blur(); return; }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault(); formatChordInput(t);
      let ms = measures(), k = ms.indexOf(m);
      if (k < 0) return;
      if (!ms[k + 1]) { addMultipleMeasures(1); ms = measures(); }
      const nm = ms[k + 1]; if (nm) { handleMeasureClick(nm, null); go($('.chord-input', nm)); }
    } else if (e.key === 'Backspace' && !t.value) {
      const ms = measures(), k = ms.indexOf(m);
      if (k > 0) { e.preventDefault(); handleMeasureClick(ms[k - 1], null); go($('.chord-input', ms[k - 1])); }
    } else if ((e.key === 'ArrowRight' && t.selectionStart === t.value.length) || (e.key === 'ArrowLeft' && t.selectionStart === 0 && t.selectionEnd === 0)) {
      const c = cells(), k = c.indexOf(t), n = c[k + (e.key === 'ArrowRight' ? 1 : -1)];
      if (n) { e.preventDefault(); go(n); }
    }
  });

  /* ---------- Selección de varios compases y módulo de ritmo ---------- */
  const _sbs = W.selectBeatSlot, _hsi = W.handleSubItemClick, _ocm = W.openContextMenu;
  function shiftRange(slot, e) {
    if (!(e && e.shiftKey && lastSelectedMeasure)) return false;
    const m = slot.closest('.measure-box'); if (!m) return false;
    handleMeasureClick(m, e); return true;
  }
  W.selectBeatSlot = (slot, e, i) => { if (shiftRange(slot, e)) return; _sbs(slot, e, i || 0); slot.dataset.sub = i || 0; };
  W.handleSubItemClick = (slot, i, e) => { if (shiftRange(slot, e)) return; _hsi(slot, i, e); slot.dataset.sub = i; };
  const multi = () => selectedMeasures.length > 1 && selectedMeasures.includes(contextTargetMeasure);
  W.contextAction = action => {
    const t = contextTargetMeasure; if (!t) return;
    const sel = multi() ? selectedMeasures.slice() : [t]; saveStateForUndo();
    if (action === 'clear') sel.forEach(m => clearMeasureContent(m));
    else if (action === 'delete') { sel.forEach(m => m.remove()); clearSelections(); cleanupEmptyPages(); }
    else if (action === 'repeatStart') sel[0].classList.toggle('repeat-start');
    else if (action === 'repeatEnd') sel[sel.length - 1].classList.toggle('repeat-end');
    else if (action === 'insertBefore') { sel[0].parentNode.insertBefore(createMeasureElement(), sel[0]); rebindAllEvents(); }
    else if (action === 'insertAfter') { const l = sel[sel.length - 1]; l.parentNode.insertBefore(createMeasureElement(), l.nextSibling); rebindAllEvents(); }
    $('#measureContextMenu').style.display = 'none';
  };
  W.openContextMenu = (el, e) => {
    _ocm(el, e);
    const n = multi() ? selectedMeasures.length : 1;
    $$('#measureContextMenu .context-menu-item').forEach(b => {
      const k = ((b.getAttribute('onclick') || '').match(/'(\w+)'/) || [])[1];
      if (k === 'clear') b.textContent = n > 1 ? 'Limpiar ' + n + ' compases (Supr)' : 'Limpiar contenido (Supr)';
      if (k === 'delete') b.textContent = n > 1 ? 'Eliminar ' + n + ' compases' : 'Eliminar compás';
    });
  };
  function addRhythmPanel() {
    const tb = $('.rhythm-toolbar'), panel = $('.toolbox-panel'); if (!tb || !panel || $('#modRhythm')) return;
    const sec = document.createElement('div'); sec.className = 'toolbox-section';
    sec.innerHTML = '<div class="collapsible-header" id="modRhythm" onclick="toggleModule(this)">Ritmo y Notación</div><div class="collapsible-body"></div>';
    const body = $('.collapsible-body', sec), hint = $('#lblRhythmShortcuts');
    if (hint) { hint.style.cssText = 'font-size:.68em;opacity:.75;line-height:1.5;text-transform:none;letter-spacing:0'; body.appendChild(hint); }
    $$('.rhythm-buttons', tb).forEach(r => body.appendChild(r));
    panel.children[0].after(sec); tb.remove();
  }

  /* ---------- Redonda, resaltado de compases, clave y tonalidad ---------- */
  function wholeD(cx, cy) {
    const N = 36, pts = (rx, ry, rot) => Array.from({ length: N }, (_, k) => {
      const t = k / N * 2 * Math.PI, ex = rx * Math.cos(t), ey = ry * Math.sin(t);
      return (cx + ex * Math.cos(rot) - ey * Math.sin(rot)).toFixed(2) + ' ' + (cy + ex * Math.sin(rot) + ey * Math.cos(rot)).toFixed(2);
    });
    return 'M ' + pts(7.2, 4.9, 0).join(' L ') + ' Z M ' + pts(2.9, 4.4, 0.6).join(' L ') + ' Z';
  }
  const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  W.paintMeasures = c => {
    if (!selectedMeasures.length) return;
    saveStateForUndo();
    selectedMeasures.forEach(m => c ? m.style.setProperty('--hl', hexA(c, 0.5)) : m.style.removeProperty('--hl'));
    tick();
  };
  const KEYS = [['', 'No mostrar'], ['0', 'C · Am (sin alteraciones)'], ['1', 'G · Em (1♯)'], ['2', 'D · Bm (2♯)'], ['3', 'A · F♯m (3♯)'], ['4', 'E · C♯m (4♯)'], ['5', 'B · G♯m (5♯)'], ['6', 'F♯ · D♯m (6♯)'], ['7', 'C♯ · A♯m (7♯)'], ['-1', 'F · Dm (1♭)'], ['-2', 'B♭ · Gm (2♭)'], ['-3', 'E♭ · Cm (3♭)'], ['-4', 'A♭ · Fm (4♭)'], ['-5', 'D♭ · B♭m (5♭)'], ['-6', 'G♭ · E♭m (6♭)'], ['-7', 'C♭ · A♭m (7♭)']];
  const SH_STEPS = [0, 3, -1, 2, 5, 1, 4], FL_STEPS = [4, 1, 5, 2, 6, 3, 7];
  const P1 = () => $('.chart-paper', wrap);
  const sigState = () => { const p = P1(); return { clef: (p && p.dataset.clef) || '', key: (p && p.dataset.key) || '' }; };
  const clefPrefs = () => { try { return Object.assign({ size: 44, dy: 0, acc: 0.62 }, JSON.parse(localStorage.getItem('ccs_clef') || '{}')); } catch (e) { return { size: 44, dy: 0, acc: 0.62 }; } };
  function sysHead(st0) {
    const st = st0 || sigState(), pf = clefPrefs(), n = st.key === '' ? 0 : parseInt(st.key, 10) || 0;
    const hasClef = st.clef === 'g' || st.clef === 'f';
    if (!hasClef && !n) return null;
    const K = '#0f172a', yOf = k => 0.75 + k * 5.5625, bass = st.clef === 'f';
    let x = hasClef ? 26 : 2, g = '';
    if (hasClef) g += `<text x="2" y="${(bass ? yOf(2) : yOf(6)) + pf.dy}" font-size="${pf.size}" font-family="'Noto Music','Segoe UI Symbol','Apple Symbols','Noto Sans Symbols 2',serif" fill="${K}">${bass ? '𝄢' : '𝄞'}</text>`;
    const ks = (pf.size / 44) * (pf.acc || 0.62), adv = 11 * ks;
    (n > 0 ? SH_STEPS : FL_STEPS).slice(0, Math.abs(n)).forEach((stp, i) => {
      const cx = x + i * adv + 5 * ks, y = yOf(stp + (bass ? 2 : 0));
      g += n > 0
        ? `<g transform="translate(${cx.toFixed(2)} ${y.toFixed(2)}) scale(${ks.toFixed(3)})"><path d="M -1.7 -7.5 L -1.7 8.5 M 1.7 -8.5 L 1.7 7.5" stroke="${K}" stroke-width="1.7" fill="none"/><path d="M -4.5 -2.2 L 4.5 -4.7 M -4.5 3.6 L 4.5 1.1" stroke="${K}" stroke-width="3.2" fill="none"/></g>`
        : `<g transform="translate(${cx.toFixed(2)} ${y.toFixed(2)}) scale(${(ks * 1.1).toFixed(3)})"><path d="M -2 -9 L -2 3.5 C 1 2.5 5.5 -0.5 5 -3 C 4.5 -5 1 -4.5 -2 -1.5" stroke="${K}" stroke-width="1.9" fill="none"/></g>`;
    });
    const w = Math.round(x + Math.abs(n) * adv + 6 * ks);
    return { w, sig: [st.clef, n, pf.size, pf.dy, pf.acc].join('|'), html: `<svg width="${w}" height="46" viewBox="0 0 ${w} 46" xmlns="http://www.w3.org/2000/svg">${g}</svg>` };
  }
  function syncKeyPanel() {
    const c = $('#selClef'), k = $('#selKey'); if (!c || !k) return;
    const st = sigState(); if (c.value !== st.clef) c.value = st.clef; if (k.value !== st.key) k.value = st.key;
  }
  function addKeyPanel() {
    const panel = $('.toolbox-panel'); if (!panel || $('#selClef')) return;
    const pf = clefPrefs(), lb = t => `<div style="font-size:0.75em;color:var(--text-muted);margin-top:4px">${t}</div>`;
    const sec = document.createElement('div'); sec.className = 'toolbox-section'; sec.id = 'secKey';
    sec.innerHTML = `<div class="collapsible-header collapsed" onclick="toggleModule(this)">Clave y Tonalidad</div><div class="collapsible-body hidden">${lb('Clave')}<select class="select-input" id="selClef"><option value="">Sin clave</option><option value="g">Clave de Sol</option><option value="f">Clave de Fa</option></select>${lb('Tonalidad')}<select class="select-input" id="selKey">${KEYS.map(k => `<option value="${k[0]}">${k[1]}</option>`).join('')}</select>${lb('Tamaño de la clave')}<input type="range" id="clefSize" min="30" max="70" step="1" value="${pf.size}" style="width:100%">${lb('Altura de la clave')}<input type="range" id="clefDy" min="-20" max="20" step="1" value="${pf.dy}" style="width:100%">${lb('Tamaño de alteraciones')}<input type="range" id="accSize" min="0.35" max="1.1" step="0.01" value="${pf.acc}" style="width:100%">${lb('Cambio desde el compás seleccionado')}<select class="select-input" id="chgClef"><option value="~">Clave: sin cambio</option><option value="">Sin clave</option><option value="g">Clave de Sol</option><option value="f">Clave de Fa</option></select><select class="select-input" id="chgKey"><option value="~">Tonalidad: sin cambio</option>${KEYS.map(k => `<option value="${k[0]}">${k[1]}</option>`).join('')}</select><div style="display:flex;gap:6px;margin-top:4px"><button class="tool-btn" id="chgApply" style="flex:1">Aplicar</button><button class="tool-btn" id="chgClear" style="flex:1">Quitar</button></div>${lb('El cambio vale desde ese compás hacia adelante y no modifica lo anterior. Si la clave se ve chica o corrida, ajustá los controles.')}</div>`;
    ($('#modRhythm') ? $('#modRhythm').parentNode : panel.children[0]).after(sec);
    const setSt = () => { const p = P1(); if (!p) return; saveStateForUndo(); p.dataset.clef = $('#selClef').value; p.dataset.key = $('#selKey').value; tick(); };
    $('#selClef').onchange = setSt; $('#selKey').onchange = setSt;
    const setPf = () => { try { localStorage.setItem('ccs_clef', JSON.stringify({ size: +$('#clefSize').value, dy: +$('#clefDy').value, acc: +$('#accSize').value })); } catch (e) {} tick(); };
    $('#clefSize').oninput = setPf; $('#clefDy').oninput = setPf; $('#accSize').oninput = setPf;
    $('#chgApply').onclick = () => {
      const m = selectedMeasures[0]; if (!m) { alert('Primero seleccioná el compás donde empieza el cambio.'); return; }
      saveStateForUndo();
      const c = $('#chgClef').value, k = $('#chgKey').value;
      if (c === '~') delete m.dataset.clef; else m.dataset.clef = c;
      if (k === '~') delete m.dataset.key; else m.dataset.key = k;
      tick();
    };
    $('#chgClear').onclick = () => { const m = selectedMeasures[0]; if (!m) return; saveStateForUndo(); delete m.dataset.clef; delete m.dataset.key; tick(); };
    syncKeyPanel();
  }
  function addHighlightPanel() {
    const panel = $('.toolbox-panel'); if (!panel || $('#secHl')) return;
    const cols = ['#ffb3c7', '#fff08a', '#9be8a8', '#a9c4ff', '#ffc999', '#d8b4fe'];
    const sec = document.createElement('div'); sec.className = 'toolbox-section'; sec.id = 'secHl';
    sec.innerHTML = `<div class="collapsible-header collapsed" onclick="toggleModule(this)">Resaltar compases</div><div class="collapsible-body hidden"><div style="font-size:0.75em;color:var(--text-muted)">Seleccioná compases (Shift + clic para un rango) y elegí un color de fondo.</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">${cols.map(c => `<button class="hl-sw" style="--c:${c}" data-c="${c}" title="Pintar"></button>`).join('')}<input type="color" id="hlCustom" value="#ffd166" title="Otro color" style="width:30px;height:28px;border:0;background:none;padding:0;cursor:pointer"></div><button class="tool-btn" id="hlClear" style="margin-top:6px">Quitar color</button></div>`;
    ($('#secKey') || $('#modRhythm') && $('#modRhythm').parentNode || panel.children[0]).after(sec);
    $$('.hl-sw', sec).forEach(b => b.onclick = () => paintMeasures(b.dataset.c));
    $('#hlCustom').onchange = e => paintMeasures(e.target.value); $('#hlClear').onclick = () => paintMeasures(null);
  }
  // Transponer también mueve la tonalidad marcada
  const _ta2 = W.transposeAll;
  W.transposeAll = sm => {
    _ta2(sm);
    const mapK = n => { let k = (7 * ((((7 * n) % 12 + 12) % 12 + sm + 120) % 12)) % 12; return k > 6 ? k - 12 : k; };
    const p = P1(); if (p && p.dataset.key !== undefined && p.dataset.key !== '' && !isNaN(parseInt(p.dataset.key, 10))) p.dataset.key = String(mapK(parseInt(p.dataset.key, 10)));
    $$('.measure-box[data-key]', wrap).forEach(m => { const n = parseInt(m.dataset.key, 10); if (m.dataset.key !== '' && !isNaN(n)) m.dataset.key = String(mapK(n)); });
    tick();
  };
  // Shift + clic no debe seleccionar texto del navegador (se veían los "+" azules)
  document.addEventListener('mousedown', e => { if (e.shiftKey && e.target.closest && e.target.closest('.measure-box')) e.preventDefault(); }, true);

  /* ---------- Dirección de plicas (X) ---------- */
  const beamable = it => !it.rest && !it.cont && it.dur < 4 && !/[hw]$/.test(it.type);
  W.toggleStemDir = () => {
    if (activeBeatSlot) {
      const items = getBeatData(activeBeatSlot).map(norm), i = Math.min(activeSubIndex, items.length - 1);
      saveStateForUndo();
      let a = i, b = i;
      if (beamable(items[i])) { while (a > 0 && beamable(items[a - 1])) a--; while (b < items.length - 1 && beamable(items[b + 1])) b++; }
      const nu = !items[i].up; for (let k = a; k <= b; k++) items[k].up = nu;
      setBeatData(activeBeatSlot, items); focusSlot(activeBeatSlot, i);
    } else if (selectedMeasures.length) {
      saveStateForUndo();
      const slots = selectedMeasures.flatMap(m => $$('.beat-slot', m));
      const first = slots.map(sl => getBeatData(sl)).flat().find(it => !it.rest);
      const nu = !(first && first.up);
      slots.forEach(sl => { const its = getBeatData(sl).map(norm); its.forEach(it => { it.up = nu; }); setBeatData(sl, its); });
    }
  };
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 'x') return;
    const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.isContentEditable)) return;
    e.preventDefault(); toggleStemDir();
  });

  /* ---------- Exportación robusta + imprimir a PDF ---------- */
  function setPageStyle(land) {
    let ps = $('#pageStyle'); if (!ps) { ps = document.createElement('style'); ps.id = 'pageStyle'; document.head.appendChild(ps); }
    ps.textContent = '@page{size:A4 ' + (land ? 'landscape' : 'portrait') + ';margin:0}';
  }
  function printPDF() {
    prepareForRender();
    const done = () => { restoreAfterRender(); removeEventListener('afterprint', done); };
    addEventListener('afterprint', done); setTimeout(() => window.print(), 80);
  }
  W.printPDF = printPDF;
  async function exportPages(kind) {
    prepareForRender(); let fallback = false;
    try {
      await document.fonts.ready;
      if (!W.html2canvas || (kind === 'pdf' && !(W.jspdf && W.jspdf.jsPDF))) throw new Error('no cargaron las librerías de exportación (conexión o bloqueador de anuncios)');
      const ps = $$('.chart-paper', wrap), L = document.body.classList.contains('landscape');
      const pdf = kind === 'pdf' ? new W.jspdf.jsPDF(L ? 'l' : 'p', 'mm', 'a4') : null;
      for (let i = 0; i < ps.length; i++) {
        const c = await html2canvas(ps[i], RENDER_OPTIONS);
        if (pdf) { if (i) pdf.addPage(); pdf.addImage(c.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, L ? 297 : 210, L ? 210 : 297); }
        else { const a = document.createElement('a'); a.download = slug() + '-page-' + (i + 1) + '.png'; a.href = c.toDataURL('image/png'); a.click(); }
      }
      if (pdf) pdf.save(slug() + '.pdf');
    } catch (e) {
      console.error(e);
      const msg = e && e.message ? e.message : String(e);
      if (kind === 'pdf') fallback = confirm('No se pudo generar el PDF directo:\n' + msg + '\n\n¿Abrir el diálogo de impresión para guardarlo como PDF?');
      else alert('No se pudo exportar: ' + msg);
    } finally { restoreAfterRender(); }
    if (fallback) printPDF();
  }
  W.exportAllPagesToPDF = () => exportPages('pdf');
  W.exportAllPagesToPNG = () => exportPages('png');
  function addPdfPrint() {
    const dm = $('.download-menu'); if (!dm || $('#optPrintPDF')) return;
    const b = document.createElement('button'); b.className = 'download-option'; b.id = 'optPrintPDF'; b.textContent = 'Imprimir / Guardar como PDF (vectorial)'; b.onclick = printPDF; dm.appendChild(b);
  }

  /* ---------- Dictado de acordes y signos ---------- */
  const NUMW = { cero: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90 };
  const ROOTS = { do: 'C', re: 'D', mi: 'E', fa: 'F', sol: 'G', la: 'A', si: 'B', ce: 'C', efe: 'F', ge: 'G', be: 'B', a: 'A', b: 'B', c: 'C', d: 'D', e: 'E', f: 'F', g: 'G' };
  const ACCW = { sostenido: '♯', bemol: '♭' };
  const SECW = { intro: 'secIntro', verso: 'secVerse', coro: 'secChorus', puente: 'secBridge', solo: 'secSolo' };
  const normTxt = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[♯#]/g, ' sostenido ').replace(/♭/g, ' bemol ').replace(/\//g, ' sobre ').replace(/[^a-z0-9\s]/g, ' ').trim();
  const numAt = (T, i) => {
    const w = T[i]; if (w === undefined) return null;
    if (/^\d+$/.test(w)) return { n: +w, len: 1 };
    if (!(w in NUMW)) return null;
    const n = NUMW[w];
    if (n >= 30 && T[i + 1] === 'y' && T[i + 2] in NUMW && NUMW[T[i + 2]] < 10) return { n: n + NUMW[T[i + 2]], len: 3 };
    return { n, len: 1 };
  };
  function parseChord(T, i) {
    const d = /^([a-g])(m|min|maj|dim|aug|sus)?(\d{1,2})?$/.exec(T[i]);
    if (T[i].length > 1 && d) return { str: d[1].toUpperCase() + (d[2] === 'min' ? 'm' : d[2] || '') + (d[3] || ''), len: 1 };
    const r = ROOTS[T[i]]; if (!r) return null;
    let j = i + 1, acc = '', q = '', maj = false, sus = false, pend = '', bass = ''; const nums = [], alts = [];
    if (T[j] in ACCW) { acc = ACCW[T[j]]; j++; }
    for (; j < T.length; j++) {
      const w = T[j];
      if (w === 'menor' || w === 'min' || w === 'm') q = 'm';
      else if (w === 'mayor' || w === 'maj' || w === 'major') maj = true;
      else if (w === 'disminuido' || w === 'dim') q = 'dim';
      else if (w === 'semidisminuido') q = 'ø';
      else if (w === 'aumentado' || w === 'aug') q = 'aug';
      else if (w === 'suspendido' || w === 'sus') sus = true;
      else if (w === 'septima') nums.push(7); else if (w === 'sexta') nums.push(6); else if (w === 'novena') nums.push(9); else if (w === 'oncena') nums.push(11);
      else if (w in ACCW && numAt(T, j + 1)) pend = ACCW[w];
      else if (numAt(T, j)) { const nn = numAt(T, j); if (pend) { alts.push(pend + nn.n); pend = ''; } else nums.push(nn.n); j += nn.len - 1; }
      else if (w === 'con' && T[j + 1] === 'bajo') continue;
      else if (w === 'sobre' || w === 'bajo') {
        let k = j + 1; if (T[k] === 'en') k++;
        const br = ROOTS[T[k]]; if (!br) break;
        bass = br; k++; if (T[k] in ACCW) { bass += ACCW[T[k]]; k++; }
        j = k - 1;
      } else break;
    }
    let str = r + acc + ({ m: 'm', dim: 'dim', aug: 'aug', 'ø': 'ø' }[q] || '');
    if (sus) str += 'sus' + (nums.length ? nums.shift() : 4);
    if (nums.length) { const e = nums.shift(); str += (maj && e >= 7 ? 'maj' : '') + e; nums.forEach(x => { str += 'add' + x; }); }
    if (alts.length) str += '(' + alts.join(',') + ')';
    if (bass) str += '/' + bass;
    return { str, len: j - i };
  }
  const measuresAll = () => $$('.measure-box:not(.break-system)', wrap);
  const selectMeasure = m => { handleMeasureClick(m, null); try { m.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} };
  const pickMeasure = n => { const m = measuresAll()[n - 1]; if (m) selectMeasure(m); return m; };
  const act = f => n => { const m = pickMeasure(n); if (!m) return false; f(m); return true; };
  const dyn = t => act(() => applyDynamicText(t)), hairp = t => act(() => applyHairpin(t)), note = t => act(() => addAnnotation(t));
  const CMDS = [
    ['da capo al coda', note('D.C. al Coda')], ['dal segno al coda', note('D.S. al Coda')],
    ['inicio de repeticion', act(() => toggleRepeat('start'))], ['abrir repeticion', act(() => toggleRepeat('start'))],
    ['fin de repeticion', act(() => toggleRepeat('end'))], ['cerrar repeticion', act(() => toggleRepeat('end'))],
    ['doble barra final', act(() => toggleBarType('double-bar-final'))], ['barra final', act(() => toggleBarType('double-bar-final'))], ['doble barra', act(() => toggleBarType('double-bar-thin'))],
    ['mezzo piano', dyn('mp')], ['mezzo forte', dyn('mf')], ['forte piano', dyn('fp')], ['pianissimo', dyn('pp')], ['fortissimo', dyn('ff')], ['sforzando', dyn('sfz')], ['piano', dyn('p')], ['forte', dyn('f')],
    ['decrescendo', hairp('decrescendo')], ['diminuendo', hairp('decrescendo')], ['crescendo', hairp('crescendo')],
    ['entra banda', act(() => addAnnotation(i18n[currentLang].bandIn))], ['tutti', note('Tutti')], ['corte', act(() => addAnnotation(i18n[currentLang].corte))],
    ['segno', note('𝄌 Segno')], ['signo', note('𝄌 Segno')], ['coda', note('𝄍 Coda')],
    ['casilla uno', act(() => applyVolta('1.'))], ['casilla 1', act(() => applyVolta('1.'))], ['casilla dos', act(() => applyVolta('2.'))], ['casilla 2', act(() => applyVolta('2.'))],
    ['deshacer', () => { undoAction(); return true; }]
  ].sort((a, b) => b[0].split(' ').length - a[0].split(' ').length);
  let pos = { m: 1, b: 1 }, lastM = 0, focusM = 0, justWrote = false;
  function interpret(raw) {
    const T = normTxt(raw).split(/\s+/).filter(Boolean), acts = []; if (!T.length) return acts;
    let saved = false; const sv = () => { if (!saved) { saveStateForUndo(); saved = true; } };
    const tmNow = () => justWrote ? lastM : (focusM || lastM || pos.m);
    let i = 0;
    while (i < T.length) {
      const w = T[i], nn = numAt(T, i + 1);
      if (w === 'compas' && nn) { pos = { m: nn.n, b: 1 }; focusM = nn.n; justWrote = false; i += 1 + nn.len; continue; }
      if ((w === 'pulso' || w === 'tiempo' || w === 'beat') && nn) { const b = Math.min(4, Math.max(1, nn.n)); pos = { m: justWrote ? lastM : pos.m, b }; justWrote = false; i += 1 + nn.len; continue; }
      if (w === 'siguiente' || w === 'proximo') { pos = { m: pos.m + 1, b: 1 }; justWrote = false; i++; continue; }
      if (w === 'anterior') { pos = { m: Math.max(1, pos.m - 1), b: 1 }; justWrote = false; i++; continue; }
      if ((w === 'agregar' || w === 'agrega') && nn) { sv(); addMultipleMeasures(Math.min(nn.n, 200)); acts.push('+' + nn.n + ' compases'); i += 1 + nn.len + (T[i + 1 + nn.len] === 'compases' ? 1 : 0); continue; }
      if (w === 'borrar' || w === 'borra') {
        let n = tmNow(), len = 1; const n2 = T[i + 1] === 'compas' ? numAt(T, i + 2) : null;
        if (n2) { n = n2.n; len = 2 + n2.len; }
        const m = measuresAll()[n - 1]; if (m) { sv(); $$('.chord-input', m).forEach(x => { x.value = ''; }); acts.push('borré el compás ' + n); }
        i += len; continue;
      }
      if (w === 'seccion' || (w === 'nueva' && T[i + 1] === 'seccion')) {
        const k = w === 'seccion' ? i + 1 : i + 2;
        if (SECW[T[k]]) { sv(); addSection(i18n[currentLang][SECW[T[k]]]); acts.push('sección ' + T[k]); i = k + 1; continue; }
      }
      let hit = false;
      for (const [ph, fn] of CMDS) {
        const p = ph.split(' ');
        if (p.every((x, k) => T[i + k] === x)) { sv(); const tm = tmNow(); if (fn(tm)) acts.push(ph + ' → compás ' + tm); i += p.length; hit = true; break; }
      }
      if (hit) continue;
      const ch = parseChord(T, i);
      if (ch) {
        sv();
        if (pos.m > measuresAll().length) addMultipleMeasures(Math.min(pos.m - measuresAll().length, 300));
        const m = measuresAll()[pos.m - 1]; ensureRows();
        const inp = m && $$('.chord-input', m)[pos.b - 1];
        if (inp) { inp.value = ch.str; formatChordInput(inp); selectMeasure(m); acts.push(ch.str + ' → compás ' + pos.m + (pos.b > 1 ? ', pulso ' + pos.b : '')); }
        lastM = pos.m; focusM = pos.m; pos = { m: pos.m + 1, b: 1 }; justWrote = true; i += ch.len; continue;
      }
      i++;
    }
    return acts;
  }
  function dictLog(raw, acts) {
    const el = $('#dictLog'), st = $('#dictStatus'); if (!el) return;
    const line = document.createElement('div'); line.textContent = acts.length ? '✓ ' + acts.join(' · ') : '· no entendí: «' + raw + '»';
    el.prepend(line); while (el.children.length > 6) el.lastChild.remove();
    if (st) st.textContent = 'Escuché: ' + raw;
  }
  function handleDictation(raw) { const acts = interpret(raw); dictLog(raw, acts); if (acts.length) { refreshChords(); tick(); } }
  let rec = null, listening = false;
  function setDictUI(on) { const b = $('#dictBtn'); if (!b) return; b.classList.toggle('dict-on', on); b.textContent = on ? '■ Detener dictado' : '● Dictar'; }
  function stopDictation() { listening = false; try { rec && rec.stop(); } catch (e) {} setDictUI(false); }
  function startDictation() {
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) { alert('Tu navegador no permite dictado por voz. Probá con Chrome o Edge, o escribí los comandos en el cuadro de texto.'); return; }
    pos = { m: 1, b: 1 }; lastM = 0; focusM = 0; justWrote = false;
    const sel = selectedMeasures[0]; if (sel) pos.m = measuresAll().indexOf(sel) + 1 || 1;
    rec = new SR(); rec.lang = ($('#dictLang') || {}).value || 'es-AR'; rec.continuous = true; rec.interimResults = true;
    rec.onresult = e => {
      let interim = '';
      for (let k = e.resultIndex; k < e.results.length; k++) { const r = e.results[k]; if (r.isFinal) handleDictation(r[0].transcript); else interim += r[0].transcript; }
      const st = $('#dictStatus'); if (interim && st) st.textContent = '… ' + interim;
    };
    rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { stopDictation(); alert('Hay que permitir el uso del micrófono para dictar.'); } };
    rec.onend = () => { if (listening) { try { rec.start(); } catch (e) {} } };
    listening = true; setDictUI(true);
    try { rec.start(); } catch (e) {}
  }
  function addDictationPanel() {
    const panel = $('.toolbox-panel'); if (!panel || $('#secDict')) return;
    const sec = document.createElement('div'); sec.className = 'toolbox-section'; sec.id = 'secDict';
    sec.innerHTML = `<div class="collapsible-header collapsed" onclick="toggleModule(this)">Dictado</div><div class="collapsible-body hidden"><button class="tool-btn primary" id="dictBtn">● Dictar</button><select class="select-input" id="dictLang"><option value="es-AR">Español (Argentina)</option><option value="es-ES">Español (España)</option><option value="es-MX">Español (México)</option></select><input class="select-input" id="dictText" placeholder="o escribí un comando y Enter"><div id="dictStatus" style="font-size:.7em;color:#8ea3b6;min-height:1.2em"></div><div id="dictLog" style="font-size:.7em;color:#b9c7d3;line-height:1.5"></div><div style="font-size:.66em;color:#6f8396;line-height:1.5">Ejemplos: «compás 32, re menor siete» · «sol sobre si» · «la bemol mayor siete pulso 3 do» · «coda» · «crescendo» · «casilla dos» · «nueva sección coro» · «agregar 8 compases» · «deshacer». Sin decir compás, cada acorde va al siguiente.</div></div>`;
    ($('#modRhythm') ? $('#modRhythm').parentNode : panel.children[0]).after(sec);
    $('#dictBtn').onclick = () => listening ? stopDictation() : startDictation();
    $('#dictText').onkeydown = e => { if (e.key === 'Enter' && e.target.value.trim()) { if (!justWrote && !lastM) { const sel = selectedMeasures[0]; if (sel) pos.m = measuresAll().indexOf(sel) + 1 || 1; } handleDictation(e.target.value); e.target.value = ''; } };
  }

  /* ---------- Arranque ---------- */
  let timer = 0;
  const tick = () => { clearTimeout(timer); timer = setTimeout(() => { syncKeyPanel(); ensureHeader(); ensureRows(); layout(false); markRows(); drawTies(); refreshChords(); $$(FX).forEach(deco); save(); }, 150); };
  function init() {
    try { const h = localStorage.getItem(KEY); if (h) { wrap.innerHTML = h; clearSelections(); rebindAllEvents(); } } catch (e) {}
    applyStyle(readStyle()); loadFont('Noto Music');
    const body = $('#modMainActions + .collapsible-body');
    if (body) {
      $('#modMainActions').classList.remove('collapsed'); body.classList.remove('hidden');
      const box = document.createElement('div');
      box.innerHTML = '<select class="select-input" id="orientSel"><option value="p">Hoja A4 vertical</option><option value="l">Hoja A4 horizontal</option></select><button class="tool-btn" id="btnNewChart" style="margin-top:6px;width:100%">Nuevo chart (borrar guardado)</button>';
      body.appendChild(box);
      addFileButtons(box); addStylePanel();
      $('#orientSel').onchange = e => setOrientation(e.target.value === 'l');
      $('#btnNewChart').onclick = () => { if (confirm('¿Borrar el chart guardado y empezar de cero?')) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } };
      $('#btnAddPage').style.display = 'none';
    }
    const rb = $('.rhythm-buttons');
    if (rb) { const b = document.createElement('button'); b.className = 'rhythm-btn'; b.title = 'Slash simple'; b.textContent = '/'; b.onclick = () => applySubdivisionRhythm('slash'); rb.appendChild(b); }
    addRhythmPanel(); addKeyPanel(); addHighlightPanel(); addDictationPanel(); addPdfPrint();
    $$('.rest-btn .key-badge').forEach(b => b.style.display = 'none');
    const hint = 'Teclas 7,6,5,4,3 | R: silencio | L: ligadura | .: puntillo | X: plica arriba/abajo | Shift+Clic: rango | Ctrl+Z';
    i18n.es.lblRhythmShortcuts = hint; i18n.en.lblRhythmShortcuts = hint.replace('Teclas', 'Keys').replace('silencio', 'rest').replace('ligadura', 'tie').replace('puntillo', 'dot').replace('rango', 'range').replace('plica arriba/abajo', 'stem up/down');
    applyLanguage(currentLang);
    let land = false; try { land = localStorage.getItem('ccs_orient') === 'l'; } catch (e) {}
    if (land && $('#orientSel')) $('#orientSel').value = 'l';
    document.fonts.ready.then(() => { ensureHeader(); ensureRows(); $$('.beat-slot', wrap).forEach(sl => renderBeatSlot(sl)); setOrientation(land); markRows(); drawTies(); refreshChords(); $$(FX).forEach(deco); });
    new MutationObserver(tick).observe(wrap, { childList: true, subtree: true });
    wrap.addEventListener('input', tick);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init); else init();
})();
