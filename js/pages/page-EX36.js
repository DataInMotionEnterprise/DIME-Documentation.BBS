/**
 * EX36 — Configuration Tutorial
 * Progressive walkthrough: single-file PLC to multi-source production pipeline.
 */
DIME_PAGES['EX36'] = {
  id: 'EX36',
  title: 'EX36 \u2014 Configuration Tutorial',
  file: 'content/EX36-configuration-tutorial.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex36-overview',
      startLine: 5, startCol: 2, endLine: 25, endCol: 85,
      label: 'What This Tutorial Covers',
      panel: {
        title: 'Configuration Tutorial \u2014 Overview',
        body:
          '<p>A progressive, hands-on walkthrough of DIME configuration covering everything from a basic single-file PLC read to a full multi-source, multi-sink production pipeline.</p>' +
          '<p><strong>What you\u2019ll learn:</strong></p>' +
          '<ol>' +
          '<li>Single-file and multi-file configuration with YAML anchors</li>' +
          '<li>Message paths and $SYSTEM telemetry</li>' +
          '<li>Include/exclude filtering for selective routing</li>' +
          '<li>Item scripts for data transformation (Lua)</li>' +
          '<li>Sink transforms (Scriban/Liquid templates)</li>' +
          '<li>Multiple sinks: Console, MQTT, SparkplugB/Ignition</li>' +
          '<li>Multiple sources: PLC + MQTT sensors</li>' +
          '<li>Itemized vs non-itemized reads</li>' +
          '<li>Advanced scripting: emit(), cache(), init_script, arrays, .NET interop</li>' +
          '<li>Complete real-world OEE pipeline example</li>' +
          '</ol>' +
          '<p>Each section builds on the previous one, adding complexity incrementally.</p>',
        related: [
          { page: 'CON04', label: 'CON04 \u2014 YAML Configuration' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting' },
          { page: 'EX01', label: 'EX01 \u2014 Basic Counter (simplest example)' }
        ]
      }
    },
    {
      id: 'ex36-basics',
      startLine: 27, startCol: 2, endLine: 70, endCol: 85,
      label: 'Section 1: Configuration Basics',
      panel: {
        title: 'Single-File, Multi-File, and YAML Anchors',
        body:
          '<p><strong>Single-file</strong> \u2014 Put everything in one <code>main.yaml</code>. Simplest approach, good for small configs.</p>' +
          '<p><strong>Multi-file</strong> \u2014 Split connectors into separate YAML files. All files in the config directory are loaded and merged, with <code>main.yaml</code> loaded last (can override). Benefits: modularity, reusability, team collaboration, version control.</p>' +
          '<p><strong>YAML Anchors</strong> \u2014 Define connectors with <code>&amp;anchor</code> and reference them with <code>*anchor</code>:</p>' +
          '<pre>rockwell: &amp;rockwell\n  name: rockwell\n  connector: EthernetIP\n  # ...\n\nsources:\n  - *rockwell</pre>' +
          '<p>This pattern lets you define a connector once, then wire it into the <code>sources</code> or <code>sinks</code> array by reference.</p>',
        related: [
          { page: 'CON04', label: 'CON04 \u2014 YAML Configuration' },
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex36-first-config',
      startLine: 72, startCol: 2, endLine: 146, endCol: 85,
      label: 'Section 2: Your First Configuration',
      panel: {
        title: 'Rockwell PLC \u2192 Console',
        body:
          '<p>The simplest real-world config: read two registers from a Rockwell (Allen-Bradley) PLC via EtherNet/IP and print to console.</p>' +
          '<p><strong>Source settings:</strong></p>' +
          '<ul>' +
          '<li><code>connector: EthernetIP</code> \u2014 Allen-Bradley protocol</li>' +
          '<li><code>type: !!int 5</code> \u2014 Micro800 PLC type</li>' +
          '<li><code>scan_interval: !!int 1500</code> \u2014 Poll every 1.5 seconds</li>' +
          '<li><code>path: 1,0</code> \u2014 Backplane slot 0</li>' +
          '</ul>' +
          '<p><strong>Items:</strong></p>' +
          '<ul>' +
          '<li><code>Execution</code> \u2014 Boolean tag at <code>B3:0/3</code></li>' +
          '<li><code>GoodPartCount</code> \u2014 Integer tag at <code>N7:1</code></li>' +
          '</ul>' +
          '<p>Both single-file and multi-file approaches produce identical results. The multi-file version splits console, rockwell, and app settings into separate files connected by YAML anchors.</p>',
        yaml:
          'console: &console\n' +
          '  name: console\n' +
          '  connector: Console\n\n' +
          'rockwell: &rockwell\n' +
          '  name: rockwell\n' +
          '  connector: EthernetIP\n' +
          '  type: !!int 5\n' +
          '  address: 192.168.111.20\n' +
          '  items:\n' +
          '    - name: Execution\n' +
          '      type: bool\n' +
          '      address: B3:0/3\n' +
          '    - name: GoodPartCount\n' +
          '      type: int\n' +
          '      address: N7:1\n\n' +
          'sinks:\n  - *console\nsources:\n  - *rockwell',
        related: [
          { page: 'REF07', label: 'REF07 \u2014 Ethernet/IP' },
          { page: 'REF05', label: 'REF05 \u2014 Console Sink' },
          { page: 'EX06', label: 'EX06 \u2014 EtherNet/IP Example' }
        ]
      }
    },
    {
      id: 'ex36-paths',
      startLine: 148, startCol: 2, endLine: 170, endCol: 85,
      label: 'Section 3: Message Paths',
      panel: {
        title: 'Message Paths & $SYSTEM Telemetry',
        body:
          '<p>Every message has a <strong>path</strong>: <code>connector_name/item_name</code></p>' +
          '<p>Examples: <code>rockwell/Execution</code>, <code>rockwell/GoodPartCount</code></p>' +
          '<p><strong>$SYSTEM messages</strong> are generated automatically for every source connector:</p>' +
          '<ul>' +
          '<li><code>$SYSTEM/ExecutionDuration</code> \u2014 How long the scan took (ms)</li>' +
          '<li><code>$SYSTEM/IsConnected</code> \u2014 Connection status (bool)</li>' +
          '<li><code>$SYSTEM/IsFaulted</code> \u2014 Fault status (bool)</li>' +
          '<li><code>$SYSTEM/Fault</code> \u2014 Fault message (string, null if none)</li>' +
          '<li><code>$SYSTEM/IsAvailable</code> \u2014 Connected AND not faulted</li>' +
          '</ul>' +
          '<p>Use $SYSTEM messages for monitoring, alerting, debugging, and calculating equipment availability. They flow through the ring buffer like any other message and can be filtered, routed, and stored.</p>',
        related: [
          { page: 'CON08', label: 'CON08 \u2014 Filtering & Routing' },
          { page: 'CON18', label: 'CON18 \u2014 Health & Faults' }
        ]
      }
    },
    {
      id: 'ex36-filtering',
      startLine: 172, startCol: 2, endLine: 217, endCol: 85,
      label: 'Section 4: Filtering Messages',
      panel: {
        title: 'Include & Exclude Filters',
        body:
          '<p>Sinks use regex filters against message paths to control what they receive.</p>' +
          '<p><strong>exclude_filter</strong> \u2014 Block matching paths, allow everything else (most common):</p>' +
          '<pre>exclude_filter:\n  - rockwell/\\$SYSTEM    # Hide system messages\n  - ^debug/              # Hide debug data</pre>' +
          '<p><strong>include_filter</strong> \u2014 Allow only matching paths, block everything else:</p>' +
          '<pre>include_filter:\n  - ^rockwell/           # Only rockwell data\n  - ^sensors/            # Only sensor data</pre>' +
          '<p><strong>Rules:</strong></p>' +
          '<ul>' +
          '<li>Use <em>either</em> include OR exclude, not both</li>' +
          '<li>If include_filter is present, it takes precedence</li>' +
          '<li>The <code>$</code> in <code>$SYSTEM</code> must be escaped as <code>\\$</code> in YAML</li>' +
          '<li>Patterns are standard regular expressions</li>' +
          '</ul>' +
          '<p><strong>Common patterns:</strong> <code>/\\$SYSTEM</code> (hide telemetry), <code>^production/</code> (production only), <code>/\\$SYSTEM/IsConnected$</code> (monitoring only).</p>',
        related: [
          { page: 'CON08', label: 'CON08 \u2014 Filtering & Routing' }
        ]
      }
    },
    {
      id: 'ex36-item-scripts',
      startLine: 219, startCol: 2, endLine: 258, endCol: 85,
      label: 'Section 5: Item Scripts',
      panel: {
        title: 'Data Transformation with Lua Scripts',
        body:
          '<p>Item scripts transform data <strong>before</strong> publishing to the ring buffer. The raw value is available as <code>result</code>.</p>' +
          '<p><strong>Example:</strong> Convert boolean to human-readable strings:</p>' +
          '<pre>script: |\n  local states = { [0]=\'Idle\', [1]=\'Running\' };\n  return states[result and 1 or 0];</pre>' +
          '<p>Output changes from <code>true/false</code> to <code>"Running"/"Idle"</code>.</p>' +
          '<p><strong>Script context variables:</strong></p>' +
          '<ul>' +
          '<li><code>result</code> \u2014 Raw value from device (bool, int, string, etc.)</li>' +
          '<li><code>this</code> \u2014 Current item reference (<code>this.Name</code>, <code>this.Address</code>, <code>this.Key</code>)</li>' +
          '<li><code>dime</code> \u2014 DIME API (<code>dime.cache()</code>, <code>dime.emit()</code>)</li>' +
          '</ul>' +
          '<p><strong>Return values:</strong> Return a value to publish it. Return <code>nil</code> to suppress (nothing sent to sinks). Scripts affect <em>all</em> sinks since they run before the ring buffer.</p>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting Deep Dive' },
          { page: 'EX25', label: 'EX25 \u2014 Lua Data Transforms' }
        ]
      }
    },
    {
      id: 'ex36-sink-transforms',
      startLine: 260, startCol: 2, endLine: 325, endCol: 85,
      label: 'Section 6: Sink Transformations',
      panel: {
        title: 'Reshaping Messages for Destinations',
        body:
          '<p>Sink transforms reshape messages <strong>after</strong> the ring buffer, before writing to external systems. Unlike item scripts, they only affect <em>one</em> sink.</p>' +
          '<p>By default, sinks receive the full <code>MessageBoxMessage</code> object (Path, Data, Timestamp). Often you want just the atomic value.</p>' +
          '<p><strong>Configuration:</strong></p>' +
          '<pre>sink_meta:\n  transform:\n    type: script\n    template: Message.Data;    # Extract just the value</pre>' +
          '<p>The sink must opt in with <code>use_sink_transform: !!bool true</code>.</p>' +
          '<p><strong>Three transform types:</strong></p>' +
          '<ul>' +
          '<li><code>script</code> \u2014 Scriban scripting (most flexible)</li>' +
          '<li><code>scriban</code> \u2014 Scriban templates (best for structured output like JSON)</li>' +
          '<li><code>liquid</code> \u2014 Liquid/Django-style templates</li>' +
          '</ul>' +
          '<p><strong>Template variables:</strong> <code>Message</code> (object), <code>Message.Path</code>, <code>Message.Data</code>, <code>Message.Timestamp</code>, <code>Connector</code>, <code>Configuration</code>.</p>' +
          '<p><strong>Example \u2014 InfluxDB line protocol:</strong></p>' +
          '<pre>type: scriban\ntemplate: |\n  temperature,sensor={{ Message.Path }} value={{ Message.Data }} {{ Message.Timestamp }}000000</pre>',
        related: [
          { page: 'CON11', label: 'CON11 \u2014 Templates & Output Formatting' }
        ]
      }
    },
    {
      id: 'ex36-multi-sinks',
      startLine: 327, startCol: 2, endLine: 395, endCol: 85,
      label: 'Section 7: Multiple Sinks',
      panel: {
        title: 'Console + MQTT + Ignition (SparkplugB)',
        body:
          '<p>DIME distributes data to multiple destinations simultaneously from the same ring buffer. Each sink applies its own filters and transforms independently.</p>' +
          '<p><strong>MQTT Sink:</strong></p>' +
          '<ul>' +
          '<li><code>base_topic: DimeTutorial</code> \u2014 All topics prefixed</li>' +
          '<li><code>qos: 0</code> \u2014 At-most-once delivery</li>' +
          '<li><code>retain_publish: true</code> \u2014 Retain for late subscribers</li>' +
          '<li>Topics: <code>DimeTutorial/rockwell/Execution</code>, etc.</li>' +
          '</ul>' +
          '<p><strong>Ignition (SparkplugB) Sink:</strong></p>' +
          '<ul>' +
          '<li>SparkplugB hierarchy: <code>group_id/node_id/device_id</code></li>' +
          '<li><code>include_filter: ^rockwell/</code> \u2014 Only PLC data to Ignition</li>' +
          '<li><code>birth_delay</code> and <code>reconnect_interval</code> for SCADA handshake</li>' +
          '</ul>' +
          '<p>All three sinks (Console, MQTT, Ignition) process the same data from the ring buffer in parallel, with no sink blocking another.</p>',
        related: [
          { page: 'CON13', label: 'CON13 \u2014 MQTT Integration' },
          { page: 'REF32', label: 'REF32 \u2014 SparkplugB' },
          { page: 'REF18', label: 'REF18 \u2014 MQTT' },
          { page: 'EX13', label: 'EX13 \u2014 SparkplugB Example' }
        ]
      }
    },
    {
      id: 'ex36-multi-sources',
      startLine: 397, startCol: 2, endLine: 434, endCol: 85,
      label: 'Section 8: Multiple Sources',
      panel: {
        title: 'Adding MQTT as a Second Source',
        body:
          '<p>Multiple sources feed the same ring buffer. Here we add MQTT alongside the PLC source to receive IoT sensor data from SHARC devices.</p>' +
          '<p><strong>MQTT Source settings:</strong></p>' +
          '<ul>' +
          '<li><code>itemized_read: false</code> \u2014 Process ALL received messages</li>' +
          '<li><code>report_by_exception: true</code> \u2014 Only publish on change</li>' +
          '<li><code>address: sharc/+/evt/#</code> \u2014 Wildcard subscription</li>' +
          '</ul>' +
          '<p><strong>MQTT Wildcards:</strong></p>' +
          '<ul>' +
          '<li><code>+</code> \u2014 Single-level wildcard (any value at that level)</li>' +
          '<li><code>#</code> \u2014 Multi-level wildcard (any number of trailing levels)</li>' +
          '</ul>' +
          '<p>Data flow: PLC (rockwell) + MQTT (sharcs) \u2192 Ring Buffer \u2192 Console, MQTT, Ignition</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'REF18', label: 'REF18 \u2014 MQTT Source & Sink' }
        ]
      }
    },
    {
      id: 'ex36-itemized',
      startLine: 436, startCol: 2, endLine: 479, endCol: 85,
      label: 'Section 9: Itemized vs Non-Itemized',
      panel: {
        title: 'Controlling Message Processing',
        body:
          '<p>For asynchronous sources (MQTT, UDP, HTTP webhooks), <code>itemized_read</code> controls processing behavior:</p>' +
          '<p><strong>Non-itemized (<code>false</code>)</strong> \u2014 Process <em>every</em> received message matching the subscription. Use for simple pass-through of all matching data.</p>' +
          '<p><strong>Itemized (<code>true</code>)</strong> \u2014 Only process messages that <em>exactly match</em> an item\u2019s address. Use for fine-grained control when you subscribe broadly but only want specific topics.</p>' +
          '<p><strong>Example:</strong> Subscribe to <code>sharc/+/evt/#</code> but only process <code>sharc/08d1f953ffe4/evt/io/s1</code>:</p>' +
          '<pre>itemized_read: !!bool true\nitems:\n  - name: subscribe1\n    address: sharc/+/evt/#        # Broad subscription\n  - name: ffe4Sensor\n    address: sharc/.../evt/io/s1  # Only this gets processed</pre>' +
          '<p><strong>When to use:</strong> <code>false</code> for receive-all/wildcard use cases, <code>true</code> for filtering specific topics from broad subscriptions.</p>',
        related: [
          { page: 'REFIN', label: 'REFIN \u2014 Source Common Properties' },
          { page: 'REF18', label: 'REF18 \u2014 MQTT' }
        ]
      }
    },
    {
      id: 'ex36-advanced-scripting',
      startLine: 481, startCol: 2, endLine: 607, endCol: 85,
      label: 'Section 10: Advanced Scripting',
      panel: {
        title: 'Lifecycle Hooks, emit(), cache(), Arrays, .NET',
        body:
          '<p><strong>Script lifecycle hooks</strong> run at different stages:</p>' +
          '<ul>' +
          '<li><code>init_script</code> \u2014 Once on startup (load libraries, init variables)</li>' +
          '<li><code>deinit_script</code> \u2014 Once on shutdown (cleanup)</li>' +
          '<li><code>enter_script</code> \u2014 Before each scan cycle</li>' +
          '<li><code>exit_script</code> \u2014 After each scan cycle</li>' +
          '<li><code>item_script</code> \u2014 Runs for <em>every</em> item (common transformation)</li>' +
          '<li><code>script</code> (on item) \u2014 Item-specific logic</li>' +
          '</ul>' +
          '<p><strong>emit(path, value)</strong> \u2014 Create new messages from within scripts. One input message can generate multiple output messages. Supports relative (<code>./name</code>), hierarchical (<code>./a/b/c</code>), and absolute paths. Return <code>nil</code> to suppress the original.</p>' +
          '<p><strong>cache(path, default) / set(key, value)</strong> \u2014 Store and retrieve data across scan cycles. Use for cross-connector data access, aggregation, state machines, and derived metrics.</p>' +
          '<p><strong>Arrays with Moses library:</strong> <code>moses.median()</code>, <code>moses.mean()</code>, <code>moses.max()</code>, <code>moses.min()</code>, <code>moses.last(array, n)</code> for rolling calculations.</p>' +
          '<p><strong>.NET interop:</strong> <code>luanet.load_assembly("System")</code> and <code>luanet.import_type()</code> give access to the full .NET Framework from Lua scripts.</p>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting Deep Dive' },
          { page: 'CON10', label: 'CON10 \u2014 Cache API' },
          { page: 'EX27', label: 'EX27 \u2014 Sliding Window Analytics' },
          { page: 'EX25', label: 'EX25 \u2014 Lua Data Transforms' }
        ]
      }
    },
    {
      id: 'ex36-complete-example',
      startLine: 609, startCol: 2, endLine: 761, endCol: 85,
      label: 'Section 11: Complete Real-World Example',
      panel: {
        title: '3 Sources \u2192 OEE Metrics \u2192 3 Sinks',
        body:
          '<p>A production-ready pipeline combining everything from the tutorial:</p>' +
          '<p><strong>Sources:</strong></p>' +
          '<ul>' +
          '<li><strong>eipSource1</strong> \u2014 Rockwell PLC (Execution, PartCount, RejectCount)</li>' +
          '<li><strong>mqttSource1</strong> \u2014 MQTT temperature sensors with JSON parsing</li>' +
          '<li><strong>scriptSource1</strong> \u2014 Derived metrics via <code>cache()</code>: OEE/Quality, OEE/Availability, Temperature/Median, Status/Overall</li>' +
          '</ul>' +
          '<p><strong>Derived metrics logic:</strong></p>' +
          '<ul>' +
          '<li><strong>OEE/Quality</strong> \u2014 <code>(parts - rejects) / parts * 100</code></li>' +
          '<li><strong>OEE/Availability</strong> \u2014 100 if connected, 0 if not (from $SYSTEM cache)</li>' +
          '<li><strong>Temperature/Median</strong> \u2014 Rolling median of last 20 sensor readings using Moses library</li>' +
          '<li><strong>Status/Overall</strong> \u2014 "Running", "Idle", or "Disconnected" from cached PLC state</li>' +
          '</ul>' +
          '<p><strong>Sinks:</strong> Console (debug, exclude $SYSTEM), MQTT (cloud, QoS 1), Ignition/SparkplugB (SCADA, include_filter for PLC + OEE data only).</p>',
        yaml:
          '# scriptSource1 — Derived OEE metrics\n' +
          'items:\n' +
          '  - name: OEE/Quality\n' +
          '    script: |\n' +
          '      local parts = cache(\'eipSource1/PartCount\', 0);\n' +
          '      local rejects = cache(\'eipSource1/RejectCount\', 0);\n' +
          '      return parts > 0 and ((parts-rejects)/parts)*100 or 0;\n' +
          '  - name: OEE/Availability\n' +
          '    script: |\n' +
          '      local connected = cache(\'eipSource1/$SYSTEM/IsConnected\', false);\n' +
          '      return connected and 100 or 0;',
        related: [
          { page: 'CON10', label: 'CON10 \u2014 Cache API' },
          { page: 'CON12', label: 'CON12 \u2014 PLC to Dashboard' },
          { page: 'EX29', label: 'EX29 \u2014 Multi-Machine Shop Floor' },
          { page: 'EX32', label: 'EX32 \u2014 MQTT Motor Aggregation' }
        ]
      }
    },
    {
      id: 'ex36-best-practices',
      startLine: 763, startCol: 2, endLine: 810, endCol: 85,
      label: 'Section 12: Best Practices',
      panel: {
        title: 'Organization, Performance, Security, Testing',
        body:
          '<p><strong>Configuration:</strong> Split by connector type, use descriptive anchors (<code>&amp;rockwell_plc</code> not <code>&amp;src1</code>), version control configs, never commit credentials.</p>' +
          '<p><strong>Performance:</strong></p>' +
          '<ul>' +
          '<li>Fast sources (PLCs): 100\u20131000ms scan interval</li>' +
          '<li>Slow sources (DBs, APIs): 5000\u201360000ms</li>' +
          '<li>Ring buffer: 4096 default, 8192/16384 for high throughput (must be power of 2)</li>' +
          '</ul>' +
          '<p><strong>Scripting:</strong> Load libraries in <code>init_script</code> (not per-item). Return <code>nil</code> to suppress. Handle nil defensively: <code>if value == nil then return nil end</code>. Never use blocking operations.</p>' +
          '<p><strong>Security:</strong> Use TLS for MQTT (port 8883), firewall admin ports (9999/9998), authenticate all protocols, store secrets in git-ignored files.</p>' +
          '<p><strong>Testing strategy:</strong></p>' +
          '<ol>' +
          '<li>Start with console sink only</li>' +
          '<li>Add sinks one at a time</li>' +
          '<li>Test scripts in isolation using Script source</li>' +
          '<li>Monitor at <code>http://localhost:9999/</code></li>' +
          '</ol>' +
          '<p><strong>Common issues:</strong> Messages not appearing (check enabled, filters, $SYSTEM), script returns nil (check cache path), high CPU (increase scan_interval), message loss (increase ring_buffer).</p>',
        related: [
          { page: 'CON29', label: 'CON29 \u2014 Performance Tuning' },
          { page: 'CON30', label: 'CON30 \u2014 Troubleshooting' },
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' }
        ]
      }
    }
  ]
};
