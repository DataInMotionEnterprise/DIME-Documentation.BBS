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

  // Base connector fields to skip when rendering type-specific fields
  var BASE_FIELDS = ['name', 'enabled', 'scan_interval', 'connector',
    'rbe', 'ignore_errors_on_read', 'wait_for_connectors',
    'include_filter', 'exclude_filter', 'use_sink_transform',
    'items', 'itemized_read', 'create_dummy_messages_on_startup'];

  // ── Schema Loading ─────────────────────────────────────────────

  function loadSchema(cb) {
    if (schema) return cb();
    fetch('dime-schema.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { schema = data; cb(); })
      .catch(function () {
        showStatus('Failed to load schema', true);
      });
  }

  function getTypeEnum(isSink) {
    var key = isSink ? 'sinkConnector' : 'sourceConnector';
    var def = schema.definitions[key];
    // allOf[1].properties.connector.enum
    return def.allOf[1].properties.connector.enum || [];
  }

  function getConnectorDef(isSink, connType) {
    var suffix = isSink ? 'Sink' : 'Source';
    var defKey = connType + suffix;
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

  // ── State Management ───────────────────────────────────────────

  function addConnector(isSink) {
    var types = getTypeEnum(isSink);
    var defaultType = isSink ? 'console' : 'mqtt';
    if (types.indexOf(defaultType) === -1) defaultType = types[0];

    var conn = { _id: nextId++, connector: defaultType };

    // Pre-populate from example
    var ex = getConnectorExample(isSink, defaultType);
    if (ex) {
      for (var k in ex) {
        if (k !== 'items') conn[k] = ex[k];
      }
    }

    // Unique name
    conn.name = defaultType + '_' + conn._id;

    if (!isSink) {
      conn.items = [];
    }

    var list = isSink ? sinks : sources;
    list.push(conn);
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

    // Keep name and base fields
    var keepName = conn.name;
    var keepInterval = conn.scan_interval;
    var keepEnabled = conn.enabled;
    var keepItems = conn.items;

    // Reset to example
    var ex = getConnectorExample(isSink, newType);
    var cid = conn._id;
    for (var k in conn) {
      if (k === '_id') continue;
      delete conn[k];
    }
    conn.connector = newType;
    if (ex) {
      for (var k2 in ex) {
        if (k2 !== 'items') conn[k2] = ex[k2];
      }
    }
    conn._id = cid;
    conn.name = keepName;
    if (keepInterval !== undefined) conn.scan_interval = keepInterval;
    if (keepEnabled !== undefined) conn.enabled = keepEnabled;
    if (!isSink) conn.items = keepItems || [];

    renderColumn(isSink);
    updateYaml();
  }

  // ── Form Rendering ─────────────────────────────────────────────

  function renderColumn(isSink) {
    var container = isSink ? sinkList : sourceList;
    var list = isSink ? sinks : sources;
    container.innerHTML = '';

    if (list.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'pg-empty';
      empty.textContent = isSink ? 'No sinks — click + Add' : 'No sources — click + Add';
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
    card.setAttribute('data-id', conn._id);

    // Header with type dropdown
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
    typeSelect.addEventListener('change', (function (sid, cid) {
      return function (e) { changeConnectorType(sid, cid, e.target.value); };
    })(isSink, conn._id));

    var removeBtn = document.createElement('button');
    removeBtn.className = 'pg-card-remove';
    removeBtn.textContent = '\u00d7';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', (function (sid, cid) {
      return function () { removeConnector(sid, cid); };
    })(isSink, conn._id));

    header.appendChild(typeSelect);
    header.appendChild(removeBtn);
    card.appendChild(header);

    // Fields section
    var fields = document.createElement('div');
    fields.className = 'pg-card-fields';

    // Base fields
    fields.appendChild(buildField('name', { type: 'string', description: 'Unique connector name' }, conn.name, true,
      function (v) { conn.name = v; updateYaml(); }));

    fields.appendChild(buildField('scan_interval', { type: 'integer', description: 'Scan frequency (ms)', default: 1000 }, conn.scan_interval,
      false, function (v) { conn.scan_interval = parseInt(v) || 1000; updateYaml(); }));

    fields.appendChild(buildField('enabled', { type: 'boolean', description: 'Is connector enabled', default: true },
      conn.enabled !== undefined ? conn.enabled : true, false,
      function (v) { conn.enabled = v; updateYaml(); }));

    if (!isSink) {
      fields.appendChild(buildField('rbe', { type: 'boolean', description: 'Report by exception', default: true },
        conn.rbe !== undefined ? conn.rbe : true, false,
        function (v) { conn.rbe = v; updateYaml(); }));
    }

    // Connector-specific fields
    var def = getConnectorDef(isSink, conn.connector);
    var props = def.properties || {};
    var reqFields = getConnectorRequired(isSink, conn.connector);
    var hasSpecific = false;

    for (var key in props) {
      if (BASE_FIELDS.indexOf(key) !== -1) continue;
      if (!hasSpecific) {
        var divider = document.createElement('div');
        divider.className = 'pg-section-label';
        divider.textContent = conn.connector + ' settings';
        fields.appendChild(divider);
        hasSpecific = true;
      }
      var isReq = reqFields.indexOf(key) !== -1;
      var val = conn[key] !== undefined ? conn[key] : (props[key].default !== undefined ? props[key].default : '');
      fields.appendChild(buildField(key, props[key], val, isReq,
        (function (k, p) {
          return function (v) {
            if (p.type === 'integer') v = parseInt(v) || 0;
            else if (p.type === 'boolean') v = !!v;
            conn[k] = v;
            updateYaml();
          };
        })(key, props[key])
      ));
    }

    // Sink filters
    if (isSink) {
      var filterDiv = document.createElement('div');
      filterDiv.className = 'pg-section-label';
      filterDiv.textContent = 'filters';
      fields.appendChild(filterDiv);

      fields.appendChild(buildField('include_filter', { type: 'string', description: 'Comma-separated include paths' },
        (conn.include_filter || []).join(', '), false,
        function (v) {
          conn.include_filter = v ? v.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
          updateYaml();
        }));

      fields.appendChild(buildField('exclude_filter', { type: 'string', description: 'Comma-separated exclude paths' },
        (conn.exclude_filter || []).join(', '), false,
        function (v) {
          conn.exclude_filter = v ? v.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
          updateYaml();
        }));
    }

    card.appendChild(fields);

    // Items section (source only)
    if (!isSink) {
      card.appendChild(buildItemsSection(conn));
    }

    return card;
  }

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

  function buildItemsSection(conn) {
    var wrap = document.createElement('div');
    wrap.className = 'pg-items';

    var hdr = document.createElement('div');
    hdr.className = 'pg-items-header';

    var title = document.createElement('span');
    title.textContent = 'Items';
    hdr.appendChild(title);

    var addBtn = document.createElement('button');
    addBtn.className = 'pg-add-item';
    addBtn.textContent = '+ Add';
    addBtn.addEventListener('click', function () {
      conn.items.push({ name: 'item_' + (conn.items.length + 1), address: '' });
      renderColumn(false);
      updateYaml();
    });
    hdr.appendChild(addBtn);
    wrap.appendChild(hdr);

    for (var i = 0; i < conn.items.length; i++) {
      wrap.appendChild(buildItemRow(conn, i));
    }

    return wrap;
  }

  function buildItemRow(conn, idx) {
    var row = document.createElement('div');
    row.className = 'pg-item';

    var nameInp = document.createElement('input');
    nameInp.type = 'text';
    nameInp.value = conn.items[idx].name || '';
    nameInp.placeholder = 'name';
    nameInp.addEventListener('input', (function (ix) {
      return function (e) { conn.items[ix].name = e.target.value; updateYaml(); };
    })(idx));
    nameInp.addEventListener('keydown', function (e) { e.stopPropagation(); });

    var addrInp = document.createElement('input');
    addrInp.type = 'text';
    addrInp.value = conn.items[idx].address || '';
    addrInp.placeholder = 'address';
    addrInp.addEventListener('input', (function (ix) {
      return function (e) { conn.items[ix].address = e.target.value; updateYaml(); };
    })(idx));
    addrInp.addEventListener('keydown', function (e) { e.stopPropagation(); });

    var removeBtn = document.createElement('button');
    removeBtn.className = 'pg-item-remove';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', (function (ix) {
      return function () {
        conn.items.splice(ix, 1);
        renderColumn(false);
        updateYaml();
      };
    })(idx));

    row.appendChild(nameInp);
    row.appendChild(addrInp);
    row.appendChild(removeBtn);
    return row;
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

    // App section
    y.push('app:');
    y.push('  license: DEMO-0000-0000-0000-0000-0000-0000-0000');
    y.push('  ring_buffer: 4096');
    y.push('  http_server_uri: http://127.0.0.1:9999/');
    y.push('  ws_server_uri: ws://127.0.0.1:9998/');

    // Sources
    if (sources.length) {
      y.push('');
      y.push('sources:');
      for (var i = 0; i < sources.length; i++) {
        if (i > 0) y.push('');
        appendConnectorYaml(y, sources[i], false);
      }
    }

    // Sinks
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

  function appendConnectorYaml(lines, conn, isSink) {
    var indent = '  ';
    lines.push(indent + '- name: ' + yamlStr(conn.name || ''));
    lines.push(indent + '  connector: ' + conn.connector);

    if (conn.enabled === false) lines.push(indent + '  enabled: false');
    if (conn.scan_interval !== undefined && conn.scan_interval !== 1000) {
      lines.push(indent + '  scan_interval: ' + conn.scan_interval);
    }

    if (!isSink && conn.rbe !== undefined) {
      lines.push(indent + '  rbe: ' + conn.rbe);
    }

    // Connector-specific fields
    var def = getConnectorDef(isSink, conn.connector);
    var props = def.properties || {};
    for (var key in props) {
      if (BASE_FIELDS.indexOf(key) !== -1) continue;
      var val = conn[key];
      if (val === undefined || val === '') continue;
      lines.push(indent + '  ' + key + ': ' + yamlVal(val, props[key]));
    }

    // Filters
    if (isSink) {
      if (conn.include_filter && conn.include_filter.length) {
        lines.push(indent + '  include_filter:');
        for (var f = 0; f < conn.include_filter.length; f++) {
          lines.push(indent + '    - ' + yamlStr(conn.include_filter[f]));
        }
      }
      if (conn.exclude_filter && conn.exclude_filter.length) {
        lines.push(indent + '  exclude_filter:');
        for (var g = 0; g < conn.exclude_filter.length; g++) {
          lines.push(indent + '    - ' + yamlStr(conn.exclude_filter[g]));
        }
      }
    }

    // Items
    if (!isSink && conn.items && conn.items.length) {
      lines.push(indent + '  items:');
      for (var m = 0; m < conn.items.length; m++) {
        var item = conn.items[m];
        lines.push(indent + '    - name: ' + yamlStr(item.name || ''));
        if (item.address) {
          lines.push(indent + '      address: ' + yamlStr(item.address));
        }
      }
    }
  }

  function yamlVal(val, propDef) {
    if (!propDef) return String(val);
    if (propDef.type === 'boolean') return val ? 'true' : 'false';
    if (propDef.type === 'integer' || propDef.type === 'number') return String(val);
    return yamlStr(String(val));
  }

  function yamlStr(s) {
    if (s === '') return '""';
    if (/[:{}\[\],&*?|>!%@`#'"\\]/.test(s) || s === 'true' || s === 'false' || s === 'null' ||
        /^\d/.test(s) && !isNaN(Number(s))) {
      return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }
    return s;
  }

  // ── Validation ─────────────────────────────────────────────────

  function validate() {
    var errors = [];

    // Check sources
    for (var i = 0; i < sources.length; i++) {
      var s = sources[i];
      var prefix = 'sources[' + i + '] (' + s.connector + ')';
      if (!s.name || !s.name.trim()) {
        errors.push({ type: 'error', msg: prefix + ': missing required field "name"' });
      }

      // Check connector-specific required fields
      var req = getConnectorRequired(false, s.connector);
      var def = getConnectorDef(false, s.connector);
      for (var r = 0; r < req.length; r++) {
        if (s[req[r]] === undefined || s[req[r]] === '') {
          errors.push({ type: 'error', msg: prefix + ': missing required field "' + req[r] + '"' });
        }
      }

      // Check enum values
      var props = def.properties || {};
      for (var pk in props) {
        if (props[pk].enum && s[pk] !== undefined && s[pk] !== '') {
          if (props[pk].enum.indexOf(s[pk]) === -1 && props[pk].enum.indexOf(Number(s[pk])) === -1) {
            errors.push({ type: 'error', msg: prefix + ': "' + pk + '" must be one of [' + props[pk].enum.join(', ') + ']' });
          }
        }
      }

      // Warn if no items
      if (!s.items || s.items.length === 0) {
        errors.push({ type: 'warning', msg: prefix + ': no items defined' });
      }
    }

    // Check sinks
    for (var j = 0; j < sinks.length; j++) {
      var sk = sinks[j];
      var sprefix = 'sinks[' + j + '] (' + sk.connector + ')';
      if (!sk.name || !sk.name.trim()) {
        errors.push({ type: 'error', msg: sprefix + ': missing required field "name"' });
      }

      var sreq = getConnectorRequired(true, sk.connector);
      var sdef = getConnectorDef(true, sk.connector);
      for (var sr = 0; sr < sreq.length; sr++) {
        if (sk[sreq[sr]] === undefined || sk[sreq[sr]] === '') {
          errors.push({ type: 'error', msg: sprefix + ': missing required field "' + sreq[sr] + '"' });
        }
      }

      var sprops = sdef.properties || {};
      for (var spk in sprops) {
        if (sprops[spk].enum && sk[spk] !== undefined && sk[spk] !== '') {
          if (sprops[spk].enum.indexOf(sk[spk]) === -1 && sprops[spk].enum.indexOf(Number(sk[spk])) === -1) {
            errors.push({ type: 'error', msg: sprefix + ': "' + spk + '" must be one of [' + sprops[spk].enum.join(', ') + ']' });
          }
        }
      }
    }

    // Warn if empty
    if (sources.length === 0 && sinks.length === 0) {
      errors.push({ type: 'warning', msg: 'No sources or sinks configured' });
    }

    // Check duplicate names
    var names = {};
    var all = sources.concat(sinks);
    for (var n = 0; n < all.length; n++) {
      var nm = all[n].name;
      if (nm && names[nm]) {
        errors.push({ type: 'error', msg: 'Duplicate connector name: "' + nm + '"' });
      }
      names[nm] = true;
    }

    return errors;
  }

  function renderValidation(errors) {
    errorsEl.innerHTML = '';
    var errCount = 0;
    var warnCount = 0;

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

      if (e.type === 'error') errCount++;
      else warnCount++;
    }

    if (errCount === 0 && warnCount === 0) {
      showStatus('\u2713 Schema valid \u00b7 0 errors \u00b7 0 warnings', false);
    } else if (errCount === 0) {
      showStatus('\u2713 Valid \u00b7 ' + warnCount + ' warning' + (warnCount > 1 ? 's' : ''), false);
    } else {
      showStatus('\u2717 ' + errCount + ' error' + (errCount > 1 ? 's' : '') +
        ' \u00b7 ' + warnCount + ' warning' + (warnCount > 1 ? 's' : ''), true);
    }
  }

  function clearValidation() {
    if (errorsEl) errorsEl.innerHTML = '';
  }

  function updateStatus() {
    var srcCount = sources.length;
    var sinkCount = sinks.length;
    showStatus(srcCount + ' source' + (srcCount !== 1 ? 's' : '') +
      ' \u00b7 ' + sinkCount + ' sink' + (sinkCount !== 1 ? 's' : ''), false);
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
    validateBtn.addEventListener('click', function () {
      var errors = validate();
      renderValidation(errors);
    });

    addSourceBtn.addEventListener('click', function () { addConnector(false); });
    addSinkBtn.addEventListener('click', function () { addConnector(true); });

    // ESC to close (when playground is open)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pane.classList.contains('open')) {
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
