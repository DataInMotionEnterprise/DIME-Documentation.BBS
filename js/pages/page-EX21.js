/**
 * EX21 — Splunk Edge Hub
 * Multi-source industrial data → Splunk Edge Hub SDK sink. Complete single-file config.
 */
DIME_PAGES['EX21'] = {
  id: 'EX21',
  title: 'EX21 \u2014 Splunk Edge Hub',
  file: 'content/EX21-splunk-edge-hub.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex21-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Splunk Edge Hub \u2014 Overview',
        body:
          '<p>This is a comprehensive, production-style <strong>single-file configuration</strong> that collects data from multiple industrial sources and forwards to Splunk Edge Hub:</p>' +
          '<ul>' +
          '<li><strong>Haas SHDR Source</strong> \u2014 Reads CNC machine data via the Haas Serial Data Record protocol</li>' +
          '<li><strong>EthernetIP Source</strong> \u2014 Reads PLC tags from an Allen-Bradley MicroLogix</li>' +
          '<li><strong>Script Source</strong> \u2014 Cross-source combiner that reads from other sources\u2019 caches and derives new values</li>' +
          '<li><strong>SplunkEhSDK Sink</strong> \u2014 Forwards data to Splunk Edge Hub via gRPC with <code>numbers_to_metrics</code></li>' +
          '<li><strong>HTTP + Console Sinks</strong> \u2014 REST API endpoint and debug output</li>' +
          '</ul>' +
          '<p>This example demonstrates the full power of DIME\u2019s scripting, caching, and multi-source architecture in a single configuration file.</p>',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: '10', label: '10 \u2014 Cache API' },
          { page: 'REF33', label: 'REF33 \u2014 Splunk EH SDK' },
          { page: 'REF09', label: 'REF09 \u2014 Haas SHDR' }
        ]
      }
    },
    {
      id: 'ex21-dataflow',
      startLine: 13, startCol: 2, endLine: 43, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: '3 Sources \u2192 Ring Buffer \u2192 3 Sinks',
        body:
          '<p>A complex multi-source, multi-sink topology:</p>' +
          '<ul>' +
          '<li><strong>Haas SHDR</strong> \u2014 Connects to a Haas CNC at <code>192.168.111.221:9998</code>. Reads CPU utilization and maps it to HIGH/LOW string values via Lua scripting.</li>' +
          '<li><strong>EthernetIP</strong> \u2014 Reads PLC tags at 500ms intervals. Uses the cache-and-forward pattern. Includes <code>sink.mtconnect</code> annotation on the Execution item for MTConnect compatibility.</li>' +
          '<li><strong>Script Source</strong> \u2014 The cross-source combiner. Reads from other sources\u2019 caches (<code>cache(\'eipSource1/Execution\')</code>, <code>cache(\'mqttSource1/ffe4Sensor\')</code>) to derive new values like running medians and availability status.</li>' +
          '</ul>' +
          '<p>All three sources publish to the ring buffer. Three sinks consume independently: Splunk Edge Hub (gRPC), HTTP Server (REST), and Console (stdout).</p>',
        related: [
          { page: '05', label: '05 \u2014 Architecture Overview' },
          { page: '10', label: '10 \u2014 Cache API' }
        ]
      }
    },
    {
      id: 'ex21-splunk-config',
      startLine: 138, startCol: 2, endLine: 147, endCol: 85,
      label: 'Splunk Edge Hub Sink',
      panel: {
        title: 'SplunkEhSDK Sink \u2014 gRPC Data Forwarding',
        body:
          '<p>The SplunkEhSDK sink sends data to Splunk Edge Hub:</p>' +
          '<ul>' +
          '<li><strong>connector: SplunkEhSDK</strong> \u2014 Uses the Splunk Edge Hub SDK over gRPC protocol</li>' +
          '<li><strong>address</strong> \u2014 Points to the Edge Hub host (<code>http://host.docker.internal</code> for Docker environments)</li>' +
          '<li><strong>port: 50051</strong> \u2014 Standard gRPC port for Splunk Edge Hub</li>' +
          '<li><strong>numbers_to_metrics: true</strong> \u2014 Automatically converts numeric data values to Splunk metrics format, enabling Splunk\u2019s metrics workspace for visualization and alerting</li>' +
          '</ul>' +
          '<p>The Edge Hub acts as a local data collection point that can forward to Splunk Cloud or Splunk Enterprise. DIME connects as a data source to the Edge Hub\u2019s gRPC endpoint.</p>',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: 'EX17', label: 'EX17 \u2014 InfluxDB Time-Series' }
        ]
      }
    },
    {
      id: 'ex21-cross-source',
      startLine: 101, startCol: 2, endLine: 138, endCol: 85,
      label: 'Cross-Source Cache Combiner',
      panel: {
        title: 'Script Source \u2014 Cross-Source Data Combination',
        body:
          '<p>The Script source acts as a <strong>cross-source combiner</strong>, reading cached values from other sources to derive new data:</p>' +
          '<ul>' +
          '<li><strong>cache(\'mqttSource1/ffe4Sensor\', 0)</strong> \u2014 Reads a value from an MQTT source\u2019s cache (cross-source absolute path)</li>' +
          '<li><strong>moses.median(pcArray)</strong> \u2014 Computes a running median over the last 100 MQTT readings using the Moses functional library</li>' +
          '<li><strong>cache(\'eipSource1/$SYSTEM/IsConnected\')</strong> \u2014 Reads the PLC\u2019s connection health from the system cache to derive availability</li>' +
          '<li><strong>CLR.env.MachineName</strong> \u2014 Uses .NET interop to read the host machine name directly from the CLR</li>' +
          '</ul>' +
          '<p>The combiner pattern enables derived metrics, aggregations, and health-aware logic without modifying the original source configurations.</p>',
        related: [
          { page: '10', label: '10 \u2014 Cache API' },
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' }
        ]
      }
    },
    {
      id: 'ex21-keyconcepts',
      startLine: 175, startCol: 2, endLine: 198, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>SplunkEhSDK Connector</strong> \u2014 Sends data to Splunk Edge Hub via gRPC. The <code>numbers_to_metrics: true</code> option converts numeric values to Splunk\u2019s metrics format, enabling the metrics workspace for dashboards and alerting.</p>' +
          '<p><strong>Single-File Config</strong> \u2014 All anchors (<code>&amp;name</code>) and the <code>app</code> section live in one <code>main.yaml</code>. Anchors are defined inline and referenced (<code>*name</code>) in the <code>sinks</code>/<code>sources</code> arrays at the bottom. This works for self-contained deployments but multi-file is better at scale.</p>' +
          '<p><strong>Cross-Source Cache</strong> \u2014 The Script source reads values from other sources using absolute cache paths like <code>cache(\'eipSource1/Execution\')</code>. This enables data combination, aggregation (running medians), and derived calculations across independent sources.</p>' +
          '<p><strong>$SYSTEM Cache</strong> \u2014 <code>cache(\'eipSource1/$SYSTEM/IsConnected\')</code> reads the PLC\u2019s live connection state from the system cache. This enables health-aware logic like mapping connectivity to MTConnect Availability events.</p>' +
          '<p><strong>.NET Interop</strong> \u2014 The <code>init_script</code> uses <code>luanet.load_assembly</code> and <code>luanet.import_type</code> to access .NET CLR types directly from Lua, such as <code>System.Environment.MachineName</code>.</p>',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: '10', label: '10 \u2014 Cache API' },
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' }
        ]
      }
    }
  ]
};
