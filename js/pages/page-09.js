/**
 * 09 — Scripting (Lua & Python)
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['09'] = {
  id: '09',
  title: '09 \u2014 Scripting',
  file: 'content/09-scripting.md',
  hotspots: [
    {
      id: 'lifecycle',
      startLine: 17, startCol: 3, endLine: 53, endCol: 87,
      label: 'Script Execution Lifecycle',
      panel: {
        title: 'Five Script Hooks in the Connector Lifecycle',
        body:
          '<p>Scripts can hook into five points in the connector lifecycle:</p>' +
          '<ul>' +
          '<li><strong>init_script</strong> \u2014 Runs ONCE at connector initialization. Set up caches, load lookup tables, initialize state.</li>' +
          '<li><strong>enter_script</strong> \u2014 Runs ONCE per scan cycle, BEFORE any items are read. Reset per-loop accumulators.</li>' +
          '<li><strong>item_script</strong> (or just <code>script</code>) \u2014 Runs ONCE PER ITEM, every scan cycle. The <code>result</code> variable holds the raw value. Return the transformed value.</li>' +
          '<li><strong>exit_script</strong> \u2014 Runs ONCE per scan cycle, AFTER all items are read. Aggregations, summaries, batch emits.</li>' +
          '<li><strong>deinit_script</strong> \u2014 Runs ONCE at connector shutdown. Clean up resources, flush caches.</li>' +
          '</ul>' +
          '<p>The loop (enter \u2192 item \u2192 exit) repeats every <code>scan_interval</code> milliseconds. These hooks work identically for both Lua and Python scripts.</p>',
        related: [
          { page: '05', hotspot: 'lifecycle', label: '05 \u2014 Connector lifecycle stages' },
          { page: '09', hotspot: 'result-var', label: '09 \u2014 The result variable' },
          { page: '09', hotspot: 'emit', label: '09 \u2014 emit() function' }
        ]
      }
    },
    {
      id: 'result-var',
      startLine: 63, startCol: 3, endLine: 77, endCol: 82,
      label: 'The "result" Variable',
      panel: {
        title: 'result \u2014 Raw Data from the Source',
        body:
          '<p>Inside <code>item_script</code> (or <code>script</code>), the variable <code>result</code> holds the raw value read from the source device for the current item.</p>' +
          '<p>Possible types:</p>' +
          '<ul>' +
          '<li><strong>Number</strong> \u2014 72.5 (from a PLC register, OPC node, etc.)</li>' +
          '<li><strong>String</strong> \u2014 "RUNNING" (from a status tag) or JSON string</li>' +
          '<li><strong>Boolean</strong> \u2014 true / false</li>' +
          '<li><strong>nil / None</strong> \u2014 The source returned no data for this item</li>' +
          '</ul>' +
          '<p>Whatever you <code>return</code> from the script becomes the published message data. Return <code>nil</code> (Lua) or <code>None</code> (Python) to suppress the message entirely.</p>',
        related: [
          { page: '09', hotspot: 'lifecycle', label: '09 \u2014 When scripts run' },
          { page: '09', hotspot: 'emit', label: '09 \u2014 emit() for multi-output' },
          { page: '05', hotspot: 'message-format', label: '05 \u2014 MessageBoxMessage format' }
        ]
      }
    },
    {
      id: 'lang-select',
      startLine: 84, startCol: 3, endLine: 111, endCol: 92,
      label: 'Choosing a Language',
      panel: {
        title: 'lang_script \u2014 Lua vs Python',
        body:
          '<p>Set <code>lang_script</code> at the connector level to choose your scripting language. Default is Lua.</p>' +
          '<ul>' +
          '<li><strong>Lua (NLua)</strong> \u2014 Fast startup, low overhead. Helper functions are globals: <code>cache()</code>, <code>emit()</code>, <code>from_json()</code>.</li>' +
          '<li><strong>Python (IronPython)</strong> \u2014 CLR-hosted Python with standard library 3.4 and full .NET framework access. Helpers are prefixed: <code>dime.cache()</code>, <code>dime.emit()</code>, <code>dime.from_json()</code>.</li>' +
          '</ul>' +
          '<p>Use Lua for quick math and simple transforms. Use Python when you need complex parsing, standard library modules (json, math, re, datetime), or .NET interop.</p>',
        yaml:
          'sources:\n' +
          '  - name: my_device\n' +
          '    connector: OpcUa\n' +
          '    lang_script: python   # omit for Lua\n' +
          '    script: "return result * 2"',
        related: [
          { page: '09', hotspot: 'helpers', label: '09 \u2014 Lua vs Python helper reference' },
          { page: '09', hotspot: 'transforms', label: '09 \u2014 Basic transform examples' },
          { page: '06', hotspot: 'source-types', label: '06 \u2014 Source connector types' }
        ]
      }
    },
    {
      id: 'transforms',
      startLine: 118, startCol: 3, endLine: 156, endCol: 92,
      label: 'Basic Transforms',
      panel: {
        title: 'Basic Transforms \u2014 Lua & Python',
        body:
          '<p>Common transform patterns shown in both languages:</p>' +
          '<ul>' +
          '<li><strong>Scale / Convert</strong> \u2014 Arithmetic is identical in both. <code>return result * 2</code> works in Lua and Python.</li>' +
          '<li><strong>JSON Parsing</strong> \u2014 Lua uses <code>from_json(result)</code> with dot access (<code>d.value</code>). Python uses <code>json.loads(result)</code> with bracket access (<code>d[\'value\']</code>).</li>' +
          '<li><strong>Clamping</strong> \u2014 Lua uses if/then/end. Python can use <code>min(max(result, 0), 100)</code>.</li>' +
          '<li><strong>Manual RBE</strong> \u2014 Read with <code>cache()</code>, write with <code>set()</code>, and <code>return nil</code> to suppress unchanged.</li>' +
          '</ul>',
        related: [
          { page: '09', hotspot: 'lang-select', label: '09 \u2014 Choosing Lua vs Python' },
          { page: '09', hotspot: 'helpers', label: '09 \u2014 Helper function reference' },
          { page: '09', hotspot: 'examples', label: '09 \u2014 Full practical examples' }
        ]
      }
    },
    {
      id: 'emit',
      startLine: 166, startCol: 3, endLine: 211, endCol: 88,
      label: 'emit() \u2014 Fork Messages',
      panel: {
        title: 'emit() \u2014 One Input, Many Outputs',
        body:
          '<p>Use <code>emit(path, value)</code> (Lua) or <code>dime.emit(path, value)</code> (Python) inside any script to publish additional messages to the ring buffer.</p>' +
          '<p>One source read can produce multiple output paths. Common pattern: parse a JSON payload and emit each field as its own message.</p>' +
          '<p><code>emit_mtconnect(path, value, type)</code> / <code>dime.emit_mtconnect()</code> does the same but also attaches MTConnect DataItem mapping metadata.</p>' +
          '<p>After emitting, return <code>nil</code> (Lua) or <code>None</code> (Python) to suppress the original unparsed message, or return a value to keep it.</p>',
        yaml:
          '# Lua\n' +
          'script: |\n' +
          '  local data = from_json(result)\n' +
          '  emit(\'temperature\', data.temp)\n' +
          '  emit(\'pressure\', data.psi)\n' +
          '  return nil\n' +
          '\n' +
          '# Python (lang_script: python)\n' +
          'script: |\n' +
          '  import json\n' +
          '  data = json.loads(result)\n' +
          '  dime.emit(\'temperature\', data[\'temp\'])\n' +
          '  dime.emit(\'pressure\', data[\'psi\'])\n' +
          '  return None',
        related: [
          { page: '09', hotspot: 'helpers', label: '09 \u2014 Built-in helper functions' },
          { page: '09', hotspot: 'result-var', label: '09 \u2014 The result variable' },
          { page: '08', hotspot: 'paths', label: '08 \u2014 Message path format' },
          { page: '12', hotspot: 'complete-flow', label: '12 \u2014 PLC to dashboard walkthrough' }
        ]
      }
    },
    {
      id: 'helpers',
      startLine: 218, startCol: 3, endLine: 242, endCol: 92,
      label: 'Built-in Helpers \u2014 Lua vs Python',
      panel: {
        title: 'Helper Functions \u2014 Lua vs Python',
        body:
          '<p>All scripts have access to these built-in functions. In Lua they are globals; in Python they are prefixed with <code>dime.</code>:</p>' +
          '<ul>' +
          '<li><strong>Parse JSON</strong> \u2014 Lua: <code>from_json(str)</code> / Python: <code>dime.from_json(str)</code></li>' +
          '<li><strong>Serialize JSON</strong> \u2014 Lua: <code>to_json(tbl)</code> / Python: <code>dime.to_json(obj)</code></li>' +
          '<li><strong>Cache read</strong> \u2014 Lua: <code>cache(key)</code> or <code>cache(key, default)</code> / Python: <code>dime.cache(key)</code></li>' +
          '<li><strong>Cache timestamp</strong> \u2014 Lua: <code>cache_ts(key)</code> / Python: <code>dime.cache_ts(key)</code></li>' +
          '<li><strong>Cache write</strong> \u2014 Lua: <code>set(path, val)</code> / Python: <code>dime.set(path, val)</code></li>' +
          '<li><strong>Env variable</strong> \u2014 Lua: <code>env(name, default)</code> / Python: <code>dime.env(name, default)</code></li>' +
          '<li><strong>Emit</strong> \u2014 Lua: <code>emit(path, val)</code> / Python: <code>dime.emit(path, val)</code></li>' +
          '<li><strong>Connector/Config</strong> \u2014 Lua: <code>connector()</code>, <code>configuration()</code> / Python: <code>dime.connector()</code>, <code>dime.configuration()</code></li>' +
          '</ul>' +
          '<p>The cache persists across scan cycles. Python can also import standard library modules: json, math, re, datetime, etc.</p>',
        related: [
          { page: '10', hotspot: 'cache-read', label: '10 \u2014 Cache API deep dive' },
          { page: '09', hotspot: 'emit', label: '09 \u2014 emit() function' },
          { page: '09', hotspot: 'examples', label: '09 \u2014 Practical examples' }
        ]
      }
    },
    {
      id: 'examples',
      startLine: 249, startCol: 3, endLine: 288, endCol: 92,
      label: 'Practical Script Examples',
      panel: {
        title: 'Practical Examples \u2014 Lua & Python',
        body:
          '<p><strong>Unit Conversion (inline)</strong> \u2014 identical in both languages:</p>' +
          '<pre><code>script: "return (result - 32) * 5 / 9"</code></pre>' +
          '<p><strong>JSON Parsing + Multi-Emit</strong></p>' +
          '<pre><code class="language-lua">' +
          '-- Lua\n' +
          'local data = from_json(result)\n' +
          'for key, val in pairs(data) do\n' +
          '  emit(key, val)\n' +
          'end\n' +
          'return nil' +
          '</code></pre>' +
          '<pre><code class="language-python">' +
          '# Python\n' +
          'import json\n' +
          'data = json.loads(result)\n' +
          'for key in data:\n' +
          '  dime.emit(key, data[key])\n' +
          'return None' +
          '</code></pre>' +
          '<p><strong>State Machine with Cache</strong></p>' +
          '<pre><code class="language-lua">' +
          '-- Lua\n' +
          'local prev = cache(\'machine_state\')\n' +
          'if result ~= prev then\n' +
          '  set(\'machine_state\', result)\n' +
          '  emit(\'state_changed\', to_json({\n' +
          '    from = prev, to = result\n' +
          '  }))\n' +
          'end\n' +
          'return result' +
          '</code></pre>' +
          '<pre><code class="language-python">' +
          '# Python\n' +
          'prev = dime.cache(\'machine_state\')\n' +
          'if result != prev:\n' +
          '  dime.set(\'machine_state\', result)\n' +
          '  dime.emit(\'state_changed\',\n' +
          '    dime.to_json({\n' +
          '      \'from\': prev, \'to\': result\n' +
          '    }))\n' +
          'return result' +
          '</code></pre>' +
          '<p>Scripts can be inline one-liners or multiline YAML blocks (using <code>|</code> or <code>&gt;</code>). Use <code>paths_script:</code> to add module search directories.</p>',
        related: [
          { page: '09', hotspot: 'emit', label: '09 \u2014 emit() function' },
          { page: '09', hotspot: 'helpers', label: '09 \u2014 Helper functions' },
          { page: '10', hotspot: 'cache-read', label: '10 \u2014 Cache API details' },
          { page: 'EX25', label: 'EX25 \u2014 Lua Script Basics' },
          { page: 'EX26', label: 'EX26 \u2014 Python Scripting' }
        ]
      }
    }
  ]
};
