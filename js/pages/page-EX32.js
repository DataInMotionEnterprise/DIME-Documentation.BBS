/**
 * EX32 — MQTT Motor Aggregation
 * Multi-instance MQTT, Lua JSON aggregation, cross-connector cache patterns.
 */
DIME_PAGES['EX32'] = {
  id: 'EX32',
  title: 'EX32 \u2014 MQTT Motor Aggregation',
  file: 'content/EX32-mqtt-motor-aggregation.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex32-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'MQTT Motor Aggregation \u2014 Overview',
        body:
          '<p>This example demonstrates three key DIME patterns for MQTT-based industrial IoT:</p>' +
          '<ul>' +
          '<li><strong>Multi-Instance MQTT</strong> \u2014 ChicagoPlant subscribes to 6 MQTT topics from different IoT sensors on separate hardware devices</li>' +
          '<li><strong>JSON Decode + Cache Aggregation</strong> \u2014 Each sensor\u2019s nested JSON payload is decoded and cached. A separate aggregation item combines all cached values into a single Motor object</li>' +
          '<li><strong>Cross-Connector Cache</strong> \u2014 DetroitPlant (a Script source) mirrors ChicagoPlant\u2019s data via <code>cache("ChicagoPlant/Amperage", 0)</code>, including checking connection health via <code>$SYSTEM/IsConnected</code></li>' +
          '</ul>' +
          '<p>Output flows to Console, HTTP Server, MQTT (republish), and optional Redis \u2014 each with targeted <code>include_filter</code> for selective routing.</p>',
        related: [
          { page: '14', label: '14 \u2014 MQTT Connector' },
          { page: '10', label: '10 \u2014 Cache API' },
          { page: 'EX28', label: 'EX28 \u2014 Unified Namespace' }
        ]
      }
    },
    {
      id: 'ex32-dataflow',
      startLine: 14, startCol: 2, endLine: 41, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'MQTT Sensors \u2192 Cache \u2192 Aggregation',
        body:
          '<p>The data flow demonstrates the <strong>cache-then-aggregate</strong> pattern:</p>' +
          '<ol>' +
          '<li><strong>MQTT Topics</strong> \u2014 6 IoT sensors publish to separate MQTT topics with nested JSON payloads like <code>{v:{s3:{v:42}}}</code></li>' +
          '<li><strong>Decode + Cache</strong> \u2014 Each item decodes JSON and stores via <code>set(this.Name, value)</code>, returning <code>nil</code> to suppress raw output</li>' +
          '<li><strong>Aggregate</strong> \u2014 The WC01/Motor item (with <code>address: ~</code>) reads all cached values to build a composite Motor object with amperage, RPM, temperature, vibration, and belt speed</li>' +
          '<li><strong>Cross-Plant Mirror</strong> \u2014 DetroitPlant reads ChicagoPlant\u2019s cache to create WC02/Motor, checking <code>$SYSTEM/IsConnected</code> for connection health</li>' +
          '</ol>' +
          '<p>The MQTT sink republishes under <code>base_topic: MqttMotors</code> with <code>include_filter</code> limiting output to plant-specific data.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'ex32-config',
      startLine: 41, startCol: 2, endLine: 164, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'MQTT Source + Script Aggregator',
        body:
          '<p>The two sources demonstrate contrasting patterns:</p>' +
          '<ul>' +
          '<li><strong>ChicagoPlant (MQTT)</strong> \u2014 <code>itemized_read: true</code> maps each item to its own MQTT topic. Items decode JSON with <code>json.decode(result).v.s3.v</code> (path varies per sensor). The aggregation item uses <code>address: ~</code> (null) since it reads only from cache</li>' +
          '<li><strong>DetroitPlant (Script)</strong> \u2014 A pure cache consumer with no external connections. Reads all ChicagoPlant values via cross-connector cache paths like <code>cache("ChicagoPlant/Amperage", 0)</code></li>' +
          '</ul>' +
          '<p>The MQTT sink uses <code>include_filter</code> to only publish plant data (excluding system messages), while the Redis sink targets only Detroit data.</p>',
        related: [
          { page: '14', label: '14 \u2014 MQTT Connector' },
          { page: '04', label: '04 \u2014 YAML Basics' }
        ]
      }
    },
    {
      id: 'ex32-keyconcepts',
      startLine: 166, startCol: 2, endLine: 192, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Cache-Then-Aggregate Pattern</strong> \u2014 Individual items decode and cache with <code>set(this.Name, value)</code> + <code>return nil</code>. A separate item reads all cached values to build a composite. This decouples arrival timing from the aggregation schedule.</p>' +
          '<p><strong>address: ~ for Cache-Only Items</strong> \u2014 The WC01/Motor item has no MQTT topic. It runs every <code>scan_interval</code> purely to aggregate cached values. This is the standard pattern for data combination.</p>' +
          '<p><strong>Cross-Connector $SYSTEM State</strong> \u2014 DetroitPlant checks <code>ChicagoPlant/$SYSTEM/IsConnected</code> to verify the MQTT connection is alive. Every connector publishes $SYSTEM items (IsConnected, IsFaulted, FaultCount) that other connectors can query.</p>' +
          '<p><strong>include_filter for Routing</strong> \u2014 The MQTT sink publishes only Detroit and Chicago data. The Redis sink gets only Detroit. Filters route different data slices from one ring buffer to different destinations.</p>' +
          '<p><strong>JSON Decode Patterns</strong> \u2014 Different sensors use different JSON structures: <code>.v.s3.v</code>, <code>.v.s1.v</code>, <code>.v.v</code>. Each item script navigates its sensor\u2019s specific payload shape.</p>',
        related: [
          { page: '10', label: '10 \u2014 Cache API' },
          { page: '14', label: '14 \u2014 MQTT Connector' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    }
  ]
};
