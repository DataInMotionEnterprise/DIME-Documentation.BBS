/**
 * 04 — YAML Configuration Basics
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['04'] = {
  id: '04',
  title: '04 \u2014 YAML Configuration',
  file: 'content/04-yaml-basics.md',
  hotspots: [
    {
      id: 'app-section',
      startLine: 18, startCol: 3, endLine: 29, endCol: 31,
      label: 'App Configuration Block',
      panel: {
        title: 'The app Section \u2014 Global Settings',
        body:
          '<p>The <strong>app</strong> section controls DIME itself \u2014 not any individual connector:</p>' +
          '<ul>' +
          '<li><strong>license</strong> \u2014 Your license key. Empty string or omitted = demo mode (150 minutes, then stops).</li>' +
          '<li><strong>ring_buffer</strong> (<code>!!int 4096</code>) \u2014 Disruptor ring buffer size. Must be a power of 2. Higher = more burst capacity, more memory.</li>' +
          '<li><strong>http_server_uri</strong> (<code>http://*:9999</code>) \u2014 Admin REST API listen address. Swagger UI at /swagger.</li>' +
          '<li><strong>ws_server_uri</strong> (<code>ws://*:9998</code>) \u2014 Admin WebSocket for real-time telemetry and state changes.</li>' +
          '</ul>' +
          '<p>These are the only required app settings. All have sensible defaults except the license key.</p>',
        yaml:
          'app:\n' +
          '  license: XXXX-XXXX-XXXX-XXXX\n' +
          '  ring_buffer: !!int 4096\n' +
          '  http_server_uri: http://*:9999\n' +
          '  ws_server_uri: ws://*:9998',
        related: [
          { page: '01', hotspot: 'features', label: '01 \u2014 Why choose DIME?' },
          { page: '05', hotspot: 'admin-server', label: '05 \u2014 Admin server endpoints' }
        ]
      }
    },
    {
      id: 'source-anatomy',
      startLine: 45, startCol: 3, endLine: 59, endCol: 89,
      label: 'Source Configuration Structure',
      panel: {
        title: 'Source Connector Anatomy',
        body:
          '<p>Every source connector shares these fields:</p>' +
          '<ul>' +
          '<li><strong>name</strong> \u2014 Unique identifier. Becomes the first segment of the message path (<code>name/item_name</code>).</li>' +
          '<li><strong>connector</strong> \u2014 The connector type: OpcUA, Modbus, MQTT, S7, Script, etc.</li>' +
          '<li><strong>scan_interval</strong> (<code>!!int</code>) \u2014 Polling frequency in milliseconds. How often the source reads all its items.</li>' +
          '<li><strong>rbe</strong> (<code>!!bool</code>) \u2014 Report By Exception. When true, only publishes when a value actually changes.</li>' +
          '<li><strong>enabled</strong> (<code>!!bool</code>) \u2014 Set to false to skip this source at startup without deleting the config.</li>' +
          '<li><strong>items[]</strong> \u2014 The individual data points to read. Each item has its own name, address, and optional script.</li>' +
          '</ul>' +
          '<p>Additional fields are connector-specific (e.g., <code>address</code> for OPC-UA, <code>topic</code> for MQTT).</p>',
        yaml:
          'sources:\n' +
          '  - name: my_plc\n' +
          '    connector: OpcUA\n' +
          '    scan_interval: !!int 1000\n' +
          '    rbe: !!bool true\n' +
          '    enabled: !!bool true\n' +
          '    items:\n' +
          '      - name: Temperature\n' +
          '        address: ns=2;s=PLC.Temp',
        related: [
          { page: '06', label: '06 \u2014 Source connectors reference' },
          { page: '04', hotspot: 'item-anatomy', label: 'Item anatomy details' },
          { page: '05', hotspot: 'source-types', label: '05 \u2014 Source connector base classes' }
        ]
      }
    },
    {
      id: 'sink-anatomy',
      startLine: 71, startCol: 3, endLine: 84, endCol: 89,
      label: 'Sink Configuration Structure',
      panel: {
        title: 'Sink Connector Anatomy',
        body:
          '<p>Every sink connector shares these fields:</p>' +
          '<ul>' +
          '<li><strong>name</strong> \u2014 Unique identifier for this sink.</li>' +
          '<li><strong>connector</strong> \u2014 The sink type: InfluxLP, MQTT, Console, MtcAgent, SparkplugB, etc.</li>' +
          '<li><strong>enabled</strong> (<code>!!bool</code>) \u2014 Set to false to skip this sink at startup.</li>' +
          '<li><strong>include_filter</strong> \u2014 Regex pattern. Only messages whose path matches are delivered. Default: <code>.*</code> (everything).</li>' +
          '<li><strong>exclude_filter</strong> \u2014 Regex pattern. Messages whose path matches are dropped. Applied after include_filter.</li>' +
          '</ul>' +
          '<p>Filters use the message path format <code>source_name/item_name</code>. For example, <code>include_filter: my_plc/.*</code> receives only items from "my_plc".</p>' +
          '<p>Additional fields are connector-specific (e.g., <code>address</code>, <code>port</code>, <code>template</code>).</p>',
        yaml:
          'sinks:\n' +
          '  - name: my_database\n' +
          '    connector: InfluxLP\n' +
          '    enabled: !!bool true\n' +
          '    include_filter: .*\n' +
          '    exclude_filter: ""\n' +
          '    address: https://influx.local',
        related: [
          { page: '07', label: '07 \u2014 Sink connectors reference' },
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 How data reaches sinks' }
        ]
      }
    },
    {
      id: 'item-anatomy',
      startLine: 96, startCol: 3, endLine: 117, endCol: 89,
      label: 'Item Configuration & Type Tags',
      panel: {
        title: 'Item Anatomy & YAML Type Tags',
        body:
          '<p>Items are the individual data points inside a source:</p>' +
          '<ul>' +
          '<li><strong>name</strong> \u2014 Becomes the second segment of the message path: <code>source_name/item_name</code>.</li>' +
          '<li><strong>address</strong> \u2014 Protocol-specific address on the device (OPC-UA node, Modbus register, MQTT topic, etc.).</li>' +
          '<li><strong>script</strong> \u2014 Optional Lua or Python transform. Can be inline YAML or a file path. Access data via <code>msg.data</code>.</li>' +
          '<li><strong>rbe</strong> (<code>!!bool</code>) \u2014 Per-item Report By Exception override. Takes precedence over the source-level setting.</li>' +
          '<li><strong>enabled</strong> (<code>!!bool</code>) \u2014 Disable individual items without removing them from config.</li>' +
          '</ul>' +
          '<h4>YAML Type Tags</h4>' +
          '<p>DIME uses YAML type tags to distinguish typed values from strings:</p>' +
          '<ul>' +
          '<li><code>!!bool true</code> / <code>!!bool false</code> \u2014 Boolean values</li>' +
          '<li><code>!!int 4096</code> / <code>!!int 1000</code> \u2014 Integer values</li>' +
          '</ul>' +
          '<p>Without tags, YAML parsers may treat values as strings, causing unexpected behavior.</p>',
        yaml:
          'items:\n' +
          '  - name: Temperature\n' +
          '    address: ns=2;s=PLC.Temp\n' +
          '    script: |\n' +
          '      return msg.data * 1.8 + 32\n' +
          '    rbe: !!bool true\n' +
          '    enabled: !!bool true',
        related: [
          { page: '04', hotspot: 'source-anatomy', label: 'Source anatomy (parent)' },
          { page: '06', label: '06 \u2014 Source connectors reference' }
        ]
      }
    },
    {
      id: 'file-loading',
      startLine: 129, startCol: 3, endLine: 147, endCol: 89,
      label: 'Multi-File Configuration',
      panel: {
        title: 'File Loading & Merge Order',
        body:
          '<p>DIME supports splitting configuration across multiple YAML files:</p>' +
          '<ul>' +
          '<li><strong>All *.yaml files</strong> in the config directory are loaded and merged automatically.</li>' +
          '<li><strong>main.yaml is loaded last</strong> \u2014 its values override anything from other files.</li>' +
          '<li><strong>Arrays are concatenated</strong> \u2014 sources and sinks from different files are combined, not replaced.</li>' +
          '</ul>' +
          '<h4>YAML Anchors & Aliases</h4>' +
          '<p>Use anchors (<code>&name</code>) and aliases (<code>*name</code>) to share common settings:</p>' +
          '<ul>' +
          '<li>Define defaults once: <code>&defaults { scan_interval: !!int 1000, rbe: !!bool true }</code></li>' +
          '<li>Reuse everywhere: <code>&lt;&lt;: *defaults</code></li>' +
          '</ul>' +
          '<p>This works within a single file. Cross-file anchors are not supported by the YAML spec.</p>',
        yaml:
          '# main.yaml (loaded last)\n' +
          'app:\n' +
          '  license: XXXX-XXXX-XXXX-XXXX\n' +
          '  ring_buffer: !!int 4096\n' +
          '\n' +
          '# opcua-source.yaml\n' +
          'sources:\n' +
          '  - name: my_plc\n' +
          '    connector: OpcUA\n' +
          '\n' +
          '# influx-sink.yaml\n' +
          'sinks:\n' +
          '  - name: my_db\n' +
          '    connector: InfluxLP',
        related: [
          { page: '01', hotspot: 'yaml-config', label: '01 \u2014 YAML config example' },
          { page: '03', hotspot: 'directories', label: '03 \u2014 Directory layout' }
        ]
      }
    },
    {
      id: 'minimal-example',
      startLine: 159, startCol: 3, endLine: 177, endCol: 89,
      label: 'Minimal Working Config',
      panel: {
        title: 'Minimal Working Example \u2014 Script \u2192 Console',
        body:
          '<p>The absolute smallest config that produces output. A Lua <strong>Script</strong> source generates data, and a <strong>Console</strong> sink prints it to stdout:</p>' +
          '<ul>' +
          '<li><strong>Script source</strong> \u2014 Executes a Lua expression on each scan. No device needed.</li>' +
          '<li><strong>Console sink</strong> \u2014 Prints every message to the terminal. No database needed.</li>' +
          '</ul>' +
          '<p>Run <code>DIME.exe</code> (or <code>./DIME run</code> on Linux) and you will see timestamps printed every 5 seconds.</p>' +
          '<p>Replace <code>Script</code> with any real source connector (OpcUA, Modbus, MQTT) and <code>Console</code> with any real sink (InfluxLP, MQTT, SparkplugB) to build a production integration.</p>',
        yaml:
          'app:\n' +
          '  license: ""\n' +
          '  ring_buffer: !!int 4096\n' +
          '\n' +
          'sources:\n' +
          '  - name: heartbeat\n' +
          '    connector: Script\n' +
          '    scan_interval: !!int 5000\n' +
          '    items:\n' +
          '      - name: pulse\n' +
          '        script: return os.time()\n' +
          '\n' +
          'sinks:\n' +
          '  - name: screen\n' +
          '    connector: Console',
        related: [
          { page: '01', hotspot: 'yaml-config', label: '01 \u2014 YAML config example' },
          { page: '03', hotspot: 'quick-start', label: '03 \u2014 Quick start guide' },
          { page: '06', label: '06 \u2014 Source connectors reference' },
          { page: '07', label: '07 \u2014 Sink connectors reference' }
        ]
      }
    }
  ]
};
