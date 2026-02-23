/**
 * EX03 — OPC-UA Client Reads
 * OPC-UA source with username/password auth, namespace addressing, RBE, Lua item_script.
 */

DIME_PAGES['EX03'] = {
  id: 'EX03',
  title: 'EX03 \u2014 OPC-UA Client Reads',
  file: 'content/EX03-opcua-client-reads.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex03-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'OPC-UA Client Reads \u2014 Overview',
        body:
          '<p>This example connects to an OPC-UA server using username/password authentication and reads node values. It demonstrates:</p>' +
          '<ul>' +
          '<li><strong>OPC-UA source connector</strong> \u2014 Polling client that reads OPC nodes at a configurable interval</li>' +
          '<li><strong>Namespace addressing</strong> \u2014 Each item targets a specific OPC-UA namespace index and node path</li>' +
          '<li><strong>item_script</strong> \u2014 A shared Lua script that runs for every item, unwrapping the OPC DataValue wrapper to extract the raw <code>.Value</code></li>' +
          '<li><strong>Per-item RBE</strong> \u2014 Report By Exception can be overridden at the item level</li>' +
          '</ul>' +
          '<p>The config includes a library of pre-configured items (Random, Sine, Ramp, User functions) that are disabled by default. Enable them as needed without editing addresses.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX01', label: 'EX01 \u2014 Basic Counter (simpler starting point)' },
          { page: 'REF25', label: 'REF25 \u2014 OPC-UA' }
        ]
      }
    },
    {
      id: 'ex03-dataflow',
      startLine: 13, startCol: 2, endLine: 33, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'OPC-UA Source \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>A single OPC-UA source polls node values and publishes them to a console sink:</p>' +
          '<ul>' +
          '<li><strong>OPC-UA Source</strong> \u2014 Connects to <code>localhost:49320</code> with username/password auth. Reads nodes from namespace 2 every 2000ms.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 Each node value is published as a <code>MessageBoxMessage</code> to the 4096-slot Disruptor ring buffer.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Writes received values to stdout with sink transform applied.</li>' +
          '</ul>' +
          '<p>The <code>item_script</code> runs for every item before individual scripts. It calls <code>return result.Value</code> to unwrap the OPC DataValue object, so downstream scripts and sinks receive the clean value rather than the full OPC envelope.</p>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' }
        ]
      }
    },
    {
      id: 'ex03-config',
      startLine: 35, startCol: 2, endLine: 108, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File OPC-UA Configuration',
        body:
          '<p>Three YAML files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>opcUaSource1.yaml</strong> \u2014 OPC-UA source with server address, credentials, namespace/address per item, and <code>item_script</code> for DataValue unwrapping</li>' +
          '<li><strong>consoleSink1.yaml</strong> \u2014 Console sink with <code>use_sink_transform: true</code></li>' +
          '<li><strong>main.yaml</strong> \u2014 App settings and anchor references</li>' +
          '</ul>' +
          '<p><strong>Key OPC-UA properties:</strong></p>' +
          '<ul>' +
          '<li><code>anonymous: false</code> \u2014 Forces username/password authentication</li>' +
          '<li><code>namespace: 2</code> \u2014 OPC-UA namespace index for vendor nodes</li>' +
          '<li><code>item_script</code> \u2014 Shared script running for all items; individual <code>script</code> fields run after it</li>' +
          '</ul>',
        yaml:
          '# OPC-UA item addressing pattern:\n' +
          'items:\n' +
          '  - name: DateTime\n' +
          '    namespace: !!int 2        # Namespace index\n' +
          '    address: _System._DateTime # Node string ID\n' +
          '    rbe: !!bool true          # Per-item RBE',
        related: [
          { page: 'CON04', label: 'CON04 \u2014 YAML Basics' },
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex03-keyconcepts',
      startLine: 110, startCol: 2, endLine: 135, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>OPC-UA Connector</strong> \u2014 The <code>OpcUA</code> connector is a polling client. It connects to any OPC-UA server, authenticates (anonymous or username/password), and reads nodes at <code>scan_interval</code>. Each item specifies <code>namespace</code> and <code>address</code> to identify the target node.</p>' +
          '<p><strong>item_script vs script</strong> \u2014 <code>item_script</code> runs for every item in the source \u2014 ideal for common transformations like unwrapping OPC DataValue objects. Each item can additionally define its own <code>script</code> that runs after <code>item_script</code>. Setting <code>script: ~</code> means "use only item_script."</p>' +
          '<p><strong>Namespace Addressing</strong> \u2014 OPC-UA organizes nodes into namespaces. Namespace 0 is the OPC Foundation standard namespace. Higher indices (commonly 2+) are vendor-specific. The <code>namespace</code> and <code>address</code> fields together form the full <code>NodeId</code>.</p>' +
          '<p><strong>Disabled Items as Tag Library</strong> \u2014 Setting <code>enabled: false</code> pre-configures items without activating them. This is a common pattern for building a reusable tag library \u2014 toggle items on/off without re-entering addresses.</p>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua & Python)' },
          { page: 'CON20', label: 'CON20 \u2014 Report By Exception' },
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' }
        ]
      }
    }
  ]
};
