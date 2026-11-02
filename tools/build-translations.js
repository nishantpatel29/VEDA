#!/usr/bin/env node
// Packs translator output into translations/<code>.js and checks coverage.
//
//   node tools/build-translations.js          build packs + print coverage
//   node tools/build-translations.js --check  same, but exit 1 if any language in the menu
//                                             is missing pages (npm run apk runs this)
//
// Input, per language code:
//   translations/work/<code>/<work>-head.json  { title, mark, copy, kandas: {English name: name}, story: {...} }
//   translations/work/<code>/<work>-<NN>.json  { pageId: [title, hook, paragraphs..., line] }
//   translations/work/<code>/extras.json       glossary, notes, quiz (same shape as src/extras.json)
var fs = require("fs");
var path = require("path");
var lib = require("./i18n-lib");

var check = process.argv.includes("--check");
var workDir = path.join(lib.root, "translations", "work");
var outDir = path.join(lib.root, "translations");
var app = lib.loadApp({ extras: true });
var problems = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    problems.push(path.relative(lib.root, file) + ": " + err.message);
    return null;
  }
}

function validPage(src, arr) {
  if (!Array.isArray(arr) || arr.length !== src.length) return "expected " + src.length + " strings, got " + (Array.isArray(arr) ? arr.length : typeof arr);
  for (var i = 0; i < src.length; i++) {
    if (typeof arr[i] !== "string") return "item " + i + " is not a string";
    if (src[i].trim() && !arr[i].trim()) return "item " + i + " is empty";
  }
  return "";
}

function buildPack(code) {
  var dir = path.join(workDir, code);
  var files = fs.readdirSync(dir).filter(function (f) { return f.endsWith(".json"); });
  var pack = { story: {}, works: {} };

  app.works.forEach(function (w) {
    var src = {};
    w.pages.forEach(function (p) { src[p.id] = lib.flatten(p.text.en); });
    var tr = { pages: {} };
    var headFile = path.join(dir, w.id + "-head.json");
    if (fs.existsSync(headFile)) {
      var head = readJson(headFile) || {};
      if (head.title) tr.titles = head.title;
      if (head.mark) tr.mark = head.mark;
      if (head.copy) tr.copy = head.copy;
      if (head.kandas) {
        var names = Object.keys(w.kandas || {});
        tr.kandas = {};
        names.forEach(function (k, i) {
          var v = Array.isArray(head.kandas) ? head.kandas[i] : head.kandas[k];
          if (v) tr.kandas[k] = v;
        });
      }
      if (head.story) Object.assign(pack.story, head.story);
    }
    files.filter(function (f) { return f.indexOf(w.id + "-") === 0 && /-\d+\.json$/.test(f); }).forEach(function (f) {
      var chunk = readJson(path.join(dir, f)) || {};
      Object.keys(chunk).forEach(function (id) {
        if (!src[id]) return problems.push(code + "/" + f + ": unknown page " + id);
        var why = validPage(src[id], chunk[id]);
        if (why) problems.push(code + "/" + f + " " + id + ": " + why);
        else tr.pages[id] = chunk[id].map(function (s) { return s.trim(); });
      });
    });
    if (Object.keys(tr.pages).length || tr.titles) pack.works[w.id] = tr;
  });

  var extrasFile = path.join(dir, "extras.json");
  if (fs.existsSync(extrasFile)) pack.extras = readJson(extrasFile) || undefined;

  var file = path.join(outDir, code + ".js");
  fs.writeFileSync(file,
    "// Built by tools/build-translations.js from translations/work/" + code + "/. Do not edit by hand.\n" +
    "addTranslation(" + JSON.stringify(code) + ", " + JSON.stringify(pack) + ");\n");
  return pack;
}

function register(codes) {
  var htmlFile = path.join(lib.root, "index.html");
  var html = fs.readFileSync(htmlFile, "utf8");
  var tags = codes.map(function (c) { return '  <script src="translations/' + c + '.js"></script>'; }).join("\n");
  var next = html.replace(/(<!-- translations:start -->)[\s\S]*?(\s*<!-- translations:end -->)/, "$1" + (tags ? "\n" + tags : "") + "$2");
  if (next !== html) fs.writeFileSync(htmlFile, next);
}

var menu = app.LANGUAGES.map(function (l) { return l.id; });
var codes = fs.existsSync(workDir)
  ? fs.readdirSync(workDir).filter(function (c) {
      return fs.statSync(path.join(workDir, c)).isDirectory() && menu.indexOf(c) >= 0;
    }).sort()
  : [];
var packs = {};
codes.forEach(function (c) { packs[c] = buildPack(c); });
fs.readdirSync(outDir).forEach(function (f) {
  var m = /^([a-z-]+)\.js$/i.exec(f);
  if (m && !packs[m[1]]) fs.rmSync(path.join(outDir, f));
});
register(codes);

// Coverage: built-in text from the page files, overridden or completed by packs.
var langs = app.LANGUAGES.map(function (l) { return l.id; });
codes.forEach(function (c) { if (langs.indexOf(c) < 0) langs.push(c); });
var missing = [];
console.log("\ncoverage (pages per work):");
langs.forEach(function (code) {
  if (code === "en") return;
  var builtIn = app.LANGUAGES.some(function (l) { return l.id === code; });
  var row = app.works.map(function (w) {
    var have = w.pages.filter(function (p) {
      var pack = packs[code] && packs[code].works[w.id];
      return !!p.text[code] || !!(pack && pack.pages[p.id]);
    }).length;
    // Unstarted works fall back to English. Fail only on a started-but-partial work
    // in a language the menu already offers.
    if (builtIn && have > 0 && have < w.pages.length) {
      missing.push(code + " " + w.id + " " + have + "/" + w.pages.length);
    }
    return w.id + " " + have + "/" + w.pages.length;
  });
  console.log("  " + code.padEnd(3) + (builtIn ? "  menu   " : "  pack   ") + row.join("   "));
});

if (problems.length) {
  console.log("\n" + problems.length + " problem(s):");
  problems.slice(0, 40).forEach(function (p) { console.log("  " + p); });
}
console.log("\npacks: " + (codes.join(", ") || "none"));

if (check && (missing.length || problems.length)) {
  console.error("\nTranslation check failed. Incomplete languages in the menu:\n  " + missing.join("\n  "));
  process.exit(1);
}
