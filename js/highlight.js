(function () {
  'use strict';

  function isScriptKey(key) {
    return key === 'script' || key === 'template' ||
      (key.length > 7 && key.indexOf('_script') === key.length - 7 &&
       key !== 'paths_script' && key !== 'lang_script');
  }

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

      if (raw.trim() === '') {
        if (inBlock) {
          // Blank line inside a block scalar — peek ahead to see if the block continues
          var nextNonEmpty = -1;
          for (var j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() !== '') { nextNonEmpty = j; break; }
          }
          if (nextNonEmpty !== -1 && lines[nextNonEmpty].match(/^(\s*)/)[1].length > blockIndent) {
            // Block continues after blank line(s)
            out.push('');
            continue;
          }
          // Block ends
          inBlock = false;
          isScript = false;
        }
        out.push('');
        continue;
      }

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
          isScript = isScriptKey(m[3]);
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
          isScript = isScriptKey(m[2]);
        }
        continue;
      }
      out.push(esc(raw));
    }
    return out.join('\n');
  }

  // ── YAML Parser (delegates to js-yaml) ────────────────────────

  function parseYaml(text) {
    var result = { app: null, sources: [], sinks: [] };
    var doc;
    try {
      doc = jsyaml.load(text);
    } catch (e) {
      return result;
    }
    if (!doc || typeof doc !== 'object') return result;

    var nextId = 1;

    function normalizeSink(item) {
      if (!item.sink || typeof item.sink !== 'object') {
        item.sink = {};
        return;
      }
      // Flatten mtconnect: {path: "..."} → mtconnect: "..."
      if (item.sink.mtconnect && typeof item.sink.mtconnect === 'object') {
        item.sink.mtconnect = item.sink.mtconnect.path || '';
      }
      // Flatten opcua: {path: "..."} → opcua: "..."
      if (item.sink.opcua && typeof item.sink.opcua === 'object') {
        item.sink.opcua = item.sink.opcua.path || '';
      }
      if (!item.sink.transform || typeof item.sink.transform !== 'object') {
        item.sink.transform = {};
      }
    }

    function processConnectors(arr) {
      if (!Array.isArray(arr)) return [];
      var out = [];
      for (var i = 0; i < arr.length; i++) {
        var c = arr[i];
        if (!c || typeof c !== 'object') continue;
        c._id = nextId++;
        if (!c.items) c.items = [];
        if (Array.isArray(c.items)) {
          for (var j = 0; j < c.items.length; j++) {
            normalizeSink(c.items[j]);
          }
        }
        // Normalize connector-level sink
        if (!c.sink || typeof c.sink !== 'object') c.sink = {};
        if (!c.sink.transform || typeof c.sink.transform !== 'object') c.sink.transform = {};
        out.push(c);
      }
      return out;
    }

    if (doc.app && typeof doc.app === 'object') result.app = doc.app;
    result.sources = processConnectors(doc.sources);
    result.sinks = processConnectors(doc.sinks);
    return result;
  }

  // ── Anchor/Alias Resolution ──────────────────────────────────
  // js-yaml handles &anchors, *aliases, and <<: *merge natively.
  // Keep function signature so callers don't break.

  function resolveAnchors(text) {
    return text;
  }

  window.DIME_HL = {
    esc: esc,
    highlightYaml: highlightYaml,
    highlightCode: highlightCode,
    parseYaml: parseYaml,
    resolveAnchors: resolveAnchors
  };
})();
