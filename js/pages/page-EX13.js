/**
 * EX13 — SparkplugB Industrial MQTT
 * Protobuf metrics, birth/death certificates, Ignition gateway integration.
 */
DIME_PAGES['EX13'] = {
  id: 'EX13',
  title: 'EX13 \u2014 SparkplugB Industrial MQTT',
  file: 'content/EX13-sparkplugb-mqtt.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex13-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'SparkplugB Industrial MQTT \u2014 Overview',
        body:
          '<p>A comprehensive industrial integration using the SparkplugB MQTT protocol with multiple sources and sinks:</p>' +
          '<ul>' +
          '<li><strong>SparkplugB source</strong> \u2014 Decodes Protobuf-encoded metrics from MQTT topics following the <code>spBv1.0/{group}/DDATA/{node}/{device}</code> pattern</li>' +
          '<li><strong>EthernetIP source</strong> \u2014 Reads Rockwell MicroLogix PLC tags (booleans, integers) via Allen-Bradley protocol</li>' +
          '<li><strong>SparkplugB sink (Ignition)</strong> \u2014 Publishes birth/death certificates and metric updates to an Ignition SCADA gateway</li>' +
          '<li><strong>InfluxDB sink</strong> \u2014 Stores time-series metrics in InfluxDB Cloud via Line Protocol</li>' +
          '<li><strong>Console sink</strong> \u2014 Debug output filtered to show only SparkplugB decoded metrics</li>' +
          '</ul>' +
          '<p>This is the most complex example in the series, demonstrating 2 sources and 3 sinks with sophisticated filtering to route data correctly.</p>',
        related: [
          { page: 'EX12', label: 'EX12 \u2014 Secure MQTT (TLS)' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' },
          { page: 'REF32', label: 'REF32 \u2014 SparkplugB' },
          { page: 'REF07', label: 'REF07 \u2014 Ethernet/IP' }
        ]
      }
    },
    {
      id: 'ex13-dataflow',
      startLine: 14, startCol: 2, endLine: 41, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: '2 Sources \u2192 Ring Buffer \u2192 3 Sinks',
        body:
          '<p>Two industrial sources feed a shared ring buffer, with three sinks each receiving filtered subsets:</p>' +
          '<ul>' +
          '<li><strong>SparkplugB Source</strong> \u2014 Subscribes to <code>spBv1.0/Chicago/DDATA/Factory1/DIME1</code>. Lua decodes Protobuf metrics and calls <code>emit()</code> for each individual metric.</li>' +
          '<li><strong>EthernetIP Source</strong> \u2014 Polls a Rockwell MicroLogix PLC at 192.168.111.20 every 1.5 seconds for boolean bits and integer registers.</li>' +
          '</ul>' +
          '<p><strong>Sink routing via exclude_filter:</strong></p>' +
          '<ul>' +
          '<li><strong>Console</strong> \u2014 Excludes <code>rockwell</code> and <code>spb/$SYSTEM</code> \u2192 shows only decoded SparkplugB metrics</li>' +
          '<li><strong>Ignition (SparkplugB)</strong> \u2014 Excludes <code>rockwell/$SYSTEM</code> and <code>spb</code> \u2192 publishes PLC data + decoded metrics to Ignition</li>' +
          '<li><strong>InfluxDB</strong> \u2014 Excludes <code>rockwell</code> and <code>spb/$SYSTEM</code> \u2192 stores only SparkplugB metrics as time-series</li>' +
          '</ul>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON08', label: 'CON08 \u2014 Filtering' }
        ]
      }
    },
    {
      id: 'ex13-spb-source',
      startLine: 63, startCol: 2, endLine: 113, endCol: 85,
      label: 'SparkplugB Source + Protobuf Decoding',
      panel: {
        title: 'SparkplugB Source \u2014 Protobuf Metric Decoding',
        body:
          '<p>The SparkplugB source does the heavy lifting of decoding Protobuf-encoded metrics:</p>' +
          '<p><strong>init_script</strong> defines a <code>get_metric_value()</code> helper that switches on the SparkplugB datatype ID:</p>' +
          '<ul>' +
          '<li>dt=12 \u2192 String (<code>metric.StringValue</code>)</li>' +
          '<li>dt=11 \u2192 Boolean (<code>metric.BooleanValue</code>)</li>' +
          '<li>dt=10 \u2192 Double (<code>metric.DoubleValue</code>)</li>' +
          '<li>dt=9 \u2192 Float (<code>metric.FloatValue</code>)</li>' +
          '<li>dt=8,4 \u2192 Long/UInt16 (<code>metric.LongValue</code>)</li>' +
          '<li>dt\u22647 \u2192 Integer variants (<code>metric.IntValue</code>)</li>' +
          '</ul>' +
          '<p>The item script loops over <code>result.Metrics</code> using <code>luanet.each()</code> (.NET enumerable iteration) and calls <code>emit("./" .. metric.Name, value)</code> for each metric, creating individual ring buffer items. <code>return nil</code> suppresses the raw Protobuf message.</p>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua + .NET interop)' },
          { page: 'CON10', label: 'CON10 \u2014 Cache API (emit function)' }
        ]
      }
    },
    {
      id: 'ex13-ignition-sink',
      startLine: 152, startCol: 2, endLine: 174, endCol: 85,
      label: 'SparkplugB Sink (Ignition)',
      panel: {
        title: 'SparkplugB Sink \u2014 Ignition Integration',
        body:
          '<p>The SparkplugB sink publishes data to an Ignition SCADA gateway using the SparkplugB namespace hierarchy:</p>' +
          '<ul>' +
          '<li><code>host_id: Acme</code> \u2014 SparkplugB Host Application identifier</li>' +
          '<li><code>group_id: Chicago</code> \u2014 Logical group (typically a site or facility)</li>' +
          '<li><code>node_id: Factory1</code> \u2014 Edge node identifier</li>' +
          '<li><code>device_id: DIME1</code> \u2014 Device identifier within the node</li>' +
          '</ul>' +
          '<p><strong>Birth/Death lifecycle:</strong></p>' +
          '<ul>' +
          '<li><strong>NBIRTH</strong> \u2014 Published on connect (after <code>birth_delay: 10000ms</code> to allow metric discovery)</li>' +
          '<li><strong>NDEATH</strong> \u2014 Published on disconnect (via MQTT Last Will and Testament)</li>' +
          '<li><strong>DDATA</strong> \u2014 Periodic metric updates during normal operation</li>' +
          '</ul>' +
          '<p>The <code>exclude_filter</code> prevents loopback (excluding <code>spb</code> source) and hides PLC system messages.</p>',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'CON08', label: 'CON08 \u2014 Filtering' }
        ]
      }
    },
    {
      id: 'ex13-keyconcepts',
      startLine: 207, startCol: 2, endLine: 232, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>SparkplugB Protocol</strong> \u2014 An industrial MQTT specification using Protobuf encoding. Topics follow <code>spBv1.0/{group}/{verb}/{node}/{device}</code> where verb is NBIRTH, NDEATH, DDATA, etc. Metrics are strongly typed with datatype IDs defined by the spec.</p>' +
          '<p><strong>emit() for Multiple Items</strong> \u2014 A single SparkplugB MQTT message contains multiple metrics. The Lua script unpacks them by looping over <code>result.Metrics</code> and calling <code>emit("./metricName", value)</code> for each. This creates individual ring buffer items from a single message.</p>' +
          '<p><strong>Birth/Death Certificates</strong> \u2014 SparkplugB defines a lifecycle: NBIRTH on connect, NDEATH on disconnect. The <code>birth_delay</code> setting gives DIME time to discover metrics before publishing the birth certificate. Ignition uses these to track device online/offline status.</p>' +
          '<p><strong>Multi-Source Filtering</strong> \u2014 With 2 sources and 3 sinks, <code>exclude_filter</code> becomes critical. Each sink carefully selects which source data it receives. This prevents the SparkplugB sink from creating a publish loop and ensures InfluxDB only stores the metrics it needs.</p>' +
          '<p><strong>.NET Interop in Lua</strong> \u2014 The script uses <code>import(\'System\')</code> to access .NET types and <code>Convert.ToInt32()</code>, <code>Convert.ToDouble()</code> for type conversion. <code>luanet.each()</code> iterates over .NET <code>IEnumerable</code> collections.</p>',
        related: [
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua)' },
          { page: 'EX12', label: 'EX12 \u2014 Secure MQTT' },
          { page: 'CON10', label: 'CON10 \u2014 Cache API' }
        ]
      }
    }
  ]
};
