/**
 * EX17 — InfluxDB Time-Series
 * Industrial sources → InfluxLP sink with token auth and cloud endpoints.
 */
DIME_PAGES['EX17'] = {
  id: 'EX17',
  title: 'EX17 \u2014 InfluxDB Time-Series',
  file: 'content/EX17-influxdb-time-series.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex17-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'InfluxDB Time-Series \u2014 Overview',
        body:
          '<p>This example connects industrial sources to <strong>InfluxDB Cloud</strong> for time-series storage. Two industrial protocols feed a single InfluxLP sink:</p>' +
          '<ul>' +
          '<li><strong>Rockwell EthernetIP</strong> \u2014 Reads PLC tags (bools, integers) from a MicroLogix at 1.5s intervals</li>' +
          '<li><strong>Modbus TCP</strong> \u2014 Reads coils and holding registers (disabled by default, enable with hardware)</li>' +
          '<li><strong>InfluxLP Sink</strong> \u2014 Writes to InfluxDB Cloud using Line Protocol over HTTPS with token auth</li>' +
          '<li><strong>Console Sink</strong> \u2014 Debug output with source transform applied</li>' +
          '</ul>' +
          '<p>Demonstrates the standard DIME fan-in pattern: multiple sources feed the same ring buffer, and all sinks consume from it independently.</p>',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'EX18', label: 'EX18 \u2014 MongoDB Documents' },
          { page: 'REF13', label: 'REF13 \u2014 InfluxLP' },
          { page: 'REF07', label: 'REF07 \u2014 Ethernet/IP' }
        ]
      }
    },
    {
      id: 'ex17-dataflow',
      startLine: 14, startCol: 2, endLine: 42, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Industrial PLCs \u2192 InfluxDB Cloud',
        body:
          '<p>Multiple industrial sources feed a single time-series database:</p>' +
          '<ul>' +
          '<li><strong>Rockwell EthernetIP</strong> \u2014 Reads boolean bits (<code>B3:0/2</code>, <code>B3:0/3</code>) and integer tags (<code>N7:1</code>) from a MicroLogix PLC. Uses the cache-and-forward pattern to separate acquisition from transformation.</li>' +
          '<li><strong>Modbus TCP</strong> \u2014 Reads digital coils and holding registers. Uses the <code>struct</code> library to decode multi-register values. Disabled by default (<code>enabled: false</code>).</li>' +
          '<li><strong>InfluxLP Sink</strong> \u2014 Writes each data point using InfluxDB Line Protocol. Each item becomes a measurement named after its source/item path. Timestamps are automatically added.</li>' +
          '</ul>' +
          '<p>The <strong>exclude_filter</strong> on both sinks blocks <code>rockwell/$SYSTEM</code> messages to keep health data out of the database and console output.</p>',
        related: [
          { page: 'CON05', label: 'CON05 \u2014 Architecture Overview' },
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' }
        ]
      }
    },
    {
      id: 'ex17-influx-config',
      startLine: 131, startCol: 2, endLine: 147, endCol: 85,
      label: 'InfluxLP Sink Configuration',
      panel: {
        title: 'InfluxLP Sink \u2014 Cloud Time-Series Storage',
        body:
          '<p>The InfluxLP sink connector writes data using InfluxDB Line Protocol:</p>' +
          '<ul>' +
          '<li><strong>connector: InfluxLP</strong> \u2014 InfluxDB Line Protocol writer</li>' +
          '<li><strong>address</strong> \u2014 Full HTTPS URL to the InfluxDB Cloud endpoint</li>' +
          '<li><strong>token</strong> \u2014 API token for authentication (InfluxDB v2/Cloud standard)</li>' +
          '<li><strong>bucket_name</strong> \u2014 Target bucket name in InfluxDB</li>' +
          '<li><strong>exclude_filter</strong> \u2014 Blocks <code>rockwell/$SYSTEM</code> health messages</li>' +
          '</ul>' +
          '<p><strong>Security note:</strong> Keep API tokens in separate YAML files that are not committed to version control. The token shown in the example is truncated.</p>',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'ex17-keyconcepts',
      startLine: 178, startCol: 2, endLine: 198, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>InfluxLP Connector</strong> \u2014 Writes data using InfluxDB Line Protocol over HTTPS. Each item becomes a measurement with the source/item path as the measurement name. Timestamps are generated automatically at write time.</p>' +
          '<p><strong>Token Authentication</strong> \u2014 The InfluxLP sink uses a <code>token</code> property for API authentication. This is the standard InfluxDB v2/Cloud mechanism. Always keep tokens in separate YAML files outside version control.</p>' +
          '<p><strong>Cache-and-Forward Pattern</strong> \u2014 The Rockwell source demonstrates caching raw PLC data: <code>set(\'boolTag\', result); return nil;</code> stores a value without publishing. Other items use <code>cache(\'boolTag\', false)</code> to read and transform cached values for publication.</p>' +
          '<p><strong>Multiple Sources, One Sink</strong> \u2014 Both Modbus and Rockwell sources publish to the same ring buffer. The InfluxDB sink receives all data regardless of its origin. This is the standard DIME fan-in pattern for data consolidation.</p>',
        related: [
          { page: 'CON10', label: 'CON10 \u2014 Cache API' },
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'EX18', label: 'EX18 \u2014 MongoDB Documents' }
        ]
      }
    }
  ]
};
