// ── Group / Team definitions ─────────────────────────────────────────
var TBG = {
  A: ["Mexico","South Africa","South Korea","Playoff D"],
  B: ["Canada","Playoff A","Qatar","Switzerland"],
  C: ["Brazil","Morocco","Haiti","Scotland"],
  D: ["USA","Paraguay","Australia","Playoff C"],
  E: ["Germany","Cura\u00e7ao","Ivory Coast","Ecuador"],
  F: ["Netherlands","Japan","Playoff B","Tunisia"],
  G: ["Belgium","Egypt","Iran","New Zealand"],
  H: ["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I: ["France","Senegal","Playoff 2","Norway"],
  J: ["Argentina","Algeria","Austria","Jordan"],
  K: ["Portugal","Playoff 1","Uzbekistan","Colombia"],
  L: ["England","Croatia","Ghana","Panama"]
};
var GROUPS = Object.keys(TBG);

// ── Flag emoji map ───────────────────────────────────────────────────
var FL = {
  Mexico:"\ud83c\uddf2\ud83c\uddfd","South Africa":"\ud83c\uddff\ud83c\udde6","South Korea":"\ud83c\uddf0\ud83c\uddf7",
  Canada:"\ud83c\udde8\ud83c\udde6",Qatar:"\ud83c\uddf6\ud83c\udde6",Switzerland:"\ud83c\udde8\ud83c\udded",
  Brazil:"\ud83c\udde7\ud83c\uddf7",Morocco:"\ud83c\uddf2\ud83c\udde6",Haiti:"\ud83c\udded\ud83c\uddf9",Scotland:"\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f",
  USA:"\ud83c\uddfa\ud83c\uddf8",Paraguay:"\ud83c\uddf5\ud83c\uddfe",Australia:"\ud83c\udde6\ud83c\uddfa",
  Germany:"\ud83c\udde9\ud83c\uddea","Ivory Coast":"\ud83c\udde8\ud83c\uddee",Ecuador:"\ud83c\uddea\ud83c\udde8",
  Netherlands:"\ud83c\uddf3\ud83c\uddf1",Japan:"\ud83c\uddef\ud83c\uddf5",Tunisia:"\ud83c\uddf9\ud83c\uddf3",
  Belgium:"\ud83c\udde7\ud83c\uddea",Egypt:"\ud83c\uddea\ud83c\uddec",Iran:"\ud83c\uddee\ud83c\uddf7","New Zealand":"\ud83c\uddf3\ud83c\uddff",
  Spain:"\ud83c\uddea\ud83c\uddf8","Cape Verde":"\ud83c\udde8\ud83c\uddfb","Saudi Arabia":"\ud83c\uddf8\ud83c\udde6",Uruguay:"\ud83c\uddfa\ud83c\uddfe",
  France:"\ud83c\uddeb\ud83c\uddf7",Senegal:"\ud83c\uddf8\ud83c\uddf3",Norway:"\ud83c\uddf3\ud83c\uddf4",
  Argentina:"\ud83c\udde6\ud83c\uddf7",Algeria:"\ud83c\udde9\ud83c\uddff",Austria:"\ud83c\udde6\ud83c\uddf9",Jordan:"\ud83c\uddef\ud83c\uddf4",
  Portugal:"\ud83c\uddf5\ud83c\uddf9",Uzbekistan:"\ud83c\uddfa\ud83c\uddff",Colombia:"\ud83c\udde8\ud83c\uddf4",
  England:"\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f",Croatia:"\ud83c\udded\ud83c\uddf7",Ghana:"\ud83c\uddec\ud83c\udded",Panama:"\ud83c\uddf5\ud83c\udde6",
  "Cura\u00e7ao":"\ud83c\udde8\ud83c\uddfc"
};
function fl(t) { return FL[t] || "\ud83c\udff3\ufe0f"; }

// ── Generate all group matches (6 per group, 72 total) ───────────────
var GMS = {};
GROUPS.forEach(function(g) {
  var t = TBG[g], ms = [];
  for (var i = 0; i < 4; i++)
    for (var j = i + 1; j < 4; j++)
      ms.push({ id: g + (ms.length + 1), g: g, home: t[i], away: t[j] });
  GMS[g] = ms;
});
var ALL_MATCHES = GROUPS.reduce(function(a, g) { return a.concat(GMS[g]); }, []);

// ── Knockout round definitions ───────────────────────────────────────
var KODEFS = [
  { id: "r32",      pick: 32 },
  { id: "r16",      pick: 16 },
  { id: "qf",       pick: 8  },
  { id: "sf",       pick: 4  },
  { id: "final",    pick: 2  },
  { id: "champion", pick: 1  },
  { id: "thirdWin", pick: 1  }
];

// ── App defaults ─────────────────────────────────────────────────────
var DEF = {
  adminPw:    "PuraFoda888!",
  entryFee:   40,
  currency:   "AUD",
  adminEmail: "",
  scoring: {
    groupResult: 3,
    groupGoalA:  1,
    groupGoalB:  1,
    groupDiff:   2,
    r32:         1,
    r16:         2,
    qf:          4,
    sf:          6,
    final:       10,
    thirdMatch:  8,
    champion:    20,
    thirdWin:    15
  },
  ejs: { svc: "", tpl_invite: "", tpl_update: "", tpl_admin: "", key: "" }
};

// ── Empty prediction / result templates ─────────────────────────────
var EP = { groups: {}, r32: [], r16: [], qf: [], sf: [], final: [], champion: "", thirdWin: "" };
var ER = { groups: {}, r32: [], r16: [], qf: [], sf: [], final: [], champion: "", thirdWin: "" };

// ── Claude's pre-seeded predictions ─────────────────────────────────
var CLAUDE_ENTRY = {
  id: "claude_bot",
  name: "Claude \ud83e\udd16",
  email: "claude@anthropic.com",
  preds: {
    groups: {
      A1:{h:"2",a:"0"},A2:{h:"1",a:"1"},A3:{h:"2",a:"1"},A4:{h:"0",a:"2"},A5:{h:"1",a:"1"},A6:{h:"2",a:"0"},
      B1:{h:"1",a:"1"},B2:{h:"3",a:"0"},B3:{h:"1",a:"2"},B4:{h:"2",a:"0"},B5:{h:"1",a:"2"},B6:{h:"0",a:"2"},
      C1:{h:"2",a:"1"},C2:{h:"4",a:"0"},C3:{h:"3",a:"0"},C4:{h:"2",a:"0"},C5:{h:"1",a:"1"},C6:{h:"0",a:"2"},
      D1:{h:"2",a:"1"},D2:{h:"2",a:"0"},D3:{h:"1",a:"0"},D4:{h:"1",a:"1"},D5:{h:"2",a:"1"},D6:{h:"1",a:"0"},
      E1:{h:"4",a:"0"},E2:{h:"2",a:"1"},E3:{h:"2",a:"0"},E4:{h:"0",a:"2"},E5:{h:"0",a:"3"},E6:{h:"1",a:"1"},
      F1:{h:"2",a:"1"},F2:{h:"2",a:"0"},F3:{h:"3",a:"0"},F4:{h:"1",a:"1"},F5:{h:"2",a:"0"},F6:{h:"1",a:"0"},
      G1:{h:"3",a:"1"},G2:{h:"2",a:"0"},G3:{h:"3",a:"0"},G4:{h:"1",a:"1"},G5:{h:"2",a:"0"},G6:{h:"1",a:"0"},
      H1:{h:"4",a:"0"},H2:{h:"2",a:"0"},H3:{h:"1",a:"0"},H4:{h:"1",a:"1"},H5:{h:"0",a:"2"},H6:{h:"1",a:"2"},
      I1:{h:"2",a:"1"},I2:{h:"3",a:"0"},I3:{h:"2",a:"1"},I4:{h:"2",a:"0"},I5:{h:"1",a:"2"},I6:{h:"0",a:"2"},
      J1:{h:"2",a:"0"},J2:{h:"2",a:"1"},J3:{h:"3",a:"0"},J4:{h:"1",a:"1"},J5:{h:"2",a:"0"},J6:{h:"2",a:"1"},
      K1:{h:"3",a:"0"},K2:{h:"3",a:"0"},K3:{h:"2",a:"1"},K4:{h:"0",a:"1"},K5:{h:"0",a:"2"},K6:{h:"0",a:"2"},
      L1:{h:"2",a:"0"},L2:{h:"3",a:"1"},L3:{h:"4",a:"0"},L4:{h:"2",a:"1"},L5:{h:"2",a:"0"},L6:{h:"1",a:"1"}
    },
    r32: ["Spain","France","Brazil","Argentina","Germany","England","Portugal","Netherlands",
          "Morocco","Colombia","USA","Japan","South Korea","Norway","Uruguay","Senegal",
          "Mexico","Belgium","Ecuador","Croatia","Switzerland","Australia","Ivory Coast","Tunisia",
          "Austria","Algeria","Uzbekistan","Jordan","Ghana","Scotland","Canada","Norway"],
    r16:      ["Spain","France","Brazil","Argentina","Germany","England","Portugal","Netherlands","Morocco","Colombia","USA","Japan","South Korea","Norway","Uruguay","Senegal"],
    qf:       ["Spain","France","Brazil","Argentina","Germany","England","Portugal","Colombia"],
    sf:       ["Spain","France","Brazil","Argentina"],
    final:    ["Spain","France"],
    champion: "Spain",
    thirdWin: "Brazil"
  }
};
