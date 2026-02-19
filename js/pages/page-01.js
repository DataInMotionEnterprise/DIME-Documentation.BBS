/**
 * 01 — What is DIME?
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['01'] = {
  id: '01',
  title: '01 \u2014 What is DIME?',
  file: 'content/01-what-is-dime.md',
  hotspots: [
    {
      id: 'problem',
      startLine: 17, startCol: 4, endLine: 31, endCol: 73,
      label: 'The N\u00d7M Integration Problem',
      panel: {
        title: 'The N\u00d7M Integration Problem',
        body:
          '<p>Without a connector platform, every device needs a custom integration to every destination.</p>' +
          '<p>5 devices \u00d7 4 destinations = <strong>20 point-to-point integrations</strong> to build, test, and maintain.</p>' +
          '<p>Each one is a unique codebase. Each breaks independently. Adding one new device or destination means writing N more integrations. The matrix grows quadratically.</p>',
        related: [
          { page: '05', label: '05 \u2014 Architecture: how DIME eliminates this' }
        ]
      }
    },
    {
      id: 'solution',
      startLine: 41, startCol: 4, endLine: 55, endCol: 90,
      label: 'The DIME Hub-and-Spoke',
      panel: {
        title: 'Hub-and-Spoke Architecture',
        body:
          '<p>DIME sits in the middle. Every device connects <strong>to DIME</strong>. DIME connects <strong>to every destination</strong>.</p>' +
          '<p>5 devices + 4 destinations = <strong>9 YAML configs</strong>. Linear scaling instead of quadratic.</p>' +
          '<p>The Disruptor ring buffer at the core routes messages with sub-millisecond latency and handles 1M+ messages per second.</p>',
        yaml:
          'sources:\n' +
          '  - name: my_plc\n' +
          '    connector: OpcUA\n' +
          '    address: 192.168.1.10\n' +
          '\n' +
          'sinks:\n' +
          '  - name: my_db\n' +
          '    connector: InfluxLP\n' +
          '    address: https://influx.local',
        related: [
          { page: '05', label: '05 \u2014 Architecture deep dive' },
          { page: '05', hotspot: 'big-picture', label: '05 \u2014 Three-layer architecture' }
        ]
      }
    },
    {
      id: 'how-it-works',
      startLine: 62, startCol: 6, endLine: 81, endCol: 73,
      label: 'How Data Flows Through DIME',
      panel: {
        title: 'Sources \u2192 Ring Buffer \u2192 Sinks',
        body:
          '<p>Data flows through three stages:</p>' +
          '<ul>' +
          '<li><strong>Sources</strong> \u2014 Read data from any device or protocol on a configurable timer</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 Lock-free Disruptor pattern routes every message to every sink</li>' +
          '<li><strong>Sinks</strong> \u2014 Write data to any database, queue, API, or file</li>' +
          '</ul>' +
          '<p>Optional <strong>Lua or Python transforms</strong> can reshape, filter, or enrich data between source and buffer.</p>' +
          '<p>Three steps to a working integration: configure a source, configure a sink, run DIME.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Detailed data flow diagram' },
          { page: '05', hotspot: 'source-types', label: '05 \u2014 Source connector types' }
        ]
      }
    },
    {
      id: 'connectors',
      startLine: 88, startCol: 3, endLine: 108, endCol: 90,
      label: '47+ Connector Types',
      panel: {
        title: '47+ Connector Types',
        body:
          '<p>DIME ships with connectors for a wide range of protocols:</p>' +
          '<ul>' +
          '<li><strong>Industrial</strong> \u2014 OPC-UA, OPC-DA, Siemens S7, Modbus TCP, EtherNet/IP, Beckhoff ADS, MTConnect, FANUC, Yaskawa, Allen-Bradley, SNMP, ROS2</li>' +
          '<li><strong>Messaging</strong> \u2014 MQTT, SparkplugB, ActiveMQ, Redis Pub/Sub</li>' +
          '<li><strong>Databases</strong> \u2014 InfluxDB, MongoDB, SQL Server, PostgreSQL</li>' +
          '<li><strong>Web & API</strong> \u2014 HTTP/REST, WebSocket, JSON Scraper, XML Scraper, UDP Server</li>' +
          '<li><strong>Manufacturing</strong> \u2014 MTConnect Agent/SHDR, Ignition SCADA, CSV/File</li>' +
          '<li><strong>Scripting</strong> \u2014 Lua & Python for custom transforms</li>' +
          '</ul>',
        related: [
          { page: '05', hotspot: 'source-types', label: '05 \u2014 Source connector base classes' },
          { page: '03', label: '03 \u2014 Installation & first run' }
        ]
      }
    },
    {
      id: 'features',
      startLine: 115, startCol: 3, endLine: 137, endCol: 88,
      label: 'Why Choose DIME?',
      panel: {
        title: 'Why DIME?',
        body:
          '<ul>' +
          '<li><strong>Zero Code</strong> \u2014 YAML configuration. Lua/Python for transforms. No compiling, no deploying.</li>' +
          '<li><strong>Sub-Millisecond</strong> \u2014 Lock-free ring buffer handles 1M+ messages/sec.</li>' +
          '<li><strong>Run Anywhere</strong> \u2014 Windows Service, Linux daemon, Docker. x86, x64, ARM64.</li>' +
          '<li><strong>Zero Downtime</strong> \u2014 Add connectors at runtime via REST API.</li>' +
          '<li><strong>47+ Protocols</strong> \u2014 Industrial, enterprise, cloud, and IoT out of the box.</li>' +
          '<li><strong>Smart Routing</strong> \u2014 Report By Exception. Include/exclude regex filters per sink.</li>' +
          '<li><strong>Scriptable</strong> \u2014 Lua & Python inline or from files.</li>' +
          '<li><strong>Chainable</strong> \u2014 Link DIME instances edge-to-cloud. Any sink feeds any source.</li>' +
          '</ul>',
        related: [
          { page: '05', hotspot: 'performance', label: '05 \u2014 Performance by design' }
        ]
      }
    },
    {
      id: 'yaml-config',
      startLine: 144, startCol: 3, endLine: 159, endCol: 80,
      label: 'YAML Configuration Example',
      panel: {
        title: 'From PLC to Database in 12 Lines',
        body:
          '<p>A complete working integration in YAML. Point a source at your device, point a sink at your database. Run DIME.</p>' +
          '<p>Need Splunk too? Add 3 more lines. Need 50 more machines? Copy the source block.</p>',
        yaml:
          'sources:\n' +
          '  - name: my_plc\n' +
          '    connector: OpcUA\n' +
          '    address: 192.168.1.10\n' +
          '    items:\n' +
          '      - name: Temperature\n' +
          '        address: ns=2;s=PLC.Temp\n' +
          '\n' +
          'sinks:\n' +
          '  - name: my_database\n' +
          '    connector: InfluxLP\n' +
          '    address: https://my-influxdb.com',
        related: [
          { page: '03', label: '03 \u2014 Installation: get DIME running' },
          { page: '05', hotspot: 'message-format', label: '05 \u2014 The MessageBoxMessage format' }
        ]
      }
    }
  ]
};
