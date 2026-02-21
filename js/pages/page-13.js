/**
 * 13 — MQTT Integration
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['13'] = {
  id: '13',
  title: '13 \u2014 MQTT Integration',
  file: 'content/13-recipe-mqtt.md',
  hotspots: [
    {
      id: 'mqtt-source',
      startLine: 11, startCol: 3, endLine: 54, endCol: 90,
      label: 'MQTT Source Configuration',
      panel: {
        title: 'MQTT Source \u2014 Subscribe to Sensor Topics',
        body:
          '<p>The MQTT source connector subscribes to a broker and ingests messages into the ring buffer.</p>' +
          '<ul>' +
          '<li><strong>address / port</strong> \u2014 Broker hostname and port. Use 1883 for plain TCP, 8883 for TLS.</li>' +
          '<li><strong>client_id</strong> \u2014 Must be unique per broker. If two clients share an ID, the broker disconnects one.</li>' +
          '<li><strong>username / password</strong> \u2014 Optional broker credentials. Omit if the broker allows anonymous access.</li>' +
          '<li><strong>items</strong> \u2014 Each item\u2019s <code>address</code> is the MQTT topic to subscribe to. DIME subscribes to each topic individually.</li>' +
          '<li><strong>qos</strong> \u2014 Quality of Service level. 0 = fire-and-forget, 1 = at least once (recommended), 2 = exactly once (slowest).</li>' +
          '<li><strong>clean_session</strong> \u2014 When true, the broker discards any previous session state on connect. When false, the broker queues messages received while DIME was offline.</li>' +
          '</ul>' +
          '<p>MQTT is a push-based protocol. Unlike OPC-UA polling, the broker pushes messages to DIME as they arrive. DIME uses a <code>QueuingSourceConnector</code> internally.</p>',
        yaml:
          'sources:\n' +
          '  - name: sensors\n' +
          '    connector: MQTT\n' +
          '    address: mqtt.local\n' +
          '    port: !!int 1883\n' +
          '    client_id: dime-sub\n' +
          '    qos: !!int 1\n' +
          '    clean_session: !!bool true\n' +
          '    items:\n' +
          '      - name: line1_temp\n' +
          '        address: factory/sensors/line1/temp\n' +
          '      - name: line1_pressure\n' +
          '        address: factory/sensors/line1/pressure',
        related: [
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: '04', label: '04 \u2014 YAML configuration basics' }
        ]
      }
    },
    {
      id: 'mqtt-sink',
      startLine: 80, startCol: 3, endLine: 103, endCol: 90,
      label: 'MQTT Sink Configuration',
      panel: {
        title: 'MQTT Sink \u2014 Republish to Cloud Broker',
        body:
          '<p>The MQTT sink publishes ring buffer messages to a remote MQTT broker, enabling edge-to-cloud data forwarding.</p>' +
          '<ul>' +
          '<li><strong>address / port</strong> \u2014 Cloud broker endpoint. Use port 8883 with TLS enabled for production.</li>' +
          '<li><strong>tls: true</strong> \u2014 Encrypts the connection. Required when publishing over the internet.</li>' +
          '<li><strong>base_topic</strong> \u2014 Ring buffer paths are appended to this prefix. Path <code>sensors/line1_temp</code> publishes to <code>normalized/data/sensors/line1_temp</code>.</li>' +
          '<li><strong>retain: true</strong> \u2014 The broker stores the last message per topic. New subscribers immediately receive the latest value without waiting for the next update.</li>' +
          '<li><strong>include_filter</strong> \u2014 A list of regex patterns to select which ring buffer messages are published. <code>"sensors/.*"</code> forwards only data from the sensors source.</li>' +
          '</ul>' +
          '<p>The MQTT sink uses the same client library as the source. You can have multiple MQTT sinks pointing at different brokers for redundancy or data segregation.</p>',
        yaml:
          'sinks:\n' +
          '  - name: cloud_mqtt\n' +
          '    connector: MQTT\n' +
          '    address: mqtt.cloud.com\n' +
          '    port: !!int 8883\n' +
          '    tls: !!bool true\n' +
          '    base_topic: normalized/data\n' +
          '    retain: !!bool true',
        related: [
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: '08', label: '08 \u2014 Filtering' }
        ]
      }
    },
    {
      id: 'tls-config',
      startLine: 57, startCol: 3, endLine: 77, endCol: 90,
      label: 'TLS / SSL Configuration',
      panel: {
        title: 'TLS / SSL \u2014 Securing MQTT Connections',
        body:
          '<p>MQTT supports TLS encryption for secure communication between DIME and the broker.</p>' +
          '<ul>' +
          '<li><strong>tls: !!bool true</strong> \u2014 Enables TLS on the connection. The standard MQTT TLS port is 8883.</li>' +
          '<li><strong>tls_insecure: !!bool true</strong> \u2014 Skips certificate verification. Use ONLY for self-signed certificates in development or air-gapped networks. Never use in production with public brokers.</li>' +
          '</ul>' +
          '<p><strong>Three common configurations:</strong></p>' +
          '<ol>' +
          '<li><strong>Plain TCP</strong> (port 1883) \u2014 No encryption. Suitable for isolated OT networks with no internet exposure.</li>' +
          '<li><strong>TLS</strong> (port 8883) \u2014 Full encryption with certificate validation. Use for all production and cloud connections.</li>' +
          '<li><strong>TLS + insecure</strong> \u2014 Encrypted but skips cert chain validation. For internal brokers with self-signed certificates.</li>' +
          '</ol>' +
          '<p>TLS flags work identically on both MQTT source and MQTT sink connectors.</p>',
        related: [
          { page: '13', hotspot: 'mqtt-source', label: '13 \u2014 MQTT source config' },
          { page: '13', hotspot: 'mqtt-sink', label: '13 \u2014 MQTT sink config' }
        ]
      }
    },
    {
      id: 'sparkplugb',
      startLine: 113, startCol: 3, endLine: 132, endCol: 90,
      label: 'SparkplugB \u2014 Industrial MQTT',
      panel: {
        title: 'SparkplugB \u2014 Industrial MQTT Standard',
        body:
          '<p>SparkplugB is an industrial specification built on top of MQTT that adds structured payloads, typed metrics, and device lifecycle management.</p>' +
          '<ul>' +
          '<li><strong>Protobuf payloads</strong> \u2014 Instead of freeform JSON, SparkplugB uses Google Protocol Buffers for compact, typed data encoding.</li>' +
          '<li><strong>Birth certificates</strong> \u2014 NBIRTH (node birth) and DBIRTH (device birth) messages announce when a device comes online, including its full metric catalog.</li>' +
          '<li><strong>Death certificates</strong> \u2014 NDEATH and DDEATH messages signal when a device goes offline, providing immediate state awareness.</li>' +
          '<li><strong>Topic namespace</strong> \u2014 SparkplugB defines a standard topic structure: <code>spBv1.0/{group}/{type}/{node}/{device}</code>.</li>' +
          '<li><strong>Typed metrics</strong> \u2014 Each metric has an explicit data type (Int32, Float, Boolean, DateTime, String) instead of relying on string parsing.</li>' +
          '</ul>' +
          '<p>In DIME, use <code>connector: SparkplugB</code> instead of <code>connector: MQTT</code>. DIME handles Protobuf encoding/decoding and birth/death certificate management automatically.</p>',
        related: [
          { page: '13', hotspot: 'mqtt-source', label: '13 \u2014 MQTT source config' },
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: 'EX13', label: 'EX13 \u2014 SparkplugB Integration' }
        ]
      }
    },
    {
      id: 'broker-bridge',
      startLine: 165, startCol: 3, endLine: 179, endCol: 90,
      label: 'Edge-to-Cloud MQTT Bridge',
      panel: {
        title: 'MQTT Broker Bridge \u2014 Edge to Cloud',
        body:
          '<p>The most common DIME MQTT pattern: subscribe from a local edge broker, transform and filter data, then republish to a cloud broker.</p>' +
          '<ol>' +
          '<li><strong>Devices</strong> publish sensor data to a local MQTT broker on the factory floor.</li>' +
          '<li><strong>DIME MQTT source</strong> subscribes to specific topics on the local broker and ingests messages into the ring buffer.</li>' +
          '<li><strong>Ring buffer</strong> holds messages while Lua transforms run (unit conversion, data enrichment, filtering).</li>' +
          '<li><strong>DIME MQTT sink</strong> publishes normalized data to the cloud broker over TLS.</li>' +
          '</ol>' +
          '<p><strong>Key benefits of this pattern:</strong></p>' +
          '<ul>' +
          '<li>Local devices never need internet access \u2014 they only talk to the local broker.</li>' +
          '<li>DIME handles TLS, authentication, and reconnection to the cloud broker.</li>' +
          '<li>Data is transformed and filtered at the edge, reducing bandwidth to the cloud.</li>' +
          '<li>If the cloud connection drops, DIME buffers data locally and resends when connectivity returns.</li>' +
          '</ul>' +
          '<p>For multi-hop architectures (edge \u2192 site \u2192 cloud), chain multiple DIME instances using MQTT as the transport between them.</p>',
        related: [
          { page: '22', label: '22 \u2014 Instance chaining' },
          { page: 'EX11', label: 'EX11 \u2014 MQTT to WebSocket' },
          { page: 'EX12', label: 'EX12 \u2014 Secure MQTT (TLS)' }
        ]
      }
    }
  ]
};
