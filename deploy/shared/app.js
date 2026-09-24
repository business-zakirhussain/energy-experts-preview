/* ============================================================
   Shared behaviour for every design.
   Each design supplies markup with the ids/classes below;
   anything missing is simply skipped.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var on = function (el, ev, fn) { if (el) el.addEventListener(ev, fn); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lockScroll = function (yes) { document.body.style.overflow = yes ? "hidden" : ""; };

  /* ---------- theme ---------- */
  var savedTheme = store.get("ee-theme");
  var forced = root.getAttribute("data-force-theme");        /* a design may pin one theme */
  root.setAttribute("data-theme", forced || savedTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  on($("#theme"), "click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    if (consent.store !== false) store.set("ee-theme", next);
  });

  /* ---------- language ---------- */
  var L = store.get("ee-lang") || "en";
  if (!T[L]) L = "en";

  /* CMS content may be only partly translated -- fall back to English
     rather than rendering "undefined" or throwing on a missing locale. */
  function tr(o) {
    if (!o) return "";
    var v = o[L];
    if (v === undefined || v === null || v === "") v = o.en;
    return (v === undefined || v === null) ? "" : v;
  }
  function trList(o) {
    var v = o && (o[L] && o[L].length ? o[L] : o.en);
    return Array.isArray(v) ? v : [];
  }
  window.EE = { onLang: [], get lang() { return L; }, openProject: function (i) { openProject(i); } };
  var nodes = $$("[data-i18n]");
  function setLang(code) {
    L = code;
    root.lang = code;
    if (consent.store !== false) store.set("ee-lang", code);
    nodes.forEach(function (n) {
      var v = T[code][n.dataset.i18n];
      if (v !== undefined) n.innerHTML = v;
    });
    $$(".lang button, [data-lang]").forEach(function (b) {
      if (b.dataset.lang) b.setAttribute("aria-pressed", String(b.dataset.lang === code));
    });
    renderProjects();
    renderNews();
    window.EE.onLang.forEach(function (fn) { fn(code); });
  }
  $$("[data-lang]").forEach(function (b) {
    on(b, "click", function () { setLang(b.dataset.lang); closeDrawer(); });
  });

  /* ---------- projects: template-driven so each design lays them out differently ---------- */
  var list = $("#prjList"), tpl = $("#prjTpl");
  function fill(rootEl, p) {
    $$("[data-f]", rootEl).forEach(function (el) {
      var f = el.dataset.f, v;
      switch (f) {
        case "name": v = p.name; break;
        case "cap":  v = p.cap;  break;
        case "year": v = p.year; break;
        case "dur":  v = p.dur;  break;
        case "loc":  v = tr(p.loc); break;
        case "tag":  v = tr(p.tag); break;
        case "scope":v = tr(p.scope); break;
        case "desc": v = tr(p.desc); break;
        case "idx":  v = String(p._i + 1).padStart(2, "0"); break;
        case "img":
          if (el.tagName === "IMG") { el.src = p.img || ""; el.alt = p.name; }
          else el.style.backgroundImage = p.img ? "url(" + p.img + ")" : "";
          return;
        default: return;
      }
      el.textContent = v;
    });
  }
  function renderProjects() {
    if (!list || !tpl) return;
    list.innerHTML = "";
    PROJECTS.forEach(function (p, i) {
      p._i = i;
      var node = tpl.content.firstElementChild.cloneNode(true);
      fill(node, p);
      on(node, "click", function () { openProject(i); });
      node.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(i); }
      });
      if (!node.hasAttribute("tabindex") && node.tagName !== "BUTTON") node.tabIndex = 0;
      list.appendChild(node);
      if (io) $$(".rv", node).concat(node.classList.contains("rv") ? [node] : []).forEach(function (n) { io.observe(n); });
    });
  }

  /* ---------- news: the second editable collection ---------- */
  var newsList = $("#newsList"), newsTpl = $("#newsTpl");
  var MONTHS = { en: "January February March April May June July August September October November December",
                 fr: "janvier février mars avril mai juin juillet août septembre octobre novembre décembre",
                 nl: "januari februari maart april mei juni juli augustus september oktober november december" };
  function longDate(iso, code) {
    var p = iso.split("-"), m = MONTHS[code].split(" ")[+p[1] - 1];
    return code === "en" ? m + " " + (+p[2]) + ", " + p[0] : (+p[2]) + " " + m + " " + p[0];
  }
  function renderNews() {
    if (!newsList || !newsTpl || typeof NEWS === "undefined") return;
    newsList.innerHTML = "";
    NEWS.forEach(function (n) {
      var node = newsTpl.content.firstElementChild.cloneNode(true);
      $$("[data-n]", node).forEach(function (el) {
        var f = el.dataset.n;
        if (f === "img") { el.style.backgroundImage = n.img ? "url(" + n.img + ")" : ""; return; }
        if (f === "meta") { el.textContent = tr(n.cat) + " · " + n.read + " min"; return; }
        if (f === "date") { el.textContent = longDate(n.date, L); el.setAttribute("datetime", n.date); return; }
        if (f === "title") { el.textContent = tr(n.title); return; }
        if (f === "excerpt") { el.textContent = tr(n.excerpt); return; }
      });
      newsList.appendChild(node);
      if (io) { io.observe(node); }
    });
  }

  var modal = $("#modal"), lastFocus = null;
  function openProject(i) {
    if (!modal) return;
    var p = PROJECTS[i];
    var set = function (id, v) { var el = $(id); if (el) el.textContent = v; };
    set("#mTag", tr(p.tag)); set("#mName", p.name); set("#mLoc", tr(p.loc));
    set("#mCap", p.cap);    set("#mYear", p.year); set("#mDur", p.dur);
    set("#mDesc", tr(p.desc));
    var img = $("#mImg"); if (img) img.style.backgroundImage = p.img ? "url(" + p.img + ")" : "";
    var ul = $("#mList");
    if (ul) { ul.innerHTML = ""; trList(p.list).forEach(function (t) {
      var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); }); }
    lastFocus = document.activeElement;
    modal.classList.add("open"); lockScroll(true);
    var x = $('[data-close="modal"]', modal); if (x) x.focus();
  }
  function closeModal() {
    if (!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open"); lockScroll(false);
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-close="modal"]').forEach(function (n) { on(n, "click", closeModal); });

  /* ---------- hamburger drawer ---------- */
  var burger = $("#burger"), drawer = $("#drawer");
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    lockScroll(false);
  }
  on(burger, "click", function () {
    var open = drawer.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    lockScroll(open);
  });
  $$("#drawer a").forEach(function (a) { on(a, "click", closeDrawer); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); closeDrawer(); closePrefs(); }
  });

  /* ---------- cookie consent ---------- */
  var banner = $("#cookie"), prefs = $("#prefs");
  var consent = { store: false, stats: false };
  try { consent = JSON.parse(store.get("ee-consent")) || consent; } catch (e) {}
  var decided = store.get("ee-consent") !== null;
  function syncToggles() {
    var m = $("#cMap"), s = $("#cStats");
    if (m) m.checked = !!consent.store;
    if (s) s.checked = !!consent.stats;
  }
  function applyConsent() { syncToggles(); }
  function forget() { store.del("ee-theme"); store.del("ee-lang"); }
  function saveConsent(c) {
    consent = c; store.set("ee-consent", JSON.stringify(c));
    if (banner) banner.classList.remove("show");
    closePrefs(); applyConsent();
  }
  function openPrefs() { if (!prefs) return; syncToggles(); prefs.classList.add("open"); lockScroll(true); }
  function closePrefs() { if (!prefs || !prefs.classList.contains("open")) return; prefs.classList.remove("open"); lockScroll(false); }
  on($("#ckAll"),  "click", function () { saveConsent({ store: true,  stats: true  }); });
  on($("#ckNone"), "click", function () { saveConsent({ store: false, stats: false }); forget(); });
  on($("#ckCust"), "click", openPrefs);
  on($("#ckOpen"), "click", function (e) { e.preventDefault(); openPrefs(); });
  on($("#pfAll"),  "click", function () { saveConsent({ store: true,  stats: true  }); });
  on($("#pfSave"), "click", function () {
    var m = $("#cMap"), s = $("#cStats");
    var c = { store: !!(m && m.checked), stats: !!(s && s.checked) };
    saveConsent(c); if (!c.store) forget();
  });
  $$('[data-close="prefs"]').forEach(function (n) { on(n, "click", closePrefs); });
  if (banner && !decided) setTimeout(function () { banner.classList.add("show"); }, 900);

  /* The map is a bundled image now, so there is nothing to gate and no
     third-party request anywhere on the page. Consent governs one thing:
     whether we may remember the visitor's language and theme. */
  /* ---------- header state, progress, active nav ---------- */
  var hdr = $("#hdr"), prog = $("#prog");
  var links = $$("nav.main a[href^='#']");
  var secs = links.map(function (a) { return $(a.getAttribute("href")); });
  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle("stuck", y > 12);
    if (prog) { var h = document.body.scrollHeight - window.innerHeight; prog.style.width = (h > 0 ? y / h * 100 : 0) + "%"; }
    var active = -1;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= 150) active = i; });
    links.forEach(function (a, i) { a.classList.toggle("on", i === active); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- reveals, drawn line, counters ---------- */
  var io = null;
  if ("IntersectionObserver" in window && !reduced) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    $$(".rv").forEach(function (n) { io.observe(n); });
    /* Deep links (site.html#contact) jump past sections before the observer
       reports, which left every reveal stuck at opacity 0. Reveal anything
       already at or above the fold now, and hard-reveal the rest shortly
       after so content can never stay invisible. */
    function catchUp() {
      $$(".rv:not(.in)").forEach(function (n) {
        if (n.getBoundingClientRect().top < innerHeight * 0.92) { n.classList.add("in"); io.unobserve(n); }
      });
    }
    catchUp();
    addEventListener("load", catchUp);
    addEventListener("hashchange", function () { setTimeout(catchUp, 60); });
    setTimeout(function () { $$(".rv:not(.in)").forEach(function (n) { io.unobserve(n); n.classList.add("in"); }); }, 2500);
    var steps = $("#steps");
    if (steps) { var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { steps.classList.add("drawn"); sio.disconnect(); } });
    }, { threshold: 0.3 }); sio.observe(steps); }
    var stats = $("#stats");
    if (stats) { var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { $$(".v[data-count]", stats).forEach(countUp); cio.disconnect(); } });
    }, { threshold: 0.4 }); cio.observe(stats); }
  } else {
    $$(".rv").forEach(function (n) { n.classList.add("in"); });
    if ($("#steps")) $("#steps").classList.add("drawn");
  }
  function countUp(el) {
    var target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "";
    var dec = el.dataset.count.indexOf(".") > -1 ? 1 : 0, start = null, dur = 1100;
    (function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.innerHTML = (target * eased).toFixed(dec) + (suffix ? '<span class="u">' + suffix + "</span>" : "");
      if (p < 1) requestAnimationFrame(frame);
    })(performance.now());
  }

  /* ---------- enquiry form ---------- */
  var form = $("#enq"), note = $("#fnote");
  on(form, "submit", function (e) {
    e.preventDefault();
    var hp = form.querySelector('[name="website"]'); if (hp && hp.value) return;
    var err = "", v = function (id) { var el = $(id); return el ? el.value.trim() : ""; };
    if (!v("#fn")) err = T[L].errName;
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("#fe"))) err = T[L].errMail;
    else if (!v("#fm")) err = T[L].errMsg;
    else { var c = form.querySelector(".consent input"); if (c && !c.checked) err = T[L].errConsent; }
    if (!note) return;
    if (err) { note.textContent = err; note.classList.remove("ok"); return; }
    note.textContent = T[L].sent; note.classList.add("ok"); form.reset();
  });

  /* ---------- design switcher (demo only) ---------- */
  var d = document.body.dataset.design;
  if (d) {
    var n = parseInt(d, 10), total = 4;
    var sw = document.createElement("div");
    sw.className = "dsw";
    sw.innerHTML =
      '<a href="index.html" title="All designs">&#8942;</a>' +
      '<a href="design-' + (n === 1 ? total : n - 1) + '.html" aria-label="Previous design">&#8249;</a>' +
      '<span>' + (T[L].designLabel || "Design") + ' ' + n + ' / ' + total + '</span>' +
      '<a href="design-' + (n === total ? 1 : n + 1) + '.html" aria-label="Next design">&#8250;</a>';
    document.body.appendChild(sw);
  }

  /* ---------- go ---------- */
  setLang(L);
  applyConsent();
  onScroll();
})();
