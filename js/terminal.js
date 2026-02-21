(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────
  var isOpen = false;
  var commandHistory = [];
  var historyIndex = -1;
  var pageHistory = [];
  var sessionStart = Date.now();
  var pagesVisited = {};
  var hotspotsExplored = {};
  var isStreaming = false;
  var cancelStream = null;
  var completionItems = [];
  var completionIndex = -1;

  // ── DOM refs (set during init) ─────────────────────────────────
  var pane, outputEl, inputEl, statusEl, closeBtn, bubble;
  var completionEl = null; // lazy-created

  // ── Command registry ───────────────────────────────────────────
  var COMMANDS = {};

  function registerCommand(name, opts) {
    COMMANDS[name] = opts;
  }

  // ── Output rendering ──────────────────────────────────────────
  function writeLine(text, cls) {
    var div = document.createElement('div');
    div.className = 'term-line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    outputEl.appendChild(div);
    scrollBottom();
  }

  function writeHtml(html, cls) {
    var div = document.createElement('div');
    div.className = 'term-line' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    outputEl.appendChild(div);
    scrollBottom();
  }

  function writeHeading(text) { writeLine(text, 'term-line-heading'); }
  function writeError(text) { writeLine(text, 'term-line-error'); }
  function writeDim(text) { writeLine(text, 'term-line-dim'); }
  function writeSeparator() { writeLine('────────────────────────────────────────', 'term-line-separator'); }

  function writeTable(headers, rows) {
    var table = document.createElement('table');
    table.className = 'term-table';
    var thead = document.createElement('tr');
    for (var h = 0; h < headers.length; h++) {
      var th = document.createElement('th');
      th.textContent = headers[h];
      thead.appendChild(th);
    }
    table.appendChild(thead);
    for (var r = 0; r < rows.length; r++) {
      var tr = document.createElement('tr');
      for (var c = 0; c < rows[r].length; c++) {
        var td = document.createElement('td');
        if (typeof rows[r][c] === 'object' && rows[r][c].html) {
          td.innerHTML = rows[r][c].html;
        } else {
          td.textContent = rows[r][c];
        }
        if (c > 0) td.className = 'dim';
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    var wrap = document.createElement('div');
    wrap.className = 'term-line';
    wrap.appendChild(table);
    outputEl.appendChild(wrap);
    scrollBottom();
  }

  function writePageLink(pageId, title) {
    var div = document.createElement('div');
    div.className = 'term-line term-line-link';
    div.textContent = title || pageId;
    div.addEventListener('click', function () {
      window.location.hash = 'page-' + pageId;
    });
    outputEl.appendChild(div);
    scrollBottom();
  }

  function writeYaml(text) {
    var div = document.createElement('div');
    div.className = 'term-line term-line-yaml';
    var pre = document.createElement('pre');
    if (window.DIME_HL) {
      pre.innerHTML = window.DIME_HL.highlightYaml(text);
    } else {
      pre.textContent = text;
    }
    div.appendChild(pre);
    outputEl.appendChild(div);
    scrollBottom();
  }

  function scrollBottom() {
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  // ── Helpers ────────────────────────────────────────────────────
  function getCurrentPageId() {
    var hash = window.location.hash;
    var match = hash.match(/^#page-([\w]+)/);
    return match ? match[1] : null;
  }

  function findPage(id) {
    if (typeof PAGES === 'undefined') return null;
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].id === id) return PAGES[i];
    }
    return null;
  }

  function normalizePageId(input) {
    if (!input) return null;
    var s = input.trim().toUpperCase();

    // Direct match first
    if (findPage(s)) return s;

    // Try "CON" + number: "con5" -> "CON05"
    var conMatch = s.match(/^CON(\d+)$/);
    if (conMatch) {
      var conNum = parseInt(conMatch[1], 10);
      var conId = 'CON' + (conNum < 10 ? '0' : '') + conNum;
      if (findPage(conId)) return conId;
    }

    // Try "EX" + number: "ex17" -> "EX17", "ex5" -> "EX05"
    var exMatch = s.match(/^EX(\d+)$/);
    if (exMatch) {
      var exNum = parseInt(exMatch[1], 10);
      var exId = 'EX' + (exNum < 10 ? '0' : '') + exNum;
      if (findPage(exId)) return exId;
    }

    // Try "REF" + number: "ref25" -> "REF25", "ref5" -> "REF05"
    var refMatch = s.match(/^REF(\d+)$/);
    if (refMatch) {
      var refNum = parseInt(refMatch[1], 10);
      var refId = 'REF' + (refNum < 10 ? '0' : '') + refNum;
      if (findPage(refId)) return refId;
    }

    return null;
  }

  function getPageCategory(page) {
    if (page.id.indexOf('EX') === 0) return 'examples';
    if (page.id.indexOf('REF') === 0) return 'refs';
    return 'concepts';
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatUptime() {
    var sec = Math.floor((Date.now() - sessionStart) / 1000);
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm ' + s + 's';
  }

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || '';
  }

  function collectPageYaml(page) {
    var yaml = [];
    if (page.hotspots) {
      for (var i = 0; i < page.hotspots.length; i++) {
        var hs = page.hotspots[i];
        if (hs.panel && hs.panel.yaml) {
          yaml.push({ label: hs.panel.title, yaml: hs.panel.yaml });
        }
      }
    }
    return yaml;
  }

  function findHotspotByIdOrLabel(page, query) {
    if (!page || !page.hotspots) return null;
    var q = query.toLowerCase();
    for (var i = 0; i < page.hotspots.length; i++) {
      var hs = page.hotspots[i];
      if (!hs.panel) continue;
      if (hs.id === query || hs.id.toLowerCase() === q) return hs;
      if (hs.panel.title && hs.panel.title.toLowerCase().indexOf(q) >= 0) return hs;
      if (hs.label && hs.label.toLowerCase().indexOf(q) >= 0) return hs;
    }
    return null;
  }

  // ── Input handling ─────────────────────────────────────────────
  function parseInput(raw) {
    var parts = raw.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    if (parts.length === 0) return null;
    var command = parts[0].toLowerCase();
    var args = [];
    var flags = {};
    for (var i = 1; i < parts.length; i++) {
      var p = parts[i];
      if (p.indexOf('--') === 0) {
        var key = p.slice(2);
        // Check if next arg is a value (not a flag)
        if (i + 1 < parts.length && parts[i + 1].indexOf('--') !== 0) {
          flags[key] = parts[i + 1].replace(/^"|"$/g, '');
          i++;
        } else {
          flags[key] = true;
        }
      } else {
        args.push(p.replace(/^"|"$/g, ''));
      }
    }
    return { command: command, args: args, flags: flags };
  }

  function handleInput() {
    var raw = inputEl.value.trim();
    inputEl.value = '';
    hideCompletions();

    if (!raw) return;

    // Add to history
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== raw) {
      commandHistory.push(raw);
    }
    historyIndex = commandHistory.length;

    // Echo command
    writeLine('DIME> ' + raw, 'term-line-cmd');

    var parsed = parseInput(raw);
    if (!parsed) return;

    var cmd = COMMANDS[parsed.command];
    if (!cmd) {
      writeError('Unknown command: ' + parsed.command + '. Type "help" for available commands.');
      return;
    }

    cmd.fn(parsed.args, parsed.flags, raw);
  }

  function handleKeyDown(e) {
    e.stopPropagation();

    // Tab completion
    if (e.key === 'Tab') {
      e.preventDefault();
      if (completionEl && completionEl.classList.contains('open')) {
        acceptCompletion();
      } else {
        triggerCompletion();
      }
      return;
    }

    // Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      hideCompletions();
      handleInput();
      return;
    }

    // Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      if (completionEl && completionEl.classList.contains('open')) {
        hideCompletions();
      } else {
        closeTerminal();
      }
      return;
    }

    // History navigation
    if (e.key === 'ArrowUp') {
      if (completionEl && completionEl.classList.contains('open')) {
        e.preventDefault();
        navigateCompletion(-1);
        return;
      }
      e.preventDefault();
      navigateHistory(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      if (completionEl && completionEl.classList.contains('open')) {
        e.preventDefault();
        navigateCompletion(1);
        return;
      }
      e.preventDefault();
      navigateHistory(1);
      return;
    }

    // Ctrl+C — cancel streaming
    if (e.key === 'c' && e.ctrlKey) {
      if (isStreaming && cancelStream) {
        cancelStream();
        isStreaming = false;
        cancelStream = null;
        writeDim('[cancelled]');
      }
      return;
    }

    // Ctrl+L — clear
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      outputEl.innerHTML = '';
      return;
    }

    // Hide completions on other keys
    hideCompletions();
  }

  // ── History ────────────────────────────────────────────────────
  function navigateHistory(direction) {
    if (commandHistory.length === 0) return;
    historyIndex += direction;
    if (historyIndex < 0) historyIndex = 0;
    if (historyIndex >= commandHistory.length) {
      historyIndex = commandHistory.length;
      inputEl.value = '';
      return;
    }
    inputEl.value = commandHistory[historyIndex];
    // Move cursor to end
    setTimeout(function () {
      inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
    }, 0);
  }

  // ── Tab completion ─────────────────────────────────────────────
  function ensureCompletionEl() {
    if (completionEl) return;
    completionEl = document.createElement('div');
    completionEl.id = 'term-completions';
    document.getElementById('term-input-line').appendChild(completionEl);
  }

  function triggerCompletion() {
    var val = inputEl.value;
    var parts = val.split(/\s+/);
    var items = [];

    if (parts.length <= 1) {
      // Complete command names
      var partial = (parts[0] || '').toLowerCase();
      var names = Object.keys(COMMANDS);
      for (var i = 0; i < names.length; i++) {
        if (names[i].indexOf(partial) === 0) {
          items.push(names[i]);
        }
      }
    } else {
      var cmd = parts[0].toLowerCase();
      var lastPart = parts[parts.length - 1] || '';

      // Command-specific completion
      if (COMMANDS[cmd] && COMMANDS[cmd].complete) {
        items = COMMANDS[cmd].complete(lastPart, parts);
      }
    }

    if (items.length === 0) return;
    if (items.length === 1) {
      applyCompletion(items[0], parts);
      return;
    }

    completionItems = items;
    completionIndex = 0;
    showCompletions();
  }

  function showCompletions() {
    ensureCompletionEl();
    renderCompletions();
    completionEl.classList.add('open');
  }

  function hideCompletions() {
    if (completionEl) completionEl.classList.remove('open');
    completionItems = [];
    completionIndex = -1;
  }

  function renderCompletions() {
    if (!completionEl) return;
    var html = '';
    for (var i = 0; i < completionItems.length; i++) {
      var cls = i === completionIndex ? 'term-comp-item selected' : 'term-comp-item';
      html += '<div class="' + cls + '" data-idx="' + i + '">' + escapeHtml(completionItems[i]) + '</div>';
    }
    completionEl.innerHTML = html;

    // Click handlers
    var els = completionEl.querySelectorAll('.term-comp-item');
    for (var j = 0; j < els.length; j++) {
      (function (el, idx) {
        el.addEventListener('click', function () {
          completionIndex = idx;
          acceptCompletion();
        });
      })(els[j], j);
    }
  }

  function navigateCompletion(dir) {
    if (completionItems.length === 0) return;
    completionIndex += dir;
    if (completionIndex < 0) completionIndex = completionItems.length - 1;
    if (completionIndex >= completionItems.length) completionIndex = 0;
    renderCompletions();
  }

  function acceptCompletion() {
    if (completionIndex < 0 || completionIndex >= completionItems.length) return;
    var parts = inputEl.value.split(/\s+/);
    applyCompletion(completionItems[completionIndex], parts);
    hideCompletions();
  }

  function applyCompletion(value, parts) {
    if (parts.length <= 1) {
      inputEl.value = value + ' ';
    } else {
      parts[parts.length - 1] = value;
      inputEl.value = parts.join(' ') + ' ';
    }
    inputEl.focus();
  }

  function completePageIds(partial) {
    if (typeof PAGES === 'undefined') return [];
    var p = partial.toUpperCase();
    var items = [];
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].id.indexOf(p) === 0) {
        items.push(PAGES[i].id);
      }
    }
    return items.slice(0, 20);
  }

  function completeHotspotIds(partial) {
    var pageId = getCurrentPageId();
    var page = findPage(pageId);
    if (!page || !page.hotspots) return [];
    var p = partial.toLowerCase();
    var items = [];
    for (var i = 0; i < page.hotspots.length; i++) {
      var hs = page.hotspots[i];
      if (!hs.panel) continue;
      if (hs.id.toLowerCase().indexOf(p) === 0) {
        items.push(hs.id);
      }
    }
    return items;
  }

  function completeThemes(partial) {
    var themes = ['amber', 'green', 'white'];
    var p = partial.toLowerCase();
    var items = [];
    for (var i = 0; i < themes.length; i++) {
      if (themes[i].indexOf(p) === 0) items.push(themes[i]);
    }
    return items;
  }

  // ── Open/close ─────────────────────────────────────────────────
  function openTerminal() {
    if (isOpen) return;
    isOpen = true;
    pane.classList.add('open');
    inputEl.focus();
    if (outputEl.children.length === 0) printWelcome();
    updateStatus();
  }

  function closeTerminal() {
    if (!isOpen) return;
    isOpen = false;
    pane.classList.remove('open');
    hideCompletions();
  }

  function toggleTerminal() {
    if (isOpen) closeTerminal();
    else openTerminal();
  }

  function printWelcome() {
    writeHeading('DIME TERMINAL v1.0');
    writeDim('Data In Motion Enterprise — Interactive Documentation Shell');
    writeLine('');
    writeDim('Type "help" for available commands. Press Esc or ` to close.');
    writeSeparator();
  }

  function updateStatus() {
    if (!statusEl) return;
    var pageId = getCurrentPageId();
    statusEl.textContent = pageId ? 'page: ' + pageId : '';
  }

  // ── Nav tracking ───────────────────────────────────────────────
  function trackNavigation() {
    var pageId = getCurrentPageId();
    if (pageId) {
      if (pageHistory.length === 0 || pageHistory[pageHistory.length - 1] !== pageId) {
        pageHistory.push(pageId);
      }
      pagesVisited[pageId] = true;
      updateStatus();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ── COMMANDS ──────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════

  // ── help ───────────────────────────────────────────────────────
  registerCommand('help', {
    description: 'List commands or show help for a specific command',
    usage: 'help [command]',
    category: 'System',
    fn: function (args) {
      if (args.length > 0) {
        var cmd = COMMANDS[args[0].toLowerCase()];
        if (!cmd) {
          writeError('Unknown command: ' + args[0]);
          return;
        }
        writeHeading(args[0].toUpperCase());
        writeLine(cmd.description);
        if (cmd.usage) writeDim('Usage: ' + cmd.usage);
        return;
      }

      writeHeading('AVAILABLE COMMANDS');
      writeLine('');

      var categories = {};
      var names = Object.keys(COMMANDS);
      for (var i = 0; i < names.length; i++) {
        var cat = COMMANDS[names[i]].category || 'Other';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ name: names[i], desc: COMMANDS[names[i]].description });
      }

      var catOrder = ['Navigation', 'Search', 'Config', 'AI', 'System'];
      for (var c = 0; c < catOrder.length; c++) {
        var cat = catOrder[c];
        if (!categories[cat]) continue;
        writeHeading('  ' + cat);
        var rows = [];
        for (var j = 0; j < categories[cat].length; j++) {
          rows.push(['  ' + categories[cat][j].name, categories[cat][j].desc]);
        }
        writeTable(['Command', 'Description'], rows);
        writeLine('');
      }

      writeDim('Type "help <command>" for detailed usage.');
    }
  });

  // ── clear ──────────────────────────────────────────────────────
  registerCommand('clear', {
    description: 'Clear terminal output',
    usage: 'clear',
    category: 'System',
    fn: function () {
      outputEl.innerHTML = '';
    }
  });

  // ── pwd ────────────────────────────────────────────────────────
  registerCommand('pwd', {
    description: 'Show current page ID and title',
    usage: 'pwd',
    category: 'Navigation',
    fn: function () {
      var pageId = getCurrentPageId();
      if (!pageId) {
        writeDim('No page loaded');
        return;
      }
      var page = findPage(pageId);
      if (page) {
        writeLine(page.id + ' - ' + page.title);
      } else {
        writeLine(pageId);
      }
    }
  });

  // ── ls ─────────────────────────────────────────────────────────
  registerCommand('ls', {
    description: 'List pages with optional category filter',
    usage: 'ls [concepts|examples|refs]',
    category: 'Navigation',
    fn: function (args) {
      if (typeof PAGES === 'undefined') { writeError('No pages loaded'); return; }

      var filter = args.length > 0 ? args[0].toLowerCase() : null;
      var rows = [];
      var currentId = getCurrentPageId();

      for (var i = 0; i < PAGES.length; i++) {
        var page = PAGES[i];
        var cat = getPageCategory(page);

        if (filter) {
          if (filter === 'concepts' && cat !== 'concepts') continue;
          if (filter === 'examples' && cat !== 'examples') continue;
          if (filter === 'refs' && cat !== 'refs') continue;
        }

        var marker = page.id === currentId ? '>' : ' ';
        rows.push([marker + ' ' + page.id, page.title]);
      }

      writeTable(['ID', 'Title'], rows);
      writeDim(rows.length + ' page' + (rows.length !== 1 ? 's' : ''));
    },
    complete: function (partial) {
      var opts = ['concepts', 'examples', 'refs'];
      var p = partial.toLowerCase();
      return opts.filter(function (o) { return o.indexOf(p) === 0; });
    }
  });

  // ── cd ─────────────────────────────────────────────────────────
  registerCommand('cd', {
    description: 'Navigate to page by ID',
    usage: 'cd <pageId>  (e.g., "5", "ex17", "REF25")',
    category: 'Navigation',
    fn: function (args) {
      if (args.length === 0) { writeError('Usage: cd <pageId>'); return; }
      var id = normalizePageId(args[0]);
      if (!id) {
        writeError('Page not found: ' + args[0]);
        return;
      }
      var page = findPage(id);
      window.location.hash = 'page-' + id;
      writeLine('Navigated to ' + id + (page ? ' - ' + page.title : ''), 'term-line-success');
    },
    complete: function (partial) {
      return completePageIds(partial);
    }
  });

  // ── back ───────────────────────────────────────────────────────
  registerCommand('back', {
    description: 'Go to previous page in history',
    usage: 'back',
    category: 'Navigation',
    fn: function () {
      if (pageHistory.length < 2) {
        writeDim('No previous page in history');
        return;
      }
      pageHistory.pop(); // remove current
      var prev = pageHistory[pageHistory.length - 1];
      window.location.hash = 'page-' + prev;
      var page = findPage(prev);
      writeLine('Back to ' + prev + (page ? ' - ' + page.title : ''), 'term-line-success');
    }
  });

  // ── history ────────────────────────────────────────────────────
  registerCommand('history', {
    description: 'Show navigation history',
    usage: 'history',
    category: 'Navigation',
    fn: function () {
      if (pageHistory.length === 0) {
        writeDim('No navigation history');
        return;
      }
      writeHeading('NAVIGATION HISTORY');
      for (var i = 0; i < pageHistory.length; i++) {
        var page = findPage(pageHistory[i]);
        var marker = i === pageHistory.length - 1 ? '> ' : '  ';
        writeLine(marker + pageHistory[i] + (page ? ' - ' + page.title : ''));
      }
    }
  });

  // ── grep ───────────────────────────────────────────────────────
  registerCommand('grep', {
    description: 'Search page content',
    usage: 'grep <term> [--concepts|--examples|--refs]',
    category: 'Search',
    fn: function (args, flags) {
      if (args.length === 0) { writeError('Usage: grep <term>'); return; }
      if (typeof PAGES === 'undefined') { writeError('No pages loaded'); return; }

      var query = args.join(' ').toLowerCase();
      var results = [];

      for (var i = 0; i < PAGES.length; i++) {
        var page = PAGES[i];
        var cat = getPageCategory(page);

        if (flags.concepts && cat !== 'concepts') continue;
        if (flags.examples && cat !== 'examples') continue;
        if (flags.refs && cat !== 'refs') continue;

        // Search title
        if (page.title.toLowerCase().indexOf(query) >= 0) {
          results.push({ pageId: page.id, title: page.title, match: 'title' });
        }

        // Search hotspot panels
        if (page.hotspots) {
          for (var j = 0; j < page.hotspots.length; j++) {
            var hs = page.hotspots[j];
            if (!hs.panel) continue;
            var panelText = (hs.panel.title + ' ' + stripHtml(hs.panel.body || '')).toLowerCase();
            if (panelText.indexOf(query) >= 0) {
              results.push({
                pageId: page.id,
                title: hs.panel.title,
                match: 'hotspot in ' + page.id,
                hotspotId: hs.id
              });
            }
          }
        }
      }

      if (results.length === 0) {
        writeDim('No results for "' + args.join(' ') + '"');
        return;
      }

      writeHeading(results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for "' + args.join(' ') + '"');
      var rows = [];
      for (var r = 0; r < Math.min(results.length, 50); r++) {
        var res = results[r];
        rows.push([
          { html: '<span class="term-line-link" data-page="' + escapeHtml(res.pageId) + '"' +
            (res.hotspotId ? ' data-hotspot="' + escapeHtml(res.hotspotId) + '"' : '') +
            '>' + escapeHtml(res.pageId) + '</span>' },
          res.title,
          res.match
        ]);
      }
      writeTable(['Page', 'Title', 'Match'], rows);

      // Attach click handlers to links
      var links = outputEl.querySelectorAll('.term-line-link[data-page]');
      for (var l = 0; l < links.length; l++) {
        (function (el) {
          if (el._termBound) return;
          el._termBound = true;
          el.addEventListener('click', function () {
            var pg = el.getAttribute('data-page');
            var hs = el.getAttribute('data-hotspot');
            window.location.hash = 'page-' + pg;
            if (hs) {
              setTimeout(function () {
                window.history.replaceState(null, '', '#page-' + pg + ':' + hs);
                window.dispatchEvent(new HashChangeEvent('hashchange'));
              }, 450);
            }
          });
        })(links[l]);
      }

      if (results.length > 50) {
        writeDim('... and ' + (results.length - 50) + ' more results');
      }
    }
  });

  // ── related ────────────────────────────────────────────────────
  registerCommand('related', {
    description: 'Show related links for current page',
    usage: 'related',
    category: 'Search',
    fn: function () {
      var pageId = getCurrentPageId();
      var page = findPage(pageId);
      if (!page) { writeError('No page loaded'); return; }

      var links = [];
      if (page.hotspots) {
        for (var i = 0; i < page.hotspots.length; i++) {
          var hs = page.hotspots[i];
          if (hs.panel && hs.panel.related) {
            for (var r = 0; r < hs.panel.related.length; r++) {
              var rel = hs.panel.related[r];
              links.push({ page: rel.page, label: rel.label });
            }
          }
        }
      }

      if (links.length === 0) {
        writeDim('No related links for ' + pageId);
        return;
      }

      writeHeading('RELATED PAGES');
      // Deduplicate
      var seen = {};
      for (var j = 0; j < links.length; j++) {
        if (seen[links[j].page]) continue;
        seen[links[j].page] = true;
        writePageLink(links[j].page, links[j].label);
      }
    }
  });

  // ── hotspots ───────────────────────────────────────────────────
  registerCommand('hotspots', {
    description: 'List hotspots on current page',
    usage: 'hotspots',
    category: 'Search',
    fn: function () {
      var pageId = getCurrentPageId();
      var page = findPage(pageId);
      if (!page) { writeError('No page loaded'); return; }
      if (!page.hotspots || page.hotspots.length === 0) {
        writeDim('No hotspots on ' + pageId);
        return;
      }

      writeHeading('HOTSPOTS ON ' + pageId);
      var rows = [];
      for (var i = 0; i < page.hotspots.length; i++) {
        var hs = page.hotspots[i];
        if (!hs.panel) continue;
        rows.push([hs.id, hs.panel.title]);
      }
      writeTable(['ID', 'Title'], rows);
      writeDim('Use "open <id>" to view a hotspot panel');
    }
  });

  // ── open ───────────────────────────────────────────────────────
  registerCommand('open', {
    description: 'Open hotspot panel by ID or label',
    usage: 'open <id|label>',
    category: 'Search',
    fn: function (args) {
      if (args.length === 0) { writeError('Usage: open <hotspot-id>'); return; }

      var pageId = getCurrentPageId();
      var page = findPage(pageId);
      if (!page) { writeError('No page loaded'); return; }

      var query = args.join(' ');
      var hs = findHotspotByIdOrLabel(page, query);
      if (!hs) {
        writeError('Hotspot not found: ' + query);
        writeDim('Use "hotspots" to see available hotspots');
        return;
      }

      hotspotsExplored[pageId + ':' + hs.id] = true;

      // Activate hotspot via hash
      window.history.replaceState(null, '', '#page-' + pageId + ':' + hs.id);
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      writeLine('Opened: ' + hs.panel.title, 'term-line-success');
    },
    complete: function (partial) {
      return completeHotspotIds(partial);
    }
  });

  // ── cat ────────────────────────────────────────────────────────
  registerCommand('cat', {
    description: 'Dump page markdown content',
    usage: 'cat <pageId>',
    category: 'Navigation',
    fn: function (args) {
      var pageId;
      if (args.length === 0) {
        pageId = getCurrentPageId();
      } else {
        pageId = normalizePageId(args[0]);
      }
      if (!pageId) { writeError('Page not found: ' + (args[0] || '(none)')); return; }

      var page = findPage(pageId);
      if (!page) { writeError('Page not found: ' + pageId); return; }

      writeHeading(page.title);

      fetch(page.file).then(function (resp) {
        if (!resp.ok) throw new Error('Failed to load');
        return resp.text();
      }).then(function (text) {
        // Strip ``` fences
        var lines = text.replace(/\r/g, '').split('\n');
        if (lines.length > 0 && lines[0].trim().indexOf('```') === 0) lines.shift();
        if (lines.length > 0 && lines[lines.length - 1].trim().indexOf('```') === 0) lines.pop();
        writeLine(lines.join('\n'));
      }).catch(function (err) {
        writeError('Failed to load page content: ' + err.message);
      });
    },
    complete: function (partial) {
      return completePageIds(partial);
    }
  });

  // ── build ──────────────────────────────────────────────────────
  registerCommand('build', {
    description: 'Generate YAML config into playground',
    usage: 'build [--source <type>] [--sink <type>]',
    category: 'Config',
    fn: function (args, flags) {
      if (!window.DIME_PG) {
        writeError('Playground not available');
        return;
      }

      var yaml = 'app:\n  license: DEMO-0000-0000-0000-0000-0000-0000-0000\n  ring_buffer: 4096\n  http_server_uri: http://127.0.0.1:9999/\n  ws_server_uri: ws://127.0.0.1:9998/\n';

      if (flags.source) {
        yaml += '\nsources:\n  - name: my_' + flags.source + '\n    connector: ' + flags.source + '\n    scan_interval: 1000\n    items:\n      - name: item_1\n        address: ""\n';
      }

      if (flags.sink) {
        yaml += '\nsinks:\n  - name: my_' + flags.sink + '\n    connector: ' + flags.sink + '\n';
      }

      window.DIME_PG.loadYaml(yaml);
      writeLine('Configuration loaded into Playground', 'term-line-success');
      if (flags.source) writeDim('Source: ' + flags.source);
      if (flags.sink) writeDim('Sink: ' + flags.sink);
      writeDim('Open Playground to edit and refine.');
    }
  });

  // ── validate ───────────────────────────────────────────────────
  registerCommand('validate', {
    description: 'Validate playground YAML',
    usage: 'validate',
    category: 'Config',
    fn: function () {
      var yamlPre = document.getElementById('pg-yaml');
      if (!yamlPre) {
        writeError('Playground not available');
        return;
      }
      var raw = yamlPre.getAttribute('data-raw') || yamlPre.textContent;
      if (!raw || !raw.trim()) {
        writeDim('Playground is empty. Use "build" to generate a config.');
        return;
      }

      // Trigger playground validate button
      var btn = document.getElementById('pg-validate');
      if (btn) btn.click();

      // Read validation results
      setTimeout(function () {
        var errorsEl = document.getElementById('pg-errors');
        var statusEl = document.getElementById('pg-status');
        if (statusEl) {
          writeLine(statusEl.textContent, 'term-line-success');
        }
        if (errorsEl && errorsEl.children.length > 0) {
          for (var i = 0; i < errorsEl.children.length; i++) {
            var item = errorsEl.children[i];
            var isErr = item.classList.contains('error');
            writeLine(item.textContent, isErr ? 'term-line-error' : 'term-line-dim');
          }
        }
      }, 100);
    }
  });

  // ── diff ───────────────────────────────────────────────────────
  registerCommand('diff', {
    description: 'Show YAML from two pages side by side',
    usage: 'diff <pageA> <pageB>',
    category: 'Config',
    fn: function (args) {
      if (args.length < 2) { writeError('Usage: diff <pageA> <pageB>'); return; }

      var idA = normalizePageId(args[0]);
      var idB = normalizePageId(args[1]);
      if (!idA) { writeError('Page not found: ' + args[0]); return; }
      if (!idB) { writeError('Page not found: ' + args[1]); return; }

      var pageA = findPage(idA);
      var pageB = findPage(idB);

      var yamlA = collectPageYaml(pageA);
      var yamlB = collectPageYaml(pageB);

      if (yamlA.length === 0 && yamlB.length === 0) {
        writeDim('Neither page contains YAML examples');
        return;
      }

      writeHeading('YAML FROM ' + idA);
      if (yamlA.length === 0) {
        writeDim('(no YAML)');
      } else {
        for (var a = 0; a < yamlA.length; a++) {
          writeDim(yamlA[a].label);
          writeYaml(yamlA[a].yaml);
        }
      }

      writeSeparator();
      writeHeading('YAML FROM ' + idB);
      if (yamlB.length === 0) {
        writeDim('(no YAML)');
      } else {
        for (var b = 0; b < yamlB.length; b++) {
          writeDim(yamlB[b].label);
          writeYaml(yamlB[b].yaml);
        }
      }
    },
    complete: function (partial) {
      return completePageIds(partial);
    }
  });

  // ── export ─────────────────────────────────────────────────────
  registerCommand('export', {
    description: 'Copy config/page content to clipboard',
    usage: 'export',
    category: 'Config',
    fn: function () {
      // Try playground YAML first
      var yamlPre = document.getElementById('pg-yaml');
      var raw = yamlPre ? (yamlPre.getAttribute('data-raw') || yamlPre.textContent) : '';

      if (raw && raw.trim()) {
        navigator.clipboard.writeText(raw).then(function () {
          writeLine('Playground YAML copied to clipboard', 'term-line-success');
        }).catch(function () {
          writeError('Failed to copy to clipboard');
        });
        return;
      }

      // Fall back to current page content
      var canvas = document.getElementById('ascii-canvas');
      if (canvas && canvas.textContent) {
        var pageId = getCurrentPageId();
        var page = findPage(pageId);
        var title = page ? page.title : pageId;
        var text = '# ' + title + '\n\n```\n' + canvas.textContent + '\n```';
        navigator.clipboard.writeText(text).then(function () {
          writeLine('Page content copied to clipboard', 'term-line-success');
        }).catch(function () {
          writeError('Failed to copy to clipboard');
        });
        return;
      }

      writeDim('Nothing to export');
    }
  });

  // ── Schema helpers ─────────────────────────────────────────────
  function withSchema(fn) {
    if (!window.DIME_PG) { writeError('Playground not available'); return; }
    window.DIME_PG.loadSchema(function () { fn(); });
  }

  // forceSide: 'source', 'sink', or null (auto-detect)
  function matchConnectorType(input, forceSide) {
    var pg = window.DIME_PG;
    var q = input.toLowerCase();
    var sources = pg.getTypeEnum(false);
    var sinks = pg.getTypeEnum(true);
    var checkSrc = forceSide !== 'sink';
    var checkSnk = forceSide !== 'source';

    // Exact matches
    var exact = [];
    if (checkSrc) {
      for (var i = 0; i < sources.length; i++) {
        if (sources[i].toLowerCase() === q) exact.push({ type: sources[i], isSink: false });
      }
    }
    if (checkSnk) {
      for (var j = 0; j < sinks.length; j++) {
        if (sinks[j].toLowerCase() === q) exact.push({ type: sinks[j], isSink: true });
      }
    }
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) return exact; // both source and sink exist

    // Partial match
    var matches = [];
    if (checkSrc) {
      for (var si = 0; si < sources.length; si++) {
        if (sources[si].toLowerCase().indexOf(q) >= 0) matches.push({ type: sources[si], isSink: false });
      }
    }
    if (checkSnk) {
      for (var ki = 0; ki < sinks.length; ki++) {
        if (sinks[ki].toLowerCase().indexOf(q) >= 0) matches.push({ type: sinks[ki], isSink: true });
      }
    }

    if (matches.length === 1) return matches[0];
    return matches.length > 0 ? matches : null;
  }

  function completeConnectorTypes(partial) {
    if (!window.DIME_PG || !window.DIME_PG.getSchema()) return [];
    var pg = window.DIME_PG;
    var p = partial.toLowerCase();
    var items = [];
    var sources = pg.getTypeEnum(false);
    var sinks = pg.getTypeEnum(true);
    var seen = {};
    for (var i = 0; i < sources.length; i++) {
      if (sources[i].toLowerCase().indexOf(p) === 0 && !seen[sources[i]]) {
        items.push(sources[i]);
        seen[sources[i]] = 1;
      }
    }
    for (var j = 0; j < sinks.length; j++) {
      if (sinks[j].toLowerCase().indexOf(p) === 0 && !seen[sinks[j]]) {
        items.push(sinks[j]);
        seen[sinks[j]] = 1;
      }
    }
    return items.slice(0, 20);
  }

  // ── connectors ────────────────────────────────────────────────
  registerCommand('connectors', {
    description: 'List all source/sink connector types from the schema',
    usage: 'connectors [--sources|--sinks]',
    category: 'Config',
    fn: function (args, flags) {
      withSchema(function () {
        var pg = window.DIME_PG;
        var sources = pg.getTypeEnum(false);
        var sinks = pg.getTypeEnum(true);

        if (!flags.sinks) {
          writeHeading('SOURCE CONNECTORS (' + sources.length + ')');
          var srcRows = [];
          for (var i = 0; i < sources.length; i++) {
            var def = pg.getConnectorDef(false, sources[i]);
            srcRows.push([sources[i], def.description || '']);
          }
          writeTable(['Connector', 'Description'], srcRows);
          writeLine('');
        }

        if (!flags.sources) {
          writeHeading('SINK CONNECTORS (' + sinks.length + ')');
          var snkRows = [];
          for (var j = 0; j < sinks.length; j++) {
            var def = pg.getConnectorDef(true, sinks[j]);
            snkRows.push([sinks[j], def.description || '']);
          }
          writeTable(['Connector', 'Description'], snkRows);
        }

        writeDim('Use "describe <type>" for details or "sample <type>" for a YAML snippet.');
      });
    }
  });

  // ── describe ──────────────────────────────────────────────────
  function describeProps(props, reqFields, prefix) {
    var pre = prefix || '';
    var rows = [];
    for (var key in props) {
      var p = props[key];
      if (p.type === 'object' && p.properties) {
        // Nested object — recurse with dotted prefix
        var nested = describeProps(p.properties, p.required || [], pre + key + '.');
        for (var n = 0; n < nested.length; n++) rows.push(nested[n]);
      } else {
        var typeStr = p.type || 'string';
        if (p.enum && p.type !== 'boolean') typeStr += ' [' + p.enum.join(', ') + ']';
        var defVal = p.default !== undefined ? String(p.default) : '';
        var req = reqFields.indexOf(key) !== -1 ? '*' : '';
        rows.push([req + pre + key, typeStr, defVal, p.description || '']);
      }
    }
    return rows;
  }

  function describeOne(pg, type, isSink) {
    var specDef = pg.getConnectorDef(isSink, type);
    var full = pg.getFullConnectorProps(isSink, type);
    var props = full.properties;
    var reqFields = full.required;

    writeHeading(type.toUpperCase() + ' (' + (isSink ? 'sink' : 'source') + ')');
    if (specDef.description) writeDim(specDef.description);
    writeLine('');

    writeTable(['Property', 'Type', 'Default', 'Description'], describeProps(props, reqFields));

    if (reqFields.length > 0) {
      writeDim('* = required');
    }

    // Item properties (sources only)
    if (!isSink) {
      var itemFull = pg.getFullItemProps(type);
      var itemProps = itemFull.properties;
      var itemReq = itemFull.required;

      writeLine('');
      writeHeading('ITEM PROPERTIES');
      writeTable(['Property', 'Type', 'Default', 'Description'], describeProps(itemProps, itemReq));

      if (itemReq.length > 0) {
        writeDim('* = required');
      }
    }
  }

  registerCommand('describe', {
    description: 'Show all properties for a connector type',
    usage: 'describe <type> [--source|--sink]  (e.g., "describe mqtt --sink")',
    category: 'Config',
    fn: function (args, flags) {
      if (args.length === 0) { writeError('Usage: describe <type> [--source|--sink]'); return; }
      withSchema(function () {
        var forceSide = flags.source ? 'source' : flags.sink ? 'sink' : null;
        var result = matchConnectorType(args[0], forceSide);
        if (!result) {
          writeError('Connector not found: ' + args[0]);
          writeDim('Use "connectors" to list available types.');
          return;
        }
        if (Array.isArray(result)) {
          // Check if all matches are the same connector name (both source and sink)
          var sameName = result.length > 1 && result.every(function (r) {
            return r.type.toLowerCase() === result[0].type.toLowerCase();
          });
          if (sameName) {
            // Show both source and sink
            var pg = window.DIME_PG;
            for (var b = 0; b < result.length; b++) {
              describeOne(pg, result[b].type, result[b].isSink);
              if (b < result.length - 1) writeSeparator();
            }
            writeDim('Use --source or --sink to show only one side.');
            return;
          }
          writeDim('Multiple matches for "' + args[0] + '":');
          for (var m = 0; m < result.length; m++) {
            writeLine('  ' + result[m].type + ' (' + (result[m].isSink ? 'sink' : 'source') + ')');
          }
          writeDim('Use --source or --sink to narrow results.');
          return;
        }

        describeOne(window.DIME_PG, result.type, result.isSink);
      });
    },
    complete: function (partial) {
      return completeConnectorTypes(partial);
    }
  });

  // ── sample ────────────────────────────────────────────────────
  function sampleYStr(v) {
    var s = String(v);
    if (s === '') return '""';
    if (/[:{}\[\],&*?|>!%@`#'"\\]/.test(s) || s === 'true' || s === 'false' || s === 'null' ||
        (/^\d/.test(s) && !isNaN(Number(s)))) {
      return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }
    return s;
  }

  function sampleOne(pg, type, isSink, full) {
    var fullDef = pg.getFullConnectorProps(isSink, type);
    var example = pg.getConnectorExample(isSink, type);
    var props = fullDef.properties;
    var reqFields = fullDef.required;

    // Skip these in sample output — they're in the header or structural
    var skipInYaml = { name: 1, connector: 1, scan_interval: 1, enabled: 1 };

    var y = [];
    var section = isSink ? 'sinks' : 'sources';
    y.push(section + ':');
    y.push('  - name: my_' + type);
    y.push('    connector: ' + type);
    y.push('    scan_interval: 1000');

    for (var key in props) {
      if (skipInYaml[key]) continue;
      var p = props[key];
      var isReq = reqFields.indexOf(key) !== -1;

      // Skip sink object and script fields in minimal mode unless example has them
      if (key === 'sink') continue;
      if (!full && !isReq && !example) continue;
      if (!full && !isReq && example && example[key] === undefined) continue;

      var val;
      if (example && example[key] !== undefined) {
        val = example[key];
      } else if (p.default !== undefined) {
        val = p.default;
      } else if (p.type === 'integer' || p.type === 'number') {
        val = 0;
      } else if (p.type === 'boolean') {
        val = false;
      } else if (p.type === 'array') {
        val = [];
      } else {
        val = '';
      }

      if (p.type === 'boolean') {
        y.push('    ' + key + ': ' + (val ? 'true' : 'false'));
      } else if (p.type === 'integer' || p.type === 'number') {
        y.push('    ' + key + ': ' + val);
      } else if (p.type === 'array' && Array.isArray(val) && val.length > 0) {
        y.push('    ' + key + ':');
        for (var ai = 0; ai < val.length; ai++) y.push('      - ' + sampleYStr(String(val[ai])));
      } else if (p.type === 'object' && val && typeof val === 'object') {
        y.push('    ' + key + ':');
        for (var ok in val) y.push('      ' + ok + ': ' + sampleYStr(String(val[ok])));
      } else if (p.type === 'string' && typeof val === 'string' && val.indexOf('\n') !== -1) {
        y.push('    ' + key + ': |');
        var sLines = val.split('\n');
        for (var sl = 0; sl < sLines.length; sl++) y.push('      ' + sLines[sl]);
      } else if (p.type !== 'array') {
        y.push('    ' + key + ': ' + sampleYStr(val));
      }
    }

    if (!isSink) {
      var itemFull = pg.getFullItemProps(type);
      var itemProps = itemFull.properties;
      var itemReq = itemFull.required;
      // Find first example item if available
      var exItem = (example && Array.isArray(example.items) && example.items[0]) || null;

      y.push('    items:');
      y.push('      - name: item_1');

      for (var ik in itemProps) {
        if (ik === 'name' || ik === 'sink') continue;
        var ip = itemProps[ik];
        var iReq = itemReq.indexOf(ik) !== -1;

        if (!full && !iReq && !exItem) continue;
        if (!full && !iReq && exItem && exItem[ik] === undefined) continue;

        var iv;
        if (exItem && exItem[ik] !== undefined) {
          iv = exItem[ik];
        } else if (ip.default !== undefined) {
          iv = ip.default;
        } else if (ip.type === 'integer' || ip.type === 'number') {
          iv = 0;
        } else if (ip.type === 'boolean') {
          iv = false;
        } else {
          iv = '';
        }

        if (ip.type === 'boolean') {
          y.push('        ' + ik + ': ' + (iv ? 'true' : 'false'));
        } else if (ip.type === 'integer' || ip.type === 'number') {
          y.push('        ' + ik + ': ' + iv);
        } else if (ip.type === 'string' && typeof iv === 'string' && iv.indexOf('\n') !== -1) {
          y.push('        ' + ik + ': |');
          var iLines = iv.split('\n');
          for (var il = 0; il < iLines.length; il++) y.push('          ' + iLines[il]);
        } else {
          y.push('        ' + ik + ': ' + sampleYStr(iv));
        }
      }
    }

    writeHeading('SAMPLE ' + type.toUpperCase() + ' (' + (isSink ? 'sink' : 'source') + ')');
    writeYaml(y.join('\n'));
  }

  registerCommand('sample', {
    description: 'Generate a minimal YAML snippet for a connector',
    usage: 'sample <type> [--source|--sink] [--full]',
    category: 'Config',
    fn: function (args, flags) {
      if (args.length === 0) { writeError('Usage: sample <type> [--source|--sink] [--full]'); return; }
      withSchema(function () {
        var forceSide = flags.source ? 'source' : flags.sink ? 'sink' : null;
        var result = matchConnectorType(args[0], forceSide);
        if (!result) {
          writeError('Connector not found: ' + args[0]);
          writeDim('Use "connectors" to list available types.');
          return;
        }
        var full = !!flags.full;
        var pg = window.DIME_PG;

        if (Array.isArray(result)) {
          var sameName = result.length > 1 && result.every(function (r) {
            return r.type.toLowerCase() === result[0].type.toLowerCase();
          });
          if (sameName) {
            for (var b = 0; b < result.length; b++) {
              sampleOne(pg, result[b].type, result[b].isSink, full);
              if (b < result.length - 1) writeSeparator();
            }
            writeDim('Use --source or --sink to show only one side.' +
              (full ? '' : ' Use --full to see all properties.'));
            return;
          }
          writeDim('Multiple matches for "' + args[0] + '":');
          for (var m = 0; m < result.length; m++) {
            writeLine('  ' + result[m].type + ' (' + (result[m].isSink ? 'sink' : 'source') + ')');
          }
          writeDim('Use --source or --sink to narrow results.');
          return;
        }

        sampleOne(pg, result.type, result.isSink, full);
        writeDim(full ? 'Showing all properties.' : 'Use --full to see all properties.');
      });
    },
    complete: function (partial) {
      return completeConnectorTypes(partial);
    }
  });

  // ── ask ────────────────────────────────────────────────────────
  registerCommand('ask', {
    description: 'Ask DIME AI a question (streams response)',
    usage: 'ask <question>',
    category: 'AI',
    fn: function (args) {
      if (args.length === 0) { writeError('Usage: ask <question>'); return; }
      var question = args.join(' ');
      streamAiQuestion(question);
    }
  });

  // ── explain ────────────────────────────────────────────────────
  registerCommand('explain', {
    description: 'AI explains current page or hotspot',
    usage: 'explain [hotspot]',
    category: 'AI',
    fn: function (args) {
      var pageId = getCurrentPageId();
      var page = findPage(pageId);
      if (!page) { writeError('No page loaded'); return; }

      var question;
      if (args.length > 0) {
        var hs = findHotspotByIdOrLabel(page, args.join(' '));
        if (hs) {
          var body = stripHtml(hs.panel.body || '');
          question = 'Explain this DIME concept in detail: "' + hs.panel.title + '". Context: ' + body.substring(0, 500);
        } else {
          question = 'Explain: ' + args.join(' ') + ' (in context of page ' + page.title + ')';
        }
      } else {
        question = 'Explain the DIME documentation page "' + page.title + '" (page ' + page.id + '). What are the key concepts and how do they relate to each other?';
      }

      streamAiQuestion(question);
    },
    complete: function (partial) {
      return completeHotspotIds(partial);
    }
  });

  // ── review ─────────────────────────────────────────────────────
  registerCommand('review', {
    description: 'AI reviews playground configuration',
    usage: 'review',
    category: 'AI',
    fn: function () {
      var yamlPre = document.getElementById('pg-yaml');
      var raw = yamlPre ? (yamlPre.getAttribute('data-raw') || yamlPre.textContent) : '';
      if (!raw || !raw.trim()) {
        writeDim('Playground is empty. Use "build" to generate a config first.');
        return;
      }
      var question = 'Review this DIME YAML configuration. Check for errors, suggest improvements, and explain what it does:\n\n```yaml\n' + raw + '\n```';
      streamAiQuestion(question);
    }
  });

  // ── theme ──────────────────────────────────────────────────────
  registerCommand('theme', {
    description: 'Switch color theme',
    usage: 'theme <amber|green|white>',
    category: 'System',
    fn: function (args) {
      if (args.length === 0) {
        var current = localStorage.getItem('dime-theme') || 'amber';
        writeLine('Current theme: ' + current);
        writeDim('Available: amber, green, white');
        return;
      }

      var theme = args[0].toLowerCase();
      if (['amber', 'green', 'white'].indexOf(theme) < 0) {
        writeError('Unknown theme: ' + args[0] + '. Options: amber, green, white');
        return;
      }

      // Apply theme
      if (theme === 'amber') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      localStorage.setItem('dime-theme', theme);

      // Update dot indicators
      var dots = document.querySelectorAll('#bottom-controls .dot');
      for (var i = 0; i < dots.length; i++) {
        if (dots[i].getAttribute('data-theme') === theme) {
          dots[i].classList.add('active');
        } else {
          dots[i].classList.remove('active');
        }
      }

      writeLine('Theme set to ' + theme, 'term-line-success');
    },
    complete: function (partial) {
      return completeThemes(partial);
    }
  });

  // ── whoami ─────────────────────────────────────────────────────
  registerCommand('whoami', {
    description: 'Show session statistics',
    usage: 'whoami',
    category: 'System',
    fn: function () {
      writeHeading('SESSION STATS');
      writeLine('  Uptime:             ' + formatUptime());
      writeLine('  Pages visited:      ' + Object.keys(pagesVisited).length);
      writeLine('  Hotspots explored:  ' + Object.keys(hotspotsExplored).length);
      writeLine('  Commands executed:  ' + commandHistory.length);
      writeLine('  Theme:              ' + (localStorage.getItem('dime-theme') || 'amber'));
      var pageId = getCurrentPageId();
      writeLine('  Current page:       ' + (pageId || '(none)'));
      writeDim('  Total pages:        ' + (typeof PAGES !== 'undefined' ? PAGES.length : 0));
    }
  });

  // ── AI helper ──────────────────────────────────────────────────
  function streamAiQuestion(question) {
    if (!window.DIME_CHAT || !window.DIME_CHAT.streamQuestion) {
      writeError('AI not available. Make sure you have a Gemini API key configured in Chat settings.');
      return;
    }

    if (isStreaming) {
      writeError('Already streaming. Press Ctrl+C to cancel.');
      return;
    }

    isStreaming = true;
    writeDim('Thinking...');

    var streamEl = document.createElement('div');
    streamEl.className = 'term-line term-ai-stream';
    outputEl.appendChild(streamEl);

    cancelStream = window.DIME_CHAT.streamQuestion(
      question,
      function onChunk(fullText) {
        streamEl.innerHTML = formatAiOutput(fullText);
        scrollBottom();
      },
      function onDone() {
        isStreaming = false;
        cancelStream = null;
        scrollBottom();
      },
      function onError(err) {
        isStreaming = false;
        cancelStream = null;
        writeError('AI error: ' + (err && err.message ? err.message : 'Unknown error'));
      }
    );
  }

  function formatAiOutput(text) {
    // Simple markdown rendering for AI output
    var html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      return '<pre>' + code + '</pre>';
    });

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings
    html = html.replace(/^### (.+)$/gm, '<strong style="color:var(--cyan)">$1</strong>');
    html = html.replace(/^## (.+)$/gm, '<strong style="color:var(--cyan)">$1</strong>');

    // Bullet lists
    html = html.replace(/^- (.+)$/gm, '<span style="color:var(--cyan)">\u25B8</span> $1');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  // ── Global keyboard ────────────────────────────────────────────
  function handleGlobalKey(e) {
    // Backtick toggle — skip when focus is in input/textarea/select
    if (e.key === '`') {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      toggleTerminal();
    }
  }

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    pane = document.getElementById('term-pane');
    outputEl = document.getElementById('term-output');
    inputEl = document.getElementById('term-input');
    statusEl = document.getElementById('term-status');
    closeBtn = document.getElementById('term-close');
    bubble = document.getElementById('term-bubble');

    if (!pane || !inputEl) return;

    // Event listeners
    inputEl.addEventListener('keydown', handleKeyDown);
    closeBtn.addEventListener('click', closeTerminal);
    if (bubble) bubble.addEventListener('click', toggleTerminal);

    // Global backtick listener
    document.addEventListener('keydown', handleGlobalKey);

    // Track navigation via hashchange
    window.addEventListener('hashchange', trackNavigation);
    trackNavigation(); // track initial page

    // Paste handler — prevent pasting newlines from executing
    inputEl.addEventListener('paste', function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData('text');
      text = text.replace(/[\n\r]/g, ' ').trim();
      inputEl.value = inputEl.value.substring(0, inputEl.selectionStart) +
        text + inputEl.value.substring(inputEl.selectionEnd);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ─────────────────────────────────────────────────
  window.DIME_TERM = {
    open: openTerminal,
    close: closeTerminal,
    exec: function (raw) {
      if (!isOpen) openTerminal();
      inputEl.value = raw;
      handleInput();
    }
  };

})();
