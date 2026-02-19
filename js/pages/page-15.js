/**
 * 15 — Recipe: MTConnect & CNC
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['15'] = {
  id: '15',
  title: '15 \u2014 MTConnect & CNC',
  file: 'content/15-recipe-mtconnect.md',
  hotspots: [
    {
      id: 'mtconnect-source',
      startLine: 77, startCol: 3, endLine: 102, endCol: 78,
      label: 'MTConnect Source \u2014 Poll an Agent',
      panel: {
        title: 'MTConnect Source \u2014 Polling an Existing Agent',
        body:
          '<p>The <strong>MTConnect</strong> source connector polls a standard MTConnect agent over HTTP.</p>' +
          '<ul>' +
          '<li><strong>address</strong> \u2014 Full URL of the MTConnect agent (e.g. http://cnc-agent.local:5000)</li>' +
          '<li><strong>scan_interval</strong> \u2014 Polling frequency in milliseconds</li>' +
          '</ul>' +
          '<p>DIME fetches the <code>/current</code> endpoint, parses the XML response, and extracts Samples (numeric), Events (state), and Conditions (alarms). Each data item is mapped to a DIME path: <code>sourceName/dataItemId</code>.</p>' +
          '<p>Supports MTConnect v1.x and v2.x agents.</p>',
        yaml:
          'sources:\n' +
          '  - name: cnc1\n' +
          '    connector: MTConnect\n' +
          '    address: http://cnc-agent.local:5000\n' +
          '    scan_interval: !!int 1000',
        related: [
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: '15', hotspot: 'agent-sink', label: 'MTConnect Agent sink' },
          { page: '15', hotspot: 'emit-mtconnect', label: 'emit_mtconnect() Lua function' }
        ]
      }
    },
    {
      id: 'shdr-haas',
      startLine: 108, startCol: 3, endLine: 135, endCol: 78,
      label: 'SHDR / Haas Direct Connection',
      panel: {
        title: 'SHDR & Haas Source \u2014 Direct Machine Connection',
        body:
          '<p>For machines that speak <strong>SHDR</strong> (Simple Haas Data Relay) natively, DIME connects directly without needing an intermediate MTConnect agent.</p>' +
          '<ul>' +
          '<li><strong>connector: Haas</strong> \u2014 Direct connection to Haas CNC machines</li>' +
          '<li><strong>address</strong> \u2014 Machine IP address</li>' +
          '<li><strong>port</strong> \u2014 SHDR port (typically 7878)</li>' +
          '</ul>' +
          '<p>SHDR is a pipe-delimited text protocol. DIME parses each line into individual data items (axis positions, spindle speed, etc.) and publishes them to the ring buffer.</p>' +
          '<p>Advantages: no separate agent to install, lower latency with one fewer network hop, and DIME can then serve as the MTConnect agent itself.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: '15', hotspot: 'agent-sink', label: 'MTConnect Agent sink' },
          { page: '12', label: '12 \u2014 PLC walkthrough' }
        ]
      }
    },
    {
      id: 'agent-sink',
      startLine: 176, startCol: 3, endLine: 205, endCol: 78,
      label: 'MTConnect Agent Sink',
      panel: {
        title: 'DIME as an MTConnect Agent',
        body:
          '<p>The <strong>MTConnectAgent</strong> sink turns DIME into a fully compliant MTConnect agent, exposing data over HTTP.</p>' +
          '<ul>' +
          '<li><strong>port</strong> \u2014 HTTP port to serve on (e.g. 5000)</li>' +
          '<li><strong>device_name</strong> \u2014 Device name in the MTConnect XML response</li>' +
          '</ul>' +
          '<p>Exposes three standard MTConnect endpoints:</p>' +
          '<ul>' +
          '<li><code>/probe</code> \u2014 Device metadata and capabilities</li>' +
          '<li><code>/current</code> \u2014 Current data item values</li>' +
          '<li><code>/sample</code> \u2014 Historical data stream</li>' +
          '</ul>' +
          '<p>This lets DIME unify non-MTConnect devices (PLCs, robots, MQTT sensors) behind a standard MTConnect interface that any monitoring tool can consume.</p>',
        yaml:
          'sinks:\n' +
          '  - name: mtc_agent\n' +
          '    connector: MTConnectAgent\n' +
          '    port: !!int 5000\n' +
          '    device_name: CNC-Line-1',
        related: [
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: '15', hotspot: 'mtconnect-source', label: 'MTConnect source' },
          { page: '15', hotspot: 'emit-mtconnect', label: 'emit_mtconnect() mapping' }
        ]
      }
    },
    {
      id: 'emit-mtconnect',
      startLine: 240, startCol: 3, endLine: 275, endCol: 78,
      label: 'emit_mtconnect() Lua Function',
      panel: {
        title: 'emit_mtconnect() \u2014 Semantic Mapping in Lua',
        body:
          '<p>The <code>emit_mtconnect()</code> Lua function maps raw device data to named MTConnect data items with proper types.</p>' +
          '<p><strong>Parameters:</strong></p>' +
          '<ul>' +
          '<li><strong>data_item_name</strong> \u2014 The name in MTConnect XML (e.g. "SpindleSpeed")</li>' +
          '<li><strong>value</strong> \u2014 The value to publish</li>' +
          '<li><strong>mtconnect_type</strong> \u2014 MTConnect type category</li>' +
          '<li><strong>is_condition</strong> \u2014 Set to true for Condition-type data items (NORMAL/WARNING/FAULT)</li>' +
          '</ul>' +
          '<p>This lets any device \u2014 PLC, Modbus, MQTT \u2014 appear as a proper MTConnect device with semantic data item names and types.</p>',
        yaml:
          'script: |\n' +
          '  emit_mtconnect(\n' +
          "    'spindle_speed',\n" +
          '    result,\n' +
          "    'SpindleSpeed',\n" +
          '    false\n' +
          '  )',
        related: [
          { page: '09', label: '09 \u2014 Lua scripting' },
          { page: '15', hotspot: 'agent-sink', label: 'MTConnect Agent sink' },
          { page: '12', label: '12 \u2014 PLC walkthrough' }
        ]
      }
    },
    {
      id: 'robot-sources',
      startLine: 141, startCol: 3, endLine: 170, endCol: 78,
      label: 'FANUC & Yaskawa Robot Sources',
      panel: {
        title: 'Direct Robot Connectivity \u2014 FANUC & Yaskawa',
        body:
          '<p>DIME includes purpose-built connectors for industrial robots:</p>' +
          '<ul>' +
          '<li><strong>FANUC</strong> \u2014 Reads directly from FANUC robot controllers via the FOCAS library. Accesses joint positions (J1\u2013J6), TCP position (X,Y,Z,W,P,R), program number, override percentage, alarm history, and I/O registers.</li>' +
          '<li><strong>Yaskawa</strong> \u2014 Reads directly from Yaskawa robot controllers via the native communication protocol. Accesses joint positions, I/O registers, alarm states, cycle counters, program status, and speed override.</li>' +
          '</ul>' +
          '<p>Both are <strong>PollingSourceConnectors</strong> \u2014 timer-driven with configurable scan_interval. Combined with the MTConnect Agent sink, DIME can expose robot data as standard MTConnect to any monitoring dashboard.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: '15', hotspot: 'agent-sink', label: 'MTConnect Agent sink' },
          { page: '09', label: '09 \u2014 Lua scripting' }
        ]
      }
    }
  ]
};
