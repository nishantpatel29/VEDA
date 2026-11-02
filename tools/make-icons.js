// Builds every launcher, splash and web icon from icon.png (the VEDA artwork),
// then: npx @capacitor/assets generate --android   (npm run icons does both)
var fs = require("fs");
var path = require("path");
var sharp = require("sharp");

var root = path.join(__dirname, "..");
var src = path.join(root, "icon.png");
var out = path.join(root, "assets");
fs.mkdirSync(out, { recursive: true });

var BG = { r: 9, g: 7, b: 4, alpha: 1 };

function blank(size, alpha) {
  return sharp({ create: { width: size, height: size, channels: 4, background: Object.assign({}, BG, { alpha: alpha }) } });
}

async function art(size) {
  return sharp(src).resize(size, size, { fit: "cover" }).png().toBuffer();
}

// Square artwork with rounded corners, centred on the dark splash background.
async function splash(size, artSize) {
  var r = Math.round(artSize * 0.18);
  var mask = Buffer.from('<svg width="' + artSize + '" height="' + artSize + '"><rect width="100%" height="100%" rx="' + r + '" ry="' + r + '"/></svg>');
  var rounded = await sharp(await art(artSize)).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  var at = Math.round((size - artSize) / 2);
  return blank(size, 1).composite([{ input: rounded, left: at, top: at }]).png().toBuffer();
}

async function main() {
  if (!fs.existsSync(src)) throw new Error("icon.png not found in the project root");

  // Launcher: the full artwork is the adaptive background layer (Android shows its middle ~66%),
  // with an empty foreground so nothing is drawn twice.
  await sharp(await art(1024)).toFile(path.join(out, "icon-only.png"));
  await sharp(await art(1024)).toFile(path.join(out, "icon-background.png"));
  await blank(1024, 0).png().toFile(path.join(out, "icon-foreground.png"));

  var sp = await splash(2732, 900);
  fs.writeFileSync(path.join(out, "splash.png"), sp);
  fs.writeFileSync(path.join(out, "splash-dark.png"), sp);

  // Web: in-app launch screen art and the browser/PWA icons.
  await sharp(src).resize(720, 720, { fit: "cover" }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(root, "veda.jpg"));
  await sharp(src).resize(192, 192).png().toFile(path.join(root, "icon-192.png"));
  await sharp(src).resize(512, 512).png().toFile(path.join(root, "icon-512.png"));

  console.log("assets/ ready, plus veda.jpg, icon-192.png, icon-512.png");
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
