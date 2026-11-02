// Kids mode (bigger type, only the first paragraph of longer pages) and end-of-Kanda quizzes.
(function () {
  var K = window.Katha;
  var DATA = typeof QUIZZES !== "undefined" ? QUIZZES : {};
  var KIDS_KEY = "katha-kids";
  var QUIZ_LEN = 5;

  var kidsBtn = document.getElementById("kids-btn");
  var quiz = document.getElementById("quiz");
  var quizBody = document.getElementById("quiz-body");
  var quizClose = document.getElementById("quiz-close");
  var gate = document.getElementById("gate");
  var done = document.getElementById("done");
  if (!K || !quiz) return;
  if (typeof applyExtraTranslations === "function") applyExtraTranslations();

  var state = null;
  var lastFocus = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function say(pair) {
    return K.lang() === "hi" && pair[1] ? pair[1] : pair[0];
  }

  function question(item) {
    var t = item.tr && item.tr[K.lang()];
    return t && t.q ? t.q : say(item.q);
  }

  function answer(item, i) {
    var t = item.tr && item.tr[K.lang()];
    return t && t.a && t.a[i] ? t.a[i] : say(item.a[i]);
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  // ---------- Kids mode ----------

  function kidsOn() {
    return document.body.classList.contains("kids");
  }

  function setKids(on, announce) {
    document.body.classList.toggle("kids", on);
    localStorage.setItem(KIDS_KEY, on ? "1" : "0");
    if (kidsBtn) kidsBtn.setAttribute("aria-pressed", String(on));
    K.refit();
    requestAnimationFrame(K.refit);
    if (announce) K.toast(on ? K.ui().kidsOn : K.ui().kidsOff);
  }

  function labelKids() {
    if (!kidsBtn) return;
    kidsBtn.textContent = K.ui().kids;
    kidsBtn.title = K.ui().kidsHint;
  }

  if (kidsBtn) kidsBtn.addEventListener("click", function () { setKids(!kidsOn(), true); });
  setKids(localStorage.getItem(KIDS_KEY) === "1", false);

  // ---------- Quiz ----------

  function bank(kanda) {
    var work = DATA[K.workId()];
    return (work && work[kanda]) || null;
  }

  function bestKey() {
    return "katha-" + K.workId() + "-quiz";
  }

  function bests() {
    try {
      return JSON.parse(localStorage.getItem(bestKey()) || "{}");
    } catch (err) {
      return {};
    }
  }

  function saveBest(kanda, score) {
    var all = bests();
    if (!(all[kanda] >= score)) {
      all[kanda] = score;
      localStorage.setItem(bestKey(), JSON.stringify(all));
    }
  }

  function quizButton(host) {
    var btn = host.querySelector(".gate-quiz");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gate-quiz";
      host.appendChild(btn);
      btn.addEventListener("click", function () { openQuiz(Number(btn.dataset.at)); });
    }
    return btn;
  }

  function offerQuiz(host) {
    if (host.hidden) return;
    var at = K.current();
    var btn = quizButton(host);
    var kanda = at >= 0 ? K.kandaKey(at) : "";
    if (!bank(kanda)) {
      btn.hidden = true;
      return;
    }
    var best = bests()[kanda];
    btn.dataset.at = String(at);
    btn.textContent = K.ui().quizOffer.replace("{kanda}", K.kandaLabel(at)) +
      (best != null ? "  \u00b7  \u2605 " + best + "/" + QUIZ_LEN : "");
    btn.hidden = false;
  }

  function openQuiz(at) {
    var kanda = K.kandaKey(at);
    var items = bank(kanda);
    if (!items) return;
    K.stopListening();
    state = {
      at: at,
      kanda: kanda,
      n: 0,
      score: 0,
      items: shuffle(items).slice(0, QUIZ_LEN).map(function (item) {
        return { q: question(item), answers: shuffle(item.a.map(function (a, i) { return { text: answer(item, i), right: i === 0 }; })) };
      })
    };
    lastFocus = document.activeElement;
    quiz.hidden = false;
    renderQuestion();
  }

  function renderQuestion() {
    var u = K.ui();
    var item = state.items[state.n];
    quizBody.innerHTML =
      '<p class="pop-kind">' + esc(K.kandaLabel(state.at)) + "</p>" +
      '<div class="quiz-dots" aria-hidden="true">' + state.items.map(function (_, i) {
        return "<i" + (i < state.n ? ' class="past"' : i === state.n ? ' class="now"' : "") + "></i>";
      }).join("") + "</div>" +
      '<p class="quiz-step">' + esc(u.quizStep.replace("{n}", state.n + 1).replace("{t}", state.items.length)) + "</p>" +
      '<h3 id="quiz-title">' + esc(item.q) + "</h3>" +
      '<div class="quiz-opts">' + item.answers.map(function (a, i) {
        return '<button type="button" class="quiz-opt" data-o="' + i + '">' + esc(a.text) + "</button>";
      }).join("") + "</div>" +
      '<button type="button" class="verse-play quiz-next" hidden>' +
      esc(state.n + 1 < state.items.length ? u.quizNext : u.quizScore) + "</button>";
    quizBody.scrollTop = 0;
    var first = quizBody.querySelector(".quiz-opt");
    if (first) first.focus({ preventScroll: true });
  }

  function pick(i) {
    var item = state.items[state.n];
    if (item.picked != null) return;
    item.picked = i;
    var right = item.answers[i].right;
    if (right) state.score += 1;
    Array.prototype.forEach.call(quizBody.querySelectorAll(".quiz-opt"), function (btn, n) {
      btn.disabled = true;
      if (item.answers[n].right) btn.classList.add("right");
      else if (n === i) btn.classList.add("wrong");
    });
    if (navigator.vibrate) navigator.vibrate(right ? 12 : [20, 40, 20]);
    var next = quizBody.querySelector(".quiz-next");
    next.hidden = false;
    next.focus({ preventScroll: true });
  }

  function renderScore() {
    var u = K.ui();
    var s = state.score;
    var t = state.items.length;
    saveBest(state.kanda, s);
    var msg = s === t ? u.quizPerfect : s >= t - 2 ? u.quizGood : u.quizTry;
    var stars = "";
    for (var i = 0; i < t; i++) stars += i < s ? "\u2605" : "\u2606";
    quizBody.innerHTML =
      '<p class="pop-kind">' + esc(K.kandaLabel(state.at)) + "</p>" +
      '<p class="quiz-stars" aria-hidden="true">' + stars + "</p>" +
      '<h3 id="quiz-title" class="quiz-total">' + s + " / " + t + "</h3>" +
      '<p class="pop-text">' + esc(msg) + "</p>" +
      '<div class="quiz-end">' +
      '<button type="button" class="verse-play" data-act="again">' + esc(u.quizAgain) + "</button>" +
      '<button type="button" class="verse-play" data-act="close">' + esc(u.cont) + "</button>" +
      "</div>";
    quizBody.querySelector('[data-act="close"]').focus({ preventScroll: true });
    offerQuiz(gate);
    offerQuiz(done);
  }

  function closeQuiz() {
    if (quiz.hidden) return false;
    quiz.hidden = true;
    state = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    return true;
  }

  quizBody.addEventListener("click", function (e) {
    if (!state) return;
    var opt = e.target.closest("[data-o]");
    if (opt) { pick(Number(opt.dataset.o)); return; }
    if (e.target.closest(".quiz-next")) {
      state.n += 1;
      if (state.n < state.items.length) renderQuestion();
      else renderScore();
      return;
    }
    var act = e.target.closest("[data-act]");
    if (act && act.dataset.act === "again") openQuiz(state.at);
    else if (act) closeQuiz();
  });

  quizClose.addEventListener("click", closeQuiz);
  quiz.addEventListener("click", function (e) { if (e.target === quiz) closeQuiz(); });
  window.addEventListener("keydown", function (e) {
    if (quiz.hidden) return;
    if (e.key === "Escape") {
      e.stopImmediatePropagation();
      closeQuiz();
    } else if (/^[1-4]$/.test(e.key) && state && state.items[state.n]) {
      var btn = quizBody.querySelectorAll(".quiz-opt")[Number(e.key) - 1];
      if (btn) btn.click();
    }
  }, true);
  if (typeof Native !== "undefined") Native.onBack(closeQuiz);

  // Offer the quiz whenever the Kanda gate or the finish screen appears.
  var watch = new MutationObserver(function (records) {
    records.forEach(function (r) { offerQuiz(r.target); });
  });
  [gate, done].forEach(function (host) {
    if (host) watch.observe(host, { attributes: true, attributeFilter: ["hidden"] });
  });

  // Relabel when the reader switches language (app.js sets <html lang>).
  new MutationObserver(function () {
    labelKids();
    offerQuiz(gate);
    offerQuiz(done);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  labelKids();

  window.Learn = { openQuiz: openQuiz, setKids: setKids, isKids: kidsOn };
})();
