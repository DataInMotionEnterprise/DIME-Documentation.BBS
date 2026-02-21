/**
 * 30 — Troubleshooting & Common Pitfalls
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON30'] = {
  id: 'CON30',
  title: 'CON30 \u2014 Troubleshooting',
  file: 'content/CON30-troubleshooting.md',
  hotspots: [
    {
      id: 'no-data',
      startLine: 16, startCol: 3, endLine: 67, endCol: 87,
      label: 'No Data Flowing \u2014 5-Step Checklist',
      panel: {
        title: 'No Data Flowing \u2014 Systematic Diagnosis',
        body:
          '<p>Work through these five steps in order. Most issues are found in steps 1\u20132.</p>' +
          '<ol>' +
          '<li><strong>Is the connector enabled?</strong> \u2014 Check <code>enabled: !!bool true</code>. Without the <code>!!bool</code> tag, YAML treats "true" as a string and the connector stays disabled.</li>' +
          '<li><strong>Is the source connected?</strong> \u2014 <code>GET /status</code> and check <code>IsConnected</code>. If false: wrong IP, port, credentials, or the device is offline.</li>' +
          '<li><strong>Are item addresses correct?</strong> \u2014 Each protocol has its own address syntax. OPC-UA: <code>ns=2;s=PLC.Tag</code>, Modbus: <code>40001</code>, S7: <code>DB1.DBD0</code>. Check device documentation.</li>' +
          '<li><strong>Is RBE hiding unchanged values?</strong> \u2014 Set <code>rbe: !!bool false</code> temporarily. If data appears, the value simply is not changing. RBE is working correctly.</li>' +
          '<li><strong>Are sink filters too restrictive?</strong> \u2014 Check <code>include_filter</code> and <code>exclude_filter</code> regex. Add a Console sink with no filters to verify data is in the ring buffer.</li>' +
          '</ol>' +
          '<p><strong>Pro tip:</strong> A Console sink with no filters is the fastest way to confirm data is flowing through the ring buffer.</p>',
        related: [
          { page: 'CON30', hotspot: 'console-sink', label: 'Console sink for debugging' },
          { page: 'CON18', label: 'CON18 \u2014 Health & fault tracking' },
          { page: 'CON04', hotspot: 'item-anatomy', label: 'CON04 \u2014 Item configuration & type tags' }
        ]
      }
    },
    {
      id: 'faulting',
      startLine: 73, startCol: 3, endLine: 89, endCol: 87,
      label: 'Connector Keeps Faulting',
      panel: {
        title: 'Diagnosing Persistent Faults',
        body:
          '<p>DIME auto-retries on every fault. If a connector keeps faulting, the root cause is external.</p>' +
          '<p><strong>Diagnostic steps:</strong></p>' +
          '<ol>' +
          '<li>Check <code>FaultMessage</code> via <code>GET /status</code> \u2014 it contains the last exception message</li>' +
          '<li>Verify network connectivity \u2014 can you ping the device IP from the DIME host?</li>' +
          '<li>Check credentials \u2014 OPC-UA certificates, database passwords, MQTT auth</li>' +
          '<li>Monitor <code>FaultCount</code> \u2014 if it stabilizes, the device recovered on its own</li>' +
          '<li>Check device health \u2014 is the PLC in stop mode? Is the database accepting connections?</li>' +
          '</ol>' +
          '<p>DIME never gives up on a connector. It will keep retrying indefinitely until the device comes back.</p>',
        yaml:
          '# Check fault reason:\n' +
          '$ curl http://localhost:9999/status | jq \'.[]\n' +
          '  | select(.isFaulted==true)\'\n' +
          '\n' +
          '# Common causes:\n' +
          '#   - Wrong IP/port\n' +
          '#   - Authentication failed\n' +
          '#   - Device offline\n' +
          '#   - Network firewall',
        related: [
          { page: 'CON18', label: 'CON18 \u2014 Health & fault tracking' },
          { page: 'CON16', label: 'CON16 \u2014 Admin API' },
          { page: 'CON05', hotspot: 'lifecycle', label: 'CON05 \u2014 Connector lifecycle' }
        ]
      }
    },
    {
      id: 'script-errors',
      startLine: 95, startCol: 3, endLine: 118, endCol: 87,
      label: 'Lua Script Errors',
      panel: {
        title: 'Diagnosing Lua & Python Script Issues',
        body:
          '<p>Script errors can cause data to stop, transform incorrectly, or spike CPU.</p>' +
          '<p><strong>Common Lua mistakes:</strong></p>' +
          '<ul>' +
          '<li><strong>Nil access</strong> \u2014 <code>result</code> is nil when the device returns nothing. Always guard: <code>if result then ... end</code></li>' +
          '<li><strong>Type mismatch</strong> \u2014 <code>tonumber()</code> on a non-numeric string returns nil, which cascades</li>' +
          '<li><strong>Missing return</strong> \u2014 The script must return a value or use <code>emit()</code>. No return = no data published.</li>' +
          '<li><strong>Infinite loop</strong> \u2014 <code>while true</code> without break blocks the entire scan cycle for that source</li>' +
          '</ul>' +
          '<p><strong>Debugging strategy:</strong></p>' +
          '<ol>' +
          '<li>Add a Console sink with no filters to see raw data</li>' +
          '<li>Simplify script to <code>return result</code> to confirm data arrives</li>' +
          '<li>Re-add logic one line at a time</li>' +
          '<li>Use <code>emit(\'debug/info\', value)</code> for printf-style debugging</li>' +
          '</ol>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting guide' },
          { page: 'CON29', hotspot: 'bottlenecks', label: 'CON29 \u2014 LastScriptMs diagnostics' },
          { page: 'CON30', hotspot: 'console-sink', label: 'Console sink for debugging' }
        ]
      }
    },
    {
      id: 'yaml-mistakes',
      startLine: 126, startCol: 3, endLine: 162, endCol: 87,
      label: 'Common YAML Mistakes',
      panel: {
        title: 'YAML Gotchas That Trip Everyone Up',
        body:
          '<p>YAML looks simple but has several pitfalls that cause subtle, hard-to-diagnose issues in DIME.</p>' +
          '<ul>' +
          '<li><strong>Missing !!bool / !!int tags</strong> \u2014 <code>rbe: true</code> is a string. <code>rbe: !!bool true</code> is a boolean. DIME requires the typed value.</li>' +
          '<li><strong>Indentation errors</strong> \u2014 <code>items:</code> at the same level as <code>name:</code> makes them siblings, not parent-child. YAML uses indentation for hierarchy.</li>' +
          '<li><strong>Anchor/alias typos</strong> \u2014 <code>*my_default</code> vs <code>*my_defaults</code> \u2014 YAML silently fails or throws a cryptic error on mismatched names.</li>' +
          '<li><strong>Special characters</strong> \u2014 Strings containing colons, brackets, or semicolons should be quoted: <code>"ns=2;s=PLC:Tag"</code></li>' +
          '</ul>' +
          '<p><strong>Validation tip:</strong> Use <code>GET /config/yaml</code> to see what DIME actually loaded after merging all YAML files. Compare with your intent.</p>',
        yaml:
          '# WRONG - missing type tags:\n' +
          'rbe: true              # string, not bool!\n' +
          'scan_interval: 1000    # string, not int!\n' +
          '\n' +
          '# CORRECT:\n' +
          'rbe: !!bool true\n' +
          'scan_interval: !!int 1000',
        related: [
          { page: 'CON04', label: 'CON04 \u2014 YAML configuration basics' },
          { page: 'CON04', hotspot: 'item-anatomy', label: 'CON04 \u2014 Type tags explained' },
          { page: 'CON04', hotspot: 'file-loading', label: 'CON04 \u2014 File loading & merge order' }
        ]
      }
    },
    {
      id: 'console-sink',
      startLine: 170, startCol: 3, endLine: 208, endCol: 87,
      label: 'Console Sink \u2014 Best Debugging Friend',
      panel: {
        title: 'The Console Sink \u2014 See Everything',
        body:
          '<p>The <strong>Console sink</strong> prints every message to stdout. It is the single fastest way to verify data is flowing.</p>' +
          '<p><strong>Usage patterns:</strong></p>' +
          '<ul>' +
          '<li><strong>No filters</strong> \u2014 See every message in the ring buffer (data + $SYSTEM)</li>' +
          '<li><strong>include_filter</strong> \u2014 Isolate one source: <code>include_filter: plc1/.*</code></li>' +
          '<li><strong>Temporary</strong> \u2014 Add during development, remove before production</li>' +
          '</ul>' +
          '<p><strong>Three key diagnostics:</strong></p>' +
          '<ol>' +
          '<li><strong>Console sink</strong> \u2014 "Is data flowing through the ring buffer?"</li>' +
          '<li><strong>GET /status</strong> \u2014 "Are connectors healthy? What are the timing metrics?"</li>' +
          '<li><strong>GET /config/yaml</strong> \u2014 "What config did DIME actually load after merging files?"</li>' +
          '</ol>',
        yaml:
          'sinks:\n' +
          '  - name: debug\n' +
          '    connector: Console\n' +
          '    # No filters = see everything\n' +
          '    # Add during development,\n' +
          '    # remove for production',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink connectors reference' },
          { page: 'CON30', hotspot: 'no-data', label: 'No data flowing checklist' },
          { page: 'CON29', hotspot: 'bottlenecks', label: 'CON29 \u2014 Performance diagnostics' }
        ]
      }
    }
  ]
};
