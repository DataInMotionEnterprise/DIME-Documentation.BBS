/**
 * EX02 — Horizon & Zenith Minimum
 * Multi-file YAML with anchors. 5-axis CNC simulator + WebServer + WebSocket.
 */
DIME_PAGES['EX02'] = {
  id: 'EX02',
  title: 'EX02 \u2014 Horizon & Zenith Minimum',
  file: 'content/EX02-horizon-zenith-minimum.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex02-overview',
      startLine: 5, startCol: 2, endLine: 10, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Horizon & Zenith Minimum \u2014 Overview',
        body:
          '<p>This is the minimum configuration for the DIME Horizon (edge gateway) and Zenith (cloud) products. It demonstrates a realistic industrial pattern:</p>' +
          '<ul>' +
          '<li><strong>5-axis CNC simulation</strong> \u2014 A Lua state machine generates smooth toolpath motion through face milling and chamfer operations</li>' +
          '<li><strong>Multi-file YAML</strong> \u2014 Each connector is defined in its own file with YAML anchors, composed together in main.yaml</li>' +
          '<li><strong>3 output channels</strong> \u2014 HTTP for polling, WebSocket for real-time streaming, WebServer for hosting a browser dashboard</li>' +
          '</ul>' +
          '<p>The simulator runs at 50Hz to produce smooth animation data. This is how production DIME deployments look \u2014 modular files, multiple sinks, and Lua logic driving the data pipeline.</p>',
        related: [
          { page: '25', label: '25 \u2014 Horizon Gateway' },
          { page: '26', label: '26 \u2014 Zenith Cloud' },
          { page: 'EX01', label: 'EX01 \u2014 Basic Counter (simpler starting point)' }
        ]
      }
    },
    {
      id: 'ex02-dataflow',
      startLine: 14, startCol: 2, endLine: 36, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'CNC Simulator \u2192 3 Output Channels',
        body:
          '<p>The machine simulator is a Lua state machine that cycles through CNC operations:</p>' +
          '<ol>' +
          '<li><strong>RAPID_TO_START</strong> \u2014 Fast move to workpiece corner</li>' +
          '<li><strong>PLUNGE</strong> \u2014 Lower tool to cutting depth</li>' +
          '<li><strong>FACE_MILLING</strong> \u2014 Zigzag passes across the workpiece surface</li>' +
          '<li><strong>RETRACT</strong> \u2014 Lift tool to safe height</li>' +
          '<li><strong>CHAMFER</strong> \u2014 45\u00b0 cuts along all 4 edges using A/B rotary axes</li>' +
          '<li><strong>CYCLE_COMPLETE</strong> \u2014 Return home, restart</li>' +
          '</ol>' +
          '<p>Each scan produces 5 items (X, Y, Z, A, B) at 50Hz. The ring buffer distributes these to all 3 sinks simultaneously.</p>' +
          '<p>The <strong>WebServer</strong> sink is unique \u2014 it serves static HTML/JS files but excludes all data items. The browser JS connects to the WebSocket sink to get real-time position updates.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '09', label: '09 \u2014 Scripting (Lua state machines)' }
        ]
      }
    },
    {
      id: 'ex02-multifile',
      startLine: 40, startCol: 2, endLine: 60, endCol: 85,
      label: 'Multi-File YAML with Anchors',
      panel: {
        title: 'Multi-File Configuration Pattern',
        body:
          '<p>DIME automatically loads and merges all YAML files in the config directory. The <code>main.yaml</code> file is loaded last, allowing it to reference anchors defined in other files.</p>' +
          '<p><strong>How it works:</strong></p>' +
          '<ol>' +
          '<li>Each connector file defines a top-level key with an anchor: <code>machineSimulator: &amp;machineSimulator</code></li>' +
          '<li><code>main.yaml</code> uses aliases to reference them: <code>- *machineSimulator</code></li>' +
          '<li>DIME merges all files into one config tree before processing</li>' +
          '</ol>' +
          '<p><strong>Benefits:</strong></p>' +
          '<ul>' +
          '<li>Each connector is independently editable</li>' +
          '<li>Anchors can be reused in multiple configs</li>' +
          '<li>Clean separation of concerns</li>' +
          '<li>Easy to enable/disable connectors by adding/removing aliases</li>' +
          '</ul>',
        yaml:
          '# machineSimulator.yaml\n' +
          'machineSimulator: &machineSimulator\n' +
          '  name: machineSimulator\n' +
          '  connector: Script\n' +
          '  ...\n' +
          '\n' +
          '# main.yaml (loaded last)\n' +
          'sources:\n' +
          '  - *machineSimulator    # references anchor',
        related: [
          { page: '21', label: '21 \u2014 Multi-File Configs' },
          { page: '04', label: '04 \u2014 YAML Basics (anchors & aliases)' }
        ]
      }
    },
    {
      id: 'ex02-filters',
      startLine: 96, startCol: 2, endLine: 130, endCol: 85,
      label: 'Include/Exclude Filters',
      panel: {
        title: 'Sink Filtering \u2014 Include & Exclude',
        body:
          '<p>Each sink can filter which items it receives from the ring buffer:</p>' +
          '<ul>' +
          '<li><strong>include_filter</strong> \u2014 Whitelist: only matching item paths are delivered. The WebSocket sink uses this to send only the 5 position items.</li>' +
          '<li><strong>exclude_filter</strong> \u2014 Blacklist: matching items are blocked. The WebServer sink uses <code>".*"</code> to block everything (it only serves static files).</li>' +
          '</ul>' +
          '<p>Filter patterns are regex-matched against the full item path: <code>sourceName/itemName</code>. For example, <code>machineSimulator/XPositionCurrent</code>.</p>' +
          '<p>Without filters, every sink receives every item from every source. Filters let you create targeted data pipelines from a shared ring buffer.</p>',
        related: [
          { page: '08', label: '08 \u2014 Message Paths & Filtering' },
          { page: '07', label: '07 \u2014 Sink Connectors' }
        ]
      }
    },
    {
      id: 'ex02-keyconcepts',
      startLine: 147, startCol: 2, endLine: 170, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Cache API (set/cache)</strong> \u2014 The Lua <code>set("./key", value)</code> function stores state in the connector\u2019s cache. The <code>cache("./key")</code> function retrieves it. The <code>./</code> prefix scopes values to the current source. This is how the state machine persists position and operation state between 50Hz scan cycles.</p>' +
          '<p><strong>enter_script vs init_script</strong> \u2014 <code>init_script</code> runs once at connector startup. <code>enter_script</code> runs before every scan cycle\u2019s item evaluation. The CNC state machine logic lives in <code>enter_script</code> so it executes before the individual axis items read cached positions.</p>' +
          '<p><strong>Sink Transform</strong> \u2014 The source defines <code>sink.transform.template: Message.Data</code>, which tells sinks to extract only the data value (not the full MessageBoxMessage envelope). Combined with <code>use_sink_transform: false</code> on sinks, this creates a clean JSON payload for web clients.</p>' +
          '<p><strong>WebServer Connector</strong> \u2014 Unlike other sinks, WebServer serves static files from <code>web_root</code>. It\u2019s a built-in HTTP file server. The <code>exclude_filter: ".*"</code> prevents it from processing ring buffer messages. The browser dashboard it serves connects back to the WebSocket sink for live data.</p>',
        related: [
          { page: '10', label: '10 \u2014 Cache API' },
          { page: '09', label: '09 \u2014 Scripting (enter_script)' },
          { page: '11', label: '11 \u2014 Templates & Formatting' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    }
  ]
};
