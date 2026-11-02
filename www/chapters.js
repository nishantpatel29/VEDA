var CHAPTERS = [
  { id: "poet", en: "The Poet", hi: "कवि", short: "Poet", shortHi: "कवि", mid: "#c4b2f5", deep: "#14101c", sky: "#3a2d6e", sky2: "#211845", ox: 280, oy: 140 },
  { id: "sing", en: "The Singing", hi: "गान", short: "Song", shortHi: "गान", mid: "#f0a35a", deep: "#241109", sky: "#c4622c", sky2: "#6a3016", ox: 300, oy: 130 },
  { id: "ayodhya", en: "Ayodhya", hi: "अयोध्या", short: "Ayodhya", shortHi: "अयोध्या", mid: "#f0a35a", deep: "#241109", sky: "#c4622c", sky2: "#6a3016", ox: 300, oy: 120 },
  { id: "rishya", en: "Rishyashringa", hi: "ऋष्यशृंग", short: "Rishya", shortHi: "ऋष्यशृंग", mid: "#7dcea0", deep: "#071410", sky: "#1c6b52", sky2: "#0c3328", ox: 80, oy: 120 },
  { id: "rite", en: "The Sacrifice", hi: "यज्ञ", short: "Rite", shortHi: "यज्ञ", mid: "#ff8a62", deep: "#160806", sky: "#a33b24", sky2: "#5c1c14", ox: 300, oy: 130 },
  { id: "sons", en: "Four Sons", hi: "चार पुत्र", short: "Sons", shortHi: "पुत्र", mid: "#f0a35a", deep: "#241109", sky: "#c4622c", sky2: "#6a3016", ox: 260, oy: 140 },
  { id: "child", en: "Childhood", hi: "बाल्य", short: "Youth", shortHi: "बाल्य", mid: "#f0b15a", deep: "#1a0e07", sky: "#c56b22", sky2: "#6a3812", ox: 80, oy: 130 },
  { id: "ask", en: "The Asking", hi: "याचना", short: "Ask", shortHi: "याचना", mid: "#f07198", deep: "#1c0a12", sky: "#8d2448", sky2: "#4a1028", ox: 300, oy: 120 },
  { id: "tataka", en: "Tataka", hi: "ताटका", short: "Tataka", shortHi: "ताटका", mid: "#7dcea0", deep: "#071410", sky: "#145c40", sky2: "#0c3328", ox: 70, oy: 110 },
  { id: "astra", en: "The Weapons", hi: "अस्त्र", short: "Astras", shortHi: "अस्त्र", mid: "#f0a35a", deep: "#1a0e07", sky: "#8a4a18", sky2: "#3a220c", ox: 280, oy: 120 },
  { id: "road", en: "On the Road", hi: "मार्ग", short: "Road", shortHi: "मार्ग", mid: "#f0b15a", deep: "#1a0e07", sky: "#a85a20", sky2: "#4a280e", ox: 90, oy: 140 },
  { id: "ganga", en: "The Descent", hi: "गंगावतरण", short: "Ganga", shortHi: "गंगा", mid: "#7ee0ef", deep: "#061318", sky: "#14788a", sky2: "#0a3c48", ox: 80, oy: 150 },
  { id: "ahalya", en: "Ahalya", hi: "अहिल्या", short: "Ahalya", shortHi: "अहिल्या", mid: "#e7d7c4", deep: "#16120e", sky: "#6a5a48", sky2: "#2e261c", ox: 260, oy: 130 },
  { id: "bow", en: "The Bow", hi: "धनुष", short: "Bow", shortHi: "धनुष", mid: "#f0a35a", deep: "#241109", sky: "#b85a28", sky2: "#5a2c12", ox: 300, oy: 120 },
  { id: "wed", en: "The Weddings", hi: "विवाह", short: "Wedding", shortHi: "विवाह", mid: "#ff8a62", deep: "#1a0a0c", sky: "#a33b24", sky2: "#4a1418", ox: 280, oy: 140 },
  { id: "axe", en: "Parashurama", hi: "परशुराम", short: "Axe", shortHi: "परशु", mid: "#ff8a62", deep: "#160806", sky: "#7a3020", sky2: "#3a140e", ox: 300, oy: 110 },
  { id: "home", en: "The Return", hi: "वापसी", short: "Return", shortHi: "वापसी", mid: "#f0a35a", deep: "#241109", sky: "#c4622c", sky2: "#6a3016", ox: 280, oy: 130 },
  { id: "vow", en: "The Boons", hi: "दो वर", short: "Boons", shortHi: "वर", mid: "#f07198", deep: "#1c0a12", sky: "#8d2448", sky2: "#4a1028", ox: 300, oy: 120 },
  { id: "depart", en: "The Exile", hi: "वनगमन", short: "Exile", shortHi: "वन", mid: "#9bb7d4", deep: "#0c1420", sky: "#3a5270", sky2: "#1a2838", ox: 80, oy: 140 },
  { id: "bharata", en: "Bharata", hi: "भरत", short: "Bharata", shortHi: "भरत", mid: "#e6c27a", deep: "#1a1208", sky: "#8a6230", sky2: "#3a2810", ox: 260, oy: 130 },
  { id: "panchavati", en: "Panchavati", hi: "पंचवटी", short: "Forest", shortHi: "वन", mid: "#7dcea0", deep: "#071410", sky: "#145c40", sky2: "#0c3328", ox: 70, oy: 120 },
  { id: "deer", en: "The Taking", hi: "हरण", short: "Taking", shortHi: "हरण", mid: "#e8a05a", deep: "#1a1008", sky: "#a85a20", sky2: "#4a280e", ox: 90, oy: 130 },
  { id: "kishkindha", en: "Kishkindha", hi: "किष्किंधा", short: "Kishkindha", shortHi: "किष्किंधा", mid: "#d4a574", deep: "#1a1408", sky: "#8a5a28", sky2: "#3a2410", ox: 280, oy: 140 },
  { id: "sundara", en: "Sundara", hi: "सुंदरकांड", short: "Sundara", shortHi: "सुंदर", mid: "#d6c15a", deep: "#10180c", sky: "#6a7820", sky2: "#2e340e", ox: 80, oy: 110 },
  { id: "yuddha", en: "The War", hi: "युद्ध", short: "War", shortHi: "युद्ध", mid: "#e07070", deep: "#160606", sky: "#7a2820", sky2: "#3a100e", ox: 300, oy: 110 },
  { id: "crown", en: "The Crown", hi: "राज्याभिषेक", short: "Crown", shortHi: "राज", mid: "#f0a35a", deep: "#241109", sky: "#c4622c", sky2: "#6a3016", ox: 280, oy: 120 },
  { id: "uttara", en: "Uttara", hi: "उत्तरकांड", short: "Uttara", shortHi: "उत्तर", mid: "#c4b8a8", deep: "#0c1218", sky: "#4a5560", sky2: "#1c242c", ox: 80, oy: 150 }
];

var BOOKS = {
  poet: ["Bala Kanda", "बालकांड"],
  sing: ["Bala Kanda", "बालकांड"],
  ayodhya: ["Bala Kanda", "बालकांड"],
  rishya: ["Bala Kanda", "बालकांड"],
  rite: ["Bala Kanda", "बालकांड"],
  sons: ["Bala Kanda", "बालकांड"],
  child: ["Bala Kanda", "बालकांड"],
  ask: ["Bala Kanda", "बालकांड"],
  tataka: ["Bala Kanda", "बालकांड"],
  astra: ["Bala Kanda", "बालकांड"],
  road: ["Bala Kanda", "बालकांड"],
  ganga: ["Bala Kanda", "बालकांड"],
  ahalya: ["Bala Kanda", "बालकांड"],
  bow: ["Bala Kanda", "बालकांड"],
  wed: ["Bala Kanda", "बालकांड"],
  axe: ["Bala Kanda", "बालकांड"],
  home: ["Bala Kanda", "बालकांड"],
  vow: ["Ayodhya Kanda", "अयोध्याकांड"],
  depart: ["Ayodhya Kanda", "अयोध्याकांड"],
  bharata: ["Ayodhya Kanda", "अयोध्याकांड"],
  panchavati: ["Aranya Kanda", "अरण्यकांड"],
  deer: ["Aranya Kanda", "अरण्यकांड"],
  kishkindha: ["Kishkindha Kanda", "किष्किंधाकांड"],
  sundara: ["Sundara Kanda", "सुंदरकांड"],
  yuddha: ["Yuddha Kanda", "युद्धकांड"],
  crown: ["Yuddha Kanda", "युद्धकांड"],
  uttara: ["Uttara Kanda", "उत्तरकांड"]
};

function splitText(arr) {
  if (arr.length >= 5) {
    return { title: arr[0], hook: arr[1], body: [arr[2], arr[3]], line: arr[4] };
  }
  return { title: arr[0], hook: arr[1], body: arr[2] ? [arr[2]] : [], line: arr[3] || "" };
}

function P(id, image, chapter, e, h, more) {
  var text = { en: splitText(e), hi: splitText(h) };
  if (more) {
    Object.keys(more).forEach(function (code) {
      if (more[code] && more[code].length) text[code] = splitText(more[code]);
    });
  }
  return {
    id: id,
    image: image,
    chapter: chapter,
    text: text,
    en: text.en,
    hi: text.hi
  };
}
