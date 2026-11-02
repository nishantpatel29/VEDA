// Theatre mode: full-screen pictures with slow motion, narration, and
// movie-style subtitles, advancing page by page. Talks to the reader only
// through window.Katha (see the end of app.js).
var Theatre = (function () {
  var K = window.Katha;
  var root = document.getElementById("theatre");
  if (!K || !root) return { open: function () {}, isOpen: function () { return false; } };

  var stage = document.getElementById("t-stage");
  var shots = Array.prototype.slice.call(root.querySelectorAll(".t-shot"));
  var card = document.getElementById("t-card");
  var cardKicker = document.getElementById("t-kicker");
  var cardTitle = document.getElementById("t-title");
  var cardHook = document.getElementById("t-hook");
  var chapterCard = document.getElementById("t-chapter");
  var chapterDev = document.getElementById("t-chapter-dev");
  var chapterName = document.getElementById("t-chapter-name");
  var sub = document.getElementById("t-sub");
  var subText = document.getElementById("t-sub-text");
  var whereK = document.getElementById("t-where-k");
  var whereN = document.getElementById("t-where-n");
  var bar = document.getElementById("t-bar");
  var tip = document.getElementById("t-tip");
  var exitBtn = document.getElementById("t-exit");
  var ccBtn = document.getElementById("t-cc");
  var fitBtn = document.getElementById("t-fit");
  var prevBtn = document.getElementById("t-prev");
  var nextBtn = document.getElementById("t-next");
  var playBtn = document.getElementById("t-play");
  var speedBtn = document.getElementById("t-speed");
  var openBtn = document.getElementById("theatre-btn");

  var CC_KEY = "katha-theatre-cc";
  var FIT_KEY = "katha-theatre-fit";
  var RATES = [0.75, 1, 1.25, 1.5];
  var CHAPTER_MS = 2800;
  var PAGE_GAP_MS = 900;
  var CHROME_MS = 3200;

  var open = false;
  var page = -1;
  var token = 0;
  var paused = false;
  var ended = false;
  var autoPaused = false;
  var waiting = null;
  var waitTimer = 0;
  var chromeTimer = 0;
  var tipTimer = 0;
  var front = 0;
  var swing = 0;
  var lastChunk = 0;
  var silentLang = {};
  var showSubs = localStorage.getItem(CC_KEY) !== "0";
  var fit = localStorage.getItem(FIT_KEY) === "1";

  function u() {
    return K.ui();
  }

  // Waits that respect pause: the callback runs only once playback is unpaused.
  function wait(ms, fn) {
    window.clearTimeout(waitTimer);
    var my = token;
    waiting = null;
    waitTimer = window.setTimeout(function () {
      if (my !== token || !open) return;
      if (paused) waiting = fn;
      else fn();
    }, ms);
  }

  function clearWait() {
    window.clearTimeout(waitTimer);
    waiting = null;
  }

  function pageParts(i) {
    var shown = K.shown(i);
    var text = shown.text;
    var body = (text.body || []).concat(text.line ? [text.line] : []).join(" ");
    var chunks = [];
    var kinds = [];
    [text.title, text.hook].forEach(function (s) {
      if (!s) return;
      chunks.push(s);
      kinds.push("card");
    });
    Narrator.chunks(body, 120).forEach(function (s) {
      chunks.push(s);
      kinds.push("sub");
    });
    return { shown: shown, text: text, chunks: chunks, kinds: kinds };
  }

  function estimateMs(chunks, rate) {
    return chunks.reduce(function (sum, s) { return sum + Narrator.readingMs(s, rate * 0.9); }, 0) + PAGE_GAP_MS;
  }

  function measurePan(shot) {
    var img = shot.querySelector(".t-img");
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    var nw = img.naturalWidth || 3;
    var nh = img.naturalHeight || 4;
    var pan = w - (h * nw) / nh;
    var usePan = !fit && pan < -12;
    shot.classList.toggle("is-pan", usePan);
    shot.style.setProperty("--pan", Math.round(pan) + "px");
  }

  // The page's main picture followed by its extra story shots (shots.js, built by tools/build-shots.js).
  function pageShots(i) {
    var story = K.story(i);
    var extra = (typeof SHOTS !== "undefined" && SHOTS[story.id]) || [];
    return [story.image].concat(extra);
  }

  // Which shot a subtitle belongs to: the page's sub chunks are split evenly across its shots.
  function shotFor(parts, n, count) {
    if (count < 2 || parts.kinds[n] !== "sub") return 0;
    var subs = parts.kinds.filter(function (k) { return k === "sub"; }).length;
    var at = parts.kinds.slice(0, n).filter(function (k) { return k === "sub"; }).length;
    return Math.min(count - 1, Math.floor((at * count) / subs));
  }

  function setShot(i, durationMs, file) {
    var story = K.story(i);
    var image = file || story.image;
    var src = "images/" + image + "?v=4";
    var next = shots[1 - front];
    var prev = shots[front];
    var my = token;
    var img = next.querySelector(".t-img");
    var bg = next.querySelector(".t-bg");
    next.classList.remove("on", "kb-a", "kb-b");
    next.style.setProperty("--kb-dur", Math.max(8000, durationMs) + "ms");
    var fy = (typeof FOCUS !== "undefined" && FOCUS[image] != null) ? FOCUS[image] : 50;
    next.style.setProperty("--fy", fy + "%");
    img.src = src;
    bg.src = src;
    var ready = img.decode ? img.decode() : new Promise(function (resolve) {
      if (img.complete) resolve();
      else img.onload = resolve;
    });
    ready.catch(function () {}).then(function () {
      if (my !== token || !open) return;
      measurePan(next);
      void next.offsetWidth;
      swing += 1;
      next.classList.add(swing % 2 ? "kb-a" : "kb-b", "on");
      prev.classList.remove("on");
      front = 1 - front;
    });
  }

  function showCard(text, i) {
    var span = K.kandaSpan(i);
    cardKicker.textContent = K.kandaLabel(i) + " \u00b7 " + span.pos + " / " + span.total;
    cardTitle.textContent = text.title || "";
    cardHook.textContent = text.hook || "";
    card.hidden = false;
    void card.offsetWidth;
    card.classList.add("on");
  }

  function hideCard() {
    card.classList.remove("on");
  }

  function showSub(text) {
    subText.textContent = text;
    sub.classList.toggle("on", showSubs && !!text);
  }

  function setWhere(i) {
    whereK.textContent = K.kandaLabel(i);
    whereN.textContent = (i + 1) + " / " + K.count();
    prevBtn.disabled = i <= 0;
  }

  function setBar(n, total) {
    bar.style.transform = "scaleX(" + (total ? (n + 1) / total : 0) + ")";
  }

  function playPage(i, opts) {
    opts = opts || {};
    token += 1;
    var my = token;
    clearWait();
    Narrator.stop();
    var crossing = opts.auto && page >= 0 && K.kandaKey(i) !== K.kandaKey(page);
    page = i;
    ended = false;
    root.classList.remove("ended");
    chapterCard.classList.remove("is-end");
    K.go(i);
    setWhere(i);
    var parts = pageParts(i);
    var rate = K.rate();
    hideCard();
    showSub("");
    setBar(-1, parts.chunks.length);
    parts.shots = pageShots(i);
    parts.shotAt = 0;
    parts.shotMs = estimateMs(parts.chunks, rate) / parts.shots.length;
    parts.shots.slice(1).forEach(function (f) { new Image().src = "images/" + f + "?v=4"; });
    setShot(i, parts.shotMs + (crossing ? CHAPTER_MS : 0));
    if (crossing) {
      var ch = K.chapter(i);
      chapterDev.textContent = ch.hi || "";
      chapterName.textContent = K.kandaLabel(i);
      chapterCard.hidden = false;
      void chapterCard.offsetWidth;
      chapterCard.classList.add("on");
      wait(CHAPTER_MS, function () {
        chapterCard.classList.remove("on");
        narrate(parts, my, 0);
      });
    } else {
      chapterCard.classList.remove("on");
      narrate(parts, my, 0);
    }
  }

  function narrate(parts, my, start) {
    if (my !== token || !open) return;
    var lang = parts.shown.missing ? "en" : K.lang();
    var tag = K.langMeta(lang).voice;
    if (parts.shown.missing && start === 0) K.toast(u().notTranslated.replace("{name}", K.langMeta().name));
    Narrator.hasVoice(tag).then(function (has) {
      if (my !== token || !open) return;
      var silent = !has || !!silentLang[lang];
      if (!has && !silentLang[lang]) {
        silentLang[lang] = true;
        K.toast(u().theatreSilent.replace("{name}", K.langMeta(lang).name));
      }
      Narrator.play({
        chunks: parts.chunks,
        lang: tag,
        rate: K.rate(),
        silent: silent,
        start: start,
        onChunk: function (n, s) {
          if (my !== token) return;
          lastChunk = n;
          setBar(n, parts.chunks.length);
          var want = shotFor(parts, n, parts.shots.length);
          if (want !== parts.shotAt) {
            parts.shotAt = want;
            setShot(page, parts.shotMs, parts.shots[want]);
          }
          if (parts.kinds[n] === "card") {
            if (n === 0 || parts.kinds[n - 1] !== "card") showCard(parts.text, page);
            showSub("");
          } else {
            hideCard();
            showSub(s);
          }
        },
        onDone: function () {
          if (my !== token) return;
          wait(PAGE_GAP_MS, function () { advance(); });
        },
        onFail: function () {
          if (my !== token) return;
          silentLang[lang] = true;
          K.toast(u().noAudio);
          narrate(parts, my, lastChunk);
        }
      });
      if (paused) Narrator.pause();
    });
  }

  // Playback only stops for good when the user exits; the last page leads to an end card.
  function advance() {
    if (page >= K.count() - 1) showEnd();
    else playPage(page + 1, { auto: true });
  }

  function showEnd() {
    token += 1;
    clearWait();
    Narrator.stop();
    ended = true;
    hideCard();
    showSub("");
    setBar(0, 1);
    var copy = K.workCopy();
    chapterDev.textContent = copy.doneTitle || "";
    chapterName.textContent = copy.doneBody || "";
    chapterCard.classList.add("is-end");
    chapterCard.hidden = false;
    void chapterCard.offsetWidth;
    chapterCard.classList.add("on");
    root.classList.add("ended");
    playBtn.setAttribute("aria-label", u().begin);
    showChrome(true);
  }

  function step(delta) {
    if (ended) {
      if (delta < 0) playPage(page);
      showChrome();
      return;
    }
    var target = page + delta;
    if (target < 0) return;
    if (target >= K.count()) showEnd();
    else {
      playPage(target);
      showChrome();
    }
  }

  function togglePlay() {
    if (ended) {
      if (paused) setPaused(false);
      playPage(0);
      showChrome();
      return;
    }
    setPaused(!paused);
  }

  function setPaused(on) {
    paused = on;
    root.classList.toggle("paused", on);
    playBtn.setAttribute("aria-label", on ? u().resume : u().pause);
    playBtn.setAttribute("aria-pressed", on ? "false" : "true");
    if (on) {
      Narrator.pause();
      showChrome(true);
    } else {
      if (waiting) {
        var fn = waiting;
        waiting = null;
        fn();
      } else {
        Narrator.resume();
      }
      showChrome();
    }
  }

  function showChrome(stay) {
    root.classList.add("chrome");
    window.clearTimeout(chromeTimer);
    if (!stay && !paused && !ended) {
      chromeTimer = window.setTimeout(function () { root.classList.remove("chrome"); }, CHROME_MS);
    }
  }

  function toggleChrome() {
    if (root.classList.contains("chrome") && !paused && !ended) {
      window.clearTimeout(chromeTimer);
      root.classList.remove("chrome");
    } else {
      showChrome();
    }
  }

  function syncButtons() {
    var rate = K.rate();
    speedBtn.textContent = rate + "\u00d7";
    speedBtn.setAttribute("aria-label", u().speed + " " + rate + "\u00d7");
    ccBtn.setAttribute("aria-pressed", showSubs ? "true" : "false");
    ccBtn.setAttribute("aria-label", u().subtitles);
    ccBtn.classList.toggle("off", !showSubs);
    fitBtn.setAttribute("aria-label", fit ? u().fillImage : u().fitImage);
    fitBtn.title = fit ? u().fillImage : u().fitImage;
    fitBtn.classList.toggle("is-fit", fit);
    exitBtn.setAttribute("aria-label", u().exitTheatre);
    prevBtn.setAttribute("aria-label", u().prev);
    nextBtn.setAttribute("aria-label", u().next);
    root.setAttribute("aria-label", u().theatre);
    stage.classList.toggle("fit", fit);
  }

  function cycleRate() {
    var at = RATES.indexOf(K.rate());
    var rate = RATES[(at + 1) % RATES.length];
    K.setRate(rate);
    Narrator.setRate(rate);
    syncButtons();
    showChrome();
  }

  function toggleSubs() {
    showSubs = !showSubs;
    localStorage.setItem(CC_KEY, showSubs ? "1" : "0");
    sub.classList.toggle("on", showSubs && !!subText.textContent);
    syncButtons();
    showChrome();
  }

  function toggleFit() {
    fit = !fit;
    localStorage.setItem(FIT_KEY, fit ? "1" : "0");
    syncButtons();
    shots.forEach(measurePan);
    showChrome();
  }

  function openTheatre() {
    if (open || !K.entered() || K.current() < 0) return;
    open = true;
    K.stopListening();
    K.closeOverlays();
    paused = false;
    autoPaused = false;
    root.classList.remove("paused");
    root.className = root.className.replace(/\bscript-\S+/g, "").trim();
    root.classList.add("script-" + (K.shown(K.current()).missing ? "en" : K.lang()));
    root.hidden = false;
    document.body.classList.add("in-theatre");
    Native.immersive(true);
    Native.stayAwake();
    syncButtons();
    page = -1;
    playPage(K.current());
    tip.textContent = u().tapHint;
    tip.classList.add("on");
    window.clearTimeout(tipTimer);
    tipTimer = window.setTimeout(function () { tip.classList.remove("on"); }, 2600);
    showChrome();
    playBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!open) return;
    open = false;
    token += 1;
    clearWait();
    Narrator.stop();
    window.clearTimeout(chromeTimer);
    window.clearTimeout(tipTimer);
    ended = false;
    root.hidden = true;
    root.classList.remove("chrome", "paused", "ended");
    shots.forEach(function (s) { s.classList.remove("on", "kb-a", "kb-b"); });
    card.classList.remove("on");
    chapterCard.classList.remove("on");
    sub.classList.remove("on");
    document.body.classList.remove("in-theatre");
    Native.immersive(false);
    Native.allowSleep();
    if (page >= 0) K.go(page);
    if (openBtn) openBtn.focus({ preventScroll: true });
  }

  // Gestures: tap toggles controls, horizontal swipe changes page, swipe down exits.
  var touch = null;
  stage.parentNode.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button")) return;
    touch = { x: e.clientX, y: e.clientY, t: Date.now() };
  });
  stage.parentNode.addEventListener("pointerup", function (e) {
    if (!touch || e.target.closest("button")) {
      touch = null;
      return;
    }
    var dx = e.clientX - touch.x;
    var dy = e.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
    else if (dy > 110 && Math.abs(dy) > Math.abs(dx) * 1.4) close();
    else if (Math.abs(dx) < 12 && Math.abs(dy) < 12) toggleChrome();
  });

  exitBtn.addEventListener("click", close);
  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", function () { step(-1); });
  nextBtn.addEventListener("click", function () { step(1); });
  speedBtn.addEventListener("click", cycleRate);
  ccBtn.addEventListener("click", toggleSubs);
  fitBtn.addEventListener("click", toggleFit);
  if (openBtn) openBtn.addEventListener("click", openTheatre);

  window.addEventListener("keydown", function (e) {
    if (!open) return;
    var handled = true;
    var key = e.key;
    if (key === "Escape") close();
    else if (key === " " || key === "k" || key === "K") togglePlay();
    else if (key === "ArrowRight" || key === "ArrowDown" || key === "l") step(1);
    else if (key === "ArrowLeft" || key === "ArrowUp" || key === "j") step(-1);
    else if (key === "c" || key === "C") toggleSubs();
    else if (key === "f" || key === "F") toggleFit();
    else if (key === "Tab") { showChrome(); handled = false; }
    else handled = false;
    if (handled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener("resize", function () {
    if (open) shots.forEach(measurePan);
  });

  document.addEventListener("visibilitychange", function () {
    if (!open) return;
    if (document.hidden && !paused) {
      autoPaused = true;
      setPaused(true);
    } else if (!document.hidden && autoPaused) {
      autoPaused = false;
      setPaused(false);
    }
  });

  Native.onBack(function () {
    if (!open) return false;
    close();
    return true;
  });

  return {
    open: openTheatre,
    close: close,
    isOpen: function () { return open; }
  };
})();
