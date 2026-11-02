(function () {
  var feed = document.getElementById("feed");
  var countEl = document.getElementById("count");
  var barEl = document.getElementById("bar");
  var live = document.getElementById("live");
  var sheet = document.getElementById("sheet");
  var list = document.getElementById("list");
  var search = document.getElementById("search");
  var likeBtn = document.getElementById("like");
  var listenBtn = document.getElementById("listen");
  var chips = document.getElementById("chips");
  var hint = document.getElementById("hint");
  var toast = document.getElementById("toast");
  var readStat = document.getElementById("read-stat");
  var wash = document.getElementById("wash");
  var langBox = document.getElementById("lang");
  var topTools = document.getElementById("top-tools");
  var libraryTools = document.getElementById("library-tools");
  var langBtn = document.getElementById("lang-btn");
  var langMenu = document.getElementById("lang-menu");
  var library = document.getElementById("library");
  var libraryList = document.getElementById("library-list");
  var libraryTitle = document.getElementById("library-title");
  var libraryClose = document.getElementById("library-close");
  var brandMark = document.getElementById("brand-mark");
  var sheetTitle = document.getElementById("sheet-title");
  var noteText = document.getElementById("note-text");
  var startOver = document.getElementById("start-over");
  var bookLabel = document.getElementById("book-label");
  var kandaFrac = document.getElementById("kanda-frac");
  var progressEl = document.getElementById("progress");
  var keysEl = document.getElementById("keys");
  var player = document.getElementById("player");
  var playerPause = document.getElementById("player-pause");
  var playerTime = document.getElementById("player-time");
  var speeds = document.getElementById("speeds");
  var gate = document.getElementById("gate");
  var gateKicker = document.getElementById("gate-kicker");
  var gateTitle = document.getElementById("gate-title");
  var gateBody = document.getElementById("gate-body");
  var gateGo = document.getElementById("gate-go");
  var done = document.getElementById("done");
  var doneKicker = document.getElementById("done-kicker");
  var doneTitle = document.getElementById("done-title");
  var doneBody = document.getElementById("done-body");
  var doneClose = document.getElementById("done-close");

  var active = null;
  var entered = false;
  var STORIES;
  var CHAPTERS;
  var BOOKS;

  function bindWork(work) {
    active = work;
    STORIES = work.pages;
    CHAPTERS = work.chapters;
    BOOKS = work.books;
  }

  bindWork(CATALOG.filter(function (w) { return w.ready; })[0]);

  function slot(name) {
    var key = "katha-" + active.id + "-" + name;
    if (active.id === "ramayana" && localStorage.getItem(key) == null) {
      var old = localStorage.getItem("ramayana-" + name);
      if (old != null) localStorage.setItem(key, old);
    }
    return key;
  }

  function globalKey(name, legacy) {
    var key = "katha-" + name;
    if (localStorage.getItem(key) == null && legacy && localStorage.getItem(legacy) != null) {
      localStorage.setItem(key, localStorage.getItem(legacy));
    }
    return key;
  }

  var LANG_KEY = globalKey("lang", "ramayana-lang");
  var HINT_KEY = globalKey("hint", "ramayana-hint");
  var RATE_KEY = globalKey("rate", "ramayana-rate");

  function langMeta(code) {
    var id = code || LANG;
    for (var i = 0; i < LANGUAGES.length; i++) {
      if (LANGUAGES[i].id === id) return LANGUAGES[i];
    }
    return LANGUAGES[0];
  }

  function knownLang(code) {
    return LANGUAGES.some(function (l) { return l.id === code; });
  }

  var likes = loadSet(slot("likes"));
  var seen = loadSet(slot("seen"));
  var index = -1;
  var chapterFilter = "all";
  var query = "";
  var toastTimer = 0;
  var lock = false;
  var observer = null;
  var LANG = initialLang();
  var speaking = false;
  var speakToken = 0;
  var speakTimer = 0;
  var warnedVoice = {};
  var speechRate = (function () {
    var n = Number(localStorage.getItem(RATE_KEY));
    return n === 0.75 || n === 1 || n === 1.25 || n === 1.5 ? n : 1;
  })();
  var speechPaused = false;
  var endsAt = 0;
  var pausedLeft = 0;
  var clockTimer = 0;
  var allowCross = false;
  var pending = -1;
  var resumeListen = false;

  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 20.5s-7.2-4.6-7.2-9.2A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.2 3.1c0 4.6-7.2 9.2-7.2 9.2z"/></svg>';

  function initialLang() {
    var saved = localStorage.getItem(LANG_KEY);
    if (knownLang(saved)) return saved;
    var nav = (navigator.language || "").toLowerCase();
    for (var i = 0; i < LANGUAGES.length; i++) {
      if (nav.indexOf(LANGUAGES[i].id) === 0) return LANGUAGES[i].id;
    }
    return "en";
  }

  // Menus, buttons and messages stay in English; only the story follows the reading language.
  function ui() {
    return UI.en;
  }

  // Lines that are part of the story itself (between-Kanda cards, "next" peeks).
  function storyUI() {
    return UI[LANG] || UI.en;
  }

  function workCopy() {
    var copy = (active && active.copy) || {};
    return copy[LANG] || copy.en || {};
  }

  function workTitle() {
    var titles = (active && active.titles) || {};
    return titles[LANG] || titles.en || "";
  }

  function loadSet(key) {
    try {
      return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch (err) {
      return new Set();
    }
  }

  function saveSet(key, set) {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function chapterOf(id) {
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].id === id) return CHAPTERS[i];
    }
    return CHAPTERS[0];
  }

  function textOf(story) {
    var bag = story.text || { en: story.en, hi: story.hi };
    if (bag[LANG]) return { text: bag[LANG], missing: false };
    return { text: bag.en || story.en, missing: LANG !== "en" };
  }

  function T(story) {
    return textOf(story).text;
  }

  function kandaPair(story) {
    return (BOOKS && BOOKS[story.chapter]) || ["", ""];
  }

  function kandaKey(i) {
    return kandaPair(STORIES[i])[0];
  }

  function kandaLabel(i) {
    var pair = kandaPair(STORIES[i]);
    var names = active.kandas && active.kandas[pair[0]];
    if (names && names[LANG]) return names[LANG];
    if (LANG === "hi" && pair[1]) return pair[1];
    return pair[0];
  }

  function devanagari() {
    return LANG === "hi" || LANG === "mr";
  }

  function kandaSpan(i) {
    var key = kandaKey(i);
    var first = i;
    var last = i;
    while (first > 0 && kandaKey(first - 1) === key) first -= 1;
    while (last < STORIES.length - 1 && kandaKey(last + 1) === key) last += 1;
    return { pos: i - first + 1, total: last - first + 1 };
  }

  function peekHTML(i) {
    var label;
    if (i >= STORIES.length - 1) label = storyUI().epicEnd;
    else if (kandaKey(i) !== kandaKey(i + 1)) label = kandaLabel(i + 1);
    else label = T(STORIES[i + 1]).title;
    return '<p class="next-peek"><span>' + esc(storyUI().nextWord) + "</span><b>" + esc(label) + "</b></p>";
  }

  function partOf(story) {
    var mates = STORIES.filter(function (s) { return s.chapter === story.chapter; });
    return { part: mates.indexOf(story) + 1, total: mates.length };
  }

  function cardHTML(story, i) {
    var ch = chapterOf(story.chapter);
    var shown = textOf(story);
    var text = shown.text;
    var part = partOf(story);
    var kickerRest = (devanagari() ? "" : ch.en + " \u00b7 ") + part.part + " / " + part.total;
    var script = shown.missing ? "en" : LANG;
    var used = new Set();
    var gloss = function (s) { return Depth.mark(esc(s), script, active.id, used); };
    var body = text.body.map(function (p, n) { return (n ? '<p class="more">' : "<p>") + gloss(p) + "</p>"; }).join("");
    var line = text.line ? '<p class="line">' + esc(text.line) + "</p>" : "";
    var missing = shown.missing ? '<p class="unwritten">' + esc(ui().missing) + "</p>" : "";
    var fy = (typeof FOCUS !== "undefined" && FOCUS[story.image] != null) ? FOCUS[story.image] : 50;
    return (
      '<article class="card script-' + script + '"' + (langMeta(script).dir === "rtl" ? ' dir="rtl"' : "") + ' data-i="' + i + '" data-id="' + story.id + '" style="--deep:' + ch.deep + ";--mid:" + ch.mid + '" aria-label="' + esc(text.title) + '">' +
      '<div class="art"><img src="images/' + esc(story.image) + '?v=4" alt="" draggable="false" style="--fy:' + fy + '%"></div>' +
      '<div class="copy">' +
      '<p class="kicker"><span class="dev">' + esc(ch.hi) + "</span><span>" + esc(kickerRest) + "</span>" + Depth.pill(active.id, story.id, ui()) + "</p>" +
      missing +
      "<h2>" + esc(text.title) + "</h2>" +
      '<p class="hook">' + gloss(text.hook) + "</p>" +
      body +
      line +
      "</div>" +
      peekHTML(i) +
      "</article>"
    );
  }

  function fitCard(card) {
    var copy = card.querySelector(".copy");
    if (!copy || copy.clientHeight < 40) return;
    var fit = 1;
    copy.style.setProperty("--fit", "1");
    var guard = 0;
    while (copy.scrollHeight > copy.clientHeight + 1 && fit > 0.5 && guard < 18) {
      fit = Math.round((fit - 0.03) * 100) / 100;
      copy.style.setProperty("--fit", String(fit));
      guard += 1;
    }
  }

  function fitPages() {
    Array.prototype.forEach.call(feed.children, fitCard);
  }

  function renderFeed() {
    feed.innerHTML = STORIES.map(cardHTML).join("");
    requestAnimationFrame(function () {
      fitPages();
      requestAnimationFrame(fitPages);
    });
  }

  function storyHay(story) {
    var ch = chapterOf(story.chapter);
    var bag = story.text || { en: story.en, hi: story.hi };
    var parts = [ch.en, ch.hi];
    Object.keys(bag).forEach(function (code) {
      var text = bag[code];
      if (!text) return;
      parts.push(text.title, text.hook, text.line, (text.body || []).join(" "));
    });
    return parts.join(" ").toLowerCase();
  }

  function renderChips() {
    var u = ui();
    var items = [
      ["all", u.all + " " + STORIES.length],
      ["loved", likes.size ? u.saved + " " + likes.size : u.saved]
    ];
    if (Depth.people(active.id).length) items.push(["people", u.people]);
    CHAPTERS.forEach(function (ch) {
      items.push([ch.id, devanagari() ? ch.shortHi : ch.short]);
    });
    chips.innerHTML = items.map(function (item) {
      var on = item[0] === chapterFilter ? " on" : "";
      return '<button type="button" class="chip' + on + '" data-k="' + item[0] + '">' + esc(item[1]) + "</button>";
    }).join("");
  }

  function renderIndex() {
    renderChips();
    var q = query.trim().toLowerCase();
    if (chapterFilter === "people") {
      list.innerHTML = Depth.peopleHTML(active.id, LANG);
      if (q) {
        Array.prototype.forEach.call(list.children, function (row) {
          row.hidden = row.textContent.toLowerCase().indexOf(q) === -1;
        });
      }
      return;
    }
    var groups = [];
    var current = "";
    STORIES.forEach(function (story, i) {
      if (chapterFilter === "loved" && !likes.has(story.id)) return;
      if (chapterFilter !== "all" && chapterFilter !== "loved" && story.chapter !== chapterFilter) return;
      if (q && storyHay(story).indexOf(q) === -1) return;
      if (story.chapter !== current) {
        current = story.chapter;
        groups.push({ chapter: current, items: [] });
      }
      groups[groups.length - 1].items.push({ story: story, i: i });
    });

    if (!groups.length) {
      list.innerHTML = '<p class="empty">' + esc(chapterFilter === "loved" && !q ? ui().emptySaved : ui().empty) + "</p>";
      return;
    }

    list.innerHTML = groups.map(function (group) {
      var ch = chapterOf(group.chapter);
      var rows = group.items.map(function (item) {
        var text = T(item.story);
        var loved = likes.has(item.story.id) ? '<span class="heartlet" aria-label="' + esc(ui().saved) + '">\u2665</span>' : "<span></span>";
        var currentAttr = item.i === index ? ' aria-current="true"' : "";
        return (
          '<button type="button" class="row" data-i="' + item.i + '"' + currentAttr + ' style="--row:' + ch.mid + '">' +
          '<span class="num">' + String(item.i + 1).padStart(2, "0") + "</span>" +
          "<span><strong>" + esc(text.title) + "</strong><small>" + esc(text.hook) + "</small></span>" +
          loved +
          "</button>"
        );
      }).join("");
      var label = devanagari() ? "" : " " + ch.en;
      return '<h4 class="kanda-h" style="color:' + ch.mid + '"><span>' + esc(ch.hi) + "</span>" + esc(label) + " \u00b7 " + group.items.length + "</h4>" + rows;
    }).join("");
  }

  function applyChrome() {
    var u = ui();
    var meta = langMeta();
    LANGUAGES.forEach(function (l) { document.body.classList.remove("lang-" + l.id); });
    document.body.classList.remove("lang-indic");
    document.body.classList.add("lang-" + LANG);
    if (LANG !== "en") document.body.classList.add("lang-indic");
    var dir = meta.dir === "rtl" ? "rtl" : "ltr";
    ["pop-body", "quiz-body", "t-card", "t-sub", "gate", "done", "list"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.dir = dir;
    });
    document.documentElement.lang = LANG;
    sheetTitle.textContent = workTitle();
    search.placeholder = u.search;
    search.setAttribute("aria-label", u.search);
    noteText.textContent = workCopy().note || "";
    startOver.textContent = u.begin;
    if (index < 0) bookLabel.textContent = workTitle();
    keysEl.textContent = u.keys;
    langBox.setAttribute("aria-label", u.storyLang);
    if (langBtn) {
      langBtn.title = u.storyLang;
      langBtn.textContent = meta.short;
      langBtn.style.fontFamily = meta.font;
    }
    if (brandMark) {
      var mark = (active.mark && (active.mark[LANG] || active.mark.en)) || workTitle();
      brandMark.textContent = mark;
      brandMark.style.fontFamily = (LANG === "en" || LANG === "hi" || LANG === "mr")
        ? '"Tiro Devanagari Sanskrit", Georgia, serif'
        : meta.font;
    }
    document.getElementById("prev").setAttribute("aria-label", u.prev);
    document.getElementById("next").setAttribute("aria-label", u.next);
    document.getElementById("like").setAttribute("aria-label", u.like);
    syncListen();
    document.getElementById("open-index").setAttribute("aria-label", u.index);
    document.getElementById("share").setAttribute("aria-label", u.share);
    document.getElementById("close-sheet").setAttribute("aria-label", u.close);
    document.getElementById("brand").setAttribute("aria-label", u.works);
    if (libraryClose) libraryClose.setAttribute("aria-label", u.close);
    document.getElementById("listen-cap").textContent = speaking ? u.capStop : u.capListen;
    document.getElementById("index-cap").textContent = u.capIndex;
    document.getElementById("share-cap").textContent = u.capShare;
    document.getElementById("theatre-cap").textContent = u.capTheatre;
    document.getElementById("theatre-btn").setAttribute("aria-label", u.theatre);
    document.getElementById("theatre-btn").title = u.theatre;
    syncSave();
    if (playerPause) playerPause.textContent = speechPaused ? u.resume : u.pause;
    if (langMenu) {
      Array.prototype.forEach.call(langMenu.querySelectorAll("button"), function (btn) {
        var on = btn.dataset.lang === LANG;
        btn.classList.toggle("on", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    if (!hint.classList.contains("hide")) {
      hint.querySelector("span").textContent = window.matchMedia("(pointer: fine)").matches ? u.scroll : u.hint;
    }
    if (library && !library.hidden) {
      renderLibrary();
      if (!entered) document.title = u.choose;
    }
  }

  function setActive(i) {
    if (!entered) return;
    if (i === index) return;
    if (!allowCross && index >= 0 && i > index && kandaKey(i) !== kandaKey(index)) {
      showGate(i);
      lock = true;
      feed.scrollTo({ top: index * feed.clientHeight, behavior: "auto" });
      setTimeout(function () { lock = false; }, 140);
      return;
    }
    if (gate && !gate.hidden) gate.hidden = true;
    if (done && !done.hidden && i !== STORIES.length - 1) done.hidden = true;
    index = i;
    var story = STORIES[i];
    var ch = chapterOf(story.chapter);
    var text = T(story);
    var span = kandaSpan(i);
    bookLabel.textContent = kandaLabel(i);
    kandaFrac.textContent = span.pos + " / " + span.total;
    Array.prototype.forEach.call(feed.children, function (el, n) {
      el.classList.toggle("is-active", n === i);
    });
    countEl.textContent = (i + 1) + " / " + STORIES.length;
    countEl.title = (i + 1) + " / " + STORIES.length;
    barEl.style.transform = "scaleX(" + (span.pos / span.total) + ")";
    if (progressEl) {
      progressEl.setAttribute("aria-valuenow", String(span.pos));
      progressEl.setAttribute("aria-valuemax", String(span.total));
      progressEl.setAttribute("aria-label", bookLabel.textContent + " " + span.pos + " / " + span.total);
    }
    document.title = text.title + " \u00b7 " + bookLabel.textContent;
    live.textContent = (i + 1) + ". " + text.title + ". " + (devanagari() ? ch.hi : ch.en);
    document.documentElement.style.setProperty("--glow", ch.mid);
    wash.style.background = ch.mid;
    syncSave();
    if (!seen.has(story.id)) {
      seen.add(story.id);
      saveSet(slot("seen"), seen);
    }
    localStorage.setItem(slot("last"), String(i));
    readStat.textContent = seen.size + " / " + STORIES.length;
    if (location.hash !== "#" + story.id) {
      history.replaceState(null, "", "#" + story.id);
    }
    if (speaking) speakCurrent();
  }

  function go(i, smooth, chosen) {
    if (i >= STORIES.length) {
      showDone();
      return;
    }
    i = Math.max(0, Math.min(STORIES.length - 1, i));
    if (!chosen && index >= 0 && i > index && kandaKey(i) !== kandaKey(index)) {
      showGate(i);
      return;
    }
    if (chosen) allowCross = true;
    var top = i * feed.clientHeight;
    feed.scrollTo({ top: top, behavior: smooth ? "smooth" : "auto" });
    setActive(i);
    allowCross = false;
  }

  function showGate(i) {
    pending = i;
    if (speaking) resumeListen = true;
    stopSpeech();
    var from = index >= 0 ? kandaLabel(index) : "";
    var to = kandaLabel(i);
    gateKicker.textContent = from;
    gateTitle.textContent = storyUI().gateTitle;
    gateBody.textContent = storyUI().gateBody.replace("{from}", from).replace("{to}", to);
    gateGo.textContent = ui().cont + " \u00b7 " + to;
    done.hidden = true;
    gate.hidden = false;
  }

  function showDone() {
    stopSpeech();
    resumeListen = false;
    doneKicker.textContent = index >= 0 ? kandaLabel(index) : "";
    doneTitle.textContent = workCopy().doneTitle || "";
    doneBody.textContent = workCopy().doneBody || "";
    doneClose.textContent = ui().doneClose;
    gate.hidden = true;
    done.hidden = false;
  }

  function continueGate() {
    var i = pending;
    var resume = resumeListen;
    resumeListen = false;
    pending = -1;
    gate.hidden = true;
    if (i < 0) return;
    go(i, true, true);
    if (resume) startSpeech();
  }

  function startIndex() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (h) {
      var byId = STORIES.findIndex(function (s) { return s.id === h; });
      if (byId >= 0) return byId;
      var n = Number(h);
      if (n >= 1 && n <= STORIES.length) return n - 1;
    }
    var last = Number(localStorage.getItem(slot("last")));
    if (last >= 0 && last < STORIES.length) return last;
    return 0;
  }

  function syncSave() {
    var on = index >= 0 && likes.has(STORIES[index].id);
    likeBtn.classList.toggle("on", on);
    likeBtn.setAttribute("aria-pressed", on ? "true" : "false");
    var cap = document.getElementById("like-cap");
    if (cap) cap.textContent = on ? ui().capSaved : ui().capSave;
  }

  function toggleLike(id) {
    if (likes.has(id)) likes.delete(id);
    else likes.add(id);
    saveSet(slot("likes"), likes);
    syncSave();
    if (!sheet.hidden) renderIndex();
  }

  function burst(x, y) {
    var el = document.createElement("div");
    el.className = "burst";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.innerHTML = HEART;
    document.body.appendChild(el);
    el.addEventListener("animationend", function () { el.remove(); });
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  function spokenText(text) {
    var spoken = [text.title, text.hook].concat(text.body || []);
    if (text.line) spoken.push(text.line);
    return spoken.join(" ");
  }

  function tick() {
    if (!playerTime) return;
    var left = speechPaused ? pausedLeft : Math.max(0, endsAt - Date.now());
    var s = Math.ceil(left / 1000);
    var m = Math.floor(s / 60);
    var r = s % 60;
    playerTime.textContent = m + ":" + (r < 10 ? "0" : "") + r;
  }

  function syncListen() {
    if (!listenBtn) return;
    listenBtn.classList.toggle("is-live", speaking);
    listenBtn.setAttribute("aria-pressed", speaking ? "true" : "false");
    listenBtn.setAttribute("aria-label", speaking ? ui().stopListen : ui().listen);
    listenBtn.title = speaking ? ui().stopListen : ui().listen;
    var cap = document.getElementById("listen-cap");
    if (cap) cap.textContent = speaking ? ui().capStop : ui().capListen;
    document.body.classList.toggle("speaking", speaking);
    requestAnimationFrame(fitPages);
    if (player) player.hidden = !speaking;
    if (playerPause) {
      playerPause.textContent = speechPaused ? ui().resume : ui().pause;
      playerPause.setAttribute("aria-label", speechPaused ? ui().resume : ui().pause);
    }
    if (speeds) {
      Array.prototype.forEach.call(speeds.querySelectorAll("button"), function (btn) {
        var on = Number(btn.dataset.rate) === speechRate;
        btn.classList.toggle("on", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    if (speaking) {
      if (!clockTimer) clockTimer = window.setInterval(tick, 400);
      tick();
    } else if (clockTimer) {
      window.clearInterval(clockTimer);
      clockTimer = 0;
    }
  }

  function stopSpeech() {
    var was = speaking;
    speaking = false;
    speechPaused = false;
    speakToken += 1;
    window.clearTimeout(speakTimer);
    Narrator.stop();
    if (was) Native.allowSleep();
    syncListen();
  }

  function speakCurrent() {
    var token = ++speakToken;
    window.clearTimeout(speakTimer);
    Narrator.stop();
    speakTimer = window.setTimeout(function () {
      if (token !== speakToken || !speaking || index < 0) return;
      if (!Narrator.available()) {
        stopSpeech();
        showToast(ui().noAudio);
        return;
      }
      var shown = textOf(STORIES[index]);
      var speakLang = shown.missing ? "en" : LANG;
      var full = spokenText(shown.text);
      var charsPerSec = (speakLang !== "en" ? 11 : 13) * speechRate;
      pausedLeft = Math.max(8000, Math.round((full.length / charsPerSec) * 1000));
      endsAt = Date.now() + pausedLeft;
      speechPaused = false;
      syncListen();
      Narrator.hasVoice(langMeta(speakLang).voice).then(function (has) {
        if (token !== speakToken || !speaking) return;
        if (!has && speakLang !== "en" && !warnedVoice[speakLang]) {
          warnedVoice[speakLang] = true;
          showToast(ui().noVoice.replace("{name}", langMeta(speakLang).name));
        }
        Narrator.play({
          chunks: Narrator.chunks(full, 260),
          lang: has ? langMeta(speakLang).voice : "en-US",
          rate: speechRate,
          onDone: function () {
            if (token !== speakToken || !speaking) return;
            if (index >= STORIES.length - 1) {
              stopSpeech();
              showDone();
              return;
            }
            if (has && !shown.missing) go(index + 1, true);
            else stopSpeech();
          },
          onFail: function () {
            if (token !== speakToken) return;
            stopSpeech();
            showToast(ui().noAudio);
          }
        });
      });
    }, 70);
  }

  function startSpeech() {
    if (speaking) return;
    speaking = true;
    Native.stayAwake();
    syncListen();
    speakCurrent();
  }

  function toggleSpeech() {
    if (speaking) stopSpeech();
    else startSpeech();
  }

  function openSheet() {
    sheet.hidden = false;
    renderIndex();
    var current = list.querySelector('[aria-current="true"]');
    if (current) current.scrollIntoView({ block: "center" });
  }

  function closeSheet() {
    sheet.hidden = true;
    search.blur();
  }

  function dismissHint() {
    if (hint.classList.contains("hide")) return;
    hint.classList.add("hide");
    localStorage.setItem(HINT_KEY, "1");
  }

  function bindObserver() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      if (lock) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
          setActive(Number(entry.target.dataset.i));
        }
      });
    }, { root: feed, threshold: [0.65] });
    Array.prototype.forEach.call(feed.children, function (card) { observer.observe(card); });
  }

  function setLang(next) {
    if (!knownLang(next) || next === LANG) return;
    LANG = next;
    localStorage.setItem(LANG_KEY, LANG);
    var keep = index < 0 ? 0 : index;
    index = -1;
    applyChrome();
    renderFeed();
    bindObserver();
    requestAnimationFrame(function () {
      feed.scrollTop = keep * feed.clientHeight;
      setActive(keep);
    });
    if (!sheet.hidden) renderIndex();
  }

  function buildLangMenu() {
    langMenu.innerHTML = LANGUAGES.map(function (l) {
      return '<button type="button" role="option" data-lang="' + l.id + '" style="font-family:' + l.font + '"><b>' + esc(l.short) + "</b><span>" + esc(l.name) + "</span></button>";
    }).join("");
  }

  function closeLangMenu() {
    if (!langMenu || langMenu.hidden) return;
    langMenu.hidden = true;
    langBtn.setAttribute("aria-expanded", "false");
  }

  function renderLibrary() {
    libraryTitle.textContent = ui().choose;
    libraryList.innerHTML = CATALOG.filter(function (work) { return work.ready; }).map(function (work) {
      var title = (work.titles && (work.titles[LANG] || work.titles.en)) || work.id;
      var mark = (work.mark && (work.mark[LANG] || work.mark.en)) || (work.titles && work.titles.hi) || "";
      if (mark === title) mark = "";
      var meta;
      var open = entered && work.id === active.id;
      if (!work.ready) meta = ui().notYet;
      else meta = work.pages.length + " " + ui().pages + (open ? " · " + ui().now : "");
      var cls = "work" + (work.ready ? "" : " is-wait") + (open ? " is-open" : "");
      return '<button type="button" class="' + cls + '" data-work="' + esc(work.id) + '">' +
        (mark ? "<em>" + esc(mark) + "</em>" : "") +
        "<strong>" + esc(title) + "</strong><small>" + esc(meta) + "</small></button>";
    }).join("");
  }

  function openLibrary() {
    closeLangMenu();
    closeSheet();
    if (libraryTools && langBox.parentNode !== libraryTools) libraryTools.appendChild(langBox);
    library.hidden = false;
    libraryClose.hidden = !entered;
    document.body.classList.add("at-shelf");
    renderLibrary();
    document.title = ui().choose;
  }

  function closeLibrary() {
    if (!entered) return;
    if (topTools && langBox.parentNode !== topTools) topTools.insertBefore(langBox, countEl);
    library.hidden = true;
    document.body.classList.remove("at-shelf");
    if (index >= 0) document.title = T(STORIES[index]).title + " \u00b7 " + bookLabel.textContent;
  }

  function chooseWork(id) {
    var work = null;
    CATALOG.forEach(function (item) { if (item.id === id) work = item; });
    if (!work) return;
    if (!work.ready) {
      var waiting = (work.titles && (work.titles[LANG] || work.titles.en)) || work.id;
      showToast(waiting + " — " + ui().notYet);
      return;
    }
    if (entered && work.id === active.id) {
      closeLibrary();
      return;
    }
    stopSpeech();
    entered = true;
    bindWork(work);
    likes = loadSet(slot("likes"));
    seen = loadSet(slot("seen"));
    index = -1;
    chapterFilter = "all";
    query = "";
    closeLibrary();
    applyChrome();
    renderFeed();
    bindObserver();
    var start = startIndex();
    requestAnimationFrame(function () {
      feed.scrollTop = start * feed.clientHeight;
      setActive(start);
    });
  }

  function wrapLines(g, text, maxW) {
    var words = String(text || "").split(/\s+/);
    var lines = [];
    var line = "";
    words.forEach(function (word) {
      if (!word) return;
      var test = line ? line + " " + word : word;
      if (g.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function quoteBlob(story) {
    var shown = textOf(story);
    var text = shown.text;
    var face = shown.missing || LANG === "en" ? "Fraunces, Georgia, serif" : langMeta().canvas;
    var small = shown.missing || LANG === "en" ? "Outfit, sans-serif" : langMeta().canvas;
    var ch = chapterOf(story.chapter);
    var at = STORIES.indexOf(story);
    var book = at >= 0 ? kandaLabel(at) : workTitle();
    var c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1350;
    var g = c.getContext("2d");
    g.fillStyle = "#1a120c";
    g.fillRect(0, 0, 1080, 1350);
    g.strokeStyle = "rgba(240,215,168,0.45)";
    g.lineWidth = 3;
    g.strokeRect(48, 48, 984, 1254);
    g.fillStyle = "#f0d7a8";
    g.font = "500 28px " + small;
    g.fillText(book, 96, 140);
    g.font = "400 34px 'Tiro Devanagari Sanskrit', Georgia, serif";
    g.fillText(ch.hi, 96, 196);
    g.fillStyle = "#fffaf3";
    g.font = "640 64px " + face;
    var y = 300;
    wrapLines(g, text.title, 880).slice(0, 3).forEach(function (ln) {
      g.fillText(ln, 96, y);
      y += 80;
    });
    g.fillStyle = "#f0d7a8";
    g.font = "400 36px " + face;
    y += 16;
    wrapLines(g, text.hook, 880).slice(0, 4).forEach(function (ln) {
      g.fillText(ln, 96, y);
      y += 48;
    });
    g.fillStyle = "rgba(247,240,230,0.92)";
    g.font = "400 32px " + small;
    y += 28;
    var body = (text.body || []).concat(text.line ? [text.line] : []).join(" ");
    var lines = wrapLines(g, body, 880);
    var room = Math.max(1, Math.floor((1180 - y) / 46));
    lines.slice(0, room).forEach(function (ln, idx) {
      var cut = idx === room - 1 && lines.length > room;
      g.fillText(cut ? ln.slice(0, Math.max(0, ln.length - 1)) + "\u2026" : ln, 96, y);
      y += 46;
    });
    g.fillStyle = "rgba(240,215,168,0.75)";
    g.font = "500 24px " + ((active.mark && active.mark[LANG] && LANG !== "en") ? langMeta().canvas : "'Tiro Devanagari Sanskrit', Georgia, serif");
    g.fillText((active.mark && (active.mark[LANG] || active.mark.en)) || workTitle(), 96, 1248);
    return new Promise(function (resolve) {
      c.toBlob(function (blob) { resolve(blob); }, "image/png");
    });
  }

  async function share() {
    var story = STORIES[index];
    var text = T(story);
    var url = location.href.split("#")[0] + "#" + story.id;
    try {
      var blob = await quoteBlob(story);
      if (!blob) throw new Error("empty");
      var name = active.id + "-" + story.id + ".png";
      if (await Native.shareImage(blob, name, text.title, text.hook)) return;
      var file = new File([blob], name, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: text.title, text: text.hook });
        return;
      }
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
      window.setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      showToast(ui().imageSaved);
    } catch (err) {
      if (err && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(text.title + "\n" + text.hook + "\n" + url);
        showToast(ui().copied);
      } catch (err2) {
        showToast(url);
      }
    }
  }

  buildLangMenu();
  applyChrome();
  renderFeed();
  renderIndex();
  bindObserver();
  openLibrary();
  window.addEventListener("resize", fitPages);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPages);

  if (localStorage.getItem(HINT_KEY)) hint.classList.add("hide");

  document.getElementById("prev").addEventListener("click", function () { go(index - 1, true); dismissHint(); });
  document.getElementById("next").addEventListener("click", function () { go(index + 1, true); dismissHint(); });
  document.getElementById("open-index").addEventListener("click", openSheet);
  document.getElementById("brand").addEventListener("click", openLibrary);
  document.getElementById("close-sheet").addEventListener("click", closeSheet);
  document.getElementById("share").addEventListener("click", share);
  listenBtn.addEventListener("click", toggleSpeech);
  startOver.addEventListener("click", function () {
    closeSheet();
    go(0, true, true);
  });

  langBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = langMenu.hidden;
    langMenu.hidden = !open;
    langBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  langMenu.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-lang]");
    if (!btn) return;
    closeLangMenu();
    setLang(btn.dataset.lang);
  });
  document.addEventListener("click", function (e) {
    if (!langMenu || langMenu.hidden) return;
    if (!langBox.contains(e.target)) closeLangMenu();
  });
  libraryClose.addEventListener("click", closeLibrary);
  libraryList.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-work]");
    if (!btn) return;
    chooseWork(btn.dataset.work);
  });

  likeBtn.addEventListener("click", function () {
    var id = STORIES[index].id;
    var had = likes.has(id);
    toggleLike(id);
    if (!had) {
      showToast(ui().savedNow);
      var r = likeBtn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
      if (navigator.vibrate) navigator.vibrate(12);
    }
  });

  var lastTap = 0;
  feed.addEventListener("click", function (e) {
    var term = e.target.closest("[data-g]");
    if (term) { Depth.openTerm(term.dataset.g); return; }
    var more = e.target.closest("[data-x]");
    if (more) { Depth.openExtra(more.dataset.x); return; }
    if (e.target.closest("button, a, input")) return;
    var now = Date.now();
    if (now - lastTap < 280) {
      var id = STORIES[index].id;
      if (!likes.has(id)) {
        toggleLike(id);
        showToast(ui().savedNow);
        if (navigator.vibrate) navigator.vibrate(12);
      }
      burst(e.clientX, e.clientY);
    }
    lastTap = now;
  });

  chips.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-k]");
    if (!btn) return;
    chapterFilter = btn.dataset.k;
    renderIndex();
  });

  list.addEventListener("click", function (e) {
    var person = e.target.closest("[data-g]");
    if (person) { Depth.openTerm(person.dataset.g); return; }
    var row = e.target.closest("[data-i]");
    if (!row) return;
    closeSheet();
    go(Number(row.dataset.i), false, true);
    dismissHint();
  });

  search.addEventListener("input", function () {
    query = search.value;
    renderIndex();
  });

  sheet.addEventListener("click", function (e) {
    if (e.target === sheet) closeSheet();
  });

  feed.addEventListener("scroll", function () {
    if (feed.scrollTop > 12) dismissHint();
  }, { passive: true });

  function tryFinish(target) {
    if (index !== STORIES.length - 1 || !done.hidden || !gate.hidden) return;
    var copy = target && target.closest ? target.closest(".copy") : null;
    if (copy && copy.scrollTop + copy.clientHeight < copy.scrollHeight - 8) return;
    showDone();
  }

  var touchY = 0;
  feed.addEventListener("touchstart", function (e) {
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });
  feed.addEventListener("touchend", function (e) {
    if (touchY - e.changedTouches[0].clientY > 56) tryFinish(e.target);
  }, { passive: true });
  feed.addEventListener("wheel", function (e) {
    if (e.deltaY > 12) tryFinish(e.target);
  }, { passive: true });

  window.addEventListener("keydown", function (e) {
    var el = e.target instanceof Element ? e.target : null;
    var typing = !!(el && el.matches("input, textarea"));
    if (e.key === "Escape") {
      if (!library.hidden) { closeLibrary(); return; }
      if (langMenu && !langMenu.hidden) { closeLangMenu(); return; }
      if (gate && !gate.hidden) { gate.hidden = true; pending = -1; resumeListen = false; return; }
      if (done && !done.hidden) { done.hidden = true; return; }
      closeSheet();
      return;
    }
    if (typing) return;
    if (e.key === "/") {
      e.preventDefault();
      openSheet();
      search.focus();
      return;
    }
    if (!sheet.hidden || !gate.hidden || !done.hidden || Depth.isOpen() || (library && !library.hidden) || (langMenu && !langMenu.hidden)) return;
    if (e.key === "ArrowDown" || e.key === "j" || (e.key === " " && !(el && el.closest("button")))) {
      e.preventDefault();
      go(index + 1, true);
      dismissHint();
    } else if (e.key === "ArrowUp" || e.key === "k") {
      e.preventDefault();
      go(index - 1, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0, true, true);
    } else if (e.key === "End") {
      e.preventDefault();
      go(STORIES.length - 1, true, true);
    } else if (e.key === "a" || e.key === "A") {
      listenBtn.click();
    } else if ((e.key === "t" || e.key === "T") && typeof Theatre !== "undefined") {
      Theatre.open();
    } else if (e.key === "l" || e.key === "L") {
      likeBtn.click();
    } else if (e.key === "i" || e.key === "I") {
      openSheet();
    }
  });

  window.addEventListener("hashchange", function () {
    if (!entered) return;
    var h = decodeURIComponent(location.hash.replace(/^#/, ""));
    var i = STORIES.findIndex(function (s) { return s.id === h; });
    if (i >= 0 && i !== index) go(i, true, true);
  });

  window.addEventListener("resize", function () {
    lock = true;
    feed.scrollTo({ top: index * feed.clientHeight, behavior: "auto" });
    setTimeout(function () { lock = false; }, 80);
  });

  document.addEventListener("visibilitychange", function () {
    if (!speaking || speechPaused) return;
    if (document.hidden) Narrator.pause();
    else Narrator.resume();
  });

  playerPause.addEventListener("click", function () {
    if (!speaking) return;
    if (speechPaused) {
      speechPaused = false;
      endsAt = Date.now() + pausedLeft;
      Narrator.resume();
    } else {
      pausedLeft = Math.max(0, endsAt - Date.now());
      speechPaused = true;
      Narrator.pause();
    }
    syncListen();
  });

  speeds.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-rate]");
    if (!btn) return;
    speechRate = Number(btn.dataset.rate);
    localStorage.setItem(RATE_KEY, String(speechRate));
    syncListen();
    if (speaking && !speechPaused) Narrator.setRate(speechRate);
  });

  gateGo.addEventListener("click", continueGate);
  gate.addEventListener("click", function (e) {
    if (e.target.closest("#gate-go, .gate-quiz")) return;
    gate.hidden = true;
    pending = -1;
    resumeListen = false;
  });
  doneClose.addEventListener("click", function () { done.hidden = true; });

  Native.styleBars();
  Native.onBack(function () {
    if (Depth.close()) return true;
    if (langMenu && !langMenu.hidden) { closeLangMenu(); return true; }
    if (!sheet.hidden) { closeSheet(); return true; }
    if (gate && !gate.hidden) { gate.hidden = true; pending = -1; resumeListen = false; return true; }
    if (done && !done.hidden) { done.hidden = true; return true; }
    if (speaking) { stopSpeech(); return true; }
    if (entered && library.hidden) { openLibrary(); return true; }
    return false;
  });

  var splash = document.getElementById("splash");
  if (splash) {
    setTimeout(function () {
      splash.classList.add("gone");
      setTimeout(function () { splash.remove(); }, 700);
    }, 1900);
  }

  function closeOverlays() {
    Depth.close();
    closeLangMenu();
    closeSheet();
    if (gate) gate.hidden = true;
    if (done) done.hidden = true;
    pending = -1;
    resumeListen = false;
  }

  // The surface other modules (theatre.js) use to drive the reader.
  window.Katha = {
    entered: function () { return entered; },
    count: function () { return STORIES.length; },
    current: function () { return index; },
    story: function (i) { return STORIES[i]; },
    shown: function (i) { return textOf(STORIES[i]); },
    chapter: function (i) { return chapterOf(STORIES[i].chapter); },
    kandaKey: kandaKey,
    kandaLabel: kandaLabel,
    kandaSpan: kandaSpan,
    lang: function () { return LANG; },
    workId: function () { return active.id; },
    pageTitle: function (id) {
      var s = STORIES.find(function (x) { return x.id === id; });
      return s ? T(s).title : "";
    },
    langMeta: langMeta,
    ui: ui,
    rate: function () { return speechRate; },
    setRate: function (rate) {
      speechRate = rate;
      localStorage.setItem(RATE_KEY, String(rate));
      syncListen();
    },
    workCopy: workCopy,
    go: function (i) { go(i, false, true); },
    stopListening: stopSpeech,
    closeOverlays: closeOverlays,
    finish: showDone,
    refit: fitPages,
    toast: showToast
  };
})();
