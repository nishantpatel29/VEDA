"use strict";

var fs = require("fs");
var path = require("path");

var LANGS = ["en", "hi", "te", "ta", "gu", "mr", "kn", "ml"];
var OPTIONAL = ["te", "ta", "gu", "mr", "kn", "ml"];
var BANNED = ["rank", "score", "trending", "foryou", "because", "algorithm", "recommend", "boost"];
var PALETTE = [
  { mid: "#c4b2f5", deep: "#14101c", sky: "#3a2d6e", sky2: "#211845" },
  { mid: "#f0a35a", deep: "#241109", sky: "#c4622c", sky2: "#6a3016" },
  { mid: "#7dcea0", deep: "#071410", sky: "#1c6b52", sky2: "#0c3328" },
  { mid: "#7ee0ef", deep: "#061318", sky: "#14788a", sky2: "#0a3c48" },
  { mid: "#e7d7c4", deep: "#16120e", sky: "#6a5a48", sky2: "#2e261c" },
  { mid: "#f07198", deep: "#1c0a12", sky: "#8d2448", sky2: "#4a1028" },
  { mid: "#e07070", deep: "#160606", sky: "#7a2820", sky2: "#3a100e" },
  { mid: "#c4b8a8", deep: "#0c1218", sky: "#4a5560", sky2: "#1c242c" }
];

function splitText(arr) {
  if (arr.length >= 5) {
    return { title: arr[0], hook: arr[1], body: [arr[2], arr[3]], line: arr[4] };
  }
  return { title: arr[0], hook: arr[1], body: arr[2] ? [arr[2]] : [], line: arr[3] || "" };
}

function hasDevanagari(s) {
  return /[\u0900-\u097F]/.test(s);
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "part";
}

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  var i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    var marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01) {
      i += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null;
    var len = buf.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > buf.length) return null;
    var sof = (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
    if (sof) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

function paragraphs(blockLines) {
  var paras = [];
  var buf = [];
  function flush() {
    var text = buf.join(" ").replace(/\s+/g, " ").trim();
    buf = [];
    if (text) paras.push(text);
  }
  blockLines.forEach(function (line) {
    if (line.trim() === "") flush();
    else buf.push(line.trim());
  });
  flush();
  return paras;
}

function takeLang(paras, errors, where) {
  var groups = { en: [], hi: [] };
  var i = 0;
  while (i < paras.length && !hasDevanagari(paras[i]) && !/^Lang:\s*[a-z]{2}\s*$/i.test(paras[i])) {
    if (/[\u0900-\u097F\u0C00-\u0C7F\u0B80-\u0BFF\u0A80-\u0AFF\u0C80-\u0CFF\u0D00-\u0D7F]/.test(paras[i])) {
      errors.push(where + ": keep each language in its own paragraph");
    }
    groups.en.push(paras[i]);
    i += 1;
  }
  while (i < paras.length && hasDevanagari(paras[i]) && !/^Lang:\s*[a-z]{2}\s*$/i.test(paras[i])) {
    groups.hi.push(paras[i]);
    i += 1;
  }
  while (i < paras.length) {
    var mark = /^Lang:\s*([a-z]{2})\s*$/i.exec(paras[i]);
    if (!mark) {
      errors.push(where + ": extra text after Hindi. Optional languages start with a line 'Lang: te' (or ta, gu, mr, kn, ml)");
      break;
    }
    var code = mark[1].toLowerCase();
    if (OPTIONAL.indexOf(code) === -1) {
      errors.push(where + ": Lang " + code + " is not one of te, ta, gu, mr, kn, ml. Do not invent a translation block for English or Hindi");
    }
    if (groups[code]) errors.push(where + ": " + code + " is written twice");
    groups[code] = [];
    i += 1;
    while (i < paras.length && !/^Lang:\s*[a-z]{2}\s*$/i.test(paras[i])) {
      groups[code].push(paras[i]);
      i += 1;
    }
  }
  return groups;
}

function compileStory(dir) {
  var errors = [];
  var metaPath = path.join(dir, "book.json");
  var mdPath = path.join(dir, "book.md");
  if (!fs.existsSync(metaPath) || !fs.existsSync(mdPath)) {
    return { errors: ["missing book.json or book.md"], book: null };
  }
  var meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch (err) {
    return { errors: ["book.json is not valid JSON"], book: null };
  }
  var id = meta.id;
  if (!id || !/^[a-z][a-z0-9-]{1,40}$/.test(id)) {
    errors.push("book.json id must be a short lowercase name, like mahabharata");
  }
  if (id === "ramayana") {
    errors.push("Ramayana is already the shipped book. Do not rebuild it from stories/ramayana");
  }
  if (path.basename(dir) !== id) {
    errors.push("folder name must match book.json id");
  }
  Object.keys(meta).forEach(function (key) {
    if (BANNED.indexOf(key.toLowerCase()) !== -1) {
      errors.push("book.json must not have '" + key + "'. Story order only. No ranking");
    }
  });
  if (!meta.titles || !meta.titles.en || !meta.titles.hi) errors.push("titles.en and titles.hi are required");
  ["en", "hi"].forEach(function (code) {
    var copy = meta.copy && meta.copy[code];
    if (!copy || !copy.note || !copy.doneTitle || !copy.doneBody) {
      errors.push("copy." + code + " needs note, doneTitle, and doneBody");
    }
  });
  if (meta.ready !== true && meta.ready !== false) errors.push("ready must be true or false");

  var lines = fs.readFileSync(mdPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/);
  var section = null;
  var chapter = null;
  var sections = [];
  var pages = [];
  var seenFiles = {};
  var seenHash = {};

  function currentChapter() {
    if (!section || !chapter) {
      errors.push("a page appears before its ## section and ### chapter");
      return null;
    }
    return chapter;
  }

  var i = 0;
  while (i < lines.length) {
    var line = lines[i];
    var h2 = /^##\s+(.+)$/.exec(line);
    var h3 = /^###\s+(.+)$/.exec(line);
    var h4 = /^####\s+(\d+)\.\s+(.+)$/.exec(line);
    if (h2 && !/^###/.test(line)) {
      var hindi = "";
      var j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j += 1;
      if (j < lines.length && hasDevanagari(lines[j]) && !/^#/.test(lines[j])) {
        hindi = lines[j].trim();
        i = j;
      } else errors.push("section '" + h2[1].trim() + "' needs a Hindi name on the next line");
      section = { en: h2[1].trim(), hi: hindi, chapters: [] };
      sections.push(section);
      chapter = null;
      i += 1;
      continue;
    }
    if (h3) {
      if (!section) errors.push("chapter '" + h3[1].trim() + "' is outside a ## section");
      var chi = "";
      var k = i + 1;
      while (k < lines.length && lines[k].trim() === "") k += 1;
      if (k < lines.length && hasDevanagari(lines[k]) && !/^#/.test(lines[k])) {
        chi = lines[k].trim();
        i = k;
      } else errors.push("chapter '" + h3[1].trim() + "' needs a Hindi name on the next line");
      chapter = { en: h3[1].trim(), hi: chi, pages: [] };
      if (section) section.chapters.push(chapter);
      i += 1;
      continue;
    }
    if (h4) {
      var start = i + 1;
      var end = start;
      while (end < lines.length && !/^#{2,4}\s/.test(lines[end])) end += 1;
      var where = "page " + h4[1];
      var ch = currentChapter();
      var paras = paragraphs(lines.slice(start, end));
      if (!paras.length || !hasDevanagari(paras[0])) errors.push(where + ": Hindi title must be the first line under the English title");
      var hiTitle = paras.length ? paras.shift() : "";
      if (!paras.length || !/^Picture:\s*`([^`]+)`\s*$/.test(paras[0])) {
        errors.push(where + ": the next line must be Picture: `name.jpg`");
      }
      var file = "";
      if (paras.length && /^Picture:/.test(paras[0])) {
        var pic = /^Picture:\s*`([^`]+)`\s*$/.exec(paras.shift());
        file = pic ? pic[1] : "";
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/.test(file)) {
          errors.push(where + ": picture file must be lowercase-and-hyphens .jpg, not a path");
        }
      }
      var groups = takeLang(paras, errors, where);
      if (groups.en.length < 3 || groups.en.length > 4) {
        errors.push(where + ": English needs 3 or 4 paragraphs after the title (opening, one or two body paragraphs, closing line). Got " + groups.en.length);
      }
      if (groups.hi.length !== groups.en.length) {
        errors.push(where + ": Hindi paragraph count (" + groups.hi.length + ") must match English (" + groups.en.length + ")");
      }
      OPTIONAL.forEach(function (code) {
        if (!groups[code]) return;
        if (groups[code].length !== groups.en.length + 1) {
          errors.push(where + ": " + code + " needs a title plus the same paragraphs as English");
        }
      });
      if (file) {
        if (seenFiles[file]) errors.push(where + ": " + file + " is already used. One picture, one page");
        seenFiles[file] = where;
        var imgPath = path.join(dir, "images", file);
        if (!fs.existsSync(imgPath)) errors.push(where + ": missing images/" + file);
        else {
          var buf = fs.readFileSync(imgPath);
          var size = jpegSize(buf);
          var hash = require("crypto").createHash("sha256").update(buf).digest("hex");
          if (!size) errors.push(where + ": " + file + " is not a JPEG");
          else if (size.width !== 864 || size.height !== 1152) {
            errors.push(where + ": " + file + " is " + size.width + "x" + size.height + ". It must be 864x1152, the whole figure inside the frame");
          }
          if (seenHash[hash]) errors.push(where + ": " + file + " is the same picture as " + seenHash[hash]);
          seenHash[hash] = file;
        }
      }
      var enLines = [h4[2].trim()].concat(groups.en);
      var hiLines = [hiTitle].concat(groups.hi);
      var more = null;
      OPTIONAL.forEach(function (code) {
        if (!groups[code]) return;
        more = more || {};
        more[code] = groups[code];
      });
      var page = {
        n: Number(h4[1]),
        file: file,
        chapterEn: ch ? ch.en : "",
        enLines: enLines,
        hiLines: hiLines,
        more: more
      };
      pages.push(page);
      if (ch) ch.pages.push(page);
      i = end;
      continue;
    }
    i += 1;
  }

  pages.forEach(function (page, idx) {
    if (page.n !== idx + 1) errors.push("page numbers must run 1, 2, 3 in story order. Found " + page.n + " where " + (idx + 1) + " belongs");
  });
  if (!pages.length) errors.push("book.md has no pages");

  if (errors.length || !id) return { errors: errors, book: null, meta: meta };

  var chapters = [];
  var books = {};
  var kandas = {};
  var used = {};
  sections.forEach(function (sec) {
    kandas[sec.en] = { en: sec.en, hi: sec.hi };
    var extra = meta.kandas && meta.kandas[sec.en];
    if (extra) {
      OPTIONAL.forEach(function (code) {
        if (extra[code]) kandas[sec.en][code] = extra[code];
      });
    }
    sec.chapters.forEach(function (ch, n) {
      if (!ch.pages.length) return;
      var cid = slug(ch.en);
      if (used[cid]) cid = cid + "-" + (n + 1);
      used[cid] = true;
      var tone = PALETTE[chapters.length % PALETTE.length];
      chapters.push({
        id: cid,
        en: ch.en,
        hi: ch.hi,
        short: ch.en.split(/\s+/)[0].slice(0, 16),
        shortHi: ch.hi.split(/\s+/)[0].slice(0, 16),
        mid: tone.mid,
        deep: tone.deep,
        sky: tone.sky,
        sky2: tone.sky2,
        ox: 80,
        oy: 140
      });
      books[cid] = [sec.en, sec.hi];
      ch.cid = cid;
    });
  });

  var builtPages = [];
  sections.forEach(function (sec) {
    sec.chapters.forEach(function (ch) {
      ch.pages.forEach(function (page) {
        var text = { en: splitText(page.enLines), hi: splitText(page.hiLines) };
        if (page.more) {
          Object.keys(page.more).forEach(function (code) {
            text[code] = splitText(page.more[code]);
          });
        }
        builtPages.push({
          id: id + "-" + page.n,
          image: id + "/" + page.file,
          chapter: ch.cid,
          text: text,
          en: text.en,
          hi: text.hi
        });
      });
    });
  });

  var titles = {};
  var mark = {};
  LANGS.forEach(function (code) {
    if (meta.titles[code]) titles[code] = meta.titles[code];
    if (meta.mark && meta.mark[code]) mark[code] = meta.mark[code];
  });
  if (!mark.en) mark.en = meta.titles.hi || meta.titles.en;
  if (!mark.hi) mark.hi = meta.titles.hi || mark.en;

  return {
    errors: [],
    meta: meta,
    book: {
      id: id,
      ready: meta.ready === true,
      pages: builtPages,
      chapters: chapters,
      books: books,
      kandas: kandas,
      titles: titles,
      mark: mark,
      copy: meta.copy
    }
  };
}

module.exports = {
  compileStory: compileStory,
  jpegSize: jpegSize,
  splitText: splitText
};
