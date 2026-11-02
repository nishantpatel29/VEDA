#!/usr/bin/env node
// Drafts a translation pack (translations/<code>.js) with an OpenAI-compatible API.
//
//   set TRANSLATE_API_KEY=sk-...            (or OPENAI_API_KEY)
//   node tools/translate.js es              translate every ready work into Spanish
//   node tools/translate.js fr --dry-run    show what would be sent, no API calls
//
// Optional env: TRANSLATE_MODEL (default gpt-4o-mini), TRANSLATE_BASE_URL (default OpenAI).
// Progress is cached in translations/.cache/<code>.json, so an interrupted run resumes.
// Machine translation is a first draft: have a native speaker review before publishing.
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");
var outDir = path.join(root, "translations");
var cacheDir = path.join(outDir, ".cache");

var args = process.argv.slice(2);
var code = args.find(function (a) { return !a.startsWith("--"); });
var dryRun = args.includes("--dry-run");
var BATCH = 6;

if (!code || !/^[a-z]{2,3}(-[A-Za-z]+)?$/.test(code)) {
  console.error("usage: node tools/translate.js <language-code> [--dry-run]");
  process.exit(1);
}

var apiKey = process.env.TRANSLATE_API_KEY || process.env.OPENAI_API_KEY;
var model = process.env.TRANSLATE_MODEL || "gpt-4o-mini";
var baseUrl = (process.env.TRANSLATE_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
if (!apiKey && !dryRun) {
  console.error("Set TRANSLATE_API_KEY (or OPENAI_API_KEY) first, or pass --dry-run.");
  process.exit(1);
}

function loadApp() {
  var ctx = { console: console };
  ctx.window = ctx;
  vm.createContext(ctx);
  ["chapters.js", "pages-a.js", "pages-b.js", "pages-c.js", "stories.js", "catalog.js", "books.js", "i18n.js"].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
  });
  vm.runInContext("this.__out = { CATALOG: CATALOG, UI_EN: UI_EN, INTL: INTL_DEFAULTS };", ctx);
  return ctx.__out;
}

function flatten(text) {
  var arr = [text.title, text.hook].concat(text.body || []);
  arr.push(text.line || "");
  return arr;
}

function loadCache() {
  var file = path.join(cacheDir, code + ".json");
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    return { pages: {}, works: {}, ui: null };
  }
}

function saveCache(cache) {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(path.join(cacheDir, code + ".json"), JSON.stringify(cache, null, 1));
}

var langName = (function () {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code);
  } catch (err) {
    return code;
  }
})();

var SYSTEM =
  "You are a literary translator bringing the Indian epics to readers worldwide. Translate from English into " + langName + ". " +
  "Keep the calm, vivid, modern prose voice. Keep Sanskrit names and terms in the standard spelling readers of " + langName +
  " know (for example Rama, Sita, Hanuman, dharma, rakshasa), transliterated into the target script if it is not Latin. " +
  "Never add explanations. Preserve the JSON structure exactly: same keys, same number of strings in each array, empty strings stay empty. " +
  "Reply with JSON only.";

async function ask(payload) {
  if (dryRun) {
    console.log("[dry-run] would send " + JSON.stringify(payload).length + " chars");
    return null;
  }
  for (var attempt = 1; attempt <= 4; attempt++) {
    var res = await fetch(baseUrl + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        model: model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: JSON.stringify(payload) }
        ]
      })
    });
    if (res.ok) {
      var data = await res.json();
      return JSON.parse(data.choices[0].message.content);
    }
    var wait = res.status === 429 || res.status >= 500 ? attempt * 4000 : 0;
    var body = await res.text();
    if (!wait) throw new Error("API " + res.status + ": " + body.slice(0, 300));
    console.log("API " + res.status + ", retrying in " + wait / 1000 + "s");
    await new Promise(function (r) { setTimeout(r, wait); });
  }
  throw new Error("API kept failing; run again to resume");
}

function sameShape(src, out) {
  return Array.isArray(out) && out.length === src.length && out.every(function (s) { return typeof s === "string"; });
}

async function main() {
  var app = loadApp();
  var cache = loadCache();
  var works = app.CATALOG.filter(function (w) { return w.ready && w.pages; });

  if (!cache.ui) {
    console.log("UI strings...");
    var ui = await ask({ task: "Translate these app interface strings. Keep {placeholders} and symbols unchanged.", strings: app.UI_EN });
    if (ui) {
      cache.ui = ui.strings || ui;
      saveCache(cache);
    }
  }

  for (var w of works) {
    if (!cache.works[w.id]) {
      console.log(w.id + ": titles and notes...");
      var head = await ask({
        task: "Translate the title, short mark, notes and section names of this book.",
        title: w.titles.en,
        mark: (w.mark && w.mark.en) || w.titles.en,
        copy: w.copy && w.copy.en,
        kandas: Object.keys(w.kandas || {})
      });
      if (head) {
        var kandas = {};
        var names = Object.keys(w.kandas || {});
        var got = head.kandas || [];
        names.forEach(function (k, i) {
          kandas[k] = Array.isArray(got) ? got[i] || k : got[k] || k;
        });
        cache.works[w.id] = { titles: head.title, mark: head.mark, copy: head.copy, kandas: kandas };
        saveCache(cache);
      }
    }

    var todo = w.pages.filter(function (p) { return !cache.pages[w.id + "/" + p.id]; });
    console.log(w.id + ": " + (w.pages.length - todo.length) + "/" + w.pages.length + " pages done");
    for (var i = 0; i < todo.length; i += BATCH) {
      var batch = todo.slice(i, i + BATCH);
      var payload = { task: "Translate each page. Each array is [title, hook, paragraphs..., closing line].", pages: {} };
      batch.forEach(function (p) { payload.pages[p.id] = flatten(p.text.en); });
      var result = await ask(payload);
      if (!result) continue;
      var pages = result.pages || result;
      batch.forEach(function (p) {
        var src = payload.pages[p.id];
        if (sameShape(src, pages[p.id])) cache.pages[w.id + "/" + p.id] = pages[p.id];
        else console.warn("  " + p.id + ": shape mismatch, will retry next run");
      });
      saveCache(cache);
      console.log("  " + Math.min(i + BATCH, todo.length) + "/" + todo.length);
    }
  }

  if (dryRun) return;
  writePack(works, cache);
  registerPack();
}

// Writes the same work files a human or agent translator would, then packs them.
function writePack(works, cache) {
  var dir = path.join(outDir, "work", code);
  fs.mkdirSync(dir, { recursive: true });
  works.forEach(function (w) {
    var head = cache.works[w.id];
    if (head) {
      fs.writeFileSync(path.join(dir, w.id + "-head.json"), JSON.stringify({
        title: head.titles, mark: head.mark, copy: head.copy, kandas: head.kandas
      }, null, 1));
    }
    var pages = {};
    w.pages.forEach(function (p) {
      var arr = cache.pages[w.id + "/" + p.id];
      if (arr) pages[p.id] = arr;
    });
    fs.writeFileSync(path.join(dir, w.id + "-90.json"), JSON.stringify(pages, null, 1));
  });
  console.log("wrote translations/work/" + code + "/ (machine draft, review before publishing)");
}

function registerPack() {
  require("child_process").execFileSync(process.execPath, [path.join(__dirname, "build-translations.js")], { stdio: "inherit" });
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
