/**
 * EX29 — Multi-Machine Shop Floor
 * Haas + Mazak + Rockwell + CSV: diverse CNC sources, one ring buffer.
 */
DIME_PAGES['EX29'] = {
  id: 'EX29',
  title: 'EX29 \u2014 Multi-Machine Shop Floor',
  file: 'content/EX29-multi-machine-shop-floor.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex29-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Multi-Machine Shop Floor \u2014 Overview',
        body:
          '<p>This is a real-world shop floor integration connecting <strong>five different machines</strong> using five different protocols into a single DIME ring buffer:</p>' +
          '<ul>' +
          '<li><strong>haas1</strong> \u2014 HaasSHDR connector (native Haas protocol on port 9998)</li>' +
          '<li><strong>haas2</strong> \u2014 XMLWebScraper connector (scraping MTConnect XML endpoint)</li>' +
          '<li><strong>haas5</strong> \u2014 TcpASCII connector (raw TCP Q-commands for macro variables)</li>' +
          '<li><strong>mazak1</strong> \u2014 MTConnectAgent connector (standard MTConnect HTTP)</li>' +
          '<li><strong>rock1</strong> \u2014 EthernetIP connector (Allen-Bradley MicroLogix PLC)</li>' +
          '</ul>' +
          '<p>Output flows to Console, MQTT, MTConnect SHDR, CSV, HTTP Server, and WebSocket \u2014 demonstrating how one ring buffer can feed many output formats simultaneously.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '15', label: '15 \u2014 MTConnect' },
          { page: 'EX28', label: 'EX28 \u2014 Unified Namespace' }
        ]
      }
    },
    {
      id: 'ex29-dataflow',
      startLine: 13, startCol: 2, endLine: 43, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: '5 Protocols \u2192 1 Ring Buffer \u2192 6+ Sinks',
        body:
          '<p>Each source speaks a different protocol to its machine but all data enters the same Disruptor ring buffer as normalized <code>MessageBoxMessage</code> objects:</p>' +
          '<ul>' +
          '<li><strong>SHDR</strong> \u2014 Haas native protocol with CPU load data</li>' +
          '<li><strong>XML/XPath</strong> \u2014 Scraping MTConnect Streams XML with namespace-aware XPath queries</li>' +
          '<li><strong>TCP-ASCII</strong> \u2014 Sending Q-code commands (?Q100, ?Q201, ?Q600) and parsing comma-separated responses</li>' +
          '<li><strong>MTConnect HTTP</strong> \u2014 Standard MTConnect agent polling for axis loads</li>' +
          '<li><strong>EtherNet/IP</strong> \u2014 Direct PLC register reads from Allen-Bradley MicroLogix</li>' +
          '</ul>' +
          '<p>The 14-file configuration lets operators enable/disable any source or sink by commenting a single alias in <code>main.yaml</code>.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '07', label: '07 \u2014 Sink Connectors' }
        ]
      }
    },
    {
      id: 'ex29-config',
      startLine: 44, startCol: 2, endLine: 185, endCol: 85,
      label: 'YAML Configuration (14 files)',
      panel: {
        title: 'Multi-Protocol Configuration',
        body:
          '<p>Each machine gets its own YAML file with protocol-specific settings:</p>' +
          '<ul>' +
          '<li><strong>HaasSHDR</strong> \u2014 <code>address</code>, <code>port</code>, <code>timeout</code>, <code>heartbeat_interval</code>, <code>retry_interval</code></li>' +
          '<li><strong>XMLWebScraper</strong> \u2014 <code>uri</code>, <code>namespaces</code> for XPath, <code>item_script</code> for extraction</li>' +
          '<li><strong>TcpASCII</strong> \u2014 <code>read_delay</code> for response timing, Penlight string parsing in <code>init_script</code></li>' +
          '<li><strong>MTConnectAgent</strong> \u2014 <code>strip_path_prefix</code>, template extracting <code>Message.Data[0].Value</code></li>' +
          '<li><strong>EthernetIP</strong> \u2014 <code>type: micrologix</code>, <code>path</code>, <code>bypass_ping</code>, boolean-to-string mapping in script</li>' +
          '</ul>' +
          '<p>Every item carries <code>sink.mtconnect</code> metadata for standards-compliant output through the SHDR and Agent sinks.</p>',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '11', label: '11 \u2014 Templates & Formatting' }
        ]
      }
    },
    {
      id: 'ex29-keyconcepts',
      startLine: 186, startCol: 2, endLine: 211, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Multi-Protocol Normalization</strong> \u2014 Five different industrial protocols are normalized into the same <code>MessageBoxMessage</code> format. Sinks do not need to know which protocol produced the data.</p>' +
          '<p><strong>MTConnect Metadata</strong> \u2014 Each item\u2019s <code>sink.mtconnect</code> annotation describes its position in an MTConnect device model (e.g., <code>Device[name=device1]/Controller/Load[category=Sample]</code>). The SHDR and MTConnectAgent sinks use this to generate standards-compliant output.</p>' +
          '<p><strong>emit_mtconnect()</strong> \u2014 The haas5 ThreeInOne item sends one TCP command but receives program name, status, and part count. <code>emit_mtconnect()</code> publishes each as a separate observation with its own MTConnect annotation.</p>' +
          '<p><strong>Penlight String Library</strong> \u2014 The TcpASCII source loads <code>pl.stringx</code> in <code>init_script</code> for <code>split()</code>, <code>strip()</code>, and <code>replace()</code> operations on raw Haas responses.</p>' +
          '<p><strong>Flexible Sink Routing</strong> \u2014 Commenting/uncommenting aliases in <code>main.yaml</code> enables/disables entire output channels. The same data can simultaneously flow to Console, MQTT, SHDR, CSV, HTTP, and WebSocket.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '14', label: '14 \u2014 MQTT Connector' },
          { page: '15', label: '15 \u2014 MTConnect' }
        ]
      }
    }
  ]
};
