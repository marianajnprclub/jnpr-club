/* Google Analytics 4 with a cookie notice (Spain: analytics cookies need consent).
   Nothing loads until the visitor accepts. Paste the Measurement ID below to switch it on. */
(() => {
  const GTM_ID = ''; // optional: Tag Manager container (GTM-M5ZQJSB9 not found in her accounts)
  const GA_ID = 'G-1FST6VRM2T'; // GA4 stream "JNPR Club web"
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
  };
  const track = (name, params) => { if (!on) return; if (GTM_ID) dataLayer.push(Object.assign({ event: name }, params || {})); else if (window.gtag) gtag('event', name, params || {}); };
  window.jnprTrack = track;

  // Clicks worth knowing about
  document.addEventListener('click', e => {
    const a = e.target.closest('a, button'); if (!a) return;
    const t = (a.textContent || '').trim().slice(0, 40), h = a.getAttribute('href') || '';
    if (a.matches('.chromecta, .cta, .go') || /hire=web|Hire me|Contrátame|Quiero mi web|La quiero|Hablemos|Get your site|Consigue tu web/i.test(t + h)) track('cta_click', { label: t, page: location.pathname });
    else if (/\.pdf$/i.test(h)) track('cv_download', { label: t });
    else if (/linkedin\.com/i.test(h)) track('linkedin_click');
    else if (/^https?:/i.test(h) && !h.includes(location.host)) track('outbound_click', { url: h });
    else if (a.classList.contains('lang-sw')) track('language_switch', { to: t });
  }, true);
  // Form sent (the contact sheet shows .done when it succeeds)
  const done = document.querySelector('#sheet .done');
  if (done) new MutationObserver(() => { if (!done.hidden) track('form_sent', { page: location.pathname }); }).observe(done, { attributes: true, attributeFilter: ['hidden'] });

  let saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'yes') { load(); return; }
  if (saved === 'no') return;

  const b = document.createElement('div');
  b.className = 'cookie-note'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', es ? 'Cookies' : 'Cookies');
  b.innerHTML = `<header><img src="/img/ast/chrome.webp" alt="" width="30" height="30"><b>${es ? '¿Galletas?' : 'Cookies?'}</b></header><p>${es ? 'Uso cookies de Google Analytics para saber qué se visita y mejorar la web. Solo si aceptas.' : 'I use Google Analytics cookies to see what gets visited and improve the site. Only if you accept.'}</p>
    <div><button type="button" data-c="no">${es ? 'Rechazar' : 'Decline'}</button><button type="button" data-c="yes">${es ? 'Aceptar' : 'Accept'}</button></div>`;
  const st = document.createElement('style');
  st.textContent = `.cookie-note{position:fixed;left:16px;bottom:16px;z-index:9999;max-width:min(420px,calc(100vw - 32px));background:#FCFCFC;color:#222;border-radius:26px;padding:16px 20px 18px;box-shadow:0 30px 60px -30px rgb(0 0 0/.35),0 6px 18px rgb(0 0 0/.08);font:14px/1.45 'MN',system-ui,sans-serif}
.cookie-note header{display:flex;align-items:center;gap:10px;margin-bottom:8px}.cookie-note header img{width:30px;height:auto;animation:ck-spin 9s linear infinite;filter:drop-shadow(0 3px 5px rgb(0 0 0/.22))}.cookie-note header b{font-family:'MW',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;font-size:15px;color:#F12009;font-weight:400}@keyframes ck-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.cookie-note header img{animation:none}}.cookie-note{animation:ck-in .5s cubic-bezier(.2,1.4,.4,1) both}@keyframes ck-in{from{opacity:0;transform:translateY(16px) scale(.96)}}.cookie-note p{margin:0 0 14px}.cookie-note div{display:flex;gap:10px}
.cookie-note button{all:unset;cursor:pointer;font-family:'MW',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:11px;padding:12px 18px;border-radius:99px;background:#F12009;color:#FCFCFC}
.cookie-note button[data-c="no"]{background:#FCFCFC;color:#F12009;box-shadow:inset 0 0 0 1.5px #F12009}
.cookie-note button:focus-visible{outline:2px solid #F12009;outline-offset:2px}
@media (max-width:760px){.cookie-note{left:12px;right:12px;bottom:12px;max-width:none;border-radius:20px;padding:12px 14px;font-size:12.5px;line-height:1.35;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.cookie-note header{display:none}.cookie-note p{margin:0}.cookie-note div{gap:6px}.cookie-note button{padding:11px 12px;font-size:10px;letter-spacing:.1em}}`;
  document.head.appendChild(st); document.body.appendChild(b);
  b.addEventListener('click', e => {
    const c = e.target.closest('button'); if (!c) return;
    try { localStorage.setItem(KEY, c.dataset.c); } catch (err) {}
    if (c.dataset.c === 'yes') load();
    b.remove();
  });
})();
