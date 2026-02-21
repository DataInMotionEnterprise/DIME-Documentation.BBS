/**
 * EX18 — MongoDB Documents
 * EthernetIP PLC → MongoDB Atlas with connection string auth and sink transform.
 */
DIME_PAGES['EX18'] = {
  id: 'EX18',
  title: 'EX18 \u2014 MongoDB Documents',
  file: 'content/EX18-mongodb-documents.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex18-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'MongoDB Documents \u2014 Overview',
        body:
          '<p>This example stores industrial PLC data as documents in <strong>MongoDB Atlas</strong> (cloud). A Rockwell MicroLogix PLC is read via EthernetIP and each data point is written as a document to a MongoDB collection.</p>' +
          '<ul>' +
          '<li><strong>Rockwell EthernetIP Source</strong> \u2014 Reads PLC tags (bools, integers) from a MicroLogix</li>' +
          '<li><strong>MongoDB Sink</strong> \u2014 Stores each value as a document in the <code>DIME.TS</code> collection</li>' +
          '<li><strong>Atlas Connection String</strong> \u2014 Uses <code>mongodb+srv://</code> protocol for cloud clusters</li>' +
          '<li><strong>use_sink_transform</strong> \u2014 Applies source transform to extract raw data values</li>' +
          '</ul>' +
          '<p>The same Rockwell source configuration and cache-and-forward pattern from EX17 is reused here, showing how easily you can swap sinks without changing your source logic.</p>',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'EX17', label: 'EX17 \u2014 InfluxDB Time-Series' },
          { page: 'REF17', label: 'REF17 \u2014 MongoDB' },
          { page: 'REF07', label: 'REF07 \u2014 Ethernet/IP' }
        ]
      }
    },
    {
      id: 'ex18-dataflow',
      startLine: 14, startCol: 2, endLine: 32, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'EthernetIP PLC \u2192 MongoDB Atlas',
        body:
          '<p>A single industrial source feeds a cloud document database:</p>' +
          '<ul>' +
          '<li><strong>Rockwell EthernetIP</strong> \u2014 Reads PLC tags at 1500ms intervals. Uses the cache-and-forward pattern: <code>boolToCache</code> stores a raw bit, <code>boolFromCache</code> reads and publishes it, <code>Execution</code> maps a boolean to Ready/Active strings.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 4096-slot Disruptor buffer distributes data to both sinks.</li>' +
          '<li><strong>MongoDB Atlas Sink</strong> \u2014 Each data point becomes a document in the <code>DIME</code> database, <code>TS</code> collection. Documents include item path, value, and timestamp.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Debug output with <code>use_sink_transform: true</code> for readable values.</li>' +
          '</ul>',
        related: [
          { page: 'CON05', label: 'CON05 \u2014 Architecture Overview' },
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' }
        ]
      }
    },
    {
      id: 'ex18-mongo-config',
      startLine: 85, startCol: 2, endLine: 102, endCol: 85,
      label: 'MongoDB Sink Configuration',
      panel: {
        title: 'MongoDB Sink \u2014 Atlas Document Storage',
        body:
          '<p>The MongoDB sink connector writes documents to a MongoDB collection:</p>' +
          '<ul>' +
          '<li><strong>connector: MongoDB</strong> \u2014 MongoDB document writer</li>' +
          '<li><strong>address</strong> \u2014 Full MongoDB Atlas connection string using <code>mongodb+srv://</code> protocol with embedded credentials, retry settings, and write concern</li>' +
          '<li><strong>database</strong> \u2014 Target database name (<code>DIME</code>)</li>' +
          '<li><strong>collection</strong> \u2014 Target collection name (<code>TS</code>)</li>' +
          '<li><strong>use_sink_transform: true</strong> \u2014 Applies the source\u2019s <code>sink.transform.template: Message.Data</code> to extract raw values before storing</li>' +
          '<li><strong>exclude_filter</strong> \u2014 Blocks <code>rockwell/$SYSTEM</code> health messages from being stored</li>' +
          '</ul>' +
          '<p><strong>Security note:</strong> The connection string contains credentials. In production, use environment variables or separate credential files outside version control.</p>',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'CON11', label: 'CON11 \u2014 Templates & Formatting' }
        ]
      }
    },
    {
      id: 'ex18-keyconcepts',
      startLine: 130, startCol: 2, endLine: 150, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>MongoDB Sink</strong> \u2014 The MongoDB connector writes each incoming message as a document to the specified database and collection. Each document includes the item path, transformed value, and timestamp. Ideal for event logs and document-oriented time-series storage.</p>' +
          '<p><strong>Atlas Connection String</strong> \u2014 Uses the <code>mongodb+srv://</code> protocol for MongoDB Atlas cloud clusters. The connection string includes authentication credentials, retry settings (<code>retryWrites=true</code>), and write concern (<code>w=majority</code>). Keep credentials out of version control.</p>' +
          '<p><strong>use_sink_transform</strong> \u2014 When <code>true</code> on a sink, it applies the source\u2019s <code>sink.transform.template</code> to extract just the data value (<code>Message.Data</code>) before writing. Without it, the full <code>MessageBoxMessage</code> envelope would be stored as the document.</p>' +
          '<p><strong>Cache-and-Forward Pattern</strong> \u2014 Same as EX17: cache raw PLC bits with <code>set()</code> / <code>return nil</code>, then read with <code>cache()</code> in derived items. This cleanly separates data acquisition from transformation.</p>',
        related: [
          { page: 'CON10', label: 'CON10 \u2014 Cache API' },
          { page: 'CON11', label: 'CON11 \u2014 Templates & Formatting' },
          { page: 'EX17', label: 'EX17 \u2014 InfluxDB Time-Series' }
        ]
      }
    }
  ]
};
