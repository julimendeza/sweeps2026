// ── Prediction form ──────────────────────────────────────────────────
function PredictView(p) {
  var t            = useLang().t;
  var participants = p.participants;
  var saveP        = p.saveP;
  var setView      = p.setView;
  var settings     = p.settings;

  // Local state
  var s0  = useState(0);    var step     = s0[0],  setStep     = s0[1];
  var s1  = useState("");   var name     = s1[0],  setName     = s1[1];
  var s2  = useState("");   var email    = s2[0],  setEmail    = s2[1];
  var s3  = useState("");   var err      = s3[0],  setErr      = s3[1];
  var s4  = useState(null); var existId  = s4[0],  setExistId  = s4[1];
  var s5  = useState(Object.assign({}, EP, { groups: {} }));
  var preds = s5[0], setPreds = s5[1];
  var s6  = useState("groups"); var section  = s6[0], setSection  = s6[1];
  var s7  = useState("A");      var activeG  = s7[0], setActiveG  = s7[1];
  var s8  = useState("r32");    var activeKO = s8[0], setActiveKO = s8[1];
  var s9  = useState(false);    var saving   = s9[0], setSaving   = s9[1];
  var s10 = useState(null);     var adminNotif = s10[0], setAdminNotif = s10[1];

  var r32info = useMemo(function(){ return getR32(preds.groups); }, [preds.groups]);

  var gFilled = GROUPS.reduce(function(s, g){
    return s + GMS[g].filter(function(m){ return preds.groups && preds.groups[m.id] && preds.groups[m.id].h !== ""; }).length;
  }, 0);
  var koFilled = KODEFS.filter(function(r){
    return r.pick === 1 ? !!preds[r.id] : (preds[r.id] || []).length === r.pick;
  }).length;

  // KO round labels (language-aware)
  var koRounds = [
    { id:"r32",      label:t.r32,      pick:32, emoji:"\u26a1" },
    { id:"r16",      label:t.r16,      pick:16, emoji:"\ud83d\udd25" },
    { id:"qf",       label:t.qf,       pick:8,  emoji:"\u2b50" },
    { id:"sf",       label:t.sf,       pick:4,  emoji:"\ud83c\udfc6" },
    { id:"final",    label:t.final,    pick:2,  emoji:"\ud83e\udd47" },
    { id:"champion", label:t.champion, pick:1,  emoji:"\ud83e\udd47" },
    { id:"thirdWin", label:t.thirdWin, pick:1,  emoji:"\ud83e\udd49" }
  ];

  function handleStart() {
    if (!name.trim())               { setErr(t.nameL + "?"); return; }
    if (!email.trim() || email.indexOf("@") < 0) { setErr(t.emailL + "?"); return; }
    setErr("");
    var ex = participants.find(function(x){ return x.email.toLowerCase() === email.toLowerCase(); });
    if (ex) {
      setExistId(ex.id);
      setPreds(Object.assign({}, EP, { groups: {} }, ex.preds, { groups: Object.assign({}, ex.preds && ex.preds.groups || {}) }));
    }
    setStep(1);
  }

  function setGM(id, side, v) {
    setPreds(function(prev){
      var ng = Object.assign({}, prev.groups);
      ng[id] = Object.assign({}, ng[id] || {});
      ng[id][side] = v;
      return Object.assign({}, prev, { groups: ng });
    });
  }
  function setKO(id, v) {
    setPreds(function(prev){ var n = Object.assign({}, prev); n[id] = v; return n; });
  }

  async function handleSave() {
    setSaving(true);
    var id     = existId || ("p_" + Date.now());
    var newP   = Object.assign({}, preds);
    var upd    = existId
      ? participants.map(function(x){ return x.id === existId ? Object.assign({}, x, { name:name, email:email, preds:newP }) : x; })
      : participants.concat([{ id:id, name:name, email:email, preds:newP }]);
    await saveP(upd);
    try {
      var sent = await notifyAdmin(newP, name, email, settings, upd, !!existId);
      setAdminNotif(sent ? "sent" : (settings.ejs && settings.ejs.tpl_admin && settings.adminEmail ? "fail" : "skipped"));
    } catch(e) { setAdminNotif("fail"); }
    setSaving(false);
    setStep(2);
  }

  /* ── Step 0: Name + email ─────────────────────────────────────── */
  if (step === 0) return html`<div className="fade" style=${{ maxWidth:420, margin:"0 auto", padding:"32px 16px" }}>
    <${Btn} v="ghost" onClick=${function(){ setView("home"); }}>${t.back}</${Btn}>
    <div style=${{ textAlign:"center", margin:"20px 0 26px" }}>
      <div style=${{ fontSize:40, marginBottom:8 }}>\ud83d\udccb</div>
      <h2 className="bb" style=${{ fontSize:34 }}>${t.registerPreds}</h2>
      <p style=${{ color:"rgba(255,255,255,.4)", fontSize:13, marginTop:6 }}>${t.regSub}</p>
    </div>
    <${Card}>
      <${Field} label=${t.nameL}><input type="text" value=${name} onInput=${function(e){ setName(e.target.value); }} onKeyDown=${function(e){ if(e.key==="Enter") handleStart(); }} placeholder=${t.namePh}/></${Field}>
      <${Field} label=${t.emailL}><input type="email" value=${email} onInput=${function(e){ setEmail(e.target.value); }} onKeyDown=${function(e){ if(e.key==="Enter") handleStart(); }} placeholder=${t.emailPh}/></${Field}>
      <p style=${{ fontSize:11, color:"rgba(255,255,255,.3)", marginBottom:14 }}>${t.sameEmail}</p>
      ${err && html`<p style=${{ color:"#f87171", fontSize:13, marginBottom:12 }}>${err}</p>`}
      <${Btn} onClick=${handleStart} full=${true} sx=${{ padding:"13px", fontSize:15 }}>${t.cont}</${Btn}>
    </${Card}>
  </div>`;

  /* ── Step 2: Confirmation ─────────────────────────────────────── */
  if (step === 2) return html`<div className="fade" style=${{ maxWidth:440, margin:"0 auto", padding:"60px 16px", textAlign:"center" }}>
    <div style=${{ fontSize:56, marginBottom:12 }}>\ud83c\udf89</div>
    <h2 className="bb" style=${{ fontSize:38 }}>${name.toUpperCase()}!</h2>
    <p style=${{ color:"rgba(255,255,255,.5)", margin:"14px 0 20px", lineHeight:1.8 }}>
      ${t.savedMsg}${existId ? " " + t.updated : ""}<br/>${t.goodluck}
    </p>
    ${adminNotif === "sent" && html`<div style=${{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(74,222,128,.1)", border:"1px solid rgba(74,222,128,.3)", borderRadius:10, padding:"7px 14px", fontSize:12, color:"#4ade80", marginBottom:16 }}>${t.adminNotifSent}</div>`}
    ${adminNotif === "fail" && html`<div style=${{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.3)", borderRadius:10, padding:"7px 14px", fontSize:12, color:"#f87171", marginBottom:16 }}>${t.adminNotifFail}</div>`}
    <div style=${{ display:"flex", flexDirection:"column", gap:10, alignItems:"center" }}>
      <${Btn} onClick=${function(){ genPDF(preds, name, email, t.pdfTitle); }} sx=${{ padding:"11px 28px", fontSize:14 }}>\ud83d\udcc4 ${t.downloadPDF}</${Btn}>
      <div style=${{ display:"flex", gap:10 }}>
        <${Btn} onClick=${function(){ setView("bracket"); }} v="secondary">\ud83c\udfc6 ${t.bracket}</${Btn}>
        <${Btn} onClick=${function(){ setView("leaderboard"); }} v="secondary">${t.table}</${Btn}>
      </div>
    </div>
  </div>`;

  /* ── Step 1: Prediction form ──────────────────────────────────── */
  var gIdx    = GROUPS.indexOf(activeG);
  var koIdx   = koRounds.findIndex(function(r){ return r.id === activeKO; });
  var koDef   = koRounds[koIdx];
  var options = getCascadeOpts(preds, activeKO, r32info.teams);

  return html`<div className="fade" style=${{ maxWidth:780, margin:"0 auto", padding:"16px 16px 60px" }}>

    <!-- Progress bar -->
    <div style=${{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
      <${Btn} v="secondary" onClick=${function(){ setStep(0); }} sx=${{ padding:"7px 14px", fontSize:13 }}>${t.back}</${Btn}>
      <div style=${{ flex:1 }}>
        <${PBar} v=${gFilled + koFilled * 9} max=${72 + 63}/>
        <div style=${{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:3 }}>${gFilled}/72 \u00b7 ${koFilled}/7</div>
      </div>
    </div>

    <!-- Section selector -->
    <div style=${{ display:"flex", gap:8, marginBottom:16 }}>
      ${[
        { id:"groups",   l:t.groupStage, sub:gFilled+"/72" },
        { id:"knockout", l:t.knockout,   sub:r32info.complete ? r32info.teams.length+" auto" : r32info.groupsDone+"/12 "+t.groupsDone }
      ].map(function(s){
        return html`<button key=${s.id} onClick=${function(){ setSection(s.id); }} style=${{
          flex:1, padding:"12px 16px", borderRadius:12, cursor:"pointer",
          border:"2px solid " + (section===s.id ? "#f59e0b" : "rgba(255,255,255,.1)"),
          background: section===s.id ? "rgba(245,158,11,.12)" : "rgba(255,255,255,.03)",
          fontFamily:"'DM Sans',sans-serif", transition:"all .15s", textAlign:"left"
        }}>
          <div style=${{ fontWeight:700, fontSize:14, color: section===s.id ? "#fbbf24" : "rgba(255,255,255,.7)" }}>${s.l}</div>
          <div style=${{ fontSize:12, marginTop:2, color: section===s.id ? "rgba(245,158,11,.7)" : "rgba(255,255,255,.4)" }}>${s.sub}</div>
        </button>`;
      })}
    </div>

    <!-- GROUP STAGE section -->
    ${section === "groups" && html`<${Card}>
      <${GroupTabs} active=${activeG} onChange=${setActiveG} preds=${preds.groups}/>
      <div style=${{ fontSize:11, color:"rgba(255,255,255,.35)", marginBottom:8 }}>${t.groupLabel} ${activeG}: ${TBG[activeG].join(" \u00b7 ")}</div>
      ${GMS[activeG].map(function(m){
        return html`<${MRow} key=${m.id} match=${m}
          hv=${preds.groups && preds.groups[m.id] && preds.groups[m.id].h || ""}
          av=${preds.groups && preds.groups[m.id] && preds.groups[m.id].a || ""}
          onH=${function(v){ setGM(m.id, "h", v); }}
          onA=${function(v){ setGM(m.id, "a", v); }}/>`;
      })}
      <${StandingsTable} group=${activeG} preds=${preds.groups}/>
      <div style=${{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
        <${Btn} v="secondary" disabled=${gIdx===0} onClick=${function(){ setActiveG(GROUPS[gIdx-1]); }} sx=${{ padding:"8px 14px", fontSize:13 }}>\u2190 ${GROUPS[gIdx-1] || ""}</${Btn}>
        ${gIdx < 11
          ? html`<${Btn} onClick=${function(){ setActiveG(GROUPS[gIdx+1]); }} sx=${{ padding:"8px 14px", fontSize:13 }}>${t.groupLabel} ${GROUPS[gIdx+1]} \u2192</${Btn}>`
          : html`<${Btn} onClick=${function(){ setSection("knockout"); }} sx=${{ padding:"8px 14px", fontSize:13 }}>${t.knockout} \u2192</${Btn}>`
        }
      </div>
    </${Card}>`}

    <!-- KNOCKOUT section -->
    ${section === "knockout" && html`<${Card}>
      <!-- R32 qualifier summary -->
      <div style=${{ marginBottom:14, padding:"10px 14px", borderRadius:12,
        background: r32info.complete ? "rgba(74,222,128,.07)" : "rgba(245,158,11,.07)",
        border: "1px solid " + (r32info.complete ? "rgba(74,222,128,.2)" : "rgba(245,158,11,.2)") }}>
        <div style=${{ fontSize:11, fontWeight:700, marginBottom: r32info.teams.length>0 ? 8 : 0,
          color: r32info.complete ? "#4ade80" : "rgba(245,158,11,.8)" }}>
          ${r32info.complete ? ("\u2713 " + t.r32ok) : ("\u26a0\ufe0f " + t.r32Incomplete + " (" + r32info.groupsDone + "/12)")}
        </div>
        ${r32info.teams.length > 0 && html`<div style=${{ display:"flex", flexWrap:"wrap", gap:3 }}>
          ${r32info.teams.map(function(tm){ return html`<span key=${tm} className="chip c-dim" style=${{ fontSize:10 }}>${fl(tm)} ${tm}</span>`; })}
        </div>`}
        ${r32info.best8.length > 0 && html`<div style=${{ marginTop:6, fontSize:10, color:"rgba(255,255,255,.3)" }}>
          ${t.best8} ${r32info.best8.map(function(x){ return x.team; }).join(", ")}
        </div>`}
      </div>

      <!-- KO round tabs -->
      <div style=${{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:14 }}>
        ${koRounds.map(function(r){
          var filled = r.pick === 1 ? !!preds[r.id] : (preds[r.id] || []).length === r.pick;
          return html`<button key=${r.id} onClick=${function(){ setActiveKO(r.id); }} style=${{
            padding:"5px 10px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
            border:"1.5px solid " + (activeKO===r.id ? "#f59e0b" : filled ? "rgba(74,222,128,.4)" : "rgba(255,255,255,.1)"),
            background: activeKO===r.id ? "#f59e0b" : filled ? "rgba(74,222,128,.08)" : "transparent",
            color:      activeKO===r.id ? "#000" : filled ? "#4ade80" : "rgba(255,255,255,.5)",
            fontFamily:"'DM Sans',sans-serif"
          }}>${r.emoji}${filled && activeKO!==r.id ? " \u2713" : ""} ${r.label}</button>`;
        })}
      </div>

      <!-- Round header -->
      <div style=${{ marginBottom:16, paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        <h3 className="bb" style=${{ fontSize:20 }}>${koDef.emoji} ${koDef.label}</h3>
      </div>

      <!-- 3rd place auto info -->
      ${activeKO === "thirdWin" && (function(){
        var tm = (preds.sf || []).filter(function(x){ return (preds.final || []).indexOf(x) < 0; });
        return tm.length >= 2 && html`<div style=${{ marginBottom:12, padding:"8px 12px", background:"rgba(255,255,255,.04)", borderRadius:10, fontSize:12, color:"rgba(255,255,255,.5)" }}>
          ${t.thirdAuto} ${fl(tm[0])} ${tm[0]} vs ${fl(tm[1])} ${tm[1]}
        </div>`;
      })()}

      <!-- Team picker -->
      ${koDef.pick === 1
        ? html`<${SinglePick} options=${options} selected=${preds[activeKO] || ""} onChange=${function(v){ setKO(activeKO, v); }}/>`
        : html`<${MultiPick}  options=${options} selected=${preds[activeKO] || []} onChange=${function(v){ setKO(activeKO, v); }} pick=${koDef.pick}/>`
      }

      <!-- Navigation -->
      <div style=${{ display:"flex", gap:10, marginTop:14 }}>
        ${koIdx > 0 && html`<${Btn} v="secondary" onClick=${function(){ setActiveKO(koRounds[koIdx-1].id); }} sx=${{ padding:"9px 14px", fontSize:13 }}>\u2190 ${koRounds[koIdx-1].emoji}</${Btn}>`}
        ${koIdx < koRounds.length - 1
          ? html`<${Btn} onClick=${function(){ setActiveKO(koRounds[koIdx+1].id); }} sx=${{ flex:"1", padding:"11px" }}>\u2192 ${koRounds[koIdx+1].emoji} ${koRounds[koIdx+1].label}</${Btn}>`
          : html`<${Btn} onClick=${handleSave} disabled=${saving} sx=${{ flex:"1", padding:"13px", fontSize:15 }}>${saving ? t.saving : t.savePreds}</${Btn}>`
        }
      </div>
    </${Card}>`}

    <!-- Quick save button -->
    <div style=${{ marginTop:14, textAlign:"center" }}>
      <${Btn} onClick=${handleSave} disabled=${saving} v="secondary" sx=${{ padding:"11px 32px", fontSize:14 }}>${saving ? t.saving : t.saveNow}</${Btn}>
    </div>
  </div>`;
}
