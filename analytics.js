/* Google Analytics 4 with a cookie notice (Spain: analytics cookies need consent).
   Nothing loads until the visitor accepts. Paste the Measurement ID below to switch it on. */
(() => {
  const GTM_ID = ''; // optional: Tag Manager container (GTM-M5ZQJSB9 not found in her accounts)
  const GA_ID = 'G-1FST6VRM2T'; // GA4 stream "JNPR Club web"
  const CLARITY_ID = 'zgkhjttm84'; // 20/11: Microsoft Clarity project ID (clarity.microsoft.com → Settings → Overview). Loads only after consent.
  if (!GTM_ID && !GA_ID) return;
  const KEY = 'jnpr-consent', es = (document.documentElement.lang || '').startsWith('es');
  let on = false;
  const load = () => {
    if (on) return; on = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    const s = document.createElement('script'); s.async = true;
    if (GTM_ID) { dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' }); s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID; }
    else { gtag('config', GA_ID); s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; }
    document.head.appendChild(s);
    if (CLARITY_ID) { (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, 'clarity', 'script', CLARITY_ID); }
  };
  const track = (name, params) => { if (!on) return; if (GTM_ID) dataLayer.push(Object.assign({ event: name }, params || {})); else if (window.gtag) gtag('event', name, params || {}); };
  window.jnprTrack = track;

  // Clicks worth knowing about
  document.addEventListener('click', e => {
    const a = e.target.closest('a, button'); if (!a) return;
    const t = (a.textContent || '').trim().slice(0, 40), h = a.getAttribute('href') || '';
    if (/(^|\/)(work|portafolio)\/?$/.test(h)) track('portfolio_click', { label: t, page: location.pathname });
    else if (a.matches('.chromecta, .cta, .go') || /hire=web|Hire me|Contrátame|Quiero mi web|La quiero|Hablemos|Get your site|Consigue tu web/i.test(t + h)) track('cta_click', { label: t, page: location.pathname });
    else if (/\.pdf$/i.test(h)) track('cv_download', { label: t });
    else if (/linkedin\.com/i.test(h)) track('linkedin_click');
    else if (/^https?:/i.test(h) && !h.includes(location.host)) track('outbound_click', { url: h });
    else if (a.classList.contains('lang-sw')) track('language_switch', { to: t });
  }, true);
  // Did they reach the projects section on the home? (once per visit)
  const wk = document.getElementById('work');
  if (wk && 'IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting) && on) { track('projects_seen', { page: location.pathname }); io.disconnect(); } }, { threshold: .25 }); io.observe(wk); }
  // Form sent (the contact sheet shows .done when it succeeds)
  const done = document.querySelector('#sheet .done');
  if (done) new MutationObserver(() => { if (!done.hidden) track('form_sent', { page: location.pathname }); }).observe(done, { attributes: true, attributeFilter: ['hidden'] });

  let saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  window.jnprCookies = () => { document.querySelector('.cookie-note')?.remove(); note(); }; // 11/11: footer link reopens the choice
  if (saved === 'yes') load();
  if (saved) return;
  note();
  function note() {

  const b = document.createElement('div');
  b.className = 'cookie-note'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', es ? 'Cookies' : 'Cookies');
  b.innerHTML = `<div class="ck-h"><img src="/img/ast/chrome.webp" alt="" width="30" height="30"><b>${es ? '¿Cookies?' : 'Cookies?'}</b></div><p>${es ? 'Solo para analítica.' : 'Only for analytics.'}</p>
    <div class="ck-b"><button type="button" data-c="no">${es ? 'No' : 'No'}</button><button type="button" data-c="yes">${es ? 'Aceptar' : 'Accept'}</button></div>`;
  const st = document.createElement('style');
  // 16/11: compact one-line bar, bottom right, so it never covers the projects or the portfolio button
  st.textContent = `.cookie-note{position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;align-items:center;gap:14px;background:#FCFCFC;color:#222;border-radius:99px;padding:8px 8px 8px 12px;box-shadow:0 30px 60px -30px rgb(0 0 0/.35),0 6px 18px rgb(0 0 0/.08);font:13px/1.2 'MN',system-ui,sans-serif;white-space:nowrap}
.cookie-note .ck-h{display:flex;align-items:center;gap:8px;margin:0;padding:0;min-height:0;position:static;background:none}.cookie-note .ck-h img{width:24px;height:auto;animation:ck-spin 9s linear infinite;filter:drop-shadow(0 3px 5px rgb(0 0 0/.22))}.cookie-note .ck-h b{font-family:'MW',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;font-size:12px;color:#F12009;font-weight:400}@keyframes ck-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.cookie-note .ck-h img{animation:none}}.cookie-note{animation:ck-in .5s cubic-bezier(.2,1.4,.4,1) both}@keyframes ck-in{from{opacity:0;transform:translateY(16px) scale(.96)}}.cookie-note p{margin:0}.cookie-note .ck-b{display:flex;gap:6px}
.cookie-note button{all:unset;cursor:pointer;font-family:'MW',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:10px;padding:10px 15px;border-radius:99px;background:#F12009;color:#FCFCFC}
.cookie-note button[data-c="no"]{background:#FCFCFC;color:#F12009;box-shadow:inset 0 0 0 1.5px #F12009}
.cookie-note button:focus-visible{outline:2px solid #F12009;outline-offset:2px}
@media (max-width:520px){.cookie-note{right:12px;bottom:12px;left:auto}.cookie-note p{display:none}}
@media (min-width:1024px){.cookie-note{flex-direction:column;align-items:stretch;white-space:normal;width:200px;border-radius:24px;padding:16px;gap:10px;text-align:center}.cookie-note .ck-h{justify-content:center}.cookie-note p{margin:0}.cookie-note .ck-b{display:flex;gap:8px}.cookie-note .ck-b button{flex:1;text-align:center}}
@media (min-width:1024px) and (max-width:1120px){body.cookie-open .story>*{padding-right:72px}}`; // 28/11: on desktop a narrow card that fits in the right margin, clear of the text
  st.textContent += `body.cookie-open{padding-bottom:calc(var(--cookie-h,56px) + 32px)}body.cookie-open .chromecta{bottom:calc(var(--cookie-h,56px) + 28px)!important}`; // 28/11: page ends clear of the bar; the floating Hire me sits above it
  document.head.appendChild(st); document.body.appendChild(b);
  const fit = () => document.body.style.setProperty('--cookie-h', b.offsetHeight + 'px'); fit(); addEventListener('resize', fit);
  document.body.classList.add('cookie-open');
  b.addEventListener('click', e => {
    const c = e.target.closest('button'); if (!c) return;
    try { localStorage.setItem(KEY, c.dataset.c); } catch (err) {}
    if (c.dataset.c === 'yes') load();
    else document.cookie.split(';').map(x => x.split('=')[0].trim()).filter(n => /^(_ga|_clck|_clsk)/.test(n)).forEach(n => { ['', '; domain=' + location.hostname.replace(/^www\./, ''), '; domain=.' + location.hostname.replace(/^www\./, '')].forEach(d => { document.cookie = n + '=; Max-Age=0; path=/' + d; }); }); // 11/11: declining removes Analytics cookies
    b.remove(); document.body.classList.remove('cookie-open'); removeEventListener('resize', fit);
  });
  }
})();
