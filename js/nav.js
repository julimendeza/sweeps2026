// ── Top navigation bar ───────────────────────────────────────────────
function Nav(p) {
  var ctx    = useLang();
  var t      = ctx.t;
  var lang   = ctx.lang;
  var setLang = ctx.setLang;
  var view   = p.view;
  var setView = p.setView;

  var navItems = [
    { id: "predict",     l: t.predict  },
    { id: "leaderboard", l: t.table    },
    { id: "bracket",     l: t.bracket  },
    { id: "admin",       l: t.admin    }
  ];

  return html`<nav style=${{
    position:"sticky", top:0, zIndex:100,
    background:"rgba(8,15,28,.95)", backdropFilter:"blur(14px)",
    borderBottom:"1px solid rgba(255,255,255,.07)"
  }}>
    <div style=${{ maxWidth:780, margin:"0 auto", display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"0 16px", height:52 }}>


      <button onClick=${function(){ setView("home"); }} className="bb" style=${{
        background:"none", border:"none", color:"#f59e0b", fontSize:18, cursor:"pointer"
      }}>\u26bd Quiniela 2026</button>


      <div style=${{ display:"flex", gap:3, alignItems:"center" }}>
        ${navItems.map(function(x) {
          return html`<button key=${x.id} onClick=${function(){ setView(x.id); }} style=${{
            padding:"5px 10px", borderRadius:7, fontSize:12, fontWeight:600,
            cursor:"pointer", border:"none", transition:"all .15s",
            background: view===x.id ? "#f59e0b" : "transparent",
            color:      view===x.id ? "#000" : "rgba(255,255,255,.6)",
            fontFamily: "'DM Sans',sans-serif"
          }}>${x.l}</button>`;
        })}


        <button onClick=${function(){ setLang(lang === "en" ? "es" : "en"); }} style=${{
          padding:"4px 10px", borderRadius:7, fontSize:12, fontWeight:700,
          cursor:"pointer", border:"1.5px solid rgba(255,255,255,.15)",
          background:"rgba(255,255,255,.07)", color:"rgba(255,255,255,.7)",
          fontFamily:"'DM Sans',sans-serif", marginLeft:4,
          display:"flex", alignItems:"center", gap:6
        }}>
          <img src=${"https://flagcdn.com/20x15/"+(lang==="en"?"gb":"es")+".png"} width="20" height="15"
            style=${{borderRadius:2,border:"1px solid rgba(255,255,255,.15)",verticalAlign:"middle"}}/>
          ${lang === "en" ? "EN" : "ES"}
        </button>
      </div>
    </div>
  </nav>`;
}
