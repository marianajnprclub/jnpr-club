/* Registro de estados de la web. Cada flujo declara sus estados y transiciones aquí.
   El estado actual se ve en <html data-case="open" …> y en clubState.snapshot().
   Nunca lanza errores: una transición no declarada se aplica igual y queda en clubState.invalid. Mapa completo: STATE-MACHINES.md, fuera de este repositorio */
(() => {
  const MACHINES = {
    entry:    { intro: ['started'], started: [] },
    hero:     { idle: ['swapping'], swapping: ['idle'] },
    case:     { closed: ['opening'], opening: ['open', 'closed'], open: ['closed'] },
    cassette: { pending: ['loading', 'idle', 'ejecting'], loading: ['idle', 'pending', 'ejecting'], idle: ['ejecting', 'pending', 'loading'], ejecting: ['loading', 'idle', 'pending'] },
    motion:   { away: ['playing', 'paused', 'blocked'], playing: ['away', 'paused', 'blocked'], paused: ['playing', 'away', 'blocked'], blocked: ['playing', 'paused', 'away'] },
    labs:     { away: ['showing', 'blocked'], showing: ['away', 'blocked'], blocked: ['showing', 'away'] },
    sound:    { locked: ['on', 'muted'], on: ['muted', 'locked'], muted: ['on', 'locked'] },
  };
  const INITIAL = { entry: 'intro', hero: 'idle', case: 'closed', cassette: 'pending', motion: 'away', labs: 'away', sound: 'locked' };
  const debug = new URLSearchParams(location.search).has('debug-state');
  const state = { ...INITIAL }, listeners = {}, invalid = [], root = document.documentElement;
  Object.entries(state).forEach(([k, v]) => { root.dataset[k] = v; });
  window.clubState = {
    get: name => state[name],
    set(name, next) {
      const prev = state[name]; if (prev === next || !(name in MACHINES)) return;
      if (!MACHINES[name][prev]?.includes(next)) { invalid.push(`${name}: ${prev} → ${next}`); if (debug) console.warn('[state] transición no declarada', name, prev, '→', next); }
      else if (debug) console.log('[state]', name, prev, '→', next);
      state[name] = next; root.dataset[name] = next;
      (listeners[name] || []).forEach(fn => { try { fn(next, prev); } catch (error) { console.error(error); } });
    },
    subscribe(name, fn) { (listeners[name] ||= []).push(fn); return () => { listeners[name] = listeners[name].filter(f => f !== fn); }; },
    snapshot: () => ({ ...state }),
    machines: MACHINES,
    invalid,
  };
})();
