// ── React hooks (globals) ───────────────────────────────────────────
var useState    = React.useState;
var useEffect   = React.useEffect;
var useMemo     = React.useMemo;
var useContext  = React.useContext;
var createContext = React.createContext;

// ── htm binding ─────────────────────────────────────────────────────
var html = htm.bind(React.createElement);

// ── localStorage-backed storage API ─────────────────────────────────
window.storage = {
  get: async function(k) {
    try { var v = localStorage.getItem(k); return v ? { key: k, value: v } : null; }
    catch(e) { return null; }
  },
  set: async function(k, v) {
    try { localStorage.setItem(k, v); return { key: k, value: v }; }
    catch(e) { return null; }
  }
};

// ── Storage helpers (used by all views) ─────────────────────────────
var db = {
  get: async function(k) {
    try {
      var d = await window.storage.get(k);
      return d ? JSON.parse(d.value) : null;
    } catch(e) { return null; }
  },
  set: async function(k, v) {
    try { await window.storage.set(k, JSON.stringify(v)); }
    catch(e) {}
  }
};

// ── Language context ─────────────────────────────────────────────────
var LangCtx = createContext({ lang: 'es', t: {}, setLang: function(){} });
function useLang() { return useContext(LangCtx); }
