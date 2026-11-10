/* Google Analytics 4 with a cookie notice (Spain: analytics cookies need consent).
   Nothing loads until the visitor accepts. Paste the Measurement ID below to switch it on. */
(() => {
  const GTM_ID = 'GTM-M5ZQJSB9'; // Google Tag Manager container (GA4 tag lives inside it)
  const GA_ID = ''; // optional: direct GA4 'G-XXXXXXXXXX' if not using Tag Manager
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
  b.innerHTML = `<p>${es ? 'Uso cookies de Google Analytics para saber qué se visita y mejorar la web. Solo si aceptas.' : 'I use Google Analytics cookies to see what gets visited and improve the site. Only if you accept.'}</p>
    <div><button type="button" data-c="no">${es ? 'Rechazar' : 'Decline'}</button><button type="button" data-c="yes">${es ? 'Aceptar' : 'Accept'}</button></div>`;
  const st = document.createElement('style');
  st.textContent = `.cookie-note{position:fixed;left:16px;bottom:16px;z-index:9999;max-width:min(420px,calc(100vw - 32px));background:#FCFCFC;color:#1F1140;border-radius:22px;padding:18px 20px;box-shadow:0 30px 60px -30px rgb(31 17 64/.5),0 6px 18px rgb(31 17 64/.12);font:14px/1.45 'MN',system-ui,sans-serif}
.cookie-note p{margin:0 0 14px}.cookie-note div{display:flex;gap:10px}
.cookie-note button{all:unset;cursor:pointer;font-family:'MW',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:11px;padding:12px 18px;border-radius:99px;background:#F12009;color:#FCFCFC}
.cookie-note button[data-c="no"]{background:#1F1140}
.cookie-note button:focus-visible{outline:2px solid #1F1140;outline-offset:2px}`;
  document.head.appendChild(st); document.body.appendChild(b);
  b.addEventListener('click', e => {
    const c = e.target.closest('button'); if (!c) return;
    try { localStorage.setItem(KEY, c.dataset.c); } catch (err) {}
    if (c.dataset.c === 'yes') load();
    b.remove();
  });
})();
