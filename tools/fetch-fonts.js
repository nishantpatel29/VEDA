// Downloads the Google Fonts used by index.html into fonts/, with a local
// fonts.css, so every script renders without a network. Run once, or again
// after changing the family list: node tools/fetch-fonts.js
var fs = require("fs");
var path = require("path");

var FAMILIES =
  "family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,640;1,9..144,520" +
  "&family=Noto+Sans+Devanagari:wght@400;500;600" +
  "&family=Noto+Sans+Gujarati:wght@400;600" +
  "&family=Noto+Sans+Kannada:wght@400;600" +
  "&family=Noto+Sans+Malayalam:wght@400;600" +
  "&family=Noto+Sans+Tamil:wght@400;600" +
  "&family=Noto+Sans+Telugu:wght@400;600" +
  "&family=Outfit:wght@400;500;600" +
  "&family=Tiro+Devanagari+Sanskrit" +
  "&display=swap";

// A modern browser user agent makes Google serve woff2 files.
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
var out = path.join(__dirname, "..", "fonts");

async function main() {
  var res = await fetch("https://fonts.googleapis.com/css2?" + FAMILIES, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error("fonts.googleapis.com returned " + res.status);
  var css = await res.text();
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  var urls = Array.from(new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) || []));
  var names = {};
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    var family = url.split("/s/")[1].split("/")[0];
    var name = family + "-" + String(i).padStart(3, "0") + path.extname(url);
    var font = await fetch(url, { headers: { "User-Agent": UA } });
    if (!font.ok) throw new Error(url + " returned " + font.status);
    fs.writeFileSync(path.join(out, name), Buffer.from(await font.arrayBuffer()));
    names[url] = name;
  }
  css = css.replace(/https:\/\/fonts\.gstatic\.com\/[^)]+/g, function (url) { return names[url]; });
  fs.writeFileSync(path.join(out, "fonts.css"), css);
  var total = fs.readdirSync(out).reduce(function (sum, f) { return sum + fs.statSync(path.join(out, f)).size; }, 0);
  console.log(urls.length + " font files, " + (total / 1048576).toFixed(1) + " MB in fonts/");
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
