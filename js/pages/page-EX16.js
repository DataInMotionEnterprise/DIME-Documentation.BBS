/**
 * EX16 — MTConnect Aggregation
 * Read from remote MTConnect agent, re-publish locally. Agent-to-agent pattern.
 */
DIME_PAGES['EX16'] = {
  id: 'EX16',
  title: 'EX16 \u2014 MTConnect Aggregation',
  file: 'content/EX16-mtconnect-aggregation.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex16-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'MTConnect Aggregation \u2014 Overview',
        body:
          '<p>This example demonstrates the <strong>agent-to-agent aggregation</strong> pattern. DIME reads data from a remote MTConnect agent (Mazak demo server) and re-publishes it through a local MTConnect Agent sink.</p>' +
          '<ul>' +
          '<li><strong>MTConnect Source</strong> \u2014 Reads from <code>mtconnect.mazakcorp.com:5719</code></li>' +
          '<li><strong>MTConnect Agent Sink</strong> \u2014 Re-publishes on local port 5000</li>' +
          '<li><strong>strip_path_prefix</strong> \u2014 Removes source connector name from item paths</li>' +
          '<li><strong>Per-item path remapping</strong> \u2014 Restructures the device model for the local agent</li>' +
          '</ul>' +
          '<p>This pattern enables centralized data collection from distributed MTConnect agents across a factory floor or multiple facilities.</p>',
        related: [
          { page: 'EX15', label: 'EX15 \u2014 MTConnect Agent Output' },
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'REF20', label: 'REF20 \u2014 MTConnect Agent' }
        ]
      }
    },
    {
      id: 'ex16-dataflow',
      startLine: 13, startCol: 2, endLine: 33, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Remote Agent \u2192 Ring Buffer \u2192 Local Agent',
        body:
          '<p>Data flows through the DIME aggregation pipeline:</p>' +
          '<ul>' +
          '<li><strong>MTConnect Source</strong> \u2014 Polls the remote Mazak agent every 1000ms using <code>itemized_read: true</code>. Each item has an <code>address</code> field that maps to a DataItem on the remote agent (e.g., <code>avail</code>, <code>execution</code>, <code>Xload</code>).</li>' +
          '<li><strong>Sink Transform</strong> \u2014 The source defines <code>Message.Data[0].Value</code> to extract the raw value from the MTConnect response array.</li>' +
          '<li><strong>Local Agent Sink</strong> \u2014 Receives transformed values and places them in the local device model using <code>sink.mtconnect</code> path annotations.</li>' +
          '</ul>' +
          '<p>The Console sink is commented out in main.yaml (<code>#- *consoleSink1</code>) but can be enabled for debugging by removing the <code>#</code>.</p>',
        related: [
          { page: 'CON05', label: 'CON05 \u2014 Architecture Overview' },
          { page: 'CON11', label: 'CON11 \u2014 Templates & Formatting' }
        ]
      }
    },
    {
      id: 'ex16-source-config',
      startLine: 39, startCol: 2, endLine: 73, endCol: 85,
      label: 'MTConnect Source Configuration',
      panel: {
        title: 'MTConnect Source \u2014 Remote Agent Reader',
        body:
          '<p>The MTConnect source connector reads from a remote agent:</p>' +
          '<ul>' +
          '<li><strong>connector: MTConnectAgent</strong> \u2014 Same connector type works as both source and sink</li>' +
          '<li><strong>address + port</strong> \u2014 Point to the remote agent (<code>mtconnect.mazakcorp.com:5719</code>)</li>' +
          '<li><strong>itemized_read: true</strong> \u2014 Each item is read individually, giving per-item control</li>' +
          '<li><strong>strip_path_prefix: true</strong> \u2014 Removes the source name prefix from item paths</li>' +
          '</ul>' +
          '<p><strong>Transform pipeline:</strong> The <code>sink.transform.template: Message.Data[0].Value</code> extracts the raw value from the MTConnect response. The sink sets <code>use_sink_transform: true</code> to apply this extraction.</p>' +
          '<p><strong>Path remapping:</strong> Each item\u2019s <code>sink.mtconnect</code> annotation restructures where the value appears in the local agent\u2019s device model. For example, <code>Xload</code> from the remote agent is remapped to <code>Device[Name=device1]/Axes/Linear[Name=X]/Load[Category=Sample]</code>.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'CON11', label: 'CON11 \u2014 Templates & Formatting' }
        ]
      }
    },
    {
      id: 'ex16-keyconcepts',
      startLine: 119, startCol: 2, endLine: 141, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Agent-to-Agent Pattern</strong> \u2014 The <code>MTConnectAgent</code> connector is dual-purpose. As a source, it reads <code>/current</code> from a remote agent. As a sink, it publishes values through a local agent HTTP server. This pattern enables data aggregation from distributed agents.</p>' +
          '<p><strong>strip_path_prefix</strong> \u2014 When <code>true</code>, the source strips its own connector name from item paths. Without it, items arrive as <code>mtConnectSource1/Availability</code>. With it, they arrive as just <code>Availability</code>, simplifying downstream path matching and remapping.</p>' +
          '<p><strong>Sink Transform Chain</strong> \u2014 The source defines a transform template (<code>Message.Data[0].Value</code>) and the sink enables it with <code>use_sink_transform: true</code>. This two-step pattern ensures the transform is defined close to the data shape (at the source) but applied at the sink.</p>' +
          '<p><strong>itemized_read</strong> \u2014 When <code>true</code>, each item is read individually from the remote agent using its <code>address</code> field. This gives fine-grained control over which DataItems are collected, versus bulk-reading everything.</p>',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' },
          { page: 'CON11', label: 'CON11 \u2014 Templates & Formatting' },
          { page: 'EX15', label: 'EX15 \u2014 MTConnect Agent Output' }
        ]
      }
    }
  ]
};
