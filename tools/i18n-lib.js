// Shared helpers for the translation tools (export-source, build-translations, translate).
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");

// UI lines that belong to the story and follow the reading language.
var storyKeys = ["gateTitle", "gateBody", "epicEnd", "nextWord"];

var CORE = ["chapters.js", "pages-a.js", "pages-b.js", "pages-c.js", "stories.js", "catalog.js", "books.js", "i18n.js"];
var EXTRA = ["glossary.js", "extras.js", "quiz-data.js"];

function loadApp(opts) {
  var ctx = { console: console };
  ctx.window = ctx;
  vm.createContext(ctx);
  CORE.concat(opts && opts.extras ? EXTRA : []).forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
  });
  vm.runInContext(
    "this.__out = { CATALOG: CATALOG, UI_EN: UI_EN, UI: UI, LANGUAGES: LANGUAGES, INTL: INTL_DEFAULTS," +
    " TERMS: typeof GLOSSARY_TERMS !== 'undefined' ? GLOSSARY_TERMS : []," +
    " PEOPLE: typeof GLOSSARY_PEOPLE !== 'undefined' ? GLOSSARY_PEOPLE : {}," +
    " NOTES: typeof PAGE_EXTRAS !== 'undefined' ? PAGE_EXTRAS : {}," +
    " QUIZ: typeof QUIZZES !== 'undefined' ? QUIZZES : {} };",
    ctx
  );
  var out = ctx.__out;
  out.works = out.CATALOG.filter(function (w) { return w.ready && w.pages; });
  return out;
}

function flatten(text) {
  return [text.title, text.hook].concat(text.body || []).concat([text.line || ""]);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function extrasSource(app) {
  var glossary = {};
  app.TERMS.concat(app.PEOPLE.ramayana || []).forEach(function (e) {
    glossary[e.id] = {
      name: e.name.en,
      role: e.role ? e.role.en : undefined,
      text: e.text.en,
      rel: (e.rel || []).map(function (r) { return r[1].en; })
    };
  });
  var notes = {};
  Object.keys(app.NOTES).forEach(function (work) {
    Object.keys(app.NOTES[work]).forEach(function (pid) {
      var x = app.NOTES[work][pid];
      notes[work + "/" + pid] = {
        meaning: x.meaning ? x.meaning.en : undefined,
        why: x.why ? x.why.en : undefined,
        context: x.context ? x.context.en : undefined
      };
    });
  });
  var quiz = {};
  Object.keys(app.QUIZ).forEach(function (work) {
    Object.keys(app.QUIZ[work]).forEach(function (kanda) {
      quiz[work + "/" + kanda] = app.QUIZ[work][kanda].map(function (item) {
        return { q: item.q[0], a: item.a.map(function (a) { return a[0]; }) };
      });
    });
  });
  return { glossary: glossary, notes: notes, quiz: quiz };
}

module.exports = { root: root, storyKeys: storyKeys, loadApp: loadApp, flatten: flatten, pad: pad, extrasSource: extrasSource };
