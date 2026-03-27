// ── Build raw stats for a set of matches ────────────────────────────
function buildStats(matches, gp) {
  var s = {};
  matches.forEach(function(m) {
    s[m.home] = s[m.home] || { mp:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0 };
    s[m.away] = s[m.away] || { mp:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0 };
  });
  matches.forEach(function(m) {
    var p = gp && gp[m.id];
    if (!p || p.h === '' || p.h === undefined) return;
    var h = +p.h, a = +p.a;
    s[m.home].mp++; s[m.away].mp++;
    s[m.home].gf += h; s[m.home].ga += a; s[m.home].gd += h - a;
    s[m.away].gf += a; s[m.away].ga += h; s[m.away].gd += a - h;
    if (h > a)      { s[m.home].pts += 3; s[m.home].w++; s[m.away].l++; }
    else if (h < a) { s[m.away].pts += 3; s[m.away].w++; s[m.home].l++; }
    else            { s[m.home].pts++;    s[m.away].pts++; s[m.home].d++; s[m.away].d++; }
  });
  return s;
}

// ── Calculate sorted group standings with FIFA tiebreaker ────────────
// Criteria (in order):
//   H2H: pts → GD → GF among tied teams
//   Overall: GD → GF → alphabetical
function calcStandings(gp, group) {
  var teams = TBG[group].slice();
  var ms    = GMS[group];
  var s     = buildStats(ms, gp);

  function cmp(a, b, subset) {
    var h2h = ms.filter(function(m) {
      return (m.home === a || m.home === b)
          && (m.away === a || m.away === b)
          && subset.indexOf(m.home) >= 0
          && subset.indexOf(m.away) >= 0;
    });
    var h = buildStats(h2h, gp);
    if (h[a] && h[b]) {
      if (h[b].pts !== h[a].pts) return h[b].pts - h[a].pts;
      if (h[b].gd  !== h[a].gd)  return h[b].gd  - h[a].gd;
      if (h[b].gf  !== h[a].gf)  return h[b].gf  - h[a].gf;
    }
    if (s[b].gd !== s[a].gd) return s[b].gd - s[a].gd;
    if (s[b].gf !== s[a].gf) return s[b].gf - s[a].gf;
    return a.localeCompare(b);
  }

  return teams.sort(function(a, b) {
    if (s[b].pts !== s[a].pts) return s[b].pts - s[a].pts;
    var tied = teams.filter(function(t) { return s[t].pts === s[a].pts; });
    if (tied.length > 1) return cmp(a, b, tied);
    return 0;
  }).map(function(t, i) {
    return Object.assign({ team: t, pos: i + 1 }, s[t]);
  });
}

// ── Check if all 6 matches in a group are filled ─────────────────────
function groupDone(gp, g) {
  return GMS[g].every(function(m) {
    var p = gp && gp[m.id];
    return p && p.h !== '' && p.h !== undefined && p.a !== '' && p.a !== undefined;
  });
}

// ── Determine the 32 qualifiers from group predictions ───────────────
// 24 = top 2 per group  |  8 = best third-placed teams
function getR32(gp) {
  var top2 = [], thirds = [], done = 0;
  GROUPS.forEach(function(g) {
    var st = calcStandings(gp, g);
    if (groupDone(gp, g)) done++;
    top2.push(st[0].team, st[1].team);
    thirds.push(Object.assign({ group: g }, st[2]));
  });
  thirds.sort(function(a, b) {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd  !== a.gd)  return b.gd  - a.gd;
    if (b.gf  !== a.gf)  return b.gf  - a.gf;
    return a.team.localeCompare(b.team);
  });
  var best8 = thirds.slice(0, 8);
  return {
    teams:      top2.concat(best8.map(function(x) { return x.team; })),
    best8:      best8,
    complete:   done === 12,
    groupsDone: done
  };
}

// ── Return valid pick options for each KO round (cascade) ────────────
function getCascadeOpts(preds, rid, r32teams) {
  var fb = r32teams.length > 0 ? r32teams
         : GROUPS.reduce(function(a, g) { return a.concat(TBG[g]); }, []);
  if (rid === "r32")      return fb;
  if (rid === "r16")      return (preds.r32  && preds.r32.length  > 0) ? preds.r32  : fb;
  if (rid === "qf")       return (preds.r16  && preds.r16.length  > 0) ? preds.r16  : (preds.r32 && preds.r32.length > 0) ? preds.r32 : fb;
  if (rid === "sf")       return (preds.qf   && preds.qf.length   > 0) ? preds.qf   : (preds.r16 && preds.r16.length > 0) ? preds.r16 : fb;
  if (rid === "final")    return (preds.sf   && preds.sf.length   > 0) ? preds.sf   : (preds.qf  && preds.qf.length  > 0) ? preds.qf  : fb;
  if (rid === "champion") return (preds.final && preds.final.length > 0) ? preds.final : (preds.sf && preds.sf.length > 0) ? preds.sf : fb;
  if (rid === "thirdWin") {
    var t = (preds.sf || []).filter(function(x) { return (preds.final || []).indexOf(x) < 0; });
    return t.length >= 2 ? t : (preds.sf && preds.sf.length > 0) ? preds.sf : fb;
  }
  return fb;
}

// ── Match scoring ────────────────────────────────────────────────────
function oc(h, a) { return h > a ? "H" : h < a ? "A" : "D"; }

function scoreMatch(pred, res) {
  if (!pred || pred.h === '' || pred.h === undefined) return 0;
  if (!res  || res.h  === '' || res.h  === undefined) return 0;
  var ph = +pred.h, pa = +pred.a, rh = +res.h, ra = +res.a;
  var po = oc(ph, pa), ro = oc(rh, ra), p = 0;
  if (po === ro)                        p += 3;
  if (ph === rh)                        p += 1;
  if (pa === ra)                        p += 1;
  if (po === ro && (ph - pa) === (rh - ra)) p += 2;
  return p;
}

function mSt(pred, res) {
  if (!pred || pred.h === '' || pred.h === undefined) return null;
  if (!res  || res.h  === '' || res.h  === undefined) return null;
  var p = scoreMatch(pred, res);
  return p >= 6 ? "exact" : p >= 3 ? "result" : p > 0 ? "partial" : "wrong";
}

// ── Total score + breakdown ──────────────────────────────────────────
function calcScore(preds, results, sc) {
  if (!preds || !results) return { pts: 0, detail: {} };
  var pts = 0, detail = {}, gPts = 0;

  // Group stage
  ALL_MATCHES.forEach(function(m) {
    gPts += scoreMatch(
      preds.groups  && preds.groups[m.id],
      results.groups && results.groups[m.id]
    );
  });
  detail.groups = { earned: gPts }; pts += gPts;

  // Knockout rounds
  ["r32","r16","qf","sf","final"].forEach(function(rid) {
    var p    = preds[rid]   || [];
    var r    = results[rid] || [];
    var hits = p.filter(function(t) { return r.indexOf(t) >= 0; }).length;
    var earned = hits * (sc[rid] || 0);
    detail[rid] = { hits: hits, earned: earned }; pts += earned;
  });

  // Third-place match (auto-derived: SF losers)
  var pT = (preds.sf   || []).filter(function(t) { return (preds.final   || []).indexOf(t) < 0; });
  var rT = (results.sf || []).filter(function(t) { return (results.final || []).indexOf(t) < 0; });
  var tH = pT.filter(function(t) { return rT.indexOf(t) >= 0; }).length;
  var tE = tH * (sc.thirdMatch || 0);
  detail.thirdMatch = { hits: tH, earned: tE }; pts += tE;

  // Champion + 3rd place winner
  ["champion","thirdWin"].forEach(function(k) {
    if (preds[k] && results[k] && preds[k] === results[k]) {
      var e = sc[k] || 0;
      detail[k] = { hits: 1, earned: e }; pts += e;
    } else {
      detail[k] = { hits: 0, earned: 0 };
    }
  });

  return { pts: pts, detail: detail };
}

// ── Tiebreak comparison ──────────────────────────────────────────────
function tiebreak(p, res) {
  var ch  = (p.preds && p.preds.champion === res.champion) ? 1 : 0;
  var r2  = (res.final || []).find(function(t) { return t !== res.champion; }) || "";
  var p2  = (p.preds && p.preds.final || []).find(function(t) { return t !== (p.preds && p.preds.champion); }) || "";
  var fPts = ((p.detail && p.detail.final     && p.detail.final.earned)     || 0)
           + ((p.detail && p.detail.thirdMatch && p.detail.thirdMatch.earned) || 0);
  var sPts =  (p.detail && p.detail.sf && p.detail.sf.earned) || 0;
  var s3  = (p.preds && p.preds.thirdWin === res.thirdWin) ? 1 : 0;
  return [p.pts, ch, p2 === r2 && r2 ? 1 : 0, s3, fPts, sPts];
}

function cmpTb(a, b, res) {
  var ta = tiebreak(a, res), tb = tiebreak(b, res);
  for (var i = 0; i < ta.length; i++) if (ta[i] !== tb[i]) return tb[i] - ta[i];
  return 0;
}
