// One speech queue for Listen and Theatre. Speaks a list of chunks in order,
// reporting each chunk as it starts so callers can show it as a subtitle.
// Backends: native TTS plugin (Android app), Web Speech (browser), or silent
// timing when no voice exists, so subtitles still advance at reading speed.
var Narrator = (function () {
  var web = window.speechSynthesis || null;
  var tts = (typeof Native !== "undefined" && Native.tts) || null;

  var gen = 0;
  var job = null;
  var timer = 0;
  var lastCancel = 0;
  var voiceCache = {};

  function primary(tag) {
    return String(tag || "en").toLowerCase().split(/[-_]/)[0];
  }

  function webVoices() {
    if (!web) return Promise.resolve([]);
    var now = web.getVoices() || [];
    if (now.length) return Promise.resolve(now);
    return new Promise(function (resolve) {
      var finish = function () {
        web.removeEventListener("voiceschanged", finish);
        resolve(web.getVoices() || []);
      };
      web.addEventListener("voiceschanged", finish);
      window.setTimeout(finish, 1200);
    });
  }

  function pickWebVoice(tag) {
    if (!web) return null;
    var want = primary(tag);
    var exact = String(tag || "").toLowerCase();
    var matches = (web.getVoices() || []).filter(function (v) {
      return primary(v.lang) === want;
    });
    if (!matches.length) return null;
    matches.sort(function (a, b) {
      var ea = (a.lang || "").toLowerCase() === exact ? 0 : 1;
      var eb = (b.lang || "").toLowerCase() === exact ? 0 : 1;
      if (ea !== eb) return ea - eb;
      return (a.localService === b.localService) ? 0 : (a.localService ? -1 : 1);
    });
    return matches[0];
  }

  function available() {
    return !!(tts || web);
  }

  function hasVoice(tag) {
    var key = String(tag || "en");
    if (voiceCache[key] != null) return Promise.resolve(voiceCache[key]);
    var check;
    if (tts) {
      check = tts.isLanguageSupported({ lang: key }).then(function (r) { return !!(r && r.supported); }, function () { return false; });
    } else if (web) {
      check = webVoices().then(function () { return !!pickWebVoice(key); });
    } else {
      check = Promise.resolve(false);
    }
    return check.then(function (ok) {
      voiceCache[key] = ok;
      return ok;
    });
  }

  // Splits text into speakable pieces: whole sentences, short ones merged,
  // long ones broken at a comma or similar near the middle.
  function chunks(text, max) {
    max = max || 240;
    var s = String(text || "").replace(/\s+/g, " ").trim();
    if (!s) return [];
    var sentences = s.match(/[^.!?\u0964\u0965]+(?:[.!?\u0964\u0965]+["'\u201d\u2019)]*|$)\s*/g) || [s];
    var merged = [];
    var buf = "";
    sentences.forEach(function (piece) {
      piece = piece.trim();
      if (!piece) return;
      if (buf && (buf.length >= 40 || buf.length + piece.length + 1 > max)) {
        merged.push(buf);
        buf = piece;
      } else {
        buf = buf ? buf + " " + piece : piece;
      }
    });
    if (buf) merged.push(buf);
    var out = [];
    merged.forEach(function (piece) { split(piece, max, out); });
    return out;
  }

  function split(piece, max, out) {
    if (piece.length <= max) {
      out.push(piece);
      return;
    }
    var mid = piece.length / 2;
    var best = -1;
    var re = /[,;:\u2014\u2013]\s/g;
    var m;
    while ((m = re.exec(piece))) {
      var at = m.index + 1;
      if (best < 0 || Math.abs(at - mid) < Math.abs(best - mid)) best = at;
    }
    if (best < max * 0.25 || piece.length - best < max * 0.25) {
      best = piece.lastIndexOf(" ", Math.min(piece.length - 1, Math.round(mid + max * 0.2)));
    }
    if (best <= 0) {
      out.push(piece);
      return;
    }
    split(piece.slice(0, best).trim(), max, out);
    split(piece.slice(best).trim(), max, out);
  }

  function readingMs(text, rate) {
    var cps = 15 * (rate || 1);
    return Math.max(1400, Math.round((String(text).length / cps) * 1000));
  }

  function cancelEngines() {
    lastCancel = Date.now();
    window.clearTimeout(timer);
    if (web) web.cancel();
    if (tts) tts.stop().catch(function () {});
  }

  function speakWeb(text, j, my) {
    return new Promise(function (resolve, reject) {
      var voice = pickWebVoice(j.lang);
      var indic = primary(j.lang) !== "en";
      var attempt = 0;
      function once() {
        if (my !== gen) return;
        var utter = new SpeechSynthesisUtterance(text);
        if (voice) {
          utter.voice = voice;
          utter.lang = voice.lang;
        } else {
          utter.lang = j.lang;
        }
        utter.rate = (indic ? 0.92 : 0.96) * j.rate;
        var started = Date.now();
        function retry(reason) {
          if (my !== gen) return;
          attempt += 1;
          if (attempt <= 2) window.setTimeout(once, 180);
          else reject(new Error(reason || "speech failed"));
        }
        utter.onend = function () {
          if (my !== gen) return;
          // Some engines fire end immediately without speaking; treat that as a failure.
          if (Date.now() - started < 220) retry("ended early");
          else resolve();
        };
        utter.onerror = function (ev) {
          var reason = ev && ev.error;
          if (reason === "interrupted" || reason === "canceled" || reason === "cancelled") return;
          retry(reason);
        };
        web.speak(utter);
      }
      once();
    });
  }

  function speakOne(text, j, my) {
    if (j.silent || !available()) {
      return new Promise(function (resolve) {
        timer = window.setTimeout(resolve, readingMs(text, j.rate));
      });
    }
    var spoken = tts
      ? tts.speak({ text: text, lang: j.lang, rate: 0.95 * j.rate, pitch: 1, volume: 1, queueStrategy: 0 })
      : speakWeb(text, j, my);
    // Engines occasionally never report the end of an utterance; don't let that stall the queue.
    var limit = readingMs(text, j.rate * 0.5) + 4000;
    var watchdog = new Promise(function (resolve) {
      window.setTimeout(function () {
        if (my === gen) cancelEngines();
        resolve();
      }, limit);
    });
    return Promise.race([spoken, watchdog]);
  }

  function run() {
    var j = job;
    if (!j || j.paused) return;
    var wait = 80 - (Date.now() - lastCancel);
    if (wait > 0) {
      var held = ++gen;
      timer = window.setTimeout(function () { if (held === gen) run(); }, wait);
      return;
    }
    var my = ++gen;
    if (j.at >= j.chunks.length) {
      job = null;
      if (j.onDone) j.onDone();
      return;
    }
    var text = j.chunks[j.at];
    if (j.onChunk) j.onChunk(j.at, text);
    speakOne(text, j, my).then(function () {
      if (my !== gen || job !== j) return;
      j.at += 1;
      run();
    }, function (err) {
      if (my !== gen || job !== j) return;
      job = null;
      if (j.onFail) j.onFail(err);
    });
  }

  function play(opts) {
    stop();
    job = {
      chunks: opts.chunks || [],
      lang: opts.lang || "en-US",
      rate: opts.rate || 1,
      silent: !!opts.silent,
      at: opts.start || 0,
      paused: false,
      onChunk: opts.onChunk,
      onDone: opts.onDone,
      onFail: opts.onFail
    };
    run();
  }

  function stop() {
    gen += 1;
    var had = !!job;
    job = null;
    if (had) cancelEngines();
    else window.clearTimeout(timer);
  }

  function pause() {
    if (!job || job.paused) return;
    job.paused = true;
    gen += 1;
    cancelEngines();
  }

  function resume() {
    if (!job || !job.paused) return;
    job.paused = false;
    run();
  }

  function setRate(rate) {
    if (!job) return;
    job.rate = rate;
    if (job.paused) return;
    gen += 1;
    cancelEngines();
    run();
  }

  // Chrome stops long Web Speech queues after ~15s unless nudged.
  if (web && !tts) {
    window.setInterval(function () {
      if (job && !job.paused && !job.silent && web.paused) web.resume();
    }, 8000);
    web.getVoices();
  }

  return {
    available: available,
    hasVoice: hasVoice,
    chunks: chunks,
    readingMs: readingMs,
    play: play,
    stop: stop,
    pause: pause,
    resume: resume,
    setRate: setRate,
    isActive: function () { return !!job; },
    isPaused: function () { return !!(job && job.paused); }
  };
})();
