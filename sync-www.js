var fs = require("fs");
var path = require("path");

var root = __dirname;
var www = path.join(root, "www");
fs.mkdirSync(www, { recursive: true });

var files = [
  "index.html",
  "styles.css",
  "native.js",
  "narrator.js",
  "app.js",
  "shots.js",
  "theatre.js",
  "chapters.js",
  "pages-a.js",
  "pages-b.js",
  "pages-c.js",
  "stories.js",
  "catalog.js",
  "books.js",
  "focus.js",
  "glossary.js",
  "extras.js",
  "depth.js",
  "quiz-data.js",
  "learn.js",
  "i18n.js",
  "art.js",
  "manifest.webmanifest",
  "favicon.svg",
  "veda.jpg",
  "icon-192.png",
  "icon-512.png"
];

var sharp = null;
try {
  sharp = require("sharp");
} catch (err) {
  console.log("sharp not installed; images are copied uncompressed");
}

function walk(dir) {
  var out = [];
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (entry.name.charAt(0) === ".") return;
    var full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(full));
    else out.push(full);
  });
  return out;
}

// Mirrors src into dest, re-encoding JPEGs smaller. Unchanged files are skipped,
// and files no longer in src are removed.
async function mirror(src, dest, compress, keep) {
  var wanted = new Set();
  var saved = 0;
  for (var file of walk(src)) {
    var rel = path.relative(src, file);
    if (keep && !keep(rel)) continue;
    var out = path.join(dest, rel);
    wanted.add(out);
    var from = fs.statSync(file);
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= from.mtimeMs) continue;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    if (compress && sharp && /\.jpe?g$/i.test(file)) {
      var buf = await sharp(file).jpeg({ quality: 74, mozjpeg: true, progressive: true }).toBuffer();
      if (buf.length < from.size) {
        fs.writeFileSync(out, buf);
        saved += from.size - buf.length;
        continue;
      }
    }
    fs.copyFileSync(file, out);
  }
  walk(dest).forEach(function (file) {
    if (!wanted.has(file)) fs.rmSync(file);
  });
  return saved;
}

async function main() {
  files.forEach(function (file) {
    fs.copyFileSync(path.join(root, file), path.join(www, file));
  });

  // Capacitor's runtime, so plain <script> code can reach native plugins.
  fs.copyFileSync(
    path.join(root, "node_modules", "@capacitor", "core", "dist", "capacitor.js"),
    path.join(www, "capacitor.js")
  );

  var saved = await mirror(path.join(root, "images"), path.join(www, "images"), true);
  await mirror(path.join(root, "fonts"), path.join(www, "fonts"), false);
  // Only the built packs ship; src/ and work/ are translator input.
  await mirror(path.join(root, "translations"), path.join(www, "translations"), false, function (rel) {
    return /^[a-z-]+\.js$/i.test(rel);
  });
  if (saved) console.log("images compressed, saved " + (saved / 1048576).toFixed(1) + " MB");
  console.log("www ready");
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
