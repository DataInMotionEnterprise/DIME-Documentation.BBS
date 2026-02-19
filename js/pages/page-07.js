/**
 * 07 — Sink Connectors Catalog
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['07'] = {
  id: '07',
  title: '07 \u2014 Sink Connectors',
  file: 'content/07-sink-connectors.md',
  hotspots: [
    {
      id: 'timeseries',
      startLine: 22, startCol: 3, endLine: 38, endCol: 90,
      label: 'Time-Series & Analytics Sinks',
      panel: {
        title: 'InfluxDB, Splunk HEC, Splunk Edge Hub',
        body:
          '<p>Time-series and analytics sinks for storing and analyzing data over time:</p>' +
          '<ul>' +
          '<li><strong>InfluxDB (Line Protocol)</strong> \u2014 Writes InfluxDB line protocol over HTTP. Config: address (URL), bucket, org, token. DIME formats data as line protocol automatically. The most common time-series destination.</li>' +
          '<li><strong>Splunk HEC</strong> \u2014 HTTP Event Collector. Pushes JSON events to Splunk via REST. Config: address (URL), token, index, source_type. Enables enterprise analytics and alerting.</li>' +
          '<li><strong>Splunk Edge Hub SDK</strong> \u2014 Direct integration with Splunk Edge Hub in v1 and v2 SDK modes. Config: address, token.</li>' +
          '</ul>' +
          '<p>All time-series sinks support include/exclude filters to select which data streams are stored.</p>',
        yaml:
          'sinks:\n' +
          '  - name: influx_sink\n' +
          '    connector: InfluxLP\n' +
          '    address: https://influxdb.local:8086\n' +
          '    bucket: plant_data\n' +
          '    org: my_org\n' +
          '    token: my-influx-token\n' +
          '    include_filter: plc/.*',
        related: [
          { page: '06', label: '06 \u2014 Source connectors catalog' },
          { page: '08', label: '08 \u2014 Filtering & routing' },
          { page: '12', label: '12 \u2014 PLC to dashboard walkthrough' }
        ]
      }
    },
    {
      id: 'databases',
      startLine: 45, startCol: 3, endLine: 57, endCol: 90,
      label: 'Database Sinks',
      panel: {
        title: 'MongoDB, PostgreSQL Batch',
        body:
          '<p>Database sinks write data to document and relational databases:</p>' +
          '<ul>' +
          '<li><strong>MongoDB</strong> \u2014 Each message becomes a document. Config: connection_string, database, collection. Good for flexible schemas and document-oriented storage.</li>' +
          '<li><strong>PostgreSQL Batch</strong> \u2014 Native batch UPSERT support with configuration-driven column mappings and automatic type conversion. Config: connection_string, table.</li>' +
          '</ul>' +
          '<p>Use include/exclude filters to control which data streams get stored.</p>',
        yaml:
          'sinks:\n' +
          '  - name: mongo_sink\n' +
          '    connector: MongoDB\n' +
          '    connection_string: mongodb://db.local:27017\n' +
          '    database: plant_data\n' +
          '    collection: readings\n' +
          '    include_filter: plc/.*',
        related: [
          { page: '06', label: '06 \u2014 Database source connectors' },
          { page: '05', label: '05 \u2014 Architecture overview' }
        ]
      }
    },
    {
      id: 'brokers',
      startLine: 64, startCol: 3, endLine: 85, endCol: 84,
      label: 'Message Broker Sinks',
      panel: {
        title: 'MQTT, SparkplugB, Redis',
        body:
          '<p>Broker sinks republish data to messaging infrastructure:</p>' +
          '<ul>' +
          '<li><strong>MQTT Publish</strong> \u2014 Publishes to an MQTT broker. Topic derived from message path or configured. Config: address, port (1883), qos. Common pattern: bridge two brokers via DIME.</li>' +
          '<li><strong>SparkplugB Publish</strong> \u2014 Industrial MQTT with SparkplugB metric encoding. Config: address, group_id, edge_node. Birth/death certificates handled automatically.</li>' +
          '<li><strong>Redis</strong> \u2014 Publishes to Redis channels. Config: address, port (6379), channel.</li>' +
          '</ul>' +
          '<p>Use include/exclude filters to control which messages get published. MQTT sink topic can mirror the source message path for transparent bridging.</p>',
        yaml:
          'sinks:\n' +
          '  - name: mqtt_out\n' +
          '    connector: MQTT\n' +
          '    address: cloud-broker.example.com\n' +
          '    port: 8883\n' +
          '    qos: 1\n' +
          '    tls: !!bool true\n' +
          '    include_filter: robot/.*',
        related: [
          { page: '06', label: '06 \u2014 MQTT source connector' },
          { page: '08', label: '08 \u2014 Filtering & routing' },
          { page: '05', label: '05 \u2014 Architecture overview' }
        ]
      }
    },
    {
      id: 'manufacturing',
      startLine: 92, startCol: 3, endLine: 110, endCol: 90,
      label: 'MTConnect Agent & SHDR Sinks',
      panel: {
        title: 'DIME as MTConnect Agent / SHDR Adapter',
        body:
          '<p>Manufacturing sinks expose data via the MTConnect standard:</p>' +
          '<ul>' +
          '<li><strong>MTConnect Agent Sink</strong> \u2014 DIME becomes a full MTConnect agent. Serves XML current/sample responses on an HTTP port. Config: port (5000), device name, sender. Requires items mapped with <code>emit_mtconnect()</code> in Lua scripts.</li>' +
          '<li><strong>MTConnect SHDR Sink</strong> \u2014 Streams SHDR text lines to an external MTConnect agent. DIME acts as an adapter. Config: port (7878). Items mapped via <code>emit_mtconnect()</code> or direct SHDR formatting.</li>' +
          '</ul>' +
          '<p>This makes legacy devices (PLCs, robots, sensors) visible to any MTConnect-compatible monitoring system. Read from any protocol, expose as MTConnect.</p>',
        yaml:
          'sinks:\n' +
          '  - name: mtc_agent\n' +
          '    connector: MTConnectAgent\n' +
          '    port: 5000\n' +
          '    device: CNC-Lathe-01\n' +
          '    sender: DIME\n' +
          '    include_filter: cnc/.*',
        related: [
          { page: '06', label: '06 \u2014 Source connectors catalog' },
          { page: '12', label: '12 \u2014 PLC to dashboard walkthrough' },
          { page: '05', label: '05 \u2014 Architecture overview' }
        ]
      }
    },
    {
      id: 'servers',
      startLine: 117, startCol: 3, endLine: 132, endCol: 90,
      label: 'Server Sinks \u2014 HTTP, WebSocket, OPC-UA',
      panel: {
        title: 'DIME as a Data Endpoint',
        body:
          '<p>Server sinks turn DIME into a data serving endpoint:</p>' +
          '<ul>' +
          '<li><strong>OPC-UA Server</strong> \u2014 DIME becomes an OPC-UA server. Clients browse and subscribe to data from any source. Config: port (4840), endpoint URI.</li>' +
          '<li><strong>HTTP Server</strong> \u2014 Serves data via HTTP REST endpoints. Can serve static files for self-contained web UIs. Config: port (8080), address. Build dashboards with zero external dependencies.</li>' +
          '<li><strong>WebSocket Server</strong> \u2014 Pushes live data to connected WebSocket clients. Powers real-time dashboards and monitoring displays. Config: port (8092), address.</li>' +
          '</ul>' +
          '<p>Combine HTTP Server (static files) + WebSocket Server (live data) to create a completely self-contained dashboard served by DIME.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: '08', label: '08 \u2014 Filtering & routing' },
          { page: '05', label: '05 \u2014 Architecture overview' }
        ]
      }
    },
    {
      id: 'fanout',
      startLine: 162, startCol: 8, endLine: 188, endCol: 88,
      label: 'Fan-Out Architecture',
      panel: {
        title: 'SinkDispatcher \u2014 Fan-Out to Every Sink',
        body:
          '<p>The <strong>SinkDispatcher</strong> pushes every message from the ring buffer to <strong>every registered sink</strong>. There are no routing tables or message brokers.</p>' +
          '<ul>' +
          '<li>Each sink receives the full message stream</li>' +
          '<li>Each sink applies its own <strong>include_filter</strong> and <strong>exclude_filter</strong> (regex on message Path)</li>' +
          '<li>Filters are local to each sink \u2014 adding a sink doesn\'t affect others</li>' +
          '<li>Zero-copy: SinkDispatcher passes the same message reference, no duplication</li>' +
          '</ul>' +
          '<p>Add a new sink? It immediately sees every message. Remove a sink? Nothing else changes. This is fan-out, not routing.</p>' +
          '<p>The double-buffer pattern in each sink decouples receive speed from write speed \u2014 a slow sink never blocks the ring buffer or other sinks.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: '08', label: '08 \u2014 Filtering & routing' },
          { page: '05', label: '05 \u2014 Architecture: data flow' }
        ]
      }
    }
  ]
};
