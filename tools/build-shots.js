#!/usr/bin/env node
// Scans images/shots/<pageId>-<n>.jpg and writes shots.js:
//   var SHOTS = { "<pageId>": ["shots/<pageId>-1.jpg", "shots/<pageId>-2.jpg"] };
// Theatre mode plays a page's main picture followed by these shots.
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var dir = path.join(root, "images", "shots");

// Generated shots arrive as large PNGs; store them as 1080px JPEGs like the other art.
async function normalise() {
  if (!fs.existsSync(dir)) return;
  var sharp = require("sharp");
  for (var f of fs.readdirSync(dir)) {
    var m = /^(.+)\.(png|webp)$/i.exec(f);
    if (!m) continue;
    var from = path.join(dir, f);
    await sharp(from).resize(1080, 1440, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(dir, m[1] + ".jpg"));
    fs.rmSync(from);
  }
}

function index() {
  var shots = {};
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).sort().forEach(function (f) {
      var m = /^(.+)-(\d+)\.jpe?g$/i.exec(f);
      if (!m) return;
      (shots[m[1]] = shots[m[1]] || []).push({ n: Number(m[2]), file: "shots/" + f });
    });
  }
  var out = {};
  Object.keys(shots).sort().forEach(function (id) {
    out[id] = shots[id].sort(function (a, b) { return a.n - b.n; }).map(function (s) { return s.file; });
  });
  fs.writeFileSync(path.join(root, "shots.js"),
    "// Built by tools/build-shots.js from images/shots/. Do not edit by hand.\nvar SHOTS = " + JSON.stringify(out, null, 1) + ";\n");
  var count = Object.keys(out).reduce(function (n, id) { return n + out[id].length; }, 0);
  console.log("shots.js: " + count + " shots for " + Object.keys(out).length + " pages");
}

normalise().then(index).catch(function (err) {
  console.error(err);
  process.exit(1);
});
