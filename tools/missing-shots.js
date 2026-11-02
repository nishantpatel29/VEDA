var fs = require("fs");
var pages = JSON.parse(fs.readFileSync("shots-src/pages.json", "utf8"));
var shots = {};
try {
  var src = fs.readFileSync("shots.js", "utf8");
  var m = src.match(/var SHOTS = ([\s\S]*);/);
  if (m) shots = JSON.parse(m[1]);
} catch (e) {}
pages.forEach(function (p) {
  var n = (shots[p.id] || []).length;
  if (n < 2) console.log([p.n, p.id, n, p.image, p.title].join("\t"));
});
