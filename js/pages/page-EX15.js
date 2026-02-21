/**
 * EX15 — MTConnect Agent Output
 * Script source → MTConnect Agent sink with per-item Device/Controller path mapping.
 */
DIME_PAGES['EX15'] = {
  id: 'EX15',
  title: 'EX15 \u2014 MTConnect Agent Output',
  file: 'content/EX15-mtconnect-agent-output.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex15-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'MTConnect Agent Output \u2014 Overview',
        body:
          '<p>This example demonstrates how to publish data to an <strong>MTConnect Agent</strong> sink using DIME. A Lua Script source generates random numbers, and each item includes a <code>sink.mtconnect</code> annotation that maps the value to a specific location in the MTConnect device model.</p>' +
          '<ul>' +
          '<li><strong>Script Source</strong> \u2014 Generates random values with <code>math.random()</code></li>' +
          '<li><strong>MTConnect Agent Sink</strong> \u2014 Embeds a full MTConnect agent on port 5000</li>' +
          '<li><strong>Per-item path mapping</strong> \u2014 Each item defines its Device/Component/DataItem path</li>' +
          '<li><strong>Console Sink</strong> \u2014 Parallel debug output to stdout</li>' +
          '</ul>' +
          '<p>The agent automatically constructs the MTConnect device model XML from the <code>sink.mtconnect</code> annotations on each item \u2014 no separate Devices.xml file is needed.</p>',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'EX16', label: 'EX16 \u2014 MTConnect Aggregation' },
          { page: 'REF20', label: 'REF20 \u2014 MTConnect Agent' }
        ]
      }
    },
    {
      id: 'ex15-dataflow',
      startLine: 13, startCol: 2, endLine: 31, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Script Source \u2192 MTConnect Agent + Console',
        body:
          '<p>Data flows through two stages:</p>' +
          '<ul>' +
          '<li><strong>Script Source</strong> \u2014 Two Lua items generate random numbers each scan cycle. <code>number1</code> produces values 1\u2013100, <code>number2</code> produces values 1\u2013200.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 Values are published as <code>MessageBoxMessage</code> objects to the 4096-slot Disruptor ring buffer.</li>' +
          '<li><strong>MTConnect Agent Sink</strong> \u2014 Receives values and maps them to the MTConnect device model using the <code>sink.mtconnect</code> path on each item. Serves standard MTConnect REST endpoints on port 5000.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Prints values to stdout for debugging.</li>' +
          '</ul>' +
          '<p>Both sinks filter out <code>script/$SYSTEM</code> messages to avoid publishing connector health data to the MTConnect output.</p>',
        related: [
          { page: 'CON05', label: 'CON05 \u2014 Architecture Overview' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'ex15-config',
      startLine: 33, startCol: 2, endLine: 93, endCol: 85,
      label: 'YAML Configuration (4 files)',
      panel: {
        title: 'Multi-File Configuration \u2014 Script + Agent + Console',
        body:
          '<p>Four YAML files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>script.yaml</strong> \u2014 Defines the Script source with two items. Each item has a <code>sink.mtconnect</code> path annotation that tells the MTConnect Agent sink where to place the value in the device model.</li>' +
          '<li><strong>agent.yaml</strong> \u2014 Defines the MTConnect Agent sink on port 5000 with an exclude filter for system messages.</li>' +
          '<li><strong>console.yaml</strong> \u2014 Console sink for debug output.</li>' +
          '<li><strong>main.yaml</strong> \u2014 References all anchors and sets app-level config.</li>' +
          '</ul>' +
          '<p><strong>Key pattern:</strong> The <code>sink.mtconnect</code> path uses XPath-like syntax:</p>' +
          '<p><code>Device[name=device1]/Controller/Mass[category=Sample]</code></p>' +
          '<p>This creates a Device named "device1" with a Controller component containing a Mass DataItem of category Sample.</p>',
        related: [
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' },
          { page: 'CON04', label: 'CON04 \u2014 YAML Basics' }
        ]
      }
    },
    {
      id: 'ex15-keyconcepts',
      startLine: 94, startCol: 2, endLine: 115, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>MTConnect Agent Sink</strong> \u2014 DIME embeds a full MTConnect Agent that serves standard REST endpoints (<code>/probe</code>, <code>/current</code>, <code>/sample</code>). The <code>connector: MTConnectAgent</code> type starts an HTTP server on the specified <code>port</code>. External MTConnect clients can read from it like any standard agent.</p>' +
          '<p><strong>Per-Item Path Mapping</strong> \u2014 The <code>sink.mtconnect</code> annotation on each source item defines where the value appears in the MTConnect device model hierarchy. The agent sink automatically constructs the device model XML from these annotations.</p>' +
          '<p><strong>Device Model Auto-Construction</strong> \u2014 Unlike traditional MTConnect agents that require a separate Devices.xml file, DIME builds the device model dynamically from the <code>sink.mtconnect</code> paths across all incoming items.</p>' +
          '<p><strong>Exclude Filters</strong> \u2014 Both sinks use <code>exclude_filter: [script/$SYSTEM]</code> to prevent system health messages (IsConnected, FaultCount) from polluting the MTConnect output or console display.</p>',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' },
          { page: 'EX16', label: 'EX16 \u2014 MTConnect Aggregation' }
        ]
      }
    }
  ]
};
