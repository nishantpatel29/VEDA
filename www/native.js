// Thin wrappers over Capacitor plugins. Every call is safe in a plain browser,
// where it falls back to the web API or does nothing.
var Native = (function () {
  var Cap = window.Capacitor;
  var isNative = !!(Cap && typeof Cap.isNativePlatform === "function" && Cap.isNativePlatform());

  function plugin(name) {
    if (!isNative || typeof Cap.registerPlugin !== "function") return null;
    try {
      return Cap.registerPlugin(name);
    } catch (err) {
      return null;
    }
  }

  var App = plugin("App");
  var StatusBar = plugin("StatusBar");
  var KeepAwake = plugin("KeepAwake");
  var Share = plugin("Share");
  var Filesystem = plugin("Filesystem");
  var TextToSpeech = plugin("TextToSpeech");

  function quiet(promise) {
    if (promise && typeof promise.catch === "function") promise.catch(function () {});
    return promise;
  }

  var wakeHolds = 0;
  var wakeLock = null;

  function stayAwake() {
    wakeHolds += 1;
    if (wakeHolds > 1) return;
    if (KeepAwake) {
      quiet(KeepAwake.keepAwake());
    } else if (navigator.wakeLock && navigator.wakeLock.request) {
      navigator.wakeLock.request("screen").then(function (lock) {
        if (wakeHolds > 0) wakeLock = lock;
        else lock.release();
      }).catch(function () {});
    }
  }

  function allowSleep() {
    if (wakeHolds === 0) return;
    wakeHolds -= 1;
    if (wakeHolds > 0) return;
    if (KeepAwake) quiet(KeepAwake.allowSleep());
    if (wakeLock) {
      quiet(wakeLock.release());
      wakeLock = null;
    }
  }

  function immersive(on) {
    if (StatusBar) {
      quiet(on ? StatusBar.hide() : StatusBar.show());
      return;
    }
    var doc = document;
    if (on && !doc.fullscreenElement && doc.documentElement.requestFullscreen) {
      quiet(doc.documentElement.requestFullscreen({ navigationUI: "hide" }));
    } else if (!on && doc.fullscreenElement && doc.exitFullscreen) {
      quiet(doc.exitFullscreen());
    }
  }

  function styleBars() {
    if (!StatusBar) return;
    quiet(StatusBar.setStyle({ style: "DARK" }));
    quiet(StatusBar.setBackgroundColor({ color: "#090704" }));
  }

  // Android back button. Handlers run newest first; one returning true consumes the press.
  var backHandlers = [];
  function onBack(fn) {
    backHandlers.unshift(fn);
  }
  if (App) {
    quiet(App.addListener("backButton", function () {
      for (var i = 0; i < backHandlers.length; i++) {
        if (backHandlers[i]()) return;
      }
      quiet(App.exitApp());
    }));
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result).split(",")[1] || ""); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(blob);
    });
  }

  // Resolves true when a native share sheet was shown, false when the caller should fall back.
  function shareImage(blob, name, title, text) {
    if (!Share || !Filesystem) return Promise.resolve(false);
    return blobToBase64(blob).then(function (data) {
      return Filesystem.writeFile({ path: name, data: data, directory: "CACHE" });
    }).then(function (res) {
      return Share.share({ title: title, text: text, files: [res.uri], dialogTitle: title });
    }).then(function () {
      return true;
    }, function (err) {
      var msg = String((err && err.message) || err || "");
      if (/cancel/i.test(msg)) return true;
      throw err;
    });
  }

  return {
    isNative: isNative,
    tts: TextToSpeech,
    stayAwake: stayAwake,
    allowSleep: allowSleep,
    immersive: immersive,
    styleBars: styleBars,
    onBack: onBack,
    shareImage: shareImage
  };
})();
