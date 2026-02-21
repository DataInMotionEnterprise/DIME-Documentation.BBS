(function () {
  'use strict';

  var SCRIPT_KEYS = {
    'init_script':1, 'deinit_script':1, 'enter_script':1,
    'exit_script':1, 'item_script':1, 'script':1, 'paths_script':1
  };

  var LUA_KW = /\b(and|break|do|else|elseif|end|for|function|goto|if|in|local|not|or|repeat|return|then|until|while|nil|true|false)\b/g;
  var PY_KW = /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|None|True|False)\b/g;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightCode(line, lang) {
    var indent = line.match(/^(\s*)/)[1];
    var code = line.substring(indent.length);
    if (code === '') return esc(indent);

    var tokens = [];
    var commentChar = lang === 'python' ? '#' : '--';
    var re = lang === 'python'
      ? /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#.*$)/gm
      : /(\[\[[\s\S]*?\]\]|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|--.*$)/gm;
    var last = 0;
    var match;
    while ((match = re.exec(code)) !== null) {
      if (match.index > last) tokens.push({ type: 'code', text: code.substring(last, match.index) });
      var t = match[1];
      if (t.charAt(0) === commentChar.charAt(0) && t.substring(0, commentChar.length) === commentChar) {
        tokens.push({ type: 'comment', text: t });
      } else {
        tokens.push({ type: 'string', text: t });
      }
      last = re.lastIndex;
    }
    if (last < code.length) tokens.push({ type: 'code', text: code.substring(last) });

    var html = esc(indent);
    var kwRe = lang === 'python' ? PY_KW : LUA_KW;
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (tok.type === 'comment') {
        html += '<span class="y-cmt">' + esc(tok.text) + '</span>';
      } else if (tok.type === 'string') {
        html += '<span class="y-slit">' + esc(tok.text) + '</span>';
      } else {
        var seg = esc(tok.text);
        seg = seg.replace(kwRe, '<span class="y-kw">$1</span>');
        seg = seg.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="y-num">$1</span>');
        html += seg;
      }
    }
    return html;
  }

  function highlightValue(val) {
    if (val.trim() === '') return esc(val);
    if (val.trim() === '|' || val.trim() === '>' || val.trim() === '|-' || val.trim() === '>-')
      return esc(val.replace(/[|>][-]?/, '')) + '<span class="y-pipe">' + esc(val.trim()) + '</span>';
    // YAML type tag (!!int, !!bool, !!str, etc.) optionally followed by a value
    var tagMatch = val.match(/^(\s*)(!![\w]+)(.*)$/);
    if (tagMatch) {
      var rest = tagMatch[3].trim() === '' ? esc(tagMatch[3]) : highlightValue(tagMatch[3]);
      return esc(tagMatch[1]) + '<span class="y-tag">' + esc(tagMatch[2]) + '</span>' + rest;
    }
    if (/^\s+-?\d+(\.\d+)?\s*$/.test(val)) return '<span class="y-num">' + esc(val) + '</span>';
    if (/^\s+(true|false)\s*$/i.test(val)) return '<span class="y-bool">' + esc(val) + '</span>';
    var cm = val.match(/^(.+?)(\s+#.*)$/);
    if (cm) return '<span class="y-str">' + esc(cm[1]) + '</span><span class="y-comment">' + esc(cm[2]) + '</span>';
    return '<span class="y-str">' + esc(val) + '</span>';
  }

  function highlightYaml(text) {
    var lines = text.split('\n');
    var out = [];
    var inBlock = false;
    var blockIndent = 0;
    var isScript = false;
    var currentLang = 'lua';

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];

      if (raw.trim() === '') { out.push(''); inBlock = false; isScript = false; continue; }

      if (inBlock) {
        var spaces = raw.match(/^(\s*)/)[1].length;
        if (spaces > blockIndent) {
          if (isScript) {
            out.push(highlightCode(raw, currentLang));
          } else {
            out.push('<span class="y-str">' + esc(raw) + '</span>');
          }
          continue;
        }
        inBlock = false;
        isScript = false;
      }

      if (/^\s*- name:/.test(raw)) { currentLang = 'lua'; }

      var langMatch = raw.match(/lang_script:\s*(Lua|Python)\s*$/i);
      if (langMatch) { currentLang = langMatch[1].toLowerCase(); }

      var m;
      if ((m = raw.match(/^(\s*)(#.*)$/))) {
        out.push(esc(m[1]) + '<span class="y-comment">' + esc(m[2]) + '</span>');
        continue;
      }
      if ((m = raw.match(/^(\s*)(- )([a-zA-Z_][a-zA-Z0-9_]*)(:)(.*)$/))) {
        out.push(esc(m[1]) + '<span class="y-bullet">' + esc(m[2]) + '</span>' +
          '<span class="y-key">' + esc(m[3]) + '</span><span class="y-colon">' + esc(m[4]) + '</span>' +
          highlightValue(m[5]));
        if (/^[|>][-]?\s*$/.test(m[5].trim())) {
          inBlock = true; blockIndent = m[1].length;
          isScript = SCRIPT_KEYS.hasOwnProperty(m[3]);
        }
        continue;
      }
      if ((m = raw.match(/^(\s*)(- )(.*)$/))) {
        out.push(esc(m[1]) + '<span class="y-bullet">' + esc(m[2]) + '</span>' +
          highlightValue(' ' + m[3]));
        continue;
      }
      if ((m = raw.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)(:)(.*)$/))) {
        out.push(esc(m[1]) + '<span class="y-key">' + esc(m[2]) + '</span><span class="y-colon">' + esc(m[3]) + '</span>' +
          highlightValue(m[4]));
        if (/^[|>][-]?\s*$/.test(m[4].trim())) {
          inBlock = true; blockIndent = m[1].length;
          isScript = SCRIPT_KEYS.hasOwnProperty(m[2]);
        }
        continue;
      }
      out.push(esc(raw));
    }
    return out.join('\n');
  }

  // ── YAML Parser (DIME config subset) ──────────────────────────

  function parseYaml(text) {
    var lines = text.split('\n');
    var result = { sources: [], sinks: [] };
    var section = '';
    var connIndent = -1;
    var current = null;
    var inItems = false;
    var itemsIndent = -1;
    var currentItem = null;
    var blockKey = '';
    var blockIndent = -1;
    var blockLines = [];
    var inSinkOverride = '';
    var nextId = 1;
    var listKey = '';       // key collecting bare list items (e.g. exclude_filter)
    var listTarget = null;  // object the list is being attached to

    function flushBlock() {
      if (blockKey && current) {
        var target = inItems && currentItem ? currentItem : current;
        target[blockKey] = blockLines.join('\n');
      }
      blockKey = '';
      blockIndent = -1;
      blockLines = [];
    }

    function flushList() {
      listKey = '';
      listTarget = null;
    }

    // Strip !!type tags and coerce values
    function coerceVal(v) {
      var tagMatch = v.match(/^!!(bool|int|float|str)\s+(.*)/);
      if (!tagMatch) return v;
      var tag = tagMatch[1];
      var rest = tagMatch[2];
      if (tag === 'bool') return /^true$/i.test(rest);
      if (tag === 'int') return parseInt(rest, 10);
      if (tag === 'float') return parseFloat(rest);
      return rest; // !!str
    }

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var trimmed = raw.trim();
      var indent = raw.match(/^(\s*)/)[1].length;

      if (trimmed === '' || trimmed.charAt(0) === '#') {
        if (blockKey && indent > blockIndent) blockLines.push(raw.substring(blockIndent + 2));
        continue;
      }

      if (blockKey && indent > blockIndent) {
        blockLines.push(raw.substring(blockIndent + 2));
        continue;
      }
      if (blockKey) flushBlock();

      // Collect bare list items: "- value" lines for a pending list key
      if (listKey && listTarget) {
        var bareItem = trimmed.match(/^-\s+(.+)$/);
        if (bareItem && !trimmed.match(/^- [a-zA-Z_]\w*:\s/)) {
          var itemVal = bareItem[1].replace(/\s+#.*$/, '').replace(/^['"]|['"]$/g, '');
          listTarget[listKey].push(itemVal);
          continue;
        }
        flushList();
      }

      if (indent === 0 && trimmed === 'sources:') { section = 'sources'; inItems = false; current = null; connIndent = -1; continue; }
      if (indent === 0 && trimmed === 'sinks:') { section = 'sinks'; inItems = false; current = null; connIndent = -1; continue; }
      if (indent === 0 && trimmed === 'app:') { section = 'app'; continue; }
      if (section === 'app') continue;
      if (section !== 'sources' && section !== 'sinks') continue;

      var listKv = trimmed.match(/^- ([a-zA-Z_]\w*):\s*(.*)$/);

      if (listKv && listKv[1] === 'name') {
        if (inItems && connIndent >= 0 && indent > connIndent) {
          flushBlock();
          inSinkOverride = '';
          currentItem = { name: listKv[2].replace(/^['"]|['"]$/g, '') };
          current.items.push(currentItem);
          continue;
        }
        flushBlock();
        inItems = false;
        inSinkOverride = '';
        currentItem = null;
        connIndent = indent;
        current = { _id: nextId++, name: listKv[2].replace(/^['"]|['"]$/g, ''), items: [] };
        result[section].push(current);
        continue;
      }

      if (listKv && inItems && currentItem) {
        currentItem[listKv[1]] = listKv[2].replace(/^['"]|['"]$/g, '');
        continue;
      }

      if (!current) continue;

      if (inItems && connIndent >= 0 && indent <= connIndent + 2) {
        inItems = false;
        currentItem = null;
        inSinkOverride = '';
      }

      if (trimmed === 'items:') { inItems = true; itemsIndent = indent; currentItem = null; inSinkOverride = ''; continue; }

      if (inItems && currentItem) {
        if (trimmed === 'sink:') { inSinkOverride = 'sink'; continue; }
        if (trimmed === 'mtconnect:') { inSinkOverride = 'mtconnect'; continue; }
        if (trimmed === 'opcua:') { inSinkOverride = 'opcua'; continue; }
        if (trimmed === 'transform:') { inSinkOverride = 'transform'; continue; }
      }

      var kv = trimmed.match(/^([a-zA-Z_]\w*):\s*(.*)$/);
      if (!kv) continue;

      var key = kv[1];
      var val = kv[2];

      // Strip inline comments (but not inside quoted strings)
      if (!/^['"]/.test(val)) {
        val = val.replace(/\s+#.*$/, '');
      }

      if (val === '|' || val === '>' || val === '|-' || val === '>-') {
        blockKey = key;
        blockIndent = indent;
        blockLines = [];
        if (inItems && currentItem && inSinkOverride === 'transform') {
          blockKey = '_sink_transform_template';
        }
        continue;
      }

      val = val.replace(/^['"]|['"]$/g, '');

      // Empty value → start collecting bare list items on next lines
      // Skip known nested-object keys that aren't lists
      if (val === '' && current && key !== 'sink' && key !== 'items') {
        var target = (inItems && currentItem) ? currentItem : current;
        target[key] = [];
        listKey = key;
        listTarget = target;
        continue;
      }

      val = coerceVal(val);

      if (inItems && currentItem) {
        if (inSinkOverride === 'mtconnect') {
          if (key === 'path') currentItem._sink_mtconnect_path = val;
          continue;
        }
        if (inSinkOverride === 'opcua') {
          if (key === 'path') currentItem._sink_opcua_path = val;
          continue;
        }
        if (inSinkOverride === 'transform') {
          if (key === 'type') currentItem._sink_transform_type = val;
          else if (key === 'template') currentItem._sink_transform_template = val;
          continue;
        }
        if (inSinkOverride === 'sink') {
          if (key === 'mtconnect') { inSinkOverride = 'mtconnect'; continue; }
          if (key === 'opcua') { inSinkOverride = 'opcua'; continue; }
          if (key === 'transform') { inSinkOverride = 'transform'; continue; }
          continue;
        }
        currentItem[key] = val;
      } else if (current) {
        inSinkOverride = '';
        if (key === 'sink') continue;
        current[key] = val;
      }
    }
    flushBlock();
    flushList();
    return result;
  }

  // ── Anchor/Alias Resolution (multi-file DIME configs) ──────

  function resolveAnchors(text) {
    var lines = text.split('\n');
    var anchors = {};  // anchorName → { lines: [...], baseIndent: N }

    // Pass 1: find anchor definitions and capture their blocks
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      var anchorName = null;
      var defIndent = 0;
      var m = line.match(/^(\s*)([a-zA-Z_][\w-]*):\s+&([\w-]+)\s*$/);
      if (m) {
        anchorName = m[3];
        defIndent = m[1].length;
      } else {
        var m2 = line.match(/^(\s*)-\s+&([\w-]+)\s*$/);
        if (m2) { anchorName = m2[2]; defIndent = m2[1].length; }
      }
      if (anchorName) {
        var blockLines = [];
        var j = i + 1;
        while (j < lines.length) {
          var sub = lines[j];
          if (sub.trim() === '') { j++; continue; }
          var subIndent = sub.match(/^(\s*)/)[1].length;
          if (subIndent <= defIndent) break;
          blockLines.push(sub);
          j++;
        }
        anchors[anchorName] = { lines: blockLines, baseIndent: defIndent + 2 };
        i = j;
        continue;
      }
      // Also handle inline anchor on key-value: key: &anchor value
      var mv = line.match(/^(\s*)([a-zA-Z_][\w-]*):\s+&([\w-]+)\s+(.+)$/);
      if (mv) {
        anchors[mv[3]] = { value: mv[4], lines: [], baseIndent: 0 };
      }
      i++;
    }

    // Pass 2: resolve alias references
    var out = [];
    for (i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      // List alias: "- *anchorName"
      var la = trimmed.match(/^-\s+\*([\w-]+)\s*$/);
      if (la && anchors[la[1]]) {
        var alias = anchors[la[1]];
        var listIndent = line.match(/^(\s*)/)[1].length;
        if (alias.lines.length > 0) {
          // Expand block under list item
          var rebase = listIndent + 2;
          for (var k = 0; k < alias.lines.length; k++) {
            var srcLine = alias.lines[k];
            var srcIndent = srcLine.match(/^(\s*)/)[1].length;
            var relative = srcIndent - alias.baseIndent;
            var newIndent = rebase + Math.max(0, relative);
            var prefix = '';
            for (var p = 0; p < newIndent; p++) prefix += ' ';
            var content = srcLine.trim();
            if (k === 0) {
              out.push(line.match(/^(\s*)/)[1] + '- ' + content);
            } else {
              out.push(prefix + content);
            }
          }
        } else if (alias.value) {
          out.push(line.replace('*' + la[1], alias.value));
        } else {
          out.push(line);
        }
        continue;
      }

      // Inline alias in value: "key: *anchorName"
      var iv = line.match(/^(\s*)([a-zA-Z_][\w-]*):\s+\*([\w-]+)\s*$/);
      if (iv && anchors[iv[3]]) {
        var a = anchors[iv[3]];
        if (a.value) {
          out.push(iv[1] + iv[2] + ': ' + a.value);
        } else if (a.lines.length > 0) {
          out.push(iv[1] + iv[2] + ':');
          var base = iv[1].length + 2;
          for (var k2 = 0; k2 < a.lines.length; k2++) {
            var sl = a.lines[k2];
            var si = sl.match(/^(\s*)/)[1].length;
            var rel = si - a.baseIndent;
            var ni = base + Math.max(0, rel);
            var pfx = '';
            for (var p2 = 0; p2 < ni; p2++) pfx += ' ';
            out.push(pfx + sl.trim());
          }
        } else {
          out.push(line);
        }
        continue;
      }

      out.push(line);
    }

    return out.join('\n');
  }

  window.DIME_HL = {
    esc: esc,
    highlightYaml: highlightYaml,
    highlightCode: highlightCode,
    parseYaml: parseYaml,
    resolveAnchors: resolveAnchors
  };
})();
