// ── Primitive components ─────────────────────────────────────────────

var btnBase = {
  borderRadius: 10, fontWeight: 600, fontSize: 14,
  transition: "all .15s", border: "none",
  display: "inline-flex", alignItems: "center",
  justifyContent: "center", gap: 6,
  fontFamily: "'DM Sans', sans-serif"
};
var btnVariants = {
  primary:   { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000" },
  secondary: { background: "rgba(255,255,255,.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,.12)" },
  ghost:     { background: "none", color: "rgba(255,255,255,.5)" }
};

function Btn(p) {
  var v = p.v || "primary";
  var s = Object.assign({}, btnBase, btnVariants[v], {
    padding:  (p.sx && p.sx.padding)  || "10px 20px",
    fontSize: (p.sx && p.sx.fontSize) || 14,
    flex:     (p.sx && p.sx.flex),
    width:    p.full ? "100%" : "auto",
    cursor:   p.disabled ? "not-allowed" : "pointer",
    opacity:  p.disabled ? 0.45 : 1
  }, p.sx || {});
  return html`<button onClick=${p.disabled ? undefined : p.onClick} style=${s}>${p.children}</button>`;
}

function Card(p) {
  return html`<div style=${{ background:"rgba(255,255,255,.04)", border:"1.5px solid rgba(255,255,255,.08)", borderRadius:16, padding:20, ...(p.sx||{}) }}>${p.children}</div>`;
}

function Field(p) {
  return html`<div style=${{ marginBottom:16 }}>
    <label style=${{ fontSize:13, color:"rgba(255,255,255,.6)", display:"block", marginBottom:6 }}>${p.label}</label>
    ${p.children}
  </div>`;
}

function PBar(p) {
  return html`<div style=${{ background:"rgba(255,255,255,.08)", borderRadius:99, height:5, overflow:"hidden" }}>
    <div style=${{ height:5, borderRadius:99, background:"linear-gradient(90deg,#f59e0b,#d97706)", transition:"width .3s", width: Math.min(100, (p.v/p.max)*100) + "%" }}/>
  </div>`;
}

function SI(p) {
  return html`<input
    type="number" min="0" max="20" className="si"
    value=${p.val || ""}
    onChange=${function(e){ p.onChange(e.target.value.replace(/\D/g,"").slice(0,2)); }}
    placeholder="?"/>`;
}

// ── Match score row ──────────────────────────────────────────────────
function MRow(p) {
  var res = p.res, hv = p.hv || "", av = p.av || "";
  var st  = (res && res.h !== "") ? mSt({ h:hv, a:av }, res) : null;
  var bg  = st==="exact"  ? "rgba(34,197,94,.12)"  :
            st==="result" ? "rgba(245,158,11,.1)"  :
            st==="partial"? "rgba(59,130,246,.08)" : "rgba(255,255,255,.04)";
  var bd  = st==="exact"  ? "rgba(34,197,94,.35)"  :
            st==="result" ? "rgba(245,158,11,.25)" :
            st==="partial"? "rgba(59,130,246,.2)"  : "rgba(255,255,255,.09)";
  var pts = st ? scoreMatch({ h:hv, a:av }, res) : null;

  return html`<div style=${{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:12, border:"1.5px solid "+bd, marginBottom:5, background:bg, transition:"all .15s" }}>
    <span style=${{ flex:1, textAlign:"right", fontSize:12, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>${fl(p.match.home)} ${p.match.home}</span>
    <div style=${{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
      <${SI} val=${hv} onChange=${p.onH}/>
      <span style=${{ color:"rgba(255,255,255,.2)", fontSize:10 }}>—</span>
      <${SI} val=${av} onChange=${p.onA}/>
    </div>
    <span style=${{ flex:1, textAlign:"left", fontSize:12, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>${p.match.away} ${fl(p.match.away)}</span>
    ${pts !== null && html`<span style=${{ fontSize:11, fontWeight:700, flexShrink:0, minWidth:28, textAlign:"right",
      color: pts>=6?"#4ade80":pts>=3?"#fbbf24":pts>0?"#60a5fa":"rgba(255,255,255,.2)" }}>
      ${pts > 0 ? "+" + pts : (pts === 0 && hv !== "" ? "0" : "")}
    </span>`}
  </div>`;
}

// ── Live group standings table ───────────────────────────────────────
function StandingsTable(p) {
  var t    = useLang().t;
  var st   = calcStandings(p.preds || {}, p.group);
  var done = groupDone(p.preds || {}, p.group);

  return html`<div style=${{ marginTop:12, padding:"10px 12px", background:"rgba(255,255,255,.03)", borderRadius:12, border:"1px solid rgba(255,255,255,.07)" }}>
    <div style=${{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
      <span style=${{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.3)", letterSpacing:".08em" }}>${t.standingsLabel} ${p.group}</span>
      <span style=${{ fontSize:10, color: done ? "rgba(74,222,128,.7)" : "rgba(245,158,11,.6)" }}>${done ? "\u2713 " + t.qualifyDirect : "* projected"}</span>
    </div>
    <div style=${{ display:"grid", gridTemplateColumns:"14px 1fr 22px 22px 22px 22px 42px 26px 28px", gap:2, fontSize:10, color:"rgba(255,255,255,.25)", marginBottom:4, padding:"0 2px" }}>
      <span/><span/>
      <span style=${{ textAlign:"center" }}>P</span>
      <span style=${{ textAlign:"center" }}>W</span>
      <span style=${{ textAlign:"center" }}>D</span>
      <span style=${{ textAlign:"center" }}>L</span>
      <span style=${{ textAlign:"center" }}>GF:GA</span>
      <span style=${{ textAlign:"center" }}>GD</span>
      <span style=${{ textAlign:"center", fontWeight:700 }}>Pts</span>
    </div>
    ${st.map(function(r, i) {
      return html`<div key=${r.team} style=${{
        display:"grid", gridTemplateColumns:"14px 1fr 22px 22px 22px 22px 42px 26px 28px",
        gap:2, padding:"3px 2px", borderRadius:6, marginBottom:2,
        background: i < 2 ? "rgba(74,222,128,.07)" : i === 2 ? "rgba(245,158,11,.05)" : "transparent",
        border: i < 2 ? "1px solid rgba(74,222,128,.1)" : i === 2 ? "1px solid rgba(245,158,11,.08)" : "1px solid transparent"
      }}>
        <span style=${{ fontSize:9, color:"rgba(255,255,255,.28)", alignSelf:"center" }}>${i+1}</span>
        <span style=${{ fontSize:11, fontWeight:i<2?600:400, color:i<2?"rgba(255,255,255,.85)":"rgba(255,255,255,.45)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>${fl(r.team)} ${r.team}</span>
        ${[r.mp, r.w, r.d, r.l].map(function(v, k) {
          return html`<span key=${k} style=${{ textAlign:"center", color:"rgba(255,255,255,.35)", fontSize:11 }}>${v}</span>`;
        })}
        <span style=${{ textAlign:"center", color:"rgba(255,255,255,.35)", fontSize:11 }}>${r.gf}:${r.ga}</span>
        <span style=${{ textAlign:"center", fontSize:11, color: r.gd>0?"#4ade80":r.gd<0?"#f87171":"rgba(255,255,255,.35)" }}>${r.gd > 0 ? "+" : ""}${r.gd}</span>
        <span style=${{ textAlign:"center", fontWeight:700, fontSize:12, color: i<2?"#4ade80":i===2?"#fbbf24":"rgba(255,255,255,.4)" }}>${r.pts}</span>
      </div>`;
    })}
    <div style=${{ marginTop:5, fontSize:9, color:"rgba(255,255,255,.2)" }}>\ud83d\udfe2 ${t.qualifyDirect} \u00b7 \ud83d\udfe1 ${t.best3rd}</div>
  </div>`;
}

// ── Group tab row ────────────────────────────────────────────────────
function GroupTabs(p) {
  return html`<div style=${{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
    ${GROUPS.map(function(g) {
      var done = groupDone(p.isResult ? (p.preds && p.preds.groups || {}) : (p.preds || {}), g);
      return html`<button key=${g} onClick=${function(){ p.onChange(g); }} style=${{
        padding:"4px 9px", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer",
        border: "1.5px solid " + (p.active===g ? "#f59e0b" : done ? "rgba(74,222,128,.3)" : "rgba(255,255,255,.1)"),
        background: p.active===g ? "#f59e0b" : done ? "rgba(74,222,128,.08)" : "transparent",
        color: p.active===g ? "#000" : done ? "#4ade80" : "rgba(255,255,255,.5)",
        fontFamily:"'DM Sans',sans-serif"
      }}>${g}${done && p.active !== g ? " \u2713" : ""}</button>`;
    })}
  </div>`;
}

// ── Multi-team chip picker ───────────────────────────────────────────
function MultiPick(p) {
  var t = useLang().t;
  var options = p.options, selected = p.selected, pick = p.pick, results = p.results;
  var hasR = results && results.length > 0;

  function toggle(team) {
    if (selected.indexOf(team) >= 0) p.onChange(selected.filter(function(x){ return x !== team; }));
    else if (selected.length < pick) p.onChange(selected.concat([team]));
  }

  // Group the available options by group
  var grouped = GROUPS.reduce(function(acc, g) {
    var inn = TBG[g].filter(function(t2){ return options.indexOf(t2) >= 0; });
    if (inn.length) acc[g] = inn;
    return acc;
  }, {});

  return html`<div>
    <div style=${{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
      <span style=${{ fontSize:13, color:"rgba(255,255,255,.4)" }}>${t.select} ${pick} ${t.teams}</span>
      <span style=${{ fontSize:13, fontWeight:700, color: selected.length===pick ? "#4ade80" : selected.length>0 ? "#f59e0b" : "rgba(255,255,255,.3)" }}>
        ${selected.length}/${pick}${selected.length === pick ? " \u2713" : ""}
      </span>
    </div>
    ${Object.entries(grouped).map(function(kv) {
      var g = kv[0], ts = kv[1];
      return html`<div key=${g} style=${{ marginBottom:10 }}>
        <div style=${{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.22)", marginBottom:5, letterSpacing:".08em" }}>GROUP ${g}</div>
        <div style=${{ display:"flex", flexWrap:"wrap", gap:5 }}>
          ${ts.map(function(team) {
            var isOn = selected.indexOf(team) >= 0;
            var cls  = "chip " + (hasR ? (isOn && results.indexOf(team)>=0 ? "c-hit" : isOn ? "c-miss" : "c-off") : (isOn ? "c-on" : "c-off"));
            return html`<span key=${team} className=${cls} onClick=${function(){ toggle(team); }}>${fl(team)} ${team}</span>`;
          })}
        </div>
      </div>`;
    })}
  </div>`;
}

// ── Single-team chip picker ──────────────────────────────────────────
function SinglePick(p) {
  var options = p.options, selected = p.selected, results = p.results;
  var hasR = results !== undefined && results !== "";

  var grouped = GROUPS.reduce(function(acc, g) {
    var inn = TBG[g].filter(function(t){ return options.indexOf(t) >= 0; });
    if (inn.length) acc[g] = inn;
    return acc;
  }, {});

  return html`<div>
    ${Object.entries(grouped).map(function(kv) {
      var g = kv[0], ts = kv[1];
      return html`<div key=${g} style=${{ marginBottom:10 }}>
        <div style=${{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.22)", marginBottom:5, letterSpacing:".08em" }}>GROUP ${g}</div>
        <div style=${{ display:"flex", flexWrap:"wrap", gap:5 }}>
          ${ts.map(function(team) {
            var isOn = selected === team;
            var cls  = "chip " + (hasR ? (isOn && results===team ? "c-hit" : isOn ? "c-miss" : "c-off") : (isOn ? "c-on" : "c-off"));
            return html`<span key=${team} className=${cls} onClick=${function(){ p.onChange(isOn ? "" : team); }}>${fl(team)} ${team}</span>`;
          })}
        </div>
      </div>`;
    })}
  </div>`;
}

// ── Bracket team pill ────────────────────────────────────────────────
function BracketPill(p) {
  // status: "advances" | "eliminated" | "champion" | "pending"
  var s   = p.status || "pending";
  var bg  = s==="advances"  ? "rgba(74,222,128,.12)"   :
            s==="champion"  ? "rgba(245,158,11,.18)"   :
            s==="eliminated"? "rgba(255,255,255,.02)"  : "rgba(255,255,255,.06)";
  var bd  = s==="advances"  ? "rgba(74,222,128,.35)"   :
            s==="champion"  ? "rgba(245,158,11,.5)"    :
            s==="eliminated"? "rgba(255,255,255,.06)"  : "rgba(255,255,255,.12)";
  var col = s==="advances"  ? "#4ade80"                :
            s==="champion"  ? "#fbbf24"                :
            s==="eliminated"? "rgba(255,255,255,.2)"   : "rgba(255,255,255,.75)";

  return html`<div style=${{
    display:"flex", alignItems:"center", gap:6,
    padding:"5px 9px", borderRadius:8,
    background:bg, border:"1px solid "+bd,
    minWidth:148, height:30, transition:"all .2s",
    opacity: s==="eliminated" ? 0.5 : 1
  }}>
    <span style=${{ fontSize:13 }}>${fl(p.team)}</span>
    <span style=${{ fontSize:11, fontWeight:600, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:col }}>${p.team}</span>
    ${s==="advances"   && html`<span style=${{ fontSize:9, color:"#4ade80", flexShrink:0 }}>\u25b6</span>`}
    ${s==="champion"   && html`<span style=${{ fontSize:11, flexShrink:0 }}>\u2605</span>`}
    ${s==="eliminated" && html`<span style=${{ fontSize:9, color:"rgba(255,255,255,.2)", flexShrink:0 }}>\u2022</span>`}
  </div>`;
}

// ── Flow bracket visualizer ──────────────────────────────────────────
// Shows each round as a column. Teams that advance to the next round
// are highlighted. No pairing — we don't have fixture data.
function BracketView(p) {
  var t     = useLang().t;
  var preds = p.preds;
  if (!preds) return html`<div style=${{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,.3)" }}>${t.bracketNoPreds}</div>`;

  var r32 = preds.r32   || [];
  var r16 = preds.r16   || [];
  var qf  = preds.qf    || [];
  var sf  = preds.sf    || [];
  var fin = preds.final || [];
  var ch  = preds.champion || "";
  var thirdWin = preds.thirdWin || "";
  var thirds   = sf.filter(function(x){ return fin.indexOf(x) < 0; });

  // Rounds to display: [id, label, teams, nextRoundTeams]
  var PILL_H = 34;  // height of each pill + gap
  var COL_W  = 176;
  var GAP    = 4;

  var rounds = [
    { id:"r32",   label:t.r32,   teams:r32, next:r16 },
    { id:"r16",   label:t.r16,   teams:r16, next:qf  },
    { id:"qf",    label:t.qf,    teams:qf,  next:sf  },
    { id:"sf",    label:t.sf,    teams:sf,  next:fin },
    { id:"final", label:t.final, teams:fin, next: ch ? [ch] : [] }
  ];

  // For a team in round N, compute its vertical center position in pixels
  // so we can draw a connecting line to its position in round N+1
  function teamPos(teams, team) {
    var idx = teams.indexOf(team);
    if (idx < 0) return null;
    return idx * (PILL_H + GAP) + PILL_H / 2;
  }

  return html`<div>
    <div className="bscroll" style=${{ paddingTop:8 }}>
      <div style=${{ display:"flex", gap:0, alignItems:"flex-start",
        minWidth: rounds.length * (COL_W + 28) + 220 }}>

        ${rounds.map(function(rd, ri) {
          var nextRd = rounds[ri + 1];

          return html`<div key=${rd.id} style=${{ display:"flex", flexDirection:"column", alignItems:"center",
            width: COL_W + 28, flexShrink:0 }}>

            <!-- Column label -->
            <div style=${{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.35)",
              letterSpacing:".08em", marginBottom:10, textAlign:"center", whiteSpace:"nowrap" }}>
              ${rd.label}
              <span style=${{ color:"rgba(255,255,255,.2)", fontWeight:400 }}> (${rd.teams.length})</span>
            </div>

            <!-- Teams + connectors wrapper -->
            <div style=${{ position:"relative", width:"100%" }}>
              <!-- Team pills -->
              <div style=${{ display:"flex", flexDirection:"column", gap:GAP+"px" }}>
                ${rd.teams.map(function(team) {
                  var inNext    = rd.next.indexOf(team) >= 0;
                  var isChamp   = ri === rounds.length - 1 && team === ch;
                  var status    = isChamp ? "champion" : inNext ? "advances" : ri < rounds.length - 1 ? "eliminated" : "pending";
                  return html`<${BracketPill} key=${team} team=${team} status=${status}/>`;
                })}
              </div>

              <!-- Connector lines to next round -->
              ${nextRd && html`<svg style=${{
                position:"absolute", top:0, left: COL_W + "px",
                width:"28px",
                height: rd.teams.length * (PILL_H + GAP) + "px",
                overflow:"visible", pointerEvents:"none"
              }}>
                ${rd.teams.filter(function(team){ return rd.next.indexOf(team) >= 0; }).map(function(team) {
                  var y1 = teamPos(rd.teams, team);
                  var y2 = teamPos(nextRd.teams, team);
                  if (y1 === null || y2 === null) return null;
                  // Bezier curve from right edge of this column to left edge of next
                  var d = "M 0 "+y1+" C 14 "+y1+" 14 "+y2+" 28 "+y2;
                  return html`<path key=${team} d=${d} fill="none"
                    stroke="rgba(74,222,128,.35)" strokeWidth="1.5" strokeDasharray="none"/>`;
                })}
              </svg>`}
            </div>
          </div>`;
        })}

        <!-- Champion + 3rd place column -->
        <div style=${{ display:"flex", flexDirection:"column", alignItems:"center", width:185, paddingLeft:28, flexShrink:0 }}>
          <!-- Champion -->
          <div style=${{ fontSize:10, fontWeight:700, color:"rgba(245,158,11,.6)", letterSpacing:".08em", marginBottom:10 }}>
            \ud83e\udd47 ${t.champion}
          </div>
          <div style=${{ padding:"12px 14px", borderRadius:14, minWidth:162, textAlign:"center",
            background: ch ? "rgba(245,158,11,.15)" : "rgba(255,255,255,.04)",
            border: "2px solid " + (ch ? "rgba(245,158,11,.5)" : "rgba(255,255,255,.1)"),
            marginBottom:28 }}>
            ${ch
              ? html`<div style=${{ fontSize:30, marginBottom:4 }}>${fl(ch)}</div>
                     <div style=${{ fontWeight:700, color:"#fbbf24", fontSize:14 }}>${ch}</div>`
              : html`<div style=${{ fontSize:13, color:"rgba(255,255,255,.3)", fontStyle:"italic", padding:"8px 0" }}>TBD</div>`
            }
          </div>

          <!-- 3rd place -->
          ${thirds.length > 0 && html`<div>
            <div style=${{ fontSize:10, fontWeight:700, color:"rgba(180,83,9,.8)", letterSpacing:".08em", marginBottom:8 }}>
              \ud83e\udd49 3rd Place
            </div>
            ${thirds.slice(0,2).map(function(t3){
              var isWin = t3 === thirdWin;
              return html`<div key=${t3} style=${{ display:"flex", alignItems:"center", gap:6,
                padding:"5px 9px", borderRadius:8, minWidth:148, marginBottom:4,
                background: isWin ? "rgba(180,83,9,.18)" : "rgba(255,255,255,.04)",
                border: "1px solid " + (isWin ? "rgba(180,83,9,.5)" : "rgba(255,255,255,.1)") }}>
                <span style=${{ fontSize:13 }}>${fl(t3)}</span>
                <span style=${{ fontSize:11, fontWeight:500, color: isWin ? "#fb923c" : "rgba(255,255,255,.6)", flex:1 }}>${t3}</span>
                ${isWin && html`<span style=${{ fontSize:10, color:"#fb923c" }}>\u2605</span>`}
              </div>`;
            })}
          </div>`}
        </div>

      </div>
    </div>

    <!-- Legend -->
    <div style=${{ display:"flex", gap:16, justifyContent:"center", marginTop:14, flexWrap:"wrap" }}>
      ${[
        { col:"#4ade80", bd:"rgba(74,222,128,.35)", label:"\u25b6 Advances to next round" },
        { col:"rgba(255,255,255,.2)", bd:"rgba(255,255,255,.06)", label:"\u2022 Eliminated" },
        { col:"#fbbf24", bd:"rgba(245,158,11,.5)", label:"\u2605 Champion" }
      ].map(function(leg){
        return html`<div key=${leg.label} style=${{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"rgba(255,255,255,.4)" }}>
          <div style=${{ width:10, height:10, borderRadius:3, background:leg.col, border:"1px solid "+leg.bd }}/>
          ${leg.label}
        </div>`;
      })}
    </div>
    <p style=${{ fontSize:11, color:"rgba(255,255,255,.25)", marginTop:6, textAlign:"center" }}>${t.bracketSub}</p>
  </div>`;
}

