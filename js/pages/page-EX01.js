/**
 * EX01 — Basic Counter
 * The "hello world" of DIME: Script source → Console + HTTP + WebSocket.
 */
DIME_PAGES['EX01'] = {
  id: 'EX01',
  title: 'EX01 \u2014 Basic Counter',
  file: 'content/EX01-basic-counter.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex01-overview',
      startLine: 5, startCol: 2, endLine: 10, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Basic Counter \u2014 Overview',
        body:
          '<p>This is the simplest possible DIME configuration. It demonstrates the core pattern that every DIME integration follows:</p>' +
          '<ol>' +
          '<li><strong>Define a source</strong> \u2014 where data comes from</li>' +
          '<li><strong>Define one or more sinks</strong> \u2014 where data goes</li>' +
          '<li><strong>Run DIME</strong> \u2014 data flows automatically</li>' +
          '</ol>' +
          '<p>The Script connector uses embedded Lua to generate data without any external hardware. The <code>init_script</code> runs once at startup to initialize state. Each item\u2019s <code>script</code> runs every <code>scan_interval</code> milliseconds.</p>' +
          '<p>Three sinks consume the same data simultaneously from the ring buffer \u2014 Console for terminal output, HTTP Server for REST clients, and WebSocket Server for real-time browser dashboards.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting Deep Dive' },
          { page: '03', label: '03 \u2014 Installation & First Run' }
        ]
      }
    },
    {
      id: 'ex01-dataflow',
      startLine: 14, startCol: 2, endLine: 28, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Source \u2192 Ring Buffer \u2192 3 Sinks',
        body:
          '<p>Data flows through DIME in three stages:</p>' +
          '<ul>' +
          '<li><strong>Script Source</strong> \u2014 Lua increments a counter variable every 1000ms. The <code>return</code> value becomes the item\u2019s current value.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 The value is published as a <code>MessageBoxMessage</code> to the 4096-slot Disruptor ring buffer.</li>' +
          '<li><strong>3 Sinks</strong> \u2014 Each sink has its own independent event handler reading from the buffer:</li>' +
          '</ul>' +
          '<p><strong>Console</strong> \u2014 Prints the value to stdout. Great for debugging.<br>' +
          '<strong>HTTP Server</strong> \u2014 Exposes latest values at <code>http://localhost:8080</code>. Poll with any HTTP client.<br>' +
          '<strong>WebSocket Server</strong> \u2014 Pushes updates to connected clients at <code>ws://0.0.0.0:8092</code>.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '07', label: '07 \u2014 Sink Connectors' }
        ]
      }
    },
    {
      id: 'ex01-config',
      startLine: 32, startCol: 2, endLine: 68, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Single-File YAML Configuration',
        body:
          '<p>This config has three sections:</p>' +
          '<ul>' +
          '<li><strong>app</strong> \u2014 Global settings: license key, ring buffer size, admin API endpoints.</li>' +
          '<li><strong>sinks</strong> \u2014 Three output destinations. Each has a <code>name</code>, <code>connector</code> type, and type-specific settings like <code>uri</code>.</li>' +
          '<li><strong>sources</strong> \u2014 One Script source with an <code>init_script</code> (runs once) and an item with a <code>script</code> (runs every scan).</li>' +
          '</ul>' +
          '<p><strong>Key settings:</strong></p>' +
          '<ul>' +
          '<li><code>scan_interval: 1000</code> \u2014 Source reads and sink writes every 1 second</li>' +
          '<li><code>rbe: true</code> \u2014 Report By Exception; only publish when value changes</li>' +
          '<li><code>use_sink_transform: false</code> \u2014 Send raw MessageBoxMessage (no template formatting)</li>' +
          '</ul>',
        yaml:
          '# The minimal DIME pattern:\n' +
          'sources:\n' +
          '  - name: mySource\n' +
          '    connector: script\n' +
          '    scan_interval: !!int 1000\n' +
          '    items:\n' +
          '      - name: MyItem\n' +
          '        script: return 42\n' +
          '\n' +
          'sinks:\n' +
          '  - name: mySink\n' +
          '    connector: console',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '21', label: '21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex01-keyconcepts',
      startLine: 75, startCol: 2, endLine: 95, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Script Connector</strong> \u2014 The Script connector embeds a Lua (or Python) runtime inside DIME. No external dependencies needed. Use <code>init_script</code> for one-time setup and item-level <code>script</code> blocks for per-scan logic.</p>' +
          '<p><strong>Report By Exception (RBE)</strong> \u2014 When enabled, DIME compares each new value to the previous one. If unchanged, the message is suppressed. Since our counter always increments, every scan produces output. For slowly-changing sensors, RBE dramatically reduces traffic.</p>' +
          '<p><strong>YAML Type Tags</strong> \u2014 YAML treats bare <code>true</code> as a string in some parsers. DIME uses <code>!!bool true</code> and <code>!!int 1000</code> to guarantee correct .NET type coercion. Always use these tags for numeric and boolean config values.</p>' +
          '<p><strong>Admin Endpoints</strong> \u2014 The <code>app</code> section configures the admin REST API (port 9999) and admin WebSocket (port 9998). These are separate from your data sinks and are used for monitoring, health checks, and runtime control.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: '20', label: '20 \u2014 Report By Exception' },
          { page: '05', label: '05 \u2014 Architecture Overview' }
        ]
      }
    }
  ]
};
