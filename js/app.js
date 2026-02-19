(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────
  var currentPageId = null;
  var currentHotspots = [];

  // ── DOM refs ───────────────────────────────────────────────────
  var shell        = document.getElementById('shell');
  var canvas       = document.getElementById('ascii-canvas');
  var canvasWrap   = document.getElementById('canvas-wrap');
  var pageList     = document.getElementById('page-list');
  var panelTitle   = document.getElementById('panel-title');
  var panelBody    = document.getElementById('panel-body');
  var panelYaml    = document.getElementById('panel-yaml');
  var panelRelated = document.getElementById('panel-related');
  var panelClose   = document.getElementById('panel-close');
  var sidebarToggle = document.getElementById('sidebar-toggle');
  var pageNav      = document.getElementById('page-nav');

  // ── Sidebar toggle ────────────────────────────────────────────
  function toggleSidebar() {
    shell.classList.toggle('sidebar-open');
  }

  function closeSidebar() {
    shell.classList.remove('sidebar-open');
  }

  // ── Page nav (prev / next) ────────────────────────────────────
  function buildPageNav(pageId) {
    var curIdx = -1;
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].id === pageId) { curIdx = i; break; }
    }
    if (curIdx < 0) { pageNav.innerHTML = ''; return; }

    var prev = curIdx > 0 ? PAGES[curIdx - 1] : null;
    var next = curIdx < PAGES.length - 1 ? PAGES[curIdx + 1] : null;
    var html = '';

    if (prev) {
      html += '<a href="#page-' + prev.id + '" class="page-nav-prev">' +
        escapeHtml(prev.title) + '</a>';
    } else {
      html += '<span></span>';
    }

    if (next) {
      html += '<a href="#page-' + next.id + '" class="page-nav-next">' +
        escapeHtml(next.title) + '</a>';
    } else {
      html += '<span></span>';
    }

    pageNav.innerHTML = html;
  }

  // ── Utilities ──────────────────────────────────────────────────

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Sidebar ────────────────────────────────────────────────────

  function buildSidebar() {
    pageList.innerHTML = '';
    var lastSection = null;
    for (var i = 0; i < PAGES.length; i++) {
      var page = PAGES[i];
      if (page.section && page.section !== lastSection) {
        var divLi = document.createElement('li');
        divLi.className = 'section-divider';
        divLi.textContent = page.section;
        pageList.appendChild(divLi);
        lastSection = page.section;
      }
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#page-' + page.id;
      a.textContent = page.title;
      a.setAttribute('data-page-id', page.id);
      li.appendChild(a);
      pageList.appendChild(li);
    }
  }

  function updateSidebarActive(pageId) {
    var links = pageList.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.getAttribute('data-page-id') === pageId) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    }
  }

  // ── Hotspot injection ──────────────────────────────────────────

  /**
   * Build HTML for one line, injecting <span> wrappers for any
   * hotspots that intersect this line index.
   */
  function buildLineHtml(rawLine, lineIndex, hotspots) {
    // Collect spans that touch this line
    var spans = [];
    for (var h = 0; h < hotspots.length; h++) {
      var hs = hotspots[h];
      if (lineIndex >= hs.startLine && lineIndex <= hs.endLine) {
        var start = hs.startCol;
        var end = Math.min(hs.endCol, rawLine.length);
        if (start < rawLine.length && end > start) {
          spans.push({ id: hs.id, start: start, end: end });
        }
      }
    }

    if (spans.length === 0) {
      return escapeHtml(rawLine);
    }

    // Sort by start column
    spans.sort(function (a, b) { return a.start - b.start; });

    // Resolve overlaps — later spans truncated at earlier span boundaries
    for (var i = 1; i < spans.length; i++) {
      if (spans[i].start < spans[i - 1].end) {
        spans[i].start = spans[i - 1].end;
      }
      if (spans[i].start >= spans[i].end) {
        spans.splice(i, 1);
        i--;
      }
    }

    var result = '';
    var pos = 0;

    for (var s = 0; s < spans.length; s++) {
      var sp = spans[s];
      // Text before span
      if (sp.start > pos) {
        result += escapeHtml(rawLine.slice(pos, sp.start));
      }
      // The hotspot span
      var text = rawLine.slice(sp.start, sp.end);
      result += '<span class="hotspot" data-id="' + sp.id + '" tabindex="0">' +
        escapeHtml(text) + '</span>';
      pos = sp.end;
    }

    // Remaining text after all spans
    if (pos < rawLine.length) {
      result += escapeHtml(rawLine.slice(pos));
    }

    return result;
  }

  // ── Page renderer ──────────────────────────────────────────────

  var pageCache = {};

  async function loadPage(pageId) {
    var page = null;
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].id === pageId) { page = PAGES[i]; break; }
    }
    if (!page) return;

    // Close panel
    closePanel();

    currentPageId = pageId;
    currentHotspots = page.hotspots || [];
    updateSidebarActive(pageId);
    closeSidebar();

    // Scroll sidebar to active item
    var activeLink = pageList.querySelector('a.active');
    if (activeLink) {
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    try {
      var text;
      if (pageCache[page.file]) {
        text = pageCache[page.file];
      } else {
        var resp = await fetch(page.file);
        if (!resp.ok) {
          canvas.innerHTML = '';
          canvas.textContent =
            '\n  Page not available: ' + page.title + '\n\n' +
            '  This infographic has not been created yet.\n' +
            '  Check back soon!\n';
          return;
        }
        text = (await resp.text()).replace(/\r/g, '');
        pageCache[page.file] = text;
      }

      // Strip ``` fences
      var lines = text.split('\n');
      if (lines.length > 0 && lines[0].trim().startsWith('```')) {
        lines.shift();
      }
      if (lines.length > 0 && lines[lines.length - 1].trim().startsWith('```')) {
        lines.pop();
      }
      // Also remove trailing empty line if present
      if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
      }

      // Build HTML with hotspot injection
      var htmlLines = new Array(lines.length);
      for (var j = 0; j < lines.length; j++) {
        htmlLines[j] = buildLineHtml(lines[j], j, currentHotspots);
      }

      // Page transition
      canvas.classList.remove('entering');
      /* jshint -W030 */ canvas.offsetWidth; /* jshint +W030 */ // force reflow
      canvas.classList.add('entering');

      canvas.innerHTML = htmlLines.join('\n');

      // Scroll to top
      canvasWrap.scrollTop = 0;

      // Attach click/key handlers to hotspot spans
      attachHotspotHandlers();

      // Build prev/next nav
      buildPageNav(pageId);

    } catch (err) {
      canvas.innerHTML = '';
      canvas.textContent = '\n  Error loading page: ' + err.message;
    }
  }

  function attachHotspotHandlers() {
    var els = canvas.querySelectorAll('.hotspot');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        el.addEventListener('click', function () {
          activateHotspot(el.getAttribute('data-id'));
        });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateHotspot(el.getAttribute('data-id'));
          }
        });
      })(els[i]);
    }
  }

  // ── Panel ──────────────────────────────────────────────────────

  function activateHotspot(hotspotId) {
    var hotspot = null;
    for (var i = 0; i < currentHotspots.length; i++) {
      if (currentHotspots[i].id === hotspotId) {
        hotspot = currentHotspots[i];
        break;
      }
    }
    if (!hotspot || !hotspot.panel) return;
    dismissHint();

    // Clear previous active
    var prev = canvas.querySelectorAll('.hotspot.active');
    for (var p = 0; p < prev.length; p++) prev[p].classList.remove('active');

    // Mark new active
    var spans = canvas.querySelectorAll('.hotspot[data-id="' + hotspotId + '"]');
    for (var s = 0; s < spans.length; s++) spans[s].classList.add('active');

    // Scroll first active span into view
    if (spans.length > 0) {
      spans[0].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Populate panel
    var cfg = hotspot.panel;
    panelTitle.textContent = cfg.title;
    panelBody.innerHTML = cfg.body || '';

    // YAML example
    if (cfg.yaml) {
      panelYaml.innerHTML =
        '<span class="yaml-label">Example</span>' +
        '<pre>' + escapeHtml(cfg.yaml) + '</pre>';
    } else {
      panelYaml.innerHTML = '';
    }

    // Related links
    if (cfg.related && cfg.related.length > 0) {
      var html = '<div class="related-label">Related</div>';
      for (var r = 0; r < cfg.related.length; r++) {
        var rel = cfg.related[r];
        html += '<a href="#page-' + rel.page + '"' +
          ' data-page="' + rel.page + '"' +
          ' data-hotspot="' + (rel.hotspot || '') + '">' +
          escapeHtml(rel.label) + '</a>';
      }
      panelRelated.innerHTML = html;

      // Related link click handlers
      var relLinks = panelRelated.querySelectorAll('a');
      for (var rl = 0; rl < relLinks.length; rl++) {
        (function (link) {
          link.addEventListener('click', function (e) {
            e.preventDefault();
            var targetPage = link.getAttribute('data-page');
            var targetHotspot = link.getAttribute('data-hotspot');
            if (targetPage !== currentPageId) {
              window.location.hash = 'page-' + targetPage;
              if (targetHotspot) {
                setTimeout(function () { activateHotspot(targetHotspot); }, 450);
              }
            } else if (targetHotspot) {
              activateHotspot(targetHotspot);
            }
          });
        })(relLinks[rl]);
      }
    } else {
      panelRelated.innerHTML = '';
    }

    // Open panel
    shell.classList.add('panel-open');
    sidebarToggle.style.display = 'none';
  }

  function closePanel() {
    shell.classList.remove('panel-open');
    sidebarToggle.style.display = '';
    var active = canvas.querySelectorAll('.hotspot.active');
    for (var i = 0; i < active.length; i++) active[i].classList.remove('active');
  }

  // ── Keyboard ───────────────────────────────────────────────────

  function handleKeyboard(e) {
    // ESC — close panel
    if (e.key === 'Escape') {
      if (shell.classList.contains('panel-open')) {
        closePanel();
        e.preventDefault();
      }
      return;
    }

    // Arrow keys — page navigation (when panel closed & no hotspot focused)
    if (!shell.classList.contains('panel-open')) {
      var focused = document.activeElement;
      if (focused && focused.classList && focused.classList.contains('hotspot')) return;

      var curIdx = -1;
      for (var i = 0; i < PAGES.length; i++) {
        if (PAGES[i].id === currentPageId) { curIdx = i; break; }
      }
      if (curIdx < 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        var next = Math.min(curIdx + 1, PAGES.length - 1);
        window.location.hash = 'page-' + PAGES[next].id;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var prev = Math.max(curIdx - 1, 0);
        window.location.hash = 'page-' + PAGES[prev].id;
      }
    }
  }

  // ── Router ─────────────────────────────────────────────────────

  function getPageIdFromHash() {
    var hash = window.location.hash;
    var match = hash.match(/^#page-([\w]+)$/);
    return match ? match[1] : '01';
  }

  function onHashChange() {
    var pageId = getPageIdFromHash();
    if (pageId !== currentPageId) {
      loadPage(pageId);
    }
  }

  // ── Sidebar resize ────────────────────────────────────────────

  var sidebarResize = document.getElementById('sidebar-resize');

  function initSidebarResize() {
    var dragging = false;

    sidebarResize.addEventListener('mousedown', function (e) {
      e.preventDefault();
      dragging = true;
      shell.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var newWidth = Math.max(120, Math.min(e.clientX, 500));
      document.documentElement.style.setProperty('--sidebar-w', newWidth + 'px');
    });

    document.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      shell.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }

  // ── First-visit hint ──────────────────────────────────────────

  var hotspotHint = document.getElementById('hotspot-hint');
  var hintShown = false;

  function showHintIfFirstVisit() {
    if (localStorage.getItem('dime-hint-seen')) return;
    // Delay so the page-enter animation plays first
    setTimeout(function () {
      hotspotHint.classList.add('visible');
      hintShown = true;
    }, 1600);
  }

  function dismissHint() {
    if (!hintShown) return;
    hotspotHint.classList.remove('visible');
    hintShown = false;
    localStorage.setItem('dime-hint-seen', '1');
  }

  // ── Theme switcher ────────────────────────────────────────────

  function initThemeDots() {
    var dots = document.querySelectorAll('#theme-dots .dot');
    var saved = localStorage.getItem('dime-theme') || 'amber';
    applyTheme(saved);

    for (var i = 0; i < dots.length; i++) {
      (function (dot) {
        dot.addEventListener('click', function () {
          applyTheme(dot.getAttribute('data-theme'));
        });
      })(dots[i]);
    }
  }

  function applyTheme(name) {
    if (name === 'amber') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', name);
    }
    localStorage.setItem('dime-theme', name);

    var dots = document.querySelectorAll('#theme-dots .dot');
    for (var i = 0; i < dots.length; i++) {
      if (dots[i].getAttribute('data-theme') === name) {
        dots[i].classList.add('active');
      } else {
        dots[i].classList.remove('active');
      }
    }
  }

  // ── CRT Glitch ────────────────────────────────────────────────

  function scheduleGlitch() {
    var delay = 30000 + Math.random() * 60000; // 30-90s → max 2/min
    setTimeout(function () {
      canvas.classList.add('glitch');
      setTimeout(function () { canvas.classList.remove('glitch'); }, 200);
      scheduleGlitch();
    }, delay);
  }

  // ── Init ───────────────────────────────────────────────────────

  function init() {
    buildSidebar();
    initSidebarResize();
    initThemeDots();
    scheduleGlitch();
    showHintIfFirstVisit();
    panelClose.addEventListener('click', closePanel);
    sidebarToggle.addEventListener('click', toggleSidebar);
    document.addEventListener('keydown', handleKeyboard);
    window.addEventListener('hashchange', onHashChange);

    // Load initial page
    var initialPage = getPageIdFromHash();
    if (!window.location.hash) {
      window.location.hash = 'page-01';
    } else {
      loadPage(initialPage);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
