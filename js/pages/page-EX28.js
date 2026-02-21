/**
 * EX28 — Unified Namespace (UNS)
 * ISA-95 UNS: multi-source → MQTT backbone → analytics. 10-file config.
 */
DIME_PAGES['EX28'] = {
  id: 'EX28',
  title: 'EX28 \u2014 Unified Namespace (UNS)',
  file: 'content/EX28-unified-namespace.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex28-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Unified Namespace \u2014 Overview',
        body:
          '<p>This example demonstrates <strong>Industry 4.0 Unified Namespace (UNS)</strong> principles using DIME as the integration platform. It follows the ISA-95 hierarchical model:</p>' +
          '<ul>' +
          '<li><strong>Enterprise / Site / Area / Line / Device / Property</strong> \u2014 mapped to MQTT topic hierarchy</li>' +
          '<li><strong>4 simulated sources</strong> \u2014 PLC (machine state), Robot (position/velocity), Environmental Sensors (temp/humidity), Analytics Engine (OEE/trends)</li>' +
          '<li><strong>4 sinks</strong> \u2014 MQTT broker (UNS backbone), Console, WebServer, WebSocket</li>' +
          '</ul>' +
          '<p>The 10-file configuration demonstrates modular multi-file YAML with anchors. Each source and sink is defined in its own file, composed in <code>main.yaml</code>.</p>',
        related: [
          { page: 'CON14', label: 'CON14 \u2014 MQTT Connector' },
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' },
          { page: 'EX01', label: 'EX01 \u2014 Basic Counter (simpler starting point)' },
          { page: 'REF18', label: 'REF18 \u2014 MQTT' }
        ]
      }
    },
    {
      id: 'ex28-dataflow',
      startLine: 13, startCol: 2, endLine: 51, endCol: 70,
      label: 'Data Flow & ISA-95 Hierarchy',
      panel: {
        title: 'Sources \u2192 MQTT UNS \u2192 Analytics',
        body:
          '<p>The data flow follows the UNS pattern where MQTT serves as the central message backbone:</p>' +
          '<ol>' +
          '<li><strong>PLC Source</strong> (1000ms) \u2014 Simulates machine states (IDLE/RUNNING/STOPPED/FAULT), part counts, quality rate, cycle time, temperature, and pressure</li>' +
          '<li><strong>Robot Source</strong> (500ms) \u2014 Simulates robotic arm with position (X/Y/Z), velocity, pick/place counters. Faster scan rate for smoother motion data</li>' +
          '<li><strong>Sensor Source</strong> (5000ms) \u2014 Environmental monitoring: ambient temperature, humidity, air quality. Reads PLC state via cross-connector cache for vibration correlation</li>' +
          '<li><strong>Analytics Engine</strong> (5000ms) \u2014 Computes OEE, production rate, quality trend, line efficiency, and environmental health from cached data</li>' +
          '</ol>' +
          '<p>The MQTT sink publishes under <code>base_topic: Acme/Dallas/Assembly</code>, forming ISA-95 topics like <code>Acme/Dallas/Assembly/plc1/Execution</code>.</p>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON10', label: 'CON10 \u2014 Cache API' }
        ]
      }
    },
    {
      id: 'ex28-config',
      startLine: 53, startCol: 2, endLine: 235, endCol: 85,
      label: 'YAML Configuration (10 files)',
      panel: {
        title: '10-File Multi-File Configuration',
        body:
          '<p>This is the largest multi-file example in the series. Each connector gets its own YAML file:</p>' +
          '<ul>' +
          '<li><strong>plc1_source.yaml</strong> \u2014 8 items: Execution, PartCount, GoodParts, RejectParts, QualityRate, CycleTime, Temperature, Pressure</li>' +
          '<li><strong>robot1_source.yaml</strong> \u2014 8 items: Status, PositionX/Y/Z, Velocity, Cycles, PicksCompleted, PlacesCompleted</li>' +
          '<li><strong>sensors_source.yaml</strong> \u2014 4 items with cross-connector caching for vibration</li>' +
          '<li><strong>analytics_source.yaml</strong> \u2014 5 derived metrics using the <code>moses</code> functional library</li>' +
          '<li><strong>uns_mqtt_sink.yaml</strong> \u2014 MQTT with ISA-95 base_topic, QoS 1, retain enabled</li>' +
          '<li><strong>console_sink.yaml</strong>, <strong>web_http_server.yaml</strong>, <strong>web_ws_server.yaml</strong>, <strong>main.yaml</strong></li>' +
          '</ul>' +
          '<p>All items use <code>sink.transform.template: Message.Data</code> to send clean values to the MQTT UNS.</p>',
        related: [
          { page: 'CON04', label: 'CON04 \u2014 YAML Basics' },
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex28-keyconcepts',
      startLine: 237, startCol: 2, endLine: 260, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>ISA-95 Topic Hierarchy</strong> \u2014 The MQTT sink\u2019s <code>base_topic: Acme/Dallas/Assembly</code> sets the root. DIME appends <code>sourceName/itemName</code> to form the full topic path. This naturally maps to Enterprise/Site/Area/Device/Property.</p>' +
          '<p><strong>Cross-Connector Caching</strong> \u2014 The analytics engine reads PLC, robot, and sensor data via <code>cache(\'plc1/Execution\')</code> without direct wiring. The sensor source reads PLC state to correlate vibration levels. All decoupled through the cache system.</p>' +
          '<p><strong>MQTT Retain</strong> \u2014 With <code>retain: true</code>, late-joining subscribers immediately receive the last published value for each topic. Essential for UNS where new consumers must see current plant state instantly.</p>' +
          '<p><strong>Multi-Rate Sources</strong> \u2014 PLC at 1s, robot at 500ms, sensors at 5s. Each source polls at the appropriate rate for its data type. The ring buffer and MQTT sink handle the different cadences seamlessly.</p>' +
          '<p><strong>OEE Calculation</strong> \u2014 Availability (machine running?) \u00d7 Performance (actual vs ideal cycle time) \u00d7 Quality (good parts ratio). The <code>moses</code> library provides functional helpers for rolling window analysis.</p>',
        related: [
          { page: 'CON10', label: 'CON10 \u2014 Cache API' },
          { page: 'CON14', label: 'CON14 \u2014 MQTT Connector' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' }
        ]
      }
    }
  ]
};
