/**
 * 18 — Health & Faults
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['18'] = {
  id: '18',
  title: '18 \u2014 Health & Faults',
  file: 'content/18-health-faults.md',
  hotspots: [
    {
      id: 'states',
      startLine: 11, startCol: 3, endLine: 54, endCol: 92,
      label: 'Connector State Machine',
      panel: {
        title: 'Connector State Machine',
        body:
          '<p>Every connector follows a deterministic state machine managed by <strong>ConnectorRunner</strong>:</p>' +
          '<ul>' +
          '<li><strong>Initialized</strong> \u2014 Config loaded, init_script executed, internal resources created</li>' +
          '<li><strong>Connected</strong> \u2014 Connection to device/destination established and verified</li>' +
          '<li><strong>Read/Write</strong> \u2014 Main loop: timer-driven polling or event-driven message processing</li>' +
          '<li><strong>Faulted</strong> \u2014 Exception caught during Read/Write. FaultCount incremented. Connector prepares to retry</li>' +
          '<li><strong>Disconnected</strong> \u2014 Graceful shutdown or intermediate state before reconnection</li>' +
          '</ul>' +
          '<p>The Faulted \u2192 Connected transition is automatic. ConnectorRunner disconnects, pauses briefly, then reconnects. No manual intervention required.</p>' +
          '<p>All state transitions are published as <code>$SYSTEM</code> messages so sinks and dashboards see them in real time.</p>',
        related: [
          { page: '05', hotspot: 'lifecycle', label: '05 \u2014 Connector lifecycle stages' },
          { page: '18', hotspot: 'auto-recovery', label: '18 \u2014 Auto-recovery behavior' },
          { page: '20', label: '20 \u2014 Report By Exception (RBE)' },
          { page: '30', label: '30 \u2014 Troubleshooting' }
        ]
      }
    },
    {
      id: 'system-msgs',
      startLine: 57, startCol: 3, endLine: 80, endCol: 92,
      label: '$SYSTEM Messages',
      panel: {
        title: '$SYSTEM Messages \u2014 Automatic Health Telemetry',
        body:
          '<p>Every source connector automatically publishes status under the <code>$SYSTEM</code> path prefix. No configuration needed.</p>' +
          '<h4>Ring Buffer Messages</h4>' +
          '<table>' +
          '<tr><td><strong>IsConnected</strong></td><td><code>bool</code></td><td>Whether the device connection is currently active</td></tr>' +
          '<tr><td><strong>IsFaulted</strong></td><td><code>bool</code></td><td>Whether the connector is currently in a fault state</td></tr>' +
          '<tr><td><strong>Fault</strong></td><td><code>string</code></td><td>The exception message from the last fault (null when clear)</td></tr>' +
          '<tr><td><strong>IsAvailable</strong></td><td><code>bool</code></td><td>IsConnected AND NOT IsFaulted</td></tr>' +
          '<tr><td><strong>ExecutionDuration</strong></td><td><code>long</code></td><td>Total loop execution time in ms</td></tr>' +
          '</table>' +
          '<h4>Admin API Only (ConnectorStatus)</h4>' +
          '<table>' +
          '<tr><td><strong>FaultCount</strong></td><td><code>int</code></td><td>Cumulative number of faults since startup</td></tr>' +
          '<tr><td><strong>ConnectCount</strong></td><td><code>int</code></td><td>Number of successful connections (including reconnections)</td></tr>' +
          '<tr><td><strong>DisconnectCount</strong></td><td><code>int</code></td><td>Number of disconnections (faults + graceful shutdowns)</td></tr>' +
          '</table>' +
          '<p>The ring buffer messages flow like any other data. Sinks can include or exclude them using path filters like <code>".*\\$SYSTEM.*"</code>. The Admin API metrics are available via <code>GET /status</code>.</p>',
        related: [
          { page: '08', label: '08 \u2014 Filtering & Routing' },
          { page: '18', hotspot: 'alerting', label: '18 \u2014 Monitoring & Alerting' },
          { page: '16', label: '16 \u2014 REST API' },
          { page: '17', label: '17 \u2014 WebSocket' }
        ]
      }
    },
    {
      id: 'metrics',
      startLine: 84, startCol: 3, endLine: 118, endCol: 92,
      label: 'Performance Metrics',
      panel: {
        title: 'Performance Metrics Per Connector (Admin API)',
        body:
          '<p>Every connector tracks timing and throughput metrics via the Admin API (<code>GET /status</code>). These are NOT ring buffer messages \u2014 they are available through the REST API and WebSocket status stream.</p>' +
          '<h4>Timing Metrics</h4>' +
          '<ul>' +
          '<li><strong>MinimumReadMs</strong> \u2014 Fastest device read (ms) since startup</li>' +
          '<li><strong>MaximumReadMs</strong> \u2014 Slowest device read (ms) since startup. A growing value signals device latency or network issues.</li>' +
          '<li><strong>LastReadMs</strong> \u2014 Most recent device read time (ms)</li>' +
          '<li><strong>MinimumScriptMs / MaximumScriptMs / LastScriptMs</strong> \u2014 Script execution time (ms)</li>' +
          '<li><strong>MinimumLoopMs / MaximumLoopMs / LastLoopMs</strong> \u2014 Full cycle time (ms). Must stay below scan_interval.</li>' +
          '</ul>' +
          '<h4>Throughput Metrics</h4>' +
          '<ul>' +
          '<li><strong>MessagesAttempted</strong> \u2014 Total values read from the device</li>' +
          '<li><strong>MessagesAccepted</strong> \u2014 Values that passed RBE and were published to the ring buffer</li>' +
          '</ul>' +
          '<p>Compare Attempted vs Accepted to measure RBE effectiveness. If Attempted=1000 and Accepted=50, then 95% of values were unchanged \u2014 RBE is saving significant bandwidth.</p>',
        related: [
          { page: '20', label: '20 \u2014 Report By Exception (RBE)' },
          { page: '05', hotspot: 'performance', label: '05 \u2014 Performance by design' },
          { page: '17', label: '17 \u2014 WebSocket real-time telemetry' }
        ]
      }
    },
    {
      id: 'auto-recovery',
      startLine: 120, startCol: 3, endLine: 150, endCol: 92,
      label: 'Auto-Recovery',
      panel: {
        title: 'Auto-Recovery \u2014 Built-In Fault Tolerance',
        body:
          '<p><strong>ConnectorRunner</strong> handles all faults automatically. No watchdog scripts, no external health checks, no manual restarts.</p>' +
          '<p>When a fault occurs:</p>' +
          '<ol>' +
          '<li>Exception caught by ConnectorRunner</li>' +
          '<li><code>IsFaulted = true</code>, <code>Fault</code> set to exception message</li>' +
          '<li><code>FaultCount</code> incremented</li>' +
          '<li>Disconnect from device</li>' +
          '<li>Brief pause</li>' +
          '<li>Reconnect and resume Read/Write loop</li>' +
          '<li><code>ConnectCount</code> incremented</li>' +
          '<li><code>IsFaulted = false</code> on successful reconnect</li>' +
          '</ol>' +
          '<p>This cycle repeats indefinitely. DIME never gives up on a connector. A PLC that loses power at 2 AM will automatically reconnect when it comes back at 6 AM.</p>' +
          '<p>All fault transitions are published as <code>$SYSTEM</code> messages, so downstream sinks and dashboards see every fault and recovery in real time.</p>',
        related: [
          { page: '18', hotspot: 'states', label: '18 \u2014 Connector state machine' },
          { page: '18', hotspot: 'system-msgs', label: '18 \u2014 $SYSTEM messages' },
          { page: '30', label: '30 \u2014 Troubleshooting' }
        ]
      }
    },
    {
      id: 'alerting',
      startLine: 151, startCol: 3, endLine: 185, endCol: 92,
      label: 'Monitoring & Alerting',
      panel: {
        title: 'Monitoring & Alerting \u2014 Route $SYSTEM to Analytics',
        body:
          '<p>Since <code>$SYSTEM</code> messages are normal ring buffer messages, you can route them to any analytics sink for alerting and visualization.</p>' +
          '<p>Common pattern: create a dedicated sink with an <code>include_filter</code> that captures only <code>$SYSTEM</code> paths:</p>' +
          '<ul>' +
          '<li><strong>Splunk</strong> \u2014 Build dashboards for fault rate, uptime, and alert on IsFaulted=true</li>' +
          '<li><strong>InfluxDB + Grafana</strong> \u2014 Graph read times, loop times, and fault counts over time</li>' +
          '<li><strong>MQTT republish</strong> \u2014 Forward health data to a monitoring broker</li>' +
          '</ul>' +
          '<p>On your data sinks, use <code>exclude_filter: ".*\\$SYSTEM.*"</code> to keep health data out of production data.</p>' +
          '<p>No external agents or sidecars needed. Every DIME instance is self-monitoring out of the box.</p>',
        yaml:
          'sinks:\n' +
          '  - name: health_monitor\n' +
          '    connector: Splunk\n' +
          '    include_filter:\n' +
          '      - ".*\\\\$SYSTEM.*"',
        related: [
          { page: '16', label: '16 \u2014 REST API' },
          { page: '17', label: '17 \u2014 WebSocket' },
          { page: '18', hotspot: 'system-msgs', label: '18 \u2014 $SYSTEM messages' },
          { page: '30', label: '30 \u2014 Troubleshooting' }
        ]
      }
    }
  ]
};
