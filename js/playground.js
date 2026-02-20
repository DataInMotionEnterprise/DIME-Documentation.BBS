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

  // Fields handled in dedicated sections (skip in type-specific rendering)
  var BASE_FIELDS = [
    'name', 'enabled', 'scan_interval', 'connector',
    'rbe', 'ignore_errors_on_read', 'wait_for_connectors',
    'include_filter', 'exclude_filter', 'use_sink_transform',
    'items', 'itemized_read', 'create_dummy_messages_on_startup',
    'lang_script', 'paths_script', 'init_script', 'deinit_script',
    'enter_script', 'exit_script', 'item_script', 'strip_path_prefix', 'sink'
  ];

  var SCRIPT_FIELDS = ['init_script', 'deinit_script', 'enter_script', 'exit_script', 'item_script'];

  var STREAMING_SOURCES = [
    'activeMq', 'haasShdr', 'httpServer', 'mqtt', 'mtConnectAgent',
    'postgresNotify', 'redis', 'ros2', 'sparkplugB', 'timebaseWs', 'udpServer'
  ];

  // ── Schema Loading ─────────────────────────────────────────────

  function loadSchema(cb) {
    if (schema) return cb();
    fetch('dime-schema.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { schema = data; cb(); })
      .catch(function () { showStatus('Failed to load schema', true); });
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
    var defKey = connType + 'Item';
    var def = schema.definitions[defKey];
    if (!def || !def.allOf) return {};
    for (var i = 1; i < def.allOf.length; i++) {
      if (def.allOf[i].properties) return def.allOf[i].properties;
    }
    return {};
  }

  function isStreaming(connType) {
    return STREAMING_SOURCES.indexOf(connType) !== -1;
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
      if (BASE_FIELDS.indexOf(key) !== -1) continue;
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
    for (var i = 0; i < SCRIPT_FIELDS.length; i++) {
      var sf = SCRIPT_FIELDS[i];
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

  // ── YAML Generation ────────────────────────────────────────────

  function updateYaml() {
    if (!yamlPre) return;
    yamlPre.textContent = generateYaml();
    clearValidation();
    updateStatus();
  }

  function generateYaml() {
    var y = [];
    y.push('app:');
    y.push('  license: DEMO-0000-0000-0000-0000-0000-0000-0000');
    y.push('  ring_buffer: 4096');
    y.push('  http_server_uri: http://127.0.0.1:9999/');
    y.push('  ws_server_uri: ws://127.0.0.1:9998/');

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
      if (BASE_FIELDS.indexOf(key) !== -1) continue;
      var val = conn[key];
      if (val === undefined || val === '') continue;
      y.push(I2 + key + ': ' + yamlVal(val, props[key]));
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

      for (var si = 0; si < SCRIPT_FIELDS.length; si++) {
        var sf = SCRIPT_FIELDS[si];
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

    // Sink overrides
    if (item.sink) {
      var hasSink = item.sink.mtconnect || item.sink.opcua ||
        (item.sink.transform && (item.sink.transform.type || item.sink.transform.template));
      if (hasSink) {
        y.push(indent + '  sink:');
        if (item.sink.mtconnect) y.push(indent + '    mtconnect: ' + yamlStr(item.sink.mtconnect));
        if (item.sink.opcua) y.push(indent + '    opcua: ' + yamlStr(item.sink.opcua));
        if (item.sink.transform && (item.sink.transform.type || item.sink.transform.template)) {
          y.push(indent + '    transform:');
          if (item.sink.transform.type) y.push(indent + '      type: ' + yamlStr(item.sink.transform.type));
          if (item.sink.transform.template) yamlBlockScalar(y, indent + '      ', 'template', item.sink.transform.template);
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
    var text = yamlPre.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
      var orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () { copyBtn.textContent = orig; }, 1200);
    });
  }

  // ── Init ───────────────────────────────────────────────────────

  function init() {
    bubble = document.getElementById('playground-bubble');
    pane = document.getElementById('playground-pane');
    closeBtn = document.getElementById('pg-close');
    validateBtn = document.getElementById('pg-validate');
    copyBtn = document.getElementById('pg-copy');
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
    validateBtn.addEventListener('click', function () { renderValidation(validate()); });
    addSourceBtn.addEventListener('click', function () { addConnector(false); });
    addSinkBtn.addEventListener('click', function () { addConnector(true); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pane.classList.contains('open')) {
        // Don't close playground if script modal is open
        if (scriptModal && scriptModal.classList.contains('open')) return;
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
})();
