// Translation packs for languages beyond the built-in Indian ones.
// Each translations/<code>.js file calls addTranslation(code, pack) with:
//   meta:  { name, short, voice, font, dir }   (optional, defaults below)
//   ui:    partial UI strings, missing keys fall back to English
//   works: { <workId>: { titles, mark, copy, kandas: { "<English Kanda>": name },
//                        pages: { <pageId>: [title, hook, body1, body2?, line] } } }
// A language is offered in the menu once it covers at least one whole work;
// pages it lacks show the English text with the usual "not yet translated" note.
// Packs are produced by tools/translate.js and should be reviewed by a native speaker.
var INTL_DEFAULTS = {
  es: { name: "Español", short: "ES", voice: "es-ES" },
  fr: { name: "Français", short: "FR", voice: "fr-FR" },
  de: { name: "Deutsch", short: "DE", voice: "de-DE" },
  pt: { name: "Português", short: "PT", voice: "pt-BR" },
  it: { name: "Italiano", short: "IT", voice: "it-IT" },
  ru: { name: "Русский", short: "RU", voice: "ru-RU" },
  id: { name: "Bahasa Indonesia", short: "ID", voice: "id-ID" },
  th: { name: "ไทย", short: "ไท", voice: "th-TH", font: "'Noto Sans Thai', sans-serif" },
  ja: { name: "日本語", short: "日", voice: "ja-JP", font: "'Noto Sans JP', sans-serif" },
  zh: { name: "中文", short: "中", voice: "zh-CN", font: "'Noto Sans SC', sans-serif" },
  ar: { name: "العربية", short: "ع", voice: "ar-SA", font: "'Noto Naskh Arabic', serif", dir: "rtl" },
  ne: { name: "नेपाली", short: "ने", voice: "ne-NP", font: "'Noto Sans Devanagari', sans-serif" }
};

function addTranslation(code, pack) {
  if (!code || !pack) return;
  var base = INTL_DEFAULTS[code] || { name: code, short: code.toUpperCase(), voice: code };
  var meta = Object.assign({ id: code, font: "Outfit, sans-serif" }, base, pack.meta || {});
  if (!meta.canvas) meta.canvas = meta.font.indexOf("Outfit") === 0 ? "Fraunces, Georgia, serif" : meta.font;

  var complete = false;
  CATALOG.forEach(function (work) {
    var tr = pack.works && pack.works[work.id];
    if (!tr || !work.pages) return;
    if (tr.titles) work.titles[code] = tr.titles;
    if (tr.mark && work.mark) work.mark[code] = tr.mark;
    if (tr.copy && work.copy) work.copy[code] = tr.copy;
    if (tr.kandas && work.kandas) {
      Object.keys(tr.kandas).forEach(function (k) {
        if (work.kandas[k]) work.kandas[k][code] = tr.kandas[k];
      });
    }
    var have = 0;
    work.pages.forEach(function (page) {
      var arr = tr.pages && tr.pages[page.id];
      if (!arr || arr.length < 2) return;
      page.text[code] = splitText(arr);
      have += 1;
    });
    if (work.ready && have === work.pages.length) complete = true;
  });

  var story = Object.assign({}, pack.ui || {}, pack.story || {});
  UI[code] = uiFill(Object.assign({}, UI[code] || {}, story));
  if (pack.extras) I18N_EXTRAS[code] = pack.extras;

  var builtIn = LANGUAGES.some(function (l) { return l.id === code; });
  if (builtIn) return;
  if (!complete) {
    if (typeof console !== "undefined") console.warn("translation " + code + " is incomplete; not offered in the menu");
    return;
  }
  LANGUAGES.push(meta);
}

// Glossary, verse notes and quiz text from packs. Idempotent: depth.js calls it once the
// glossary and notes have loaded, learn.js again once the quizzes have.
var I18N_EXTRAS = {};

function applyExtraTranslations() {
  Object.keys(I18N_EXTRAS).forEach(function (code) {
    var ex = I18N_EXTRAS[code];
    var gloss = ex.glossary || {};
    var entries = (typeof GLOSSARY_TERMS !== "undefined" ? GLOSSARY_TERMS : []).slice();
    if (typeof GLOSSARY_PEOPLE !== "undefined") {
      Object.keys(GLOSSARY_PEOPLE).forEach(function (w) { entries = entries.concat(GLOSSARY_PEOPLE[w]); });
    }
    entries.forEach(function (e) {
      var t = gloss[e.id];
      if (!t) return;
      if (t.name) e.name[code] = t.name;
      if (t.text) e.text[code] = t.text;
      if (t.role && e.role) e.role[code] = t.role;
      if (t.match && t.match.length) e.match[code] = t.match;
      (t.rel || []).forEach(function (label, i) {
        if (label && e.rel && e.rel[i]) e.rel[i][1][code] = label;
      });
    });

    var notes = ex.notes || {};
    if (typeof PAGE_EXTRAS !== "undefined") {
      Object.keys(notes).forEach(function (key) {
        var parts = key.split("/");
        var x = PAGE_EXTRAS[parts[0]] && PAGE_EXTRAS[parts[0]][parts[1]];
        if (!x) return;
        ["meaning", "why", "context"].forEach(function (f) {
          if (notes[key][f] && x[f]) x[f][code] = notes[key][f];
        });
      });
    }

    var quiz = ex.quiz || {};
    if (typeof QUIZZES !== "undefined") {
      Object.keys(quiz).forEach(function (key) {
        var parts = key.split("/");
        var items = QUIZZES[parts[0]] && QUIZZES[parts[0]][parts[1]];
        if (!items) return;
        quiz[key].forEach(function (t, i) {
          if (!items[i] || !t) return;
          items[i].tr = items[i].tr || {};
          items[i].tr[code] = t;
        });
      });
    }
  });
}
