(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────
  var GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
  var MODELS = [
    { id: 'gemini-3-flash-preview',     name: '3.0 Flash' },
    { id: 'gemini-3-pro-preview',       name: '3.0 Pro' },
    { id: 'gemini-3.1-pro-preview',     name: '3.1 Pro' }
  ];

  var SYSTEM_PROMPT =
    'You are DIME AI, an expert assistant for the DIME (Data In Motion Enterprise) ' +
    'data integration platform. You help users understand DIME concepts, write YAML ' +
    'configurations, and troubleshoot their setups.\n\n' +
    'The complete DIME documentation has been provided to you as context. Use it to ' +
    'give accurate, specific answers grounded in the documentation.\n\n' +
    'Guidelines:\n' +
    '- When referencing documentation pages, mention their page IDs (e.g. REF18, EX05) ' +
    'so users can navigate to them in the documentation browser.\n' +
    '- When generating YAML configurations, use proper DIME YAML structure with ' +
    'sources and sinks. Include comments explaining key settings. Use YAML anchors ' +
    '(&/*) where appropriate.\n' +
    '- Keep answers concise and technical. Use markdown formatting.\n' +
    '- Use fenced code blocks (```yaml) for YAML examples.\n' +
    '- If you are unsure about something, say so rather than guessing.';

  // ── State ──────────────────────────────────────────────────────
  var apiKey = localStorage.getItem('dime-gemini-key') || '';
  var chatHistory = loadHistory();
  var selectedModel = localStorage.getItem('dime-chat-model') || MODELS[0].id;
  var llmsContent = null;
  var cacheName = null;
  var cacheModel = null;
  var isStreaming = false;
  var abortCtrl = null;
  var stagedFiles = []; // [{ name, base64, mimeType }, ...]
  var MAX_FILES = 5;

  // Build valid page ID set
  var validPageIds = {};
  if (typeof PAGES !== 'undefined') {
    for (var i = 0; i < PAGES.length; i++) {
      validPageIds[PAGES[i].id] = true;
    }
  }

  // ── Storage helpers ────────────────────────────────────────────
  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('dime-chat-history') || '[]');
    } catch (e) { return []; }
  }

  function saveHistory() {
    localStorage.setItem('dime-chat-history', JSON.stringify(chatHistory));
  }

  function saveModel() {
    localStorage.setItem('dime-chat-model', selectedModel);
  }

  // ── Page context ───────────────────────────────────────────────
  function getCurrentPage() {
    var hash = window.location.hash;
    var match = hash.match(/^#page-([\w]+)/);
    if (!match || typeof PAGES === 'undefined') return null;
    var id = match[1];
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].id === id) return PAGES[i];
    }
    return null;
  }

  // ── Escape HTML ────────────────────────────────────────────────
  function esc(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Markdown renderer ─────────────────────────────────────────
  function renderInline(text) {
    var h = esc(text);
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    h = h.replace(/\b(REF\d{1,2}|EX\d{1,2})\b/g, function (m) {
      if (validPageIds[m]) {
        return '<a class="chat-page-link" href="#page-' + m + '">' + m + '</a>';
      }
      return m;
    });
    h = h.replace(/\bPage\s+(\d{2})\b/g, function (full, num) {
      if (validPageIds[num]) {
        return '<a class="chat-page-link" href="#page-' + num + '">' + full + '</a>';
      }
      return full;
    });
    return h;
  }

  function renderMarkdown(text) {
    var lines = text.split('\n');
    var html = '';
    var inCode = false;
    var codeContent = '';
    var codeLang = '';
    var inList = false;
    var listTag = '';
    var inTable = false;
    var tableRows = [];

    function flushTable() {
      if (tableRows.length < 2) {
        // Not enough rows for a real table — render as paragraphs
        for (var t = 0; t < tableRows.length; t++) {
          html += '<p>' + renderInline(tableRows[t]) + '</p>';
        }
      } else {
        html += '<table>';
        var headerDone = false;
        for (var t = 0; t < tableRows.length; t++) {
          var row = tableRows[t].trim();
          // Skip separator row
          if (/^\|[\s:|-]+\|?\s*$/.test(row)) { headerDone = true; continue; }
          var cells = row.replace(/^\|/, '').replace(/\|$/, '').split('|');
          var tag = !headerDone ? 'th' : 'td';
          html += '<tr>';
          for (var c = 0; c < cells.length; c++) {
            html += '<' + tag + '>' + renderInline(cells[c].trim()) + '</' + tag + '>';
          }
          html += '</tr>';
        }
        html += '</table>';
      }
      inTable = false;
      tableRows = [];
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Code fence (allow leading whitespace)
      if (/^\s*```/.test(line)) {
        if (inTable) flushTable();
        if (!inCode) {
          if (inList) { html += '</' + listTag + '>'; inList = false; }
          inCode = true;
          codeContent = '';
          codeLang = (line.match(/```(\w+)/) || [])[1] || '';
        } else {
          var isYaml = (codeLang === 'yaml' || codeLang === 'yml');
          var highlighted = isYaml && window.DIME_HL
            ? window.DIME_HL.highlightYaml(codeContent)
            : esc(codeContent);
          var pgBtn = isYaml && window.DIME_PG
            ? '<button class="chat-code-playground" title="Load in Playground">&#x25B6; Playground</button>'
            : '';
          html += '<div class="chat-code-wrap"><button class="chat-code-copy">Copy</button>' +
            pgBtn + '<pre class="chat-code">' + highlighted + '</pre></div>';
          inCode = false;
        }
        continue;
      }

      if (inCode) {
        codeContent += (codeContent ? '\n' : '') + line;
        continue;
      }

      // Table row detection — line contains | and starts with |
      var trimmed = line.trim();
      if (trimmed.indexOf('|') >= 0 && /^\|/.test(trimmed)) {
        if (inList) { html += '</' + listTag + '>'; inList = false; }
        inTable = true;
        tableRows.push(trimmed);
        continue;
      }

      // Empty line — keep table open across blanks
      if (trimmed === '') {
        if (inList) { html += '</' + listTag + '>'; inList = false; }
        continue;
      }

      // Non-table, non-empty line — flush any pending table
      if (inTable) flushTable();

      // Bullet list
      var bulletMatch = line.match(/^\s*[-*]\s+(.*)/);
      if (bulletMatch) {
        if (!inList || listTag !== 'ul') {
          if (inList) html += '</' + listTag + '>';
          html += '<ul>';
          inList = true;
          listTag = 'ul';
        }
        html += '<li>' + renderInline(bulletMatch[1]) + '</li>';
        continue;
      }

      // Numbered list
      var numMatch = line.match(/^\s*\d+\.\s+(.*)/);
      if (numMatch) {
        if (!inList || listTag !== 'ol') {
          if (inList) html += '</' + listTag + '>';
          html += '<ol>';
          inList = true;
          listTag = 'ol';
        }
        html += '<li>' + renderInline(numMatch[1]) + '</li>';
        continue;
      }

      // Close list if switching to non-list content
      if (inList) { html += '</' + listTag + '>'; inList = false; }

      // Header
      var hdrMatch = line.match(/^(#{1,4})\s+(.*)/);
      if (hdrMatch) {
        var lvl = Math.min(hdrMatch[1].length + 2, 6);
        html += '<h' + lvl + '>' + renderInline(hdrMatch[2]) + '</h' + lvl + '>';
        continue;
      }

      // Regular line
      html += '<p>' + renderInline(line) + '</p>';
    }

    // Close any open constructs
    if (inCode) {
      var trailIsYaml = (codeLang === 'yaml' || codeLang === 'yml');
      var trailingHl = trailIsYaml && window.DIME_HL
        ? window.DIME_HL.highlightYaml(codeContent)
        : esc(codeContent);
      var trailPgBtn = trailIsYaml && window.DIME_PG
        ? '<button class="chat-code-playground" title="Load in Playground">&#x25B6; Playground</button>'
        : '';
      html += '<div class="chat-code-wrap"><button class="chat-code-copy">Copy</button>' +
        trailPgBtn + '<pre class="chat-code">' + trailingHl + '</pre></div>';
    }
    if (inTable) flushTable();
    if (inList) html += '</' + listTag + '>';

    return html;
  }

  // ── DOM refs (set during init) ─────────────────────────────────
  var bubble, pane, resizeHandle, messagesEl, tokenBar;
  var chatInput, sendBtn, modelSelect, newBtn, settingsBtn, closeBtn;
  var settingsEl, keyInput, keyToggle, keySave, keyCancel;
  var attachBtn, fileInput, filePreview;

  // ── UI: Toggle pane ────────────────────────────────────────────
  function openPane() {
    pane.classList.add('open');
    document.getElementById('shell').classList.add('chat-open');
    if (!apiKey) openSettings();
    chatInput.focus();
    scrollToBottom();
  }

  function closePane() {
    pane.classList.remove('open');
    document.getElementById('shell').classList.remove('chat-open');
  }

  // ── UI: Resize ─────────────────────────────────────────────────
  function initResize() {
    var dragging = false;

    resizeHandle.addEventListener('mousedown', function (e) {
      e.preventDefault();
      dragging = true;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var h = Math.max(200, Math.min(window.innerHeight - 80, window.innerHeight - e.clientY));
      document.documentElement.style.setProperty('--chat-h', h + 'px');
    });

    document.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }

  // ── UI: Settings ───────────────────────────────────────────────
  function openSettings() {
    keyInput.value = apiKey;
    settingsEl.classList.add('open');
    keyInput.focus();
  }

  function closeSettings() {
    settingsEl.classList.remove('open');
  }

  function saveSettings() {
    apiKey = keyInput.value.trim();
    localStorage.setItem('dime-gemini-key', apiKey);
    closeSettings();
  }

  function toggleKeyVisibility() {
    if (keyInput.type === 'password') {
      keyInput.type = 'text';
      keyToggle.textContent = 'Hide';
    } else {
      keyInput.type = 'password';
      keyToggle.textContent = 'Show';
    }
  }

  // ── UI: Messages ───────────────────────────────────────────────
  function isNearBottom() {
    return messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 50;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUserMessage(text) {
    var div = document.createElement('div');
    div.className = 'chat-msg chat-user';
    div.innerHTML = '<span class="chat-role">YOU:</span><div class="chat-user-text">' + esc(text) + '</div>';
    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function addAiMessage() {
    var div = document.createElement('div');
    div.className = 'chat-msg chat-ai';
    div.innerHTML = '<span class="chat-role">AI:</span><div class="chat-ai-content"></div>';
    messagesEl.appendChild(div);
    scrollToBottom();
    return div.querySelector('.chat-ai-content');
  }

  function addStatusMessage(text, cls) {
    var div = document.createElement('div');
    div.className = cls || 'chat-status';
    div.textContent = text;
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function addCopyResponseButtons() {
    var aiMsgs = messagesEl.querySelectorAll('.chat-ai');
    for (var i = 0; i < aiMsgs.length; i++) {
      if (!aiMsgs[i].querySelector('.chat-copy-msg')) {
        var btn = document.createElement('button');
        btn.className = 'chat-copy-msg';
        btn.textContent = 'Copy';
        aiMsgs[i].appendChild(btn);
      }
    }
  }

  function restoreMessages() {
    messagesEl.innerHTML = '';
    for (var i = 0; i < chatHistory.length; i++) {
      var msg = chatHistory[i];
      // Concatenate all text parts (skips any inlineData parts)
      var text = '';
      for (var p = 0; p < msg.parts.length; p++) {
        if (msg.parts[p].text) text += msg.parts[p].text;
      }
      if (msg.role === 'user') {
        var displayText = text.replace(/^\[Currently viewing:.*?\]\n\n/, '');
        addUserMessage(displayText);
      } else {
        var contentDiv = addAiMessage();
        contentDiv.innerHTML = renderMarkdown(text);
      }
    }
    addCopyResponseButtons();
    scrollToBottom();
  }

  // ── Gemini API ─────────────────────────────────────────────────
  function fetchLlmsContent(signal) {
    if (llmsContent) return Promise.resolve(llmsContent);
    return fetch('llms-full.txt', { signal: signal }).then(function (resp) {
      if (!resp.ok) throw new Error('Failed to load documentation (' + resp.status + ')');
      return resp.text();
    }).then(function (text) {
      llmsContent = text;
      return text;
    });
  }

  function createCache(signal) {
    return fetchLlmsContent(signal).then(function (docs) {
      return fetch(GEMINI_BASE + '/cachedContents?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/' + selectedModel,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            { role: 'user', parts: [{ text: 'Here is the complete DIME documentation for reference:\n\n' + docs }] },
            { role: 'model', parts: [{ text: 'I have the complete DIME documentation loaded. I can help you understand DIME concepts, write YAML configurations, troubleshoot setups, and answer any questions about the platform. What would you like to know?' }] }
          ],
          ttl: '3600s'
        }),
        signal: signal
      });
    }).then(function (resp) {
      if (!resp.ok) {
        return resp.json().catch(function () { return {}; }).then(function (err) {
          throw new Error(err.error ? err.error.message : 'Cache creation failed (' + resp.status + ')');
        });
      }
      return resp.json();
    }).then(function (data) {
      cacheName = data.name;
      cacheModel = selectedModel;
      return cacheName;
    });
  }

  function ensureContext(signal) {
    if (cacheName && cacheModel === selectedModel) {
      return Promise.resolve({ type: 'cached', name: cacheName });
    }
    return createCache(signal).then(function () {
      return { type: 'cached', name: cacheName };
    });
  }

  function streamChat(contents, context, onChunk, signal) {
    var url = GEMINI_BASE + '/models/' + selectedModel + ':streamGenerateContent?alt=sse&key=' + apiKey;

    var body = { cachedContent: context.name, contents: contents };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: signal
    }).then(function (resp) {
      if (!resp.ok) {
        return resp.json().catch(function () { return {}; }).then(function (errData) {
          var errMsg = errData.error ? errData.error.message : 'API error';
          if (resp.status === 401) throw { status: 401, message: 'Invalid API key. Check your key in settings.' };
          if (resp.status === 429) throw { status: 429, message: 'Rate limited. Try again in a moment.' };
          if (resp.status === 503) throw { status: 503, message: 'Model is busy (high demand). Try again shortly or switch models.' };
          if (resp.status === 400 && errMsg.indexOf('cachedContent') >= 0) {
            cacheName = null;
            cacheModel = null;
            throw { status: 400, message: 'RETRY', retry: true };
          }
          throw { status: resp.status, message: errMsg };
        });
      }

      var reader = resp.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';
      var fullText = '';

      function readChunk() {
        return reader.read().then(function (result) {
          if (result.done) return fullText;

          buf += decoder.decode(result.value, { stream: true });
          var parts = buf.split('\n');
          buf = parts.pop();

          for (var i = 0; i < parts.length; i++) {
            var line = parts[i].trim();
            if (!line.startsWith('data:')) continue;
            var json = line.slice(5).trim();
            if (json === '[DONE]') continue;

            try {
              var data = JSON.parse(json);
              if (data.candidates && data.candidates[0] &&
                  data.candidates[0].content && data.candidates[0].content.parts) {
                var t = data.candidates[0].content.parts[0].text;
                if (t) {
                  fullText += t;
                  onChunk(fullText);
                }
              }
            } catch (e) { /* ignore parse errors */ }
          }

          return readChunk();
        });
      }

      return readChunk();
    });
  }

  // ── File attachment ────────────────────────────────────────────
  var MAX_FILE_SIZE = 1024 * 1024; // 1MB

  function stageFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      addStatusMessage('Only PDF files are supported.', 'chat-error');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      addStatusMessage('File too large. Maximum size is 1MB per file.', 'chat-error');
      return;
    }
    if (stagedFiles.length >= MAX_FILES) {
      addStatusMessage('Maximum ' + MAX_FILES + ' files per message.', 'chat-error');
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var base64 = reader.result.split(',')[1];
      stagedFiles.push({ name: file.name, base64: base64, mimeType: 'application/pdf' });
      showFilePreview();
      chatInput.focus();
    };
    reader.readAsDataURL(file);
  }

  function removeStagedFile(index) {
    stagedFiles.splice(index, 1);
    showFilePreview();
  }

  function clearStagedFiles() {
    stagedFiles = [];
    fileInput.value = '';
    filePreview.innerHTML = '';
    filePreview.style.display = 'none';
  }

  function showFilePreview() {
    fileInput.value = '';
    if (!stagedFiles.length) {
      filePreview.innerHTML = '';
      filePreview.style.display = 'none';
      return;
    }
    filePreview.style.display = 'flex';
    var html = '';
    for (var i = 0; i < stagedFiles.length; i++) {
      html += '<span class="chat-file-chip" data-idx="' + i + '">' +
        '<span class="chat-file-icon">&#x1F4C4;</span>' +
        '<span class="chat-file-name">' + esc(stagedFiles[i].name) + '</span>' +
        '<button class="chat-file-remove" title="Remove">&times;</button>' +
        '</span>';
    }
    filePreview.innerHTML = html;
    var removeBtns = filePreview.querySelectorAll('.chat-file-remove');
    for (var j = 0; j < removeBtns.length; j++) {
      (function (idx) {
        removeBtns[idx].addEventListener('click', function () { removeStagedFile(idx); });
      })(j);
    }
  }

  // ── Send message ───────────────────────────────────────────────
  function sendMessage() {
    var text = chatInput.value.trim();
    if ((!text && !stagedFiles.length) || isStreaming) return;

    if (!apiKey) {
      openSettings();
      return;
    }

    // Capture staged files before clearing
    var pendingFiles = stagedFiles.slice();

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    clearStagedFiles();

    // Build user message with page context
    var apiText = text || '';
    var page = getCurrentPage();
    if (page) {
      apiText = '[Currently viewing: ' + page.title + ' (page ' + page.id + ')]\n\n' + apiText;
    }

    // Build parts array for API
    var parts = [];
    var displayText = text || '';
    var fileLabel = '';
    for (var f = 0; f < pendingFiles.length; f++) {
      parts.push({ inlineData: { mimeType: pendingFiles[f].mimeType, data: pendingFiles[f].base64 } });
      fileLabel += '[PDF: ' + pendingFiles[f].name + ']\n';
    }
    if (fileLabel) displayText = fileLabel + displayText;
    if (apiText) parts.push({ text: apiText });
    if (!parts.length) return;

    // Add to history (with inline data for this request) and display
    chatHistory.push({ role: 'user', parts: parts });
    addUserMessage(displayText);

    // Status indicator with thinking effects
    var statusDiv = addStatusMessage('Loading context...');
    startThinking(statusDiv, 'Loading context...');

    isStreaming = true;
    sendBtn.textContent = 'Stop';
    chatInput.disabled = true;
    abortCtrl = new AbortController();
    var signal = abortCtrl.signal;

    var aiContentDiv = null;

    ensureContext(signal).then(function (context) {
      updateThinkingText('Generating...');

      // Keep scramble running — it stops on first stream chunk
      var firstChunk = true;
      return streamChat(chatHistory, context, function (partialText) {
        if (firstChunk) {
          firstChunk = false;
          stopThinking();
          if (statusDiv.parentNode) messagesEl.removeChild(statusDiv);
          aiContentDiv = addAiMessage();
        }
        var wasNear = isNearBottom();
        aiContentDiv.innerHTML = renderMarkdown(partialText);
        if (wasNear) scrollToBottom();
      }, signal);
    }).then(function (fullText) {
      // Final render
      aiContentDiv.innerHTML = renderMarkdown(fullText);

      // Replace inlineData in the user message with text placeholders
      // so we don't re-send base64 blobs in every subsequent turn
      if (pendingFiles.length) {
        var userMsg = chatHistory[chatHistory.length - 1];
        if (userMsg.role === 'user') {
          var newParts = [];
          var fileIdx = 0;
          for (var p = 0; p < userMsg.parts.length; p++) {
            if (userMsg.parts[p].inlineData) {
              var fname = fileIdx < pendingFiles.length ? pendingFiles[fileIdx].name : 'file';
              newParts.push({ text: '[Attached PDF: ' + fname + ']\n' });
              fileIdx++;
            } else {
              newParts.push(userMsg.parts[p]);
            }
          }
          userMsg.parts = newParts;
        }
      }

      // Add to history
      chatHistory.push({ role: 'model', parts: [{ text: fullText }] });
      saveHistory();

      addCopyResponseButtons();
      scrollToBottom();
      updateTokenBar();
    }).catch(function (err) {
      // Clean up thinking effects and status
      stopThinking();
      if (statusDiv.parentNode) messagesEl.removeChild(statusDiv);

      if (err && err.retry) {
        // Cache was invalid — defer retry so finally block cleans up first
        chatHistory.pop();
        setTimeout(function () {
          chatInput.value = text;
          sendMessage();
        }, 0);
        return;
      }

      if (err && err.name === 'AbortError') {
        // User stopped streaming — only save if history still has the pending user msg
        if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
          if (aiContentDiv && aiContentDiv.textContent) {
            chatHistory.push({ role: 'model', parts: [{ text: aiContentDiv.textContent }] });
          } else {
            chatHistory.pop();
          }
          saveHistory();
          addCopyResponseButtons();
        }
      } else {
        var errMsg = (err && err.message) ? err.message : 'An error occurred';
        addStatusMessage(errMsg, 'chat-error');
        chatHistory.pop();
        saveHistory();
        if (err && err.status === 401) openSettings();
      }
    }).finally(function () {
      isStreaming = false;
      abortCtrl = null;
      sendBtn.textContent = 'Send';
      chatInput.disabled = false;
      chatInput.focus();
    });
  }

  function stopStreaming() {
    if (abortCtrl) abortCtrl.abort();
  }

  // ── New conversation ───────────────────────────────────────────
  function addWelcomeMessage() {
    var div = document.createElement('div');
    div.className = 'chat-msg chat-ai chat-welcome';
    div.innerHTML = '<span class="chat-role">AI:</span><div class="chat-ai-content">' +
      'Don\'t forget, you can always contact <a href="https://chrismisztur.com" target="_blank" rel="noopener">chrismisztur.com</a> ' +
      'for expert human help.</div>';
    messagesEl.appendChild(div);
  }

  function newConversation() {
    if (isStreaming) stopStreaming();
    clearStagedFiles();
    chatHistory = [];
    saveHistory();
    cacheName = null;
    cacheModel = null;
    messagesEl.innerHTML = '';
    addWelcomeMessage();
    updateTokenBar();
  }

  // ── Thinking effects ────────────────────────────────────────────
  var SCRAMBLE_CHARS = '░▒▓█▄▀─│┌┐└┘├┤┬┴┼■□●○@#$%&*!?~^';
  var scrambleInterval = null;
  var scrambleEl = null;
  var scrambleText = '';

  function startThinking(el, text) {
    stopThinking();
    scrambleEl = el;
    scrambleText = text;
    el.classList.add('scramble');
    scrambleInterval = setInterval(function () {
      var s = '';
      for (var i = 0; i < scrambleText.length; i++) {
        if (scrambleText[i] === ' ') {
          s += ' ';
        } else if (Math.random() < 0.4) {
          s += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        } else {
          s += scrambleText[i];
        }
      }
      scrambleEl.textContent = s;
    }, 70);
  }

  function updateThinkingText(text) {
    scrambleText = text;
  }

  function stopThinking() {
    if (scrambleInterval) {
      clearInterval(scrambleInterval);
      scrambleInterval = null;
    }
    if (scrambleEl) {
      scrambleEl.classList.remove('scramble');
      scrambleEl = null;
    }
    scrambleText = '';
  }

  // ── Token bar ──────────────────────────────────────────────────
  function estimateTokens() {
    var chars = 0;
    for (var i = 0; i < chatHistory.length; i++) {
      var parts = chatHistory[i].parts;
      for (var p = 0; p < parts.length; p++) {
        if (parts[p].text) chars += parts[p].text.length;
      }
    }
    return Math.round(chars / 4);
  }

  function formatTokens(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  function updateTokenBar() {
    if (!tokenBar) return;
    var tokens = estimateTokens();
    var cacheStatus = cacheName
      ? '<span class="cached">● cached</span>'
      : '○ not cached';
    var tokenText = tokens > 0 ? ' · ~' + formatTokens(tokens) + ' conversation tokens' : '';
    tokenBar.innerHTML = cacheStatus + tokenText;
  }

  // ── Copy helper ────────────────────────────────────────────────
  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = orig; }, 1200);
    });
  }

  // ── Event delegation for messages ──────────────────────────────
  function initClickDelegation() {
    messagesEl.addEventListener('click', function (e) {
      if (e.target.classList.contains('chat-code-copy')) {
        var pre = e.target.parentElement.querySelector('pre');
        if (pre) copyText(pre.textContent, e.target);
        return;
      }
      if (e.target.classList.contains('chat-code-playground')) {
        var pgPre = e.target.parentElement.querySelector('pre');
        if (pgPre && window.DIME_PG) {
          window.DIME_PG.loadYaml(pgPre.textContent);
          e.target.textContent = 'Loaded!';
          setTimeout(function () { e.target.innerHTML = '&#x25B6; Playground'; }, 1200);
        }
        return;
      }
      if (e.target.classList.contains('chat-copy-msg')) {
        var msgDiv = e.target.closest('.chat-ai');
        var contentDiv = msgDiv ? msgDiv.querySelector('.chat-ai-content') : null;
        if (contentDiv) copyText(contentDiv.textContent, e.target);
        return;
      }
      if (e.target.classList.contains('chat-page-link')) {
        e.preventDefault();
        var href = e.target.getAttribute('href');
        if (href) window.location.hash = href.slice(1);
      }
    });
  }

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    // DOM refs
    bubble       = document.getElementById('chat-bubble');
    pane         = document.getElementById('chat-pane');
    resizeHandle = document.getElementById('chat-resize');
    messagesEl   = document.getElementById('chat-messages');
    chatInput    = document.getElementById('chat-input');
    sendBtn      = document.getElementById('chat-send');
    modelSelect  = document.getElementById('chat-model');
    newBtn       = document.getElementById('chat-new');
    settingsBtn  = document.getElementById('chat-settings-btn');
    closeBtn     = document.getElementById('chat-close');
    settingsEl   = document.getElementById('chat-settings');
    keyInput     = document.getElementById('chat-key-input');
    keyToggle    = document.getElementById('chat-key-toggle');
    keySave      = document.getElementById('chat-key-save');
    keyCancel    = document.getElementById('chat-key-cancel');
    tokenBar     = document.getElementById('chat-token-bar');
    attachBtn    = document.getElementById('chat-attach');
    fileInput    = document.getElementById('chat-file-input');
    filePreview  = document.getElementById('chat-file-preview');

    if (!bubble || !pane) return;

    // Populate model dropdown
    for (var i = 0; i < MODELS.length; i++) {
      var opt = document.createElement('option');
      opt.value = MODELS[i].id;
      opt.textContent = MODELS[i].name;
      if (MODELS[i].id === selectedModel) opt.selected = true;
      modelSelect.appendChild(opt);
    }

    // Bubble → open pane
    bubble.addEventListener('click', openPane);
    closeBtn.addEventListener('click', closePane);

    // Send / Stop
    sendBtn.addEventListener('click', function () {
      if (isStreaming) stopStreaming();
      else sendMessage();
    });

    // Textarea: Enter sends, Shift+Enter newline, stop propagation
    chatInput.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isStreaming) sendMessage();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closePane();
      }
    });

    // Auto-grow textarea
    chatInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Model change → invalidate cache
    modelSelect.addEventListener('change', function () {
      selectedModel = this.value;
      saveModel();
      cacheName = null;
      cacheModel = null;
      updateTokenBar();
    });
    modelSelect.addEventListener('keydown', function (e) { e.stopPropagation(); });

    // New conversation
    newBtn.addEventListener('click', newConversation);

    // Settings
    settingsBtn.addEventListener('click', openSettings);
    keySave.addEventListener('click', saveSettings);
    keyCancel.addEventListener('click', closeSettings);
    keyToggle.addEventListener('click', toggleKeyVisibility);

    keyInput.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); saveSettings(); }
      if (e.key === 'Escape') { e.preventDefault(); closeSettings(); }
    });

    // File attachment
    attachBtn.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      for (var f = 0; f < fileInput.files.length; f++) {
        stageFile(fileInput.files[f]);
      }
    });

    // Resize handle
    initResize();

    // Click delegation for code copy, message copy, page links
    initClickDelegation();

    // Restore previous messages or show welcome
    addWelcomeMessage();
    if (chatHistory.length > 0) {
      restoreMessages();
    }
    updateTokenBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ──────────────────────────────────────────────────

  function sendYamlToChat(yaml) {
    // Open the chat pane
    if (pane && !pane.classList.contains('open')) openPane();
    if (!apiKey) { openSettings(); return; }

    // Pre-fill the input with YAML and a review prompt
    var prompt = 'Review this DIME YAML configuration. Check for errors, suggest improvements, and explain what it does:\n\n```yaml\n' + yaml + '\n```';
    chatInput.value = prompt;
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    chatInput.focus();
  }

  window.DIME_CHAT = {
    sendYaml: sendYamlToChat
  };
})();
