// Context layers for readers new to the story: tap-to-explain words, character
// cards, and per-page verse / meaning / "why it matters" notes.
// Data: glossary.js (GLOSSARY_TERMS, GLOSSARY_PEOPLE) and extras.js (PAGE_EXTRAS).
var Depth = (function () {
  var TERMS = typeof GLOSSARY_TERMS !== "undefined" ? GLOSSARY_TERMS : [];
  var PEOPLE = typeof GLOSSARY_PEOPLE !== "undefined" ? GLOSSARY_PEOPLE : {};
  var EXTRAS = typeof PAGE_EXTRAS !== "undefined" ? PAGE_EXTRAS : {};
  if (typeof applyExtraTranslations === "function") applyExtraTranslations();

  var pop = document.getElementById("pop");
  var popBody = document.getElementById("pop-body");
  var popClose = document.getElementById("pop-close");
  var matchers = {};
  var lastFocus = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pick(bag, lang) {
    if (!bag) return "";
    return bag[lang] || bag.en || "";
  }

  function entries(work) {
    return TERMS.map(function (t) { return Object.assign({ kind: "term" }, t); })
      .concat((PEOPLE[work] || []).map(function (p) { return Object.assign({ kind: "person" }, p); }));
  }

  function find(work, id) {
    var all = entries(work);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function matcher(work, lang) {
    var key = work + ":" + lang;
    if (matchers[key] !== undefined) return matchers[key];
    var map = {};
    entries(work).forEach(function (entry) {
      ((entry.match && entry.match[lang]) || []).forEach(function (form) {
        map[form] = entry.id;
        if (/^[a-z]/.test(form)) map[form.charAt(0).toUpperCase() + form.slice(1)] = entry.id;
      });
    });
    var forms = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    if (!forms.length) {
      matchers[key] = null;
      return null;
    }
    var alt = forms.map(function (f) { return f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|");
    matchers[key] = { map: map, re: new RegExp("(^|[^\\p{L}\\p{M}])(" + alt + ")(?=[^\\p{L}\\p{M}]|$)", "gu") };
    return matchers[key];
  }

  // Wraps the first use of each known word in already-escaped HTML text.
  function mark(html, lang, work, used) {
    var m = matcher(work, lang);
    if (!m) return html;
    return html.replace(m.re, function (all, pre, word) {
      var id = m.map[word];
      if (!id || used.has(id)) return all;
      used.add(id);
      return pre + '<button type="button" class="gl" data-g="' + esc(id) + '">' + word + "</button>";
    });
  }

  function extra(work, pageId) {
    return (EXTRAS[work] && EXTRAS[work][pageId]) || null;
  }

  function pill(work, pageId, ui) {
    var x = extra(work, pageId);
    if (!x) return "";
    var label = x.verse ? ui.verse : x.why ? ui.why : ui.context;
    return '<button type="button" class="x-pill" data-x="' + esc(pageId) + '">' + esc(label) + "</button>";
  }

  function people(work) {
    return PEOPLE[work] || [];
  }

  function peopleHTML(work, lang) {
    return people(work).map(function (p) {
      return (
        '<button type="button" class="row person-row" data-g="' + esc(p.id) + '">' +
        '<span class="num">' + esc(pick(p.name, "hi").charAt(0)) + "</span>" +
        "<span><strong>" + esc(pick(p.name, lang)) + "</strong><small>" + esc(pick(p.role, lang)) + "</small></span>" +
        "<span></span></button>"
      );
    }).join("");
  }

  function K() {
    return window.Katha;
  }

  function show(html) {
    popBody.innerHTML = html;
    if (pop.hidden) lastFocus = document.activeElement;
    pop.hidden = false;
    popBody.scrollTop = 0;
    popClose.focus({ preventScroll: true });
  }

  function close() {
    if (pop.hidden) return false;
    Narrator.stop();
    pop.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    return true;
  }

  function openTerm(id) {
    var k = K();
    var work = k.workId();
    var lang = k.lang();
    var ui = k.ui();
    var e = find(work, id);
    if (!e) return;
    var name = pick(e.name, lang);
    var latin = e.name.en && e.name.en !== name ? '<span class="pop-latin">' + esc(e.name.en) + "</span>" : "";
    var native = e.name.hi && e.name.hi !== name ? '<span class="pop-native">' + esc(e.name.hi) + "</span>" : "";
    var rel = (e.rel || []).map(function (r) {
      var other = find(work, r[0]);
      if (!other) return "";
      return '<button type="button" class="rel" data-g="' + esc(other.id) + '"><small>' + esc(pick(r[1], lang)) + "</small>" + esc(pick(other.name, lang)) + "</button>";
    }).join("");
    show(
      (e.image ? '<img class="pop-img" src="images/' + esc(e.image) + '?v=4" alt="">' : "") +
      '<p class="pop-kind">' + esc(e.kind === "person" ? ui.person : ui.word) + "</p>" +
      '<h3 id="pop-title">' + esc(name) + latin + native + "</h3>" +
      (e.say ? '<p class="pop-say"><span>' + esc(ui.sayIt) + "</span> " + esc(e.say) + "</p>" : "") +
      (e.role ? '<p class="pop-role">' + esc(pick(e.role, lang)) + "</p>" : "") +
      '<p class="pop-text">' + esc(pick(e.text, lang)) + "</p>" +
      (rel ? '<div class="rels">' + rel + "</div>" : "")
    );
  }

  function openExtra(pageId) {
    var k = K();
    var work = k.workId();
    var lang = k.lang();
    var ui = k.ui();
    var x = extra(work, pageId);
    if (!x) return;
    var html = '<p class="pop-kind">' + esc(k.pageTitle(pageId)) + "</p>";
    if (x.verse) {
      html +=
        '<h3 id="pop-title">' + esc(ui.verseTitle) + "</h3>" +
        '<p class="verse-dev">' + esc(x.verse).replace(/\n/g, "<br>") + "</p>" +
        (x.iast ? '<p class="verse-iast">' + esc(x.iast).replace(/\n/g, "<br>") + "</p>" : "") +
        '<button type="button" class="verse-play" id="verse-play">' + esc(ui.hearVerse) + "</button>" +
        (x.meaning ? '<p class="pop-text">' + esc(pick(x.meaning, lang)) + "</p>" : "") +
        (x.ref ? '<p class="verse-ref">' + esc(ui.source) + ": Valmiki Ramayana, " + esc(x.ref) + "</p>" : "");
    }
    if (x.why) html += '<h4 class="pop-h">' + esc(ui.why) + '</h4><p class="pop-text">' + esc(pick(x.why, lang)) + "</p>";
    if (x.context) html += '<h4 class="pop-h">' + esc(ui.context) + '</h4><p class="pop-text">' + esc(pick(x.context, lang)) + "</p>";
    if (!x.verse) html = html.replace('<h4 class="pop-h">', '<h3 id="pop-title" class="pop-h">').replace("</h4>", "</h3>");
    show(html);
    var play = document.getElementById("verse-play");
    if (play) {
      play.addEventListener("click", function () {
        k.stopListening();
        play.classList.add("is-live");
        Narrator.play({
          chunks: x.verse.split("\n"),
          lang: "hi-IN",
          rate: 0.85,
          onDone: function () { play.classList.remove("is-live"); },
          onFail: function () { play.classList.remove("is-live"); k.toast(ui.noAudio); }
        });
      });
    }
  }

  if (pop) {
    popClose.addEventListener("click", close);
    pop.addEventListener("click", function (e) {
      if (e.target === pop) {
        close();
        return;
      }
      var g = e.target.closest("[data-g]");
      if (g) openTerm(g.dataset.g);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !pop.hidden) {
        e.stopImmediatePropagation();
        close();
      }
    }, true);
    if (typeof Native !== "undefined") Native.onBack(close);
  }

  return {
    mark: mark,
    pill: pill,
    hasExtra: function (work, pageId) { return !!extra(work, pageId); },
    people: people,
    peopleHTML: peopleHTML,
    openTerm: openTerm,
    openExtra: openExtra,
    close: close,
    isOpen: function () { return !!pop && !pop.hidden; }
  };
})();
