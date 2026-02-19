/**
 * 12 — PLC to Dashboard
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['12'] = {
  id: '12',
  title: '12 \u2014 PLC to Dashboard',
  file: 'content/12-plc-to-dashboard.md',
  hotspots: [
    {
      id: 'opcua-source',
      startLine: 24, startCol: 3, endLine: 43, endCol: 90,
      label: 'Step 1 \u2014 OPC-UA Source Config',
      panel: {
        title: 'Step 1 \u2014 OPC-UA Source Configuration',
        body:
          '<p>The OPC-UA source connects to a PLC and reads data points on a timer.</p>' +
          '<ul>' +
          '<li><strong>name</strong> \u2014 Unique identifier for this source. Becomes the first segment of every message path (e.g. <code>plc1/Temperature</code>).</li>' +
          '<li><strong>connector: OpcUa</strong> \u2014 Uses the OPC-UA protocol connector.</li>' +
          '<li><strong>address</strong> \u2014 The full OPC-UA endpoint URL including port.</li>' +
          '<li><strong>scan_interval</strong> \u2014 Polling frequency in milliseconds. <code>!!int 1000</code> = read every second.</li>' +
          '<li><strong>items</strong> \u2014 Each item is a data point to read. The <code>address</code> field uses OPC-UA node ID format: <code>ns=2;s=PLC.Temp</code>.</li>' +
          '</ul>' +
          '<p>The source publishes two messages per poll cycle: <code>plc1/Temperature</code> and <code>plc1/Pressure</code>. Every sink in the config receives both.</p>',
        yaml:
          'sources:\n' +
          '  - name: plc1\n' +
          '    connector: OpcUa\n' +
          '    address: opc.tcp://192.168.1.10:4840\n' +
          '    scan_interval: !!int 1000\n' +
          '    items:\n' +
          '      - name: Temperature\n' +
          '        address: ns=2;s=PLC.Temp\n' +
          '      - name: Pressure\n' +
          '        address: ns=2;s=PLC.Pressure',
        related: [
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: '04', label: '04 \u2014 YAML configuration basics' }
        ]
      }
    },
    {
      id: 'lua-transform',
      startLine: 47, startCol: 3, endLine: 63, endCol: 90,
      label: 'Step 2 \u2014 Lua Transform',
      panel: {
        title: 'Step 2 \u2014 Lua Transform (Unit Conversion)',
        body:
          '<p>Lua scripts run inline on each item to transform raw values before they enter the ring buffer.</p>' +
          '<ul>' +
          '<li><strong>script: |</strong> \u2014 The pipe character starts a YAML multi-line block. Everything indented below is the Lua script.</li>' +
          '<li><strong>from_json(result)</strong> \u2014 Parses the raw OPC-UA JSON response into a Lua table.</li>' +
          '<li><strong>data.Value</strong> \u2014 The actual numeric reading from the PLC.</li>' +
          '<li><strong>return</strong> \u2014 The returned value replaces the original message payload in the ring buffer.</li>' +
          '</ul>' +
          '<p>This example converts Celsius to Fahrenheit: <code>F = C * 1.8 + 32</code>. Any Lua expression works \u2014 math, string manipulation, conditional logic, table construction.</p>' +
          '<p>For complex transforms, use a file reference instead: <code>script: lua/my_transform.lua</code></p>',
        yaml:
          '    script: |\n' +
          '      local data = from_json(result)\n' +
          '      return data.Value * 1.8 + 32  -- C to F',
        related: [
          { page: '09', label: '09 \u2014 Lua scripting' },
          { page: '04', label: '04 \u2014 YAML basics' }
        ]
      }
    },
    {
      id: 'influx-sink',
      startLine: 67, startCol: 3, endLine: 86, endCol: 90,
      label: 'Step 3 \u2014 InfluxDB Sink',
      panel: {
        title: 'Step 3 \u2014 InfluxDB Sink (Historian)',
        body:
          '<p>The InfluxLP sink writes data to InfluxDB using native line protocol for maximum performance.</p>' +
          '<ul>' +
          '<li><strong>connector: InfluxLP</strong> \u2014 Writes InfluxDB line protocol directly. No intermediate conversion.</li>' +
          '<li><strong>url</strong> \u2014 The InfluxDB v2 API endpoint.</li>' +
          '<li><strong>bucket</strong> \u2014 The InfluxDB bucket (database) to write into.</li>' +
          '<li><strong>org</strong> \u2014 Your InfluxDB organization name.</li>' +
          '<li><strong>token</strong> \u2014 API token with write permission to the target bucket.</li>' +
          '<li><strong>include_filter</strong> \u2014 Regex pattern to select which ring buffer messages this sink receives. <code>"plc1/.*"</code> captures all items from plc1.</li>' +
          '</ul>' +
          '<p>Message paths map to InfluxDB structure: source name becomes the measurement, item name becomes the field key, and the value becomes the field value with a nanosecond timestamp.</p>',
        yaml:
          'sinks:\n' +
          '  - name: historian\n' +
          '    connector: InfluxLP\n' +
          '    url: http://influx.local:8086\n' +
          '    bucket: factory\n' +
          '    org: myorg\n' +
          '    token: my-token-here',
        related: [
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: '04', label: '04 \u2014 YAML configuration basics' }
        ]
      }
    },
    {
      id: 'websocket-sink',
      startLine: 90, startCol: 3, endLine: 107, endCol: 90,
      label: 'Step 4 \u2014 WebSocket Sink',
      panel: {
        title: 'Step 4 \u2014 WebSocket Sink (Live Dashboard)',
        body:
          '<p>The WebSocketServer sink starts a WebSocket server that pushes real-time data to connected browser clients.</p>' +
          '<ul>' +
          '<li><strong>connector: WebSocketServer</strong> \u2014 Starts a WS server on the specified port. Any client can connect.</li>' +
          '<li><strong>port</strong> \u2014 The TCP port to listen on. Clients connect to <code>ws://hostname:8092</code>.</li>' +
          '<li><strong>include_filter</strong> \u2014 Only messages matching this regex are pushed to clients.</li>' +
          '</ul>' +
          '<p>Each message is sent as a JSON object with path, value, and timestamp fields. Connect any charting library (Grafana Live, Chart.js, custom JavaScript) to build a real-time dashboard.</p>' +
          '<p>Multiple browser clients can connect simultaneously. Each receives all matching messages independently.</p>',
        yaml:
          '  - name: dashboard\n' +
          '    connector: WebSocketServer\n' +
          '    port: !!int 8092\n' +
          '    include_filter:\n' +
          '      - "plc1/.*"',
        related: [
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: '08', label: '08 \u2014 Filtering' }
        ]
      }
    },
    {
      id: 'complete-flow',
      startLine: 117, startCol: 3, endLine: 142, endCol: 90,
      label: 'Complete Data Flow Diagram',
      panel: {
        title: 'Complete Flow \u2014 Device to Multiple Destinations',
        body:
          '<p>This diagram shows the full data path from a single OPC-UA PLC to three simultaneous destinations:</p>' +
          '<ol>' +
          '<li><strong>OPC-UA PLC</strong> \u2014 Source reads Temperature (with Lua C\u2192F conversion) and Pressure every second.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 Messages enter the lock-free Disruptor buffer as <code>plc1/Temperature</code> and <code>plc1/Pressure</code>.</li>' +
          '<li><strong>InfluxDB</strong> \u2014 Historian sink writes to time-series database for trending and alerting.</li>' +
          '<li><strong>WebSocket</strong> \u2014 Dashboard sink pushes live values to browser-based charts.</li>' +
          '<li><strong>Console</strong> \u2014 Debug sink prints to stdout for development and troubleshooting.</li>' +
          '</ol>' +
          '<p>All three sinks process messages <strong>simultaneously</strong> from the same ring buffer. There is no priority or ordering between sinks \u2014 each receives every message independently.</p>' +
          '<p>Adding a new destination (e.g. Splunk, MongoDB) is just adding another sink block. No changes to the source or existing sinks required.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: '09', label: '09 \u2014 Lua scripting' },
          { page: '04', label: '04 \u2014 YAML basics' }
        ]
      }
    }
  ]
};
