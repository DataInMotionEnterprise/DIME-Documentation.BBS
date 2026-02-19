/**
 * 05 — Architecture Overview
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['05'] = {
  id: '05',
  title: '05 \u2014 Architecture',
  file: 'content/05-architecture.md',
  hotspots: [
    {
      id: 'big-picture',
      startLine: 19, startCol: 3, endLine: 34, endCol: 85,
      label: 'Three-Layer Architecture',
      panel: {
        title: 'Read \u2192 Route \u2192 Write',
        body:
          '<p>DIME is three layers: <strong>Sources</strong> (read), <strong>Ring Buffer</strong> (route), and <strong>Sinks</strong> (write).</p>' +
          '<p>Each source runs on its own timer, independently. The SinkDispatcher pushes every message to every registered sink. Each sink also runs independently.</p>' +
          '<p>A fault in one connector never affects any other \u2014 full isolation by design.</p>',
        related: [
          { page: '01', hotspot: 'how-it-works', label: '01 \u2014 How it works overview' }
        ]
      }
    },
    {
      id: 'data-flow',
      startLine: 44, startCol: 4, endLine: 72, endCol: 88,
      label: 'Detailed Data Flow',
      panel: {
        title: 'Following a Data Point End-to-End',
        body:
          '<p>A single data point flows through:</p>' +
          '<ul>' +
          '<li><strong>Physical Device</strong> \u2192 Source Connector reads via protocol (OPC-UA, S7, MQTT, etc.)</li>' +
          '<li><strong>Lua Transform</strong> (optional) \u2192 Reshape, filter, or enrich the raw data</li>' +
          '<li><strong>Ring Buffer</strong> \u2192 4096-slot Disruptor ring buffer</li>' +
          '<li><strong>SinkDispatcher</strong> \u2192 Fans out to ALL registered sinks</li>' +
          '<li><strong>Each Sink</strong> \u2192 Applies include/exclude filters, templates, writes to destination</li>' +
          '</ul>' +
          '<p>Sinks can filter by path regex. One gets only PLC data, another gets everything except system messages.</p>',
        related: [
          { page: '05', hotspot: 'message-format', label: 'The MessageBoxMessage format' },
          { page: '05', hotspot: 'source-types', label: 'Source connector base classes' }
        ]
      }
    },
    {
      id: 'message-format',
      startLine: 82, startCol: 3, endLine: 101, endCol: 72,
      label: 'MessageBoxMessage Format',
      panel: {
        title: 'MessageBoxMessage \u2014 The Data Envelope',
        body:
          '<p>Every piece of data flowing through DIME is a <strong>MessageBoxMessage</strong> with four fields:</p>' +
          '<ul>' +
          '<li><strong>Path</strong> \u2014 "source_name/item_name" \u2014 used for routing, filtering, subscriptions</li>' +
          '<li><strong>Data</strong> \u2014 The actual value (any type)</li>' +
          '<li><strong>Timestamp</strong> \u2014 Epoch milliseconds when the value was read</li>' +
          '<li><strong>ConnectorItemRef</strong> \u2014 Metadata: RBE flag, sink mappings, MTConnect path, original config</li>' +
          '</ul>' +
          '<p>The Path is how sinks filter (regex match), how dashboards subscribe, and how data is routed.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: 'Detailed data flow diagram' }
        ]
      }
    },
    {
      id: 'lifecycle',
      startLine: 115, startCol: 5, endLine: 153, endCol: 58,
      label: 'Connector Lifecycle',
      panel: {
        title: 'Six-Stage Connector Lifecycle',
        body:
          '<p>Every connector follows the same lifecycle, managed by <strong>ConnectorRunner</strong>:</p>' +
          '<ul>' +
          '<li><strong>Initialize</strong> \u2014 Load config, run init script</li>' +
          '<li><strong>Create</strong> \u2014 Build internal resources</li>' +
          '<li><strong>Connect</strong> \u2014 Open connection to device/destination</li>' +
          '<li><strong>Read/Write</strong> \u2014 Main loop: timer-driven polling or event-driven receiving</li>' +
          '<li><strong>Disconnect</strong> \u2014 Close connection gracefully</li>' +
          '<li><strong>Deinitialize</strong> \u2014 Run deinit script, release all resources</li>' +
          '</ul>' +
          '<p>If any stage fails, ConnectorRunner tracks the fault and retries. Faults in one connector never affect others.</p>',
        related: [
          { page: '05', hotspot: 'source-types', label: 'Source connector base classes' },
          { page: '05', hotspot: 'system-diagram', label: 'Full system diagram' }
        ]
      }
    },
    {
      id: 'source-types',
      startLine: 167, startCol: 3, endLine: 203, endCol: 87,
      label: 'Source Connector Base Classes',
      panel: {
        title: 'Four Source Connector Types',
        body:
          '<p>Pick the base class that matches how your device delivers data:</p>' +
          '<ul>' +
          '<li><strong>PollingSourceConnector</strong> \u2014 Timer fires every scan_interval, reads all items, publishes. Used by OPC-UA, Modbus, S7, HTTP, SNMP.</li>' +
          '<li><strong>QueuingSourceConnector</strong> \u2014 Messages arrive asynchronously, queued in inbox, drained on timer. Used by MQTT, SparkplugB, WebSocket.</li>' +
          '<li><strong>BatchPollingSourceConnector</strong> \u2014 Timer fires, executes query, iterates result set. Used by SQL Server, PostgreSQL sources.</li>' +
          '<li><strong>DatabaseSourceConnector</strong> \u2014 Timer fires, SQL query, maps columns to named items. Used by database connectors with column-level mapping.</li>' +
          '</ul>',
        related: [
          { page: '01', hotspot: 'connectors', label: '01 \u2014 47+ connector types' }
        ]
      }
    },
    {
      id: 'admin-server',
      startLine: 214, startCol: 3, endLine: 229, endCol: 78,
      label: 'Admin REST & WebSocket APIs',
      panel: {
        title: 'The Admin Server',
        body:
          '<p>Every DIME instance exposes two endpoints \u2014 always on, no extra config:</p>' +
          '<ul>' +
          '<li><strong>REST API</strong> (port 9999) \u2014 GET /status, GET /config, POST /sinks (add at runtime), GET /cache. Swagger UI included.</li>' +
          '<li><strong>WebSocket</strong> (port 9998) \u2014 Real-time stream: connector state changes, performance telemetry, loop timing, fault notifications.</li>' +
          '</ul>' +
          '<p>The REST API enables <strong>zero-downtime reconfiguration</strong> \u2014 add sinks without restarting.</p>' +
          '<p>The WebSocket powers the <strong>DIME web dashboard</strong> for live monitoring.</p>',
        related: [
          { page: '03', hotspot: 'verify', label: '03 \u2014 Verify it works' },
          { page: '03', hotspot: 'ports', label: '03 \u2014 Default ports' }
        ]
      }
    },
    {
      id: 'system-diagram',
      startLine: 240, startCol: 3, endLine: 274, endCol: 90,
      label: 'DimeService System Overview',
      panel: {
        title: 'Putting It All Together',
        body:
          '<p><strong>DimeService</strong> is the top-level orchestrator:</p>' +
          '<ul>' +
          '<li>Loads and merges YAML config files</li>' +
          '<li>Creates connectors via SourceConnectorFactory and SinkConnectorFactory</li>' +
          '<li>Starts the Disruptor Ring Buffer</li>' +
          '<li>Wraps each connector in an independent ConnectorRunner</li>' +
          '<li>Starts the Admin Server (REST + WebSocket)</li>' +
          '</ul>' +
          '<p>Each ConnectorRunner is fully independent \u2014 different timers, different protocols. A fault in one never blocks another.</p>',
        related: [
          { page: '05', hotspot: 'lifecycle', label: 'Connector lifecycle stages' },
          { page: '05', hotspot: 'admin-server', label: 'Admin server endpoints' }
        ]
      }
    },
    {
      id: 'performance',
      startLine: 282, startCol: 3, endLine: 294, endCol: 87,
      label: 'Performance Design',
      panel: {
        title: 'Performance by Design',
        body:
          '<ul>' +
          '<li><strong>Disruptor Ring Buffer</strong> \u2014 Lock-free, no mutexes, no contention. Predictable sub-ms latency.</li>' +
          '<li><strong>Zero-Copy Fan-Out</strong> \u2014 SinkDispatcher pushes the same message reference to every sink. No copies.</li>' +
          '<li><strong>Report By Exception</strong> \u2014 Only publish when the value actually changes. Configurable per item.</li>' +
          '<li><strong>Full Isolation</strong> \u2014 Each connector on its own thread and timer. Faults never propagate.</li>' +
          '</ul>' +
          '<p>Built-in instrumentation measures device read time, script execution time, and total loop time \u2014 available in real time via WebSocket.</p>',
        related: [
          { page: '01', hotspot: 'features', label: '01 \u2014 Why choose DIME?' }
        ]
      }
    }
  ]
};
