// Builds android/app/build/outputs/apk/debug/app-debug.apk.
// Capacitor 7 needs JDK 21+, so this finds one even when JAVA_HOME points at an older JDK.
var fs = require("fs");
var path = require("path");
var cp = require("child_process");

var root = path.join(__dirname, "..");
var android = path.join(root, "android");
var isWin = process.platform === "win32";

function javaMajor(home) {
  var bin = path.join(home, "bin", isWin ? "java.exe" : "java");
  if (!fs.existsSync(bin)) return 0;
  var out = cp.spawnSync(bin, ["-version"], { encoding: "utf8" });
  var m = /version "(\d+)/.exec((out.stderr || "") + (out.stdout || ""));
  return m ? Number(m[1]) : 0;
}

function findJdk() {
  var candidates = [];
  if (process.env.JAVA_HOME) candidates.push(process.env.JAVA_HOME);
  var dirs = isWin
    ? ["C:\\Program Files\\Java", "C:\\Program Files\\Microsoft", "C:\\Program Files\\Eclipse Adoptium", "C:\\Program Files\\Android\\Android Studio\\jbr"]
    : ["/usr/lib/jvm", "/Library/Java/JavaVirtualMachines"];
  dirs.forEach(function (dir) {
    if (!fs.existsSync(dir)) return;
    if (fs.existsSync(path.join(dir, "bin"))) candidates.push(dir);
    fs.readdirSync(dir).forEach(function (name) {
      var home = path.join(dir, name);
      candidates.push(home, path.join(home, "Contents", "Home"));
    });
  });
  var best = null;
  candidates.forEach(function (home) {
    var v = javaMajor(home);
    if (v >= 21 && (!best || v > best.v)) best = { home: home, v: v };
  });
  return best;
}

function findSdk() {
  var options = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT];
  if (isWin && process.env.LOCALAPPDATA) options.push(path.join(process.env.LOCALAPPDATA, "Android", "Sdk"));
  if (process.env.HOME) options.push(path.join(process.env.HOME, "Android", "Sdk"), path.join(process.env.HOME, "Library", "Android", "sdk"));
  return options.filter(Boolean).find(function (p) { return fs.existsSync(p); });
}

// Windows needs a shell for .cmd/.bat launchers (npx, gradlew.bat); pass one quoted command line.
function run(cmd, args, opts) {
  var line = [cmd].concat(args).map(function (a) { return /\s/.test(a) ? '"' + a + '"' : a; }).join(" ");
  var res = isWin
    ? cp.spawnSync(line, Object.assign({ stdio: "inherit", shell: true }, opts))
    : cp.spawnSync(cmd, args, Object.assign({ stdio: "inherit" }, opts));
  if (res.status !== 0) process.exit(res.status || 1);
}

var jdk = findJdk();
if (!jdk) {
  console.error("No JDK 21+ found. Install one from https://adoptium.net and try again.");
  process.exit(1);
}
var sdk = findSdk();
if (!sdk) {
  console.error("No Android SDK found. Install Android Studio once, or set ANDROID_HOME.");
  process.exit(1);
}
fs.writeFileSync(path.join(android, "local.properties"), "sdk.dir=" + sdk.replace(/\\/g, "\\\\").replace(/:/g, "\\:") + "\n");
console.log("JDK " + jdk.v + ": " + jdk.home);
console.log("SDK: " + sdk);

var env = Object.assign({}, process.env, { JAVA_HOME: jdk.home, ANDROID_HOME: sdk });
var release = process.argv.indexOf("--release") !== -1;

run("node", [path.join(root, "tools", "build-translations.js"), "--check"]);
run("node", [path.join(root, "tools", "build-shots.js")]);
run("node", [path.join(root, "sync-www.js")]);
run("npx", ["cap", "sync", "android"], { cwd: root, env: env });
run(isWin ? "gradlew.bat" : "./gradlew", [release ? "bundleRelease" : "assembleDebug"], { cwd: android, env: env });

var out = release
  ? path.join(android, "app", "build", "outputs", "bundle", "release", "app-release.aab")
  : path.join(android, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
if (fs.existsSync(out)) {
  var mb = (fs.statSync(out).size / 1048576).toFixed(1);
  console.log("\nBuilt " + out + " (" + mb + " MB)");
}
