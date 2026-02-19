/**
 * EX31 — Self-Contained Dashboard
 * WebServer (HTTP files) + WebSocketServer: zero-dependency monitoring UI.
 */
DIME_PAGES['EX31'] = {
  id: 'EX31',
  title: 'EX31 \u2014 Self-Contained Dashboard',
  file: 'content/EX31-self-contained-dashboard.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex31-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Self-Contained Dashboard \u2014 Overview',
        body:
          '<p>This example builds a <strong>complete monitoring dashboard</strong> using only DIME\u2019s built-in sinks \u2014 no external web server, no Node.js, no framework:</p>' +
          '<ul>' +
          '<li><strong>WebServer sink</strong> \u2014 Serves static HTML/JS/CSS files on port 8080</li>' +
          '<li><strong>WebSocket sink</strong> \u2014 Streams real-time data on port 8082</li>' +
          '<li><strong>HTTP Server sink</strong> \u2014 REST API for polling latest values on port 8081</li>' +
          '<li><strong>Console sink</strong> \u2014 Development debugging on stdout</li>' +
          '</ul>' +
          '<p>The Script source simulates a GWB/Ultiform sheet-metal press brake with <strong>50+ OPC-UA-style variables</strong> covering machine state, job tracking, part quality, hydraulics, maintenance timers, and remote diagnostics.</p>',
        related: [
          { page: '16', label: '16 \u2014 WebServer Connector' },
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: 'EX02', label: 'EX02 \u2014 Horizon & Zenith Minimum' }
        ]
      }
    },
    {
      id: 'ex31-dataflow',
      startLine: 14, startCol: 2, endLine: 37, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: '1 Source \u2192 4 Sinks (Web Dashboard)',
        body:
          '<p>A single Script source produces 50+ items that fan out to four sinks:</p>' +
          '<ul>' +
          '<li><strong>WebServer</strong> (:8080) \u2014 Serves the <code>web/index.html</code> dashboard. Uses <code>exclude_filter: ".*"</code> to block all data messages \u2014 it only serves files</li>' +
          '<li><strong>WebSocket</strong> (:8082) \u2014 Pushes every data update to connected browsers. The dashboard\u2019s JavaScript connects here for live data</li>' +
          '<li><strong>HTTP Server</strong> (:8081) \u2014 REST API where clients can poll for the latest value of any item</li>' +
          '<li><strong>Console</strong> \u2014 Prints transformed values for development monitoring</li>' +
          '</ul>' +
          '<p>The browser loads the page from WebServer, then opens a WebSocket connection to receive real-time updates. This two-port pattern (HTTP for static files, WS for live data) is the standard DIME dashboard architecture.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'ex31-config',
      startLine: 39, startCol: 2, endLine: 139, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'OPC-UA Style Configuration',
        body:
          '<p>The simulator uses <strong>hierarchical item names</strong> that mirror OPC-UA variable trees:</p>' +
          '<ul>' +
          '<li><code>Machine/Kind</code>, <code>Machine/Name</code> \u2014 Static machine identification</li>' +
          '<li><code>MachineStatus/Active</code> \u2014 State machine: OFF \u2192 SETUP \u2192 EXECUTING \u2192 DOWN</li>' +
          '<li><code>MachineRt/Cycle/Status</code> \u2014 IDLE/WAIT PEDAL/DESCENDING/FORMING/ASCENDING/COMPLETE</li>' +
          '<li><code>ActiveJob/Quantity/Completed</code>, <code>ActiveJob/Quantity/Good</code> \u2014 Production counting</li>' +
          '<li><code>Maintenance/Lubrication/Overdue</code> \u2014 Timer-based overdue flags (168h, 720h, 2160h intervals)</li>' +
          '<li><code>RemoteDiagnosis/Hydr/Hydr0/*</code> \u2014 Hydraulic cylinder diagnostics</li>' +
          '</ul>' +
          '<p>The <code>exclude_filter: ".*"</code> on the WebServer sink is critical \u2014 without it, the WebServer would try to process data messages as HTTP responses.</p>',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '10', label: '10 \u2014 Cache API' }
        ]
      }
    },
    {
      id: 'ex31-keyconcepts',
      startLine: 140, startCol: 2, endLine: 166, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>WebServer + WebSocket Pattern</strong> \u2014 WebServer serves files on port 8080, WebSocket streams data on port 8082. The browser loads HTML from WebServer, then connects to WebSocket. The <code>exclude_filter: ".*"</code> ensures WebServer only handles file requests.</p>' +
          '<p><strong>Hierarchical Item Names</strong> \u2014 Names like <code>ActiveJob/Quantity/Good</code> and <code>RemoteDiagnosis/Hydr/Hydr0/ControlOut</code> map directly to OPC-UA node structures. Browsers receive these as <code>gwb00_simulator/ActiveJob/Quantity/Good</code> paths.</p>' +
          '<p><strong>Cache-Driven State Machine</strong> \u2014 The simulator stores state via <code>set(\'./internal/machine_state\', value)</code> and reads it with <code>cache()</code>. An execution counter triggers transitions every ~15 seconds. All 50+ items coordinate behavior by reading the cached machine state.</p>' +
          '<p><strong>Maintenance Timers</strong> \u2014 Overdue flags compare <code>os.time()</code> against cached last-maintenance timestamps. Lubrication every 168 hours, audit every 720 hours, cartridge every 2160 hours. This mirrors real OPC-UA machine data structures.</p>' +
          '<p><strong>Four Sink Architecture</strong> \u2014 Console for development, HTTP for polling clients, WebSocket for real-time dashboards, WebServer for hosting. Each serves a different consumption pattern from one ring buffer.</p>',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: '10', label: '10 \u2014 Cache API' },
          { page: '16', label: '16 \u2014 WebServer Connector' }
        ]
      }
    }
  ]
};
