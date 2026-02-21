/**
 * EX25 — Lua Data Transforms
 * Minimal multi-file config, Lua math.random(), system message filtering.
 */
DIME_PAGES['EX25'] = {
  id: 'EX25',
  title: 'EX25 \u2014 Lua Data Transforms',
  file: 'content/EX25-lua-data-transforms.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex25-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Lua Data Transforms \u2014 Overview',
        body:
          '<p>The simplest multi-file DIME configuration. This is the starting template for building modular configs:</p>' +
          '<ul>' +
          '<li><strong>Script source</strong> \u2014 Generates two random numbers using Lua <code>math.random()</code></li>' +
          '<li><strong>Console sink</strong> \u2014 Prints values to stdout with system message filtering</li>' +
          '<li><strong>3-file pattern</strong> \u2014 One source file, one sink file, one main.yaml</li>' +
          '</ul>' +
          '<p>No <code>init_script</code>, no <code>scan_interval</code>, no <code>rbe</code> \u2014 DIME applies sensible defaults for all omitted properties. This example shows how little YAML you need for a working multi-file config.</p>',
        related: [
          { page: '21', label: '21 \u2014 Multi-File Configs' },
          { page: 'EX01', label: 'EX01 \u2014 Basic Counter (single-file equivalent)' },
          { page: 'REF29', label: 'REF29 \u2014 Script' },
          { page: 'REF05', label: 'REF05 \u2014 Console' }
        ]
      }
    },
    {
      id: 'ex25-dataflow',
      startLine: 13, startCol: 2, endLine: 29, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Script Source \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>A straightforward source-to-sink flow:</p>' +
          '<ol>' +
          '<li><strong>number1</strong> \u2014 <code>math.random(100)</code> returns a random integer from 1 to 100</li>' +
          '<li><strong>number2</strong> \u2014 <code>math.random(200)</code> returns a random integer from 1 to 200</li>' +
          '<li><strong>Ring buffer</strong> \u2014 Both values are published as <code>MessageBoxMessage</code> objects</li>' +
          '<li><strong>Console sink</strong> \u2014 Prints each message, filtering out <code>script/$SYSTEM</code> health data</li>' +
          '</ol>' +
          '<p>With default <code>rbe: true</code>, values only appear on the console when they change. Since <code>math.random()</code> produces different values most cycles, output is frequent but not guaranteed every scan.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '20', label: '20 \u2014 Report By Exception' }
        ]
      }
    },
    {
      id: 'ex25-config',
      startLine: 31, startCol: 2, endLine: 74, endCol: 85,
      label: 'Multi-File YAML Configuration',
      panel: {
        title: 'Minimal 3-File Configuration',
        body:
          '<p>Three YAML files make up this config:</p>' +
          '<ul>' +
          '<li><strong>script.yaml</strong> \u2014 Defines the Script source with anchor <code>&amp;script</code>. Just a name, connector type, and two items with one-liner scripts. No optional properties needed.</li>' +
          '<li><strong>console.yaml</strong> \u2014 Defines the Console sink with anchor <code>&amp;console</code>. Includes <code>exclude_filter</code> to suppress system messages.</li>' +
          '<li><strong>main.yaml</strong> \u2014 The <code>app</code> block plus <code>sources: [*script]</code> and <code>sinks: [*console]</code>. Loaded last to resolve all anchor references.</li>' +
          '</ul>' +
          '<p><strong>Key insight:</strong> Properties like <code>enabled</code>, <code>scan_interval</code>, and <code>rbe</code> are all optional. DIME defaults to <code>enabled: true</code>, <code>scan_interval: 1000</code>, and <code>rbe: true</code>. Minimal configs are valid configs.</p>',
        yaml:
          '# Minimal Script source:\n' +
          'script: &script\n' +
          '  name: script\n' +
          '  connector: Script\n' +
          '  items:\n' +
          '    - name: number1\n' +
          '      script: return math.random(100);',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics (anchors & aliases)' },
          { page: '21', label: '21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex25-keyconcepts',
      startLine: 76, startCol: 2, endLine: 102, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Config Defaults</strong> \u2014 When you omit properties like <code>scan_interval</code>, <code>enabled</code>, or <code>rbe</code>, DIME applies sensible defaults (1000ms, true, true). This keeps minimal configs clean. Only override defaults when you need non-standard behavior.</p>' +
          '<p><strong>System Message Filtering</strong> \u2014 Every connector publishes health data to <code>{name}/$SYSTEM</code> (e.g., <code>script/$SYSTEM</code>). This includes <code>IsConnected</code>, <code>IsFaulted</code>, and <code>FaultCount</code>. The Console sink\u2019s <code>exclude_filter: [script/$SYSTEM]</code> suppresses these so only data items appear.</p>' +
          '<p><strong>Modular YAML Pattern</strong> \u2014 Each connector in its own file with a YAML anchor. Main.yaml references them with aliases. To add a new sink, create a file with <code>mySink: &amp;mySink</code> and add <code>- *mySink</code> to the sinks array. No other files need editing.</p>' +
          '<p><strong>Lua Standard Library</strong> \u2014 The Script connector provides the full Lua standard library. <code>math.random(n)</code>, <code>math.floor()</code>, <code>string.format()</code>, <code>os.time()</code> \u2014 all available without imports. Use <code>require()</code> only for external Lua modules.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' },
          { page: '21', label: '21 \u2014 Multi-File Configs' }
        ]
      }
    }
  ]
};
