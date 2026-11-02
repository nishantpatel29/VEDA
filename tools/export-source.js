#!/usr/bin/env node
// Exports the English (and Hindi reference) story text into chunked JSON files that
// translators (human or agent) work from:
//   translations/src/<work>/head.json      titles, notes, section names, story lines
//   translations/src/<work>/<NN>.json      ~29 pages each: { id: { en: [...], hi: [...] } }
//   translations/src/extras.json           glossary, verse notes and quiz text (English)
// Translators write translations/work/<code>/<work>-<NN>.json, <work>-head.json and extras.json;
// tools/build-translations.js validates and packs them.
var fs = require("fs");
var path = require("path");
var lib = require("./i18n-lib");

var app = lib.loadApp({ extras: true });
var CHUNK = 29;
var outRoot = path.join(lib.root, "translations", "src");

app.works.forEach(function (w) {
  var dir = path.join(outRoot, w.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  var head = {
    title: w.titles.en,
    mark: (w.mark && w.mark.en) || w.titles.en,
    copy: (w.copy && w.copy.en) || {},
    kandas: Object.keys(w.kandas || {}),
    story: lib.storyKeys.reduce(function (o, k) { o[k] = app.UI_EN[k]; return o; }, {})
  };
  fs.writeFileSync(path.join(dir, "head.json"), JSON.stringify(head, null, 1));

  var n = 0;
  for (var i = 0; i < w.pages.length; i += CHUNK) {
    n += 1;
    var pages = {};
    w.pages.slice(i, i + CHUNK).forEach(function (p) {
      pages[p.id] = { kanda: (w.books[p.chapter] || [""])[0], en: lib.flatten(p.text.en), hi: p.text.hi ? lib.flatten(p.text.hi) : null };
    });
    fs.writeFileSync(path.join(dir, lib.pad(n) + ".json"), JSON.stringify({ work: w.id, chunk: n, pages: pages }, null, 1));
  }
  console.log(w.id + ": head + " + n + " chunks");
});

fs.writeFileSync(path.join(outRoot, "extras.json"), JSON.stringify(lib.extrasSource(app), null, 1));
console.log("extras.json written");
