/**
 * EX08 — OPC-UA Server Sink
 * DIME as an OPC-UA server: Script source → Console + OPC-UA Server endpoint.
 */
DIME_PAGES['EX08'] = {
  id: 'EX08',
  title: 'EX08 \u2014 OPC-UA Server Sink',
  file: 'content/EX08-opcua-server-sink.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex08-overview',
      startLine: 4, startCol: 2, endLine: 10, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'OPC-UA Server Sink \u2014 Overview',
        body:
          '<p>This example turns DIME into an OPC-UA server. Instead of connecting <em>to</em> an OPC-UA server (as a client), DIME <em>becomes</em> the server.</p>' +
          '<ul>' +
          '<li><strong>Script source</strong> \u2014 Generates random integers (1\u2013200) every 2 seconds via Lua</li>' +
          '<li><strong>OPC-UA Server sink</strong> \u2014 Exposes ring buffer data as browsable OPC-UA nodes on port 4840</li>' +
          '<li><strong>Console sink</strong> \u2014 Prints values to stdout for debugging</li>' +
          '</ul>' +
          '<p>Any standard OPC-UA client (UaExpert, Ignition, Kepware) can connect to <code>opc.tcp://localhost:4840</code>, browse the "Production" folder, and subscribe to live data updates.</p>',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: 'EX10', label: 'EX10 \u2014 OPC-DA Legacy (COM-based)' },
          { page: 'REF25', label: 'REF25 \u2014 OPC-UA' }
        ]
      }
    },
    {
      id: 'ex08-dataflow',
      startLine: 13, startCol: 2, endLine: 29, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Script Source \u2192 Ring Buffer \u2192 OPC-UA Server',
        body:
          '<p>Data flows through two stages:</p>' +
          '<ul>' +
          '<li><strong>Script Source</strong> \u2014 Lua generates <code>math.random(200)</code> every 2000ms. RBE is enabled, so only changed values are published.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 The value enters the 4096-slot Disruptor ring buffer as a <code>MessageBoxMessage</code>.</li>' +
          '<li><strong>OPC-UA Server</strong> \u2014 Each ring buffer item becomes an OPC-UA node under the "Production" root folder. Clients browse and subscribe to nodes in the configured namespace URI.</li>' +
          '<li><strong>Console</strong> \u2014 Simultaneously prints values to stdout for verification.</li>' +
          '</ul>' +
          '<p>The OPC-UA server uses <code>exclude_filter: /\\$SYSTEM</code> to hide internal DIME system messages from the OPC-UA browse tree. Only real data items appear as nodes.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'ex08-config',
      startLine: 31, startCol: 2, endLine: 99, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File YAML \u2014 4 Files',
        body:
          '<p>Four files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>main.yaml</strong> \u2014 Wires sources and sinks together using anchor aliases</li>' +
          '<li><strong>script.yaml</strong> \u2014 Lua source generating random data every 2s</li>' +
          '<li><strong>console.yaml</strong> \u2014 Simple console output sink</li>' +
          '<li><strong>opcUa.yaml</strong> \u2014 The OPC-UA Server sink with full server configuration</li>' +
          '</ul>' +
          '<p><strong>Key OPC-UA Server properties:</strong></p>' +
          '<ul>' +
          '<li><code>port: 4840</code> \u2014 Standard OPC-UA port</li>' +
          '<li><code>application_name</code> / <code>application_uri</code> \u2014 Server identity for client discovery</li>' +
          '<li><code>namespace_uri</code> \u2014 Scopes data nodes to a custom namespace</li>' +
          '<li><code>root_folder</code> \u2014 Top-level folder name in the OPC-UA browse tree</li>' +
          '<li><code>max_sessions</code> / <code>max_subscriptions</code> \u2014 Resource limits for connected clients</li>' +
          '</ul>',
        related: [
          { page: '21', label: '21 \u2014 Multi-File Configs' },
          { page: '04', label: '04 \u2014 YAML Basics' }
        ]
      }
    },
    {
      id: 'ex08-keyconcepts',
      startLine: 100, startCol: 2, endLine: 123, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>OPC-UA Server Sink</strong> \u2014 Unlike an OPC-UA client (source), the OPC-UA Server sink makes DIME the server. Every item published to the ring buffer becomes a browsable OPC-UA node. External SCADA systems, HMIs, and historians can subscribe to updates.</p>' +
          '<p><strong>Server Identity</strong> \u2014 The <code>application_name</code> and <code>application_uri</code> identify this server during OPC-UA discovery. The <code>namespace_uri</code> scopes all data nodes to a unique namespace to avoid collisions.</p>' +
          '<p><strong>Session Management</strong> \u2014 <code>max_sessions: 50</code> limits concurrent client connections. <code>session_timeout: 60000</code> (60 seconds) cleans up idle sessions. <code>max_subscriptions: 20</code> bounds data subscriptions per session.</p>' +
          '<p><strong>System Message Filtering</strong> \u2014 The regex <code>/\\$SYSTEM</code> in the exclude_filter hides DIME internal messages from OPC-UA clients. This keeps the browse tree clean with only real data items.</p>' +
          '<p><strong>OPC-UA vs OPC-DA</strong> \u2014 OPC-UA (this example) is the modern, platform-independent standard. OPC-DA (see EX10) is the legacy Windows COM-based standard. Use OPC-UA for new deployments.</p>',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' },
          { page: 'EX10', label: 'EX10 \u2014 OPC-DA Legacy' }
        ]
      }
    }
  ]
};
