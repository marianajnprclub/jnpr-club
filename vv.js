/* Full screen viewer for videos and images. Swipe (phone), arrows or buttons (desktop).
   Fills the screen with a blurred copy behind, so there is never an empty background.
   Use: VV.open([{ v: 'video/x.mp4', s: 'poster-or-image.webp' }, ...], startIndex) */
(() => {
  const es = document.documentElement.lang === 'es';
  const T = es ? { x: 'Cerrar', m: 'Silenciar', u: 'Sonido', p: 'Anterior', n: 'Siguiente', sw: 'Desliza' }
               : { x: 'Close', m: 'Mute', u: 'Sound', p: 'Previous', n: 'Next', sw: 'Swipe' };
  const css = `.vv{position:fixed;inset:0;z-index:300;background:#F12009}.vv[hidden]{display:none}
.vv-t{position:absolute;inset:0;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior:contain}.vv-t::-webkit-scrollbar{display:none}
.vv-s{position:relative;flex:none;width:100%;height:100%;scroll-snap-align:start;overflow:hidden}
.vv-s>*{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block}
.vv-s>.bg{object-fit:cover;filter:blur(40px) saturate(1.3);transform:scale(1.2)}
.vv-ui{position:absolute;left:0;right:0;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:16px clamp(16px,4vw,64px);z-index:2;pointer-events:none}
.vv-ui>*{pointer-events:auto}.vv-top{top:env(safe-area-inset-top)}.vv-bot{bottom:env(safe-area-inset-bottom)}
.vv button{all:unset;cursor:pointer;font:10px 'MW',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.14em;border-radius:99px;padding:13px 18px;background:#FCFCFC;color:#F12009}
.vv-n{font:11px 'MW',system-ui,sans-serif;letter-spacing:.14em;color:#FCFCFC;background:#F12009;border-radius:99px;padding:11px 14px}
.vv-sw{font:10px 'MW',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.16em;color:#FCFCFC;display:none}
.vv-nav{display:flex;gap:8px}@media (pointer:coarse),(max-width:600px){.vv-nav{display:none}.vv-sw{display:block}}`;
  let vv, track, cnt, mb, items = [], mute = false, t_, done;
  const build = () => {
    const st = document.createElement('style'); st.textContent = css; document.head.append(st);
    vv = document.createElement('div'); vv.className = 'vv'; vv.hidden = true; vv.setAttribute('role', 'dialog'); vv.setAttribute('aria-modal', 'true');
    vv.innerHTML = `<div class="vv-t"></div><div class="vv-ui vv-top"><span class="vv-n"></span><button type="button" class="vv-x">${T.x}</button></div>`
      + `<div class="vv-ui vv-bot"><button type="button" class="vv-m">${T.m}</button><span class="vv-sw">${T.sw}</span><div class="vv-nav"><button type="button" class="vv-p">${T.p}</button><button type="button" class="vv-f">${T.n}</button></div></div>`;
    document.body.append(vv);
    track = vv.querySelector('.vv-t'); cnt = vv.querySelector('.vv-n'); mb = vv.querySelector('.vv-m');
    track.addEventListener('scroll', () => { clearTimeout(t_); t_ = setTimeout(play, 120); }, { passive: true });
    vv.querySelector('.vv-x').onclick = close;
    vv.querySelector('.vv-p').onclick = () => go(-1);
    vv.querySelector('.vv-f').onclick = () => go(1);
    mb.onclick = () => { mute = !mute; mb.textContent = mute ? T.u : T.m; play(); };
    addEventListener('keydown', e => { if (vv.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && !vv.hidden) close(); });
  };
  const at = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = d => track.scrollTo({ left: Math.max(0, Math.min(items.length - 1, at() + d)) * track.clientWidth, behavior: 'smooth' });
  function play() {
    const k = at();
    [...track.children].forEach((sl, j) => sl.querySelectorAll('video').forEach(v => {
      if (Math.abs(j - k) <= 1 && !v.getAttribute('src')) v.src = v.dataset.src;
      if (j === k) { v.muted = v.classList.contains('bg') || mute; v.play().catch(() => {}); } else v.pause();
    }));
    mb.hidden = !items[k] || !items[k].v;
    cnt.textContent = String(k + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
  }
  function close() {
    vv.hidden = true; track.innerHTML = ''; document.documentElement.style.overflow = '';
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (done) { const d = done; done = null; d(); }
  }
  window.VV = { open(list, i = 0, onClose) {
    if (!vv) build();
    done = onClose;
    items = list; mute = false; mb.textContent = T.m;
    const esc = s => String(s).replace(/"/g, '&quot;');
    track.innerHTML = items.map(x => x.v
      ? `<div class="vv-s"><video class="bg" data-src="${esc(x.v)}" muted loop playsinline preload="none" aria-hidden="true"${x.s ? ` poster="${esc(x.s)}"` : ''}></video><video data-src="${esc(x.v)}" loop playsinline preload="none"${x.s ? ` poster="${esc(x.s)}"` : ''}></video></div>`
      : `<div class="vv-s"><img class="bg" src="${esc(x.s)}" alt="" aria-hidden="true" loading="lazy"><img src="${esc(x.s)}" alt="${esc(x.c || '')}" loading="lazy"></div>`).join('');
    document.querySelectorAll('video').forEach(v => { if (!vv.contains(v)) v.pause(); });
    vv.hidden = false; document.documentElement.style.overflow = 'hidden';
    track.scrollLeft = i * track.clientWidth; play();
    if (vv.requestFullscreen && matchMedia('(pointer: fine)').matches) vv.requestFullscreen().catch(() => {});
  } };
})();
