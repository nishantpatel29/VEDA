var SCENE_NAMES = {};

function frameSvg(ch, i, inner) {
  var n = String(i + 1);
  return (
    '<svg viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    "<defs>" +
    '<linearGradient id="sky' + i + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="' + ch.sky + '"/>' +
    '<stop offset="55%" stop-color="' + ch.sky2 + '"/>' +
    '<stop offset="100%" stop-color="' + ch.deep + '"/>' +
    "</linearGradient>" +
    '<radialGradient id="sun' + i + '" cx="50%" cy="50%" r="50%">' +
    '<stop offset="0%" stop-color="#f6e2b8" stop-opacity="0.95"/>' +
    '<stop offset="40%" stop-color="' + ch.mid + '" stop-opacity="0.45"/>' +
    '<stop offset="100%" stop-color="' + ch.mid + '" stop-opacity="0"/>' +
    "</radialGradient>" +
    "</defs>" +
    '<rect width="400" height="560" fill="url(#sky' + i + ')"/>' +
    '<circle class="orb" cx="' + ch.ox + '" cy="' + ch.oy + '" r="78" fill="url(#sun' + i + ')"/>' +
    inner +
    '<text x="22" y="64" fill="#f6e2b8" opacity="0.55" font-family="Fraunces, Georgia, serif" font-size="28">' + n + "</text>" +
    '<rect x="11" y="11" width="378" height="538" fill="none" stroke="#f6e2b8" stroke-opacity="0.32"/>' +
    '<rect x="16" y="16" width="368" height="528" fill="none" stroke="#f6e2b8" stroke-opacity="0.12"/>' +
    "</svg>"
  );
}

function shadow(x, y, rx) {
  return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="7" fill="rgba(0,0,0,.28)"/>';
}

function person(x, y, o) {
  o = o || {};
  var robe = o.robe || "#7a341c";
  var skin = o.skin || "#f2c7a6";
  var hair = o.hair || "#2a140e";
  var h = o.tall || 108;
  var head = y - h + 18;
  var s = shadow(x, y, o.wide ? 22 : 16);
  if (o.sit) {
    s += '<path d="M' + (x - 26) + " " + (y - 6) + " Q" + x + " " + (y - 46) + " " + (x + 26) + " " + (y - 6) + " Z\" fill=\"" + robe + '"/>';
    s += '<circle cx="' + x + '" cy="' + (y - 58) + '" r="13" fill="' + skin + '"/>';
    s += '<path d="M' + (x - 12) + " " + (y - 66) + " Q" + x + " " + (y - 84) + " " + (x + 14) + " " + (y - 62) + "\" fill=\"" + hair + '"/>';
    if (o.staff) s += '<path d="M' + (x + 30) + " " + y + " L" + (x + 18) + " " + (y - 78) + '" stroke="#e7d3a8" stroke-width="2.4" stroke-linecap="round"/>';
    return s;
  }
  s += '<path d="M' + (x - 16) + " " + y + " L" + (x - 10) + " " + (head + 16) + " Q" + x + " " + (head - 4) + " " + (x + 10) + " " + (head + 16) + " L" + (x + 16) + " " + y + ' Z" fill="' + robe + '"/>';
  s += '<circle cx="' + x + '" cy="' + head + '" r="13" fill="' + skin + '"/>';
  s += '<path d="M' + (x - 13) + " " + (head - 2) + " Q" + x + " " + (head - 26) + " " + (x + 14) + " " + (head + 1) + "\" fill=\"" + hair + '"/>';
  if (o.crown) {
    s += '<path d="M' + (x - 12) + " " + (head - 8) + " L" + (x - 8) + " " + (head - 20) + " L" + x + " " + (head - 10) + " L" + (x + 8) + " " + (head - 20) + " L" + (x + 12) + " " + (head - 8) + ' Z" fill="#f0d48a"/>';
  }
  if (o.staff) s += '<path d="M' + (x + 22) + " " + y + " L" + (x + 14) + " " + (head - 8) + '" stroke="#e7d3a8" stroke-width="2.4" stroke-linecap="round"/>';
  if (o.bow) {
    s += '<path d="M' + (x - 8) + " " + (head + 28) + " Q" + (x - 36) + " " + (head + 48) + " " + (x - 6) + " " + (head + 78) + '" fill="none" stroke="#f6e2b8" stroke-width="2"/>';
    s += '<path d="M' + (x - 8) + " " + (head + 28) + " L" + (x - 6) + " " + (head + 78) + '" stroke="#f6e2b8" stroke-width="1.2"/>';
  }
  if (o.axe) {
    s += '<path d="M' + (x + 20) + " " + y + " L" + (x + 8) + " " + (head - 16) + '" stroke="#d9c7a2" stroke-width="2.6"/>';
    s += '<path d="M' + (x + 8) + " " + (head - 16) + " L" + (x + 28) + " " + (head - 8) + " L" + (x + 10) + " " + (head + 2) + ' Z" fill="#c45a3a"/>';
  }
  if (o.tray) {
    s += '<path d="M' + (x - 28) + " " + (y - 48) + " h22 q6 8 -2 10 h-18 q-8-2 -2-10z\" fill=\"#f0d48a\"/>";
  }
  return s;
}

function deer(x, y) {
  return (
    shadow(x, y, 18) +
    '<ellipse cx="' + x + '" cy="' + (y - 16) + '" rx="18" ry="9" fill="#c4a574"/>' +
    '<circle cx="' + (x + 16) + '" cy="' + (y - 24) + '" r="6" fill="#c4a574"/>' +
    '<path d="M' + (x + 12) + " " + (y - 30) + " l-2 -12 M" + (x + 18) + " " + (y - 30) + " l4 -12\" stroke=\"#8a6238\" stroke-width=\"1.6\" fill=\"none\"/>" +
    '<path d="M' + (x - 10) + " " + (y - 8) + " v14 M" + (x + 8) + " " + (y - 8) + ' v14" stroke="#8a6238" stroke-width="1.6"/>'
  );
}

function bird(x, y, down) {
  var tilt = down ? 18 : 0;
  return '<g transform="translate(' + x + " " + y + ") rotate(" + tilt + ')">' +
    '<path d="M-26 0 Q-8 -16 0 0 Q8 -16 26 0" fill="none" stroke="#f6e2b8" stroke-width="2"/>' +
    '<path d="M0 0 v10" stroke="#f6e2b8" stroke-width="1.5"/>' +
    "</g>";
}

function horse(x, y) {
  return (
    shadow(x, y, 36) +
    '<path d="M' + (x - 34) + " " + (y - 8) + " q10 -28 28 -26 l22 -16 6 10 -16 8 q18 4 16 22 l8 18 h-10 l-6 -16 h-22 l-8 16 h-10 z\" fill=\"#f4efe4\"/>" +
    '<path d="M' + (x + 18) + " " + (y - 46) + " q10 4 8 12\" fill=\"none\" stroke=\"#8a6238\" stroke-width=\"2\"/>" +
    '<circle cx="' + (x - 6) + '" cy="' + (y - 28) + '" r="3" fill="#e23d2b"/>'
  );
}

function tree(x, y) {
  return (
    '<path d="M' + x + " " + y + " v-70\" stroke=\"#1c120c\" stroke-width=\"6\"/>" +
    '<path d="M' + (x - 34) + " " + (y - 46) + " L" + x + " " + (y - 130) + " L" + (x + 34) + " " + (y - 46) + ' Z" fill="#14382c"/>' +
    '<path d="M' + (x - 26) + " " + (y - 70) + " L" + x + " " + (y - 150) + " L" + (x + 26) + " " + (y - 70) + ' Z" fill="#1d5240"/>'
  );
}

function fire(x, y) {
  return (
    '<path d="M' + (x - 28) + " " + y + " h56 l-8 -14 h-40 z\" fill=\"#3a2418\"/>" +
    '<path d="M' + x + " " + (y - 10) + " C" + (x - 16) + " " + (y - 28) + " " + (x - 10) + " " + (y - 48) + " " + x + " " + (y - 70) + " C" + (x + 12) + " " + (y - 48) + " " + (x + 18) + " " + (y - 30) + " " + x + " " + (y - 10) + ' Z" fill="#ffb15a"/>' +
    '<path d="M' + x + " " + (y - 16) + " C" + (x - 6) + " " + (y - 30) + " " + (x - 2) + " " + (y - 42) + " " + x + " " + (y - 52) + " C" + (x + 6) + " " + (y - 40) + " " + (x + 8) + " " + (y - 28) + " " + x + " " + (y - 16) + ' Z" fill="#fff1c9"/>'
  );
}

function bowl(x, y) {
  return (
    '<path d="M' + (x - 22) + " " + (y - 20) + " Q" + x + " " + (y + 8) + " " + (x + 22) + " " + (y - 20) + ' Z" fill="#f0d48a"/>' +
    '<ellipse cx="' + x + '" cy="' + (y - 20) + '" rx="22" ry="7" fill="#fff6df"/>' +
    '<path d="M' + (x - 6) + " " + (y - 34) + " q6 -12 12 0\" fill=\"none\" stroke=\"#fff6df\" stroke-width=\"1.5\"/>"
  );
}

function hut(x, y) {
  return (
    '<path d="M' + (x - 40) + " " + y + " v-36 h80 v36\" fill=\"#6a4a32\"/>" +
    '<path d="M' + (x - 52) + " " + (y - 36) + " L" + x + " " + (y - 78) + " L" + (x + 52) + " " + (y - 36) + ' Z" fill="#2f6a45"/>'
  );
}

function gate(x, y) {
  return (
    '<path d="M' + (x - 70) + " " + y + " v-90 h18 v90 z M" + (x + 52) + " " + y + " v-90 h18 v90 z\" fill=\"#f0d7b0\"/>" +
    '<path d="M' + (x - 70) + " " + (y - 90) + " h158 v16 h-158 z\" fill=\"#e7c48a\"/>" +
    '<path d="M' + (x - 46) + " " + y + " v-62 h92 v62\" fill=\"#5c2a22\"/>" +
    '<path d="M' + (x - 46) + " " + (y - 62) + " q46 -28 92 0\" fill=\"none\" stroke=\"#e7c48a\" stroke-width=\"3\"/>"
  );
}

function riverBand() {
  return (
    '<path d="M0 390 Q80 360 150 400 T300 380 T400 410 V560 H0 Z" fill="#0e4c62" opacity=".85"/>' +
    '<path d="M0 430 Q100 400 200 440 T400 430 V560 H0 Z" fill="#1a7e96" opacity=".55"/>'
  );
}

function rainLines() {
  var s = "";
  for (var i = 0; i < 18; i++) {
    var x = 30 + (i * 47) % 340;
    var y = 80 + (i * 29) % 220;
    s += '<path d="M' + x + " " + y + " l-6 16\" stroke=\"#d5f6ff\" stroke-width=\"1.3\" opacity=\".75\"/>";
  }
  return s;
}

function mountain(x, y, w, h, fill) {
  return '<path d="M' + (x - w) + " " + y + " L" + x + " " + (y - h) + " L" + (x + w) + " " + y + ' Z" fill="' + fill + '"/>';
}

function bigBow(x, y, broken) {
  if (broken) {
    return (
      '<path d="M' + (x - 70) + " " + (y - 20) + " Q" + x + " " + (y - 80) + " " + (x + 10) + " " + (y - 10) + '" fill="none" stroke="#f6e2b8" stroke-width="4"/>' +
      '<path d="M' + (x + 18) + " " + (y + 6) + " Q" + (x + 40) + " " + (y + 30) + " " + (x + 78) + " " + (y - 8) + '" fill="none" stroke="#f6e2b8" stroke-width="4"/>' +
      '<path d="M' + x + " " + (y - 36) + " l8 14 10 -6\" fill=\"none\" stroke=\"#ffb15a\" stroke-width=\"2\"/>"
    );
  }
  return (
    '<path d="M' + (x - 50) + " " + (y - 70) + " Q" + (x - 110) + " " + y + " " + (x - 50) + " " + (y + 70) + '" fill="none" stroke="#f6e2b8" stroke-width="5"/>' +
    '<path d="M' + (x - 50) + " " + (y - 70) + " L" + (x - 50) + " " + (y + 70) + '" stroke="#f6e2b8" stroke-width="1.6"/>' +
    '<path d="M' + (x - 20) + " " + y + " h70 l-14 -10 m14 10 l-14 10\" fill=\"none\" stroke=\"#ffb15a\" stroke-width=\"2\"/>"
  );
}

function cradle(x, y) {
  return (
    '<path d="M' + (x - 16) + " " + (y - 8) + " q16 16 32 0\" fill=\"none\" stroke=\"#f0d48a\" stroke-width=\"2\"/>" +
    '<circle cx="' + x + '" cy="' + (y - 18) + '" r="6" fill="#f2c7a6"/>'
  );
}

var SCENES = {
  talk: function (b) {
    return tree(78, 500) + person(168, 500, { sit: 1, staff: 1, robe: "#5c3d32" }) + person(268, 500, { sit: 1, robe: "#7a4a28", staff: b === 1 });
  },
  birds: function (b) {
    return riverBand() + tree(60, 470) + bird(150, b === 2 ? 250 : 180, b === 2) + bird(220, 200, 0) + (b > 0 ? person(320, 490, { bow: 1, robe: "#3e4a32", tall: 96 }) : "");
  },
  write: function (b) {
    return tree(70, 500) + person(200, 500, { sit: 1, staff: b === 0, robe: "#5c3d32" }) +
      '<rect x="250" y="430" width="36" height="48" rx="3" fill="#f3e2c2"/>' +
      '<path d="M258 446 h20 M258 456 h16 M258 466 h18" stroke="#8a6238" stroke-width="1.2"/>' +
      (b > 0 ? '<circle cx="300" cy="160" r="10" fill="#fff6df"/>' : "");
  },
  sing: function () {
    return gate(200, 470) + person(120, 500, { tall: 78, robe: "#e0b15a" }) + person(168, 500, { tall: 78, robe: "#e0b15a" }) + person(280, 490, { sit: 1, crown: 1, robe: "#8d2a3a" });
  },
  city: function (b) {
    return gate(200, 500) + (b ? person(90, 500, { tall: 84, robe: "#c47b2b" }) : "") + (b > 1 ? person(300, 500, { tall: 90, robe: "#a33b4a", crown: 1 }) : person(300, 500, { tall: 96, crown: 1, robe: "#8d2a3a" }));
  },
  king: function (b) {
    return gate(250, 480) + person(150, 500, { sit: 1, crown: 1, robe: "#8d2a3a" }) + (b === 2 ? "" : '<rect x="230" y="430" width="70" height="8" fill="#e7c48a" opacity=".4"/>');
  },
  horse: function () {
    return horse(180, 500) + person(300, 490, { staff: 1, robe: "#5c3d32", tall: 100 });
  },
  drought: function () {
    return '<path d="M40 470 q30 -18 60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="#c4a574" stroke-width="2"/>' + person(200, 500, { crown: 1, robe: "#8d2a3a" });
  },
  horn: function (b) {
    return tree(80, 500) + tree(320, 490) + deer(150, 500) + person(230, 500, { tall: 96, robe: "#d8c4a0", hair: "#6a4020" }) + (b === 0 ? "" : "");
  },
  visit: function (b) {
    return hut(250, 490) + person(120, 500, { tray: 1, robe: "#a33b4a", tall: 100 }) + person(70, 500, { robe: "#7a3450", tall: 96 }) + (b > 0 ? person(230, 500, { tall: 90, robe: "#d8c4a0" }) : deer(200, 510));
  },
  rain: function () {
    return rainLines() + gate(200, 510) + person(120, 510, { tall: 90, robe: "#c47b2b" });
  },
  fire: function (b) {
    return fire(200, 500) + person(90, 500, { staff: 1, robe: "#5c3d32" }) + person(300, 500, { crown: 1, robe: "#8d2a3a" }) + (b > 1 ? bowl(200, 400) : "");
  },
  bowl: function () {
    return bowl(200, 430) + person(90, 500, { robe: "#a33b4a", tall: 100 }) + person(200, 510, { robe: "#7a3458", tall: 100 }) + person(310, 500, { robe: "#c45a78", tall: 96 });
  },
  cradles: function () {
    return cradle(80, 470) + cradle(150, 490) + cradle(230, 470) + cradle(310, 490) + person(200, 520, { robe: "#a33b4a", tall: 100 });
  },
  school: function () {
    return tree(60, 500) + person(120, 500, { sit: 1, staff: 1, robe: "#5c3d32" }) + person(210, 510, { tall: 78, robe: "#e0b15a" }) + person(250, 510, { tall: 74, robe: "#c47b2b" }) + person(290, 510, { tall: 76, robe: "#d8a24a" }) + person(330, 510, { tall: 72, robe: "#e6c27a" });
  },
  gate: function () {
    return gate(230, 500) + person(100, 500, { staff: 1, tall: 130, robe: "#6a4a32", hair: "#1a100c" });
  },
  road: function (b) {
    return '<path d="M40 520 C120 480 200 540 360 470" fill="none" stroke="#e7c48a" stroke-width="3" opacity=".7"/>' + person(90, 500, { staff: 1, tall: 120, robe: "#6a4a32" }) + person(180, 510, { bow: 1, tall: 96, robe: "#e0b15a" }) + person(240, 515, { tall: 90, robe: "#c47b2b" }) + (b === 0 ? person(330, 490, { crown: 1, robe: "#8d2a3a", tall: 100 }) : "");
  },
  forest: function () {
    return tree(70, 510) + tree(150, 520) + tree(300, 500) + tree(360, 520);
  },
  demon: function (b) {
    return tree(50, 510) + tree(360, 500) + person(250, 510, { tall: b === 2 ? 150 : 140, robe: "#1e3328", hair: "#0e1a14", wide: 1 }) + person(110, 510, { bow: 1, tall: 96, robe: "#e0b15a" });
  },
  weapons: function () {
    var lights = "";
    for (var i = 0; i < 7; i++) lights += '<path d="M' + (80 + i * 36) + ' 120 l8 40" stroke="#fff1c9" stroke-width="2" opacity=".8"/>';
    return lights + person(200, 510, { bow: 1, tall: 110, robe: "#e0b15a" });
  },
  yagna: function () {
    return fire(200, 500) + person(110, 500, { bow: 1, robe: "#e0b15a" }) + person(290, 500, { staff: 1, robe: "#5c3d32" });
  },
  defend: function (b) {
    return fire(160, 510) + person(80, 510, { bow: 1, robe: "#e0b15a" }) + person(300, b === 1 ? 430 : 500, { tall: 120, robe: "#1e3328" }) + (b === 1 ? '<path d="M300 430 q40 -40 70 20" fill="none" stroke="#ffb15a" stroke-width="2" stroke-dasharray="4 4"/>' : "");
  },
  walk: function () {
    return '<path d="M20 500 H380" stroke="#e7c48a" stroke-width="2" opacity=".5"/>' + person(120, 500, { staff: 1, tall: 120, robe: "#6a4a32" }) + person(210, 510, { bow: 1, robe: "#e0b15a" }) + person(270, 515, { robe: "#c47b2b", tall: 90 });
  },
  flower: function () {
    return person(250, 500, { sit: 1, hair: "#c8b8a0", robe: "#d8d0c4" }) + person(120, 500, { bow: 1, robe: "#d46a8a", tall: 100 }) + '<circle cx="150" cy="360" r="5" fill="#f6b6c8"/><circle cx="170" cy="340" r="4" fill="#fff"/>';
  },
  eye: function (b) {
    return mountain(200, 520, 150, 220, "#3a342c") + '<circle cx="200" cy="340" r="' + (b ? 8 : 4) + '" fill="#ffb15a"/>' + (b ? '<g opacity=".7">' + person(120, 500, { robe: "#d46a8a", tall: 70 }) + "</g>" : person(100, 500, { bow: 1, robe: "#d46a8a", tall: 96 }));
  },
  uma: function () {
    return mountain(240, 520, 120, 180, "#4a4038") + person(140, 500, { robe: "#f0d7b0", tall: 110 });
  },
  spear: function () {
    return '<path d="M60 480 q40 -20 80 0 t80 0 t80 0 t80 0" fill="none" stroke="#7dcea0" stroke-width="3"/>' + person(200, 500, { staff: 1, tall: 100, robe: "#e0b15a" }) + '<circle cx="120" cy="200" r="6" fill="#fff6df"/><circle cx="160" cy="170" r="5" fill="#fff6df"/><circle cx="210" cy="160" r="6" fill="#fff6df"/><circle cx="250" cy="180" r="5" fill="#fff6df"/><circle cx="290" cy="200" r="5" fill="#fff6df"/><circle cx="200" cy="210" r="4" fill="#fff6df"/>';
  },
  ashes: function (b) {
    var mounds = "";
    for (var i = 0; i < 8; i++) mounds += '<ellipse cx="' + (40 + i * 42) + '" cy="470" rx="16" ry="6" fill="#6a645c"/>';
    return mounds + (b ? person(200, 450, { sit: 1, robe: "#f0e6d4", hair: "#efe8dc" }) : horse(300, 470));
  },
  dig: function () {
    return '<path d="M40 430 h320 v80 H40z" fill="#3a2c22"/>' + person(120, 500, { tall: 80, robe: "#8d5a32" }) + person(190, 510, { tall: 80, robe: "#a86b3c" }) + person(260, 500, { tall: 80, robe: "#8d5a32" }) + horse(330, 430);
  },
  tapas: function () {
    return mountain(300, 520, 90, 140, "#3a4450") + person(140, 500, { tall: 120, robe: "#f0d7b0", staff: 1 });
  },
  hair: function (b) {
    return mountain(210, 530, 160, 240, "#2c3338") +
      '<path d="M120 250 Q160 180 200 230 T280 200 T320 260" fill="none" stroke="#d8d0c4" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M160 80 Q200 ' + (b ? 200 : 140) + ' 230 300" fill="none" stroke="#9ee7f5" stroke-width="6"/>' +
      (b > 1 ? '<path d="M200 320 Q180 400 210 480" fill="none" stroke="#9ee7f5" stroke-width="4"/>' : "");
  },
  release: function () {
    return riverBand() + '<ellipse cx="180" cy="450" rx="50" ry="10" fill="#6a645c"/>' + '<circle cx="160" cy="420" r="3" fill="#fff6df"/><circle cx="190" cy="400" r="3" fill="#fff6df"/><circle cx="210" cy="424" r="2.5" fill="#fff6df"/>' + person(300, 490, { staff: 1, robe: "#f0d7b0", tall: 110 });
  },
  stone: function () {
    return tree(80, 500) + person(210, 500, { sit: 1, robe: "#8d8a84", hair: "#6e6a64", skin: "#c8c4bc" });
  },
  rise: function () {
    return tree(80, 500) + person(230, 500, { robe: "#f0d7b0", tall: 110 }) + person(120, 510, { bow: 1, robe: "#e0b15a", tall: 100 });
  },
  furrow: function (b) {
    return '<path d="M40 470 H360" stroke="#6a4a32" stroke-width="8"/>' + '<path d="M60 470 q20 -30 0 -50" fill="none" stroke="#c4a574" stroke-width="3"/>' + person(150, 500, { crown: 1, robe: "#8d2a3a" }) + (b ? '<circle cx="250" cy="450" r="8" fill="#f2c7a6"/>' : "");
  },
  hall: function (b) {
    return bigBow(230, 300, 0) + person(80, 510, { tall: 88, crown: 1, robe: "#6a3a4a" }) + (b > 0 ? person(140, 515, { tall: 84, robe: "#5c4038" }) : "") + (b > 1 ? person(300, 510, { bow: 1, tall: 104, robe: "#e0b15a" }) : "");
  },
  snap: function () {
    return bigBow(200, 280, 1) + person(300, 510, { bow: 1, tall: 108, robe: "#e0b15a" }) + person(90, 510, { crown: 1, robe: "#8d2a3a", tall: 96 });
  },
  fires: function (b) {
    return fire(70, 510) + fire(150, 520) + fire(240, 510) + fire(320, 520) + (b ? person(110, 490, { tall: 84, robe: "#e0b15a" }) + person(200, 490, { tall: 90, robe: "#a33b4a" }) : "");
  },
  axe: function () {
    return '<path d="M20 500 H380" stroke="#c4a574" stroke-width="4"/>' + person(120, 500, { axe: 1, tall: 145, robe: "#6a2a22", hair: "#1a0c0a" }) + person(280, 510, { bow: 1, tall: 100, robe: "#e0b15a" });
  },
  string: function (b) {
    return bigBow(250, 280, 0) + person(100, 510, { axe: 1, tall: b > 1 ? 120 : 140, robe: "#6a2a22" }) + person(200, 515, { bow: 1, robe: "#e0b15a", tall: 100 });
  }
};

Object.keys(SCENES).forEach(function (k) { SCENE_NAMES[k] = 1; });

function paint(story, i) {
  var ch = null;
  for (var n = 0; n < CHAPTERS.length; n++) {
    if (CHAPTERS[n].id === story.chapter) ch = CHAPTERS[n];
  }
  if (!ch) ch = CHAPTERS[0];
  var draw = SCENES[story.scene] || SCENES.city;
  return frameSvg(ch, i, draw(story.beat || 0));
}
