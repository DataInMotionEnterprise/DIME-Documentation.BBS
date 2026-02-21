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

    // Close panel (don't update hash — navigation already set it)
    closePanel(false);

    currentPageId = pageId;
    currentHotspots = page.hotspots || [];
    updateSidebarActive(pageId);
    markVisited(pageId);
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
        '<span class="yaml-label">Example <button class="copy-yaml-btn">Copy</button></span>' +
        '<pre>' + escapeHtml(cfg.yaml) + '</pre>';
      var yamlBtn = panelYaml.querySelector('.copy-yaml-btn');
      yamlBtn.addEventListener('click', function () {
        copyToClipboard(cfg.yaml, yamlBtn);
      });
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

    // Update URL with hotspot deep-link (replaceState avoids re-triggering hashchange)
    history.replaceState(null, '', '#page-' + currentPageId + ':' + hotspotId);
  }

  function closePanel(updateHash) {
    shell.classList.remove('panel-open');
    sidebarToggle.style.display = '';
    var active = canvas.querySelectorAll('.hotspot.active');
    for (var i = 0; i < active.length; i++) active[i].classList.remove('active');
    // Remove hotspot from URL (only when user-initiated, not during page nav)
    if (updateHash !== false && currentPageId) {
      history.replaceState(null, '', '#page-' + currentPageId);
    }
  }

  // ── Keyboard ───────────────────────────────────────────────────

  function handleKeyboard(e) {
    // Search is open — let it handle its own keys
    if (searchModal.classList.contains('open')) return;

    // Shortcut modal is open
    if (shortcutModal.classList.contains('open')) {
      if (e.key === 'Escape') { closeShortcuts(); e.preventDefault(); }
      return;
    }

    // Ctrl+K or / — open search
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) ||
        (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey &&
         document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault();
      openSearch();
      return;
    }

    // ? — open shortcut help
    if (e.key === '?' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      openShortcuts();
      return;
    }

    // Ctrl+= / Ctrl+- — font size
    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      changeFontSize(1);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      changeFontSize(-1);
      return;
    }

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

  function parseHash() {
    var hash = window.location.hash;
    var match = hash.match(/^#page-([\w]+)(?::([\w-]+))?$/);
    return match ? { pageId: match[1], hotspotId: match[2] || null } : { pageId: '01', hotspotId: null };
  }

  function onHashChange() {
    var parsed = parseHash();
    if (parsed.pageId !== currentPageId) {
      loadPage(parsed.pageId).then(function () {
        if (parsed.hotspotId) {
          setTimeout(function () { activateHotspot(parsed.hotspotId); }, 100);
        }
      });
    } else if (parsed.hotspotId) {
      activateHotspot(parsed.hotspotId);
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

  // ── Search ────────────────────────────────────────────────────

  var searchModal   = document.getElementById('search-modal');
  var searchInput   = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var searchIndex   = [];
  var selectedIdx   = -1;

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || '';
  }

  function buildSearchIndex() {
    searchIndex = [];
    for (var i = 0; i < PAGES.length; i++) {
      var page = PAGES[i];
      searchIndex.push({
        text: page.title,
        pageId: page.id,
        hotspotId: null,
        type: 'page'
      });
      if (page.hotspots) {
        for (var j = 0; j < page.hotspots.length; j++) {
          var hs = page.hotspots[j];
          if (hs.panel) {
            searchIndex.push({
              text: hs.panel.title,
              bodyText: stripHtml(hs.panel.body || ''),
              pageId: page.id,
              hotspotId: hs.id,
              type: 'topic',
              pageTitle: page.title
            });
          }
        }
      }
    }
  }

  function openSearch() {
    searchModal.classList.add('open');
    searchInput.value = '';
    searchResults.innerHTML = '';
    selectedIdx = -1;
    searchInput.focus();
  }

  function closeSearch() {
    searchModal.classList.remove('open');
  }

  function runSearch(query) {
    if (!query) { searchResults.innerHTML = ''; selectedIdx = -1; return; }

    var terms = query.toLowerCase().split(/\s+/);
    var matches = [];

    for (var i = 0; i < searchIndex.length; i++) {
      var entry = searchIndex[i];
      var haystack = (entry.text + ' ' + (entry.bodyText || '')).toLowerCase();
      var allMatch = true;
      for (var t = 0; t < terms.length; t++) {
        if (haystack.indexOf(terms[t]) < 0) { allMatch = false; break; }
      }
      if (allMatch) {
        matches.push(entry);
        if (matches.length >= 12) break;
      }
    }

    selectedIdx = matches.length > 0 ? 0 : -1;
    renderSearchResults(matches, terms);
  }

  function getBodySnippet(bodyText, terms) {
    if (!bodyText) return '';
    var lower = bodyText.toLowerCase();
    // Find the first term that appears in bodyText
    var pos = -1;
    for (var t = 0; t < terms.length; t++) {
      pos = lower.indexOf(terms[t]);
      if (pos >= 0) break;
    }
    if (pos < 0) return '';
    var radius = 40;
    var start = Math.max(0, pos - radius);
    var end = Math.min(bodyText.length, pos + radius);
    var snippet = (start > 0 ? '...' : '') +
      bodyText.slice(start, end).replace(/\s+/g, ' ') +
      (end < bodyText.length ? '...' : '');
    return snippet;
  }

  function renderSearchResults(matches, terms) {
    var html = '';
    for (var i = 0; i < matches.length; i++) {
      var m = matches[i];
      var cls = i === selectedIdx ? ' class="selected"' : '';
      var title = highlightTerms(escapeHtml(m.text), terms);
      var sub = m.type === 'topic'
        ? ' <span class="sr-page">in ' + escapeHtml(m.pageTitle) + '</span>'
        : '';

      // Show body snippet if match came from body text, not just title
      var snippetHtml = '';
      if (m.bodyText) {
        var titleLower = m.text.toLowerCase();
        var allInTitle = true;
        for (var t = 0; t < terms.length; t++) {
          if (titleLower.indexOf(terms[t]) < 0) { allInTitle = false; break; }
        }
        if (!allInTitle) {
          var raw = getBodySnippet(m.bodyText, terms);
          if (raw) {
            snippetHtml = '<span class="sr-snippet">' + highlightTerms(escapeHtml(raw), terms) + '</span>';
          }
        }
      }

      html += '<li' + cls + ' data-idx="' + i + '">' +
        '<span class="sr-title">' + title + '</span>' + sub +
        snippetHtml + '</li>';
    }
    searchResults.innerHTML = html;

    // Click handlers
    var items = searchResults.querySelectorAll('li');
    for (var j = 0; j < items.length; j++) {
      (function (li, idx) {
        li.addEventListener('click', function () {
          navigateToResult(matches[idx]);
        });
      })(items[j], j);
    }

    // Store matches for keyboard nav
    searchResults._matches = matches;
  }

  function highlightTerms(html, terms) {
    for (var t = 0; t < terms.length; t++) {
      var re = new RegExp('(' + terms[t].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      html = html.replace(re, '<span class="sr-match">$1</span>');
    }
    return html;
  }

  function navigateToResult(entry) {
    closeSearch();
    if (entry.pageId !== currentPageId) {
      window.location.hash = 'page-' + entry.pageId;
      if (entry.hotspotId) {
        setTimeout(function () { activateHotspot(entry.hotspotId); }, 450);
      }
    } else if (entry.hotspotId) {
      activateHotspot(entry.hotspotId);
    }
  }

  function handleSearchKeys(e) {
    var matches = searchResults._matches || [];
    if (e.key === 'Escape') {
      closeSearch();
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (matches.length > 0) {
        selectedIdx = Math.min(selectedIdx + 1, matches.length - 1);
        updateSelectedResult();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (matches.length > 0) {
        selectedIdx = Math.max(selectedIdx - 1, 0);
        updateSelectedResult();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx >= 0 && selectedIdx < matches.length) {
        navigateToResult(matches[selectedIdx]);
      }
    }
  }

  function updateSelectedResult() {
    var items = searchResults.querySelectorAll('li');
    for (var i = 0; i < items.length; i++) {
      if (i === selectedIdx) {
        items[i].classList.add('selected');
        items[i].scrollIntoView({ block: 'nearest' });
      } else {
        items[i].classList.remove('selected');
      }
    }
  }

  function initSearch() {
    buildSearchIndex();

    searchInput.addEventListener('input', function () {
      runSearch(searchInput.value.trim());
    });

    searchInput.addEventListener('keydown', handleSearchKeys);

    searchModal.addEventListener('click', function (e) {
      if (e.target === searchModal) closeSearch();
    });
  }

  // ── Copy helpers ─────────────────────────────────────────────

  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 1200);
    });
  }

  function htmlToMarkdown(node) {
    var result = '';
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.nodeType === 3) {
        result += child.textContent;
      } else if (child.nodeType === 1) {
        var tag = child.tagName.toLowerCase();
        if (tag === 'p') {
          result += htmlToMarkdown(child) + '\n\n';
        } else if (tag === 'strong' || tag === 'b') {
          result += '**' + htmlToMarkdown(child) + '**';
        } else if (tag === 'em' || tag === 'i') {
          result += '_' + htmlToMarkdown(child) + '_';
        } else if (tag === 'code') {
          result += '`' + child.textContent + '`';
        } else if (tag === 'br') {
          result += '\n';
        } else if (tag === 'ul') {
          for (var u = 0; u < child.children.length; u++) {
            if (child.children[u].tagName.toLowerCase() === 'li') {
              result += '- ' + htmlToMarkdown(child.children[u]).trim() + '\n';
            }
          }
          result += '\n';
        } else if (tag === 'ol') {
          var num = 1;
          for (var o = 0; o < child.children.length; o++) {
            if (child.children[o].tagName.toLowerCase() === 'li') {
              result += num + '. ' + htmlToMarkdown(child.children[o]).trim() + '\n';
              num++;
            }
          }
          result += '\n';
        } else if (tag === 'pre') {
          result += '```\n' + child.textContent + '\n```\n\n';
        } else {
          result += htmlToMarkdown(child);
        }
      }
    }
    return result;
  }

  // ── Copy body as markdown ────────────────────────────────────

  var copyBodyBtn = document.getElementById('copy-body');
  var sharePanelBtn = document.getElementById('share-panel');
  var copyPageBtn = document.getElementById('copy-page');

  function initCopyBody() {
    sharePanelBtn.addEventListener('click', function () {
      copyToClipboard(window.location.href, sharePanelBtn);
    });

    copyBodyBtn.addEventListener('click', function () {
      var title = panelTitle.textContent;
      var bodyMd = htmlToMarkdown(panelBody).replace(/\n{3,}/g, '\n\n').trim();
      var yamlPre = panelYaml.querySelector('pre');
      var yamlMd = yamlPre ? '\n\n```yaml\n' + yamlPre.textContent + '\n```' : '';
      var text = '## ' + title + '\n\n' + bodyMd + yamlMd;
      copyToClipboard(text, copyBodyBtn);
    });

    copyPageBtn.addEventListener('click', function () {
      var page = null;
      for (var i = 0; i < PAGES.length; i++) {
        if (PAGES[i].id === currentPageId) { page = PAGES[i]; break; }
      }
      var title = page ? page.title : currentPageId;
      var text = '# ' + title + '\n\n```\n' + canvas.textContent + '\n```';
      copyToClipboard(text, copyPageBtn);
    });
  }

  // ── Theme switcher ────────────────────────────────────────────

  function initThemeDots() {
    var dots = document.querySelectorAll('#bottom-controls .dot');
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

    var dots = document.querySelectorAll('#bottom-controls .dot');
    for (var i = 0; i < dots.length; i++) {
      if (dots[i].getAttribute('data-theme') === name) {
        dots[i].classList.add('active');
      } else {
        dots[i].classList.remove('active');
      }
    }
  }

  // ── Font size ─────────────────────────────────────────────────

  var fontSize = parseInt(localStorage.getItem('dime-font-size'), 10) || 13;
  var FONT_MIN = 9;
  var FONT_MAX = 20;

  function applyFontSize() {
    canvas.style.fontSize = fontSize + 'px';
    localStorage.setItem('dime-font-size', fontSize);
  }

  function changeFontSize(delta) {
    fontSize = Math.max(FONT_MIN, Math.min(FONT_MAX, fontSize + delta));
    applyFontSize();
  }

  function initFontControls() {
    applyFontSize();
    document.getElementById('font-up').addEventListener('click', function () { changeFontSize(1); });
    document.getElementById('font-down').addEventListener('click', function () { changeFontSize(-1); });
  }

  // ── Visited pages ────────────────────────────────────────────

  var visited = {};

  function loadVisited() {
    try {
      visited = JSON.parse(localStorage.getItem('dime-visited') || '{}');
    } catch (e) { visited = {}; }
  }

  function markVisited(pageId) {
    if (visited[pageId]) return;
    visited[pageId] = 1;
    localStorage.setItem('dime-visited', JSON.stringify(visited));
    var link = pageList.querySelector('a[data-page-id="' + pageId + '"]');
    if (link) link.classList.add('visited');
  }

  function applyVisitedMarks() {
    var links = pageList.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      var id = links[i].getAttribute('data-page-id');
      if (visited[id]) links[i].classList.add('visited');
    }
  }

  // ── Shortcut help ────────────────────────────────────────────

  var shortcutModal = document.getElementById('shortcut-modal');

  function openShortcuts() {
    shortcutModal.classList.add('open');
  }

  function closeShortcuts() {
    shortcutModal.classList.remove('open');
  }

  function initShortcutModal() {
    shortcutModal.addEventListener('click', function (e) {
      if (e.target === shortcutModal) closeShortcuts();
    });
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
    loadVisited();
    applyVisitedMarks();
    initSidebarResize();
    initThemeDots();
    initFontControls();
    initSearch();
    initCopyBody();
    initShortcutModal();
    scheduleGlitch();
    panelClose.addEventListener('click', closePanel);
    sidebarToggle.addEventListener('click', toggleSidebar);
    document.addEventListener('keydown', handleKeyboard);
    window.addEventListener('hashchange', onHashChange);

    // Load initial page
    var initial = parseHash();
    if (!window.location.hash) {
      window.location.hash = 'page-01';
    } else {
      loadPage(initial.pageId).then(function () {
        if (initial.hotspotId) {
          setTimeout(function () { activateHotspot(initial.hotspotId); }, 100);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
