/* Full screen viewer for videos and images, same controls as the JNPR Labs slider
   (progress line, 01 / 12, round chevrons). Swipe on phones, chevrons or keyboard on desktop.
   Use: VV.open([{ v: 'video/x.mp4', s: 'poster-or-image.webp' }, ...], startIndex, onClose) */
(() => {
  const es = document.documentElement.lang === 'es';
  const T = es ? { x: 'Cerrar', m: 'Silenciar', u: 'Activar sonido', p: 'Anterior', n: 'Siguiente', play: 'Reproducir' }
               : { x: 'Close', m: 'Mute', u: 'Sound on', p: 'Previous', n: 'Next', play: 'Play' };
  const css = `.vv{position:fixed;inset:0;z-index:2147483000;touch-action:manipulation;background:#F12009 url(/img/papel-rojo.webp) center/627px;color:#FCFCFC;display:grid;grid-template-rows:auto minmax(0,1fr) auto;grid-template-columns:minmax(0,1fr)}.vv>*{min-width:0}.vv.vv-lab{background:#9B7EEA url(/img/papel-morado.webp) center/627px}.vv.vv-lab .vv-top button{color:#9B7EEA}@media(max-width:600px){.vv-h{white-space:normal!important;font-size:18px!important;line-height:1.15!important}}.vv .vv-x{width:44px;height:44px;padding:0!important;border-radius:50%;display:grid;place-items:center;flex:none}.vv[hidden]{display:none}
.vv-top,.vv-bot{display:flex;align-items:center;gap:12px;padding:calc(14px + env(safe-area-inset-top)) clamp(16px,4vw,64px) 14px}
.vv-top{justify-content:flex-end}.vv-h{margin-right:auto;font:400 clamp(20px,3vw,40px)/1 'MW',system-ui,sans-serif;text-transform:uppercase;display:flex;align-items:center;gap:.3em;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.vv-h img{width:.9em;height:.9em;animation:vvspin 14s linear infinite}@keyframes vvspin{to{rotate:360deg}}.vv-bot{padding:14px clamp(16px,4vw,64px) calc(18px + env(safe-area-inset-bottom))}
.vv button{all:unset;cursor:pointer;-webkit-tap-highlight-color:transparent}
.vv-top button{position:relative;z-index:2;flex:none;font:10px 'MW',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.14em;border-radius:99px;padding:13px 18px;background:#FCFCFC;color:#F12009}
.vv-top button[hidden]{display:none}
.vv-t{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior:contain;min-height:0}.vv-t::-webkit-scrollbar{display:none}
.vv-s{flex:none;width:100%;height:100%;scroll-snap-align:center;display:grid;place-items:center;padding:0 clamp(16px,4vw,64px);box-sizing:border-box;position:relative}
.vv-s>video,.vv-s>img{max-width:calc(100vw - 2 * clamp(16px,4vw,64px));max-height:calc(100dvh - 200px - env(safe-area-inset-top) - env(safe-area-inset-bottom));width:auto;height:auto;border-radius:18px;box-shadow:0 40px 70px -30px rgb(60 5 0 / .7);display:block}
.vv .vv-go{position:absolute;inset:0;margin:auto;width:84px;height:84px;border-radius:50%;background:#FCFCFC;color:#F12009;display:grid;place-items:center;font:10px 'MW',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.12em}
.vv-bar{flex:1;height:2px;background:rgb(252 252 252 / .35);position:relative;overflow:hidden}.vv-bar b{position:absolute;top:0;bottom:0;left:0;background:#FCFCFC;transition:width .3s}
.vv-n{font:11px 'MW',system-ui,sans-serif;letter-spacing:.12em;margin-right:6px}
.vv .vv-c{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#FCFCFC}
.vv-c::before{content:'';width:11px;height:11px;border-top:2px solid currentColor;border-right:2px solid currentColor;transform:translateX(-2px) rotate(45deg)}
.vv-c.prev::before{transform:translateX(2px) rotate(-135deg)}.vv-c[disabled]{opacity:.35;cursor:default}`;
  let vv, track, cnt, fill, mb, bp, bn, items = [], mute = false, t_, done, pushed = false;
  const pad = n => String(n).padStart(2, '0');
  const build = () => {
    const st = document.createElement('style'); st.textContent = css; document.head.append(st);
    vv = document.createElement('div'); vv.className = 'vv'; vv.hidden = true; vv.setAttribute('role', 'dialog'); vv.setAttribute('aria-modal', 'true');
    vv.innerHTML = `<div class="vv-top"><p class="vv-h"></p><button type="button" class="vv-m">${T.m}</button><button type="button" class="vv-x" aria-label="${T.x}" title="${T.x}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="vv-t"></div>`
      + `<div class="vv-bot"><i class="vv-bar"><b></b></i><span class="vv-n"></span><button type="button" class="vv-c prev" aria-label="${T.p}"></button><button type="button" class="vv-c next" aria-label="${T.n}"></button></div>`;
    document.body.append(vv);
    track = vv.querySelector('.vv-t'); cnt = vv.querySelector('.vv-n'); fill = vv.querySelector('.vv-bar b'); mb = vv.querySelector('.vv-m');
    bp = vv.querySelector('.prev'); bn = vv.querySelector('.next');
    track.addEventListener('scroll', () => { ui(); clearTimeout(t_); t_ = setTimeout(play, 150); }, { passive: true });
    vv.querySelector('.vv-x').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); exit(); });
    addEventListener('popstate', () => { if (!vv.hidden) { pushed = false; close(); } });
    bp.onclick = () => go(-1); bn.onclick = () => go(1);
    mb.onclick = () => { mute = !mute; const v = cur(); if (v) { v.muted = mute; if (v.paused) start(v); } mb.textContent = mute ? T.u : T.m; };
    track.addEventListener('click', e => { const g = e.target.closest('.vv-go'); if (g) start(g.parentElement.querySelector('video')); });
    addEventListener('keydown', e => { if (vv.hidden) return; if (e.key === 'Escape') exit(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
  };
  const at = () => Math.round(track.scrollLeft / track.clientWidth);
  const cur = () => track.children[at()]?.querySelector('video');
  const go = d => track.scrollTo({ left: Math.max(0, Math.min(items.length - 1, at() + d)) * track.clientWidth, behavior: 'smooth' });
  const ui = () => {
    const k = at(); cnt.textContent = pad(k + 1) + ' / ' + pad(items.length);
    fill.style.width = ((k + 1) / items.length * 100) + '%';
    bp.disabled = k === 0; bn.disabled = k === items.length - 1;
    mb.hidden = !items[k] || !items[k].v;
  };
  // Always starts muted (never surprise a client with sound); if even that fails, a Play button stays
  const start = v => {
    if (!v) return; const b = v.parentElement.querySelector('.vv-go');
    if (!v.getAttribute('src')) v.src = v.dataset.src;
    v.muted = mute;
    const ok = () => b && b.remove();
    v.play().then(ok).catch(() => { v.muted = true; mute = true; mb.textContent = T.u; v.play().then(ok).catch(() => {}); });
  };
  function play() {
    const k = at();
    [...track.children].forEach((sl, j) => { const v = sl.querySelector('video'); if (!v) return; if (j === k) start(v); else v.pause(); });
    ui();
  }
  // Close also works with the phone's Back gesture
  const exit = () => { if (pushed) { pushed = false; history.back(); } else close(); };
  function close() {
    vv.hidden = true; track.innerHTML = ''; document.documentElement.style.overflow = '';
    if (done) { const d = done; done = null; d(); }
  }
  window.VV = { open(list, i = 0, onClose, title) {
    if (!vv) build();
    done = onClose;
    const h = vv.querySelector('.vv-h'); h.textContent = title || ''; if (title) { const a = new Image(); a.src = '/img/ast/chrome.webp'; a.alt = ''; h.append(a); }
    if (!pushed) { history.pushState({ vv: 1 }, ''); pushed = true; } items = list; mute = true; mb.textContent = T.u;
    const esc = s => String(s).replace(/"/g, '&quot;');
    track.innerHTML = items.map(x => x.v
      ? `<div class="vv-s"><video data-src="${esc(x.v)}" loop playsinline preload="none"${x.s ? ` poster="${esc(x.s)}"` : ''}></video><button type="button" class="vv-go">${T.play}</button></div>`
      : `<div class="vv-s"><img src="${esc(x.s)}" alt="${esc(x.c || '')}" loading="lazy"></div>`).join('');
    document.querySelectorAll('video').forEach(v => { if (!vv.contains(v)) v.pause(); });
    vv.classList.toggle('vv-lab', document.documentElement.dataset.side === 'B' || !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('.lab-wall, .lab-sb'))); vv.hidden = false; document.documentElement.style.overflow = 'hidden';
    track.scrollLeft = i * track.clientWidth; ui();
    start(track.children[i]?.querySelector('video'));  // muted; Sound on is one tap away
  } };
})();
