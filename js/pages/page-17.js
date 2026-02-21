/**
 * 17 — WebSocket Monitoring
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['17'] = {
  id: '17',
  title: '17 \u2014 WebSocket Monitoring',
  file: 'content/17-websocket-monitoring.md',
  hotspots: [
    {
      id: 'admin-ws',
      startLine: 16, startCol: 3, endLine: 47, endCol: 90,
      label: 'Admin WebSocket \u2014 ws://localhost:9998',
      panel: {
        title: 'Built-In Admin WebSocket Stream',
        body:
          '<p>Every DIME instance streams live telemetry over <code>ws://localhost:9998</code>. Always on, no configuration needed.</p>' +
          '<p>What streams over this WebSocket:</p>' +
          '<ul>' +
          '<li><strong>Connector status</strong> \u2014 isConnected and isFaulted changes in real time</li>' +
          '<li><strong>Performance metrics</strong> \u2014 lastLoopMs, lastReadMs, lastScriptMs per connector</li>' +
          '<li><strong>Fault notifications</strong> \u2014 Immediate alert when any connector enters an error state</li>' +
          '<li><strong>Live data values</strong> \u2014 Current values flowing through the ring buffer</li>' +
          '<li><strong>$SYSTEM paths</strong> \u2014 All $SYSTEM metadata for every connector</li>' +
          '</ul>' +
          '<p>This is how <strong>DIME-Connector.UX</strong> (the built-in web dashboard) receives its live data. Any WebSocket client can connect to the same endpoint.</p>',
        related: [
          { page: '16', hotspot: 'status-endpoint', label: '16 \u2014 REST API /status endpoint' },
          { page: '17', hotspot: 'ws-sink', label: '17 \u2014 WebSocket Server sink' },
          { page: '18', hotspot: 'states', label: '18 \u2014 Health monitoring' }
        ]
      }
    },
    {
      id: 'ws-sink',
      startLine: 56, startCol: 3, endLine: 79, endCol: 90,
      label: 'WebSocket Server Sink',
      panel: {
        title: 'WebsocketServer Sink \u2014 Push Data to Clients',
        body:
          '<p>The <strong>WebsocketServer</strong> sink opens a WebSocket server on a configurable URI. External clients connect and receive live data, filtered by include/exclude patterns.</p>' +
          '<p>Key differences from the admin WebSocket (:9998):</p>' +
          '<ul>' +
          '<li><strong>Configurable URI</strong> \u2014 Run multiple WS servers on different ports via the <code>uri</code> property</li>' +
          '<li><strong>Filtered data</strong> \u2014 Use include_filter/exclude_filter to control what data streams</li>' +
          '<li><strong>Purpose-built</strong> \u2014 Designed for external consumers, dashboards, mobile apps</li>' +
          '<li><strong>Multiple instances</strong> \u2014 One WS sink for PLC data, another for MQTT, etc.</li>' +
          '</ul>' +
          '<p>Messages arrive as JSON with <code>path</code>, <code>data</code>, and <code>timestamp</code> fields.</p>',
        yaml:
          'sinks:\n' +
          '  - name: live_feed\n' +
          '    connector: WebsocketServer\n' +
          '    uri: !!str ws://localhost:8092/\n' +
          '    include_filter:\n' +
          '      - "plc1/.*"\n' +
          '      - "robot1/.*"',
        related: [
          { page: '17', hotspot: 'admin-ws', label: '17 \u2014 Admin WebSocket (built-in)' },
          { page: '17', hotspot: 'dashboard-build', label: '17 \u2014 Building a live dashboard' },
          { page: '16', hotspot: 'hot-reconfig', label: '16 \u2014 Add sinks at runtime' }
        ]
      }
    },
    {
      id: 'http-sink',
      startLine: 87, startCol: 3, endLine: 108, endCol: 90,
      label: 'Web Server Sink \u2014 Static Files',
      panel: {
        title: 'WebServer Sink \u2014 Serve Your Dashboard Files',
        body:
          '<p>The <strong>WebServer</strong> sink serves static files (HTML, CSS, JS) directly from DIME on a configurable URI. No separate web server needed.</p>' +
          '<p>Point the <code>web_root</code> property at a folder containing your dashboard files. DIME will serve them at the URI you specify.</p>' +
          '<p>Combine with a WebsocketServer sink to create a <strong>self-contained dashboard</strong>: the browser loads the page from WebServer and connects to WebsocketServer for live data.</p>',
        yaml:
          'sinks:\n' +
          '  - name: web_ui\n' +
          '    connector: WebServer\n' +
          '    uri: !!str http://localhost:8080/\n' +
          '    web_root: ./www',
        related: [
          { page: '17', hotspot: 'self-contained', label: '17 \u2014 Self-contained dashboard setup' },
          { page: '17', hotspot: 'ws-sink', label: '17 \u2014 WebSocket Server sink' }
        ]
      }
    },
    {
      id: 'dashboard-build',
      startLine: 116, startCol: 3, endLine: 161, endCol: 90,
      label: 'Building a Live Dashboard',
      panel: {
        title: 'Connecting JavaScript to WebSocket for Live Charts',
        body:
          '<p>Building a live dashboard is straightforward:</p>' +
          '<ol>' +
          '<li>Create a WebsocketServer sink with the data you want to display</li>' +
          '<li>Write a simple HTML page with JavaScript that connects to the WebSocket</li>' +
          '<li>Parse incoming JSON messages and update your charts/gauges</li>' +
          '</ol>' +
          '<p>Each message arrives as JSON with three fields:</p>' +
          '<ul>' +
          '<li><code>path</code> \u2014 e.g. "plc1/temperature" \u2014 route to the correct gauge</li>' +
          '<li><code>data</code> \u2014 e.g. 72.5 \u2014 the current value</li>' +
          '<li><code>timestamp</code> \u2014 epoch ms \u2014 for time-series charts</li>' +
          '</ul>' +
          '<p>Use any charting library (Chart.js, D3, Plotly) or plain DOM manipulation. The WebSocket delivers data as fast as the source produces it.</p>',
        related: [
          { page: '17', hotspot: 'ws-sink', label: '17 \u2014 WebSocket Server sink config' },
          { page: '17', hotspot: 'self-contained', label: '17 \u2014 Self-contained setup' },
          { page: '12', hotspot: 'complete-flow', label: '12 \u2014 PLC to dashboard walkthrough' }
        ]
      }
    },
    {
      id: 'self-contained',
      startLine: 170, startCol: 3, endLine: 207, endCol: 90,
      label: 'Self-Contained Dashboard Setup',
      panel: {
        title: 'Zero-Dependency Dashboard \u2014 HTTP + WebSocket',
        body:
          '<p>Combine two sinks for a complete, self-contained dashboard with no external dependencies:</p>' +
          '<ul>' +
          '<li><strong>WebServer</strong> sink \u2014 Serves your HTML/CSS/JS dashboard files (e.g. on port 8080)</li>' +
          '<li><strong>WebsocketServer</strong> sink \u2014 Streams filtered live data (e.g. on port 8092)</li>' +
          '</ul>' +
          '<p>Your <code>index.html</code> connects to <code>ws://localhost:8092</code> for live data. The browser loads the page from the WebServer and receives data from the WebsocketServer.</p>' +
          '<p><strong>No nginx, no Node.js, no separate web server.</strong> Just DIME and a folder of HTML files. Deploy the DIME binary + a <code>www</code> folder and you have a complete monitoring solution.</p>' +
          '<p>This pattern is ideal for edge deployments, kiosks, and factory-floor displays where simplicity matters.</p>',
        related: [
          { page: '17', hotspot: 'http-sink', label: '17 \u2014 WebServer sink config' },
          { page: '17', hotspot: 'ws-sink', label: '17 \u2014 WebsocketServer sink config' },
          { page: 'EX31', label: 'EX31 \u2014 Self-Contained Dashboard' },
          { page: 'EX02', label: 'EX02 \u2014 CNC WebSocket Dashboard' }
        ]
      }
    }
  ]
};
