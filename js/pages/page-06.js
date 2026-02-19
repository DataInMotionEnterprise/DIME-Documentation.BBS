/**
 * 06 — Source Connectors Catalog
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['06'] = {
  id: '06',
  title: '06 \u2014 Source Connectors',
  file: 'content/06-source-connectors.md',
  hotspots: [
    {
      id: 'industrial',
      startLine: 14, startCol: 3, endLine: 38, endCol: 84,
      label: 'Industrial PLC Connectors',
      panel: {
        title: 'Industrial PLCs \u2014 Siemens, Rockwell, Beckhoff, Modbus',
        body:
          '<p>All industrial connectors use <strong>PollingSourceConnector</strong> \u2014 timer-driven reads at scan_interval.</p>' +
          '<ul>' +
          '<li><strong>Siemens S7</strong> \u2014 S7-300/400/1200/1500. Config: address, port (102), rack, slot, cpu type. Items addressed by DB/offset.</li>' +
          '<li><strong>Rockwell EtherNet/IP</strong> \u2014 Allen-Bradley PLCs. Config: address, port (44818), slot. Items addressed by tag name.</li>' +
          '<li><strong>Beckhoff ADS</strong> \u2014 TwinCAT PLCs. Config: address, port (851), target_ams_net_id, target_ams_port. Items by symbol or index.</li>' +
          '<li><strong>Modbus TCP</strong> \u2014 Universal industrial protocol. Config: address, port (502), unit_id. Items by register address + data type.</li>' +
          '</ul>' +
          '<p>All support RBE (Report By Exception) at connector or item level to suppress duplicate reads.</p>',
        yaml:
          'sources:\n' +
          '  - name: my_plc\n' +
          '    connector: S7\n' +
          '    address: 10.0.0.1\n' +
          '    port: 102\n' +
          '    rack: 0\n' +
          '    slot: 1\n' +
          '    cpu: S71500\n' +
          '    scan_interval: 1000\n' +
          '    items:\n' +
          '      - name: Temperature\n' +
          '        address: DB1.DBD0',
        related: [
          { page: '05', label: '05 \u2014 Architecture overview' },
          { page: '07', label: '07 \u2014 Sink connectors catalog' },
          { page: '04', label: '04 \u2014 YAML configuration basics' }
        ]
      }
    },
    {
      id: 'messaging',
      startLine: 69, startCol: 3, endLine: 91, endCol: 84,
      label: 'Message Queues & Brokers',
      panel: {
        title: 'MQTT, SparkplugB, ActiveMQ, Redis',
        body:
          '<p>Messaging connectors use <strong>QueuingSourceConnector</strong> \u2014 messages arrive asynchronously, queue in an inbox, drain on timer.</p>' +
          '<ul>' +
          '<li><strong>MQTT</strong> \u2014 address, port (1883), base_topic, qos (0/1/2), tls, client_id, username/password. The most common IoT/IIoT source.</li>' +
          '<li><strong>SparkplugB</strong> \u2014 Industrial MQTT with birth/death certificates and typed metric payloads. Config: address, group_id, edge_node.</li>' +
          '<li><strong>ActiveMQ</strong> \u2014 JMS protocol. Config: address, port (61616), topic. Supports durable subscriptions.</li>' +
          '<li><strong>Redis Pub/Sub</strong> \u2014 Config: address, port (6379), channels. Lightweight pub/sub from Redis.</li>' +
          '</ul>' +
          '<p>For MQTT TLS: set <code>tls: true</code> and optionally <code>tls_insecure: true</code> for self-signed certificates.</p>',
        yaml:
          'sources:\n' +
          '  - name: mqtt_sensors\n' +
          '    connector: MQTT\n' +
          '    address: broker.local\n' +
          '    port: 1883\n' +
          '    base_topic: factory/+/sensors/#\n' +
          '    qos: 1\n' +
          '    tls: !!bool false\n' +
          '    client_id: dime-edge-01',
        related: [
          { page: '07', label: '07 \u2014 MQTT as a sink' },
          { page: '05', label: '05 \u2014 Architecture overview' },
          { page: '04', label: '04 \u2014 YAML configuration basics' }
        ]
      }
    },
    {
      id: 'databases',
      startLine: 98, startCol: 3, endLine: 110, endCol: 90,
      label: 'Database Sources',
      panel: {
        title: 'SQL Server & PostgreSQL \u2014 DatabaseSourceConnector',
        body:
          '<p>Database connectors use <strong>DatabaseSourceConnector</strong> \u2014 timer fires, executes a SQL query, iterates the result set, publishes each row with column-to-item mapping.</p>' +
          '<ul>' +
          '<li><strong>SQL Server</strong> \u2014 connection_string (standard ADO.NET format), query with optional @last_read parameter for incremental reads.</li>' +
          '<li><strong>PostgreSQL</strong> \u2014 connection_string (Npgsql format), query with $1 parameter placeholder.</li>' +
          '</ul>' +
          '<p>Use parameterized queries to read only new rows since the last scan. DatabaseSourceConnector inherits directly from SourceConnector (not BatchPolling).</p>',
        yaml:
          'sources:\n' +
          '  - name: db_source\n' +
          '    connector: MsSql\n' +
          '    connection_string: >\n' +
          '      Server=10.0.0.5;\n' +
          '      Database=PlantData;\n' +
          '      Trusted_Connection=true\n' +
          '    query: >\n' +
          '      SELECT Tag, Value, Timestamp\n' +
          '      FROM Readings\n' +
          '      WHERE Timestamp > @last_read',
        related: [
          { page: '07', label: '07 \u2014 Database sink connectors' },
          { page: '05', label: '05 \u2014 Architecture overview' }
        ]
      }
    },
    {
      id: 'web-api',
      startLine: 117, startCol: 3, endLine: 136, endCol: 90,
      label: 'Web, API & Network Sources',
      panel: {
        title: 'JSON/XML Scrapers, HTTP Server, UDP, SNMP',
        body:
          '<p>Web and API connectors pull or receive data from HTTP endpoints and network services:</p>' +
          '<ul>' +
          '<li><strong>JSON Scraper</strong> \u2014 Fetches JSON from a URL, parses items with JSONPath expressions. PollingSourceConnector.</li>' +
          '<li><strong>XML Scraper</strong> \u2014 Fetches XML from a URL, parses items with XPath expressions. PollingSourceConnector.</li>' +
          '<li><strong>HTTP Server</strong> \u2014 Listens for HTTP POSTs and ingests incoming data as messages. <strong>QueuingSourceConnector</strong> (push-based).</li>' +
          '<li><strong>TCP ASCII</strong> \u2014 Raw TCP socket reads with line-delimited text. PollingSourceConnector.</li>' +
          '<li><strong>UDP Server</strong> \u2014 Listens on a UDP port, receives datagrams as messages. <strong>QueuingSourceConnector</strong> (push-based).</li>' +
          '<li><strong>SNMP</strong> \u2014 SNMP GET on OIDs from network devices. v1/v2c with community string. PollingSourceConnector.</li>' +
          '</ul>' +
          '<p>Scrapers are useful for integrating REST APIs and web services into the DIME data flow.</p>',
        related: [
          { page: '07', label: '07 \u2014 HTTP/WebSocket server sinks' },
          { page: '09', label: '09 \u2014 Scripting & transforms' },
          { page: '04', label: '04 \u2014 YAML configuration basics' }
        ]
      }
    },
    {
      id: 'source-types',
      startLine: 174, startCol: 11, endLine: 196, endCol: 86,
      label: 'Source Type Hierarchy',
      panel: {
        title: 'Polling vs Queuing vs BatchPolling vs Database',
        body:
          '<p>Every source connector inherits from one of four base classes:</p>' +
          '<ul>' +
          '<li><strong>PollingSourceConnector</strong> \u2014 The most common. Timer fires every scan_interval \u2192 read all items \u2192 publish to ring buffer. Used by OPC-UA, Modbus, S7, EtherNet/IP, Beckhoff, FANUC, Script, SNMP.</li>' +
          '<li><strong>QueuingSourceConnector</strong> \u2014 For push-based protocols. Messages arrive asynchronously \u2192 queue in inbox \u2192 drain on timer \u2192 publish. Used by MQTT, SparkplugB, ActiveMQ, Redis, UDP Server, HTTP Server, Haas SHDR, MTConnect, ROS2.</li>' +
          '<li><strong>BatchPollingSourceConnector</strong> \u2014 For bulk reads. Timer fires \u2192 read batch from device \u2192 iterate items \u2192 publish each. Used by OPC-DA.</li>' +
          '<li><strong>DatabaseSourceConnector</strong> \u2014 For SQL queries. Inherits from SourceConnector. Timer fires \u2192 execute query \u2192 column-to-item mapping \u2192 publish. Used by SQL Server, PostgreSQL.</li>' +
          '</ul>' +
          '<p>Choose based on how the device delivers data: pull (Polling), push (Queuing), batch (BatchPolling), or query (Database).</p>',
        related: [
          { page: '05', label: '05 \u2014 Architecture: source types detail' },
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: '04', label: '04 \u2014 YAML configuration basics' }
        ]
      }
    },
    {
      id: 'scripting',
      startLine: 143, startCol: 3, endLine: 165, endCol: 90,
      label: 'Script Source \u2014 Lua/Python Data Generator',
      panel: {
        title: 'The Script Source \u2014 No Device Required',
        body:
          '<p>The <strong>Script</strong> connector type has no external device. The Lua or Python script <em>is</em> the data source.</p>' +
          '<p>Timer fires \u2192 script runs \u2192 script returns data \u2192 published to ring buffer.</p>' +
          '<ul>' +
          '<li>Generate synthetic test data for development</li>' +
          '<li>Compute derived values from <code>cache()</code> of other connectors</li>' +
          '<li>Build custom protocol adapters entirely in script</li>' +
          '<li>Aggregate or correlate data from multiple sources via the cache API</li>' +
          '</ul>' +
          '<p>Set <code>lang_script: lua</code> (or <code>python</code>) on the connector. Each item\'s script returns the value to publish.</p>',
        yaml:
          'sources:\n' +
          '  - name: computed\n' +
          '    connector: Script\n' +
          '    lang_script: lua\n' +
          '    scan_interval: 1000\n' +
          '    items:\n' +
          '      - name: temp_f\n' +
          '        script: |\n' +
          '          local c = cache("plc/Temperature", 0)\n' +
          '          return c * 1.8 + 32',
        related: [
          { page: '09', label: '09 \u2014 Scripting deep dive' },
          { page: '05', label: '05 \u2014 Architecture overview' },
          { page: '07', label: '07 \u2014 Sink connectors' }
        ]
      }
    }
  ]
};
