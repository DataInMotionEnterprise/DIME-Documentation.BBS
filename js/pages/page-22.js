/**
 * 22 — Instance Chaining
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['22'] = {
  id: '22',
  title: '22 \u2014 Instance Chaining',
  file: 'content/22-instance-chaining.md',
  hotspots: [
    {
      id: 'chaining',
      startLine: 35, startCol: 3, endLine: 73, endCol: 90,
      label: 'Instance Chaining Concept',
      panel: {
        title: 'Instance Chaining \u2014 Sink \u2192 Protocol \u2192 Source',
        body:
          '<p>Connect two DIME instances by making one\u2019s <strong>sink</strong> speak the same protocol as the other\u2019s <strong>source</strong>. The network becomes the wire between ring buffers.</p>' +
          '<p>DIME-A publishes via a sink (e.g. MQTT). DIME-B subscribes via a source (e.g. MQTT). Each instance has its own config, its own process, its own machine.</p>' +
          '<p><strong>Supported chaining protocols:</strong></p>' +
          '<ul>' +
          '<li><strong>MQTT</strong> \u2014 Most common. Lightweight, broker-based, reliable.</li>' +
          '<li><strong>SparkplugB</strong> \u2014 Industrial MQTT with typed metrics and birth/death.</li>' +
          '<li><strong>MTConnect / SHDR</strong> \u2014 Manufacturing standards for CNC and machine tools.</li>' +
          '<li><strong>HTTP</strong> \u2014 REST push/pull. Works through firewalls and proxies.</li>' +
          '<li><strong>WebSocket</strong> \u2014 Persistent, full-duplex, low-latency streaming.</li>' +
          '<li><strong>Redis</strong> \u2014 Pub/Sub channel. In-memory speed for same-network linking.</li>' +
          '</ul>',
        related: [
          { page: '28', label: '28 \u2014 Edge-to-Cloud patterns' },
          { page: '05', hotspot: 'big-picture', label: '05 \u2014 Three-layer architecture' }
        ]
      }
    },
    {
      id: 'three-tier',
      startLine: 77, startCol: 4, endLine: 98, endCol: 82,
      label: 'Three-Tier Topology',
      panel: {
        title: 'Edge \u2192 Aggregator \u2192 Analytics',
        body:
          '<p>Chain DIME instances into three logical tiers:</p>' +
          '<ul>' +
          '<li><strong>Edge Tier</strong> \u2014 One DIME per machine or cell on the factory floor. Collects from PLCs, CNCs, sensors. Normalizes and forwards upstream via MQTT or SHDR.</li>' +
          '<li><strong>Aggregator Tier</strong> \u2014 One DIME on a plant server. Merges all edge streams into a single ring buffer. Serves local dashboards via WebSocket. Forwards to cloud.</li>' +
          '<li><strong>Analytics Tier</strong> \u2014 Cloud or data center. Fan out to Splunk, InfluxDB, MongoDB, or any analytics platform. Each destination is a sink on the aggregator.</li>' +
          '</ul>' +
          '<p>Each tier is an independent DIME process with its own YAML config. Tiers communicate via standard protocols over the network.</p>',
        related: [
          { page: '22', hotspot: 'chaining', label: 'Instance chaining concept' },
          { page: '25', label: '25 \u2014 DIME Horizon' }
        ]
      }
    },
    {
      id: 'edge-config',
      startLine: 104, startCol: 3, endLine: 127, endCol: 90,
      label: 'Edge Instance Config',
      panel: {
        title: 'Edge DIME \u2014 Collect, Normalize, Forward',
        body:
          '<p>Each edge DIME instance reads from local devices and forwards upstream via a messaging sink.</p>' +
          '<p>The edge config is simple: one or more source connectors for local hardware, one sink connector pointing to the aggregator\u2019s broker.</p>' +
          '<p>Deploy the same template to every edge. Change only the <code>address</code> and <code>name</code> per machine.</p>',
        yaml:
          '# Edge: PLC \u2192 MQTT\n' +
          'sources:\n' +
          '  - name: plc1\n' +
          '    connector: S7\n' +
          '    address: 192.168.1.10\n' +
          'sinks:\n' +
          '  - name: upstream\n' +
          '    connector: MQTT\n' +
          '    address: aggregator.local',
        related: [
          { page: '22', hotspot: 'aggregator', label: 'Aggregator instance config' },
          { page: '06', hotspot: 'industrial', label: '06 \u2014 Industrial PLC connectors' }
        ]
      }
    },
    {
      id: 'aggregator',
      startLine: 132, startCol: 3, endLine: 160, endCol: 90,
      label: 'Aggregator Instance Config',
      panel: {
        title: 'Aggregator DIME \u2014 Merge, Dashboard, Cloud',
        body:
          '<p>The aggregator subscribes to all edge streams via MQTT, merges them into one ring buffer, and fans out to multiple destinations.</p>' +
          '<ul>' +
          '<li><strong>MQTT source</strong> \u2014 subscribes to <code>edge/#</code> wildcard to capture all edge topics.</li>' +
          '<li><strong>WebSocketServer sink</strong> \u2014 serves a local dashboard for plant operators.</li>' +
          '<li><strong>MQTT sink</strong> \u2014 forwards to a cloud broker over TLS for analytics.</li>' +
          '</ul>' +
          '<p>Add more sinks at any time \u2014 via YAML or at runtime via the REST API.</p>',
        yaml:
          '# Aggregator: MQTT \u2192 Dashboard + Cloud\n' +
          'sources:\n' +
          '  - name: edge_data\n' +
          '    connector: MQTT\n' +
          '    address: localhost\n' +
          'sinks:\n' +
          '  - name: dashboard\n' +
          '    connector: WebSocketServer\n' +
          '  - name: cloud\n' +
          '    connector: MQTT\n' +
          '    address: cloud-broker.com',
        related: [
          { page: '22', hotspot: 'edge-config', label: 'Edge instance config' },
          { page: '22', hotspot: 'hot-reconfig', label: 'Add sinks at runtime' }
        ]
      }
    },
    {
      id: 'hot-reconfig',
      startLine: 166, startCol: 3, endLine: 187, endCol: 90,
      label: 'Runtime Reconfiguration',
      panel: {
        title: 'Hot Reconfiguration \u2014 Zero Downtime',
        body:
          '<p>Add a new sink to any running DIME instance without restarting:</p>' +
          '<pre>POST http://localhost:9999/connector/add/sink/debug_console\nContent-Type: text/plain\n\nname: debug_console\nconnector: Console</pre>' +
          '<p>The new sink immediately begins receiving from the ring buffer. Existing connectors are completely unaffected.</p>' +
          '<p>You can also add sources at runtime via <code>POST /connector/add/source/{name}</code>, or push an entirely new YAML config via <code>POST /config/yaml</code>.</p>' +
          '<p>This is how you add temporary debug sinks, enable new analytics destinations, or respond to changing requirements \u2014 all without interrupting data flow.</p>',
        related: [
          { page: '16', label: '16 \u2014 Admin REST API' },
          { page: '05', hotspot: 'admin-server', label: '05 \u2014 Admin server endpoints' }
        ]
      }
    }
  ]
};
