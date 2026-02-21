(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────
  var schema = null;
  var sources = [];
  var sinks = [];
  var nextId = 1;

  // ── DOM refs ───────────────────────────────────────────────────
  var pane, bubble, closeBtn, validateBtn, copyBtn;
  var sourceList, sinkList, addSourceBtn, addSinkBtn;
  var yamlPre, statusEl, errorsEl;
  var scriptModal = null;
  var importModal = null;
  var importFiles = [];  // {name, text} array for Upload tab
  var dimeUrl = localStorage.getItem('dime-playground-url') || 'http://localhost:9999';

  // Schema-derived cache (populated by initSchemaCache after schema loads)
  var _cache = {};

  // ── Schema Loading ─────────────────────────────────────────────

  function loadSchema(cb) {
    if (schema) return cb();
    fetch('dime-schema.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { schema = data; initSchemaCache(); cb(); })
      .catch(function () { showStatus('Failed to load schema', true); });
  }

  function initSchemaCache() {
    var defs = schema.definitions;
    var basePr = defs.baseConnector.properties;
    var srcPr = defs.sourceConnector.allOf[1].properties;
    var snkPr = defs.sinkConnector.allOf[1].properties;

    // Union of base + source + sink property keys (skip in type-specific rendering)
    var baseKeys = {};
    var k;
    for (k in basePr) baseKeys[k] = 1;
    for (k in srcPr) baseKeys[k] = 1;
    for (k in snkPr) baseKeys[k] = 1;
    _cache.baseKeys = baseKeys;

    // Script fields: source properties where key ends in '_script' and type === 'string'
    var scriptFields = [];
    for (k in srcPr) {
      if (k.length > 7 && k.indexOf('_script') === k.length - 7 &&
          k !== 'paths_script' && k !== 'lang_script' && srcPr[k].type === 'string') {
        scriptFields.push(k);
      }
    }
    _cache.scriptFields = scriptFields;

    // Streaming source types from allOf[2].if.properties.connector.enum
    var streamingBlock = defs.sourceConnector.allOf[2];
    _cache.streamingSrc = (streamingBlock && streamingBlock['if'] &&
      streamingBlock['if'].properties && streamingBlock['if'].properties.connector &&
      streamingBlock['if'].properties.connector['enum']) || [];

    // Item-level sink override definitions
    var baseItemPr = defs.baseItem.properties;
    _cache.itemSinkDef = baseItemPr.sink ? baseItemPr.sink.properties || {} : {};
  }

  function getTypeEnum(isSink) {
    var key = isSink ? 'sinkConnector' : 'sourceConnector';
    return schema.definitions[key].allOf[1].properties.connector.enum || [];
  }

  function getConnectorDef(isSink, connType) {
    var defKey = connType + (isSink ? 'Sink' : 'Source');
    return schema.definitions[defKey] || { properties: {} };
  }

  function getConnectorExample(isSink, connType) {
    var def = getConnectorDef(isSink, connType);
    return (def.examples && def.examples[0]) ? Object.assign({}, def.examples[0]) : null;
  }

  function getConnectorRequired(isSink, connType) {
    var def = getConnectorDef(isSink, connType);
    return def.required || [];
  }

  // Get connector-specific item extra properties (e.g. opcUaItem.namespace)
  function getItemExtraProps(connType) {
    // 1. Check for a standalone definition (e.g. ethernetIpItem, modbusTcpItem)
    var defKey = connType + 'Item';
    var def = schema.definitions[defKey];
    if (def && def.allOf) {
      for (var i = 1; i < def.allOf.length; i++) {
        if (def.allOf[i].properties) return def.allOf[i].properties;
      }
    }

    // 2. Check for inline item definition in connector source (e.g. ros2Source.properties.items.items.allOf)
    var srcDef = schema.definitions[connType + 'Source'];
    if (srcDef && srcDef.properties && srcDef.properties.items &&
        srcDef.properties.items.items && srcDef.properties.items.items.allOf) {
      var allOf = srcDef.properties.items.items.allOf;
      for (var j = 1; j < allOf.length; j++) {
        if (allOf[j].properties) return allOf[j].properties;
      }
    }

    return {};
  }

  // Returns { properties: {...}, required: [...] } merging baseItem + connector-specific item props
  function getFullItemProps(connType) {
    var defs = schema.definitions;
    var props = {};
    var req = [];
    var k;

    var baseDef = defs.baseItem;
    for (k in baseDef.properties) props[k] = baseDef.properties[k];
    if (baseDef.required) req = req.concat(baseDef.required);

    var extra = getItemExtraProps(connType);
    for (k in extra) props[k] = extra[k];

    return { properties: props, required: req };
  }

  // Returns { properties: {...}, required: [...] } merging base + shared + connector-specific + streaming
  function getFullConnectorProps(isSink, connType) {
    var defs = schema.definitions;
    var props = {};
    var req = [];
    var k;

    // 1. Base connector (name, enabled, scan_interval)
    var baseDef = defs.baseConnector;
    for (k in baseDef.properties) props[k] = baseDef.properties[k];
    if (baseDef.required) req = req.concat(baseDef.required);

    // 2. Shared source/sink properties (connector, rbe, scripts, filters, etc.)
    var sharedBlock = defs[isSink ? 'sinkConnector' : 'sourceConnector'].allOf[1];
    for (k in sharedBlock.properties) {
      if (k === 'connector' || k === 'items') continue;
      props[k] = sharedBlock.properties[k];
    }
    if (sharedBlock.required) req = req.concat(sharedBlock.required);

    // 3. Streaming properties (itemized_read, create_dummy_messages_on_startup)
    if (!isSink && _cache.streamingSrc.indexOf(connType) !== -1) {
      var streamThen = defs.sourceConnector.allOf[2].then;
      if (streamThen && streamThen.properties) {
        for (k in streamThen.properties) props[k] = streamThen.properties[k];
      }
    }

    // 4. Connector-specific properties
    var specDef = getConnectorDef(isSink, connType);
    if (specDef.properties) {
      for (k in specDef.properties) {
        if (k === 'items') continue;
        props[k] = specDef.properties[k];
      }
    }
    if (specDef.required) req = req.concat(specDef.required);

    return { properties: props, required: req };
  }

  function isStreaming(connType) {
    return _cache.streamingSrc.indexOf(connType) !== -1;
  }

  // ── State Management ───────────────────────────────────────────

  function addConnector(isSink) {
    var types = getTypeEnum(isSink);
    var defaultType = isSink ? 'console' : 'mqtt';
    if (types.indexOf(defaultType) === -1) defaultType = types[0];

    var conn = { _id: nextId++, connector: defaultType };
    var ex = getConnectorExample(isSink, defaultType);
    if (ex) {
      for (var k in ex) {
        if (k !== 'items') conn[k] = ex[k];
      }
    }
    conn.name = defaultType + '_' + conn._id;
    if (!isSink) conn.items = [];

    (isSink ? sinks : sources).push(conn);
    renderColumn(isSink);
    updateYaml();
  }

  function removeConnector(isSink, id) {
    var list = isSink ? sinks : sources;
    for (var i = 0; i < list.length; i++) {
      if (list[i]._id === id) { list.splice(i, 1); break; }
    }
    renderColumn(isSink);
    updateYaml();
  }

  function findConnector(isSink, id) {
    var list = isSink ? sinks : sources;
    for (var i = 0; i < list.length; i++) {
      if (list[i]._id === id) return list[i];
    }
    return null;
  }

  function changeConnectorType(isSink, id, newType) {
    var conn = findConnector(isSink, id);
    if (!conn) return;
    var keepName = conn.name;
    var keepInterval = conn.scan_interval;
    var keepEnabled = conn.enabled;
    var keepItems = conn.items;

    var ex = getConnectorExample(isSink, newType);
    var cid = conn._id;
    for (var k in conn) { if (k !== '_id') delete conn[k]; }
    conn.connector = newType;
    if (ex) { for (var k2 in ex) { if (k2 !== 'items') conn[k2] = ex[k2]; } }
    conn._id = cid;
    conn.name = keepName;
    if (keepInterval !== undefined) conn.scan_interval = keepInterval;
    if (keepEnabled !== undefined) conn.enabled = keepEnabled;
    if (!isSink) conn.items = keepItems || [];

    renderColumn(isSink);
    updateYaml();
  }

  // ── Script Modal ───────────────────────────────────────────────

  function ensureScriptModal() {
    if (scriptModal) return;
    scriptModal = document.createElement('div');
    scriptModal.id = 'pg-script-modal';
    scriptModal.innerHTML =
      '<div id="pg-script-box">' +
        '<div id="pg-script-header">' +
          '<span id="pg-script-title">Edit Script</span>' +
          '<button id="pg-script-done">Done</button>' +
          '<button id="pg-script-cancel">Cancel</button>' +
        '</div>' +
        '<textarea id="pg-script-editor" spellcheck="false"></textarea>' +
      '</div>';
    pane.appendChild(scriptModal);
  }

  function openScriptModal(title, value, onSave) {
    ensureScriptModal();
    var titleEl = document.getElementById('pg-script-title');
    var editor = document.getElementById('pg-script-editor');
    var doneBtn = document.getElementById('pg-script-done');
    var cancelBtn = document.getElementById('pg-script-cancel');

    titleEl.textContent = title;
    editor.value = value || '';
    scriptModal.classList.add('open');
    editor.focus();

    function close() {
      scriptModal.classList.remove('open');
      doneBtn.removeEventListener('click', save);
      cancelBtn.removeEventListener('click', cancel);
      editor.removeEventListener('keydown', onKey);
    }
    function save() { onSave(editor.value); close(); updateYaml(); }
    function cancel() { close(); }
    function onKey(e) {
      e.stopPropagation();
      if (e.key === 'Escape') cancel();
    }

    doneBtn.addEventListener('click', save);
    cancelBtn.addEventListener('click', cancel);
    editor.addEventListener('keydown', onKey);
  }

  // ── Import Modal ─────────────────────────────────────────────

  function ensureImportModal() {
    if (importModal) return;
    importModal = document.createElement('div');
    importModal.id = 'pg-import-modal';
    importModal.innerHTML =
      '<div id="pg-import-box">' +
        '<div id="pg-import-header">' +
          '<span id="pg-import-title">Import Configuration</span>' +
        '</div>' +
        '<div id="pg-import-tabs">' +
          '<button class="pg-import-tab active" data-tab="paste">Paste</button>' +
          '<button class="pg-import-tab" data-tab="upload">Upload Files</button>' +
        '</div>' +
        '<div id="pg-import-paste" class="pg-import-panel">' +
          '<textarea id="pg-import-text" spellcheck="false" placeholder="Paste YAML here...\n\nMulti-file configs: paste all files concatenated.\nAnchors (&name) and aliases (*name) will be resolved."></textarea>' +
        '</div>' +
        '<div id="pg-import-upload" class="pg-import-panel" style="display:none">' +
          '<div id="pg-import-dropzone">' +
            '<span>Drop .yaml files here or </span>' +
            '<button id="pg-import-browse">Browse</button>' +
            '<input id="pg-import-file" type="file" accept=".yaml,.yml" multiple style="display:none">' +
          '</div>' +
          '<div id="pg-import-filelist"></div>' +
          '<div id="pg-import-filenote">Files merged in DIME order (main.yaml loaded last, anchors resolved)</div>' +
        '</div>' +
        '<div id="pg-import-error"></div>' +
        '<div id="pg-import-actions">' +
          '<button id="pg-import-ok">Import</button>' +
          '<button id="pg-import-cancel">Cancel</button>' +
        '</div>' +
      '</div>';
    pane.appendChild(importModal);

    // Tab switching
    var tabs = importModal.querySelectorAll('.pg-import-tab');
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].addEventListener('click', function () {
        for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
        this.classList.add('active');
        document.getElementById('pg-import-paste').style.display = this.dataset.tab === 'paste' ? '' : 'none';
        document.getElementById('pg-import-upload').style.display = this.dataset.tab === 'upload' ? '' : 'none';
      });
    }

    // Browse button
    document.getElementById('pg-import-browse').addEventListener('click', function () {
      document.getElementById('pg-import-file').click();
    });

    // File input change
    document.getElementById('pg-import-file').addEventListener('change', function (e) {
      addImportFiles(e.target.files);
      e.target.value = '';
    });

    // Drop handling: accept drops anywhere on the upload panel
    var dz = document.getElementById('pg-import-dropzone');
    var uploadPanel = document.getElementById('pg-import-upload');

    // Prevent browser default file-open on the entire modal
    importModal.addEventListener('dragover', function (e) { e.preventDefault(); });
    importModal.addEventListener('drop', function (e) { e.preventDefault(); });

    // Upload panel accepts drops anywhere within it
    uploadPanel.addEventListener('dragover', function (e) {
      e.preventDefault();
      dz.classList.add('dragover');
    });
    uploadPanel.addEventListener('dragleave', function (e) {
      // Only remove highlight when leaving the upload panel entirely
      if (!uploadPanel.contains(e.relatedTarget)) {
        dz.classList.remove('dragover');
      }
    });
    uploadPanel.addEventListener('drop', function (e) {
      e.preventDefault();
      dz.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        addImportFiles(e.dataTransfer.files);
      }
    });
  }

  function addImportFiles(fileList) {
    var pending = fileList.length;
    if (!pending) return;
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (!f.name.match(/\.ya?ml$/i)) { pending--; continue; }
      // Skip duplicates
      var dup = false;
      for (var d = 0; d < importFiles.length; d++) {
        if (importFiles[d].name === f.name) { dup = true; break; }
      }
      if (dup) { pending--; continue; }
      (function (file) {
        var reader = new FileReader();
        reader.onload = function (ev) {
          importFiles.push({ name: file.name, text: ev.target.result });
          pending--;
          if (pending <= 0) renderImportFileList();
        };
        reader.readAsText(file);
      })(f);
    }
    if (pending <= 0) renderImportFileList();
  }

  function renderImportFileList() {
    var list = document.getElementById('pg-import-filelist');
    if (!list) return;
    list.innerHTML = '';
    var sorted = sortImportFiles(importFiles);
    for (var i = 0; i < sorted.length; i++) {
      var item = document.createElement('div');
      item.className = 'pg-import-fileitem';

      var name = document.createElement('span');
      name.className = 'pg-import-filename';
      var isMain = /^main\.ya?ml$/i.test(sorted[i].name);
      name.textContent = sorted[i].name + (isMain ? ' (loaded last)' : '');
      if (isMain) name.classList.add('main');

      var rmBtn = document.createElement('button');
      rmBtn.className = 'pg-import-filerm';
      rmBtn.textContent = '\u00d7';
      rmBtn.addEventListener('click', (function (fname) {
        return function () {
          for (var j = 0; j < importFiles.length; j++) {
            if (importFiles[j].name === fname) { importFiles.splice(j, 1); break; }
          }
          renderImportFileList();
        };
      })(sorted[i].name));

      item.appendChild(name);
      item.appendChild(rmBtn);
      list.appendChild(item);
    }
  }

  function sortImportFiles(files) {
    return files.slice().sort(function (a, b) {
      var aMain = /^main\.ya?ml$/i.test(a.name);
      var bMain = /^main\.ya?ml$/i.test(b.name);
      if (aMain && !bMain) return 1;
      if (!aMain && bMain) return -1;
      return a.name.localeCompare(b.name);
    });
  }

  function mergeImportFiles(files) {
    var sorted = sortImportFiles(files);
    return sorted.map(function (f) { return f.text; }).join('\n');
  }

  function openImportModal() {
    ensureImportModal();
    importFiles = [];
    var textarea = document.getElementById('pg-import-text');
    if (textarea) textarea.value = '';
    renderImportFileList();

    // Reset to Paste tab
    var tabs = importModal.querySelectorAll('.pg-import-tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    tabs[0].classList.add('active');
    document.getElementById('pg-import-paste').style.display = '';
    document.getElementById('pg-import-upload').style.display = 'none';

    importModal.classList.add('open');

    var okBtn = document.getElementById('pg-import-ok');
    var cancelBtn = document.getElementById('pg-import-cancel');

    function close() {
      importModal.classList.remove('open');
      okBtn.removeEventListener('click', doImport);
      cancelBtn.removeEventListener('click', cancel);
    }

    function doImport() {
      var errEl = document.getElementById('pg-import-error');
      errEl.textContent = '';

      var activeTab = importModal.querySelector('.pg-import-tab.active');
      var yamlText = '';

      if (activeTab && activeTab.dataset.tab === 'upload') {
        if (importFiles.length === 0) {
          errEl.textContent = 'No files added. Browse or drop .yaml files above.';
          return;
        }
        yamlText = mergeImportFiles(importFiles);
      } else {
        yamlText = (document.getElementById('pg-import-text') || {}).value || '';
      }

      if (!yamlText.trim()) {
        errEl.textContent = 'Nothing to import. Paste YAML text above.';
        return;
      }

      var parsed = window.DIME_HL.parseYaml(yamlText);
      var totalConnectors = parsed.sources.length + parsed.sinks.length;

      if (totalConnectors === 0) {
        errEl.textContent = 'No sources or sinks found. Check that the YAML contains a "sources:" or "sinks:" section with valid connector definitions.';
        return;
      }

      // Check how many connectors will actually load (known types)
      loadSchema(function () {
        var sourceTypes = getTypeEnum(false);
        var sinkTypes = getTypeEnum(true);
        var srcMap = {};
        for (var si = 0; si < sourceTypes.length; si++) srcMap[sourceTypes[si].toLowerCase()] = sourceTypes[si];
        var snkMap = {};
        for (var ki = 0; ki < sinkTypes.length; ki++) snkMap[sinkTypes[ki].toLowerCase()] = sinkTypes[ki];

        var skipped = [];
        for (var i = 0; i < parsed.sources.length; i++) {
          var ct = (parsed.sources[i].connector || '').toLowerCase();
          if (!srcMap[ct]) skipped.push(parsed.sources[i].name || ct);
        }
        for (var j = 0; j < parsed.sinks.length; j++) {
          var st = (parsed.sinks[j].connector || '').toLowerCase();
          if (!snkMap[st]) skipped.push(parsed.sinks[j].name || st);
        }

        if (skipped.length === totalConnectors) {
          errEl.textContent = 'No recognized connector types found. Unknown: ' + skipped.join(', ');
          return;
        }

        close();
        loadFromYaml(yamlText);

        if (skipped.length > 0) {
          showStatus('Imported with ' + skipped.length + ' skipped (unknown type): ' + skipped.join(', '), true);
        }
      });
    }

    function cancel() { close(); }

    okBtn.addEventListener('click', doImport);
    cancelBtn.addEventListener('click', cancel);
  }

  // ── Form Rendering ─────────────────────────────────────────────

  function renderColumn(isSink) {
    var container = isSink ? sinkList : sourceList;
    var list = isSink ? sinks : sources;
    container.innerHTML = '';

    if (list.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'pg-empty';
      empty.textContent = isSink ? 'No sinks \u2014 click + Add' : 'No sources \u2014 click + Add';
      container.appendChild(empty);
      return;
    }
    for (var i = 0; i < list.length; i++) {
      container.appendChild(buildCard(isSink, list[i]));
    }
  }

  function buildCard(isSink, conn) {
    var card = document.createElement('div');
    card.className = 'pg-card';

    // ─── Header ───
    var header = document.createElement('div');
    header.className = 'pg-card-header';

    var typeSelect = document.createElement('select');
    var types = getTypeEnum(isSink);
    for (var t = 0; t < types.length; t++) {
      var opt = document.createElement('option');
      opt.value = types[t];
      opt.textContent = types[t];
      if (types[t] === conn.connector) opt.selected = true;
      typeSelect.appendChild(opt);
    }
    typeSelect.addEventListener('change', (function (s, c) {
      return function (e) { changeConnectorType(s, c, e.target.value); };
    })(isSink, conn._id));

    var removeBtn = document.createElement('button');
    removeBtn.className = 'pg-card-remove';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', (function (s, c) {
      return function () { removeConnector(s, c); };
    })(isSink, conn._id));

    header.appendChild(typeSelect);
    header.appendChild(removeBtn);
    card.appendChild(header);

    // ─── Base Fields ───
    var fields = document.createElement('div');
    fields.className = 'pg-card-fields';

    fields.appendChild(buildField('name', { type: 'string', description: 'Unique connector name' },
      conn.name, true, function (v) { conn.name = v; updateYaml(); }));

    fields.appendChild(buildField('scan_interval', { type: 'integer', description: 'Scan frequency (ms)', default: 1000 },
      conn.scan_interval, false, function (v) { conn.scan_interval = parseInt(v) || 1000; updateYaml(); }));

    fields.appendChild(buildField('enabled', { type: 'boolean', description: 'Is connector enabled', default: true },
      conn.enabled !== undefined ? conn.enabled : true, false,
      function (v) { conn.enabled = v; updateYaml(); }));

    if (!isSink) {
      fields.appendChild(buildField('rbe', { type: 'boolean', description: 'Report by exception', default: true },
        conn.rbe !== undefined ? conn.rbe : true, false,
        function (v) { conn.rbe = v; updateYaml(); }));
    }

    // ─── Connector-Specific Fields ───
    var def = getConnectorDef(isSink, conn.connector);
    var props = def.properties || {};
    var reqFields = getConnectorRequired(isSink, conn.connector);
    var hasSpecific = false;

    for (var key in props) {
      if (_cache.baseKeys[key]) continue;
      if (!hasSpecific) {
        fields.appendChild(makeSection(conn.connector + ' settings'));
        hasSpecific = true;
      }
      var isReq = reqFields.indexOf(key) !== -1;
      var val = conn[key] !== undefined ? conn[key] : (props[key].default !== undefined ? props[key].default : '');
      fields.appendChild(buildField(key, props[key], val, isReq,
        (function (k, p) {
          return function (v) {
            conn[k] = p.type === 'integer' ? (parseInt(v) || 0) : p.type === 'boolean' ? !!v : v;
            updateYaml();
          };
        })(key, props[key])
      ));
    }

    // ─── Scripting Section (source only) ───
    if (!isSink) {
      fields.appendChild(buildScriptingSection(conn));
    }

    // ─── Advanced Section (source only) ───
    if (!isSink) {
      fields.appendChild(buildAdvancedSection(conn));
    }

    // ─── Filters (sink only) ───
    if (isSink) {
      fields.appendChild(makeSection('filters'));
      fields.appendChild(buildField('include_filter', { type: 'string', description: 'Comma-separated include paths' },
        (conn.include_filter || []).join(', '), false,
        function (v) { conn.include_filter = splitCSV(v); updateYaml(); }));
      fields.appendChild(buildField('exclude_filter', { type: 'string', description: 'Comma-separated exclude paths' },
        (conn.exclude_filter || []).join(', '), false,
        function (v) { conn.exclude_filter = splitCSV(v); updateYaml(); }));
      fields.appendChild(buildField('use_sink_transform', { type: 'boolean', description: 'Execute source-defined transforms', default: false },
        conn.use_sink_transform || false, false,
        function (v) { conn.use_sink_transform = v; updateYaml(); }));
    }

    card.appendChild(fields);

    // ─── Items Section (source only) ───
    if (!isSink) {
      card.appendChild(buildItemsSection(conn));
    }

    return card;
  }

  // ── Scripting Section ──────────────────────────────────────────

  function buildScriptingSection(conn) {
    var wrap = document.createElement('div');
    wrap.className = 'pg-collapsible';

    var toggle = document.createElement('div');
    toggle.className = 'pg-section-toggle';
    toggle.innerHTML = '<span class="pg-toggle-arrow">\u25b6</span> scripting';
    var body = document.createElement('div');
    body.className = 'pg-collapsible-body';
    body.style.display = 'none';

    toggle.addEventListener('click', function () {
      var open = body.style.display !== 'none';
      body.style.display = open ? 'none' : '';
      toggle.querySelector('.pg-toggle-arrow').textContent = open ? '\u25b6' : '\u25bc';
    });

    // Language
    body.appendChild(buildField('lang_script', { type: 'string', description: 'Scripting language', enum: ['Lua', 'Python'], default: 'Lua' },
      conn.lang_script || 'Lua', false,
      function (v) { conn.lang_script = v; updateYaml(); }));

    // Library paths
    body.appendChild(buildField('paths_script', { type: 'string', description: 'Additional library paths (comma-separated)' },
      (conn.paths_script || []).join(', '), false,
      function (v) { conn.paths_script = splitCSV(v); updateYaml(); }));

    // Script fields
    for (var i = 0; i < _cache.scriptFields.length; i++) {
      var sf = _cache.scriptFields[i];
      body.appendChild(buildScriptButton(sf, conn));
    }

    // Connector-level sink transform
    body.appendChild(makeSection('sink transform'));
    if (!conn.sink) conn.sink = {};
    if (!conn.sink.transform) conn.sink.transform = {};

    body.appendChild(buildField('transform type', { type: 'string', description: 'Transform engine', enum: ['script', 'scriban', 'liquid'], default: 'script' },
      conn.sink.transform.type || '', false,
      function (v) { conn.sink.transform.type = v; updateYaml(); }));

    body.appendChild(buildScriptButton('template', conn.sink.transform, 'transform template'));

    wrap.appendChild(toggle);
    wrap.appendChild(body);
    return wrap;
  }

  // ── Advanced Section (source) ──────────────────────────────────

  function buildAdvancedSection(conn) {
    var wrap = document.createElement('div');
    wrap.className = 'pg-collapsible';

    var toggle = document.createElement('div');
    toggle.className = 'pg-section-toggle';
    toggle.innerHTML = '<span class="pg-toggle-arrow">\u25b6</span> advanced';
    var body = document.createElement('div');
    body.className = 'pg-collapsible-body';
    body.style.display = 'none';

    toggle.addEventListener('click', function () {
      var open = body.style.display !== 'none';
      body.style.display = open ? 'none' : '';
      toggle.querySelector('.pg-toggle-arrow').textContent = open ? '\u25b6' : '\u25bc';
    });

    body.appendChild(buildField('ignore_errors_on_read', { type: 'boolean', description: 'Continue on read errors', default: false },
      conn.ignore_errors_on_read || false, false,
      function (v) { conn.ignore_errors_on_read = v; updateYaml(); }));

    body.appendChild(buildField('strip_path_prefix', { type: 'boolean', description: 'Remove connector name from message paths', default: false },
      conn.strip_path_prefix || false, false,
      function (v) { conn.strip_path_prefix = v; updateYaml(); }));

    body.appendChild(buildField('wait_for_connectors', { type: 'string', description: 'Connector names to wait for (comma-separated)' },
      (conn.wait_for_connectors || []).join(', '), false,
      function (v) { conn.wait_for_connectors = splitCSV(v); updateYaml(); }));

    // Streaming-only options
    if (isStreaming(conn.connector)) {
      body.appendChild(buildField('itemized_read', { type: 'boolean', description: 'Match streaming data against items list', default: false },
        conn.itemized_read || false, false,
        function (v) { conn.itemized_read = v; updateYaml(); }));

      body.appendChild(buildField('create_dummy_messages_on_startup', { type: 'boolean', description: 'Create zero-value messages on startup', default: false },
        conn.create_dummy_messages_on_startup || false, false,
        function (v) { conn.create_dummy_messages_on_startup = v; updateYaml(); }));
    }

    wrap.appendChild(toggle);
    wrap.appendChild(body);
    return wrap;
  }

  // ── Items Section ──────────────────────────────────────────────

  function buildItemsSection(conn) {
    var wrap = document.createElement('div');
    wrap.className = 'pg-items';

    var hdr = document.createElement('div');
    hdr.className = 'pg-items-header';
    var title = document.createElement('span');
    title.textContent = 'Items (' + conn.items.length + ')';
    hdr.appendChild(title);

    var addBtn = document.createElement('button');
    addBtn.className = 'pg-add-item';
    addBtn.textContent = '+ Add';
    addBtn.addEventListener('click', function () {
      conn.items.push({ name: 'item_' + (conn.items.length + 1), address: '', enabled: true });
      renderColumn(false);
      updateYaml();
    });
    hdr.appendChild(addBtn);
    wrap.appendChild(hdr);

    for (var i = 0; i < conn.items.length; i++) {
      wrap.appendChild(buildItemCard(conn, i));
    }
    return wrap;
  }

  function buildItemCard(conn, idx) {
    var item = conn.items[idx];
    var card = document.createElement('div');
    card.className = 'pg-item-card';

    // ── Item header: name + address inline + expand + remove ──
    var hdr = document.createElement('div');
    hdr.className = 'pg-item-header';

    var nameInp = document.createElement('input');
    nameInp.type = 'text';
    nameInp.value = item.name || '';
    nameInp.placeholder = 'name';
    nameInp.className = 'pg-item-name';
    nameInp.addEventListener('input', (function (ix) {
      return function (e) { conn.items[ix].name = e.target.value; updateYaml(); };
    })(idx));
    nameInp.addEventListener('keydown', function (e) { e.stopPropagation(); });

    var addrInp = document.createElement('input');
    addrInp.type = 'text';
    addrInp.value = item.address || '';
    addrInp.placeholder = 'address';
    addrInp.className = 'pg-item-addr';
    addrInp.addEventListener('input', (function (ix) {
      return function (e) { conn.items[ix].address = e.target.value; updateYaml(); };
    })(idx));
    addrInp.addEventListener('keydown', function (e) { e.stopPropagation(); });

    var expandBtn = document.createElement('button');
    expandBtn.className = 'pg-item-expand';
    expandBtn.textContent = '\u25b6';
    expandBtn.title = 'More options';

    var removeBtn = document.createElement('button');
    removeBtn.className = 'pg-item-remove';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', (function (ix) {
      return function () { conn.items.splice(ix, 1); renderColumn(false); updateYaml(); };
    })(idx));

    hdr.appendChild(nameInp);
    hdr.appendChild(addrInp);
    hdr.appendChild(expandBtn);
    hdr.appendChild(removeBtn);
    card.appendChild(hdr);

    // ── Expanded body ──
    var body = document.createElement('div');
    body.className = 'pg-item-body';
    body.style.display = 'none';

    expandBtn.addEventListener('click', function () {
      var open = body.style.display !== 'none';
      body.style.display = open ? 'none' : '';
      expandBtn.textContent = open ? '\u25b6' : '\u25bc';
    });

    // Base item fields
    body.appendChild(buildField('enabled', { type: 'boolean', description: 'Enable this item', default: true },
      item.enabled !== undefined ? item.enabled : true, false,
      (function (ix) { return function (v) { conn.items[ix].enabled = v; updateYaml(); }; })(idx)));

    body.appendChild(buildField('rbe', { type: 'boolean', description: 'Report by exception for this item' },
      item.rbe !== undefined ? item.rbe : '', false,
      (function (ix) { return function (v) { conn.items[ix].rbe = v; updateYaml(); }; })(idx)));

    body.appendChild(buildField('every', { type: 'integer', description: 'Execute every X scan intervals', default: 1 },
      item.every || '', false,
      (function (ix) { return function (v) { conn.items[ix].every = parseInt(v) || undefined; updateYaml(); }; })(idx)));

    // Item script
    body.appendChild(buildScriptButton('script', item));

    // Connector-specific item fields
    var extraProps = getItemExtraProps(conn.connector);
    for (var epk in extraProps) {
      var epDef = extraProps[epk];
      body.appendChild(buildField(epk, epDef,
        item[epk] !== undefined ? item[epk] : (epDef.default !== undefined ? epDef.default : ''), false,
        (function (ix, k, p) {
          return function (v) {
            conn.items[ix][k] = p.type === 'integer' ? (parseInt(v) || 0) : v;
            updateYaml();
          };
        })(idx, epk, epDef)));
    }

    // Sink overrides
    var sinkDiv = makeSection('sink overrides');
    body.appendChild(sinkDiv);
    if (!item.sink) item.sink = {};

    body.appendChild(buildField('mtconnect', { type: 'string', description: 'MTConnect DataItem path' },
      item.sink.mtconnect || '', false,
      (function (ix) { return function (v) { conn.items[ix].sink.mtconnect = v || undefined; updateYaml(); }; })(idx)));

    body.appendChild(buildField('opcua', { type: 'string', description: 'OPC-UA Node path' },
      item.sink.opcua || '', false,
      (function (ix) { return function (v) { conn.items[ix].sink.opcua = v || undefined; updateYaml(); }; })(idx)));

    // Item-level transform
    if (!item.sink.transform) item.sink.transform = {};
    body.appendChild(buildField('transform type', { type: 'string', description: 'Transform engine', enum: ['script', 'scriban', 'liquid'] },
      item.sink.transform.type || '', false,
      (function (ix) { return function (v) { conn.items[ix].sink.transform.type = v || undefined; updateYaml(); }; })(idx)));

    body.appendChild(buildScriptButton('template', item.sink.transform, 'transform template'));

    card.appendChild(body);
    return card;
  }

  // ── Field Builders ─────────────────────────────────────────────

  function buildField(key, propDef, value, isRequired, onChange) {
    var row = document.createElement('div');
    row.className = 'pg-field';

    var label = document.createElement('label');
    label.textContent = key.replace(/_/g, ' ');
    if (isRequired) {
      var req = document.createElement('span');
      req.className = 'pg-req';
      req.textContent = ' *';
      label.appendChild(req);
    }
    label.title = propDef.description || '';
    row.appendChild(label);

    if (propDef.enum && propDef.type !== 'boolean') {
      var sel = document.createElement('select');
      // Add empty option for optional enums
      if (!isRequired) {
        var emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = '\u2014';
        if (!value && value !== 0) emptyOpt.selected = true;
        sel.appendChild(emptyOpt);
      }
      for (var i = 0; i < propDef.enum.length; i++) {
        var opt = document.createElement('option');
        opt.value = propDef.enum[i];
        opt.textContent = propDef.enum[i];
        if (String(propDef.enum[i]) === String(value)) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener('change', function (e) { onChange(e.target.value); });
      row.appendChild(sel);
    } else if (propDef.type === 'boolean') {
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!value;
      cb.addEventListener('change', function (e) { onChange(e.target.checked); });
      row.appendChild(cb);
    } else if (propDef.type === 'integer' || propDef.type === 'number') {
      var num = document.createElement('input');
      num.type = 'number';
      num.value = value !== undefined && value !== '' ? value : '';
      num.placeholder = propDef.default !== undefined ? String(propDef.default) : '';
      num.addEventListener('input', function (e) { onChange(e.target.value); });
      num.addEventListener('keydown', function (e) { e.stopPropagation(); });
      row.appendChild(num);
    } else if (propDef.type === 'object') {
      var ta = document.createElement('textarea');
      ta.className = 'pg-obj-input';
      ta.rows = 3;
      var lines = [];
      if (value && typeof value === 'object') {
        for (var ok in value) lines.push(ok + ': ' + value[ok]);
      }
      ta.value = lines.join('\n');
      ta.placeholder = propDef.description || 'key: value (one per line)';
      ta.addEventListener('input', function (e) {
        var obj = {};
        var ls = e.target.value.split('\n');
        for (var li = 0; li < ls.length; li++) {
          var parts = ls[li].match(/^([^:]+):\s*(.*)$/);
          if (parts) obj[parts[1].trim()] = parts[2].trim();
        }
        onChange(obj);
      });
      ta.addEventListener('keydown', function (e) { e.stopPropagation(); });
      row.appendChild(ta);
    } else {
      var inp = document.createElement('input');
      inp.type = 'text';
      inp.value = value !== undefined ? String(value) : '';
      inp.placeholder = propDef.default !== undefined ? String(propDef.default) : (propDef.description || '');
      inp.addEventListener('input', function (e) { onChange(e.target.value); });
      inp.addEventListener('keydown', function (e) { e.stopPropagation(); });
      row.appendChild(inp);
    }
    return row;
  }

  function buildScriptButton(fieldName, obj, label) {
    var row = document.createElement('div');
    row.className = 'pg-field';

    var lbl = document.createElement('label');
    lbl.textContent = (label || fieldName).replace(/_/g, ' ');
    lbl.title = 'Click Edit to open script editor';
    row.appendChild(lbl);

    var preview = document.createElement('span');
    preview.className = 'pg-script-preview';
    preview.textContent = obj[fieldName] ? (obj[fieldName].substring(0, 40) + (obj[fieldName].length > 40 ? '...' : '')) : '(empty)';
    row.appendChild(preview);

    var btn = document.createElement('button');
    btn.className = 'pg-script-btn';
    btn.textContent = obj[fieldName] ? 'Edit' : 'Add';
    btn.addEventListener('click', function () {
      openScriptModal(
        (label || fieldName).replace(/_/g, ' '),
        obj[fieldName] || '',
        function (val) {
          obj[fieldName] = val || undefined;
          preview.textContent = val ? (val.substring(0, 40) + (val.length > 40 ? '...' : '')) : '(empty)';
          btn.textContent = val ? 'Edit' : 'Add';
        }
      );
    });
    row.appendChild(btn);
    return row;
  }

  function makeSection(text) {
    var div = document.createElement('div');
    div.className = 'pg-section-label';
    div.textContent = text;
    return div;
  }

  function splitCSV(v) {
    return v ? v.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
  }

  // ── YAML Syntax Highlighting (delegated to shared highlight.js) ─

  var esc = window.DIME_HL.esc;
  var highlightYaml = window.DIME_HL.highlightYaml;

  // ── YAML Generation ────────────────────────────────────────────

  function updateYaml() {
    if (!yamlPre) return;
    var raw = generateYaml();
    yamlPre.setAttribute('data-raw', raw);
    yamlPre.innerHTML = highlightYaml(raw);
    clearValidation();
    updateStatus();
  }

  function generateYaml() {
    var y = [];
    var appProps = schema.properties.app.properties;
    y.push('app:');
    for (var ak in appProps) {
      if (appProps[ak].default !== undefined) {
        y.push('  ' + ak + ': ' + yamlVal(appProps[ak].default, appProps[ak]));
      }
    }

    if (sources.length) {
      y.push('');
      y.push('sources:');
      for (var i = 0; i < sources.length; i++) {
        if (i > 0) y.push('');
        appendConnectorYaml(y, sources[i], false);
      }
    }
    if (sinks.length) {
      y.push('');
      y.push('sinks:');
      for (var j = 0; j < sinks.length; j++) {
        if (j > 0) y.push('');
        appendConnectorYaml(y, sinks[j], true);
      }
    }
    return y.join('\n');
  }

  function appendConnectorYaml(y, conn, isSink) {
    var I = '  ';  // base indent
    var I2 = I + '  ';
    y.push(I + '- name: ' + yamlStr(conn.name || ''));
    y.push(I2 + 'connector: ' + conn.connector);

    if (conn.enabled === false) y.push(I2 + 'enabled: false');
    if (conn.scan_interval !== undefined && conn.scan_interval !== 1000)
      y.push(I2 + 'scan_interval: ' + conn.scan_interval);

    if (!isSink) {
      if (conn.rbe !== undefined) y.push(I2 + 'rbe: ' + conn.rbe);
    }

    // Connector-specific fields
    var def = getConnectorDef(isSink, conn.connector);
    var props = def.properties || {};
    for (var key in props) {
      if (_cache.baseKeys[key]) continue;
      var val = conn[key];
      if (val === undefined || val === '') continue;
      if (props[key].type === 'object' && val && typeof val === 'object') {
        y.push(I2 + key + ':');
        for (var ok in val) {
          if (val[ok] !== undefined && val[ok] !== '')
            y.push(I2 + '  ' + ok + ': ' + yamlStr(String(val[ok])));
        }
      } else {
        y.push(I2 + key + ': ' + yamlVal(val, props[key]));
      }
    }

    if (!isSink) {
      // Scripting fields
      if (conn.lang_script && conn.lang_script !== 'Lua') y.push(I2 + 'lang_script: ' + yamlStr(conn.lang_script));
      else if (conn.lang_script) y.push(I2 + 'lang_script: ' + yamlStr(conn.lang_script));

      if (conn.paths_script && conn.paths_script.length) {
        y.push(I2 + 'paths_script:');
        for (var p = 0; p < conn.paths_script.length; p++)
          y.push(I2 + '  - ' + yamlStr(conn.paths_script[p]));
      }

      for (var si = 0; si < _cache.scriptFields.length; si++) {
        var sf = _cache.scriptFields[si];
        if (conn[sf]) yamlBlockScalar(y, I2, sf, conn[sf]);
      }

      // Advanced
      if (conn.ignore_errors_on_read) y.push(I2 + 'ignore_errors_on_read: true');
      if (conn.strip_path_prefix) y.push(I2 + 'strip_path_prefix: true');
      if (conn.wait_for_connectors && conn.wait_for_connectors.length) {
        y.push(I2 + 'wait_for_connectors:');
        for (var w = 0; w < conn.wait_for_connectors.length; w++)
          y.push(I2 + '  - ' + yamlStr(conn.wait_for_connectors[w]));
      }
      if (conn.itemized_read) y.push(I2 + 'itemized_read: true');
      if (conn.create_dummy_messages_on_startup) y.push(I2 + 'create_dummy_messages_on_startup: true');

      // Connector-level sink transform
      if (conn.sink && conn.sink.transform && (conn.sink.transform.type || conn.sink.transform.template)) {
        y.push(I2 + 'sink:');
        y.push(I2 + '  transform:');
        if (conn.sink.transform.type) y.push(I2 + '    type: ' + yamlStr(conn.sink.transform.type));
        if (conn.sink.transform.template) yamlBlockScalar(y, I2 + '    ', 'template', conn.sink.transform.template);
      }
    }

    // Sink filters
    if (isSink) {
      if (conn.include_filter && conn.include_filter.length) {
        y.push(I2 + 'include_filter:');
        for (var fi = 0; fi < conn.include_filter.length; fi++)
          y.push(I2 + '  - ' + yamlStr(conn.include_filter[fi]));
      }
      if (conn.exclude_filter && conn.exclude_filter.length) {
        y.push(I2 + 'exclude_filter:');
        for (var ei = 0; ei < conn.exclude_filter.length; ei++)
          y.push(I2 + '  - ' + yamlStr(conn.exclude_filter[ei]));
      }
      if (conn.use_sink_transform) y.push(I2 + 'use_sink_transform: true');
    }

    // Items
    if (!isSink && conn.items && conn.items.length) {
      y.push(I2 + 'items:');
      for (var m = 0; m < conn.items.length; m++) {
        appendItemYaml(y, conn.items[m], conn.connector, I2 + '  ');
      }
    }
  }

  function appendItemYaml(y, item, connType, indent) {
    y.push(indent + '- name: ' + yamlStr(item.name || ''));
    if (item.enabled === false) y.push(indent + '  enabled: false');
    if (item.address !== undefined && item.address !== '') y.push(indent + '  address: ' + yamlStr(String(item.address)));
    if (item.rbe !== undefined && item.rbe !== '') y.push(indent + '  rbe: ' + item.rbe);
    if (item.every && item.every !== 1) y.push(indent + '  every: ' + item.every);

    // Connector-specific item fields
    var extraProps = getItemExtraProps(connType);
    for (var epk in extraProps) {
      if (item[epk] !== undefined && item[epk] !== '') {
        y.push(indent + '  ' + epk + ': ' + yamlVal(item[epk], extraProps[epk]));
      }
    }

    // Item script
    if (item.script) yamlBlockScalar(y, indent + '  ', 'script', item.script);

    // Sink overrides (schema-driven via _cache.itemSinkDef)
    if (item.sink) {
      var hasSink = false;
      for (var sk in _cache.itemSinkDef) {
        var sv = item.sink[sk];
        if (sv === undefined || sv === '') continue;
        if (typeof sv === 'object') {
          for (var ck in sv) { if (sv[ck]) { hasSink = true; break; } }
        } else {
          hasSink = true;
        }
        if (hasSink) break;
      }
      if (hasSink) {
        y.push(indent + '  sink:');
        for (var soKey in _cache.itemSinkDef) {
          var soDef = _cache.itemSinkDef[soKey];
          var soVal = item.sink[soKey];
          if (soVal === undefined || soVal === '') continue;
          if (soDef.type === 'string' && soVal) {
            y.push(indent + '    ' + soKey + ': ' + yamlStr(soVal));
          } else if (soDef.type === 'object' && soDef.properties && typeof soVal === 'object') {
            // Check if sub-object has data
            var hasSubData = false;
            for (var subK in soDef.properties) {
              if (soVal[subK] !== undefined && soVal[subK] !== '') { hasSubData = true; break; }
            }
            if (hasSubData) {
              y.push(indent + '    ' + soKey + ':');
              for (var emitK in soDef.properties) {
                var emitV = soVal[emitK];
                if (emitV === undefined || emitV === '') continue;
                var emitD = soDef.properties[emitK];
                if (emitD.type === 'string' && typeof emitV === 'string') {
                  if (emitV.indexOf('\n') !== -1) {
                    yamlBlockScalar(y, indent + '      ', emitK, emitV);
                  } else {
                    y.push(indent + '      ' + emitK + ': ' + yamlStr(emitV));
                  }
                } else if (emitD.type === 'boolean') {
                  y.push(indent + '      ' + emitK + ': ' + (emitV ? 'true' : 'false'));
                } else if (emitD.type === 'integer' || emitD.type === 'number') {
                  y.push(indent + '      ' + emitK + ': ' + emitV);
                }
              }
            }
          }
        }
      }
    }
  }

  function yamlBlockScalar(y, indent, key, text) {
    if (text.indexOf('\n') !== -1) {
      y.push(indent + key + ': |');
      var lines = text.split('\n');
      for (var i = 0; i < lines.length; i++) {
        y.push(indent + '  ' + lines[i]);
      }
    } else {
      y.push(indent + key + ': ' + yamlStr(text));
    }
  }

  function yamlVal(val, propDef) {
    if (!propDef) return String(val);
    if (propDef.type === 'boolean') return val ? 'true' : 'false';
    if (propDef.type === 'integer' || propDef.type === 'number') return String(val);
    return yamlStr(String(val));
  }

  function yamlStr(s) {
    s = String(s);
    if (s === '') return '""';
    if (/[:{}\[\],&*?|>!%@`#'"\\]/.test(s) || s === 'true' || s === 'false' || s === 'null' ||
        (/^\d/.test(s) && !isNaN(Number(s)))) {
      return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }
    return s;
  }

  // ── Validation ─────────────────────────────────────────────────

  function validate() {
    var errors = [];

    for (var i = 0; i < sources.length; i++) {
      var s = sources[i];
      var pf = 'sources[' + i + '] (' + s.connector + ')';
      if (!s.name || !s.name.trim()) errors.push({ type: 'error', msg: pf + ': missing required "name"' });

      var req = getConnectorRequired(false, s.connector);
      var def = getConnectorDef(false, s.connector);
      for (var r = 0; r < req.length; r++) {
        if (s[req[r]] === undefined || s[req[r]] === '') errors.push({ type: 'error', msg: pf + ': missing required "' + req[r] + '"' });
      }
      var props = def.properties || {};
      for (var pk in props) {
        if (props[pk].enum && s[pk] !== undefined && s[pk] !== '') {
          if (props[pk].enum.indexOf(s[pk]) === -1 && props[pk].enum.indexOf(Number(s[pk])) === -1)
            errors.push({ type: 'error', msg: pf + ': "' + pk + '" must be one of [' + props[pk].enum.join(', ') + ']' });
        }
      }
      if (!s.items || s.items.length === 0) errors.push({ type: 'warning', msg: pf + ': no items defined' });

      // Validate items
      for (var ii = 0; ii < (s.items || []).length; ii++) {
        var itm = s.items[ii];
        var ipf = pf + '.items[' + ii + ']';
        if (!itm.name || !itm.name.trim()) errors.push({ type: 'error', msg: ipf + ': missing required "name"' });
      }
    }

    for (var j = 0; j < sinks.length; j++) {
      var sk = sinks[j];
      var spf = 'sinks[' + j + '] (' + sk.connector + ')';
      if (!sk.name || !sk.name.trim()) errors.push({ type: 'error', msg: spf + ': missing required "name"' });

      var sreq = getConnectorRequired(true, sk.connector);
      var sdef = getConnectorDef(true, sk.connector);
      for (var sr = 0; sr < sreq.length; sr++) {
        if (sk[sreq[sr]] === undefined || sk[sreq[sr]] === '') errors.push({ type: 'error', msg: spf + ': missing required "' + sreq[sr] + '"' });
      }
      var sprops = sdef.properties || {};
      for (var spk in sprops) {
        if (sprops[spk].enum && sk[spk] !== undefined && sk[spk] !== '') {
          if (sprops[spk].enum.indexOf(sk[spk]) === -1 && sprops[spk].enum.indexOf(Number(sk[spk])) === -1)
            errors.push({ type: 'error', msg: spf + ': "' + spk + '" must be one of [' + sprops[spk].enum.join(', ') + ']' });
        }
      }
    }

    if (sources.length === 0 && sinks.length === 0) errors.push({ type: 'warning', msg: 'No sources or sinks configured' });

    var names = {};
    var all = sources.concat(sinks);
    for (var n = 0; n < all.length; n++) {
      var nm = all[n].name;
      if (nm && names[nm]) errors.push({ type: 'error', msg: 'Duplicate connector name: "' + nm + '"' });
      names[nm] = true;
    }
    return errors;
  }

  function renderValidation(errors) {
    errorsEl.innerHTML = '';
    var errCount = 0, warnCount = 0;
    for (var i = 0; i < errors.length; i++) {
      var e = errors[i];
      var div = document.createElement('div');
      div.className = 'pg-error-item ' + e.type;
      var icon = document.createElement('span');
      icon.className = 'pg-err-icon';
      icon.textContent = e.type === 'error' ? '\u2717' : '\u26a0';
      div.appendChild(icon);
      var msg = document.createElement('span');
      msg.className = 'pg-err-msg';
      msg.textContent = e.msg;
      div.appendChild(msg);
      errorsEl.appendChild(div);
      if (e.type === 'error') errCount++; else warnCount++;
    }

    if (errCount === 0 && warnCount === 0) showStatus('\u2713 Schema valid \u00b7 0 errors \u00b7 0 warnings', false);
    else if (errCount === 0) showStatus('\u2713 Valid \u00b7 ' + warnCount + ' warning' + (warnCount > 1 ? 's' : ''), false);
    else showStatus('\u2717 ' + errCount + ' error' + (errCount > 1 ? 's' : '') + ' \u00b7 ' + warnCount + ' warning' + (warnCount > 1 ? 's' : ''), true);
  }

  function clearValidation() { if (errorsEl) errorsEl.innerHTML = ''; }

  function updateStatus() {
    showStatus(sources.length + ' source' + (sources.length !== 1 ? 's' : '') +
      ' \u00b7 ' + sinks.length + ' sink' + (sinks.length !== 1 ? 's' : ''), false);
  }

  function showStatus(text, isError) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = isError ? 'error' : 'valid';
  }

  // ── UI Actions ─────────────────────────────────────────────────

  function openPlayground() {
    loadSchema(function () {
      pane.classList.add('open');
      document.body.classList.add('pg-open');
      renderColumn(false);
      renderColumn(true);
      updateYaml();
    });
  }

  function closePlayground() {
    pane.classList.remove('open');
    document.body.classList.remove('pg-open');
  }

  function copyYaml() {
    var text = yamlPre.getAttribute('data-raw') || yamlPre.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
      var orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () { copyBtn.textContent = orig; }, 1200);
    });
  }

  // ── Send to Chat ──────────────────────────────────────────────

  function sendToChat() {
    var yaml = yamlPre.getAttribute('data-raw') || yamlPre.textContent;
    if (!yaml || !yaml.trim()) return;
    if (window.DIME_CHAT && window.DIME_CHAT.sendYaml) {
      window.DIME_CHAT.sendYaml(yaml);
    }
  }

  // ── YAML Parser (delegated to shared highlight.js) ─────────────

  function loadFromYaml(yamlText) {
    loadSchema(function () {
      var parsed = window.DIME_HL.parseYaml(yamlText);
      var sourceTypes = getTypeEnum(false);
      var sinkTypes = getTypeEnum(true);

      // Build case-insensitive lookup maps: lowercased → actual schema name
      var srcMap = {};
      for (var si = 0; si < sourceTypes.length; si++) srcMap[sourceTypes[si].toLowerCase()] = sourceTypes[si];
      var snkMap = {};
      for (var ki = 0; ki < sinkTypes.length; ki++) snkMap[sinkTypes[ki].toLowerCase()] = sinkTypes[ki];

      sources = [];
      sinks = [];

      for (var i = 0; i < parsed.sources.length; i++) {
        var s = parsed.sources[i];
        var resolvedSrc = srcMap[(s.connector || '').toLowerCase()];
        if (!resolvedSrc) continue;
        s.connector = resolvedSrc;
        s._id = nextId++;
        sources.push(s);
      }
      for (var j = 0; j < parsed.sinks.length; j++) {
        var sk = parsed.sinks[j];
        var resolvedSnk = snkMap[(sk.connector || '').toLowerCase()];
        if (!resolvedSnk) continue;
        sk.connector = resolvedSnk;
        sk._id = nextId++;
        delete sk.items;
        sinks.push(sk);
      }

      pane.classList.add('open');
      document.body.classList.add('pg-open');
      renderColumn(false);
      renderColumn(true);
      updateYaml();
    });
  }

  // ── DIME Instance Connection ──────────────────────────────────

  var receiveBtn, sendBtn;

  function promptDimeUrl(action) {
    var url = prompt('DIME instance URL:', dimeUrl);
    if (url === null) return null; // cancelled
    url = url.trim().replace(/\/+$/, '');
    if (!url) return null;
    dimeUrl = url;
    localStorage.setItem('dime-playground-url', dimeUrl);
    return dimeUrl;
  }

  function flashBtn(btn, text, ms) {
    var orig = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
    setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, ms || 2000);
  }

  function showDimeError(msg) {
    if (errorsEl) {
      errorsEl.textContent = msg;
      errorsEl.style.display = 'block';
    }
  }

  function receiveFromDime() {
    var url = promptDimeUrl();
    if (!url) return;
    flashBtn(receiveBtn, 'Loading...', 10000);
    fetch(url + '/config/yaml')
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.text();
      })
      .then(function (yaml) {
        if (!yaml || !yaml.trim()) {
          showDimeError('DIME returned empty configuration.');
          flashBtn(receiveBtn, 'Empty', 2000);
          return;
        }
        loadFromYaml(yaml);
        flashBtn(receiveBtn, 'Received!', 1500);
      })
      .catch(function (err) {
        showDimeError('Cannot reach DIME at ' + url + ' \u2014 ' + err.message);
        flashBtn(receiveBtn, 'Failed', 2000);
      });
  }

  function sendToDime() {
    var yaml = yamlPre.getAttribute('data-raw') || yamlPre.textContent;
    if (!yaml || !yaml.trim()) return;
    var url = promptDimeUrl();
    if (!url) return;
    flashBtn(sendBtn, 'Sending...', 10000);
    fetch(url + '/config/yaml', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: yaml
    })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return fetch(url + '/config/reload', { method: 'POST' });
      })
      .then(function (resp) {
        if (!resp.ok) throw new Error('Reload failed: HTTP ' + resp.status);
        flashBtn(sendBtn, 'Sent!', 1500);
      })
      .catch(function (err) {
        showDimeError('Cannot reach DIME at ' + url + ' \u2014 ' + err.message);
        flashBtn(sendBtn, 'Failed', 2000);
      });
  }

  // ── Init ───────────────────────────────────────────────────────

  var toChatBtn, importBtn;

  function init() {
    bubble = document.getElementById('playground-bubble');
    pane = document.getElementById('playground-pane');
    closeBtn = document.getElementById('pg-close');
    validateBtn = document.getElementById('pg-validate');
    importBtn = document.getElementById('pg-import-btn');
    copyBtn = document.getElementById('pg-copy');
    toChatBtn = document.getElementById('pg-to-chat');
    receiveBtn = document.getElementById('pg-receive');
    sendBtn = document.getElementById('pg-send');
    sourceList = document.getElementById('pg-source-list');
    sinkList = document.getElementById('pg-sink-list');
    addSourceBtn = document.getElementById('pg-add-source');
    addSinkBtn = document.getElementById('pg-add-sink');
    yamlPre = document.getElementById('pg-yaml');
    statusEl = document.getElementById('pg-status');
    errorsEl = document.getElementById('pg-errors');

    if (!bubble || !pane) return;

    bubble.addEventListener('click', openPlayground);
    closeBtn.addEventListener('click', closePlayground);
    copyBtn.addEventListener('click', copyYaml);
    toChatBtn.addEventListener('click', sendToChat);
    if (receiveBtn) receiveBtn.addEventListener('click', receiveFromDime);
    if (sendBtn) sendBtn.addEventListener('click', sendToDime);
    importBtn.addEventListener('click', function () { openImportModal(); });
    validateBtn.addEventListener('click', function () { renderValidation(validate()); });
    addSourceBtn.addEventListener('click', function () { addConnector(false); });
    addSinkBtn.addEventListener('click', function () { addConnector(true); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pane.classList.contains('open')) {
        // Don't close playground if script modal or import modal is open
        if (scriptModal && scriptModal.classList.contains('open')) return;
        if (importModal && importModal.classList.contains('open')) {
          importModal.classList.remove('open');
          e.stopPropagation();
          return;
        }
        closePlayground();
        e.stopPropagation();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ──────────────────────────────────────────────────
  window.DIME_PG = {
    loadYaml: loadFromYaml,
    loadSchema: loadSchema,
    getSchema: function () { return schema; },
    getTypeEnum: getTypeEnum,
    getConnectorDef: getConnectorDef,
    getConnectorRequired: getConnectorRequired,
    getConnectorExample: getConnectorExample,
    getFullConnectorProps: getFullConnectorProps,
    getFullItemProps: getFullItemProps
  };
})();
