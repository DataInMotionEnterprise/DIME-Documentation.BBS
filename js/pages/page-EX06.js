/**
 * EX06 — EtherNet/IP (Rockwell)
 * Allen-Bradley CIP protocol + SHARC MQTT sensors. Multi-source fusion to multiple sinks.
 */
DIME_PAGES['EX06'] = {
  id: 'EX06',
  title: 'EX06 \u2014 EtherNet/IP (Rockwell)',
  file: 'content/EX06-ethernet-ip-rockwell.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex06-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'EtherNet/IP (Rockwell) \u2014 Overview',
        body:
          '<p>This is the most complex example so far \u2014 a full multi-source, multi-sink integration. It demonstrates:</p>' +
          '<ul>' +
          '<li><strong>EtherNet/IP source</strong> \u2014 Reads Allen-Bradley MicroLogix PLC via CIP protocol with file-based addressing</li>' +
          '<li><strong>MQTT source</strong> \u2014 Subscribes to SHARC IoT sensor data with wildcard topics and Lua JSON parsing</li>' +
          '<li><strong>3 sinks</strong> \u2014 Console for debugging, MQTT for republishing, Sparkplug B for Ignition SCADA</li>' +
          '<li><strong>emit() API</strong> \u2014 Publishes multiple observations from a single incoming message</li>' +
          '<li><strong>Sink transforms</strong> \u2014 Source-defined transforms that sinks can opt into with <code>use_sink_transform</code></li>' +
          '<li><strong>Include/exclude filters</strong> \u2014 Targeted data routing from shared ring buffer to specific sinks</li>' +
          '</ul>' +
          '<p>Six YAML files compose the full pipeline \u2014 this is how production DIME deployments look.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: 'EX04', label: 'EX04 \u2014 Siemens S7 PLC' }
        ]
      }
    },
    {
      id: 'ex06-dataflow',
      startLine: 14, startCol: 2, endLine: 42, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: '2 Sources \u2192 Ring Buffer \u2192 3 Sinks',
        body:
          '<p>Two sources feed data into a shared ring buffer, consumed by three independent sinks:</p>' +
          '<ul>' +
          '<li><strong>Rockwell Source</strong> \u2014 Polls a MicroLogix PLC at <code>192.168.111.20</code> every 1500ms via CIP/EtherNet/IP. Reads machine execution state (bool \u2192 string via Lua) and part count (integer).</li>' +
          '<li><strong>SHARC Source</strong> \u2014 Subscribes to <code>sharc/+/evt/#</code> MQTT topics. The wildcard captures all SHARC sensor events. Lua <code>item_script</code> parses JSON, extracts serial numbers, and uses <code>emit()</code> to create individual observations per sensor.</li>' +
          '</ul>' +
          '<p><strong>Sinks:</strong></p>' +
          '<ul>' +
          '<li><strong>Console</strong> \u2014 Prints with sink transform applied; excludes rockwell/$SYSTEM</li>' +
          '<li><strong>MQTT Sink</strong> \u2014 Republishes to <code>DimeTutorial/</code> topic tree with retain; excludes system messages</li>' +
          '<li><strong>Sparkplug B</strong> \u2014 Publishes to Ignition SCADA; uses <code>include_filter</code> for rockwell + sharcs data only</li>' +
          '</ul>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'ex06-mqtt-emit',
      startLine: 75, startCol: 2, endLine: 111, endCol: 85,
      label: 'MQTT Source & emit() API',
      panel: {
        title: 'SHARC MQTT Source \u2014 Wildcard Topics & emit()',
        body:
          '<p>The SHARC source demonstrates advanced MQTT patterns:</p>' +
          '<ul>' +
          '<li><strong>Wildcard subscription</strong> \u2014 <code>sharc/+/evt/#</code> matches all SHARC sensors. The <code>+</code> captures the serial number, <code>#</code> captures the event type.</li>' +
          '<li><strong>itemized_read: false</strong> \u2014 Disables polling; the MQTT connector delivers messages as they arrive (event-driven).</li>' +
          '<li><strong>JSON parsing</strong> \u2014 <code>json.decode(result).v</code> extracts the value field from the SHARC JSON payload.</li>' +
          '<li><strong>emit() API</strong> \u2014 Each incoming MQTT message may produce multiple observations. <code>emit("./serial/network/ip", value)</code> publishes each field as a separate ring buffer entry with a dynamically constructed path.</li>' +
          '<li><strong>return nil</strong> \u2014 After calling <code>emit()</code>, return <code>nil</code> to suppress the default item output. Without this, the raw MQTT payload would also be published.</li>' +
          '</ul>' +
          '<p>The <code>this.Key</code> variable contains the full MQTT topic path, which the script splits to extract the sensor serial number and event type.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (emit API)' },
          { page: '10', label: '10 \u2014 Cache API' }
        ]
      }
    },
    {
      id: 'ex06-sinks',
      startLine: 113, startCol: 2, endLine: 188, endCol: 85,
      label: 'Sink Configuration',
      panel: {
        title: '3 Sinks \u2014 Console, MQTT, Sparkplug B',
        body:
          '<p>Three sinks demonstrate different output patterns:</p>' +
          '<ul>' +
          '<li><strong>Console</strong> \u2014 Uses <code>use_sink_transform: true</code> to apply the rockwell source\u2019s <code>Message.Data</code> transform. Excludes <code>rockwell/$SYSTEM</code>.</li>' +
          '<li><strong>MQTT Sink</strong> \u2014 Republishes to a different topic tree (<code>DimeTutorial/</code>) with <code>retain: true</code>. The <code>base_topic</code> field prefixes all item paths.</li>' +
          '<li><strong>Sparkplug B</strong> \u2014 Connects to Ignition SCADA via the Sparkplug B specification. Uses a 4-level namespace: <code>host_id/group_id/node_id/device_id</code>. The <code>include_filter</code> ensures only PLC and sensor data reaches Ignition \u2014 no system messages.</li>' +
          '</ul>' +
          '<p><strong>Sink Transform</strong> \u2014 The rockwell source defines <code>sink.transform.template: Message.Data</code>. Sinks that set <code>use_sink_transform: true</code> extract just the data value; others receive the full <code>MessageBoxMessage</code> envelope.</p>',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: '11', label: '11 \u2014 Templates & Formatting' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'ex06-keyconcepts',
      startLine: 190, startCol: 2, endLine: 218, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>EtherNet/IP Connector</strong> \u2014 Uses CIP (Common Industrial Protocol) to read Allen-Bradley PLCs. The <code>type</code> field selects the PLC family (<code>micrologix</code>, <code>logix</code>). The <code>path: 1,0</code> sets the CIP routing path (backplane 1, slot 0). MicroLogix uses file-based addressing: <code>B3:0/3</code> = bit file 3, word 0, bit 3.</p>' +
          '<p><strong>emit() vs return</strong> \u2014 Normally, a script returns a single value per item per scan. The <code>emit("./path", value)</code> function breaks this pattern by publishing multiple observations from one script execution. Always <code>return nil</code> after using <code>emit()</code> to prevent duplicate output.</p>' +
          '<p><strong>Sparkplug B</strong> \u2014 An MQTT-based specification for industrial SCADA. It manages birth/death certificates, uses protobuf encoding, and organizes tags into a <code>host/group/node/device</code> hierarchy. DIME\u2019s <code>SparkplugB</code> connector handles the full specification including <code>reconnect_interval</code> and <code>birth_delay</code> timing.</p>' +
          '<p><strong>include_filter vs exclude_filter</strong> \u2014 <code>include_filter</code> is a whitelist: only matching paths are delivered. <code>exclude_filter</code> is a blacklist: matching paths are blocked. The Ignition sink uses <code>include_filter: [rockwell, sharcs]</code> to receive only data from those two sources.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: '09', label: '09 \u2014 Scripting (emit API)' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    }
  ]
};
