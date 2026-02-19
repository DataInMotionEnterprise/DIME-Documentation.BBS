/**
 * 09 — Lua Scripting & Transforms
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['09'] = {
  id: '09',
  title: '09 \u2014 Lua Scripting',
  file: 'content/09-lua-scripting.md',
  hotspots: [
    {
      id: 'lifecycle',
      startLine: 17, startCol: 3, endLine: 53, endCol: 87,
      label: 'Script Execution Lifecycle',
      panel: {
        title: 'Six Script Hooks in the Connector Lifecycle',
        body:
          '<p>Scripts can hook into six points in the connector lifecycle:</p>' +
          '<ul>' +
          '<li><strong>init_script</strong> \u2014 Runs ONCE at connector initialization. Set up caches, load lookup tables, initialize state.</li>' +
          '<li><strong>loop_enter_script</strong> \u2014 Runs ONCE per scan cycle, BEFORE any items are read. Reset per-loop accumulators.</li>' +
          '<li><strong>loop_item_script</strong> (or just <code>script</code>) \u2014 Runs ONCE PER ITEM, every scan cycle. The <code>result</code> variable holds the raw value. Return the transformed value.</li>' +
          '<li><strong>loop_exit_script</strong> \u2014 Runs ONCE per scan cycle, AFTER all items are read. Aggregations, summaries, batch emits.</li>' +
          '<li><strong>deinit_script</strong> \u2014 Runs ONCE at connector shutdown. Clean up resources, flush caches.</li>' +
          '</ul>' +
          '<p>The loop (enter \u2192 item \u2192 exit) repeats every <code>scan_interval</code> milliseconds.</p>',
        related: [
          { page: '02', hotspot: 'lifecycle', label: '02 \u2014 Connector lifecycle stages' },
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
          '<p>Inside <code>loop_item_script</code> (or <code>script</code>), the variable <code>result</code> holds the raw value read from the source device for the current item.</p>' +
          '<p>Possible types:</p>' +
          '<ul>' +
          '<li><strong>Number</strong> \u2014 72.5 (from a PLC register, OPC node, etc.)</li>' +
          '<li><strong>String</strong> \u2014 "RUNNING" (from a status tag) or JSON string</li>' +
          '<li><strong>Boolean</strong> \u2014 true / false</li>' +
          '<li><strong>nil</strong> \u2014 The source returned no data for this item</li>' +
          '</ul>' +
          '<p>Whatever you <code>return</code> from the script becomes the published message data. Return <code>nil</code> to suppress the message entirely (it will not be published to the ring buffer).</p>',
        related: [
          { page: '09', hotspot: 'lifecycle', label: '09 \u2014 When scripts run' },
          { page: '09', hotspot: 'emit', label: '09 \u2014 emit() for multi-output' },
          { page: '02', hotspot: 'message-format', label: '02 \u2014 MessageBoxMessage format' }
        ]
      }
    },
    {
      id: 'emit',
      startLine: 117, startCol: 3, endLine: 146, endCol: 86,
      label: 'emit() \u2014 Fork Messages',
      panel: {
        title: 'emit() \u2014 One Input, Many Outputs',
        body:
          '<p>Use <code>emit(path, value)</code> inside any script to publish additional messages to the ring buffer.</p>' +
          '<p>One source read can produce multiple output paths. Common pattern: parse a JSON payload and emit each field as its own message.</p>' +
          '<p><code>emit_mtconnect(path, value, type)</code> does the same but also attaches MTConnect DataItem mapping metadata.</p>' +
          '<p>After emitting, return <code>nil</code> to suppress the original unparsed message, or return a value to keep it.</p>',
        yaml:
          'script: |\n' +
          '  local data = from_json(result)\n' +
          '  emit(\'temperature\', data.temp)\n' +
          '  emit(\'pressure\', data.psi)\n' +
          '  emit(\'status\', data.running)\n' +
          '  return nil  -- suppress original',
        related: [
          { page: '09', hotspot: 'helpers', label: '09 \u2014 Built-in helper functions' },
          { page: '09', hotspot: 'result-var', label: '09 \u2014 The result variable' },
          { page: '08', hotspot: 'paths', label: '08 \u2014 Message path format' },
          { page: '12', hotspot: 'walkthrough', label: '12 \u2014 PLC walkthrough' }
        ]
      }
    },
    {
      id: 'helpers',
      startLine: 153, startCol: 3, endLine: 175, endCol: 82,
      label: 'Built-in Helper Functions',
      panel: {
        title: 'Helper Functions Available in Scripts',
        body:
          '<p>All scripts have access to these built-in functions:</p>' +
          '<ul>' +
          '<li><strong>from_json(str)</strong> \u2014 Parse a JSON string into a Lua table</li>' +
          '<li><strong>to_json(table)</strong> \u2014 Serialize a Lua table back to JSON</li>' +
          '<li><strong>cache(key)</strong> \u2014 Read a value from the persistent cache</li>' +
          '<li><strong>cache(key, value)</strong> \u2014 Write a value to the persistent cache</li>' +
          '<li><strong>cache_ts(key)</strong> \u2014 Get the timestamp when a cached value was last set</li>' +
          '<li><strong>set(path, value)</strong> \u2014 Set a value in the connector\'s item map</li>' +
          '<li><strong>env(name)</strong> \u2014 Read an environment variable</li>' +
          '<li><strong>connector</strong> \u2014 Reference to the current connector object</li>' +
          '<li><strong>configuration</strong> \u2014 Reference to the connector\'s config object</li>' +
          '<li><strong>emit(path, value)</strong> \u2014 Publish a new message to the ring buffer</li>' +
          '<li><strong>emit_mtconnect(path, value, type)</strong> \u2014 Publish with MTConnect mapping</li>' +
          '<li><strong>log_info/log_warn/log_error(msg)</strong> \u2014 Write to DIME log at specified level</li>' +
          '</ul>' +
          '<p>The cache persists across scan cycles, making it ideal for tracking state, computing deltas, and implementing custom RBE logic.</p>',
        related: [
          { page: '10', hotspot: 'cache-api', label: '10 \u2014 Cache API deep dive' },
          { page: '09', hotspot: 'emit', label: '09 \u2014 emit() function' },
          { page: '09', hotspot: 'examples', label: '09 \u2014 Practical examples' }
        ]
      }
    },
    {
      id: 'python',
      startLine: 186, startCol: 3, endLine: 212, endCol: 82,
      label: 'Python Alternative',
      panel: {
        title: 'Python Scripts via lang_script: python',
        body:
          '<p>Set <code>lang_script: python</code> in your YAML to use Python instead of Lua. The same lifecycle hooks and helper functions are available.</p>' +
          '<p>Key differences:</p>' +
          '<ul>' +
          '<li><strong>Runtime</strong> \u2014 Embedded CLR Python (IronPython)</li>' +
          '<li><strong>Module imports</strong> \u2014 Standard library modules plus custom modules in the Python/ directory</li>' +
          '<li><strong>Performance</strong> \u2014 Slower than Lua. Use Python only when you need complex transforms, specific libraries, or more expressive syntax.</li>' +
          '<li><strong>Default</strong> \u2014 If <code>lang_script</code> is not specified, Lua is used (faster startup, lower overhead).</li>' +
          '</ul>',
        yaml:
          'sources:\n' +
          '  - name: my_source\n' +
          '    connector: MQTT\n' +
          '    lang_script: python\n' +
          '    script: |\n' +
          '      import json\n' +
          '      data = json.loads(result)\n' +
          '      emit(\'temperature\', data[\'temp\'])\n' +
          '      return None',
        related: [
          { page: '09', hotspot: 'lifecycle', label: '09 \u2014 Script lifecycle hooks' },
          { page: '09', hotspot: 'helpers', label: '09 \u2014 Built-in helpers' },
          { page: '11', hotspot: 'templates', label: '11 \u2014 Output templates' }
        ]
      }
    },
    {
      id: 'examples',
      startLine: 219, startCol: 3, endLine: 253, endCol: 82,
      label: 'Practical Script Examples',
      panel: {
        title: 'Practical Lua Script Examples',
        body:
          '<p><strong>Unit Conversion (inline)</strong></p>' +
          '<pre><code>script: "return (result - 32) * 5 / 9"</code></pre>' +
          '<p><strong>JSON Parsing + Multi-Emit</strong></p>' +
          '<pre><code>script: |\n  local data = from_json(result)\n  for key, val in pairs(data) do\n    emit(key, val)\n  end\n  return nil</code></pre>' +
          '<p><strong>State Machine with Cache</strong></p>' +
          '<pre><code>script: |\n  local prev = cache(\'machine_state\')\n  if result ~= prev then\n    cache(\'machine_state\', result)\n    emit(\'state_changed\', to_json({\n      from = prev, to = result\n    }))\n  end\n  return result</code></pre>' +
          '<p>Scripts can be inline (one-liners), multiline YAML blocks, or loaded from external .lua files via <code>script_file:</code>.</p>',
        related: [
          { page: '09', hotspot: 'emit', label: '09 \u2014 emit() function' },
          { page: '09', hotspot: 'helpers', label: '09 \u2014 Helper functions' },
          { page: '10', hotspot: 'cache-api', label: '10 \u2014 Cache API details' },
          { page: '12', hotspot: 'walkthrough', label: '12 \u2014 PLC walkthrough' },
          { page: '08', hotspot: 'paths', label: '08 \u2014 Message paths' }
        ]
      }
    }
  ]
};
