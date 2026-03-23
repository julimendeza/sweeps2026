// ── Admin panel (password protected) ────────────────────────────────
function AdminView(p) {
  var lctx=useLang();var t=lctx.t;var lang=lctx.lang;
  var authState = useState(false); var auth    = authState[0],  setAuth    = authState[1];
  var pwState   = useState("");    var pw      = pwState[0],    setPw      = pwState[1];
  var errState  = useState("");    var authErr = errState[0],   setAuthErr = errState[1];
  var tabState  = useState("results"); var tab = tabState[0],  setTab     = tabState[1];

  function tryAuth() {
    if (pw === p.settings.adminPw) { setAuth(true); setAuthErr(""); }
    else setAuthErr("\u274c Wrong password");
  }

  if (!auth) return html`<div className="fade" style=${{ maxWidth:360, margin:"0 auto", padding:"60px 16px", textAlign:"center" }}>
    <div style=${{ fontSize:44, marginBottom:10 }}>\ud83d\udd10</div>
    <h2 className="bb" style=${{ fontSize:30 }}>${t.adminTitle}</h2>
    <p style=${{ color:"rgba(255,255,255,.4)", fontSize:13, margin:"8px 0 22px" }}>Organizer only</p>
    <${Card}>
      <input type="password" value=${pw}
        onInput=${function(e){ setPw(e.target.value); }}
        onKeyDown=${function(e){ if(e.key==="Enter") tryAuth(); }}
        placeholder="Password" style=${{ marginBottom:12 }}/>
      ${authErr && html`<p style=${{ color:"#f87171", fontSize:13, marginBottom:12 }}>${authErr}</p>`}
      <${Btn} onClick=${tryAuth} full=${true} sx=${{ padding:"13px", fontSize:15 }}>Enter</${Btn}>
    </${Card}>
  </div>`;

  var tabs = [
    { id:"results",  l:t.results   },
    { id:"parts",    l:t.partTab   },
    { id:"email",    l:t.emailTab  },
    { id:"settings", l:t.settingsTab }
  ];

  return html`<div className="fade" style=${{ maxWidth:780, margin:"0 auto", padding:"24px 16px 60px" }}>
    <h2 className="bb" style=${{ fontSize:26, marginBottom:18 }}>\ud83d\udee0 ${t.adminTitle}</h2>


    <div style=${{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:18 }}>
      ${tabs.map(function(tx){
        return html`<button key=${tx.id} onClick=${function(){ setTab(tx.id); }} style=${{
          padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer",
          border:"none", transition:"all .15s",
          background: tab===tx.id ? "#f59e0b" : "rgba(255,255,255,.07)",
          color:      tab===tx.id ? "#000"    : "rgba(255,255,255,.6)",
          fontFamily:"'DM Sans',sans-serif"
        }}>${tx.l}</button>`;
      })}
    </div>

    ${tab==="results"  && html`<${AdminResults}  results=${p.results}       saveResults=${p.saveResults}/>`}
    ${tab==="parts"    && html`<${AdminParts}    participants=${p.participants} results=${p.results} settings=${p.settings} saveParticipants=${p.saveParticipants}/>`}
    ${tab==="email"    && html`<${AdminEmail}    participants=${p.participants} results=${p.results} settings=${p.settings} saveSettings=${p.saveSettings}/>`}
    ${tab==="settings" && html`<${AdminSettings} settings=${p.settings}     saveSettings=${p.saveSettings}/>`}
  </div>`;
}

// ── Admin Results tab ────────────────────────────────────────────────
function AdminResults(p) {
  var lctx=useLang();var t=lctx.t;var lang=lctx.lang;
  var locState = useState(Object.assign({}, ER,
    { groups: Object.assign({}, p.results.groups || {}) },
    Object.fromEntries(Object.entries(p.results).filter(function(e){ return e[0] !== "groups"; }))
  ));
  var loc = locState[0], setLoc = locState[1];
  var secState = useState("groups"); var sec      = secState[0], setSec      = secState[1];
  var gState   = useState("A");      var activeG  = gState[0],  setActiveG  = gState[1];
  var koState  = useState("r16");    var activeKO = koState[0], setActiveKO = koState[1];
  var msgState = useState("");       var msg      = msgState[0], setMsg     = msgState[1];

  var r32info = useMemo(function(){ return getR32(loc.groups); }, [loc.groups]);

  async function save() { await p.saveResults(loc); setMsg(t.savedOk); setTimeout(function(){ setMsg(""); }, 2000); }

  function setGR(id, side, v) {
    setLoc(function(prev){
      var ng = Object.assign({}, prev.groups);
      ng[id] = Object.assign({}, ng[id] || {}); ng[id][side] = v;
      return Object.assign({}, prev, { groups: ng });
    });
  }

  var koRounds = [
    { id:"r16",      label:t.r16,      pick:16, emoji:"\ud83d\udd25" },
    { id:"qf",       label:t.qf,       pick:8,  emoji:"\u2b50" },
    { id:"sf",       label:t.sf,       pick:4,  emoji:"\ud83c\udfc6" },
    { id:"final",    label:t.final,    pick:2,  emoji:"\ud83e\udd47" },
    { id:"champion", label:t.champion, pick:1,  emoji:"\ud83e\udd47" },
    { id:"thirdWin", label:t.thirdWin, pick:1,  emoji:"\ud83e\udd49" }
  ];
  var koDef   = koRounds.find(function(r){ return r.id === activeKO; }) || koRounds[0];
  var options = getCascadeOpts(loc, activeKO, r32info.teams);
  var gIdx    = GROUPS.indexOf(activeG);

  return html`<div>
    <div style=${{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
      <p style=${{ fontSize:13, color:"rgba(255,255,255,.4)" }}>${t.enterRes}</p>
      <div style=${{ display:"flex", alignItems:"center", gap:10 }}>
        ${msg && html`<span style=${{ color:"#4ade80", fontSize:13 }}>${msg}</span>`}
        <${Btn} onClick=${save} sx=${{ padding:"8px 18px", fontSize:14 }}>${t.saveBtn}</${Btn}>
      </div>
    </div>


    <div style=${{ display:"flex", gap:8, marginBottom:16 }}>
      ${[{id:"groups",l:t.groupsS},{id:"knockout",l:t.knockoutS}].map(function(s){
        return html`<button key=${s.id} onClick=${function(){ setSec(s.id); }} style=${{
          flex:1, padding:"10px 16px", borderRadius:10, cursor:"pointer",
          border:"2px solid " + (sec===s.id ? "#f59e0b" : "rgba(255,255,255,.1)"),
          background: sec===s.id ? "rgba(245,158,11,.1)" : "rgba(255,255,255,.03)",
          fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13,
          color: sec===s.id ? "#fbbf24" : "rgba(255,255,255,.6)"
        }}>${s.l}</button>`;
      })}
    </div>

    ${sec === "groups" && html`<${Card}>
      <${GroupTabs} active=${activeG} onChange=${setActiveG} preds=${loc} isResult=${true}/>
      <div style=${{ fontSize:11, color:"rgba(255,255,255,.3)", marginBottom:8 }}>${t.groupLabel} ${activeG}: ${TBG[activeG].map(function(tm){return teamName(tm,lang);}).join(" \u00b7 ")}</div>
      ${GMS[activeG].map(function(m){
        return html`<${MRow} key=${m.id} match=${m}
          hv=${loc.groups && loc.groups[m.id] && loc.groups[m.id].h || ""}
          av=${loc.groups && loc.groups[m.id] && loc.groups[m.id].a || ""}
          onH=${function(v){ setGR(m.id,"h",v); }} onA=${function(v){ setGR(m.id,"a",v); }}/>`;
      })}
      <${StandingsTable} group=${activeG} preds=${loc.groups} allPreds=${loc.groups}/>
      <div style=${{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
        <${Btn} v="secondary" disabled=${gIdx===0} onClick=${function(){ setActiveG(GROUPS[gIdx-1]); }} sx=${{ padding:"7px 14px", fontSize:13 }}>\u2190 ${GROUPS[gIdx-1]||""}</${Btn}>
        <${Btn} v="secondary" disabled=${gIdx===11} onClick=${function(){ setActiveG(GROUPS[gIdx+1]); }} sx=${{ padding:"7px 14px", fontSize:13 }}>${GROUPS[gIdx+1]||""} \u2192</${Btn}>
      </div>
    </${Card}>`}

    ${sec === "knockout" && html`<${Card}>
      ${r32info.complete
        ? html`<div style=${{ marginBottom:12, padding:"8px 12px", background:"rgba(74,222,128,.07)", borderRadius:10, border:"1px solid rgba(74,222,128,.2)", fontSize:11, color:"#4ade80" }}>${t.r32ok}: ${r32info.teams.join(", ")}</div>`
        : html`<div style=${{ marginBottom:12, padding:"8px 12px", background:"rgba(245,158,11,.07)", borderRadius:10, border:"1px solid rgba(245,158,11,.2)", fontSize:11, color:"rgba(245,158,11,.8)" }}>${t.r32missing} (${r32info.groupsDone}/12)</div>`
      }
      <div style=${{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:14 }}>
        ${koRounds.map(function(r){
          var filled = r.pick===1 ? !!loc[r.id] : (loc[r.id]||[]).length===r.pick;
          return html`<button key=${r.id} onClick=${function(){ setActiveKO(r.id); }} style=${{
            padding:"5px 10px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
            border:"1.5px solid " + (activeKO===r.id ? "#f59e0b" : filled ? "rgba(74,222,128,.4)" : "rgba(255,255,255,.1)"),
            background: activeKO===r.id ? "#f59e0b" : filled ? "rgba(74,222,128,.08)" : "transparent",
            color:      activeKO===r.id ? "#000"    : filled ? "#4ade80" : "rgba(255,255,255,.5)",
            fontFamily:"'DM Sans',sans-serif"
          }}>${r.emoji}${filled&&activeKO!==r.id?" \u2713":""} ${r.label}</button>`;
        })}
      </div>
      <div style=${{ marginBottom:14, paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        <h3 className="bb" style=${{ fontSize:20 }}>${koDef.emoji} ${koDef.label}</h3>
      </div>
      ${activeKO==="thirdWin" && (function(){
        var tm = (loc.sf||[]).filter(function(x){ return (loc.final||[]).indexOf(x)<0; });
        return tm.length>=2 && html`<div style=${{ marginBottom:12, padding:"8px 12px", background:"rgba(255,255,255,.04)", borderRadius:10, fontSize:12, color:"rgba(255,255,255,.5)" }}>
          ${t.thirdAuto} ${fl(tm[0])} ${tm[0]} vs ${fl(tm[1])} ${tm[1]}
        </div>`;
      })()}
      ${koDef.pick===1
        ? html`<${SinglePick} options=${options} selected=${loc[activeKO]||""} onChange=${function(v){ setLoc(function(prev){ var n=Object.assign({},prev);n[activeKO]=v;return n; }); }}/>`
        : html`<${MultiPick}  options=${options} selected=${loc[activeKO]||[]} onChange=${function(v){ setLoc(function(prev){ var n=Object.assign({},prev);n[activeKO]=v;return n; }); }} pick=${koDef.pick}/>`
      }
    </${Card}>`}
  </div>`;
}

// ── Admin Participants tab ───────────────────────────────────────────
function AdminParts(p) {
  var lctx=useLang();var t=lctx.t;var lang=lctx.lang;
  var ranked = useMemo(function(){
    return p.participants
      .map(function(x){ return Object.assign({}, x, calcScore(x.preds, p.results, p.settings.scoring)); })
      .sort(function(a,b){ return cmpTb(a,b,p.results); });
  }, [p.participants, p.results, p.settings]);

  async function del(id) {
    if (id === "claude_bot") { alert(t.noDelClaude); return; }
    if (!confirm(t.delConfirm)) return;
    await p.saveParticipants(p.participants.filter(function(x){ return x.id !== id; }));
  }

  return html`<div>
    <p style=${{ fontSize:13, color:"rgba(255,255,255,.4)", marginBottom:14 }}>
      ${p.participants.filter(function(x){ return x.id!=="claude_bot"; }).length} ${t.participants} (+Claude \ud83e\udd16)
    </p>
    ${ranked.map(function(px, i){
      return html`<${Card} key=${px.id} sx=${{
        marginBottom:8, display:"flex", alignItems:"center", gap:12,
        background: px.id==="claude_bot" ? "rgba(245,158,11,.05)" : "rgba(255,255,255,.04)",
        border: px.id==="claude_bot" ? "1.5px solid rgba(245,158,11,.15)" : "1.5px solid rgba(255,255,255,.08)"
      }}>
        <span style=${{ width:28, textAlign:"center", fontWeight:800, fontSize:i<3?18:13,
          color: i===0?"#fbbf24":i===1?"#94a3b8":i===2?"#b45309":"rgba(255,255,255,.28)" }}>
          ${i===0?"\ud83e\udd47":i===1?"\ud83e\udd48":i===2?"\ud83e\udd49":i+1}
        </span>
        <div style=${{ flex:1 }}>
          <div style=${{ fontWeight:600, fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
            ${px.name}
            ${px.id==="claude_bot" && html`<span style=${{ fontSize:10, background:"rgba(245,158,11,.2)", color:"#f59e0b", borderRadius:4, padding:"1px 5px", fontWeight:700 }}>BOT</span>`}
          </div>
          <div style=${{ fontSize:12, color:"rgba(255,255,255,.32)" }}>${px.email}</div>
          <div style=${{ fontSize:11, color:"rgba(255,255,255,.22)", marginTop:2 }}>
            \ud83c\udfc6 ${px.preds && px.preds.champion ? (fl(px.preds.champion) + " " + px.preds.champion) : "\u2014"}
          </div>
        </div>
        <div style=${{ fontWeight:800, color:"#f59e0b", fontSize:18 }}>${px.pts} pts</div>
        <button onClick=${function(){ del(px.id); }} style=${{
          background:"none", border:"none", color:"#f87171", fontSize:20, cursor:"pointer", opacity:.55, padding:4
        }}>\u00d7</button>
      </${Card}>`;
    })}
    ${p.participants.length === 0 && html`<${Card} sx=${{ textAlign:"center", padding:"50px", color:"rgba(255,255,255,.3)" }}>${t.noPart}</${Card}>`}
  </div>`;
}

// ── Admin Email tab ──────────────────────────────────────────────────
function AdminEmail(p) {
  var lctx=useLang();var t=lctx.t;var lang=lctx.lang;
  var cfgState    = useState(Object.assign({}, p.settings.ejs));
  var cfg = cfgState[0], setCfg = cfgState[1];
  var statusState = useState(""); var status  = statusState[0], setStatus  = statusState[1];
  var sendingState= useState(false); var sending = sendingState[0], setSending = sendingState[1];
  var etState     = useState("invite"); var emailType = etState[0], setEmailType = etState[1];

  var human = p.participants.filter(function(x){ return x.id !== "claude_bot"; });
  var total = human.length * p.settings.entryFee;

  var chC = {};
  human.forEach(function(x){ if(x.preds&&x.preds.champion) chC[x.preds.champion]=(chC[x.preds.champion]||0)+1; });
  var topCh = Object.entries(chC).sort(function(a,b){ return b[1]-a[1]; })[0];

  async function saveCfg() {
    await p.saveSettings(Object.assign({}, p.settings, { ejs: cfg }));
    setStatus("\u2705"); setTimeout(function(){ setStatus(""); }, 2000);
  }

  async function sendAll() {
    var tpl = emailType === "invite" ? cfg.tpl_invite : cfg.tpl_update;
    if (!cfg.svc || !tpl || !cfg.key) { setStatus("\u274c Fill in EmailJS config"); return; }
    if (!human.length) { setStatus("\u274c No participants"); return; }
    setSending(true);
    try {
      await loadEJS();
      window.emailjs.init(cfg.key);
      var ranked = human.map(function(x){ return Object.assign({},x,calcScore(x.preds,p.results,p.settings.scoring)); })
                        .sort(function(a,b){ return cmpTb(a,b,p.results); });
      var cs = Object.entries(chC).sort(function(a,b){return b[1]-a[1];}).map(function(e){return e[0]+" ("+e[1]+")";}).join(", ");
      var ok = 0;
      for (var i = 0; i < ranked.length; i++) {
        var px = ranked[i];
        setStatus("\ud83d\udce8 " + px.name + "... (" + (i+1) + "/" + ranked.length + ")");
        try {
          await window.emailjs.send(cfg.svc, tpl, {
            to_email: px.email, to_name: px.name, rank: i+1, total_p: ranked.length,
            points: px.pts, currency: p.settings.currency, entry_fee: p.settings.entryFee,
            prize_total: total, prize_1st: Math.floor(total*.5), prize_2nd: Math.floor(total*.25),
            prize_3rd: Math.floor(total*.15), admin_fee: Math.floor(total*.1),
            leader: ranked[0].name, leader_pts: ranked[0].pts,
            champion_summary: cs,
            top_champion: topCh ? topCh[1]+" people have "+topCh[0] : ""
          });
          ok++;
        } catch(e) { console.error(e); }
        if (i < ranked.length - 1) await new Promise(function(r){ setTimeout(r, 500); });
      }
      setStatus("\u2705 Sent " + ok + "/" + ranked.length);
    } catch(e) { setStatus("\u274c " + e.message); }
    setSending(false);
  }

  return html`<div>

    <div style=${{ background:"rgba(245,158,11,.08)", border:"1.5px solid rgba(245,158,11,.25)", borderRadius:14, padding:"16px", marginBottom:18 }}>
      <div style=${{ fontWeight:700, fontSize:14, marginBottom:12, color:"#fbbf24" }}>\ud83d\udd14 ${t.adminNotifTitle}</div>
      <${Field} label=${t.adminEmailL}>
        <input type="email" value=${p.settings.adminEmail||""}
          onInput=${function(e){ p.saveSettings(Object.assign({},p.settings,{adminEmail:e.target.value})); }}
          placeholder=${t.adminEmailPh}/>
      </${Field}>
      <${Field} label=${t.tplAdmin}>
        <input value=${cfg.tpl_admin||""}
          onInput=${function(e){ setCfg(function(prev){ return Object.assign({},prev,{tpl_admin:e.target.value}); }); }}
          placeholder="template_xxxxxxx" style=${{ fontFamily:"monospace" }}/>
      </${Field}>
      <div style=${{ background:"rgba(0,0,0,.2)", borderRadius:10, padding:"12px", fontSize:12, color:"rgba(255,255,255,.45)" }}>
        <strong style=${{ color:"rgba(255,255,255,.7)", display:"block", marginBottom:5 }}>${t.ejsVars}</strong>
        <code style=${{ fontSize:10, color:"rgba(245,158,11,.8)" }}>to_email, participant_name, participant_email, is_update, total_participants, group_predictions, knockout_predictions, submitted_at</code>
      </div>
    </div>


    <div style=${{ display:"flex", gap:8, marginBottom:18 }}>
      ${[{id:"invite",l:t.invEmail},{id:"update",l:t.updateEmail}].map(function(e){
        return html`<button key=${e.id} onClick=${function(){ setEmailType(e.id); }} style=${{
          flex:1, padding:"10px", borderRadius:10, cursor:"pointer",
          border:"2px solid " + (emailType===e.id?"#f59e0b":"rgba(255,255,255,.1)"),
          background: emailType===e.id?"rgba(245,158,11,.1)":"rgba(255,255,255,.03)",
          fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13,
          color: emailType===e.id?"#fbbf24":"rgba(255,255,255,.6)"
        }}>${e.l}</button>`;
      })}
    </div>


    <${Card} sx=${{ marginBottom:18, background:"rgba(0,0,0,.2)" }}>
      <div style=${{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.3)", marginBottom:10, letterSpacing:".08em" }}>${t.prevLabel}</div>
      <div style=${{ background:"#fff", borderRadius:10, padding:"18px", color:"#222", fontSize:13, lineHeight:1.85, fontFamily:"Arial,sans-serif" }}>
        ${emailType === "invite"
          ? html`<p><strong>Hey dear football friends,</strong></p>
              <p>The 2026 FIFA World Cup is just around the corner! Predict group stage scores (app auto-calculates who qualifies for the Round of 32), then pick teams advancing each knockout round.</p>
              <p>\ud83d\udc49 <strong>[SWEEPSTAKE WEBSITE LINK]</strong></p>
              <p>Register: <strong>${p.settings.currency} ${p.settings.entryFee}</strong> → Pay Aaron Bolanos (BSB: 064158 / Acc: 11153291) · Deadline: <strong>June 10, 2026</strong>.</p>
              <p>More players = bigger prize! Please share with friends.</p>
              <p><strong>Good luck! \u26bd\ud83c\udfc6 — Julian</strong></p>`
          : html`<p><strong>Hello everyone!</strong></p>
              <p>Here are the WC 2026 Sweepstake predictions. Please save this email as a record.</p>
              <p>We are <strong>${human.length} participants</strong> → <strong>${p.settings.currency} ${total}</strong> raised.</p>
              <p>\ud83e\udd47 1st (50%): <strong>${p.settings.currency} ${Math.floor(total*.5)}</strong><br/>
                 \ud83e\udd48 2nd (25%): <strong>${p.settings.currency} ${Math.floor(total*.25)}</strong><br/>
                 \ud83e\udd49 3rd (15%): <strong>${p.settings.currency} ${Math.floor(total*.15)}</strong></p>
              ${topCh && html`<p><strong>${topCh[1]} people</strong> have <strong>${topCh[0]}</strong> as champion.</p>`}
              <p><strong>GOOD LUCK! \u26bd\ud83c\udfc6 — Julian</strong></p>`
        }
      </div>
    </${Card}>


    <div style=${{ background:"rgba(59,130,246,.09)", border:"1.5px solid rgba(59,130,246,.2)", borderRadius:12, padding:"14px 16px", marginBottom:18, fontSize:13 }}>
      <strong style=${{ display:"block", marginBottom:8, color:"rgba(147,197,253,.9)" }}>${t.ejsTitle}</strong>
      <ol style=${{ paddingLeft:18, lineHeight:1.9, fontSize:12, color:"rgba(147,197,253,.7)" }}>
        <li>${t.ejsS1}</li>
        <li>${t.ejsS2}</li>
        <li>${t.ejsVars} <code style=${{ fontSize:10, background:"rgba(0,0,0,.3)", padding:"1px 5px", borderRadius:4 }}>to_name, to_email, total_p, currency, entry_fee, prize_total, prize_1st, prize_2nd, prize_3rd, admin_fee, points, rank, leader, leader_pts, champion_summary, top_champion</code></li>
      </ol>
    </div>


    <div style=${{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
      ${[
        {k:"svc",       l:t.svcId,      ph:"service_xxxxxxx"},
        {k:"tpl_invite",l:t.tplInvite,  ph:"template_xxxxxxx"},
        {k:"tpl_update",l:t.tplUpdate,  ph:"template_xxxxxxx"},
        {k:"key",       l:t.pubKey,     ph:"xxxxxxxxxxxxxxxxxxxx"}
      ].map(function(f){
        return html`<${Field} key=${f.k} label=${f.l}>
          <input value=${cfg[f.k]||""}
            onInput=${function(e){ setCfg(function(prev){ var n=Object.assign({},prev); n[f.k]=e.target.value; return n; }); }}
            placeholder=${f.ph} style=${{ fontFamily:"monospace" }}/>
        </${Field}>`;
      })}
    </div>


    <div style=${{ display:"flex", gap:10, flexWrap:"wrap" }}>
      <${Btn} v="secondary" onClick=${saveCfg}>${t.saveCfg}</${Btn}>
      <${Btn} onClick=${sendAll} disabled=${sending||human.length===0}>
        ${sending ? t.sending : (emailType==="invite" ? t.sendInv : t.sendUpd) + " " + human.length}
      </${Btn}>
    </div>
    ${status && html`<p style=${{ marginTop:12, fontSize:13, color:"rgba(255,255,255,.75)" }}>${status}</p>`}
  </div>`;
}

// ── Admin Settings tab ───────────────────────────────────────────────
function AdminSettings(p) {
  var lctx=useLang();var t=lctx.t;var lang=lctx.lang;
  var locState = useState(Object.assign({}, p.settings, { scoring: Object.assign({}, p.settings.scoring) }));
  var loc = locState[0], setLoc = locState[1];
  var msgState = useState(""); var msg = msgState[0], setMsg = msgState[1];

  async function save() { await p.saveSettings(loc); setMsg("\u2705"); setTimeout(function(){ setMsg(""); }, 3000); }

  var scItems = [
    {k:"groupResult",l:t.result},   {k:"groupGoalA",l:t.goalsA},
    {k:"groupGoalB",l:t.goalsB},    {k:"groupDiff",l:t.gdiff},
    {k:"r32",l:t.r32},              {k:"r16",l:t.r16},
    {k:"qf",l:t.qf},                {k:"sf",l:t.sf},
    {k:"thirdMatch",l:t.thirdMatch},{k:"final",l:t.final},
    {k:"champion",l:t.champion},    {k:"thirdWin",l:t.thirdWin}
  ];

  return html`<div style=${{ maxWidth:520 }}>
    <div style=${{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
      <${Field} label=${t.entryFeeL}>
        <input type="number" value=${loc.entryFee}
          onInput=${function(e){ setLoc(function(prev){ return Object.assign({},prev,{entryFee:+e.target.value}); }); }}
          style=${{ textAlign:"center", fontWeight:700, fontSize:16, color:"#f59e0b" }}/>
      </${Field}>
      <${Field} label=${t.currencyL}>
        <input type="text" value=${loc.currency}
          onInput=${function(e){ setLoc(function(prev){ return Object.assign({},prev,{currency:e.target.value}); }); }}
          style=${{ textAlign:"center", fontWeight:700 }}/>
      </${Field}>
    </div>
    <${Field} label=${t.adminPwL}>
      <input type="password" value=${loc.adminPw}
        onInput=${function(e){ setLoc(function(prev){ return Object.assign({},prev,{adminPw:e.target.value}); }); }}
        placeholder="New password"/>
    </${Field}>
    <${Field} label=${t.adminEmailSettings}>
      <input type="email" value=${loc.adminEmail||""}
        onInput=${function(e){ setLoc(function(prev){ return Object.assign({},prev,{adminEmail:e.target.value}); }); }}
        placeholder=${t.adminEmailPh}/>
    </${Field}>

    <div style=${{ marginBottom:20 }}>
      <div style=${{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.5)", marginBottom:10 }}>${t.ptsConfig}</div>
      <div style=${{ display:"flex", flexDirection:"column", gap:6 }}>
        ${scItems.map(function(s){
          return html`<div key=${s.k} style=${{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
            background:"rgba(255,255,255,.04)", borderRadius:9, padding:"8px 12px", border:"1px solid rgba(255,255,255,.08)" }}>
            <span style=${{ fontSize:13, color:"rgba(255,255,255,.55)", flex:1 }}>${s.l}</span>
            <input type="number" min="0" max="50"
              value=${loc.scoring && loc.scoring[s.k] !== undefined ? loc.scoring[s.k] : DEF.scoring[s.k]}
              onInput=${function(e){ setLoc(function(prev){ return Object.assign({},prev,{scoring:Object.assign({},prev.scoring,{[s.k]:+e.target.value})}); }); }}
              style=${{ width:60, textAlign:"center", fontWeight:800, fontSize:16, color:"#f59e0b", padding:"4px" }}/>
          </div>`;
        })}
      </div>
    </div>

    <${Btn} onClick=${save} sx=${{ padding:"12px 28px" }}>${t.saveBtn}</${Btn}>
    ${msg && html`<p style=${{ marginTop:12, fontSize:13, color:"#4ade80" }}>${msg}</p>`}
  </div>`;
}
