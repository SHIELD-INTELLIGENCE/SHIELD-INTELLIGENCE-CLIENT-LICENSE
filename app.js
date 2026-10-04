/* SHIELD CLIENT LICENSE v1.0 — TOC, search, theme, anchors, downloads */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var themeBtn = document.getElementById("theme-toggle");
  var STORAGE_KEY = "shield-license-theme";
  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch (e) {}
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }
  var initial = getStored();
  setTheme(initial === "dark" || initial === "light" ? initial : "light");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ---------- Toast ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1800);
  }

  /* ---------- TOC: mobile toggle + active highlighting ---------- */
  var aside = document.getElementById("toc-aside");
  var toggle = document.getElementById("toc-toggle");
  function isMobile() { return window.matchMedia("(max-width: 900px)").matches; }
  if (aside && toggle) {
    // Default: collapsed on mobile, expanded on desktop
    function syncToc() {
      if (isMobile()) { aside.classList.add("collapsed"); toggle.setAttribute("aria-expanded", "false"); }
      else { aside.classList.remove("collapsed"); toggle.setAttribute("aria-expanded", "true"); }
    }
    syncToc();
    window.addEventListener("resize", syncToc);
    toggle.addEventListener("click", function () {
      var collapsed = aside.classList.toggle("collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
    });
    // Close TOC after navigating on mobile
    aside.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && isMobile()) { aside.classList.add("collapsed"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll("#toc-list a"));
  var sections = tocLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  // Smooth scroll with reduced-motion respect
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  tocLinks.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      history.replaceState(null, "", a.getAttribute("href"));
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      // Move focus for keyboard users without scrolling again
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  // Active section highlighting
  if ("IntersectionObserver" in window && sections.length) {
    var linkById = {};
    tocLinks.forEach(function (a) { linkById[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove("active"); a.removeAttribute("aria-current"); });
          var link = linkById[en.target.id];
          if (link) { link.classList.add("active"); link.setAttribute("aria-current", "true"); }
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Section anchors: copy link ---------- */
  document.querySelectorAll(".anchor").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-anchor");
      var url = location.href.split("#")[0] + "#" + id;
      // Also update the hash so the stable anchor is visible
      history.replaceState(null, "", "#" + id);
      function done() { showToast("Link copied: #" + id); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); done(); });
      } else { fallbackCopy(url); done(); }
    });
  });
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- Search ---------- */
  var input = document.getElementById("search");
  var count = document.getElementById("search-count");
  var prevBtn = document.getElementById("search-prev");
  var nextBtn = document.getElementById("search-next");
  var body = document.getElementById("license-body");
  var matches = [];
  var current = -1;

  function clearMarks() {
    body.querySelectorAll("mark").forEach(function (m) {
      var parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
    matches = [];
    current = -1;
    if (count) count.textContent = "";
  }

  function doSearch(q) {
    clearMarks();
    q = (q || "").trim();
    if (!q || q.length < 2) return;
    var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.toLowerCase().includes(q.toLowerCase())) return NodeFilter.FILTER_REJECT;
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || p.closest(".anchor")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var lower = q.toLowerCase();
    nodes.forEach(function (textNode) {
      var frag = document.createDocumentFragment();
      var text = textNode.nodeValue;
      var idx = 0;
      var pos = text.toLowerCase().indexOf(lower);
      while (pos !== -1) {
        frag.appendChild(document.createTextNode(text.slice(idx, pos)));
        var mark = document.createElement("mark");
        mark.textContent = text.substr(pos, q.length);
        frag.appendChild(mark);
        matches.push(mark);
        idx = pos + q.length;
        pos = text.toLowerCase().indexOf(lower, idx);
      }
      frag.appendChild(document.createTextNode(text.slice(idx)));
      textNode.parentNode.replaceChild(frag, textNode);
    });
    if (matches.length) {
      current = 0;
      updateCurrent();
    } else if (count) {
      count.textContent = "0 / 0";
    }
  }

  function updateCurrent() {
    matches.forEach(function (m) { m.classList.remove("current"); });
    if (current >= 0 && matches[current]) {
      matches[current].classList.add("current");
      matches[current].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
    if (count) count.textContent = matches.length ? (current + 1) + " / " + matches.length : "0 / 0";
  }
  function step(d) {
    if (!matches.length) return;
    current = (current + d + matches.length) % matches.length;
    updateCurrent();
  }

  var debounce = null;
  if (input) {
    input.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () { doSearch(input.value); }, 160);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; clearMarks(); input.blur(); }
      else if (e.key === "Enter") { e.preventDefault(); step(e.shiftKey ? -1 : 1); }
    });
  }
  if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault(); input.focus();
    }
  });

  /* ---------- PDF download (offline): print stylesheet -> Save as PDF ---------- */
  var pdfBtn = document.getElementById("pdf-btn");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", function () {
      showToast("Use “Save as PDF” in the print dialog");
      setTimeout(function () { window.print(); }, 350);
    });
  }

  /* ---------- Deep link on load ---------- */
  if (location.hash) {
    var t = document.querySelector(location.hash);
    if (t) setTimeout(function () { t.scrollIntoView({ block: "start" }); }, 60);
  }
})();
