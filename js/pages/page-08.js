/**
 * 08 — Message Paths, Filtering & Routing
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['08'] = {
  id: '08',
  title: '08 \u2014 Filtering & Routing',
  file: 'content/08-message-paths-filtering.md',
  hotspots: [
    {
      id: 'paths',
      startLine: 16, startCol: 3, endLine: 34, endCol: 82,
      label: 'Message Path Format',
      panel: {
        title: 'Message Path Anatomy \u2014 sourceName/itemName',
        body:
          '<p>Every message flowing through DIME has a <strong>path</strong> constructed as <code>sourceName/itemName</code>:</p>' +
          '<ul>' +
          '<li><strong>sourceName</strong> \u2014 The <code>name:</code> field from your YAML connector config</li>' +
          '<li><strong>itemName</strong> \u2014 The tag, topic, or node ID from the items array or device</li>' +
          '</ul>' +
          '<p>Examples:</p>' +
          '<ul>' +
          '<li><code>plc1/temperature</code> \u2014 PLC source named "plc1", item "temperature"</li>' +
          '<li><code>mqtt/sensors/pressure</code> \u2014 MQTT source "mqtt", topic "sensors/pressure"</li>' +
          '<li><code>opcua/ns=2;s=Speed</code> \u2014 OPC-UA source "opcua", node "ns=2;s=Speed"</li>' +
          '</ul>' +
          '<p>With <code>itemized_read: true</code>, each item gets its own path and message. With <code>itemized_read: false</code> (default), all items arrive as one bulk message.</p>' +
          '<p>Sinks use <strong>regex</strong> against these paths to decide what to accept or reject.</p>',
        related: [
          { page: '02', hotspot: 'message-format', label: '02 \u2014 MessageBoxMessage format' },
          { page: '04', hotspot: 'items', label: '04 \u2014 Configuring items' }
        ]
      }
    },
    {
      id: 'system-paths',
      startLine: 45, startCol: 3, endLine: 56, endCol: 82,
      label: '$SYSTEM Automatic Metadata',
      panel: {
        title: '$SYSTEM Paths \u2014 Connector Health Metadata',
        body:
          '<p>Every connector automatically publishes status messages under a <code>$SYSTEM</code> prefix:</p>' +
          '<ul>' +
          '<li><code>sourceName/$SYSTEM/ExecutionDuration</code> \u2014 connector loop duration (ms)</li>' +
          '<li><code>sourceName/$SYSTEM/IsConnected</code> \u2014 true/false connection state</li>' +
          '<li><code>sourceName/$SYSTEM/IsFaulted</code> \u2014 true/false fault state</li>' +
          '<li><code>sourceName/$SYSTEM/Fault</code> \u2014 fault reason message or null</li>' +
          '<li><code>sourceName/$SYSTEM/IsAvailable</code> \u2014 true when connected and not faulted</li>' +
          '</ul>' +
          '<p>These messages flow through the ring buffer like any other data. Sinks receive them unless explicitly excluded with <code>exclude_filter</code>.</p>',
        related: [
          { page: '05', hotspot: 'admin-server', label: '05 \u2014 Admin server monitoring' },
          { page: '08', hotspot: 'exclude-filter', label: '08 \u2014 Excluding $SYSTEM messages' }
        ]
      }
    },
    {
      id: 'exclude-filter',
      startLine: 68, startCol: 8, endLine: 94, endCol: 52,
      label: 'Exclude Filter (Regex Blacklist)',
      panel: {
        title: 'exclude_filter \u2014 Drop Matching Messages',
        body:
          '<p>Messages whose path matches <strong>any</strong> pattern in <code>exclude_filter</code> are dropped by the sink. Everything else passes through.</p>' +
          '<p>Patterns are .NET regular expressions matched against the full message path.</p>' +
          '<p>Common use cases:</p>' +
          '<ul>' +
          '<li>Drop all $SYSTEM metadata: <code>".*\\\\$SYSTEM.*"</code></li>' +
          '<li>Drop debug paths: <code>"debug/.*"</code></li>' +
          '<li>Drop a specific source: <code>"noisy_source/.*"</code></li>' +
          '</ul>',
        yaml:
          'sinks:\n' +
          '  - name: my_sink\n' +
          '    connector: InfluxDB\n' +
          '    exclude_filter:\n' +
          '      - ".*\\\\$SYSTEM.*"\n' +
          '      - "debug/.*"',
        related: [
          { page: '08', hotspot: 'include-filter', label: '08 \u2014 Include filter (whitelist)' },
          { page: '07', hotspot: 'sinks', label: '07 \u2014 Sink configuration' },
          { page: '20', hotspot: 'rbe', label: '20 \u2014 Report By Exception' },
          { page: '04', hotspot: 'yaml-basics', label: '04 \u2014 YAML basics' }
        ]
      }
    },
    {
      id: 'include-filter',
      startLine: 103, startCol: 8, endLine: 128, endCol: 52,
      label: 'Include Filter (Regex Whitelist)',
      panel: {
        title: 'include_filter \u2014 Accept Only Matching Messages',
        body:
          '<p><strong>Only</strong> messages whose path matches a pattern in <code>include_filter</code> are accepted. Everything else is dropped.</p>' +
          '<p>If <strong>both</strong> <code>include_filter</code> and <code>exclude_filter</code> are set on a sink, only <code>include_filter</code> is used; the exclude filter is ignored entirely.</p>' +
          '<p>Common use cases:</p>' +
          '<ul>' +
          '<li>Only PLC data: <code>"plc1/.*"</code></li>' +
          '<li>Specific path: <code>"mqtt/temperature"</code></li>' +
          '<li>Multiple sources: add multiple patterns to the list</li>' +
          '</ul>',
        yaml:
          'sinks:\n' +
          '  - name: plc_only_sink\n' +
          '    connector: InfluxDB\n' +
          '    include_filter:\n' +
          '      - "plc1/.*"\n' +
          '      - "mqtt/temperature"',
        related: [
          { page: '08', hotspot: 'exclude-filter', label: '08 \u2014 Exclude filter (blacklist)' },
          { page: '08', hotspot: 'paths', label: '08 \u2014 Message path format' },
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Data flow architecture' },
          { page: '04', hotspot: 'yaml-basics', label: '04 \u2014 YAML basics' }
        ]
      }
    },
    {
      id: 'strip-prefix',
      startLine: 139, startCol: 3, endLine: 152, endCol: 82,
      label: 'strip_path_prefix',
      panel: {
        title: 'strip_path_prefix \u2014 Remove Source Name',
        body:
          '<p>When <code>strip_path_prefix: true</code> is set on a <strong>source</strong> connector, the source name is removed from message paths at publish time.</p>' +
          '<p>Before / After examples:</p>' +
          '<ul>' +
          '<li><code>plc1/temperature</code> \u2192 <code>temperature</code></li>' +
          '<li><code>mqtt/sensors/pressure</code> \u2192 <code>sensors/pressure</code></li>' +
          '<li><code>opcua/ns=2;s=Speed</code> \u2192 <code>ns=2;s=Speed</code></li>' +
          '</ul>' +
          '<p>Useful when republishing to MQTT (the source name prefix would be redundant in the topic) or writing to databases where you want clean column/tag names.</p>',
        yaml:
          'sources:\n' +
          '  - name: plc1\n' +
          '    connector: EthernetIp\n' +
          '    strip_path_prefix: true\n' +
          '    # Messages publish as "temperature"\n' +
          '    # instead of "plc1/temperature"',
        related: [
          { page: '08', hotspot: 'paths', label: '08 \u2014 Message path format' },
          { page: '07', hotspot: 'sinks', label: '07 \u2014 Sink connector types' }
        ]
      }
    }
  ]
};
