#!/usr/bin/env node
// Read-only check of one translator file against its source chunk.
//   node tools/check-chunk.js translations/work/gu/ramayana-03.json
var fs = require("fs");
var path = require("path");

var file = process.argv[2];
if (!file) {
  console.error("usage: node tools/check-chunk.js translations/work/<code>/<work>-<NN>.json");
  process.exit(1);
}
var m = /([a-z]+)-(\d+)\.json$/.exec(file.replace(/\\/g, "/"));
if (!m) {
  console.error("file name must look like <work>-<NN>.json");
  process.exit(1);
}
var root = path.join(__dirname, "..");
var src = JSON.parse(fs.readFileSync(path.join(root, "translations", "src", m[1], m[2] + ".json"), "utf8")).pages;
var out;
try {
  out = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (err) {
  console.error("invalid JSON: " + err.message);
  process.exit(1);
}

var bad = [];
Object.keys(src).forEach(function (id) {
  var en = src[id].en;
  var tr = out[id];
  if (!Array.isArray(tr)) return bad.push(id + ": missing");
  if (tr.length !== en.length) return bad.push(id + ": expected " + en.length + " strings, got " + tr.length);
  en.forEach(function (s, i) {
    if (typeof tr[i] !== "string") bad.push(id + "[" + i + "]: not a string");
    else if (s.trim() && !tr[i].trim()) bad.push(id + "[" + i + "]: empty");
    else if (tr[i].trim() && tr[i] === s && s.length > 12) bad.push(id + "[" + i + "]: identical to English");
  });
});
Object.keys(out).forEach(function (id) { if (!src[id]) bad.push(id + ": not in this chunk"); });

if (bad.length) {
  console.log(bad.length + " problem(s):\n  " + bad.join("\n  "));
  process.exit(1);
}
console.log("ok: " + Object.keys(src).length + " pages");
