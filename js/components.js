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
  var lang=useLang().lang;
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
    <div style=${{ flex:1, display:"flex", alignItems:"center", justifyContent:"flex-end", gap:5, overflow:"hidden" }}>
      <span style=${{ fontSize:12, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>${teamName(p.match.home,lang)}</span>
      <${FlagImg} team=${p.match.home}/>
    </div>
    <div style=${{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
      <${SI} val=${hv} onChange=${p.onH}/>
      <span style=${{ color:"rgba(255,255,255,.2)", fontSize:10 }}>—</span>
      <${SI} val=${av} onChange=${p.onA}/>
    </div>
    <div style=${{ flex:1, display:"flex", alignItems:"center", gap:5, overflow:"hidden" }}>
      <${FlagImg} team=${p.match.away}/>
      <span style=${{ fontSize:12, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>${teamName(p.match.away,lang)}</span>
    </div>
    ${pts !== null && html`<span style=${{ fontSize:11, fontWeight:700, flexShrink:0, minWidth:28, textAlign:"right",
      color: pts>=6?"#4ade80":pts>=3?"#fbbf24":pts>0?"#60a5fa":"rgba(255,255,255,.2)" }}>
      ${pts > 0 ? "+" + pts : (pts === 0 && hv !== "" ? "0" : "")}
    </span>`}
  </div>`;
}

// ── Live group standings table ───────────────────────────────────────
function StandingsTable(p) {
  var lang=useLang().lang;
  var t    = useLang().t;
  var st   = calcStandings(p.preds || {}, p.group);
  var done = groupDone(p.preds || {}, p.group);

  // Work out which 3rd-place teams qualify across all groups
  // allPreds = full groups predictions object (needed to rank all thirds)
  var qualifiedThirds = [];
  if (p.allPreds) {
    var r32info = getR32(p.allPreds);
    qualifiedThirds = r32info.best8.map(function(x){ return x.team; });
  }
  var third = st[2] && st[2].team;
  var thirdQualifies = qualifiedThirds.length > 0
    ? qualifiedThirds.indexOf(third) >= 0
    : null; // null = unknown (not enough groups filled)

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
      // Determine row highlight:
      // pos 1,2 (i=0,1): always green - qualify directly
      // pos 3 (i=2): green if in best8, yellow if unknown, red/dim if not qualifying
      // pos 4 (i=3): never qualifies
      var isTop2   = i < 2;
      var isThird  = i === 2;
      var thirdIn  = isThird && thirdQualifies === true;
      var thirdOut = isThird && thirdQualifies === false;
      var thirdMaybe = isThird && thirdQualifies === null;

      var bg  = isTop2    ? "rgba(74,222,128,.07)"  :
                thirdIn   ? "rgba(74,222,128,.07)"  :
                thirdMaybe? "rgba(245,158,11,.05)"  :
                thirdOut  ? "rgba(255,100,100,.04)" : "transparent";
      var bd  = isTop2    ? "1px solid rgba(74,222,128,.1)"   :
                thirdIn   ? "1px solid rgba(74,222,128,.1)"   :
                thirdMaybe? "1px solid rgba(245,158,11,.08)"  :
                thirdOut  ? "1px solid rgba(255,100,100,.1)"  : "1px solid transparent";
      var nameCol = isTop2||thirdIn ? "rgba(255,255,255,.85)" :
                   thirdMaybe       ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.3)";
      var ptsCol  = isTop2||thirdIn ? "#4ade80"    :
                   thirdMaybe       ? "#fbbf24"    :
                   thirdOut         ? "#f87171"    : "rgba(255,255,255,.3)";

      return html`<div key=${r.team} style=${{
        display:"grid", gridTemplateColumns:"14px 1fr 22px 22px 22px 22px 42px 26px 28px",
        gap:2, padding:"3px 2px", borderRadius:6, marginBottom:2,
        background:bg, border:bd
      }}>
        <span style=${{ fontSize:9, color:"rgba(255,255,255,.28)", alignSelf:"center" }}>${i+1}</span>
        <span style=${{ fontSize:11, fontWeight:i<2?600:400, color:nameCol, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4 }}><${FlagImg} team=${r.team}/> ${teamName(r.team,lang)}</span>
        ${[r.mp, r.w, r.d, r.l].map(function(v, k) {
          return html`<span key=${k} style=${{ textAlign:"center", color:"rgba(255,255,255,.35)", fontSize:11 }}>${v}</span>`;
        })}
        <span style=${{ textAlign:"center", color:"rgba(255,255,255,.35)", fontSize:11 }}>${r.gf}:${r.ga}</span>
        <span style=${{ textAlign:"center", fontSize:11, color: r.gd>0?"#4ade80":r.gd<0?"#f87171":"rgba(255,255,255,.35)" }}>${r.gd > 0 ? "+" : ""}${r.gd}</span>
        <span style=${{ textAlign:"center", fontWeight:700, fontSize:12, color:ptsCol }}>${r.pts}</span>
      </div>`;
    })}
    <div style=${{ marginTop:5, fontSize:9, color:"rgba(255,255,255,.2)" }}>
      \ud83d\udfe2 Top 2 qualify \u00b7
      \ud83d\udfe1 Best 8 third-place qualify \u00b7
      \ud83d\udd34 3rd place eliminated
    </div>
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
  var lang=useLang().lang;
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
            return html`<span key=${team} className=${cls} onClick=${function(){ toggle(team); }} style=${{display:'inline-flex',alignItems:'center',gap:4}}><${FlagImg} team=${team}/> ${teamName(team,lang)}</span>`;
          })}
        </div>
      </div>`;
    })}
  </div>`;
}

// ── Single-team chip picker ──────────────────────────────────────────
function SinglePick(p) {
  var lang=useLang().lang;
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
            return html`<span key=${team} className=${cls} onClick=${function(){ p.onChange(isOn ? "" : team); }} style=${{display:'inline-flex',alignItems:'center',gap:4}}><${FlagImg} team=${team}/> ${teamName(team,lang)}</span>`;
          })}
        </div>
      </div>`;
    })}
  </div>`;
}



// ── Build properly ordered bracket halves ─────────────────────────────
function buildOrderedHalves(r32src, r16src, qfSrc, sfSrc, finSrc, ch) {
  function dd(a){var s={};return(a||[]).filter(function(x){return x&&!s[x]&&(s[x]=1);});}
  var sf=dd(sfSrc), qf=dd(qfSrc), r16=dd(r16src), r32=dd(r32src), fin=dd(finSrc);
  var ru=fin.find(function(t){return t!==ch;})||null;
  var sfL=sf.filter(function(t){return fin.indexOf(t)<0;});
  var qfL=qf.filter(function(t){return sf.indexOf(t)<0;});
  var r16L=r16.filter(function(t){return qf.indexOf(t)<0;});
  var r32L=r32.filter(function(t){return r16.indexOf(t)<0;});
  var lSF=[ch||null,sfL[0]||null];
  var rSF=[ru||null,sfL[1]||null];
  var lQF=[ch||null,qfL[0]||null,sfL[0]||null,qfL[1]||null];
  var rQF=[ru||null,qfL[2]||null,sfL[1]||null,qfL[3]||null];
  function mk8(qfH,lose){var r=[];for(var i=0;i<4;i++){r.push(qfH[i]||null);r.push(lose[i]||null);}return r;}
  function mk16(r16H,oth){var r=[];for(var i=0;i<8;i++){r.push(r16H[i]||null);r.push(oth[i]||null);}return r;}
  var lR16=mk8(lQF,r16L.slice(0,4));
  var rR16=mk8(rQF,r16L.slice(4,8));
  var lR32=mk16(lR16,r32L.slice(0,8));
  var rR32=mk16(rR16,r32L.slice(8,16));
  return {lR32:lR32,lR16:lR16,lQF:lQF,lSF:lSF,rSF:rSF,rQF:rQF,rR16:rR16,rR32:rR32,
          ch:ch,ru:ru,thirds:sfL,fin:fin};
}

// ── Bracket column with inline match scores ───────────────────────────
function BCol(p) {
  var lang=useLang().lang;
  var teams=p.teams, next=p.next||[], H=p.H, PW=p.PW, PH=p.PH, scores=p.scores||{};
  var n=teams.length;
  var slotH=H/n;
  function isAdv(team){return team && next.filter(Boolean).length>0 && next.indexOf(team)>=0;}
  function isElim(team){return team && next.filter(Boolean).length>0 && next.indexOf(team)<0;}

  return html`<div style=${{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0,width:PW+'px'}}>
    <div style=${{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.35)',letterSpacing:'.05em',marginBottom:6,textAlign:'center',whiteSpace:'nowrap'}}>${p.label}</div>
    <div style=${{position:'relative',width:'100%',height:H+'px'}}>
      ${teams.map(function(team,i){
        var a=isAdv(team), e=isElim(team);
        var pairIdx=Math.floor(i/2);
        var score=a?scores[pairIdx]:null;
        var top=i*slotH+(slotH-PH)/2;
        return html`<div key=${i} style=${{
          position:'absolute',top:top+'px',left:0,right:0,height:PH+'px',
          display:'flex',alignItems:'center',gap:3,padding:'0 4px',borderRadius:5,
          background:a?'rgba(74,222,128,.12)':e?'rgba(255,255,255,.02)':'rgba(255,255,255,.06)',
          border:'1px solid '+(a?'rgba(74,222,128,.35)':e?'rgba(255,255,255,.07)':'rgba(255,255,255,.12)'),
        }}>
          ${team
            ? html`
              <${FlagImg} team=${team} dim=${e}/>
              <span style=${{fontSize:9,fontWeight:a?600:400,flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginLeft:3,
                color:a?'#4ade80':e?'rgba(255,255,255,.35)':'rgba(255,255,255,.75)'}}>${teamName(team,lang)}</span>
              ${score&&html`<span style=${{flexShrink:0,fontSize:8,fontWeight:800,background:'rgba(245,158,11,.3)',
                border:'1px solid rgba(245,158,11,.6)',borderRadius:3,padding:'0 3px',
                color:'#fde68a',whiteSpace:'nowrap'}}>${score}</span>`}
            `
            : html`<span style=${{fontSize:8,color:'rgba(255,255,255,.18)',fontStyle:'italic',flex:1}}>TBD</span>`
          }
        </div>`;
      })}
    </div>
  </div>`;
}

// ── Scores summary table ──────────────────────────────────────────────
function BracketScoreTable(p) {
  var lang=useLang().lang;
  var t=useLang().t;
  var B=p.B, ks=p.ks, ch=p.ch, ru=p.ru, thirds=p.thirds, thirdWin=p.thirdWin;
  if(!ks||Object.keys(ks).length===0) return null;

  // Build list of all matches we have scores for
  var rounds=[
    {label:t.r32,       emoji:'\u26a1', matches:
      [0,1,2,3,4,5,6,7].map(function(pi){
        var kL='lR32_'+pi, kR='rR32_'+pi;
        var res=[];
        if(ks[kL]&&B.lR32[pi*2]!==undefined)res.push({home:B.lR32[pi*2]||'?',away:B.lR32[pi*2+1]||'?',score:ks[kL],winner:B.lR32[pi*2]});
        if(ks[kR]&&B.rR32[pi*2]!==undefined)res.push({home:B.rR32[pi*2]||'?',away:B.rR32[pi*2+1]||'?',score:ks[kR],winner:B.rR32[pi*2]});
        return res;
      }).flat()
    },
    {label:t.r16,       emoji:'\ud83d\udd25', matches:
      [0,1,2,3,4,5,6,7].map(function(pi){
        var kL='lR16_'+pi, kR='rR16_'+pi;
        var res=[];
        if(ks[kL]&&B.lR16[pi*2]!==undefined)res.push({home:B.lR16[pi*2]||'?',away:B.lR16[pi*2+1]||'?',score:ks[kL],winner:B.lR16[pi*2]});
        if(ks[kR]&&B.rR16[pi*2]!==undefined)res.push({home:B.rR16[pi*2]||'?',away:B.rR16[pi*2+1]||'?',score:ks[kR],winner:B.rR16[pi*2]});
        return res;
      }).flat()
    },
    {label:t.qf,        emoji:'\ud83d\udd25', matches:
      [0,1,2,3].map(function(pi){
        var kL='lQF_'+pi, kR='rQF_'+pi;
        var res=[];
        if(ks[kL]&&B.lQF[pi*2]!==undefined)res.push({home:B.lQF[pi*2]||'?',away:B.lQF[pi*2+1]||'?',score:ks[kL],winner:B.lQF[pi*2]});
        if(ks[kR]&&B.rQF[pi*2]!==undefined)res.push({home:B.rQF[pi*2]||'?',away:B.rQF[pi*2+1]||'?',score:ks[kR],winner:B.rQF[pi*2]});
        return res;
      }).flat()
    },
    {label:t.sf,        emoji:'\u2b50', matches:[
      ks.lSF_0&&B.lSF.length>=2&&{home:B.lSF[0]||'?', away:B.lSF[1]||'?', score:ks.lSF_0, winner:B.lSF[0]},
      ks.rSF_0&&B.rSF.length>=2&&{home:B.rSF[0]||'?', away:B.rSF[1]||'?', score:ks.rSF_0, winner:B.rSF[0]}
    ]},
    {label:t.thirdMatch,emoji:'\ud83e\udd49', matches:[
      ks.s3rd&&thirds.length>=2&&{home:thirdWin||thirds[0],away:thirdWin===thirds[0]?thirds[1]:thirds[0],score:ks.s3rd,winner:thirdWin}
    ]},
    {label:t.final,     emoji:'\ud83c\udfc6', matches:[
      ks.final&&{home:ch, away:ru, score:ks.final, winner:ch}
    ]}
  ];

  var hasAny=rounds.some(function(r){return r.matches.filter(Boolean).length>0;});
  if(!hasAny) return null;

  return html`<div style=${{marginTop:18}}>
    <div style=${{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.5)',marginBottom:10,letterSpacing:'.05em'}}>
      \u26bd Predicted scores
    </div>
    ${rounds.map(function(rd){
      var ms=rd.matches.filter(Boolean);
      if(!ms.length) return null;
      return html`<div key=${rd.label} style=${{marginBottom:12}}>
        <div style=${{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.35)',marginBottom:5}}>
          ${rd.emoji} ${rd.label}
        </div>
        <div style=${{display:'flex',flexDirection:'column',gap:4}}>
          ${ms.map(function(m,mi){
            if(!m) return null;
            var parts=(m.score||'').split('-');
            var hs=parts[0]?parts[0].trim():'?', as=parts[1]?parts[1].trim():'?';
            var homeWin=m.winner===m.home, awayWin=m.winner===m.away;
            return html`<div key=${mi} style=${{
              display:'grid',gridTemplateColumns:'1fr auto 1fr',
              alignItems:'center',gap:8,
              background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',
              borderRadius:8,padding:'7px 12px'
            }}>
              <div style=${{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:5,overflow:'hidden'}}>
                <span style=${{fontSize:11,fontWeight:homeWin?500:400,
                  color:homeWin?'rgba(255,255,255,.9)':'rgba(255,255,255,.45)',
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>${m.home?teamName(m.home,lang):'TBD'}</span>
                ${m.home&&html`<${FlagImg} team=${m.home} dim=${!homeWin}/>`}
              </div>
              <div style=${{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                <span style=${{fontWeight:800,fontSize:15,minWidth:14,textAlign:'right',
                  color:homeWin?'#fbbf24':'rgba(255,255,255,.5)'}}>${hs}</span>
                <span style=${{color:'rgba(255,255,255,.2)',fontSize:11}}>-</span>
                <span style=${{fontWeight:800,fontSize:15,minWidth:14,textAlign:'left',
                  color:awayWin?'#fbbf24':'rgba(255,255,255,.5)'}}>${as}</span>
              </div>
              <div style=${{display:'flex',alignItems:'center',gap:5,overflow:'hidden'}}>
                ${m.away&&html`<${FlagImg} team=${m.away} dim=${!awayWin}/>`}
                <span style=${{fontSize:11,fontWeight:awayWin?500:400,
                  color:awayWin?'rgba(255,255,255,.9)':'rgba(255,255,255,.45)',
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>${m.away?teamName(m.away,lang):'TBD'}</span>
              </div>
            </div>`;
          })}
        </div>
      </div>`;
    })}
  </div>`;
}

// ── Bracket connector SVG ─────────────────────────────────────────────
function BConn(p) {
  var outer=p.outer,inner=p.inner,dir=p.dir,H=p.H,CW=p.CW;
  var stk='rgba(255,255,255,.15)';
  function ctrO(i){return(i+0.5)*H/outer.length;}
  function ctrI(i){return(i+0.5)*H/inner.length;}
  return html`<svg style=${{width:CW+'px',height:H+'px',flexShrink:0,display:'block',overflow:'visible'}}
    viewBox=${'0 0 '+CW+' '+H}>
    ${Array.from({length:inner.length},function(_,i){
      var c1=ctrO(i*2),c2=ctrO(i*2+1),mid=(c1+c2)/2,ic=ctrI(i);
      if(dir==='lr')return html`<g key=${i}>
        <polyline points=${'0,'+c1+' 4,'+c1+' 4,'+c2+' 0,'+c2} fill="none" stroke=${stk} strokeWidth="1"/>
        <line x1="4" y1=${mid} x2=${CW} y2=${ic} stroke=${stk} strokeWidth="1"/>
      </g>`;
      return html`<g key=${i}>
        <polyline points=${CW+','+c1+' '+(CW-4)+','+c1+' '+(CW-4)+','+c2+' '+CW+','+c2} fill="none" stroke=${stk} strokeWidth="1"/>
        <line x1=${CW-4} y1=${mid} x2="0" y2=${ic} stroke=${stk} strokeWidth="1"/>
      </g>`;
    })}
  </svg>`;
}

// ── SF → Final connector ──────────────────────────────────────────────
function BFinalConn(p) {
  var H=p.H,CW=p.CW,dir=p.dir,stk='rgba(255,255,255,.15)';
  var c1=H/4,c2=3*H/4,mid=H/2;
  return html`<svg style=${{width:CW+'px',height:H+'px',flexShrink:0,display:'block'}} viewBox=${'0 0 '+CW+' '+H}>
    ${dir==='lr'
      ? html`<polyline points=${'0,'+c1+' 4,'+c1+' 4,'+c2+' 0,'+c2} fill="none" stroke=${stk} strokeWidth="1"/>
             <line x1="4" y1=${mid} x2=${CW} y2=${mid} stroke=${stk} strokeWidth="1"/>`
      : html`<polyline points=${CW+','+c1+' '+(CW-4)+','+c1+' '+(CW-4)+','+c2+' '+CW+','+c2} fill="none" stroke=${stk} strokeWidth="1"/>
             <line x1=${CW-4} y1=${mid} x2="0" y2=${mid} stroke=${stk} strokeWidth="1"/>`
    }
  </svg>`;
}

// ── Full mirrored bracket ─────────────────────────────────────────────
function BracketView(p) {
  var lang=useLang().lang;
  var t=useLang().t;
  var preds=p.preds;
  if(!preds)return html`<div style=${{textAlign:'center',padding:'60px 20px',color:'rgba(255,255,255,.3)'}}>${t.bracketNoPreds}</div>`;

  var r32src=preds.groups?getR32(preds.groups).teams:(preds.r32||[]);
  var B=buildOrderedHalves(r32src,preds.r16||[],preds.qf||[],preds.sf||[],preds.final||[],preds.champion||'');
  var ch=B.ch,ru=B.ru,thirds=B.thirds.filter(Boolean),thirdWin=preds.thirdWin||'';
  var ks=preds.koScores||{};

  var H=512,PH=20,PW=158,CW=20;

  // Extract per-column score objects from koScores
  // Convention: ks keys are "colName_pairIdx" e.g. "lSF_0", "lQF_1", "final", "s3rd"
  function colScores(colKey){
    var out={};
    Object.keys(ks).forEach(function(k){
      var prefix=colKey+'_';
      if(k.indexOf(prefix)===0){
        var idx=parseInt(k.slice(prefix.length),10);
        out[idx]=ks[k];
      }
    });
    return out;
  }

  var nextMap={lR32:'lR16',lR16:'lQF',lQF:'lSF',lSF:null,rSF:null,rQF:'rSF',rR16:'rQF',rR32:'rR16'};

  function col(key,label){
    var nextKey=nextMap[key];
    var next=nextKey?B[nextKey]:(key==='lSF'?[ch]:(key==='rSF'?[ru]:[]));
    return html`<${BCol} label=${label} teams=${B[key]} next=${next||[]}
      scores=${colScores(key)} H=${H} PW=${PW} PH=${PH}/>`;
  }
  function cn(a,b,d){return html`<${BConn} outer=${B[a]} inner=${B[b]} dir=${d} H=${H} CW=${CW}/>`;}
  function fc(d){return html`<${BFinalConn} H=${H} CW=${CW} dir=${d}/>`;}

  var lbl=t;

  return html`<div>
    <div className="bscroll" style=${{paddingTop:4,paddingBottom:12}}>
      <div style=${{display:'flex',alignItems:'flex-start',gap:0,minWidth:'1700px'}}>

        ${col('lR32', lbl.r32)}  ${cn('lR32','lR16','lr')}
        ${col('lR16', lbl.r16)}  ${cn('lR16','lQF','lr')}
        ${col('lQF',  lbl.qf)}   ${cn('lQF','lSF','lr')}
        ${col('lSF',  lbl.sf)}   ${fc('lr')}

        <div style=${{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          height:H+'px',width:'165px',flexShrink:0,padding:'0 8px'}}>

          <div style=${{fontSize:9,fontWeight:700,color:'rgba(245,158,11,.7)',marginBottom:5,textAlign:'center',letterSpacing:'.06em'}}>\ud83c\udfc6 ${lbl.champion}</div>

          <div style=${{padding:'8px 10px',borderRadius:10,textAlign:'center',width:'100%',marginBottom:4,
            background:ch?'rgba(245,158,11,.15)':'rgba(255,255,255,.04)',
            border:'2px solid '+(ch?'rgba(245,158,11,.5)':'rgba(255,255,255,.1)')}}>
            ${ch
              ? html`<${FlagImg} team=${ch}/>
                     <div style=${{fontWeight:700,color:'#fbbf24',fontSize:12,marginTop:3}}>${teamName(ch,lang)}</div>`
              : html`<div style=${{fontSize:9,color:'rgba(255,255,255,.25)',fontStyle:'italic',padding:'4px 0'}}>TBD</div>`
            }
          </div>

          ${ks.final&&html`<div style=${{
            display:'flex',alignItems:'center',gap:4,
            background:'rgba(245,158,11,.14)',border:'1px solid rgba(245,158,11,.3)',
            borderRadius:6,padding:'3px 10px',marginBottom:8,width:'100%',justifyContent:'center'
          }}>
            <span style=${{fontSize:9,color:'rgba(255,255,255,.5)'}}>${ch?teamName(ch,lang):'?'}</span>
            <span style=${{fontWeight:800,fontSize:14,color:'#fbbf24',letterSpacing:2}}>${ks.final}</span>
            <span style=${{fontSize:9,color:'rgba(255,255,255,.5)'}}>${ru?teamName(ru,lang):'?'}</span>
          </div>`}

          ${thirds.length>0&&html`<div style=${{width:'100%'}}>
            <div style=${{fontSize:9,fontWeight:700,color:'rgba(180,83,9,.7)',textAlign:'center',marginBottom:4}}>\ud83e\udd49 3rd Place</div>
            <div style=${{display:'flex',flexDirection:'column',gap:3}}>
              ${thirds.slice(0,2).map(function(t3){
                var isW=t3===thirdWin;
                return html`<div key=${t3} style=${{display:'flex',alignItems:'center',gap:5,padding:'3px 6px',borderRadius:5,
                  background:isW?'rgba(180,83,9,.15)':'rgba(255,255,255,.04)',
                  border:'1px solid '+(isW?'rgba(180,83,9,.4)':'rgba(255,255,255,.08)')}}>
                  <${FlagImg} team=${t3}/>
                  <span style=${{fontSize:9,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                    color:isW?'#fb923c':'rgba(255,255,255,.5)'}}>${teamName(t3,lang)}</span>
                  ${isW&&html`<span style=${{fontSize:8,color:'#fb923c'}}>\u2605</span>`}
                </div>`;
              })}
            </div>
            ${ks.s3rd&&html`<div style=${{
              display:'flex',alignItems:'center',gap:4,
              background:'rgba(180,83,9,.1)',border:'1px solid rgba(180,83,9,.25)',
              borderRadius:5,padding:'2px 8px',marginTop:4,justifyContent:'center'
            }}>
              <span style=${{fontWeight:700,fontSize:12,color:'#fb923c',letterSpacing:2}}>${ks.s3rd}</span>
            </div>`}
          </div>`}
        </div>

        ${fc('rl')}   ${col('rSF',  lbl.sf)}
        ${cn('rQF','rSF','rl')}  ${col('rQF',  lbl.qf)}
        ${cn('rR16','rQF','rl')} ${col('rR16', lbl.r16)}
        ${cn('rR32','rR16','rl')} ${col('rR32', lbl.r32)}

      </div>
    </div>
    <p style=${{fontSize:10,color:'rgba(255,255,255,.22)',marginTop:6,textAlign:'center'}}>${lbl.bracketSub}</p>
    <${BracketScoreTable} B=${B} ks=${ks} ch=${ch} ru=${ru} thirds=${thirds} thirdWin=${thirdWin}/>
  </div>`;
}
