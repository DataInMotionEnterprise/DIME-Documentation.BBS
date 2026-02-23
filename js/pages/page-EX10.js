/**
 * EX10 — OPC-DA Legacy
 * Classic OPC-DA (COM-based) for legacy Kepware/Wonderware/RSLinx systems.
 */

DIME_PAGES['EX10'] = {
  id: 'EX10',
  title: 'EX10 \u2014 OPC-DA Legacy',
  file: 'content/EX10-opcda-legacy.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex10-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'OPC-DA Legacy \u2014 Overview',
        body:
          '<p>Classic OPC-DA connectivity for legacy industrial systems still running COM/DCOM-based OPC servers:</p>' +
          '<ul>' +
          '<li><strong>OPC-DA source</strong> \u2014 Connects to a Kepware KEPServerEX v6 OPC-DA server via COM ProgID</li>' +
          '<li><strong>Single tag</strong> \u2014 Reads the <code>_System._DateTime</code> built-in Kepware tag</li>' +
          '<li><strong>Console sink</strong> \u2014 Displays tag values on stdout</li>' +
          '</ul>' +
          '<p>This is the minimal OPC-DA configuration. OPC-DA (Data Access) is the original 1990s OPC standard built on Windows COM/DCOM. It is Windows-only but still widely deployed in brownfield factories running Kepware, Wonderware, RSLinx, or FactoryTalk.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX08', label: 'EX08 \u2014 OPC-UA Server Sink (modern alternative)' },
          { page: 'REF24', label: 'REF24 \u2014 OPC-DA' }
        ]
      }
    },
    {
      id: 'ex10-dataflow',
      startLine: 13, startCol: 2, endLine: 32, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'OPC-DA Server \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>The simplest possible OPC-DA data flow:</p>' +
          '<ul>' +
          '<li><strong>OPC-DA Source</strong> \u2014 Connects to the Kepware server identified by its COM ProgID (<code>Kepware.KEPServerEX.V6</code>). Reads the <code>_System._DateTime</code> tag every 1000ms.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 Each tag read becomes a <code>MessageBoxMessage</code> in the 4096-slot buffer. RBE (Report By Exception) is enabled at both source and item level.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Prints updated values to stdout with <code>use_sink_transform: true</code> to apply the source\u2019s transform template.</li>' +
          '</ul>' +
          '<p>Since OPC-DA uses COM/DCOM, the OPC server must be running on the same Windows machine or accessible via DCOM network configuration.</p>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON20', label: 'CON20 \u2014 Report By Exception' }
        ]
      }
    },
    {
      id: 'ex10-config',
      startLine: 34, startCol: 2, endLine: 82, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File YAML \u2014 3 Files',
        body:
          '<p>Three files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>main.yaml</strong> \u2014 References the OPC-DA source and console sink anchors</li>' +
          '<li><strong>opcDaSource1.yaml</strong> \u2014 The OPC-DA source with COM ProgID address and tag items</li>' +
          '<li><strong>consoleSink1.yaml</strong> \u2014 Console sink with sink transform enabled</li>' +
          '</ul>' +
          '<p><strong>Key OPC-DA properties:</strong></p>' +
          '<ul>' +
          '<li><code>connector: OpcDA</code> \u2014 Selects the classic OPC-DA connector (not OPC-UA)</li>' +
          '<li><code>address: Kepware.KEPServerEX.V6</code> \u2014 COM ProgID of the OPC server, not a URL</li>' +
          '<li><code>init_script: ~</code> / <code>script: ~</code> \u2014 YAML null (<code>~</code>) means no script is defined</li>' +
          '<li>Per-item <code>rbe: !!bool true</code> \u2014 Overrides the source-level RBE setting for individual tags</li>' +
          '</ul>',
        related: [
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' },
          { page: 'CON04', label: 'CON04 \u2014 YAML Basics' }
        ]
      }
    },
    {
      id: 'ex10-keyconcepts',
      startLine: 83, startCol: 2, endLine: 106, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>OPC-DA (Data Access)</strong> \u2014 The original OPC standard from the 1990s, built on Windows COM/DCOM. Still widely deployed in legacy installations running Kepware, Wonderware InTouch, RSLinx, and FactoryTalk. Requires Windows and local COM or DCOM network access.</p>' +
          '<p><strong>COM ProgID Addressing</strong> \u2014 Unlike OPC-UA (which uses URLs), OPC-DA identifies servers by their COM ProgID string. Common examples: <code>Kepware.KEPServerEX.V6</code>, <code>RSLinx.OPCServer</code>, <code>InTouch.OPC</code>. Use OPC-DA browser tools to discover available servers on a machine.</p>' +
          '<p><strong>Tag Path Notation</strong> \u2014 Item addresses follow the OPC-DA server\u2019s tag hierarchy with dot separators. The <code>_System</code> group contains Kepware built-in tags. User tags typically follow <code>channel.device.group.tag</code> naming.</p>' +
          '<p><strong>Per-Item RBE</strong> \u2014 Both source-level and item-level <code>rbe</code> are set to true. Item-level RBE overrides the source default, letting you mix polling and change-only reporting within the same source.</p>' +
          '<p><strong>OPC-DA vs OPC-UA</strong> \u2014 OPC-DA is Windows-only (COM). OPC-UA (see EX08) is platform-independent. New deployments should use OPC-UA. Use OPC-DA only for brownfield legacy systems.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'CON20', label: 'CON20 \u2014 Report By Exception' },
          { page: 'EX08', label: 'EX08 \u2014 OPC-UA Server Sink' }
        ]
      }
    }
  ]
};
