/**
 * 21 — Multi-File Configs & YAML Anchors
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['21'] = {
  id: '21',
  title: '21 \u2014 Multi-File Configs',
  file: 'content/21-multi-file-configs.md',
  hotspots: [
    {
      id: 'single-vs-multi',
      startLine: 18, startCol: 3, endLine: 36, endCol: 87,
      label: 'Single File vs Multi-File',
      panel: {
        title: 'Single File vs Multi-File \u2014 When to Split',
        body:
          '<p><strong>Single file</strong> (main.yaml only) works well for simple setups with fewer than 5 connectors. Everything is in one place, easy to read top to bottom.</p>' +
          '<p><strong>Multi-file</strong> is recommended when:</p>' +
          '<ul>' +
          '<li>You have <strong>5+ connectors</strong> and the single file becomes unwieldy</li>' +
          '<li>Different <strong>team members</strong> manage different machines or protocols</li>' +
          '<li>You want to <strong>reuse configs</strong> across DIME instances (copy a file, not edit a monolith)</li>' +
          '<li>You use <strong>version control</strong> \u2014 smaller files mean cleaner diffs</li>' +
          '</ul>' +
          '<p>There is no functional difference. DIME merges all files into one config at startup. The split is purely organizational.</p>',
        related: [
          { page: '21', hotspot: 'load-order', label: '21 \u2014 How files merge' },
          { page: '04', hotspot: 'yaml-basics', label: '04 \u2014 YAML basics' },
          { page: '03', hotspot: 'config-dir', label: '03 \u2014 Config directory' }
        ]
      }
    },
    {
      id: 'load-order',
      startLine: 48, startCol: 3, endLine: 79, endCol: 87,
      label: 'Loading Order & Merge Behavior',
      panel: {
        title: 'File Loading Order \u2014 main.yaml Wins',
        body:
          '<p>DIME loads all <code>*.yaml</code> files from the Configs directory using these rules:</p>' +
          '<ol>' +
          '<li>All files <strong>except</strong> main.yaml are loaded in <strong>alphabetical order</strong></li>' +
          '<li><code>main.yaml</code> is always loaded <strong>last</strong></li>' +
          '<li>For arrays (<code>sources:</code>, <code>sinks:</code>): entries are <strong>concatenated</strong> across files</li>' +
          '<li>For scalar values (<code>app:</code> settings): <strong>last loaded wins</strong> \u2014 so main.yaml overrides</li>' +
          '</ol>' +
          '<p>This means you can define connectors in separate files and use main.yaml for app-level settings that override everything else.</p>' +
          '<p><strong>Tip:</strong> Prefix filenames with numbers (<code>01-mqtt.yaml</code>, <code>02-opcua.yaml</code>) to make the load order explicit and predictable.</p>',
        related: [
          { page: '21', hotspot: 'single-vs-multi', label: '21 \u2014 When to use multi-file' },
          { page: '21', hotspot: 'file-patterns', label: '21 \u2014 Organization patterns' }
        ]
      }
    },
    {
      id: 'anchors',
      startLine: 91, startCol: 3, endLine: 125, endCol: 86,
      label: 'YAML Anchors & References',
      panel: {
        title: 'YAML Anchors \u2014 Define Once, Reuse Everywhere',
        body:
          '<p>YAML anchors eliminate copy-paste configuration. Define shared settings once with <code>&name</code>, then reference with <code>*name</code>.</p>' +
          '<p><strong>Syntax:</strong></p>' +
          '<ul>' +
          '<li><code>&name</code> \u2014 <strong>Anchor</strong>: defines a named block of YAML</li>' +
          '<li><code>*name</code> \u2014 <strong>Reference</strong>: inserts the anchored value</li>' +
          '<li><code>&lt;&lt;: *name</code> \u2014 <strong>Merge key</strong>: merges the anchored mapping into the current mapping</li>' +
          '</ul>' +
          '<p>The merge key (<code>&lt;&lt;</code>) is the most useful pattern. It injects all key-value pairs from the anchor, and you can override or add keys after it.</p>' +
          '<p>Anchors work within a single file. Across files, use the same pattern by placing anchors in a dedicated <code>anchors.yaml</code> file that loads before the files referencing them.</p>',
        yaml:
          '# Define shared settings\n' +
          'mqtt_settings: &mqtt_common\n' +
          '  address: mqtt.factory.local\n' +
          '  port: !!int 1883\n' +
          '  username: dime\n' +
          '  password: secret\n' +
          '\n' +
          'sources:\n' +
          '  - name: line1_mqtt\n' +
          '    connector: MQTT\n' +
          '    <<: *mqtt_common          # reuse settings\n' +
          '    base_topic: line1/sensors\n' +
          '\n' +
          '  - name: line2_mqtt\n' +
          '    connector: MQTT\n' +
          '    <<: *mqtt_common          # same settings\n' +
          '    base_topic: line2/sensors',
        related: [
          { page: '04', hotspot: 'yaml-basics', label: '04 \u2014 YAML syntax' },
          { page: '21', hotspot: 'load-order', label: '21 \u2014 File loading order' }
        ]
      }
    },
    {
      id: 'file-patterns',
      startLine: 137, startCol: 3, endLine: 151, endCol: 88,
      label: 'File Organization Patterns',
      panel: {
        title: 'Three File Organization Patterns',
        body:
          '<p>Choose the pattern that matches how your team thinks about the plant:</p>' +
          '<ul>' +
          '<li><strong>By Protocol</strong> \u2014 <code>mqtt.yaml</code>, <code>opcua.yaml</code>, <code>influx.yaml</code>. Best when protocols have shared settings (anchors for broker address, etc.). One person owns each protocol.</li>' +
          '<li><strong>By Machine</strong> \u2014 <code>lathe-01.yaml</code>, <code>mill-02.yaml</code>. Best when machines are independently managed. Adding a new machine = adding one file. No existing files touched.</li>' +
          '<li><strong>By Role</strong> \u2014 <code>sources.yaml</code>, <code>sinks.yaml</code>. Clean separation of reads vs writes. Useful when different teams manage data collection vs data delivery.</li>' +
          '</ul>' +
          '<p>All three patterns are functionally identical. DIME merges everything regardless of file names. Pick whatever makes your team fastest.</p>',
        related: [
          { page: '21', hotspot: 'single-vs-multi', label: '21 \u2014 When to split files' },
          { page: '21', hotspot: 'load-order', label: '21 \u2014 How files merge' }
        ]
      }
    },
    {
      id: 'enabled-flag',
      startLine: 166, startCol: 3, endLine: 200, endCol: 86,
      label: 'The enabled Flag',
      panel: {
        title: 'enabled: !!bool false \u2014 Disable Without Deleting',
        body:
          '<p>Set <code>enabled: !!bool false</code> on any source or sink to disable it at startup. The config is preserved but the connector is not created.</p>' +
          '<p><strong>Use cases:</strong></p>' +
          '<ul>' +
          '<li><strong>Decommissioned equipment</strong> \u2014 Keep the config for reference, disable the connector</li>' +
          '<li><strong>Test connectors</strong> \u2014 Disable in production, enable in test environments</li>' +
          '<li><strong>Troubleshooting</strong> \u2014 Isolate a problem by disabling connectors one at a time</li>' +
          '<li><strong>Staged rollouts</strong> \u2014 Add config for new machines, enable when ready</li>' +
          '</ul>' +
          '<p>Disabled connectors consume <strong>zero resources</strong> \u2014 no threads, no timers, no connections. Re-enable by setting <code>true</code> and restarting DIME.</p>',
        yaml:
          'sources:\n' +
          '  - name: old_plc\n' +
          '    connector: S7\n' +
          '    enabled: !!bool false  # disabled, not deleted',
        related: [
          { page: '21', hotspot: 'file-patterns', label: '21 \u2014 File organization' },
          { page: '03', hotspot: 'config-dir', label: '03 \u2014 Configuration directory' }
        ]
      }
    }
  ]
};
