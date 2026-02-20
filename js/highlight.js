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
    if (val.trim() === '|') return esc(val.replace('|', '')) + '<span class="y-pipe">|</span>';
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
        if (m[5].trim() === '|') {
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
        if (m[4].trim() === '|') {
          inBlock = true; blockIndent = m[1].length;
          isScript = SCRIPT_KEYS.hasOwnProperty(m[2]);
        }
        continue;
      }
      out.push(esc(raw));
    }
    return out.join('\n');
  }

  window.DIME_HL = {
    esc: esc,
    highlightYaml: highlightYaml,
    highlightCode: highlightCode
  };
})();
